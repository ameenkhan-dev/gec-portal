/**
 * Database Connection Pool with SQLite Fallback
 * Priority: PostgreSQL > MySQL (with valid config) > SQLite (for testing)
 */

const mysql = require('mysql2/promise');
const { Pool } = require('pg');
let sqlite3, db;

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
      // Fall back to SQLite for development/testing
      console.log('📦 Using SQLite (fallback for testing)');
      try {
        sqlite3 = require('better-sqlite3');
        const dbPath = process.env.DB_PATH || './gec-portal.db';
        db = new sqlite3(dbPath);
        console.log(`   Database file: ${dbPath}`);
        dbType = 'SQLite';
      } catch (error) {
        console.error('⚠️ SQLite not available, MySQL localhost will be used (will fail in production)');
        pool = mysql.createPool({
          host: process.env.DB_HOST || 'localhost',
          port: process.env.DB_PORT || 3306,
          user: process.env.DB_USER || 'root',
          password: process.env.DB_PASSWORD || 'password',
          database: process.env.DB_NAME || 'gec_event_portal',
          waitForConnections: true,
          connectionLimit: 10,
        });
        dbType = 'MySQL';
      }
    }
  }

  console.log(`✓ Database pool initialized: ${dbType}`);
  return { pool, db, type: dbType };
}

function getPool() {
  if (!pool && !db) {
    initializeDatabase();
  }
  return pool;
}

function getDb() {
  if (!db) {
    initializeDatabase();
  }
  return db;
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
  getDb,
  getDatabaseType,
  isPostgres: () => process.env.DATABASE_URL || process.env.DB_TYPE === 'postgres',
  isSQLite: () => dbType === 'SQLite',
  isMySQL: () => dbType === 'MySQL',
};
