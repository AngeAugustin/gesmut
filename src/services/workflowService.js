import api from './api';

export const workflowService = {
  getActiveWorkflow: () => api.get('/workflow'),
  createWorkflow: (data) => api.post('/workflow', data),
  updateWorkflow: (id, data) => api.patch(`/workflow/${id}`, data),
};

