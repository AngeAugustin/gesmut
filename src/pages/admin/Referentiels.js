import React, { useState } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { referentielsService } from '../../services/referentielsService';
import { localitesBenin, importerLocalitesBenin } from '../../data/localitesBenin';
import { gradesFonctionPublique, importerGradesFonctionPublique } from '../../data/gradesFonctionPublique';
import { statutsFonctionPublique, importerStatutsFonctionPublique } from '../../data/statutsFonctionPublique';
import { diplomesBenin, importerDiplomesBenin } from '../../data/diplomesBenin';
import { competencesFonctionPublique, importerCompetencesFonctionPublique } from '../../data/competencesFonctionPublique';
import { getErrorMessage } from '../../utils/errorHandler';
import { useToast } from '../../context/ToastContext';

function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function AdminReferentiels() {
  const { success, error, warning } = useToast();
  const [tabValue, setTabValue] = useState(0);
  const [directions, setDirections] = useState([]);
  const [services, setServices] = useState([]);
  const [localites, setLocalites] = useState([]);
  const [grades, setGrades] = useState([]);
  const [statuts, setStatuts] = useState([]);
  const [diplomes, setDiplomes] = useState([]);
  const [competences, setCompetences] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentType, setCurrentType] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  React.useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [
        directionsRes,
        servicesRes,
        localitesRes,
        gradesRes,
        statutsRes,
        diplomesRes,
        competencesRes,
      ] = await Promise.all([
        referentielsService.getDirections(),
        referentielsService.getServices(),
        referentielsService.getLocalites(),
        referentielsService.getGrades(),
        referentielsService.getStatuts(),
        referentielsService.getDiplomes(),
        referentielsService.getCompetences(),
      ]);
      setDirections(directionsRes.data);
      setServices(servicesRes.data);
      setLocalites(localitesRes.data);
      setGrades(gradesRes.data);
      setStatuts(statutsRes.data);
      setDiplomes(diplomesRes.data);
      setCompetences(competencesRes.data);
    } catch (error) {
      console.error('Erreur', error);
    }
  };

  const handleOpen = (type, item = null) => {
    setCurrentType(type);
    setEditingItem(item);
    if (item) {
      // Mode édition
      // Gérer directionId qui peut être un objet (populate) ou une string
      const directionId = item.directionId 
        ? (typeof item.directionId === 'object' ? item.directionId._id : item.directionId)
        : '';
      
      setFormData({
        code: item.code || '',
        libelle: item.libelle || '',
        description: item.description || '',
        directionId: directionId,
        categorie: item.categorie || '',
        niveau: item.niveau || '',
      });
    } else {
      // Mode création
      setFormData({});
    }
    setOpen(true);
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
      return;
    }
    try {
      let service;
      switch (type) {
        case 'direction':
          service = referentielsService.deleteDirection;
          break;
        case 'service':
          service = referentielsService.deleteService;
          break;
        case 'localite':
          service = referentielsService.deleteLocalite;
          break;
        case 'grade':
          service = referentielsService.deleteGrade;
          break;
        case 'statut':
          service = referentielsService.deleteStatut;
          break;
        case 'diplome':
          service = referentielsService.deleteDiplome;
          break;
        case 'competence':
          service = referentielsService.deleteCompetence;
          break;
        default:
          return;
      }
      await service(id);
      fetchAll();
      success('Élément supprimé avec succès');
    } catch (err) {
      console.error('Erreur', err);
      const errorMessage = getErrorMessage(err);
      error(`Erreur lors de la suppression: ${errorMessage}`);
    }
  };

  const handleSubmit = async () => {
    try {
      // Nettoyer les données : enlever les champs vides et les champs non pertinents
      const cleanData = { ...formData };
      
      // Enlever les champs vides
      Object.keys(cleanData).forEach(key => {
        if (cleanData[key] === '' || cleanData[key] === null || cleanData[key] === undefined) {
          delete cleanData[key];
        }
      });
      
      // Enlever directionId si ce n'est pas un service
      if (currentType !== 'service') {
        delete cleanData.directionId;
      }
      
      // Enlever categorie si ce n'est pas une compétence
      if (currentType !== 'competence') {
        delete cleanData.categorie;
      }
      
      // Enlever niveau si ce n'est pas un grade ou un diplôme
      if (currentType !== 'grade' && currentType !== 'diplome') {
        delete cleanData.niveau;
      }
      
      let service;
      if (editingItem) {
        // Mode édition
        switch (currentType) {
          case 'direction':
            service = referentielsService.updateDirection;
            break;
          case 'service':
            service = referentielsService.updateService;
            break;
          case 'localite':
            service = referentielsService.updateLocalite;
            break;
          case 'grade':
            service = referentielsService.updateGrade;
            break;
          case 'statut':
            service = referentielsService.updateStatut;
            break;
          case 'diplome':
            service = referentielsService.updateDiplome;
            break;
          case 'competence':
            service = referentielsService.updateCompetence;
            break;
          default:
            return;
        }
        await service(editingItem._id, cleanData);
      } else {
        // Mode création
        switch (currentType) {
          case 'direction':
            service = referentielsService.createDirection;
            break;
          case 'service':
            service = referentielsService.createService;
            break;
          case 'localite':
            service = referentielsService.createLocalite;
            break;
          case 'grade':
            service = referentielsService.createGrade;
            break;
          case 'statut':
            service = referentielsService.createStatut;
            break;
          case 'diplome':
            service = referentielsService.createDiplome;
            break;
          case 'competence':
            service = referentielsService.createCompetence;
            break;
          default:
            return;
        }
        await service(cleanData);
      }
      setOpen(false);
      setEditingItem(null);
      setFormData({});
      fetchAll();
      success(editingItem ? 'Élément modifié avec succès' : 'Élément créé avec succès');
    } catch (err) {
      console.error('Erreur', err);
      const errorMessage = getErrorMessage(err);
      error(editingItem ? `Erreur lors de la modification: ${errorMessage}` : `Erreur lors de la création: ${errorMessage}`);
    }
  };

  const renderTable = (data, columns, type) => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((col) => (
              <TableCell key={col}><strong>{col}</strong></TableCell>
            ))}
            <TableCell><strong>Actions</strong></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + 1} align="center">
                <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                  Aucun élément trouvé
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={item._id} hover>
                {columns.map((col) => {
                  const fieldName = col.toLowerCase().replace(' ', '');
                  let value = item[fieldName] || item[col];
                  
                  // Gestion spéciale pour les champs imbriqués
                  if (col === 'Categorie' && item.categorie) {
                    const categories = {
                      'A': 'A - Direction & Expertise',
                      'B': 'B - Intermédiaire',
                      'C': 'C - Exécution',
                    };
                    value = categories[item.categorie] || item.categorie;
                  }
                  
                  // Gestion spéciale pour le niveau (peut être un nombre pour grades ou string pour diplômes)
                  if (col === 'Niveau' && item.niveau !== undefined && item.niveau !== null) {
                    // Afficher le niveau avec un libellé si c'est un diplôme
                    if (type === 'diplome' && typeof item.niveau === 'string') {
                      const niveauxLabels = {
                        'PRIMAIRE': 'Primaire',
                        'SECONDAIRE_1': 'Secondaire 1er Cycle',
                        'SECONDAIRE_2': 'Secondaire 2ème Cycle',
                        'SUPERIEUR_COURT': 'Supérieur Court',
                        'LICENCE': 'Licence',
                        'MAITRISE': 'Maîtrise',
                        'MASTER': 'Master',
                        'DOCTORAT': 'Doctorat',
                      };
                      value = niveauxLabels[item.niveau] || item.niveau;
                    } else {
                      value = item.niveau;
                    }
                  }
                  
                  return (
                    <TableCell key={col}>
                      {value || '-'}
                    </TableCell>
                  );
                })}
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpen(type, item)}
                      title="Modifier"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(type, item._id)}
                      title="Supprimer"
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Gestion des référentiels
      </Typography>
      <Paper sx={{ mt: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}>
          <Tab label="Directions" />
          <Tab label="Services" />
          <Tab label="Localités" />
          <Tab label="Grades" />
          <Tab label="Statuts" />
          <Tab label="Diplômes" />
          <Tab label="Compétences" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" onClick={() => handleOpen('direction')}>
              Ajouter
            </Button>
          </Box>
          {renderTable(directions, ['Code', 'Libelle', 'Description'], 'direction')}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" onClick={() => handleOpen('service')}>
              Ajouter
            </Button>
          </Box>
          {renderTable(services, ['Code', 'Libelle', 'Description'], 'service')}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {localites.length} localité(s) enregistrée(s)
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="outlined" 
                onClick={async () => {
                  if (window.confirm(`Voulez-vous importer toutes les ${localitesBenin.length} communes du Bénin ? Cette action peut prendre quelques instants.`)) {
                    try {
                      await importerLocalitesBenin(referentielsService);
                      success('Importation réussie !');
                      fetchAll();
                    } catch (err) {
                      console.error('Erreur', err);
                      warning('Erreur lors de l\'importation. Certaines localités peuvent déjà exister.');
                    }
                  }
                }}
              >
                Importer toutes les communes du Bénin
              </Button>
              <Button variant="contained" onClick={() => handleOpen('localite')}>
                Ajouter
              </Button>
            </Box>
          </Box>
          {renderTable(localites, ['Code', 'Libelle', 'Description'], 'localite')}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {grades.length} grade(s) enregistré(s)
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="outlined" 
                onClick={async () => {
                  if (window.confirm(`Voulez-vous importer tous les ${gradesFonctionPublique.length} grades de la fonction publique béninoise ? Cette action peut prendre quelques instants.`)) {
                    try {
                      await importerGradesFonctionPublique(referentielsService);
                      success('Importation réussie !');
                      fetchAll();
                    } catch (err) {
                      console.error('Erreur', err);
                      const errorMessage = getErrorMessage(err);
                      warning(`Erreur lors de l'importation: ${errorMessage}. Certains grades peuvent déjà exister.`);
                    }
                  }
                }}
              >
                Importer les grades de la fonction publique
              </Button>
              <Button variant="contained" onClick={() => handleOpen('grade')}>
                Ajouter
              </Button>
            </Box>
          </Box>
          {renderTable(grades, ['Code', 'Libelle', 'Description', 'Niveau'], 'grade')}
        </TabPanel>

        <TabPanel value={tabValue} index={4}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {statuts.length} statut(s) enregistré(s)
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="outlined" 
                onClick={async () => {
                  if (window.confirm(`Voulez-vous importer tous les ${statutsFonctionPublique.length} statuts de la fonction publique béninoise ? Cette action peut prendre quelques instants.`)) {
                    try {
                      await importerStatutsFonctionPublique(referentielsService);
                      success('Importation réussie !');
                      fetchAll();
                    } catch (err) {
                      console.error('Erreur', err);
                      const errorMessage = getErrorMessage(err);
                      warning(`Erreur lors de l'importation: ${errorMessage}. Certains statuts peuvent déjà exister.`);
                    }
                  }
                }}
              >
                Importer les statuts de la fonction publique
              </Button>
              <Button variant="contained" onClick={() => handleOpen('statut')}>
                Ajouter
              </Button>
            </Box>
          </Box>
          {renderTable(statuts, ['Code', 'Libelle', 'Description'], 'statut')}
        </TabPanel>

        <TabPanel value={tabValue} index={5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {diplomes.length} diplôme(s) enregistré(s)
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="outlined" 
                onClick={async () => {
                  if (window.confirm(`Voulez-vous importer tous les ${diplomesBenin.length} diplômes du système éducatif béninois ? Cette action peut prendre quelques instants.`)) {
                    try {
                      await importerDiplomesBenin(referentielsService);
                      success('Importation réussie !');
                      fetchAll();
                    } catch (err) {
                      console.error('Erreur', err);
                      const errorMessage = getErrorMessage(err);
                      warning(`Erreur lors de l'importation: ${errorMessage}. Certains diplômes peuvent déjà exister.`);
                    }
                  }
                }}
              >
                Importer les diplômes du système éducatif
              </Button>
              <Button variant="contained" onClick={() => handleOpen('diplome')}>
                Ajouter
              </Button>
            </Box>
          </Box>
          {renderTable(diplomes, ['Code', 'Libelle', 'Description', 'Niveau'], 'diplome')}
        </TabPanel>

        <TabPanel value={tabValue} index={6}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {competences.length} compétence(s) enregistrée(s)
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="outlined" 
                onClick={async () => {
                  if (window.confirm(`Voulez-vous importer toutes les ${competencesFonctionPublique.length} compétences de la fonction publique béninoise ? Cette action peut prendre quelques instants.`)) {
                    try {
                      await importerCompetencesFonctionPublique(referentielsService);
                      success('Importation réussie !');
                      fetchAll();
                    } catch (err) {
                      console.error('Erreur', err);
                      const errorMessage = getErrorMessage(err);
                      warning(`Erreur lors de l'importation: ${errorMessage}. Certaines compétences peuvent déjà exister.`);
                    }
                  }
                }}
              >
                Importer les compétences de la fonction publique
              </Button>
              <Button variant="contained" onClick={() => handleOpen('competence')}>
                Ajouter
              </Button>
            </Box>
          </Box>
          {renderTable(competences, ['Code', 'Libelle', 'Description', 'Categorie'], 'competence')}
        </TabPanel>
      </Paper>

      <Dialog open={open} onClose={() => {
        setOpen(false);
        setEditingItem(null);
        setFormData({});
      }} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingItem ? 'Modifier' : 'Ajouter'} {currentType === 'direction' && 'une Direction'}
          {currentType === 'service' && 'un Service'}
          {currentType === 'localite' && 'une Localité'}
          {currentType === 'grade' && 'un Grade'}
          {currentType === 'statut' && 'un Statut'}
          {currentType === 'diplome' && 'un Diplôme'}
          {currentType === 'competence' && 'une Compétence'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Code"
            value={formData.code || ''}
            onChange={(e) =>
              setFormData({ ...formData, code: e.target.value })
            }
            required
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Libellé"
            value={formData.libelle || ''}
            onChange={(e) =>
              setFormData({ ...formData, libelle: e.target.value })
            }
            required
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description"
            value={formData.description || ''}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            sx={{ mt: 2 }}
          />
          {currentType === 'service' && (
            <TextField
              fullWidth
              select
              label="Direction"
              value={formData.directionId || ''}
              onChange={(e) =>
                setFormData({ ...formData, directionId: e.target.value })
              }
              sx={{ mt: 2 }}
            >
              {directions.map((direction) => (
                <MenuItem key={direction._id} value={direction._id}>
                  {direction.libelle}
                </MenuItem>
              ))}
            </TextField>
          )}
          {currentType === 'grade' && (
            <TextField
              fullWidth
              type="number"
              label="Niveau (hiérarchie)"
              value={formData.niveau || ''}
              onChange={(e) =>
                setFormData({ ...formData, niveau: parseInt(e.target.value) || undefined })
              }
              sx={{ mt: 2 }}
              helperText="Numéro pour établir la hiérarchie (1 = plus haut niveau)"
            />
          )}
          {currentType === 'diplome' && (
            <TextField
              fullWidth
              select
              label="Niveau"
              value={formData.niveau || ''}
              onChange={(e) =>
                setFormData({ ...formData, niveau: e.target.value })
              }
              sx={{ mt: 2 }}
            >
              <MenuItem value="PRIMAIRE">Primaire</MenuItem>
              <MenuItem value="SECONDAIRE_1">Secondaire Premier Cycle</MenuItem>
              <MenuItem value="SECONDAIRE_2">Secondaire Second Cycle</MenuItem>
              <MenuItem value="SUPERIEUR_COURT">Supérieur Court</MenuItem>
              <MenuItem value="LICENCE">Licence</MenuItem>
              <MenuItem value="MAITRISE">Maîtrise</MenuItem>
              <MenuItem value="MASTER">Master</MenuItem>
              <MenuItem value="DOCTORAT">Doctorat</MenuItem>
            </TextField>
          )}
          {currentType === 'competence' && (
            <TextField
              fullWidth
              select
              label="Catégorie"
              value={formData.categorie || ''}
              onChange={(e) =>
                setFormData({ ...formData, categorie: e.target.value })
              }
              sx={{ mt: 2 }}
            >
              <MenuItem value="A">A - Direction & Expertise</MenuItem>
              <MenuItem value="B">B - Intermédiaire</MenuItem>
              <MenuItem value="C">C - Exécution</MenuItem>
            </TextField>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpen(false);
            setEditingItem(null);
            setFormData({});
          }}>Annuler</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.code || !formData.libelle}
          >
            {editingItem ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
