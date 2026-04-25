const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'gec_portal',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

async function migrate() {
  let connection;
  try {
    // Create connection without database name to create it if needed
    connection = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password,
    });

    console.log('Connected to MySQL');

    // Create database if not exists
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${config.database}`);
    console.log(`Database ${config.database} ready`);

    await connection.end();

    // Now connect with database
    connection = await mysql.createConnection(config);

    // Read and execute migrations
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir).sort();

    for (const file of migrationFiles) {
      const filePath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      console.log(`Running migration: ${file}`);
      
      // Split by semicolon and execute each statement
      const statements = sql.split(';').filter(stmt => stmt.trim());
      for (const statement of statements) {
        if (statement.trim()) {
          await connection.execute(statement);
        }
      }
    }

    console.log('✅ All migrations completed successfully');
    await connection.end();
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  }
}

migrate();
