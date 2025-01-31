import axios from 'axios';

// Helper to get current subdomain
export const getSubdomain = () => {
  const host = window.location.host; // Gets full host including port
  const hostname = window.location.hostname;

  // Local development with subdomain
  if (host.includes('.localhost:')) {
    return host.split('.')[0];
  }
  
  // Production
  const parts = hostname.split('.');
  return parts.length > 2 ? parts[0] : '';
};

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const subdomain = getSubdomain();
  console.log('Current subdomain for API request:', subdomain);
  
  // If we have a subdomain, modify the baseURL
  if (subdomain) {
    if (window.location.hostname.includes('localhost')) {
      // For local development, keep the port (8000) from VITE_API_URL
      const apiPort = new URL(import.meta.env.VITE_API_URL).port || '8000';
      config.baseURL = `http://${subdomain}.localhost:${apiPort}`;
    } else {
      config.baseURL = `https://${subdomain}.${import.meta.env.VITE_API_DOMAIN}`;
    }
  }

  console.log('Final API URL:', config.baseURL);

  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    throw error;
  }
);

export default api;