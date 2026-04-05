import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001',
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['x-auth-token'] = token;
    return;
  }

  delete api.defaults.headers.common['x-auth-token'];
};

export default api;
