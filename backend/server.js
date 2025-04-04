require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { Pool } = require('pg');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { verifyToken, requireRole } = require('./middleware/auth');

// Import routes
const authRoutes = require('./routes/auth');
const statisticsRoutes = require('./routes/statistics');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/auth', authRoutes);
app.use('/statistics', statisticsRoutes);

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.stack);
  } else {
    console.log('Database connected successfully at:', res.rows[0].now);
  }
});

// Using middleware from ./middleware/auth.js

// Routes
// Auth routes
app.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user already exists
    const userCheck = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const newUser = await pool.query(
      'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role',
      [username, email, hashedPassword, 'player']
    );
    
    // Generate JWT
    const token = jwt.sign(
      { id: newUser.rows[0].id, role: newUser.rows[0].role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: newUser.rows[0].id,
        username: newUser.rows[0].username,
        email: newUser.rows[0].email,
        role: newUser.rows[0].role
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = userResult.rows[0];
    
    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Protected routes
app.get('/profile', verifyToken, async (req, res) => {
  try {
    const userResult = await pool.query(
      'SELECT id, username, email, role FROM users WHERE id = $1',
      [req.user.id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(userResult.rows[0]);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Admin routes
app.get('/admin/users', verifyToken, requireRole('admin'), async (req, res) => {
  try {
    const usersResult = await pool.query(
      'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC'
    );
    
    res.json(usersResult.rows);
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Match routes
app.post('/matches', verifyToken, async (req, res) => {
  try {
    const { opponent_id, date, location } = req.body;
    const player_id = req.user.id;
    
    const newMatch = await pool.query(
      'INSERT INTO matches (player1_id, player2_id, date, location, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [player_id, opponent_id, date, location, 'scheduled']
    );
    
    res.status(201).json(newMatch.rows[0]);
  } catch (error) {
    console.error('Create match error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.get('/matches', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const matchesResult = await pool.query(
      `SELECT m.*, 
        u1.username as player1_name, 
        u2.username as player2_name 
      FROM matches m
      JOIN users u1 ON m.player1_id = u1.id
      JOIN users u2 ON m.player2_id = u2.id
      WHERE m.player1_id = $1 OR m.player2_id = $1
      ORDER BY m.date DESC`,
      [userId]
    );
    
    res.json(matchesResult.rows);
  } catch (error) {
    console.error('Get matches error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/matches/:id/score', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { player1_score, player2_score } = req.body;
    const userId = req.user.id;
    
    // Check if user is part of the match
    const matchCheck = await pool.query(
      'SELECT * FROM matches WHERE id = $1 AND (player1_id = $2 OR player2_id = $2)',
      [id, userId]
    );
    
    if (matchCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Not authorized to update this match' });
    }
    
    const updatedMatch = await pool.query(
      'UPDATE matches SET player1_score = $1, player2_score = $2, status = $3 WHERE id = $4 RETURNING *',
      [player1_score, player2_score, 'completed', id]
    );
    
    res.json(updatedMatch.rows[0]);
  } catch (error) {
    console.error('Update match score error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
