import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL || !API_URL.trim()) {
  throw new Error("Missing EXPO_PUBLIC_API_URL environment variable. Check your eas.json or .env");
}

const api = axios.create({
  baseURL: API_URL,
});


api.interceptors.request.use(
  async (config) => {
    const user = await AsyncStorage.getItem('user');
    if (user) {
      const { token } = JSON.parse(user);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;