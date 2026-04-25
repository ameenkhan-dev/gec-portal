/**
 * Complete Registration System Setup
 * Creates controllers, routes, and updates server configuration
 */

const fs = require('fs');
const path = require('path');

function ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`✅ Created directory: ${dirPath}`);
    }
}

function createFile(filePath, content) {
    const dir = path.dirname(filePath);
    ensureDir(dir);
    
    if (fs.existsSync(filePath)) {
        console.log(`⚠️  File already exists (skipping): ${filePath}`);
        return false;
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Created file: ${filePath}`);
    return true;
}

const baseDir = __dirname;

// ===========================
// REGISTRATION CONTROLLER
// ===========================
const registrationController = `/**
 * Registration Controller
 * Handles event registration, attendance marking, and management
 */

const { query, getConnection, beginTransaction, commitTransaction, rollbackTransaction, releaseConnection, DB_TYPE } = require('../config/database');

/**
 * Register a student for an event
 * Validates: duplicate registration, max capacity, deadline
 */
const registerForEvent = async (req, res) => {
    try {
        const { eventId } = req.body;
        const userId = req.user.user_id;

        if (!eventId) {
            return res.status(400).json({
                success: false,
                message: 'Event ID is required'
            });
        }

        const events = await query(
            \`SELECT e.event_id, e.title, e.max_participants, e.registration_deadline, e.event_date, e.status
             FROM events e 
             WHERE e.event_id = ?\`,
            [eventId]
        );

        if (events.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        const event = events[0];

        if (event.status !== 'approved') {
            return res.status(400).json({
                success: false,
                message: 'Event is not approved for registration'
            });
        }

        const now = new Date();
        const deadline = new Date(event.registration_deadline);
        if (now > deadline) {
            return res.status(400).json({
                success: false,
                message: 'Registration deadline has passed',
                deadline: event.registration_deadline
            });
        }

        const existingReg = await query(
            'SELECT reg_id FROM registrations WHERE event_id = ? AND user_id = ?',
            [eventId, userId]
        );

        if (existingReg.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'You have already registered for this event'
            });
        }

        if (event.max_participants) {
            const registrationCounts = await query(
                'SELECT COUNT(*) as count FROM registrations WHERE event_id = ?',
                [eventId]
            );

            const currentRegistrations = registrationCounts[0].count;
            if (currentRegistrations >= event.max_participants) {
                return res.status(400).json({
                    success: false,
                    message: 'Event is at maximum capacity',
                    maxCapacity: event.max_participants,
                    currentRegistrations: currentRegistrations
                });
            }
        }

        const result = await query(
            'INSERT INTO registrations (event_id, user_id) VALUES (?, ?)',
            [eventId, userId]
        );

        return res.status(201).json({
            success: true,
            message: 'Successfully registered for the event',
            registration: {
                regId: result.insertId || result.rows?.[0]?.reg_id,
                eventId: eventId,
                userId: userId,
                eventTitle: event.title,
                registeredAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Error in registerForEvent:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get user's registrations (student view)
 */
const getMyRegistrations = async (req, res) => {
    try {
        const userId = req.user.user_id;

        const registrations = await query(
            \`SELECT 
                r.reg_id,
                r.event_id,
                r.timestamp as registered_at,
                r.attendance_status,
                e.title as event_title,
                e.event_date,
                e.event_time,
                e.venue,
                e.description,
                c.club_name,
                c.club_id
             FROM registrations r
             JOIN events e ON r.event_id = e.event_id
             JOIN clubs c ON e.club_id = c.club_id
             WHERE r.user_id = ?
             ORDER BY e.event_date DESC\`,
            [userId]
        );

        const now = new Date();
        const upcoming = [];
        const past = [];

        for (const reg of registrations) {
            const eventDate = new Date(\`\${reg.event_date}T\${reg.event_time}\`);
            if (eventDate > now) {
                upcoming.push({ ...reg, status: 'upcoming' });
            } else {
                past.push({ ...reg, status: 'past' });
            }
        }

        return res.status(200).json({
            success: true,
            registrations: { upcoming, past },
            totalRegistrations: registrations.length
        });
    } catch (error) {
        console.error('Error in getMyRegistrations:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get event registrations (club admin view)
 */
const getEventRegistrations = async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user.user_id;

        const eventCheck = await query(
            \`SELECT e.event_id, e.club_id, e.title, e.event_date, e.event_time, e.max_participants
             FROM events e
             JOIN club_admins ca ON e.club_id = ca.club_id
             WHERE e.event_id = ? AND ca.user_id = ?\`,
            [eventId, userId]
        );

        if (eventCheck.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to view registrations for this event'
            });
        }

        const event = eventCheck[0];

        const registrations = await query(
            \`SELECT 
                r.reg_id,
                r.user_id,
                r.timestamp as registered_at,
                r.attendance_status,
                u.name,
                u.email
             FROM registrations r
             JOIN users u ON r.user_id = u.user_id
             WHERE r.event_id = ?
             ORDER BY u.name ASC\`,
            [eventId]
        );

        const stats = await query(
            \`SELECT 
                COUNT(*) as total,
                SUM(CASE WHEN attendance_status = 'present' THEN 1 ELSE 0 END) as present,
                SUM(CASE WHEN attendance_status = 'absent' THEN 1 ELSE 0 END) as absent,
                SUM(CASE WHEN attendance_status IS NULL THEN 1 ELSE 0 END) as not_marked
             FROM registrations
             WHERE event_id = ?\`,
            [eventId]
        );

        return res.status(200).json({
            success: true,
            event: {
                eventId: event.event_id,
                title: event.title,
                eventDate: event.event_date,
                eventTime: event.event_time,
                maxParticipants: event.max_participants
            },
            registrations,
            statistics: stats[0],
            totalRegistrations: registrations.length
        });
    } catch (error) {
        console.error('Error in getEventRegistrations:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Mark attendance for single student
 */
const markAttendance = async (req, res) => {
    try {
        const { regId } = req.params;
        const { attendanceStatus } = req.body;
        const userId = req.user.user_id;

        if (!attendanceStatus || !['present', 'absent'].includes(attendanceStatus)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid attendance status. Must be "present" or "absent"'
            });
        }

        const registrations = await query(
            \`SELECT r.reg_id, r.event_id, r.user_id, e.event_date, e.club_id
             FROM registrations r
             JOIN events e ON r.event_id = e.event_id
             WHERE r.reg_id = ?\`,
            [regId]
        );

        if (registrations.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Registration not found'
            });
        }

        const registration = registrations[0];

        const adminCheck = await query(
            'SELECT club_id FROM club_admins WHERE club_id = ? AND user_id = ?',
            [registration.club_id, userId]
        );

        if (adminCheck.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to mark attendance'
            });
        }

        const eventDate = new Date(registration.event_date);
        const now = new Date();
        if (now < eventDate) {
            return res.status(400).json({
                success: false,
                message: 'Cannot mark attendance before event date'
            });
        }

        await query(
            'UPDATE registrations SET attendance_status = ? WHERE reg_id = ?',
            [attendanceStatus, regId]
        );

        return res.status(200).json({
            success: true,
            message: \`Attendance marked as \${attendanceStatus}\`,
            attendance: {
                regId,
                userId: registration.user_id,
                attendanceStatus
            }
        });
    } catch (error) {
        console.error('Error in markAttendance:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Bulk mark attendance
 */
const bulkMarkAttendance = async (req, res) => {
    try {
        const { eventId, attendanceRecords } = req.body;
        const userId = req.user.user_id;

        if (!eventId || !attendanceRecords || !Array.isArray(attendanceRecords)) {
            return res.status(400).json({
                success: false,
                message: 'eventId and attendanceRecords array are required'
            });
        }

        const eventCheck = await query(
            \`SELECT e.event_id, e.club_id, e.event_date
             FROM events e
             JOIN club_admins ca ON e.club_id = ca.club_id
             WHERE e.event_id = ? AND ca.user_id = ?\`,
            [eventId, userId]
        );

        if (eventCheck.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'You do not have permission to mark attendance'
            });
        }

        const event = eventCheck[0];
        const eventDate = new Date(event.event_date);
        const now = new Date();
        if (now < eventDate) {
            return res.status(400).json({
                success: false,
                message: 'Cannot mark attendance before event date'
            });
        }

        const connection = await getConnection();
        try {
            await beginTransaction(connection);

            let successCount = 0;
            const errors = [];

            for (const record of attendanceRecords) {
                const { regId, attendanceStatus } = record;

                if (!attendanceStatus || !['present', 'absent'].includes(attendanceStatus)) {
                    errors.push({ regId, error: 'Invalid attendance status' });
                    continue;
                }

                const regCheck = await query(
                    'SELECT reg_id FROM registrations WHERE reg_id = ? AND event_id = ?',
                    [regId, eventId]
                );

                if (regCheck.length === 0) {
                    errors.push({ regId, error: 'Registration not found' });
                    continue;
                }

                if (DB_TYPE === 'postgres') {
                    await connection.query(
                        'UPDATE registrations SET attendance_status = $1 WHERE reg_id = $2',
                        [attendanceStatus, regId]
                    );
                } else {
                    await connection.execute(
                        'UPDATE registrations SET attendance_status = ? WHERE reg_id = ?',
                        [attendanceStatus, regId]
                    );
                }

                successCount++;
            }

            await commitTransaction(connection);
            releaseConnection(connection);

            return res.status(200).json({
                success: true,
                message: \`Bulk attendance updated: \${successCount} records processed\`,
                processed: successCount,
                errors: errors.length > 0 ? errors : undefined,
                totalRecords: attendanceRecords.length
            });
        } catch (error) {
            await rollbackTransaction(connection);
            releaseConnection(connection);
            throw error;
        }
    } catch (error) {
        console.error('Error in bulkMarkAttendance:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Cancel registration (student only, before deadline)
 */
const cancelRegistration = async (req, res) => {
    try {
        const { regId } = req.params;
        const userId = req.user.user_id;

        const registrations = await query(
            \`SELECT r.reg_id, r.event_id, r.user_id, e.registration_deadline
             FROM registrations r
             JOIN events e ON r.event_id = e.event_id
             WHERE r.reg_id = ?\`,
            [regId]
        );

        if (registrations.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Registration not found'
            });
        }

        const registration = registrations[0];

        if (registration.user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only cancel your own registrations'
            });
        }

        const now = new Date();
        const deadline = new Date(registration.registration_deadline);
        if (now > deadline) {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel after deadline',
                deadline: registration.registration_deadline
            });
        }

        await query('DELETE FROM registrations WHERE reg_id = ?', [regId]);

        return res.status(200).json({
            success: true,
            message: 'Registration cancelled successfully',
            registration: {
                regId,
                eventId: registration.event_id
            }
        });
    } catch (error) {
        console.error('Error in cancelRegistration:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    registerForEvent,
    getMyRegistrations,
    getEventRegistrations,
    markAttendance,
    bulkMarkAttendance,
    cancelRegistration
};
`;

// ===========================
// REGISTRATION ROUTES
// ===========================
const registrationRoutes = `/**
 * Registration Routes
 * Handles event registration and attendance operations
 */

const express = require('express');
const router = express.Router();
const { verifyToken, authorize } = require('../auth.middleware');
const registrationController = require('../controllers/registrationController');

/**
 * Register for event (Student)
 */
router.post('/register', verifyToken, authorize('student'), registrationController.registerForEvent);

/**
 * Get my registrations (Student)
 */
router.get('/my-registrations', verifyToken, authorize('student'), registrationController.getMyRegistrations);

/**
 * Get event registrations (Club Admin)
 */
router.get('/event/:eventId', verifyToken, authorize('club_admin'), registrationController.getEventRegistrations);

/**
 * Mark individual attendance (Club Admin)
 */
router.put('/:regId/attendance', verifyToken, authorize('club_admin'), registrationController.markAttendance);

/**
 * Bulk mark attendance (Club Admin)
 */
router.post('/bulk-attendance', verifyToken, authorize('club_admin'), registrationController.bulkMarkAttendance);

/**
 * Cancel registration (Student)
 */
router.delete('/:regId', verifyToken, authorize('student'), registrationController.cancelRegistration);

module.exports = router;
`;

console.log('\n📁 Creating registration system files...\n');

// Create controller
createFile(
    path.join(baseDir, 'backend', 'controllers', 'registrationController.js'),
    registrationController
);

// Create routes
createFile(
    path.join(baseDir, 'backend', 'routes', 'registrations.js'),
    registrationRoutes
);

// Update server.js to include registration routes
console.log('\n📝 Updating server.js...\n');
const serverPath = path.join(baseDir, 'backend', 'server.js');
let serverContent = fs.readFileSync(serverPath, 'utf8');

if (!serverContent.includes('/api/registrations')) {
    // Find the events route line and add registrations after it
    const eventsRouteLine = "app.use('/api/events', require('./routes/events'));";
    const registrationRouteLine = "app.use('/api/registrations', require('./routes/registrations'));";
    
    if (serverContent.includes(eventsRouteLine)) {
        serverContent = serverContent.replace(
            eventsRouteLine,
            eventsRouteLine + "\napp.use('/api/registrations', require('./routes/registrations'));"
        );
        fs.writeFileSync(serverPath, serverContent, 'utf8');
        console.log('✅ Updated server.js with registration routes');
    }
}

console.log('\n✅ Registration system setup completed!\n');
console.log('📋 Files created:');
console.log('   • backend/controllers/registrationController.js');
console.log('   • backend/routes/registrations.js');
console.log('\n📝 Updated files:');
console.log('   • backend/server.js (added registration routes)\n');
console.log('Next steps:');
console.log('1. Ensure database migrations have run (events & registrations tables)');
console.log('2. Test API endpoints using Postman or similar');
console.log('3. Create frontend pages (MyRegistrations, EventRegistrations)');
