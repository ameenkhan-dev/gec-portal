const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();

// Initialize database
const runMigrations = require('./migrations');
require('./db').initializeDatabase();

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN || [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://lovely-malabi-a9b5cc.netlify.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/events', require('./routes/events'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'GEC Portal API running' });
});

// Serve frontend for all other routes
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
