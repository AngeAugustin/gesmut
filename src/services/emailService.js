import api from './api';

/**
 * Service pour envoyer des emails via le backend (Resend)
 */
export const emailService = {
  /**
   * Envoie les documents de décision finale à l'agent
   * @param {Object} params - Paramètres
   * @param {string} params.agentEmail - Email de l'agent
   * @param {string} params.agentName - Nom complet de l'agent
   * @param {string} params.decision - Décision (ACCEPTEE ou REJETEE)
   * @param {Array<{name: string, buffer: Buffer}>} params.documents - Documents PDF à envoyer (en Buffer)
   * @returns {Promise} Promise qui se résout avec la réponse
   */
  sendDecisionDocuments: async ({ agentEmail, agentName, decision, documents = [] }) => {
    // Convertir les Blobs/ArrayBuffers en base64 pour l'envoi
    const documentsBase64 = await Promise.all(
      documents.map(async (doc) => {
        // Convertir en base64 selon le type
        let base64;
        if (doc.data instanceof Blob) {
          const arrayBuffer = await doc.data.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          const binary = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
          base64 = btoa(binary);
        } else if (doc.data instanceof ArrayBuffer) {
          const bytes = new Uint8Array(doc.data);
          const binary = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
          base64 = btoa(binary);
        } else if (doc.data && typeof doc.data === 'object' && doc.data.type === 'Buffer') {
          // Si c'est déjà un Buffer Node.js sérialisé
          const bytes = new Uint8Array(doc.data.data);
          const binary = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
          base64 = btoa(binary);
        } else {
          // Supposer que c'est déjà une string base64
          base64 = doc.data;
        }
        
        return {
          name: doc.name,
          buffer: base64,
        };
      })
    );

    return api.post('/email/send-decision-documents', {
      agentEmail,
      agentName,
      decision,
      documents: documentsBase64,
    });
  },
};

export default emailService;
