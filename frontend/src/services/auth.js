import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const authService = {
  login: async (email, password) => {
    const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  register: async (name, email, password, role = 'user') => {
    const { data } = await axios.post(`${API_URL}/auth/register`, { name, email, password, role });
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    return data;
  },

  logout: async () => {
    // Clear frontend state immediately so navigation doesn't bounce back
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    try {
      await axios.post(`${API_URL}/auth/logout`);
    } catch (e) {
      console.error('Backend logout failed', e);
    }
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  getToken: () => {
    return localStorage.getItem('token');
  }
};

// Setup Axios Interceptor to auto-attach token
axios.interceptors.request.use((config) => {
  const token = authService.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
