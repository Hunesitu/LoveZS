import axios from 'axios';

// 生产环境使用相对路径，开发环境使用环境变量
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? '/api'  // 相对路径，由nginx代理到后端
  : (process.env.REACT_APP_API_URL || 'http://localhost:5000/api');

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export default api;
