import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Components
import Navbar from './components/Navbar';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/Dashboard';
import AdminPanel from './components/admin/AdminPanel';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RequireRole from './components/auth/RequireRole';
import MatchScheduler from './components/matches/MatchScheduler';
import MatchList from './components/matches/MatchList';
import ChallengeRequests from './components/challenges/ChallengeRequests';
import PlayerStats from './components/stats/PlayerStats';
import Profile from './components/Profile';
import NotFound from './components/NotFound';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setIsAuthenticated(true);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Navbar isAuthenticated={isAuthenticated} user={user} onLogout={handleLogout} />
        <main className="container mx-auto px-4 py-8">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
              
              {/* Auth Routes */}
              <Route 
                path="/login" 
                element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
              />
              <Route 
                path="/register" 
                element={!isAuthenticated ? <Register onLogin={handleLogin} /> : <Navigate to="/dashboard" />} 
              />
              
              {/* Protected Routes */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <Dashboard user={user} />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <Profile user={user} />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/matches" 
                element={
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <MatchList user={user} />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/schedule" 
                element={
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <MatchScheduler user={user} />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/challenges" 
                element={
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <ChallengeRequests user={user} />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/stats" 
                element={
                  <ProtectedRoute isAuthenticated={isAuthenticated}>
                    <PlayerStats user={user} />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Routes */}
              <Route 
                path="/admin/*" 
                element={
                  <RequireRole isAuthenticated={isAuthenticated} user={user} requiredRole="admin">
                    <AdminPanel />
                  </RequireRole>
                } 
              />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </Router>
  );
}

export default App;
