import httpClient from '../api/httpClient.js';

export const ticketService = {
  async getTickets(params = {}) {
    const { data } = await httpClient.get('/tickets', { params });
    return data.data.tickets;
  },

  async getTicketDetails(id) {
    const { data } = await httpClient.get(`/tickets/${id}/details`);
    return data.data.ticket;
  },

  async createTicket(payload) {
    const { data } = await httpClient.post('/tickets', payload);
    return data.data.ticket;
  },

  async updateTicket(id, payload) {
    const { data } = await httpClient.patch(`/tickets/${id}`, payload);
    return data.data.ticket;
  },

  async deleteTicket(id) {
    const { data } = await httpClient.delete(`/tickets/${id}`);
    return data;
  },

  async addComment(ticketId, payload) {
    const { data } = await httpClient.post(`/tickets/${ticketId}/comments`, payload);
    return data.data.comment;
  },

  async uploadAttachment(ticketId, file) {
    const formData = new FormData();
    formData.append('file', file);

    const { data } = await httpClient.post(`/tickets/${ticketId}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data.attachment;
  },

  async downloadAttachment(ticketId, attachment) {
    const response = await httpClient.get(`/tickets/${ticketId}/attachments/${attachment.id}/download`, {
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', attachment.originalName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};
