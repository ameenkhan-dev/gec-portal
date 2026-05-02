const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gec_event_portal',
  waitForConnections: true,
  connectionLimit: 10,
});

const getDashboardStats = async (req, res) => {
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

module.exports = { getDashboardStats };
