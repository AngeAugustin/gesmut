import api from './api';

export const notificationsService = {
  getAll: () => api.get('/notifications'),
  getMesNotifications: () => api.get('/notifications'), // L'endpoint /notifications retourne déjà les notifications de l'utilisateur connecté
  getCount: () => api.get('/notifications/count'),
  marquerCommeLue: (id) => api.patch(`/notifications/${id}/lu`),
  marquerToutesCommeLues: () => api.patch('/notifications/marquer-toutes-lues'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

