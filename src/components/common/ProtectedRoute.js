import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (allowedRoles.length > 0) {
    // Gérer les rôles multiples : vérifier si l'utilisateur a au moins un des rôles autorisés
    const userRoles = user.roles && Array.isArray(user.roles) && user.roles.length > 0
      ? user.roles
      : user.role
        ? [user.role]
        : [];
    const hasAccess = allowedRoles.some(role => userRoles.includes(role));
    
    if (!hasAccess) {
      console.warn('ProtectedRoute: Accès refusé', {
        userRoles: userRoles,
        allowedRoles,
        userId: user.id,
      });
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

