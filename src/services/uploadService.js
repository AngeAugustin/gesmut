import api from './api';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

// API publique pour l'upload (sans authentification)
const publicApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export const uploadService = {
  uploadFile: async (file, isPublic = false) => {
    const formData = new FormData();
    formData.append('file', file);
    
    // Utiliser l'API publique si on est sur une page publique
    const apiToUse = isPublic ? publicApi : api;
    
    const response = await apiToUse.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getFile: (fileId) => {
    return `${API_URL}/upload/${fileId}`;
  },

  getFileUrl: (fileId) => {
    if (!fileId) return null;
    return `${API_URL}/upload/${fileId}`;
  },

  deleteFile: (fileId) => api.delete(`/upload/${fileId}`),
};
