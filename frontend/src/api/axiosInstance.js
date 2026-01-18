import axios from 'axios';

// This is the bridge to your FastAPI backend
const API = axios.create({
  baseURL: 'http://127.0.0.1:8000', // Default FastAPI address
});

// This automatically adds your "Security Token" to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default API;