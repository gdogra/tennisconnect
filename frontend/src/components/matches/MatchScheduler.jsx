import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import TennisCourtMap from '../maps/TennisCourtMap';
import api from '../../utils/api';

const MatchScheduler = ({ user }) => {
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    opponent_id: '',
    date: '',
    time: '',
    location: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    fetchPlayers();
  }, []);

  const fetchPlayers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/users');
      // Filter out current user
      const filteredPlayers = response.data.filter(player => player.id !== user.id);
      setPlayers(filteredPlayers);
    } catch (error) {
      console.error('Error fetching players:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLocationSelect = (location) => {
    setFormData({
      ...formData,
      location
    });
    setShowMap(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate form
    if (!formData.opponent_id || !formData.date || !formData.time || !formData.location) {
      setError('All fields are required');
      return;
    }

    try {
      // Combine date and time
      const dateTime = new Date(`${formData.date}T${formData.time}`);
      
      await api.post('/matches', {
        opponent_id: formData.opponent_id,
        date: dateTime.toISOString(),
        location: formData.location
      });
      
      setSuccess('Match scheduled successfully!');
      setFormData({
        opponent_id: '',
        date: '',
        time: '',
        location: ''
      });
    } catch (error) {
      console.error('Error scheduling match:', error);
      setError(error.response?.data?.message || 'Failed to schedule match. Please try again.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Schedule a Match
        </h1>
        <p className="text-gray-600 mb-6">
          Fill out the form below to schedule a tennis match with another player.
        </p>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="max-w-lg">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="opponent_id">
              Opponent
            </label>
            {isLoading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                <span className="text-gray-500">Loading players...</span>
              </div>
            ) : (
              <select
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="opponent_id"
                name="opponent_id"
                value={formData.opponent_id}
                onChange={handleChange}
                required
              >
                <option value="">Select an opponent</option>
                {players.map(player => (
                  <option key={player.id} value={player.id}>
                    {player.username}
                  </option>
                ))}
              </select>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
              Date
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="time">
              Time
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="time"
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
              Location
            </label>
            <div className="flex">
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="location"
                type="text"
                name="location"
                placeholder="Tennis court location"
                value={formData.location}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowMap(!showMap)}
                className="ml-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                {showMap ? 'Hide Map' : 'Find on Map'}
              </button>
            </div>
          </div>
          
          {showMap && (
            <div className="mb-6">
              <TennisCourtMap 
                location={formData.location} 
                onSelectLocation={handleLocationSelect} 
              />
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Schedule Match
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default MatchScheduler;
