import { useState, useEffect } from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import Dashboard from '@/pages/Dashboard';
import RoomView from '@/pages/RoomView';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in and session has not expired (1 hour)
    const savedUser = localStorage.getItem('lluvia_user');
    const loginAt = localStorage.getItem('lluvia_login_at');
    const SESSION_DURATION_MS = 60 * 60 * 1000; // 1 hour
    if (savedUser) {
      const elapsed = loginAt ? Date.now() - parseInt(loginAt, 10) : SESSION_DURATION_MS;
      if (elapsed < SESSION_DURATION_MS) {
        setCurrentUser(JSON.parse(savedUser));
      } else {
        // Session expired or missing timestamp — clear stored data
        localStorage.removeItem('lluvia_user');
        localStorage.removeItem('lluvia_login_at');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (user) => {
    setCurrentUser(user);
    localStorage.setItem('lluvia_user', JSON.stringify(user));
    localStorage.setItem('lluvia_login_at', Date.now().toString());
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('lluvia_user');
    localStorage.removeItem('lluvia_login_at');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-900 text-2xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="App bg-white min-h-screen">
      <BrowserRouter>
        <Routes>
          <Route
            path="/"
            element={
              currentUser ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <LoginPage onLogin={handleLogin} API={API} />
              )
            }
          />
          <Route
            path="/dashboard"
            element={
              currentUser ? (
                <Dashboard currentUser={currentUser} onLogout={handleLogout} API={API} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
          <Route
            path="/room/:roomId"
            element={
              currentUser ? (
                <RoomView currentUser={currentUser} API={API} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
