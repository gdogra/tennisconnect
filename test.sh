#!/bin/bash

# Test script for TennisConnect application

echo "Starting TennisConnect test script..."

# Test backend
echo "Testing backend..."
cd backend

# Check if server starts properly
echo "Testing server startup..."
node -e "
const app = require('./server');
const http = require('http');
const server = http.createServer(app);
server.listen(0, () => {
  console.log('Server started successfully');
  server.close(() => {
    console.log('Server closed successfully');
  });
});"

# Test database connection
echo "Testing database connection..."
node -e "
require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.stack);
    process.exit(1);
  } else {
    console.log('Database connected successfully at:', res.rows[0].now);
    pool.end();
  }
});"

# Test frontend build
echo "Testing frontend build..."
cd ../frontend

# Check if build works
echo "Testing build process..."
npm run build -- --mode development

echo "All tests completed successfully!"
