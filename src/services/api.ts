import axios from 'axios';

const api = axios.create({
  baseURL: 'https://spendify-backend.vercel.app/api',
});

// Interceptor untuk menambahkan Token JWT ke setiap request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
