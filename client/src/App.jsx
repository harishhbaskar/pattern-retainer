import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Header from './components/Header.jsx';
import LearningForm from './components/LearningForm.jsx';
import Dashboard from './components/DashBoard.jsx'; 
import CalendarView from './components/CalendarView.jsx';
import Login from './components/Login.jsx';
import Register from './components/Register.jsx';

function App() {
  const [user, setUser] = useState(null);

  
  useEffect(() => {
    const loggedInUser = localStorage.getItem('user');
    if (loggedInUser) {
      const foundUser = JSON.parse(loggedInUser);
      setUser(foundUser);
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${foundUser.token}`;
    }
  }, []);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <Router>
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
          
          {/* Protected Route */}
          <Route path="/" element={user ? (
            <MainLayout user={user} onLogout={handleLogout} />
          ) : (
            <Navigate to="/login" />
          )} />
        </Routes>
      </div>
    </Router>
  );
}


const MainLayout = ({ user, onLogout }) => {
  const [learnings, setLearnings] = useState([]);
  const [view, setView] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  
  
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  
  const fetchLearnings = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get('http://localhost:5000/api/learnings');
      setLearnings(data);
    } catch (error) {
      console.error("Failed to fetch learnings", error);
      
    } finally {
      setIsLoading(false);
    }
  };
  
  
  useEffect(() => { 
    if(user) fetchLearnings(); 
  }, [user]);

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-4">
           <div className="text-sm text-gray-500">Welcome, <span className="font-bold text-indigo-600 dark:text-indigo-400">{user.name}</span></div>
           <button onClick={onLogout} className="text-sm text-red-500 hover:text-red-600 font-medium cursor-pointer">Logout</button>
        </div>
        
        
        <Header 
          view={view} 
          setView={setView} 
          darkMode={darkMode} 
          setDarkMode={setDarkMode} 
        /> 

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <LearningForm onAdd={fetchLearnings} />
          </div>
          <div className="lg:col-span-2">
            {isLoading ? (
               <div className="text-center py-10 text-gray-500">Loading patterns...</div>
            ) : view === 'dashboard' ? (
              <Dashboard learnings={learnings} onReview={fetchLearnings} />
            ) : (
              <CalendarView learnings={learnings} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;