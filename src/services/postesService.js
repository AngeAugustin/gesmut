import api from './api';

export const postesService = {
  getAll: () => api.get('/postes'),
  getById: (id) => api.get(`/postes/${id}`),
  getLibres: () => api.get('/postes/libres'),
  getCritiques: () => api.get('/postes/critiques'),
  getByService: (serviceId) => api.get(`/postes/service/${serviceId}`),
  getHistoriqueAgents: (id) => api.get(`/postes/${id}/historique-agents`),
  create: (data) => api.post('/postes', data),
  update: (id, data) => api.patch(`/postes/${id}`, data),
  affecterAgent: (id, agentId) => api.post(`/postes/${id}/affecter`, { agentId }),
  liberer: (id) => api.post(`/postes/${id}/liberer`),
  delete: (id) => api.delete(`/postes/${id}`),
};

