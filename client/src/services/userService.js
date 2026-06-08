import httpClient from '../api/httpClient.js';

export const userService = {
  async getUsers(params = {}) {
    const { data } = await httpClient.get('/users', { params });
    return data.data.users;
  },

  async getAssignees() {
    const { data } = await httpClient.get('/users/assignees');
    return data.data.users;
  },

  async createUser(payload) {
    const { data } = await httpClient.post('/users', payload);
    return data.data.user;
  },

  async updateUser(id, payload) {
    const { data } = await httpClient.patch(`/users/${id}`, payload);
    return data.data.user;
  },

  async deleteUser(id) {
    const { data } = await httpClient.delete(`/users/${id}`);
    return data;
  },
};
