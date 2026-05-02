const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gec_event_portal',
  waitForConnections: true,
  connectionLimit: 10,
});

const getEvents = async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [events] = await conn.execute('SELECT * FROM events ORDER BY created_at DESC');
    conn.release();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [events] = await conn.execute('SELECT * FROM events WHERE event_id = ?', [req.params.id]);
    conn.release();
    
    if (events.length === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(events[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createEvent = async (req, res) => {
  try {
    const { title, description, date, location, club_id } = req.body;
    const conn = await pool.getConnection();
    
    await conn.execute(
      'INSERT INTO events (title, description, event_date, location, club_id, status) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, date, location, club_id, 'pending']
    );
    
    conn.release();
    res.json({ message: 'Event created successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getEvents, getEventById, createEvent };
