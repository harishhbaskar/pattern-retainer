import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '../api/axios';



const Register = ({ setUser }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { name, email, password, confirmPassword } = formData;

  const handleChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      
      // const res = await axios.post('http://localhost:5000/api/users', {
      const res = await api.post('/users', {
            name,
            email,
            password,
          });

      localStorage.setItem('user', JSON.stringify(res.data));
      setUser(res.data);
      
      navigate('/');
    } catch (err) {
      
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-md w-96 border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white text-center">Create Account</h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm mb-4 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={handleChange}
              className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={password}
              onChange={handleChange}
              className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={confirmPassword}
              onChange={handleChange}
              className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg transition-colors shadow-md mt-2 cursor-pointer"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-6 text-sm text-center text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;