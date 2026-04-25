/**
 * Complete Event Management System Creator
 * Creates all directories and files in one go
 */

const fs = require('fs');
const path = require('path');

const BASE_DIR = __dirname;

// Utility function to write file
function writeFile(filePath, content) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`   ✓ Created: ${path.relative(BASE_DIR, filePath)}`);
}

console.log('🚀 Creating Event Management System Files...\n');

// ==================== BACKEND FILES ====================

console.log('📦 Creating backend files...\n');

// 1. Event Controller
const eventControllerContent = `/**
 * Event Controller
 * Handles all event-related operations
 */

const { query, getConnection, beginTransaction, commitTransaction, rollbackTransaction, releaseConnection } = require('../db.config');
const path = require('path');
const fs = require('fs');

/**
 * Create new event (Club Admin / Super Admin)
 */
const createEvent = async (req, res) => {
    const connection = await getConnection();
    
    try {
        const {
            club_id,
            title,
            description,
            event_date,
            event_time,
            venue,
            max_participants,
            registration_deadline,
            category
        } = req.body;

        const userId = req.user.userId;
        const userRole = req.user.role;

        // Validation
        if (!club_id || !title || !event_date || !event_time || !venue || !registration_deadline) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Verify user is admin of this club (unless super_admin)
        if (userRole === 'club_admin') {
            const adminCheck = await query(
                connection,
                'SELECT * FROM club_admins WHERE club_id = ? AND user_id = ?',
                [club_id, userId]
            );

            if (adminCheck.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'You are not authorized to create events for this club'
                });
            }
        }

        // Validate registration deadline is before event date
        const eventDateTime = new Date(\`\${event_date}T\${event_time}\`);
        const deadline = new Date(registration_deadline);
        
        if (deadline >= eventDateTime) {
            return res.status(400).json({
                success: false,
                message: 'Registration deadline must be before event date'
            });
        }

        // Handle poster upload
        let posterPath = null;
        if (req.file) {
            posterPath = '/uploads/' + path.relative(path.join(__dirname, '..', 'uploads'), req.file.path).replace(/\\\\/g, '/');
        }

        await beginTransaction(connection);

        const result = await query(
            connection,
            \`INSERT INTO events (
                club_id, title, description, event_date, event_time, venue,
                max_participants, registration_deadline, poster_path, created_by, category, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')\`,
            [club_id, title, description, event_date, event_time, venue, max_participants || null, registration_deadline, posterPath, userId, category || null]
        );

        await commitTransaction(connection);

        res.status(201).json({
            success: true,
            message: 'Event created successfully and pending approval',
            eventId: result.insertId
        });

    } catch (error) {
        await rollbackTransaction(connection);
        console.error('Create event error:', error);
        
        // Clean up uploaded file if exists
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create event',
            error: error.message
        });
    } finally {
        await releaseConnection(connection);
    }
};

/**
 * Get all events (filtered based on user role)
 */
const getAllEvents = async (req, res) => {
    try {
        const userRole = req.user?.role;
        
        let sql = \`
            SELECT e.*, c.club_name, c.logo_path,
                   COUNT(DISTINCT r.reg_id) as registration_count,
                   u.name as created_by_name
            FROM events e
            LEFT JOIN clubs c ON e.club_id = c.club_id
            LEFT JOIN registrations r ON e.event_id = r.event_id
            LEFT JOIN users u ON e.created_by = u.user_id
        \`;

        // Students see only approved events
        if (!userRole || userRole === 'student') {
            sql += " WHERE e.status = 'approved'";
        }
        // Club admins and super admins see all

        sql += \`
            GROUP BY e.event_id
            ORDER BY e.event_date DESC, e.event_time DESC
        \`;

        const events = await query(null, sql);

        res.json({
            success: true,
            events
        });

    } catch (error) {
        console.error('Get all events error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch events',
            error: error.message
        });
    }
};

/**
 * Get event by ID
 */
const getEventById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.userId;
        const userRole = req.user?.role;

        const events = await query(
            null,
            \`SELECT e.*, c.club_name, c.description as club_description, c.logo_path,
                    COUNT(DISTINCT r.reg_id) as registration_count,
                    u.name as created_by_name,
                    \${userId ? \`EXISTS(SELECT 1 FROM registrations WHERE event_id = e.event_id AND user_id = ?) as is_registered\` : '0 as is_registered'}
             FROM events e
             LEFT JOIN clubs c ON e.club_id = c.club_id
             LEFT JOIN registrations r ON e.event_id = r.event_id
             LEFT JOIN users u ON e.created_by = u.user_id
             WHERE e.event_id = ?
             GROUP BY e.event_id\`,
            userId ? [userId, id] : [id]
        );

        if (events.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        const event = events[0];

        // Check visibility: students can only see approved events
        if ((!userRole || userRole === 'student') && event.status !== 'approved') {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.json({
            success: true,
            event
        });

    } catch (error) {
        console.error('Get event error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch event',
            error: error.message
        });
    }
};

/**
 * Update event (Club Admin - own events only)
 */
const updateEvent = async (req, res) => {
    const connection = await getConnection();
    
    try {
        const { id } = req.params;
        const {
            title,
            description,
            event_date,
            event_time,
            venue,
            max_participants,
            registration_deadline,
            category
        } = req.body;

        const userId = req.user.userId;
        const userRole = req.user.role;

        // Get existing event
        const existingEvents = await query(connection, 'SELECT * FROM events WHERE event_id = ?', [id]);
        
        if (existingEvents.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        const existingEvent = existingEvents[0];

        // Verify ownership (club_admin can only update their own events)
        if (userRole === 'club_admin') {
            const adminCheck = await query(
                connection,
                'SELECT * FROM club_admins WHERE club_id = ? AND user_id = ?',
                [existingEvent.club_id, userId]
            );

            if (adminCheck.length === 0 && existingEvent.created_by !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'You are not authorized to update this event'
                });
            }
        }

        // Validate dates if provided
        if (event_date && event_time && registration_deadline) {
            const eventDateTime = new Date(\`\${event_date}T\${event_time}\`);
            const deadline = new Date(registration_deadline);
            
            if (deadline >= eventDateTime) {
                return res.status(400).json({
                    success: false,
                    message: 'Registration deadline must be before event date'
                });
            }
        }

        // Handle poster upload
        let posterPath = existingEvent.poster_path;
        if (req.file) {
            // Delete old poster
            if (existingEvent.poster_path) {
                const oldPath = path.join(__dirname, '..', existingEvent.poster_path);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            posterPath = '/uploads/' + path.relative(path.join(__dirname, '..', 'uploads'), req.file.path).replace(/\\\\/g, '/');
        }

        await beginTransaction(connection);

        await query(
            connection,
            \`UPDATE events SET
                title = COALESCE(?, title),
                description = COALESCE(?, description),
                event_date = COALESCE(?, event_date),
                event_time = COALESCE(?, event_time),
                venue = COALESCE(?, venue),
                max_participants = ?,
                registration_deadline = COALESCE(?, registration_deadline),
                poster_path = ?,
                category = ?,
                status = 'pending',
                updated_at = CURRENT_TIMESTAMP
             WHERE event_id = ?\`,
            [title, description, event_date, event_time, venue, max_participants, registration_deadline, posterPath, category, id]
        );

        await commitTransaction(connection);

        res.json({
            success: true,
            message: 'Event updated successfully and sent for re-approval'
        });

    } catch (error) {
        await rollbackTransaction(connection);
        console.error('Update event error:', error);
        
        if (req.file) {
            fs.unlink(req.file.path, (err) => {
                if (err) console.error('Error deleting file:', err);
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to update event',
            error: error.message
        });
    } finally {
        await releaseConnection(connection);
    }
};

/**
 * Delete event
 */
const deleteEvent = async (req, res) => {
    const connection = await getConnection();
    
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.role;

        // Get event
        const events = await query(connection, 'SELECT * FROM events WHERE event_id = ?', [id]);
        
        if (events.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        const event = events[0];

        // Check permissions
        if (userRole === 'club_admin') {
            const adminCheck = await query(
                connection,
                'SELECT * FROM club_admins WHERE club_id = ? AND user_id = ?',
                [event.club_id, userId]
            );

            if (adminCheck.length === 0 && event.created_by !== userId) {
                return res.status(403).json({
                    success: false,
                    message: 'You are not authorized to delete this event'
                });
            }
        }

        await beginTransaction(connection);

        // Delete event (cascade will delete registrations)
        await query(connection, 'DELETE FROM events WHERE event_id = ?', [id]);

        // Delete poster file
        if (event.poster_path) {
            const posterPath = path.join(__dirname, '..', event.poster_path);
            if (fs.existsSync(posterPath)) {
                fs.unlinkSync(posterPath);
            }
        }

        await commitTransaction(connection);

        res.json({
            success: true,
            message: 'Event deleted successfully'
        });

    } catch (error) {
        await rollbackTransaction(connection);
        console.error('Delete event error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete event',
            error: error.message
        });
    } finally {
        await releaseConnection(connection);
    }
};

/**
 * Approve event (Super Admin only)
 */
const approveEvent = async (req, res) => {
    const connection = await getConnection();
    
    try {
        const { id } = req.params;

        const events = await query(connection, 'SELECT * FROM events WHERE event_id = ?', [id]);
        
        if (events.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        await beginTransaction(connection);

        await query(
            connection,
            "UPDATE events SET status = 'approved', rejection_reason = NULL, updated_at = CURRENT_TIMESTAMP WHERE event_id = ?",
            [id]
        );

        await commitTransaction(connection);

        res.json({
            success: true,
            message: 'Event approved successfully'
        });

    } catch (error) {
        await rollbackTransaction(connection);
        console.error('Approve event error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to approve event',
            error: error.message
        });
    } finally {
        await releaseConnection(connection);
    }
};

/**
 * Reject event (Super Admin only)
 */
const rejectEvent = async (req, res) => {
    const connection = await getConnection();
    
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const events = await query(connection, 'SELECT * FROM events WHERE event_id = ?', [id]);
        
        if (events.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        await beginTransaction(connection);

        await query(
            connection,
            "UPDATE events SET status = 'rejected', rejection_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE event_id = ?",
            [reason || 'No reason provided', id]
        );

        await commitTransaction(connection);

        res.json({
            success: true,
            message: 'Event rejected'
        });

    } catch (error) {
        await rollbackTransaction(connection);
        console.error('Reject event error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reject event',
            error: error.message
        });
    } finally {
        await releaseConnection(connection);
    }
};

/**
 * Get events created by current user (Club Admin)
 */
const getMyEvents = async (req, res) => {
    try {
        const userId = req.user.userId;

        const events = await query(
            null,
            \`SELECT e.*, c.club_name, c.logo_path,
                    COUNT(DISTINCT r.reg_id) as registration_count
             FROM events e
             LEFT JOIN clubs c ON e.club_id = c.club_id
             LEFT JOIN registrations r ON e.event_id = r.event_id
             WHERE e.created_by = ?
             GROUP BY e.event_id
             ORDER BY e.created_at DESC\`,
            [userId]
        );

        res.json({
            success: true,
            events
        });

    } catch (error) {
        console.error('Get my events error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch your events',
            error: error.message
        });
    }
};

/**
 * Get events by status (upcoming/ongoing/completed)
 */
const getEventsByStatus = async (req, res) => {
    try {
        const { status } = req.params;
        const userRole = req.user?.role;
        
        let dateCondition = '';
        const today = new Date().toISOString().split('T')[0];
        
        if (status === 'upcoming') {
            dateCondition = \`AND e.event_date >= '\${today}' AND e.status = 'approved'\`;
        } else if (status === 'completed') {
            dateCondition = \`AND e.event_date < '\${today}'\`;
        } else if (status === 'ongoing') {
            dateCondition = \`AND e.event_date = '\${today}' AND e.status = 'approved'\`;
        }

        let sql = \`
            SELECT e.*, c.club_name, c.logo_path,
                   COUNT(DISTINCT r.reg_id) as registration_count,
                   u.name as created_by_name
            FROM events e
            LEFT JOIN clubs c ON e.club_id = c.club_id
            LEFT JOIN registrations r ON e.event_id = r.event_id
            LEFT JOIN users u ON e.created_by = u.user_id
            WHERE 1=1 \${dateCondition}
        \`;

        // Students see only approved
        if (!userRole || userRole === 'student') {
            sql += " AND e.status = 'approved'";
        }

        sql += \`
            GROUP BY e.event_id
            ORDER BY e.event_date DESC, e.event_time DESC
        \`;

        const events = await query(null, sql);

        res.json({
            success: true,
            events
        });

    } catch (error) {
        console.error('Get events by status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch events',
            error: error.message
        });
    }
};

/**
 * Search events
 */
const searchEvents = async (req, res) => {
    try {
        const { keyword, club_id, category, start_date, end_date } = req.query;
        const userRole = req.user?.role;

        let conditions = [];
        let params = [];

        // Students see only approved
        if (!userRole || userRole === 'student') {
            conditions.push("e.status = 'approved'");
        }

        if (keyword) {
            conditions.push("(e.title LIKE ? OR e.description LIKE ?)");
            params.push(\`%\${keyword}%\`, \`%\${keyword}%\`);
        }

        if (club_id) {
            conditions.push("e.club_id = ?");
            params.push(club_id);
        }

        if (category) {
            conditions.push("e.category = ?");
            params.push(category);
        }

        if (start_date) {
            conditions.push("e.event_date >= ?");
            params.push(start_date);
        }

        if (end_date) {
            conditions.push("e.event_date <= ?");
            params.push(end_date);
        }

        const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

        const sql = \`
            SELECT e.*, c.club_name, c.logo_path,
                   COUNT(DISTINCT r.reg_id) as registration_count,
                   u.name as created_by_name
            FROM events e
            LEFT JOIN clubs c ON e.club_id = c.club_id
            LEFT JOIN registrations r ON e.event_id = r.event_id
            LEFT JOIN users u ON e.created_by = u.user_id
            \${whereClause}
            GROUP BY e.event_id
            ORDER BY e.event_date DESC, e.event_time DESC
        \`;

        const events = await query(null, sql, params);

        res.json({
            success: true,
            events
        });

    } catch (error) {
        console.error('Search events error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search events',
            error: error.message
        });
    }
};

/**
 * Register for event
 */
const registerForEvent = async (req, res) => {
    const connection = await getConnection();
    
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        // Get event
        const events = await query(connection, 'SELECT * FROM events WHERE event_id = ?', [id]);
        
        if (events.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        const event = events[0];

        // Check if event is approved
        if (event.status !== 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Cannot register for unapproved events'
            });
        }

        // Check registration deadline
        if (new Date() > new Date(event.registration_deadline)) {
            return res.status(400).json({
                success: false,
                message: 'Registration deadline has passed'
            });
        }

        // Check if already registered
        const existing = await query(
            connection,
            'SELECT * FROM registrations WHERE event_id = ? AND user_id = ?',
            [id, userId]
        );

        if (existing.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'You are already registered for this event'
            });
        }

        // Check if event is full
        if (event.max_participants) {
            const count = await query(
                connection,
                'SELECT COUNT(*) as count FROM registrations WHERE event_id = ?',
                [id]
            );

            if (count[0].count >= event.max_participants) {
                return res.status(400).json({
                    success: false,
                    message: 'Event is full'
                });
            }
        }

        await beginTransaction(connection);

        await query(
            connection,
            'INSERT INTO registrations (event_id, user_id) VALUES (?, ?)',
            [id, userId]
        );

        await commitTransaction(connection);

        res.json({
            success: true,
            message: 'Successfully registered for event'
        });

    } catch (error) {
        await rollbackTransaction(connection);
        console.error('Register for event error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to register for event',
            error: error.message
        });
    } finally {
        await releaseConnection(connection);
    }
};

/**
 * Unregister from event
 */
const unregisterFromEvent = async (req, res) => {
    const connection = await getConnection();
    
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        // Check if registered
        const existing = await query(
            connection,
            'SELECT * FROM registrations WHERE event_id = ? AND user_id = ?',
            [id, userId]
        );

        if (existing.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'You are not registered for this event'
            });
        }

        await beginTransaction(connection);

        await query(
            connection,
            'DELETE FROM registrations WHERE event_id = ? AND user_id = ?',
            [id, userId]
        );

        await commitTransaction(connection);

        res.json({
            success: true,
            message: 'Successfully unregistered from event'
        });

    } catch (error) {
        await rollbackTransaction(connection);
        console.error('Unregister from event error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to unregister from event',
            error: error.message
        });
    } finally {
        await releaseConnection(connection);
    }
};

/**
 * Get event registrations
 */
const getEventRegistrations = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const userRole = req.user.role;

        // Verify access (club admin must own the event, super admin can see all)
        if (userRole === 'club_admin') {
            const events = await query(
                null,
                \`SELECT e.* FROM events e
                 LEFT JOIN club_admins ca ON e.club_id = ca.club_id
                 WHERE e.event_id = ? AND (e.created_by = ? OR ca.user_id = ?)\`,
                [id, userId, userId]
            );

            if (events.length === 0) {
                return res.status(403).json({
                    success: false,
                    message: 'You are not authorized to view registrations for this event'
                });
            }
        }

        const registrations = await query(
            null,
            \`SELECT r.*, u.name, u.email, u.role
             FROM registrations r
             JOIN users u ON r.user_id = u.user_id
             WHERE r.event_id = ?
             ORDER BY r.timestamp DESC\`,
            [id]
        );

        res.json({
            success: true,
            registrations
        });

    } catch (error) {
        console.error('Get event registrations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch registrations',
            error: error.message
        });
    }
};

/**
 * Get pending events (Super Admin only)
 */
const getPendingEvents = async (req, res) => {
    try {
        const events = await query(
            null,
            \`SELECT e.*, c.club_name, c.logo_path,
                    COUNT(DISTINCT r.reg_id) as registration_count,
                    u.name as created_by_name, u.email as created_by_email
             FROM events e
             LEFT JOIN clubs c ON e.club_id = c.club_id
             LEFT JOIN registrations r ON e.event_id = r.event_id
             LEFT JOIN users u ON e.created_by = u.user_id
             WHERE e.status = 'pending'
             GROUP BY e.event_id
             ORDER BY e.created_at ASC\`
        );

        res.json({
            success: true,
            events
        });

    } catch (error) {
        console.error('Get pending events error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch pending events',
            error: error.message
        });
    }
};

/**
 * Get clubs (Helper for event creation)
 */
const getClubs = async (req, res) => {
    try {
        const userId = req.user?.userId;
        const userRole = req.user?.role;

        let sql = 'SELECT club_id, club_name, description, logo_path FROM clubs';
        let params = [];

        // Club admins see only their clubs
        if (userRole === 'club_admin') {
            sql += ' WHERE club_id IN (SELECT club_id FROM club_admins WHERE user_id = ?)';
            params.push(userId);
        }

        sql += ' ORDER BY club_name';

        const clubs = await query(null, sql, params);

        res.json({
            success: true,
            clubs
        });

    } catch (error) {
        console.error('Get clubs error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch clubs',
            error: error.message
        });
    }
};

module.exports = {
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent,
    approveEvent,
    rejectEvent,
    getMyEvents,
    getEventsByStatus,
    searchEvents,
    registerForEvent,
    unregisterFromEvent,
    getEventRegistrations,
    getPendingEvents,
    getClubs
};
`;

writeFile(
    path.join(BASE_DIR, 'backend', 'controllers', 'eventController.js'),
    eventControllerContent
);

// 2. Event Routes
const eventRoutesContent = `/**
 * Event Routes
 * API endpoints for event management
 */

const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const { verifyToken, optionalAuth, authorize } = require('../auth.middleware');
const upload = require('../upload.middleware');

// Public/Student routes
router.get('/', optionalAuth, eventController.getAllEvents);
router.get('/search', optionalAuth, eventController.searchEvents);
router.get('/status/:status', optionalAuth, eventController.getEventsByStatus);
router.get('/clubs', verifyToken, eventController.getClubs);
router.get('/:id', optionalAuth, eventController.getEventById);

// Student registration
router.post('/:id/register', verifyToken, authorize('student', 'club_admin', 'super_admin'), eventController.registerForEvent);
router.delete('/:id/register', verifyToken, authorize('student', 'club_admin', 'super_admin'), eventController.unregisterFromEvent);

// Club Admin routes
router.post('/', verifyToken, authorize('club_admin', 'super_admin'), upload.single('poster'), eventController.createEvent);
router.get('/my-events', verifyToken, authorize('club_admin', 'super_admin'), eventController.getMyEvents);
router.put('/:id', verifyToken, authorize('club_admin', 'super_admin'), upload.single('poster'), eventController.updateEvent);
router.delete('/:id', verifyToken, authorize('club_admin', 'super_admin'), eventController.deleteEvent);
router.get('/:id/registrations', verifyToken, authorize('club_admin', 'super_admin'), eventController.getEventRegistrations);

// Super Admin routes
router.get('/pending', verifyToken, authorize('super_admin'), eventController.getPendingEvents);
router.put('/:id/approve', verifyToken, authorize('super_admin'), eventController.approveEvent);
router.put('/:id/reject', verifyToken, authorize('super_admin'), eventController.rejectEvent);

module.exports = router;
`;

writeFile(
    path.join(BASE_DIR, 'backend', 'routes', 'events.js'),
    eventRoutesContent
);

console.log('\n✅ Backend files created successfully!\n');
console.log('📝 Manual steps needed:');
console.log('   1. Update backend/server.js - uncomment the events route line');
console.log('   2. Update backend/migrate.js - add category and rejection_reason fields to events table\n');

console.log('═══════════════════════════════════════════════════════════════');
console.log('Now run: node create-event-frontend-files.js');
console.log('To create the frontend React components');
console.log('═══════════════════════════════════════════════════════════════\n');
`;

writeFile(
    path.join(BASE_DIR, 'create-event-backend-files.js'),
    fs.readFileSync(__filename, 'utf8')
);

console.log('\n✅ Setup complete!');
console.log('\nThis script has been saved. To use it:');
console.log('   node create-event-backend-files.js\n');
