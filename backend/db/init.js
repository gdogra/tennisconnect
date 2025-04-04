const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Create a new pool instance with connection details from .env
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

// Read the schema file
const schemaSQL = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');

// Connect to the database and execute the schema
async function initializeDatabase() {
  const client = await pool.connect();
  try {
    console.log('Initializing database...');
    await client.query(schemaSQL);
    console.log('Database initialized successfully!');
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the initialization
initializeDatabase();
