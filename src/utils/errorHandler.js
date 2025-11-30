/**
 * Extrait un message d'erreur lisible depuis une réponse d'erreur axios
 * @param {Error} error - L'erreur axios
 * @returns {string} - Message d'erreur formaté pour l'utilisateur
 */
export const getErrorMessage = (error) => {
  if (!error) {
    return 'Une erreur inattendue est survenue';
  }

  // Si c'est une réponse HTTP avec des données structurées
  if (error.response?.data) {
    const data = error.response.data;

    // Format de réponse structuré du backend
    if (data.details?.message) {
      return data.details.message;
    }

    if (data.details?.field) {
      const fieldName = data.details.field;
      const fieldLabel = getFieldLabel(fieldName);
      return `Le ${fieldLabel} que vous avez saisi existe déjà. Veuillez utiliser une valeur différente.`;
    }

    if (data.message) {
      return data.message;
    }

    // Gestion des erreurs de validation
    if (Array.isArray(data.message)) {
      return data.message.join(', ');
    }
  }

  // Message d'erreur générique
  if (error.message) {
    return error.message;
  }

  return 'Une erreur est survenue lors de l\'opération';
};

/**
 * Obtient un libellé lisible pour un champ
 */
const getFieldLabel = (fieldName) => {
  const labels = {
    code: 'code',
    libelle: 'libellé',
    matricule: 'matricule',
    email: 'email',
    nom: 'nom',
    prenom: 'prénom',
  };

  return labels[fieldName] || fieldName;
};

/**
 * Extrait les détails de l'erreur pour un affichage plus détaillé
 * @param {Error} error - L'erreur axios
 * @returns {Object} - Détails de l'erreur
 */
export const getErrorDetails = (error) => {
  if (error.response?.data) {
    return {
      statusCode: error.response.status,
      message: error.response.data.message,
      details: error.response.data.details,
      timestamp: error.response.data.timestamp,
    };
  }

  return null;
};

