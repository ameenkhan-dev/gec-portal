const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gec_event_portal',
  waitForConnections: true,
  connectionLimit: 10,
});

const ALLOWED_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || 'gec.ac.in';

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
      return res.status(400).json({ error: `Only ${ALLOWED_DOMAIN} emails allowed` });
    }

    const conn = await pool.getConnection();
    
    // Check if user exists
    const [existing] = await conn.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      conn.release();
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    await conn.execute('INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)', 
      [name, email, hashedPassword, role || 'student']);
    
    conn.release();
    res.json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const conn = await pool.getConnection();
    
    const [users] = await conn.execute('SELECT user_id, name, email, password, role FROM users WHERE email = ?', [email]);
    conn.release();

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your_super_secret_jwt_key_change_this_in_production',
      { expiresIn: '7d' }
    );

    res.json({ 
      token, 
      user: { user_id: user.user_id, name: user.name, email: user.email, role: user.role } 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const conn = await pool.getConnection();
    const [users] = await conn.execute('SELECT user_id, name, email, role FROM users WHERE user_id = ?', [req.user.user_id]);
    conn.release();

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const logout = (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

module.exports = { register, login, getProfile, logout };
