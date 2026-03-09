import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Retained legacy boundary: remote auth still uses the old API even though
// the rest of the app is primarily local-first.
const api = axios.create({
  baseURL: "https://restaurantapp-api-production.up.railway.app/api/v1",
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
