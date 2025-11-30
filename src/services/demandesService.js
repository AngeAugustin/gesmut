import api from './api';

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const publicApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const demandesService = {
  getAll: () => api.get('/demandes'),
  getById: (id) => api.get(`/demandes/${id}`),
  getMesDemandes: () => api.get('/demandes/mes-demandes'),
  getDemandesPourResponsable: () => api.get('/demandes/responsable/mes-demandes'),
  create: (data) => api.post('/demandes', data),
  createPublic: (data) => publicApi.post('/demandes/public', data), // Endpoint public sans authentification
  update: (id, data) => api.patch(`/demandes/${id}`, data),
  soumettre: (id) => api.put(`/demandes/${id}/soumettre`),
  createStrategique: (data) => api.post('/demandes/strategique', data),
  delete: (id) => api.delete(`/demandes/${id}`),
};

