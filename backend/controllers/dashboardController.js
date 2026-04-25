const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gec_event_portal',
  waitForConnections: true,
  connectionLimit: 10,
});

const getAdminDashboard = async (req, res) => {
  try {
    const conn = await pool.getConnection();
    
    const [events] = await conn.execute('SELECT COUNT(*) as total FROM events');
    const [registrations] = await conn.execute('SELECT COUNT(*) as total FROM registrations');
    const [users] = await conn.execute('SELECT COUNT(*) as total FROM users');
    const [pending] = await conn.execute('SELECT COUNT(*) as total FROM events WHERE status = "pending"');
    
    conn.release();
    
    res.json({
      total_events: events[0].total,
      total_registrations: registrations[0].total,
      total_users: users[0].total,
      pending_approvals: pending[0].total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getStudentDashboard = async (req, res) => {
  try {
    const conn = await pool.getConnection();
    
    const [registrations] = await conn.execute(
      'SELECT e.* FROM events e JOIN registrations r ON e.event_id = r.event_id WHERE r.user_id = ?',
      [req.user.user_id]
    );
    
    conn.release();
    res.json({ registrations });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getClubDashboard = async (req, res) => {
  try {
    const conn = await pool.getConnection();
    
    const [events] = await conn.execute(
      'SELECT * FROM events WHERE club_id IN (SELECT club_id FROM club_members WHERE user_id = ?)',
      [req.user.user_id]
    );
    
    conn.release();
    res.json({ events });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAdminDashboard, getStudentDashboard, getClubDashboard };

