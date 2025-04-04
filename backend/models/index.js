const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

// User model
const User = {
  // Get all users
  getAll: async () => {
    try {
      const result = await pool.query(
        'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC'
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  },

  // Get user by ID
  getById: async (id) => {
    try {
      const result = await pool.query(
        'SELECT id, username, email, role, created_at FROM users WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Get user by email
  getByEmail: async (email) => {
    try {
      const result = await pool.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Create new user
  create: async (userData) => {
    const { username, email, password, role = 'player' } = userData;
    try {
      const result = await pool.query(
        'INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, username, email, role, created_at',
        [username, email, password, role]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Update user
  update: async (id, userData) => {
    const { username, email, role } = userData;
    try {
      const result = await pool.query(
        'UPDATE users SET username = $1, email = $2, role = $3 WHERE id = $4 RETURNING id, username, email, role, created_at',
        [username, email, role, id]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Delete user
  delete: async (id) => {
    try {
      await pool.query('DELETE FROM users WHERE id = $1', [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }
};

// Match model
const Match = {
  // Get all matches
  getAll: async () => {
    try {
      const result = await pool.query(
        `SELECT m.*, 
          u1.username as player1_name, 
          u2.username as player2_name 
        FROM matches m
        JOIN users u1 ON m.player1_id = u1.id
        JOIN users u2 ON m.player2_id = u2.id
        ORDER BY m.date DESC`
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  },

  // Get match by ID
  getById: async (id) => {
    try {
      const result = await pool.query(
        `SELECT m.*, 
          u1.username as player1_name, 
          u2.username as player2_name 
        FROM matches m
        JOIN users u1 ON m.player1_id = u1.id
        JOIN users u2 ON m.player2_id = u2.id
        WHERE m.id = $1`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Get matches by player ID
  getByPlayerId: async (playerId) => {
    try {
      const result = await pool.query(
        `SELECT m.*, 
          u1.username as player1_name, 
          u2.username as player2_name 
        FROM matches m
        JOIN users u1 ON m.player1_id = u1.id
        JOIN users u2 ON m.player2_id = u2.id
        WHERE m.player1_id = $1 OR m.player2_id = $1
        ORDER BY m.date DESC`,
        [playerId]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  },

  // Create new match
  create: async (matchData) => {
    const { player1_id, player2_id, date, location, status = 'scheduled' } = matchData;
    try {
      const result = await pool.query(
        'INSERT INTO matches (player1_id, player2_id, date, location, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [player1_id, player2_id, date, location, status]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Update match
  update: async (id, matchData) => {
    const { date, location, status } = matchData;
    try {
      const result = await pool.query(
        'UPDATE matches SET date = $1, location = $2, status = $3 WHERE id = $4 RETURNING *',
        [date, location, status, id]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Update match score
  updateScore: async (id, scoreData) => {
    const { player1_score, player2_score } = scoreData;
    try {
      const result = await pool.query(
        'UPDATE matches SET player1_score = $1, player2_score = $2, status = $3 WHERE id = $4 RETURNING *',
        [player1_score, player2_score, 'completed', id]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Delete match
  delete: async (id) => {
    try {
      await pool.query('DELETE FROM matches WHERE id = $1', [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }
};

// Challenge Request model
const ChallengeRequest = {
  // Get all challenge requests
  getAll: async () => {
    try {
      const result = await pool.query(
        `SELECT cr.*, 
          u1.username as challenger_name, 
          u2.username as challenged_name 
        FROM challenge_requests cr
        JOIN users u1 ON cr.challenger_id = u1.id
        JOIN users u2 ON cr.challenged_id = u2.id
        ORDER BY cr.created_at DESC`
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  },

  // Get challenge request by ID
  getById: async (id) => {
    try {
      const result = await pool.query(
        `SELECT cr.*, 
          u1.username as challenger_name, 
          u2.username as challenged_name 
        FROM challenge_requests cr
        JOIN users u1 ON cr.challenger_id = u1.id
        JOIN users u2 ON cr.challenged_id = u2.id
        WHERE cr.id = $1`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Get challenge requests by player ID (either as challenger or challenged)
  getByPlayerId: async (playerId) => {
    try {
      const result = await pool.query(
        `SELECT cr.*, 
          u1.username as challenger_name, 
          u2.username as challenged_name 
        FROM challenge_requests cr
        JOIN users u1 ON cr.challenger_id = u1.id
        JOIN users u2 ON cr.challenged_id = u2.id
        WHERE cr.challenger_id = $1 OR cr.challenged_id = $1
        ORDER BY cr.created_at DESC`,
        [playerId]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  },

  // Get pending challenge requests for a player
  getPendingByPlayerId: async (playerId) => {
    try {
      const result = await pool.query(
        `SELECT cr.*, 
          u1.username as challenger_name, 
          u2.username as challenged_name 
        FROM challenge_requests cr
        JOIN users u1 ON cr.challenger_id = u1.id
        JOIN users u2 ON cr.challenged_id = u2.id
        WHERE (cr.challenger_id = $1 OR cr.challenged_id = $1) AND cr.status = 'pending'
        ORDER BY cr.created_at DESC`,
        [playerId]
      );
      return result.rows;
    } catch (error) {
      throw error;
    }
  },

  // Create new challenge request
  create: async (requestData) => {
    const { challenger_id, challenged_id, proposed_date, proposed_location, message } = requestData;
    try {
      const result = await pool.query(
        'INSERT INTO challenge_requests (challenger_id, challenged_id, proposed_date, proposed_location, message, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [challenger_id, challenged_id, proposed_date, proposed_location, message, 'pending']
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Accept challenge request
  accept: async (id, matchId) => {
    try {
      const result = await pool.query(
        'UPDATE challenge_requests SET status = $1, match_id = $2 WHERE id = $3 RETURNING *',
        ['accepted', matchId, id]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Decline challenge request
  decline: async (id, message) => {
    try {
      const result = await pool.query(
        'UPDATE challenge_requests SET status = $1, message = $2 WHERE id = $3 RETURNING *',
        ['declined', message, id]
      );
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Delete challenge request
  delete: async (id) => {
    try {
      await pool.query('DELETE FROM challenge_requests WHERE id = $1', [id]);
      return true;
    } catch (error) {
      throw error;
    }
  }
};

module.exports = {
  User,
  Match,
  ChallengeRequest,
  pool
};
