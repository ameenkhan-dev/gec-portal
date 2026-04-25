/**
 * Seed Script - Create test user for login testing
 * Run locally: node seed.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const runMigrations = require('./migrations');
const { getPool, isPostgres } = require('./db');

async function seedDatabase() {
  console.log('🌱 Starting database seed...');
  
  // First, ensure tables exist
  try {
    await runMigrations();
    console.log('✓ Database tables ready');
  } catch (error) {
    console.error('Warning: Could not run migrations:', error.message);
  }

  // Create test user
  const testUsers = [
    {
      name: 'Admin User',
      email: 'admin@gec.ac.in',
      password: 'Admin123',
      role: 'super_admin'
    },
    {
      name: 'Test Student',
      email: 'student@gec.ac.in',
      password: 'Student123',
      role: 'student'
    },
    {
      name: 'Club Admin',
      email: 'clubadmin@gec.ac.in',
      password: 'ClubAdmin123',
      role: 'club_admin'
    }
  ];

  const pool = getPool();
  const isPg = isPostgres();

  let conn;
  if (isPg) {
    conn = await pool.connect();
  } else {
    conn = await pool.getConnection();
  }

  try {
    for (const user of testUsers) {
      try {
        const hashedPassword = await bcrypt.hash(user.password, 10);

        let query = 'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
        let params = [user.name, user.email, hashedPassword, user.role];

        if (isPg) {
          query = 'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) ON CONFLICT (email) DO NOTHING';
        } else {
          query = 'INSERT IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)';
        }

        isPg
          ? await conn.query(query, params)
          : await conn.execute(query, params);

        console.log(`✓ Created/updated user: ${user.email}`);
      } catch (error) {
        console.log(`- User ${user.email} already exists or error: ${error.message}`);
      }
    }

    console.log('\n✅ Seed completed!');
    console.log('\nTest Credentials:');
    testUsers.forEach(user => {
      console.log(`  Email: ${user.email}`);
      console.log(`  Password: ${user.password}`);
      console.log(`  Role: ${user.role}\n`);
    });
  } finally {
    conn.release();
    if (isPg) {
      await pool.end();
    }
  }
}

seedDatabase().catch(error => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
