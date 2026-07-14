import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL || (typeof API_URL === 'string' && !API_URL.trim())) {
  throw new Error('Missing VITE_API_URL environment variable');
}


const api = axios.create({
  baseURL: API_URL,
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    // Check localStorage for the user object
    const userStr = localStorage.getItem('user');

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        // If a token exists, attach it to the headers
        if (user?.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (error) {
        console.error("Error parsing user from local storage", error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Response Interceptor (to handle 401s automatically)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional: Logic to logout user if token expires
      // localStorage.removeItem('user');
      // window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default api;