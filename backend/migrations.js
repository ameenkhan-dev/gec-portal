/**
 * Database Migration Script
 * Creates all necessary tables for the GEC Portal
 */

const { Pool } = require('pg');
const mysql = require('mysql2/promise');

async function runMigrations() {
  const isPostgres = process.env.DATABASE_URL || process.env.DB_TYPE === 'postgres';

  if (isPostgres) {
    await migratePostgres();
  } else {
    await migrateMySQL();
  }
}

async function migratePostgres() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  const client = await pool.connect();

  try {
    console.log('Creating PostgreSQL tables...');

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'student',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Users table created');

    // Create clubs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS clubs (
        club_id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        admin_id INTEGER NOT NULL REFERENCES users(user_id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Clubs table created');

    // Create events table
    await client.query(`
      CREATE TABLE IF NOT EXISTS events (
        event_id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        club_id INTEGER NOT NULL REFERENCES clubs(club_id),
        start_date TIMESTAMP NOT NULL,
        end_date TIMESTAMP NOT NULL,
        location VARCHAR(255),
        poster_url VARCHAR(255),
        status VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Events table created');

    // Create registrations table
    await client.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        registration_id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL REFERENCES events(event_id),
        user_id INTEGER NOT NULL REFERENCES users(user_id),
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(event_id, user_id)
      );
    `);
    console.log('✓ Registrations table created');

    // Create attendance table
    await client.query(`
      CREATE TABLE IF NOT EXISTS attendance (
        attendance_id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL REFERENCES events(event_id),
        user_id INTEGER NOT NULL REFERENCES users(user_id),
        marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(event_id, user_id)
      );
    `);
    console.log('✓ Attendance table created');

    // Create certificates table
    await client.query(`
      CREATE TABLE IF NOT EXISTS certificates (
        certificate_id SERIAL PRIMARY KEY,
        event_id INTEGER NOT NULL REFERENCES events(event_id),
        user_id INTEGER NOT NULL REFERENCES users(user_id),
        certificate_url VARCHAR(255),
        issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(event_id, user_id)
      );
    `);
    console.log('✓ Certificates table created');

    console.log('✅ PostgreSQL migration completed successfully');
  } catch (error) {
    console.error('❌ PostgreSQL migration failed:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

async function migrateMySQL() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'gec_event_portal',
  });

  try {
    console.log('Creating MySQL tables...');

    // Create users table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS users (
        user_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'student',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✓ Users table created');

    // Create clubs table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS clubs (
        club_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        admin_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (admin_id) REFERENCES users(user_id)
      );
    `);
    console.log('✓ Clubs table created');

    // Create events table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS events (
        event_id INT PRIMARY KEY AUTO_INCREMENT,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        club_id INT NOT NULL,
        start_date DATETIME NOT NULL,
        end_date DATETIME NOT NULL,
        location VARCHAR(255),
        poster_url VARCHAR(255),
        status VARCHAR(50) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (club_id) REFERENCES clubs(club_id)
      );
    `);
    console.log('✓ Events table created');

    // Create registrations table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS registrations (
        registration_id INT PRIMARY KEY AUTO_INCREMENT,
        event_id INT NOT NULL,
        user_id INT NOT NULL,
        registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(event_id, user_id),
        FOREIGN KEY (event_id) REFERENCES events(event_id),
        FOREIGN KEY (user_id) REFERENCES users(user_id)
      );
    `);
    console.log('✓ Registrations table created');

    // Create attendance table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS attendance (
        attendance_id INT PRIMARY KEY AUTO_INCREMENT,
        event_id INT NOT NULL,
        user_id INT NOT NULL,
        marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(event_id, user_id),
        FOREIGN KEY (event_id) REFERENCES events(event_id),
        FOREIGN KEY (user_id) REFERENCES users(user_id)
      );
    `);
    console.log('✓ Attendance table created');

    // Create certificates table
    await conn.execute(`
      CREATE TABLE IF NOT EXISTS certificates (
        certificate_id INT PRIMARY KEY AUTO_INCREMENT,
        event_id INT NOT NULL,
        user_id INT NOT NULL,
        certificate_url VARCHAR(255),
        issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(event_id, user_id),
        FOREIGN KEY (event_id) REFERENCES events(event_id),
        FOREIGN KEY (user_id) REFERENCES users(user_id)
      );
    `);
    console.log('✓ Certificates table created');

    console.log('✅ MySQL migration completed successfully');
  } catch (error) {
    if (error.code === 'ER_TABLE_EXISTS_ERROR') {
      console.log('✅ Tables already exist');
    } else {
      console.error('❌ MySQL migration failed:', error.message);
    }
  } finally {
    await conn.end();
  }
}

// Run if called directly
if (require.main === module) {
  require('dotenv').config();
  runMigrations().catch(console.error);
}

module.exports = runMigrations;
