const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Initialize database
const runMigrations = require('./migrations');
require('./db').initializeDatabase();

// CORS configuration - allow requests from Netlify
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'https://lovely-malabi-a9b5cc.netlify.app',
      'https://gecep.netlify.app',
      'https://gec-portal-api.onrender.com'
    ];

    // Allow requests with no origin (like mobile apps or curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
// Preflight requests
app.options('*', cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Health check with database status (must come BEFORE wildcard static files)
app.get('/api/health', async (req, res) => {
  try {
    const pool = require('./db').getPool();
    const isPg = require('./db').isPostgres();
    
    let dbStatus = 'unknown';
    let dbType = isPg ? 'PostgreSQL' : 'MySQL';
    
    try {
      if (isPg) {
        const conn = await pool.connect();
        await conn.query('SELECT NOW()');
        conn.release();
        dbStatus = 'connected';
      } else {
        const conn = await pool.getConnection();
        await conn.ping();
        conn.release();
        dbStatus = 'connected';
      }
    } catch (dbError) {
      dbStatus = 'disconnected: ' + dbError.message.substring(0, 50);
    }
    
    res.json({ 
      status: 'ok', 
      message: 'GEC Portal API running',
      database: {
        type: dbType,
        status: dbStatus
      }
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'error',
      message: 'API error',
      error: error.message
    });
  }
});

// Routes (must come BEFORE wildcard route)
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Serve frontend for all other routes (must be LAST)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error', message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  console.log(`GEC Portal API running on port ${PORT}`);
  
  // Run migrations on startup
  try {
    await runMigrations();
  } catch (error) {
    console.error('Failed to run migrations:', error);
    // Don't exit - migrations might fail due to permissions but API can still work
  }
});
