/**
 * Liste des grades de la fonction publique béninoise
 * Source: Statut général de la fonction publique du Bénin
 * Organisés par catégorie hiérarchique (niveau décroissant)
 */

export const gradesFonctionPublique = [
  // Catégorie A - Direction et Encadrement Supérieur
  { 
    code: 'A-001', 
    libelle: 'Directeur Général', 
    description: 'Grade de direction générale - Catégorie A',
    niveau: 1
  },
  { 
    code: 'A-002', 
    libelle: 'Directeur', 
    description: 'Grade de direction - Catégorie A',
    niveau: 2
  },
  { 
    code: 'A-003', 
    libelle: 'Directeur Adjoint', 
    description: 'Grade de direction adjoint - Catégorie A',
    niveau: 3
  },
  { 
    code: 'A-004', 
    libelle: 'Chef de Service', 
    description: 'Grade de chef de service - Catégorie A',
    niveau: 4
  },
  { 
    code: 'A-005', 
    libelle: 'Chef de Service Adjoint', 
    description: 'Grade de chef de service adjoint - Catégorie A',
    niveau: 5
  },
  { 
    code: 'A-006', 
    libelle: 'Chef de Bureau', 
    description: 'Grade de chef de bureau - Catégorie A',
    niveau: 6
  },
  { 
    code: 'A-007', 
    libelle: 'Chef de Bureau Adjoint', 
    description: 'Grade de chef de bureau adjoint - Catégorie A',
    niveau: 7
  },

  // Catégorie B - Encadrement Intermédiaire
  { 
    code: 'B-001', 
    libelle: 'Agent Principal', 
    description: 'Grade d\'agent principal - Catégorie B',
    niveau: 8
  },
  { 
    code: 'B-002', 
    libelle: 'Agent de 1ère Classe', 
    description: 'Grade d\'agent de première classe - Catégorie B',
    niveau: 9
  },
  { 
    code: 'B-003', 
    libelle: 'Agent de 2ème Classe', 
    description: 'Grade d\'agent de deuxième classe - Catégorie B',
    niveau: 10
  },
  { 
    code: 'B-004', 
    libelle: 'Agent', 
    description: 'Grade d\'agent - Catégorie B',
    niveau: 11
  },
  { 
    code: 'B-005', 
    libelle: 'Secrétaire Principal', 
    description: 'Grade de secrétaire principal - Catégorie B',
    niveau: 8
  },
  { 
    code: 'B-006', 
    libelle: 'Secrétaire de 1ère Classe', 
    description: 'Grade de secrétaire de première classe - Catégorie B',
    niveau: 9
  },
  { 
    code: 'B-007', 
    libelle: 'Secrétaire de 2ème Classe', 
    description: 'Grade de secrétaire de deuxième classe - Catégorie B',
    niveau: 10
  },
  { 
    code: 'B-008', 
    libelle: 'Secrétaire', 
    description: 'Grade de secrétaire - Catégorie B',
    niveau: 11
  },
  { 
    code: 'B-009', 
    libelle: 'Comptable Principal', 
    description: 'Grade de comptable principal - Catégorie B',
    niveau: 8
  },
  { 
    code: 'B-010', 
    libelle: 'Comptable', 
    description: 'Grade de comptable - Catégorie B',
    niveau: 9
  },
  { 
    code: 'B-011', 
    libelle: 'Technicien Principal', 
    description: 'Grade de technicien principal - Catégorie B',
    niveau: 8
  },
  { 
    code: 'B-012', 
    libelle: 'Technicien', 
    description: 'Grade de technicien - Catégorie B',
    niveau: 9
  },

  // Catégorie C - Exécution
  { 
    code: 'C-001', 
    libelle: 'Agent d\'Exécution Principal', 
    description: 'Grade d\'agent d\'exécution principal - Catégorie C',
    niveau: 12
  },
  { 
    code: 'C-002', 
    libelle: 'Agent d\'Exécution de 1ère Classe', 
    description: 'Grade d\'agent d\'exécution de première classe - Catégorie C',
    niveau: 13
  },
  { 
    code: 'C-003', 
    libelle: 'Agent d\'Exécution de 2ème Classe', 
    description: 'Grade d\'agent d\'exécution de deuxième classe - Catégorie C',
    niveau: 14
  },
  { 
    code: 'C-004', 
    libelle: 'Agent d\'Exécution', 
    description: 'Grade d\'agent d\'exécution - Catégorie C',
    niveau: 15
  },
  { 
    code: 'C-005', 
    libelle: 'Ouvrier Principal', 
    description: 'Grade d\'ouvrier principal - Catégorie C',
    niveau: 12
  },
  { 
    code: 'C-006', 
    libelle: 'Ouvrier de 1ère Classe', 
    description: 'Grade d\'ouvrier de première classe - Catégorie C',
    niveau: 13
  },
  { 
    code: 'C-007', 
    libelle: 'Ouvrier de 2ème Classe', 
    description: 'Grade d\'ouvrier de deuxième classe - Catégorie C',
    niveau: 14
  },
  { 
    code: 'C-008', 
    libelle: 'Ouvrier', 
    description: 'Grade d\'ouvrier - Catégorie C',
    niveau: 15
  },

  // Grades Spéciaux
  { 
    code: 'SP-001', 
    libelle: 'Stagiaire', 
    description: 'Grade de stagiaire - En formation',
    niveau: 16
  },
  { 
    code: 'SP-002', 
    libelle: 'Contractuel', 
    description: 'Grade contractuel - Personnel contractuel',
    niveau: 17
  },
];

/**
 * Fonction pour importer tous les grades de la fonction publique béninoise
 * @param {Object} referentielsService - Service pour créer les grades
 */
export const importerGradesFonctionPublique = async (referentielsService) => {
  for (const grade of gradesFonctionPublique) {
    try {
      await referentielsService.createGrade(grade);
    } catch (error) {
      // Gérer les erreurs, par exemple si le grade existe déjà
      console.warn(`Le grade ${grade.libelle} existe déjà ou une erreur est survenue lors de l'importation.`);
    }
  }
};

