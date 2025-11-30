/**
 * Liste des compétences de la fonction publique béninoise
 * Source: Référentiel de compétences de la fonction publique
 * Organisées par catégorie (A: Direction & Expertise, B: Intermédiaire, C: Exécution)
 */

export const competencesFonctionPublique = [
  // Catégorie A - Direction & Expertise
  { 
    code: 'COMP-A-001', 
    libelle: 'Direction et Management', 
    description: 'Compétences en direction d\'équipe et management stratégique',
    categorie: 'A'
  },
  { 
    code: 'COMP-A-002', 
    libelle: 'Gestion Stratégique', 
    description: 'Compétences en gestion stratégique et planification',
    categorie: 'A'
  },
  { 
    code: 'COMP-A-003', 
    libelle: 'Gestion Financière', 
    description: 'Compétences en gestion financière et budgétaire',
    categorie: 'A'
  },
  { 
    code: 'COMP-A-004', 
    libelle: 'Gestion des Ressources Humaines', 
    description: 'Compétences en gestion des ressources humaines',
    categorie: 'A'
  },
  { 
    code: 'COMP-A-005', 
    libelle: 'Gestion de Projet', 
    description: 'Compétences en gestion et pilotage de projets',
    categorie: 'A'
  },
  { 
    code: 'COMP-A-006', 
    libelle: 'Audit et Contrôle', 
    description: 'Compétences en audit interne et contrôle de gestion',
    categorie: 'A'
  },
  { 
    code: 'COMP-A-007', 
    libelle: 'Expertise Juridique', 
    description: 'Compétences en droit administratif et juridique',
    categorie: 'A'
  },
  { 
    code: 'COMP-A-008', 
    libelle: 'Expertise Comptable', 
    description: 'Compétences en comptabilité approfondie et expertise comptable',
    categorie: 'A'
  },
  { 
    code: 'COMP-A-009', 
    libelle: 'Expertise Technique', 
    description: 'Compétences techniques avancées et expertise métier',
    categorie: 'A'
  },
  { 
    code: 'COMP-A-010', 
    libelle: 'Négociation', 
    description: 'Compétences en négociation et relations partenariales',
    categorie: 'A'
  },
  { 
    code: 'COMP-A-011', 
    libelle: 'Communication Institutionnelle', 
    description: 'Compétences en communication institutionnelle et relations publiques',
    categorie: 'A'
  },
  { 
    code: 'COMP-A-012', 
    libelle: 'Analyse et Études', 
    description: 'Compétences en analyse stratégique et études approfondies',
    categorie: 'A'
  },

  // Catégorie B - Intermédiaire
  { 
    code: 'COMP-B-001', 
    libelle: 'Comptabilité Générale', 
    description: 'Compétences en comptabilité générale et tenue de comptes',
    categorie: 'B'
  },
  { 
    code: 'COMP-B-002', 
    libelle: 'Gestion Administrative', 
    description: 'Compétences en gestion administrative et suivi des dossiers',
    categorie: 'B'
  },
  { 
    code: 'COMP-B-003', 
    libelle: 'Informatique Bureautique', 
    description: 'Compétences en outils bureautiques (Word, Excel, PowerPoint)',
    categorie: 'B'
  },
  { 
    code: 'COMP-B-004', 
    libelle: 'Gestion de Base de Données', 
    description: 'Compétences en gestion et exploitation de bases de données',
    categorie: 'B'
  },
  { 
    code: 'COMP-B-005', 
    libelle: 'Communication', 
    description: 'Compétences en communication écrite et orale',
    categorie: 'B'
  },
  { 
    code: 'COMP-B-006', 
    libelle: 'Rédaction Administrative', 
    description: 'Compétences en rédaction de documents administratifs',
    categorie: 'B'
  },
  { 
    code: 'COMP-B-007', 
    libelle: 'Gestion de la Paie', 
    description: 'Compétences en gestion de la paie et des rémunérations',
    categorie: 'B'
  },
  { 
    code: 'COMP-B-008', 
    libelle: 'Suivi et Reporting', 
    description: 'Compétences en suivi d\'activités et reporting',
    categorie: 'B'
  },
  { 
    code: 'COMP-B-009', 
    libelle: 'Gestion des Stocks', 
    description: 'Compétences en gestion des stocks et inventaires',
    categorie: 'B'
  },
  { 
    code: 'COMP-B-010', 
    libelle: 'Organisation d\'Événements', 
    description: 'Compétences en organisation et logistique d\'événements',
    categorie: 'B'
  },
  { 
    code: 'COMP-B-011', 
    libelle: 'Assistance Technique', 
    description: 'Compétences en assistance technique et support',
    categorie: 'B'
  },
  { 
    code: 'COMP-B-012', 
    libelle: 'Gestion Documentaire', 
    description: 'Compétences en gestion et archivage documentaire',
    categorie: 'B'
  },
  { 
    code: 'COMP-B-013', 
    libelle: 'Formation', 
    description: 'Compétences en animation et formation',
    categorie: 'B'
  },
  { 
    code: 'COMP-B-014', 
    libelle: 'Gestion des Achats', 
    description: 'Compétences en gestion des achats et approvisionnements',
    categorie: 'B'
  },
  { 
    code: 'COMP-B-015', 
    libelle: 'Gestion des Contrats', 
    description: 'Compétences en gestion et suivi des contrats',
    categorie: 'B'
  },

  // Catégorie C - Exécution
  { 
    code: 'COMP-C-001', 
    libelle: 'Saisie de Données', 
    description: 'Compétences en saisie et traitement de données',
    categorie: 'C'
  },
  { 
    code: 'COMP-C-002', 
    libelle: 'Accueil et Standard', 
    description: 'Compétences en accueil physique et téléphonique',
    categorie: 'C'
  },
  { 
    code: 'COMP-C-003', 
    libelle: 'Classement et Archivage', 
    description: 'Compétences en classement et archivage de documents',
    categorie: 'C'
  },
  { 
    code: 'COMP-C-004', 
    libelle: 'Reproduction et Impression', 
    description: 'Compétences en reproduction et impression de documents',
    categorie: 'C'
  },
  { 
    code: 'COMP-C-005', 
    libelle: 'Distribution du Courrier', 
    description: 'Compétences en distribution et gestion du courrier',
    categorie: 'C'
  },
  { 
    code: 'COMP-C-006', 
    libelle: 'Maintenance des Locaux', 
    description: 'Compétences en entretien et maintenance des locaux',
    categorie: 'C'
  },
  { 
    code: 'COMP-C-007', 
    libelle: 'Conduite de Véhicule', 
    description: 'Compétences en conduite de véhicule de service',
    categorie: 'C'
  },
  { 
    code: 'COMP-C-008', 
    libelle: 'Manutention', 
    description: 'Compétences en manutention et logistique',
    categorie: 'C'
  },
  { 
    code: 'COMP-C-009', 
    libelle: 'Secrétariat de Base', 
    description: 'Compétences en secrétariat et assistance administrative de base',
    categorie: 'C'
  },
  { 
    code: 'COMP-C-010', 
    libelle: 'Surveillance et Sécurité', 
    description: 'Compétences en surveillance et sécurité des locaux',
    categorie: 'C'
  },
];

/**
 * Fonction pour importer toutes les compétences de la fonction publique béninoise
 * @param {Object} referentielsService - Service pour créer les compétences
 */
export const importerCompetencesFonctionPublique = async (referentielsService) => {
  for (const competence of competencesFonctionPublique) {
    try {
      await referentielsService.createCompetence(competence);
    } catch (error) {
      // Gérer les erreurs, par exemple si la compétence existe déjà
      console.warn(`La compétence ${competence.libelle} existe déjà ou une erreur est survenue lors de l'importation.`);
    }
  }
};

