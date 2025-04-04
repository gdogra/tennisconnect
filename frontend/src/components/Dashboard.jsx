import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../utils/api';

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    upcomingMatches: 0,
    completedMatches: 0,
    pendingChallenges: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch matches
        const matchesResponse = await api.get('/matches');
        const matches = matchesResponse.data;
        
        // Fetch challenge requests
        const challengesResponse = await api.get('/challenge-requests');
        const challenges = challengesResponse.data;
        
        // Calculate stats
        const upcoming = matches.filter(match => match.status === 'scheduled').length;
        const completed = matches.filter(match => match.status === 'completed').length;
        const pending = challenges.filter(challenge => challenge.status === 'pending').length;
        
        setStats({
          upcomingMatches: upcoming,
          completedMatches: completed,
          pendingChallenges: pending
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Welcome, {user?.username || 'Player'}!
        </h1>
        <p className="text-gray-600 mb-6">
          Track your matches, schedule games, and connect with other tennis players.
        </p>
        
        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-blue-700">Upcoming Matches</h3>
              <p className="text-3xl font-bold text-blue-800 mt-2">{stats.upcomingMatches}</p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-green-700">Completed Matches</h3>
              <p className="text-3xl font-bold text-green-800 mt-2">{stats.completedMatches}</p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-yellow-700">Pending Challenges</h3>
              <p className="text-3xl font-bold text-yellow-800 mt-2">{stats.pendingChallenges}</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <a 
              href="/schedule" 
              className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded text-center"
            >
              Schedule a Match
            </a>
            <a 
              href="/challenges" 
              className="block w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded text-center"
            >
              View Challenges
            </a>
            <a 
              href="/matches" 
              className="block w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded text-center"
            >
              View Match History
            </a>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activity</h2>
          {isLoading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.upcomingMatches > 0 ? (
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="text-gray-700">You have {stats.upcomingMatches} upcoming match{stats.upcomingMatches !== 1 ? 'es' : ''}.</p>
                </div>
              ) : null}
              
              {stats.pendingChallenges > 0 ? (
                <div className="border-l-4 border-yellow-500 pl-4">
                  <p className="text-gray-700">You have {stats.pendingChallenges} pending challenge{stats.pendingChallenges !== 1 ? 's' : ''}.</p>
                </div>
              ) : null}
              
              {stats.completedMatches > 0 ? (
                <div className="border-l-4 border-green-500 pl-4">
                  <p className="text-gray-700">You have completed {stats.completedMatches} match{stats.completedMatches !== 1 ? 'es' : ''}.</p>
                </div>
              ) : null}
              
              {stats.upcomingMatches === 0 && stats.pendingChallenges === 0 && stats.completedMatches === 0 ? (
                <p className="text-gray-500 italic">No recent activity to display.</p>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
