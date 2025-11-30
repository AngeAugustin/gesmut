/**
 * Liste des statuts de la fonction publique béninoise
 * Source: Statut général de la fonction publique du Bénin
 * Statuts administratifs et professionnels des agents
 */

export const statutsFonctionPublique = [
  // Statuts principaux
  { 
    code: 'STAT-001', 
    libelle: 'Titulaire', 
    description: 'Agent titulaire de la fonction publique - Statut permanent'
  },
  { 
    code: 'STAT-002', 
    libelle: 'Contractuel', 
    description: 'Agent contractuel - Contrat à durée déterminée ou indéterminée'
  },
  { 
    code: 'STAT-003', 
    libelle: 'Stagiaire', 
    description: 'Agent en stage - Période probatoire avant titularisation'
  },
  { 
    code: 'STAT-004', 
    libelle: 'Détaché', 
    description: 'Agent détaché - En mission dans une autre administration'
  },
  { 
    code: 'STAT-005', 
    libelle: 'Disponible', 
    description: 'Agent disponible - En attente d\'affectation'
  },
  { 
    code: 'STAT-006', 
    libelle: 'En Congé', 
    description: 'Agent en congé - Congé administratif, maladie, maternité, etc.'
  },
  { 
    code: 'STAT-007', 
    libelle: 'En Mission', 
    description: 'Agent en mission - Temporairement affecté à une mission'
  },
  { 
    code: 'STAT-008', 
    libelle: 'En Formation', 
    description: 'Agent en formation - Suivant une formation professionnelle'
  },
  { 
    code: 'STAT-009', 
    libelle: 'Suspendu', 
    description: 'Agent suspendu - Mesure disciplinaire temporaire'
  },
  { 
    code: 'STAT-010', 
    libelle: 'Radié', 
    description: 'Agent radié - Exclusion définitive de la fonction publique'
  },
  { 
    code: 'STAT-011', 
    libelle: 'Retraité', 
    description: 'Agent retraité - En retraite après service accompli'
  },
  { 
    code: 'STAT-012', 
    libelle: 'Démissionnaire', 
    description: 'Agent démissionnaire - A démissionné de la fonction publique'
  },
  { 
    code: 'STAT-013', 
    libelle: 'En Attente de Titularisation', 
    description: 'Agent en attente de titularisation - Après période de stage'
  },
  { 
    code: 'STAT-014', 
    libelle: 'Vacataire', 
    description: 'Agent vacataire - Prestation temporaire'
  },
  { 
    code: 'STAT-015', 
    libelle: 'Auxiliaire', 
    description: 'Agent auxiliaire - Personnel auxiliaire'
  },
];

/**
 * Fonction pour importer tous les statuts de la fonction publique béninoise
 * @param {Object} referentielsService - Service pour créer les statuts
 */
export const importerStatutsFonctionPublique = async (referentielsService) => {
  for (const statut of statutsFonctionPublique) {
    try {
      await referentielsService.createStatut(statut);
    } catch (error) {
      // Gérer les erreurs, par exemple si le statut existe déjà
      console.warn(`Le statut ${statut.libelle} existe déjà ou une erreur est survenue lors de l'importation.`);
    }
  }
};

