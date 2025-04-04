import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  CategoryScale,
  LinearScale,
  BarElement,
  Title
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import api from '../../utils/api';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

const PlayerStats = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchLeaderboard();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/statistics/my-stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching player stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get('/statistics/leaderboard');
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  // Prepare chart data
  const winLossData = {
    labels: ['Wins', 'Losses'],
    datasets: [
      {
        data: stats ? [stats.wins, stats.losses] : [0, 0],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare opponent breakdown chart data
  const prepareOpponentData = () => {
    if (!stats || !stats.opponent_breakdown || stats.opponent_breakdown.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            label: 'Wins',
            data: [],
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
          },
          {
            label: 'Losses',
            data: [],
            backgroundColor: 'rgba(255, 99, 132, 0.6)',
          }
        ]
      };
    }

    // Sort by total matches
    const sortedOpponents = [...stats.opponent_breakdown]
      .sort((a, b) => b.total_matches - a.total_matches)
      .slice(0, 5); // Take top 5

    return {
      labels: sortedOpponents.map(o => o.opponent_name),
      datasets: [
        {
          label: 'Wins',
          data: sortedOpponents.map(o => o.wins),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
        {
          label: 'Losses',
          data: sortedOpponents.map(o => o.losses),
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
        }
      ]
    };
  };

  const opponentData = prepareOpponentData();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          My Statistics
        </h1>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : !stats ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No match statistics available yet. Play some matches to see your stats!</p>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-blue-50 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-blue-700">Matches Played</h3>
                <p className="text-3xl font-bold text-blue-800 mt-2">{stats.matches_played}</p>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-green-700">Wins</h3>
                <p className="text-3xl font-bold text-green-800 mt-2">{stats.wins}</p>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-red-700">Losses</h3>
                <p className="text-3xl font-bold text-red-800 mt-2">{stats.losses}</p>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-purple-700">Win Percentage</h3>
                <p className="text-3xl font-bold text-purple-800 mt-2">{stats.win_percentage}%</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Win/Loss Ratio</h3>
                <div className="h-64">
                  <Pie data={winLossData} options={{ maintainAspectRatio: false }} />
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold text-gray-700 mb-4">Opponent Breakdown</h3>
                <div className="h-64">
                  <Bar 
                    data={opponentData} 
                    options={{ 
                      maintainAspectRatio: false,
                      scales: {
                        x: {
                          stacked: true,
                        },
                        y: {
                          stacked: true,
                          beginAtZero: true
                        }
                      }
                    }} 
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Matches</h3>
              {stats.recent_matches && stats.recent_matches.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Opponent
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Location
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Score
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Result
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stats.recent_matches.map(match => {
                        const isPlayer1 = match.player1_id === user.id;
                        const opponentName = isPlayer1 ? match.player2_name : match.player1_name;
                        const userScore = isPlayer1 ? match.player1_score : match.player2_score;
                        const opponentScore = isPlayer1 ? match.player2_score : match.player1_score;
                        const isWin = userScore > opponentScore;
                        
                        return (
                          <tr key={match.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(match.date).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{opponentName}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{match.location}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{userScore} - {opponentScore}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                isWin ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {isWin ? 'Win' : 'Loss'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No recent matches found.</p>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Leaderboard
        </h2>
        
        {leaderboard.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No leaderboard data available yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Player
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Matches
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wins
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Losses
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Win %
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaderboard.map((player, index) => (
                  <tr key={player.player_id} className={player.player_id === user.id ? 'bg-blue-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{index + 1}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {player.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {player.username}
                            {player.player_id === user.id ? ' (You)' : ''}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{player.matches_played}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{player.wins}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{player.losses}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{player.win_percentage}%</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PlayerStats;
