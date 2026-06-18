import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../constants/config';

const api = axios.create({
  baseURL: API_URL,
  timeout: 45000
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

export const authApi = {
  register: (data) => api.post('/api/auth/register', data),
  login: (data) => api.post('/api/auth/login', data),
  updateProfile: (data) => api.put('/api/auth/update', data),
  deleteAccount: () => api.delete('/api/auth/delete')
};

export const listingsApi = {
  getAll: () => api.get('/api/arabalar'),
  create: (formData) => api.post('/api/arabalar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => api.put(`/api/arabalar/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  remove: (id) => api.delete(`/api/arabalar/${id}`)
};

export default api;
