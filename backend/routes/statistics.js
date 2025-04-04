const express = require('express');
const router = express.Router();
const { PlayerStats } = require('../models/statistics');
const { verifyToken } = require('../middleware/auth');

// Get statistics for the current user
router.get('/my-stats', verifyToken, async (req, res) => {
  try {
    const stats = await PlayerStats.getByPlayerId(req.user.id);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching player stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get statistics for a specific player
router.get('/player/:id', verifyToken, async (req, res) => {
  try {
    const stats = await PlayerStats.getByPlayerId(req.params.id);
    res.json(stats);
  } catch (error) {
    console.error('Error fetching player stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get leaderboard data
router.get('/leaderboard', verifyToken, async (req, res) => {
  try {
    const leaderboard = await PlayerStats.getLeaderboard();
    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
