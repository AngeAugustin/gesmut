/**
 * Liste des diplômes du système éducatif béninois
 * Source: Système éducatif du Bénin
 * Organisés par niveau (du plus bas au plus élevé)
 */

export const diplomesBenin = [
  // Niveau Primaire
  { 
    code: 'DIP-001', 
    libelle: 'CEP (Certificat d\'Études Primaires)', 
    description: 'Certificat d\'Études Primaires - Niveau primaire',
    niveau: 'PRIMAIRE'
  },
  
  // Niveau Secondaire - Premier Cycle
  { 
    code: 'DIP-002', 
    libelle: 'BEPC (Brevet d\'Études du Premier Cycle)', 
    description: 'Brevet d\'Études du Premier Cycle - Niveau secondaire premier cycle',
    niveau: 'SECONDAIRE_1'
  },
  { 
    code: 'DIP-003', 
    libelle: 'CAP (Certificat d\'Aptitude Professionnelle)', 
    description: 'Certificat d\'Aptitude Professionnelle - Formation professionnelle',
    niveau: 'SECONDAIRE_1'
  },
  
  // Niveau Secondaire - Second Cycle
  { 
    code: 'DIP-004', 
    libelle: 'BAC (Baccalauréat)', 
    description: 'Baccalauréat - Niveau secondaire second cycle',
    niveau: 'SECONDAIRE_2'
  },
  { 
    code: 'DIP-005', 
    libelle: 'BAC Technique', 
    description: 'Baccalauréat Technique - Niveau secondaire technique',
    niveau: 'SECONDAIRE_2'
  },
  { 
    code: 'DIP-006', 
    libelle: 'BAC Professionnel', 
    description: 'Baccalauréat Professionnel - Formation professionnelle',
    niveau: 'SECONDAIRE_2'
  },
  { 
    code: 'DIP-007', 
    libelle: 'BT (Brevet de Technicien)', 
    description: 'Brevet de Technicien - Formation technique',
    niveau: 'SECONDAIRE_2'
  },
  
  // Niveau Supérieur - Court
  { 
    code: 'DIP-008', 
    libelle: 'BTS (Brevet de Technicien Supérieur)', 
    description: 'Brevet de Technicien Supérieur - Niveau supérieur court',
    niveau: 'SUPERIEUR_COURT'
  },
  { 
    code: 'DIP-009', 
    libelle: 'DUT (Diplôme Universitaire de Technologie)', 
    description: 'Diplôme Universitaire de Technologie - Niveau supérieur court',
    niveau: 'SUPERIEUR_COURT'
  },
  { 
    code: 'DIP-010', 
    libelle: 'DEUG (Diplôme d\'Études Universitaires Générales)', 
    description: 'Diplôme d\'Études Universitaires Générales - Niveau supérieur court',
    niveau: 'SUPERIEUR_COURT'
  },
  
  // Niveau Supérieur - Long - Licence
  { 
    code: 'DIP-011', 
    libelle: 'Licence', 
    description: 'Licence - Niveau supérieur long (Bac+3)',
    niveau: 'LICENCE'
  },
  { 
    code: 'DIP-012', 
    libelle: 'Licence Professionnelle', 
    description: 'Licence Professionnelle - Niveau supérieur professionnel (Bac+3)',
    niveau: 'LICENCE'
  },
  { 
    code: 'DIP-013', 
    libelle: 'Maîtrise', 
    description: 'Maîtrise - Niveau supérieur long (Bac+4)',
    niveau: 'MAITRISE'
  },
  
  // Niveau Supérieur - Long - Master
  { 
    code: 'DIP-014', 
    libelle: 'Master', 
    description: 'Master - Niveau supérieur long (Bac+5)',
    niveau: 'MASTER'
  },
  { 
    code: 'DIP-015', 
    libelle: 'Master Professionnel', 
    description: 'Master Professionnel - Niveau supérieur professionnel (Bac+5)',
    niveau: 'MASTER'
  },
  { 
    code: 'DIP-016', 
    libelle: 'Master Recherche', 
    description: 'Master Recherche - Niveau supérieur recherche (Bac+5)',
    niveau: 'MASTER'
  },
  
  // Niveau Supérieur - Doctorat
  { 
    code: 'DIP-017', 
    libelle: 'DEA (Diplôme d\'Études Approfondies)', 
    description: 'Diplôme d\'Études Approfondies - Niveau recherche (Bac+5)',
    niveau: 'DOCTORAT'
  },
  { 
    code: 'DIP-018', 
    libelle: 'DESS (Diplôme d\'Études Supérieures Spécialisées)', 
    description: 'Diplôme d\'Études Supérieures Spécialisées - Niveau professionnel (Bac+5)',
    niveau: 'MASTER'
  },
  { 
    code: 'DIP-019', 
    libelle: 'Doctorat', 
    description: 'Doctorat - Niveau supérieur recherche (Bac+8)',
    niveau: 'DOCTORAT'
  },
  { 
    code: 'DIP-020', 
    libelle: 'HDR (Habilitation à Diriger des Recherches)', 
    description: 'Habilitation à Diriger des Recherches - Niveau supérieur recherche',
    niveau: 'DOCTORAT'
  },
  
  // Diplômes Professionnels Spécialisés
  { 
    code: 'DIP-021', 
    libelle: 'Diplôme d\'Ingénieur', 
    description: 'Diplôme d\'Ingénieur - Formation d\'ingénieur',
    niveau: 'MASTER'
  },
  { 
    code: 'DIP-022', 
    libelle: 'Diplôme de Comptabilité', 
    description: 'Diplôme de Comptabilité - Formation comptable',
    niveau: 'LICENCE'
  },
  { 
    code: 'DIP-023', 
    libelle: 'Diplôme de Gestion', 
    description: 'Diplôme de Gestion - Formation en gestion',
    niveau: 'LICENCE'
  },
  { 
    code: 'DIP-024', 
    libelle: 'Diplôme d\'Administration', 
    description: 'Diplôme d\'Administration - Formation administrative',
    niveau: 'LICENCE'
  },
  { 
    code: 'DIP-025', 
    libelle: 'Diplôme de Droit', 
    description: 'Diplôme de Droit - Formation juridique',
    niveau: 'LICENCE'
  },
  { 
    code: 'DIP-026', 
    libelle: 'Diplôme d\'Économie', 
    description: 'Diplôme d\'Économie - Formation économique',
    niveau: 'LICENCE'
  },
  { 
    code: 'DIP-027', 
    libelle: 'Diplôme de Sciences', 
    description: 'Diplôme de Sciences - Formation scientifique',
    niveau: 'LICENCE'
  },
  { 
    code: 'DIP-028', 
    libelle: 'Diplôme de Lettres', 
    description: 'Diplôme de Lettres - Formation littéraire',
    niveau: 'LICENCE'
  },
  { 
    code: 'DIP-029', 
    libelle: 'Diplôme de Santé', 
    description: 'Diplôme de Santé - Formation médicale ou paramédicale',
    niveau: 'MASTER'
  },
  { 
    code: 'DIP-030', 
    libelle: 'Diplôme d\'Enseignement', 
    description: 'Diplôme d\'Enseignement - Formation pédagogique',
    niveau: 'LICENCE'
  },
];

/**
 * Fonction pour importer tous les diplômes du système éducatif béninois
 * @param {Object} referentielsService - Service pour créer les diplômes
 */
export const importerDiplomesBenin = async (referentielsService) => {
  for (const diplome of diplomesBenin) {
    try {
      await referentielsService.createDiplome(diplome);
    } catch (error) {
      // Gérer les erreurs, par exemple si le diplôme existe déjà
      console.warn(`Le diplôme ${diplome.libelle} existe déjà ou une erreur est survenue lors de l'importation.`);
    }
  }
};

