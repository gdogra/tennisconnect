import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../utils/api';

// Admin components
import UserManagement from './UserManagement';
import MatchOverview from './MatchOverview';
import SystemStats from './SystemStats';

const AdminPanel = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMatches: 0,
    pendingChallenges: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch users
        const usersResponse = await api.get('/admin/users');
        
        // Fetch all matches
        const matchesResponse = await api.get('/admin/matches');
        
        // Fetch all challenge requests
        const challengesResponse = await api.get('/admin/challenge-requests');
        
        setStats({
          totalUsers: usersResponse.data.length,
          totalMatches: matchesResponse.data.length,
          pendingChallenges: challengesResponse.data.filter(c => c.status === 'pending').length
        });
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminData();
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
          Admin Dashboard
        </h1>
        <p className="text-gray-600 mb-6">
          Manage users, view match statistics, and monitor system activity.
        </p>
        
        {isLoading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-purple-50 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-purple-700">Total Users</h3>
              <p className="text-3xl font-bold text-purple-800 mt-2">{stats.totalUsers}</p>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-blue-700">Total Matches</h3>
              <p className="text-3xl font-bold text-blue-800 mt-2">{stats.totalMatches}</p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-yellow-700">Pending Challenges</h3>
              <p className="text-3xl font-bold text-yellow-800 mt-2">{stats.pendingChallenges}</p>
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex border-b pb-4">
          <a href="/admin" className="mr-6 font-medium text-blue-600 hover:text-blue-800">Overview</a>
          <a href="/admin/users" className="mr-6 font-medium text-gray-600 hover:text-blue-600">User Management</a>
          <a href="/admin/matches" className="mr-6 font-medium text-gray-600 hover:text-blue-600">Match Overview</a>
          <a href="/admin/stats" className="font-medium text-gray-600 hover:text-blue-600">System Stats</a>
        </div>
        
        <div className="mt-6">
          <Routes>
            <Route path="/" element={<AdminOverview stats={stats} />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/matches" element={<MatchOverview />} />
            <Route path="/stats" element={<SystemStats />} />
          </Routes>
        </div>
      </div>
    </motion.div>
  );
};

// Admin Overview Component
const AdminOverview = ({ stats }) => {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-4">System Overview</h2>
      <p className="text-gray-600 mb-4">
        Welcome to the TennisConnect admin panel. Here you can manage all aspects of the platform.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-700 mb-2">Quick Actions</h3>
          <div className="space-y-2">
            <a 
              href="/admin/users" 
              className="block w-full bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded text-center"
            >
              Manage Users
            </a>
            <a 
              href="/admin/matches" 
              className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded text-center"
            >
              View Matches
            </a>
          </div>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-700 mb-2">System Health</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Database Status</span>
              <span className="text-green-600 font-medium">Connected</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">API Status</span>
              <span className="text-green-600 font-medium">Online</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Last Backup</span>
              <span className="text-gray-600 font-medium">Today, 03:00 AM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
