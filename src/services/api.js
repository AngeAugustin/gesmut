import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Ne pas déconnecter si c'est une erreur de validation (comme email dupliqué)
      // Les erreurs de validation ont généralement un message spécifique
      const errorMessage = error.response?.data?.message || '';
      const isValidationError = errorMessage.includes('déjà utilisé') || 
                                errorMessage.includes('existe déjà') ||
                                errorMessage.includes('already exists');
      
      if (isValidationError) {
        // C'est une erreur de validation, ne pas déconnecter
        return Promise.reject(error);
      }
      
      // Ne pas rediriger si on est sur une page publique ou d'authentification
      const publicPaths = ['/', '/demande', '/suivi', '/auth/login', '/auth/register'];
      const currentPath = window.location.pathname;
      
      if (!publicPaths.includes(currentPath)) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
      }
    }
    // Ne pas rediriger automatiquement pour les erreurs 403 (Forbidden)
    // Laisser les composants gérer ces erreurs
    return Promise.reject(error);
  }
);

export default api;

