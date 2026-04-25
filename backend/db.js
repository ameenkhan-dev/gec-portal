/**
 * Database Connection Pool
 * Priority: PostgreSQL > MySQL (with valid config) > In-Memory Store
 */

const mysql = require('mysql2/promise');
const { Pool } = require('pg');

let pool;
let dbType = 'unknown';

function initializeDatabase() {
  // Check if we're using PostgreSQL (DATABASE_URL or DB_TYPE=postgres)
  const isPostgres = process.env.DATABASE_URL || process.env.DB_TYPE === 'postgres';
  const isMysql = process.env.DB_TYPE === 'mysql' || (!process.env.DATABASE_URL && !process.env.DB_TYPE);

  if (isPostgres) {
    // PostgreSQL configuration
    const connectionString = process.env.DATABASE_URL;
    
    if (connectionString) {
      console.log('📦 Using PostgreSQL via DATABASE_URL');
      pool = new Pool({
        connectionString,
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      });
    } else {
      console.log('📦 Using PostgreSQL via individual env vars');
      pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'gec_event_portal',
        ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      });
    }

    dbType = 'PostgreSQL';

    // PostgreSQL error handling
    pool.on('error', (error) => {
      console.error('PostgreSQL pool error:', error);
    });
  } else if (isMysql) {
    // Check if we have valid MySQL credentials (not localhost)
    const hasValidMysqlConfig = process.env.DB_HOST && 
                                process.env.DB_HOST !== 'localhost' && 
                                process.env.DB_HOST !== '127.0.0.1' &&
                                process.env.DB_PASSWORD;

    if (hasValidMysqlConfig) {
      console.log('📦 Using MySQL via env vars');
      pool = mysql.createPool({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'gec_event_portal',
        waitForConnections: true,
        connectionLimit: 10,
      });
      dbType = 'MySQL';
    } else {
      // Fall back to in-memory store (no external dependencies)
      console.log('📦 Using In-Memory Store (fallback)');
      dbType = 'Memory';
    }
  }

  console.log(`✓ Database pool initialized: ${dbType}`);
  return pool;
}

function getPool() {
  if (!pool) {
    initializeDatabase();
  }
  return pool;
}

function getDatabaseType() {
  if (!dbType || dbType === 'unknown') {
    initializeDatabase();
  }
  return dbType;
}

module.exports = {
  initializeDatabase,
  getPool,
  getDatabaseType,
  isPostgres: () => process.env.DATABASE_URL || process.env.DB_TYPE === 'postgres',
  isMemory: () => dbType === 'Memory',
  isMySQL: () => dbType === 'MySQL',
};
