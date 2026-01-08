import axios from 'axios';
import { useAuthStore } from '../stores/useAuthStore';
import { Platform } from 'react-native';

// Use 10.0.2.2 for Android Emulator to access host localhost
// Use localhost for iOS Simulator
const BASE_URL = Platform.OS === 'android' 
  ? 'http://192.168.0.122:5000/api' 
  : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized (e.g., logout)
      // useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);

export default api;
