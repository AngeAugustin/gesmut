import api from './api';

import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// API publique pour les documents (sans authentification)
const publicApi = axios.create({
  baseURL: API_URL,
});

export const documentsService = {
  getAll: () => api.get('/documents'),
  getById: (id) => api.get(`/documents/${id}`),
  findByDemande: (demandeId) => api.get(`/documents/demande/${demandeId}`),
  // Méthode publique pour récupérer les documents d'une demande (sans authentification)
  findPublicByDemande: (demandeId) => publicApi.get(`/documents/public/demande/${demandeId}`),
  create: (data) => api.post('/documents', data),
  signer: (id, signatureImageId) => api.post(`/documents/${id}/signer`, { signatureImageId }),
  downloadTestDocument: (type) => {
    return api.get(`/documents/test/${type}`, {
      responseType: 'blob',
    });
  },
  generateDocument: (type, demandeId) => {
    return api.post(`/documents/generate/${type}/${demandeId}`, {}, {
      responseType: 'blob',
    });
  },
  downloadDocument: (id) => {
    return api.get(`/documents/${id}/download`, {
      responseType: 'blob',
    });
  },
  // Méthode publique pour télécharger un document (sans authentification)
  downloadPublicDocument: (id) => {
    return publicApi.get(`/documents/public/${id}/download`, {
      responseType: 'blob',
    });
  },
};

