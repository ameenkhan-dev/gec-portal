const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool, isPostgres } = require('../db');

const ALLOWED_DOMAIN = process.env.ALLOWED_EMAIL_DOMAIN || 'gec.ac.in';

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!email.endsWith(`@${ALLOWED_DOMAIN}`)) {
      return res.status(400).json({ error: `Only ${ALLOWED_DOMAIN} emails allowed` });
    }

    const pool = getPool();
    const isPg = isPostgres();
    
    let conn;
    if (isPg) {
      conn = await pool.connect();
    } else {
      conn = await pool.getConnection();
    }

    try {
      // Check if user exists
      let query = 'SELECT * FROM users WHERE email = ?';
      let params = [email];
      
      if (isPg) {
        query = 'SELECT * FROM users WHERE email = $1';
        params = [email];
      }
      
      const result = isPg 
        ? await conn.query(query, params)
        : await conn.execute(query, params);
      
      const existing = isPg ? result.rows : result[0];

      if (existing.length > 0) {
        conn.release();
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      
      query = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
      params = [name, email, hashedPassword, role || 'student'];
      
      if (isPg) {
        query = 'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)';
      }
      
      isPg 
        ? await conn.query(query, params)
        : await conn.execute(query, params);
      
      conn.release();
      res.json({ message: 'User registered successfully' });
    } catch (error) {
      conn.release();
      throw error;
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const pool = getPool();
    const isPg = isPostgres();
    
    let conn;
    if (isPg) {
      conn = await pool.connect();
    } else {
      conn = await pool.getConnection();
    }

    try {
      let query = 'SELECT user_id, name, email, password, role FROM users WHERE email = ?';
      let params = [email];
      
      if (isPg) {
        query = 'SELECT user_id, name, email, password, role FROM users WHERE email = $1';
      }
      
      const result = isPg
        ? await conn.query(query, params)
        : await conn.execute(query, params);
      
      const users = isPg ? result.rows : result[0];
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
      conn.release();
      console.error('Login query error:', error);
      throw error;
    }
  } catch (error) {
    console.error('Login error:', error.message, error.stack);
    res.status(500).json({ error: error.message || 'Login failed' });
  }
};

const getProfile = async (req, res) => {
  try {
    const pool = getPool();
    const isPg = isPostgres();
    
    let conn;
    if (isPg) {
      conn = await pool.connect();
    } else {
      conn = await pool.getConnection();
    }

    try {
      let query = 'SELECT user_id, name, email, role FROM users WHERE user_id = ?';
      let params = [req.user.user_id];
      
      if (isPg) {
        query = 'SELECT user_id, name, email, role FROM users WHERE user_id = $1';
      }
      
      const result = isPg
        ? await conn.query(query, params)
        : await conn.execute(query, params);
      
      const users = isPg ? result.rows : result[0];
      conn.release();

      if (users.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(users[0]);
    } catch (error) {
      conn.release();
      throw error;
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const logout = (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

module.exports = { register, login, getProfile, logout };
