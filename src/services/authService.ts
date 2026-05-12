import api from './api';

export const login = async (email: string, password: string) => {
  const response = await api.post('/auth/login', { email, password });
  if (response.data.status === 'success') {
    localStorage.setItem('token', response.data.data.token);
  }
  return response.data;
};

export const register = async (data: { nama: string, email: string, password: string }) => {
  const response = await api.post('/auth/register', data);
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data.data.user;
};


export const updateProfile = async (data: { uangBulanan: number }) => {
  const response = await api.put('/auth/profile', data);
  return response.data.data.user;
};
