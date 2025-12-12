const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Données de test pour les référentiels (à adapter selon vos données réelles)
const grades = [
  { _id: 'grade1', code: 'G1', libelle: 'Grade 1' },
  { _id: 'grade2', code: 'G2', libelle: 'Grade 2' },
  { _id: 'grade3', code: 'G3', libelle: 'Grade 3' },
];

const statuts = [
  { _id: 'statut1', code: 'S1', libelle: 'Statut 1' },
  { _id: 'statut2', code: 'S2', libelle: 'Statut 2' },
];

const services = [
  { _id: 'service1', code: 'SRV1', libelle: 'Service 1' },
  { _id: 'service2', code: 'SRV2', libelle: 'Service 2' },
  { _id: 'service3', code: 'SRV3', libelle: 'Service 3' },
];

const localites = [
  { _id: 'localite1', code: 'LOC1', libelle: 'Localité 1' },
  { _id: 'localite2', code: 'LOC2', libelle: 'Localité 2' },
];

const postes = [
  { _id: 'poste1', intitule: 'Poste Directeur' },
  { _id: 'poste2', intitule: 'Poste Chef de Service' },
  { _id: 'poste3', intitule: 'Poste Agent' },
  { _id: 'poste4', intitule: 'Poste Secrétaire' },
];

// Générer des données de test pour les agents
const generateTestAgents = () => {
  const agents = [];
  
  const noms = ['Dupont', 'Martin', 'Bernard', 'Thomas', 'Petit', 'Robert', 'Richard', 'Durand', 'Dubois', 'Moreau'];
  const prenoms = ['Jean', 'Marie', 'Pierre', 'Sophie', 'Paul', 'Julie', 'Michel', 'Claire', 'Philippe', 'Anne'];
  const villes = ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Strasbourg', 'Montpellier', 'Bordeaux', 'Lille'];
  
  for (let i = 1; i <= 10; i++) {
    const nom = noms[i % noms.length];
    const prenom = prenoms[i % prenoms.length];
    const matricule = `MAT${String(i).padStart(4, '0')}`;
    const dateNaissance = new Date(1970 + (i % 30), (i % 12), (i % 28) + 1);
    const dateEmbauche = new Date(2010 + (i % 10), (i % 12), (i % 28) + 1);
    
    const agent = {
      matricule: matricule,
      nom: nom,
      prenom: prenom,
      nomMariage: i % 3 === 0 ? `${nom}-${prenom}` : '',
      sexe: i % 2 === 0 ? 'M' : 'F',
      dateNaissance: dateNaissance.toISOString().split('T')[0], // Format YYYY-MM-DD
      dateEmbauche: dateEmbauche.toISOString().split('T')[0],
      email: `${prenom.toLowerCase()}.${nom.toLowerCase()}@example.com`,
      telephone: `06${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
      ifu: `IFU${String(i).padStart(8, '0')}`,
      npi: `NPI${String(i).padStart(8, '0')}`,
      adresseVille: `${i * 10} Rue de la République, ${villes[i % villes.length]}`,
      gradeId: grades[i % grades.length].code, // Utiliser le code
      statutId: statuts[i % statuts.length].code,
      serviceId: services[i % services.length].code,
      localisationActuelleId: i % 2 === 0 ? localites[0].code : localites[1].code,
    };
    
    // Ajouter des affectations de postes
    // Affectation 1 (actuelle)
    const dateDebutAff1 = new Date(dateEmbauche);
    dateDebutAff1.setMonth(dateDebutAff1.getMonth() + 6);
    agent.affectation1_posteId = postes[i % postes.length]._id;
    agent.affectation1_dateDebut = dateDebutAff1.toISOString().split('T')[0];
    agent.affectation1_dateFin = ''; // Poste actuel
    agent.affectation1_motifFin = '';
    
    // Affectation 2 (passée) - seulement pour certains agents
    if (i % 2 === 0) {
      const dateDebutAff2 = new Date(dateEmbauche);
      const dateFinAff2 = new Date(dateDebutAff1);
      dateFinAff2.setMonth(dateFinAff2.getMonth() - 1);
      agent.affectation2_posteId = postes[(i + 1) % postes.length]._id;
      agent.affectation2_dateDebut = dateDebutAff2.toISOString().split('T')[0];
      agent.affectation2_dateFin = dateFinAff2.toISOString().split('T')[0];
      agent.affectation2_motifFin = 'Mutation';
    } else {
      agent.affectation2_posteId = '';
      agent.affectation2_dateDebut = '';
      agent.affectation2_dateFin = '';
      agent.affectation2_motifFin = '';
    }
    
    // Affectation 3 (passée) - seulement pour quelques agents
    if (i % 3 === 0) {
      const dateDebutAff3 = new Date(dateEmbauche);
      dateDebutAff3.setMonth(dateDebutAff3.getMonth() + 2);
      const dateFinAff3 = new Date(dateDebutAff1);
      dateFinAff3.setMonth(dateFinAff3.getMonth() - 2);
      agent.affectation3_posteId = postes[(i + 2) % postes.length]._id;
      agent.affectation3_dateDebut = dateDebutAff3.toISOString().split('T')[0];
      agent.affectation3_dateFin = dateFinAff3.toISOString().split('T')[0];
      agent.affectation3_motifFin = 'Promotion';
    } else {
      agent.affectation3_posteId = '';
      agent.affectation3_dateDebut = '';
      agent.affectation3_dateFin = '';
      agent.affectation3_motifFin = '';
    }
    
    agents.push(agent);
  }
  
  return agents;
};

// Créer le fichier Excel
const createExcelFile = () => {
  const agents = generateTestAgents();
  
  // Définir les en-têtes dans l'ordre du canevas
  const headers = [
    'matricule',
    'nom',
    'prenom',
    'nomMariage',
    'sexe',
    'dateNaissance',
    'dateEmbauche',
    'email',
    'telephone',
    'ifu',
    'npi',
    'adresseVille',
    'gradeId',
    'statutId',
    'serviceId',
    'localisationActuelleId',
    'affectation1_posteId',
    'affectation1_dateDebut',
    'affectation1_dateFin',
    'affectation1_motifFin',
    'affectation2_posteId',
    'affectation2_dateDebut',
    'affectation2_dateFin',
    'affectation2_motifFin',
    'affectation3_posteId',
    'affectation3_dateDebut',
    'affectation3_dateFin',
    'affectation3_motifFin',
  ];
  
  // Créer les données pour Excel
  const excelData = [headers];
  
  agents.forEach((agent, agentIndex) => {
    const row = headers.map(header => {
      const value = agent[header];
      // S'assurer que les dates sont au format texte YYYY-MM-DD
      if (header.includes('date') && value) {
        // Si c'est déjà une string au bon format, la garder
        if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return value;
        }
        // Sinon, convertir en string
        if (value instanceof Date) {
          return value.toISOString().split('T')[0];
        }
        return String(value || '');
      }
      // Pour les autres valeurs, s'assurer qu'elles sont des strings
      if (value === null || value === undefined) {
        return '';
      }
      return String(value);
    });
    excelData.push(row);
    
    // Debug: afficher la première ligne pour vérifier
    if (agentIndex === 0) {
      console.log('First agent data:', agent);
      console.log('First row:', row);
    }
  });
  
  // Créer le workbook
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(excelData);
  
  // Définir le format des cellules de date comme texte
  const dateColumns = headers.map((h, i) => h.includes('date') ? i : -1).filter(i => i !== -1);
  dateColumns.forEach(colIndex => {
    const colLetter = XLSX.utils.encode_col(colIndex);
    // Marquer les cellules de date comme texte
    for (let row = 2; row <= excelData.length; row++) {
      const cellAddress = `${colLetter}${row}`;
      if (worksheet[cellAddress]) {
        worksheet[cellAddress].t = 's'; // Type string
        worksheet[cellAddress].z = '@'; // Format texte
      }
    }
  });
  
  // Définir la largeur des colonnes
  const colWidths = headers.map(() => ({ wch: 20 }));
  worksheet['!cols'] = colWidths;
  
  // Ajouter la feuille au workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Agents');
  
  // Créer le fichier à la racine du projet (plus accessible)
  const outputDir = path.join(__dirname, '..', '..');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Écrire le fichier
  const filePath = path.join(outputDir, 'agents_test.xlsx');
  XLSX.writeFile(workbook, filePath);
  
  const absolutePath = path.resolve(filePath);
  console.log(`✅ Fichier Excel généré avec succès !`);
  console.log(`📁 Emplacement : ${absolutePath}`);
  console.log(`📊 ${agents.length} agents de test créés`);
  console.log('\n📝 IMPORTANT: Les IDs dans le fichier (G1, G2, S1, S2, SRV1, etc.) sont des exemples.');
  console.log('   Vous devez les remplacer par les IDs, codes ou libellés réels de votre base de données.');
  console.log('   Pour obtenir les IDs réels:');
  console.log('   1. Connectez-vous à l\'application');
  console.log('   2. Allez dans la section "Référentiels" pour voir les grades, statuts, services, localités');
  console.log('   3. Allez dans "Postes" pour voir les postes disponibles');
  console.log('   4. Remplacez les valeurs dans le fichier Excel par les IDs, codes ou libellés réels');
  console.log('\n💡 Astuce: Le système accepte les IDs, codes ou libellés pour les référentiels.');
};

// Exécuter le script
try {
  createExcelFile();
} catch (error) {
  console.error('❌ Erreur lors de la génération du fichier:', error);
  process.exit(1);
}

