/* eslint-disable no-constant-binary-expression */
import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance
const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api` || 'http://localhost:7000/api',
  // baseURL: import.meta.env.VITE_API_URL || 'http://localhost:7000/api',
  timeout: 30000, 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log(`Setting Authorization header with token: ${token.substring(0, 10)}...`); // Debug log
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('No token found in localStorage for request:', config.url);
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      toast.error('Request timed out. Please try again.');
      return Promise.reject(error);
    }
    
    if (error.response) {
      const { status, data } = error.response;
      console.log(`Response error [${status}]:`, data); // Debug log
      
      switch (status) {
        case 401:
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          if (!window.location.pathname.includes('/login') && 
              !window.location.pathname.includes('/register')) {
            toast.error('Session expired. Please login again.');
            setTimeout(() => {
              window.location.href = '/login';
            }, 1500);
          }
          break;
          
        case 403:
          toast.error('Access denied. You don\'t have permission for this action.');
          break;
          
        case 404:
          toast.error('Requested resource not found.');
          break;
          
        case 422:
          if (data.errors && Array.isArray(data.errors)) {
            data.errors.forEach(err => {
              toast.error(`${err.field}: ${err.message}`);
            });
          } else {
            toast.error(data.message || 'Validation failed');
          }
          break;
          
        case 429:
          toast.error('Too many requests. Please try again later.');
          break;
          
        case 500:
          toast.error('Server error. Please try again later.');
          break;
          
        default:
          toast.error(data.message || 'An unexpected error occurred');
      }
    } else if (error.request) {
      toast.error('Network error. Please check your connection.');
    } else {
      toast.error('An unexpected error occurred');
    }
    
    return Promise.reject(error);
  }
);

export default api;