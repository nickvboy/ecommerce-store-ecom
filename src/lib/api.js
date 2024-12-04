import axios from 'axios';

// Function to get the API URL based on the current environment and domain
const getApiUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    return '/api';
  }

  // Check if we're accessing through playit.gg
  if (window.location.hostname.includes('.gl.at.ply.gg')) {
    // Extract the first part of the hostname (the random subdomain)
    const subdomain = window.location.hostname.split('.')[0];
    // Replace 'variety-circle' with 'movies-treated' in the subdomain
    const apiSubdomain = subdomain.replace(/^[\w-]+/, 'movies-treated');
    return `http://${apiSubdomain}.gl.at.ply.gg:16505/api`;
  }

  // Default to localhost
  return 'http://localhost:5000/api';
};

const api = axios.create({
  baseURL: getApiUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api; 