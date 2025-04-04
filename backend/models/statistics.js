const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

// Player Statistics model
const PlayerStats = {
  // Get statistics for a specific player
  getByPlayerId: async (playerId) => {
    try {
      // Get all matches for the player
      const matchesResult = await pool.query(
        `SELECT * FROM matches 
         WHERE (player1_id = $1 OR player2_id = $1) 
         AND status = 'completed'`,
        [playerId]
      );
      
      const matches = matchesResult.rows;
      
      // Calculate statistics
      let wins = 0;
      let losses = 0;
      let totalGamesWon = 0;
      let totalGamesLost = 0;
      
      matches.forEach(match => {
        const isPlayer1 = match.player1_id === playerId;
        const playerScore = isPlayer1 ? match.player1_score : match.player2_score;
        const opponentScore = isPlayer1 ? match.player2_score : match.player1_score;
        
        if (playerScore > opponentScore) {
          wins++;
        } else {
          losses++;
        }
        
        totalGamesWon += playerScore;
        totalGamesLost += opponentScore;
      });
      
      // Get recent match results (last 5)
      const recentMatches = await pool.query(
        `SELECT m.*, 
          u1.username as player1_name, 
          u2.username as player2_name 
        FROM matches m
        JOIN users u1 ON m.player1_id = u1.id
        JOIN users u2 ON m.player2_id = u2.id
        WHERE (m.player1_id = $1 OR m.player2_id = $1) 
        AND m.status = 'completed'
        ORDER BY m.date DESC
        LIMIT 5`,
        [playerId]
      );
      
      // Get opponent breakdown
      const opponentBreakdown = await pool.query(
        `WITH player_matches AS (
          SELECT 
            CASE 
              WHEN player1_id = $1 THEN player2_id
              ELSE player1_id
            END as opponent_id,
            CASE 
              WHEN player1_id = $1 THEN player1_score > player2_score
              ELSE player2_score > player1_score
            END as is_win
          FROM matches
          WHERE (player1_id = $1 OR player2_id = $1)
          AND status = 'completed'
        )
        SELECT 
          u.username as opponent_name,
          COUNT(*) as total_matches,
          SUM(CASE WHEN is_win THEN 1 ELSE 0 END) as wins,
          SUM(CASE WHEN NOT is_win THEN 1 ELSE 0 END) as losses
        FROM player_matches pm
        JOIN users u ON pm.opponent_id = u.id
        GROUP BY u.username
        ORDER BY total_matches DESC`,
        [playerId]
      );
      
      return {
        matches_played: matches.length,
        wins,
        losses,
        win_percentage: matches.length > 0 ? Math.round((wins / matches.length) * 100) : 0,
        total_games_won: totalGamesWon,
        total_games_lost: totalGamesLost,
        recent_matches: recentMatches.rows,
        opponent_breakdown: opponentBreakdown.rows
      };
    } catch (error) {
      throw error;
    }
  },
  
  // Get leaderboard data
  getLeaderboard: async () => {
    try {
      // Get all players with at least one match
      const playersResult = await pool.query(
        `SELECT DISTINCT 
          CASE 
            WHEN player1_id = u.id THEN player1_id
            ELSE player2_id
          END as player_id,
          u.username
        FROM matches m
        JOIN users u ON u.id = m.player1_id OR u.id = m.player2_id
        WHERE m.status = 'completed'`
      );
      
      const players = playersResult.rows;
      const leaderboardData = [];
      
      // For each player, calculate their stats
      for (const player of players) {
        const stats = await PlayerStats.getByPlayerId(player.player_id);
        
        leaderboardData.push({
          player_id: player.player_id,
          username: player.username,
          matches_played: stats.matches_played,
          wins: stats.wins,
          losses: stats.losses,
          win_percentage: stats.win_percentage
        });
      }
      
      // Sort by win percentage (descending)
      return leaderboardData.sort((a, b) => b.win_percentage - a.win_percentage);
    } catch (error) {
      throw error;
    }
  }
};

module.exports = {
  PlayerStats
};
