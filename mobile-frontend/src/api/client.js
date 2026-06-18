import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../constants/config';

const api = axios.create({
  baseURL: API_URL,
  timeout: 60000
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

async function requestWithRetry(requestFn, retries = 2) {
  let lastError;
  for (let i = 0; i <= retries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      const retryable = !error.response || error.response.status >= 500 || error.code === 'ECONNABORTED';
      if (!retryable || i === retries) break;
      await new Promise((r) => setTimeout(r, 2000 * (i + 1)));
    }
  }
  throw lastError;
}

export const authApi = {
  register: (data) => requestWithRetry(() => api.post('/api/auth/register', data)),
  login: (data) => requestWithRetry(() => api.post('/api/auth/login', data)),
  updateProfile: (data) => api.put('/api/auth/update', data),
  deleteAccount: () => api.delete('/api/auth/delete')
};

export const listingsApi = {
  getAll: () => requestWithRetry(() => api.get('/api/arabalar')),
  create: (formData) => api.post('/api/arabalar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => api.put(`/api/arabalar/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  remove: (id) => api.delete(`/api/arabalar/${id}`)
};

export default api;
