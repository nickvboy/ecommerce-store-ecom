import axios from 'axios';

// Get the appropriate API URL based on environment
const API_URL = process.env.NODE_ENV === 'production' 
  ? process.env.REACT_APP_API_URL_REMOTE 
  : process.env.REACT_APP_API_URL_LOCAL;

console.log('Current API URL:', API_URL); // Debug log
console.log('Environment:', process.env.NODE_ENV); // Debug log
console.log('Local URL:', process.env.REACT_APP_API_URL_LOCAL); // Debug log
console.log('Remote URL:', process.env.REACT_APP_API_URL_REMOTE); // Debug log

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Log each request for debugging
api.interceptors.request.use(config => {
  console.log('Making request to:', config.baseURL + config.url);
  return config;
});

// Add request interceptor for auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api; 