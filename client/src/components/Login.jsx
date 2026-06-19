import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios.js'



const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // const res = await axios.post('http://localhost:5000/api/users/login', { email, password });
      const res = await api.post('/users/login', { email, password });
      
      localStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
      navigate('/'); // Go to dashboard
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md w-96 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Login</h2>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
          <input 
            type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 rounded border dark:bg-gray-700 dark:text-white dark:border-gray-600"
          />
          <button className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">Login</button>
        </form>
        <p className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
          New here? <Link to="/register" className="text-indigo-500">Sign up</Link>
        </p>
      </div>
    </div>
  );
};
export default Login;