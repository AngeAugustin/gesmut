import api from './api';

export const referentielsService = {
  // Directions
  getDirections: () => api.get('/referentiels/directions'),
  createDirection: (data) => api.post('/referentiels/directions', data),
  updateDirection: (id, data) => api.patch(`/referentiels/directions/${id}`, data),
  deleteDirection: (id) => api.delete(`/referentiels/directions/${id}`),

  // Services
  getServices: () => api.get('/referentiels/services'),
  createService: (data) => api.post('/referentiels/services', data),
  updateService: (id, data) => api.patch(`/referentiels/services/${id}`, data),
  deleteService: (id) => api.delete(`/referentiels/services/${id}`),

  // Localités
  getLocalites: () => api.get('/referentiels/localites'),
  createLocalite: (data) => api.post('/referentiels/localites', data),
  updateLocalite: (id, data) => api.patch(`/referentiels/localites/${id}`, data),
  deleteLocalite: (id) => api.delete(`/referentiels/localites/${id}`),

  // Grades
  getGrades: () => api.get('/referentiels/grades'),
  createGrade: (data) => api.post('/referentiels/grades', data),
  updateGrade: (id, data) => api.patch(`/referentiels/grades/${id}`, data),
  deleteGrade: (id) => api.delete(`/referentiels/grades/${id}`),

  // Statuts
  getStatuts: () => api.get('/referentiels/statuts'),
  createStatut: (data) => api.post('/referentiels/statuts', data),
  updateStatut: (id, data) => api.patch(`/referentiels/statuts/${id}`, data),
  deleteStatut: (id) => api.delete(`/referentiels/statuts/${id}`),

  // Diplômes
  getDiplomes: () => api.get('/referentiels/diplomes'),
  createDiplome: (data) => api.post('/referentiels/diplomes', data),
  updateDiplome: (id, data) => api.patch(`/referentiels/diplomes/${id}`, data),
  deleteDiplome: (id) => api.delete(`/referentiels/diplomes/${id}`),

  // Compétences
  getCompetences: () => api.get('/referentiels/competences'),
  createCompetence: (data) => api.post('/referentiels/competences', data),
  updateCompetence: (id, data) => api.patch(`/referentiels/competences/${id}`, data),
  deleteCompetence: (id) => api.delete(`/referentiels/competences/${id}`),
};
