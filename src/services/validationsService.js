import api from './api';

export const validationsService = {
  getAll: () => api.get('/validations'),
  getById: (id) => api.get(`/validations/${id}`),
  getByDemande: (demandeId) => api.get(`/validations/demande/${demandeId}`),
  create: (data) => api.post('/validations', data),
};

