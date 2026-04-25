/**
 * Database Connection Pool
 * Supports both MySQL and PostgreSQL based on environment variables
 */

const mysql = require('mysql2/promise');
const { Pool } = require('pg');

let pool;

function initializeDatabase() {
  // Check if we're using PostgreSQL (DATABASE_URL or DB_TYPE=postgres)
  const isPostgres = process.env.DATABASE_URL || process.env.DB_TYPE === 'postgres';

  if (isPostgres) {
    // PostgreSQL configuration
    const connectionString = process.env.DATABASE_URL;
    
    if (connectionString) {
      pool = new Pool({
        connectionString,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      });
    } else {
      pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'gec_event_portal',
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      });
    }

    console.log('Using PostgreSQL database');
  } else {
    // MySQL configuration
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'gec_event_portal',
      waitForConnections: true,
      connectionLimit: 10,
    });

    console.log('Using MySQL database');
  }

  return pool;
}

function getPool() {
  if (!pool) {
    initializeDatabase();
  }
  return pool;
}

module.exports = {
  initializeDatabase,
  getPool,
  isPostgres: () => process.env.DATABASE_URL || process.env.DB_TYPE === 'postgres',
};
