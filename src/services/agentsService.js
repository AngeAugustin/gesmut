import api from './api';

export const agentsService = {
  getAll: () => api.get('/agents'),
  getById: (id) => api.get(`/agents/${id}`),
  getAnciennete: (id) => api.get(`/agents/${id}/anciennete`),
  getResponsables: (id) => api.get(`/agents/${id}/responsables`),
  create: (data) => api.post('/agents', data),
  update: (id, data) => api.patch(`/agents/${id}`, data),
  delete: (id) => api.delete(`/agents/${id}`),
  findEligibles: (criteres) => api.post('/agents/eligibles', criteres),
};

