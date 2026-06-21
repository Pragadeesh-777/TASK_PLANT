import axios from 'axios';

// Create central Axios instance pointing to Express server
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject token automatically on every outgoing HTTP request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch authorization expiry or failures globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // If unauthorized, clear invalid token automatically
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      // Let React contexts or handlers redirect to login if necessary
    }
    return Promise.reject(error);
  }
);

export default API;
