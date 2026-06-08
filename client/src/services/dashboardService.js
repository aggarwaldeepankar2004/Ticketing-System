import httpClient from '../api/httpClient.js';

export const dashboardService = {
  async getAnalytics() {
    const { data } = await httpClient.get('/dashboard/analytics');
    return data.data;
  },
};
