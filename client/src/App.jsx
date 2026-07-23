import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
// REPLACE axios with your new api instance
import api from './api/axios'; 
import Header from './components/Header.jsx';
import LearningForm from './components/LearningForm.jsx';
import Dashboard from './components/DashBoard.jsx'; 
import CalendarView from './components/CalendarView.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';
import MainLayout from './components/MainLayout.jsx';
import NotFound from './components/NotFound.jsx';

function AppContent() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Ensure dark mode is active globally for a unified premium dark theme
    document.documentElement.classList.add('dark');

    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setUser(foundUser);
    }
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
      <div className="min-h-screen font-sans transition-colors duration-200 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
        <Routes>
          <Route 
            path="/login" 
            element={!user ? <Login setUser={setUser} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/register" 
            element={!user ? <Register setUser={setUser} /> : <Navigate to="/" />} 
          />
          <Route path="/" element={user ? (
            <MainLayout user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}



export default App;