#!/usr/bin/env python3
"""
Complete Registration System Builder
Generates all backend controllers, routes, and frontend pages
"""

import os

def ensure_dir(path):
    os.makedirs(path, exist_ok=True)

def write_file(path, content):
    ensure_dir(os.path.dirname(path))
    if not os.path.exists(path):
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

base = os.path.dirname(os.path.abspath(__file__))

# ============================================
# BACKEND - Registration Controller
# ============================================
controller_code = '''/**
 * Registration Controller
 */
const { query, getConnection, beginTransaction, commitTransaction, rollbackTransaction, releaseConnection, DB_TYPE } = require('../config/database');

const registerForEvent = async (req, res) => {
    try {
        const { eventId } = req.body;
        const userId = req.user.user_id;
        if (!eventId) return res.status(400).json({ success: false, message: 'Event ID required' });

        const events = await query(`SELECT e.event_id, e.title, e.max_participants, e.registration_deadline, e.event_date, e.status FROM events e WHERE e.event_id = ?`, [eventId]);
        if (events.length === 0) return res.status(404).json({ success: false, message: 'Event not found' });

        const event = events[0];
        if (event.status !== 'approved') return res.status(400).json({ success: false, message: 'Event not approved' });

        const now = new Date();
        if (now > new Date(event.registration_deadline)) return res.status(400).json({ success: false, message: 'Deadline passed' });

        const exist = await query('SELECT reg_id FROM registrations WHERE event_id = ? AND user_id = ?', [eventId, userId]);
        if (exist.length > 0) return res.status(400).json({ success: false, message: 'Already registered' });

        if (event.max_participants) {
            const counts = await query('SELECT COUNT(*) as count FROM registrations WHERE event_id = ?', [eventId]);
            if (counts[0].count >= event.max_participants) return res.status(400).json({ success: false, message: 'Full capacity' });
        }

        const result = await query('INSERT INTO registrations (event_id, user_id) VALUES (?, ?)', [eventId, userId]);
        res.status(201).json({ success: true, message: 'Registered', registration: { regId: result.insertId } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getMyRegistrations = async (req, res) => {
    try {
        const userId = req.user.user_id;
        const regs = await query(
            `SELECT r.reg_id, r.event_id, r.timestamp as registered_at, r.attendance_status, e.title, e.event_date, e.event_time, e.venue, e.description, c.club_name
             FROM registrations r JOIN events e ON r.event_id = e.event_id JOIN clubs c ON e.club_id = c.club_id WHERE r.user_id = ? ORDER BY e.event_date DESC`,
            [userId]
        );

        const now = new Date();
        const upcoming = [], past = [];
        for (const reg of regs) {
            const eventDate = new Date(`${reg.event_date}T${reg.event_time}`);
            if (eventDate > now) upcoming.push(reg);
            else past.push(reg);
        }

        res.status(200).json({ success: true, registrations: { upcoming, past }, totalRegistrations: regs.length });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const getEventRegistrations = async (req, res) => {
    try {
        const { eventId } = req.params;
        const userId = req.user.user_id;

        const eventCheck = await query(
            `SELECT e.event_id, e.club_id, e.title, e.event_date, e.event_time FROM events e
             JOIN club_admins ca ON e.club_id = ca.club_id WHERE e.event_id = ? AND ca.user_id = ?`,
            [eventId, userId]
        );
        if (eventCheck.length === 0) return res.status(403).json({ success: false, message: 'No access' });

        const regs = await query(
            `SELECT r.reg_id, r.user_id, r.timestamp as registered_at, r.attendance_status, u.name, u.email
             FROM registrations r JOIN users u ON r.user_id = u.user_id WHERE r.event_id = ? ORDER BY u.name`,
            [eventId]
        );

        const stats = await query(
            `SELECT COUNT(*) as total, SUM(CASE WHEN attendance_status='present' THEN 1 ELSE 0 END) as present,
                    SUM(CASE WHEN attendance_status='absent' THEN 1 ELSE 0 END) as absent,
                    SUM(CASE WHEN attendance_status IS NULL THEN 1 ELSE 0 END) as not_marked FROM registrations WHERE event_id = ?`,
            [eventId]
        );

        res.status(200).json({ success: true, event: eventCheck[0], registrations: regs, statistics: stats[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const markAttendance = async (req, res) => {
    try {
        const { regId } = req.params;
        const { attendanceStatus } = req.body;
        const userId = req.user.user_id;

        if (!['present', 'absent'].includes(attendanceStatus)) return res.status(400).json({ success: false, message: 'Invalid status' });

        const regs = await query(
            `SELECT r.reg_id, r.user_id, e.event_date, e.club_id FROM registrations r JOIN events e ON r.event_id = e.event_id WHERE r.reg_id = ?`,
            [regId]
        );
        if (regs.length === 0) return res.status(404).json({ success: false, message: 'Not found' });

        const admin = await query('SELECT club_id FROM club_admins WHERE club_id = ? AND user_id = ?', [regs[0].club_id, userId]);
        if (admin.length === 0) return res.status(403).json({ success: false, message: 'No access' });

        await query('UPDATE registrations SET attendance_status = ? WHERE reg_id = ?', [attendanceStatus, regId]);
        res.status(200).json({ success: true, message: 'Updated' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const bulkMarkAttendance = async (req, res) => {
    try {
        const { eventId, attendanceRecords } = req.body;
        const userId = req.user.user_id;

        if (!eventId || !Array.isArray(attendanceRecords)) return res.status(400).json({ success: false, message: 'Invalid input' });

        const eventCheck = await query(
            `SELECT e.event_id, e.club_id FROM events e JOIN club_admins ca ON e.club_id = ca.club_id WHERE e.event_id = ? AND ca.user_id = ?`,
            [eventId, userId]
        );
        if (eventCheck.length === 0) return res.status(403).json({ success: false, message: 'No access' });

        const conn = await getConnection();
        try {
            await beginTransaction(conn);
            let count = 0;
            for (const rec of attendanceRecords) {
                if (!['present', 'absent'].includes(rec.attendanceStatus)) continue;
                if (DB_TYPE === 'postgres') {
                    await conn.query('UPDATE registrations SET attendance_status = $1 WHERE reg_id = $2', [rec.attendanceStatus, rec.regId]);
                } else {
                    await conn.execute('UPDATE registrations SET attendance_status = ? WHERE reg_id = ?', [rec.attendanceStatus, rec.regId]);
                }
                count++;
            }
            await commitTransaction(conn);
            releaseConnection(conn);
            res.status(200).json({ success: true, processed: count });
        } catch (e) {
            await rollbackTransaction(conn);
            releaseConnection(conn);
            throw e;
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

const cancelRegistration = async (req, res) => {
    try {
        const { regId } = req.params;
        const userId = req.user.user_id;

        const regs = await query(
            `SELECT r.reg_id, r.event_id, r.user_id, e.registration_deadline FROM registrations r JOIN events e ON r.event_id = e.event_id WHERE r.reg_id = ?`,
            [regId]
        );
        if (regs.length === 0) return res.status(404).json({ success: false, message: 'Not found' });
        if (regs[0].user_id !== userId) return res.status(403).json({ success: false, message: 'No access' });
        if (new Date() > new Date(regs[0].registration_deadline)) return res.status(400).json({ success: false, message: 'Deadline passed' });

        await query('DELETE FROM registrations WHERE reg_id = ?', [regId]);
        res.status(200).json({ success: true, message: 'Cancelled' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { registerForEvent, getMyRegistrations, getEventRegistrations, markAttendance, bulkMarkAttendance, cancelRegistration };
'''

# ============================================
# BACKEND - Registration Routes
# ============================================
routes_code = '''/**
 * Registration Routes
 */
const express = require('express');
const router = express.Router();
const { verifyToken, authorize } = require('../auth.middleware');
const controller = require('../controllers/registrationController');

router.post('/register', verifyToken, authorize('student'), controller.registerForEvent);
router.get('/my-registrations', verifyToken, authorize('student'), controller.getMyRegistrations);
router.delete('/:regId', verifyToken, authorize('student'), controller.cancelRegistration);
router.get('/event/:eventId', verifyToken, authorize('club_admin'), controller.getEventRegistrations);
router.put('/:regId/attendance', verifyToken, authorize('club_admin'), controller.markAttendance);
router.post('/bulk-attendance', verifyToken, authorize('club_admin'), controller.bulkMarkAttendance);

module.exports = router;
'''

# ============================================
# FRONTEND - MyRegistrations Page
# ============================================
my_registrations_code = '''import React, { useState, useEffect } from 'react';
import { Container, Card, CardContent, CardActions, Button, Grid, Box, Typography, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Alert, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Tabs, Tab } from '@mui/material';
import { Delete as DeleteIcon, Download as DownloadIcon } from '@mui/icons-material';

const MyRegistrations = () => {
    const [registrations, setRegistrations] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [tab, setTab] = useState(0);
    const [confirmDialog, setConfirmDialog] = useState({ open: false, regId: null });

    useEffect(() => { fetchMyRegistrations(); }, []);

    const fetchMyRegistrations = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch('/api/registrations/my-registrations', { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Failed');
            const data = await response.json();
            setRegistrations(data.registrations);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelRegistration = async (regId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/registrations/${regId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Failed');
            setSuccess('Cancelled successfully');
            setConfirmDialog({ open: false, regId: null });
            fetchMyRegistrations();
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;

    const upcoming = registrations?.upcoming || [];
    const past = registrations?.past || [];

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" gutterBottom>My Registrations</Typography>
            {error && <Alert severity="error" onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert>}

            <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ mb: 3 }}>
                <Tab label={`Upcoming (${upcoming.length})`} />
                <Tab label={`Past (${past.length})`} />
            </Tabs>

            {tab === 0 && (
                <Grid container spacing={3}>
                    {upcoming.length === 0 ? (
                        <Grid item xs={12}><Alert severity="info">No upcoming registrations</Alert></Grid>
                    ) : (
                        upcoming.map(reg => (
                            <Grid item xs={12} md={6} key={reg.reg_id}>
                                <Card>
                                    <CardContent>
                                        <Typography variant="h6">{reg.title}</Typography>
                                        <Typography variant="body2" color="textSecondary">{reg.club_name}</Typography>
                                        <Box sx={{ mt: 1 }}>
                                            <Typography variant="body2">📅 {new Date(reg.event_date).toLocaleDateString()} {reg.event_time}</Typography>
                                            <Typography variant="body2">📍 {reg.venue}</Typography>
                                        </Box>
                                    </CardContent>
                                    <CardActions>
                                        <Button size="small" color="error" startIcon={<DeleteIcon />} onClick={() => setConfirmDialog({ open: true, regId: reg.reg_id })}>Cancel</Button>
                                    </CardActions>
                                </Card>
                            </Grid>
                        ))
                    )}
                </Grid>
            )}

            {tab === 1 && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableRow>
                                <TableCell>Event</TableCell>
                                <TableCell>Club</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Attendance</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {past.length === 0 ? (
                                <TableRow><TableCell colSpan={4} align="center" sx={{ py: 3 }}>No past registrations</TableCell></TableRow>
                            ) : (
                                past.map(reg => (
                                    <TableRow key={reg.reg_id}>
                                        <TableCell>{reg.title}</TableCell>
                                        <TableCell>{reg.club_name}</TableCell>
                                        <TableCell>{new Date(reg.event_date).toLocaleDateString()}</TableCell>
                                        <TableCell><Chip label={reg.attendance_status || 'Not Marked'} color={reg.attendance_status === 'present' ? 'success' : 'default'} size="small" /></TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog open={confirmDialog.open} onClose={() => setConfirmDialog({ open: false, regId: null })}>
                <DialogTitle>Cancel Registration?</DialogTitle>
                <DialogContent><Typography>Are you sure?</Typography></DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmDialog({ open: false, regId: null })}>No</Button>
                    <Button onClick={() => handleCancelRegistration(confirmDialog.regId)} color="error" variant="contained">Yes, Cancel</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default MyRegistrations;
'''

# ============================================
# FRONTEND - EventRegistrations Page
# ============================================
event_registrations_code = '''import React, { useState, useEffect } from 'react';
import { Container, Card, CardContent, Button, Box, Typography, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox, Alert } from '@mui/material';
import { Download as DownloadIcon } from '@mui/icons-material';

const EventRegistrations = ({ eventId }) => {
    const [eventData, setEventData] = useState(null);
    const [registrations, setRegistrations] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selected, setSelected] = useState(new Set());
    const [markingAs, setMarkingAs] = useState(null);

    useEffect(() => { fetchRegistrations(); }, [eventId]);

    const fetchRegistrations = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/registrations/event/${eventId}`, { headers: { 'Authorization': `Bearer ${token}` } });
            if (!response.ok) throw new Error('Failed');
            const data = await response.json();
            setEventData(data.event);
            setRegistrations(data.registrations);
            setStats(data.statistics);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAll = (e) => {
        const newSelected = e.target.checked ? new Set(registrations.map(r => r.reg_id)) : new Set();
        setSelected(newSelected);
    };

    const handleSelectOne = (regId) => {
        const newSelected = new Set(selected);
        if (newSelected.has(regId)) newSelected.delete(regId);
        else newSelected.add(regId);
        setSelected(newSelected);
    };

    const markBulkAttendance = async (status) => {
        try {
            const records = Array.from(selected).map(regId => ({ regId, attendanceStatus: status }));
            const token = localStorage.getItem('token');
            const response = await fetch('/api/registrations/bulk-attendance', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ eventId, attendanceRecords: records })
            });
            if (!response.ok) throw new Error('Failed');
            setSuccess(`Marked ${records.length} as ${status}`);
            setSelected(new Set());
            setMarkingAs(null);
            fetchRegistrations();
        } catch (err) {
            setError(err.message);
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h5" gutterBottom>{eventData?.title}</Typography>
            <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="body2">Registrations: {stats?.total} | Present: {stats?.present} | Absent: {stats?.absent} | Not Marked: {stats?.not_marked}</Typography>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            {selected.size > 0 && (
                <Box sx={{ mb: 2, p: 2, backgroundColor: '#e3f2fd', borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ mb: 1 }}>{selected.size} selected</Typography>
                    <Button size="small" onClick={() => markBulkAttendance('present')} variant="contained" color="success" sx={{ mr: 1 }}>Mark Present</Button>
                    <Button size="small" onClick={() => markBulkAttendance('absent')} variant="contained" color="error">Mark Absent</Button>
                </Box>
            )}

            <TableContainer component={Paper}>
                <Table>
                    <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableRow>
                            <TableCell><Checkbox checked={selected.size === registrations.length} onChange={handleSelectAll} /></TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Registered</TableCell>
                            <TableCell>Attendance</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {registrations.map(reg => (
                            <TableRow key={reg.reg_id}>
                                <TableCell><Checkbox checked={selected.has(reg.reg_id)} onChange={() => handleSelectOne(reg.reg_id)} /></TableCell>
                                <TableCell>{reg.name}</TableCell>
                                <TableCell>{reg.email}</TableCell>
                                <TableCell>{new Date(reg.registered_at).toLocaleDateString()}</TableCell>
                                <TableCell><Typography variant="body2" color={reg.attendance_status === 'present' ? 'green' : reg.attendance_status === 'absent' ? 'red' : 'textSecondary'}>{reg.attendance_status || 'Not Marked'}</Typography></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Box sx={{ mt: 3 }}>
                <Button startIcon={<DownloadIcon />}>Export to CSV</Button>
            </Box>
        </Container>
    );
};

export default EventRegistrations;
'''

print("\\n" + "="*70)
print("📝 Building Complete Registration & Attendance System")
print("="*70 + "\\n")

# Create backend files
if write_file(os.path.join(base, 'backend', 'controllers', 'registrationController.js'), controller_code):
    print("✅ Created backend/controllers/registrationController.js")
else:
    print("⚠️  backend/controllers/registrationController.js exists")

if write_file(os.path.join(base, 'backend', 'routes', 'registrations.js'), routes_code):
    print("✅ Created backend/routes/registrations.js")
else:
    print("⚠️  backend/routes/registrations.js exists")

# Create frontend files
if write_file(os.path.join(base, 'frontend', 'src', 'pages', 'student', 'MyRegistrations.jsx'), my_registrations_code):
    print("✅ Created frontend/src/pages/student/MyRegistrations.jsx")
else:
    print("⚠️  frontend/src/pages/student/MyRegistrations.jsx exists")

if write_file(os.path.join(base, 'frontend', 'src', 'pages', 'club', 'EventRegistrations.jsx'), event_registrations_code):
    print("✅ Created frontend/src/pages/club/EventRegistrations.jsx")
else:
    print("⚠️  frontend/src/pages/club/EventRegistrations.jsx exists")

# Update server.js
print("\\n📝 Updating backend/server.js...")
server_path = os.path.join(base, 'backend', 'server.js')
try:
    with open(server_path, 'r') as f:
        content = f.read()
    if "'/api/registrations'" not in content:
        old = "app.use('/api/events', require('./routes/events'));"
        new = old + "\\napp.use('/api/registrations', require('./routes/registrations'));"
        content = content.replace(old, new)
        with open(server_path, 'w') as f:
            f.write(content)
        print("✅ Updated server.js")
except Exception as e:
    print(f"⚠️  Error: {e}")

print("\\n" + "="*70)
print("✅ SYSTEM BUILD COMPLETE")
print("="*70)

print("\\n📦 Backend Files:")
print("   • backend/controllers/registrationController.js (6 functions)")
print("   • backend/routes/registrations.js (6 endpoints)")

print("\\n📱 Frontend Pages:")
print("   • frontend/src/pages/student/MyRegistrations.jsx")
print("   • frontend/src/pages/club/EventRegistrations.jsx")

print("\\n🔗 API Endpoints:")
print("   POST   /api/registrations/register                 [Student]")
print("   GET    /api/registrations/my-registrations        [Student]")
print("   DELETE /api/registrations/:regId                  [Student]")
print("   GET    /api/registrations/event/:eventId          [Club Admin]")
print("   PUT    /api/registrations/:regId/attendance       [Club Admin]")
print("   POST   /api/registrations/bulk-attendance         [Club Admin]")

print("\\n📋 Frontend Pages:")
print("   • MyRegistrations - View and manage registrations")
print("   • EventRegistrations - Manage event attendees")

print("\\n⏭️  Next Steps:")
print("   1. Test backend API endpoints")
print("   2. Integrate pages with main app routing")
print("   3. Update EventDetails.jsx to add register button")
print("   4. Update MyEvents.jsx to show registration button")
print()
'''

file_path = os.path.join(base, 'build_complete_registration.py')
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(setup_code)

print(f"\\n✅ Build script created: {file_path}")
print("Run: python3 build_complete_registration.py")
