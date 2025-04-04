import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Navbar = ({ isAuthenticated, user, onLogout }) => {
  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link to="/" className="text-xl font-bold">
              TennisConnect
            </Link>
          </motion.div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Link to="/dashboard" className="hover:text-blue-200">
                    Dashboard
                  </Link>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <Link to="/matches" className="hover:text-blue-200">
                    Matches
                  </Link>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                >
                  <Link to="/challenges" className="hover:text-blue-200">
                    Challenges
                  </Link>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.35 }}
                >
                  <Link to="/stats" className="hover:text-blue-200">
                    Statistics
                  </Link>
                </motion.div>
                
                {user && user.role === 'admin' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <Link to="/admin" className="hover:text-blue-200">
                      Admin
                    </Link>
                  </motion.div>
                )}
                
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  className="relative group"
                >
                  <div className="flex items-center cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center mr-2">
                      {user && user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span>{user && user.username}</span>
                  </div>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={onLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                </motion.div>
              </>
            ) : (
              <>
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Link to="/login" className="hover:text-blue-200">
                    Sign In
                  </Link>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <Link 
                    to="/register" 
                    className="bg-white text-blue-600 px-4 py-2 rounded-md hover:bg-blue-100"
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
