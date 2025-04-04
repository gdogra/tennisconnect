import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../utils/api';

const ChallengeRequests = ({ user }) => {
  const [challenges, setChallenges] = useState([]);
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received');
  const [formData, setFormData] = useState({
    challenged_id: '',
    proposed_date: '',
    proposed_time: '',
    proposed_location: '',
    message: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchChallenges();
    fetchPlayers();
  }, []);

  const fetchChallenges = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/challenge-requests');
      setChallenges(response.data);
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlayers = async () => {
    try {
      const response = await api.get('/users');
      // Filter out current user
      const filteredPlayers = response.data.filter(player => player.id !== user.id);
      setPlayers(filteredPlayers);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate form
    if (!formData.challenged_id || !formData.proposed_date || !formData.proposed_time || !formData.proposed_location) {
      setError('All fields except message are required');
      return;
    }

    try {
      // Combine date and time
      const dateTime = new Date(`${formData.proposed_date}T${formData.proposed_time}`);
      
      await api.post('/challenge-requests', {
        challenged_id: formData.challenged_id,
        proposed_date: dateTime.toISOString(),
        proposed_location: formData.proposed_location,
        message: formData.message
      });
      
      setSuccess('Challenge request sent successfully!');
      setFormData({
        challenged_id: '',
        proposed_date: '',
        proposed_time: '',
        proposed_location: '',
        message: ''
      });
      fetchChallenges();
    } catch (error) {
      console.error('Error sending challenge request:', error);
      setError(error.response?.data?.message || 'Failed to send challenge request. Please try again.');
    }
  };

  const handleAccept = async (challengeId) => {
    try {
      await api.put(`/challenge-requests/${challengeId}/accept`);
      fetchChallenges();
    } catch (error) {
      console.error('Error accepting challenge:', error);
    }
  };

  const handleDecline = async (challengeId) => {
    try {
      const reason = prompt('Reason for declining (optional):');
      await api.put(`/challenge-requests/${challengeId}/decline`, { message: reason || '' });
      fetchChallenges();
    } catch (error) {
      console.error('Error declining challenge:', error);
    }
  };

  const filteredChallenges = challenges.filter(challenge => {
    if (activeTab === 'received') {
      return challenge.challenged_id === user.id;
    } else if (activeTab === 'sent') {
      return challenge.challenger_id === user.id;
    }
    return true;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Challenge Requests
        </h1>
        
        <div className="flex border-b mb-6">
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'received' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
            onClick={() => setActiveTab('received')}
          >
            Received
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'sent' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
            onClick={() => setActiveTab('sent')}
          >
            Sent
          </button>
          <button
            className={`py-2 px-4 font-medium ${activeTab === 'all' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-blue-600'}`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredChallenges.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No {activeTab} challenge requests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {activeTab === 'sent' ? 'Challenged Player' : 'Challenger'}
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Proposed Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredChallenges.map(challenge => {
                  const isChallenger = challenge.challenger_id === user.id;
                  const otherPlayerName = isChallenger ? challenge.challenged_name : challenge.challenger_name;
                  
                  return (
                    <tr key={challenge.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            {otherPlayerName.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{otherPlayerName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(challenge.proposed_date).toLocaleDateString()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(challenge.proposed_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{challenge.proposed_location}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          challenge.status === 'accepted' ? 'bg-green-100 text-green-800' : 
                          challenge.status === 'declined' ? 'bg-red-100 text-red-800' : 
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {challenge.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{challenge.message || '-'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {!isChallenger && challenge.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleAccept(challenge.id)}
                              className="text-green-600 hover:text-green-900 mr-3"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleDecline(challenge.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Decline
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Send a Challenge
        </h2>
        
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
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="challenged_id">
              Player to Challenge
            </label>
            <select
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="challenged_id"
              name="challenged_id"
              value={formData.challenged_id}
              onChange={handleChange}
              required
            >
              <option value="">Select a player</option>
              {players.map(player => (
                <option key={player.id} value={player.id}>
                  {player.username}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="proposed_date">
              Proposed Date
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="proposed_date"
              type="date"
              name="proposed_date"
              value={formData.proposed_date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="proposed_time">
              Proposed Time
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="proposed_time"
              type="time"
              name="proposed_time"
              value={formData.proposed_time}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="proposed_location">
              Proposed Location
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="proposed_location"
              type="text"
              name="proposed_location"
              placeholder="Tennis court location"
              value={formData.proposed_location}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="message">
              Message (Optional)
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="message"
              name="message"
              rows="3"
              placeholder="Add a personal message to your challenge"
              value={formData.message}
              onChange={handleChange}
            ></textarea>
          </div>
          
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Send Challenge
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default ChallengeRequests;
