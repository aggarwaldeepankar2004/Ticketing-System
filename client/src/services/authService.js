import httpClient from '../api/httpClient.js';

export const authService = {
  async login(payload) {
    const { data } = await httpClient.post('/auth/login', payload);
    return data.data;
  },

  async register(payload) {
    const { data } = await httpClient.post('/auth/register', payload);
    return data.data;
  },

  async getCurrentUser() {
    const { data } = await httpClient.get('/auth/me');
    return data.data.user;
  },

  async logout() {
    await httpClient.post('/auth/logout');
  },
};
