import api from './api';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// Instance axios publique pour les appels sans authentification
const publicApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const agentsService = {
  getAll: () => api.get('/agents'),
  getById: (id) => api.get(`/agents/${id}`),
  getAnciennete: (id) => api.get(`/agents/${id}/anciennete`),
  getResponsables: (id) => api.get(`/agents/${id}/responsables`),
  create: (data) => api.post('/agents', data),
  update: (id, data) => api.patch(`/agents/${id}`, data),
  delete: (id) => api.delete(`/agents/${id}`),
  findEligibles: (criteres) => api.post('/agents/eligibles', criteres),
  findByMatriculePublic: (matricule) => publicApi.get(`/agents/public/search/matricule/${matricule}`),
  findByIdentifierPublic: (type, value) => publicApi.get(`/agents/public/search/${type}/${value}`),
  getAllAffectations: () => api.get('/agents/affectations/all'),
};

