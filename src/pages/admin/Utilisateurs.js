import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Alert,
  InputLabel,
  FormControl,
  CircularProgress,
  Grid,
  Select,
  Checkbox,
  ListItemText,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import WorkIcon from '@mui/icons-material/Work';
import { authService } from '../../services/authService';
import api from '../../services/api';
import { referentielsService } from '../../services/referentielsService';
import { postesService } from '../../services/postesService';
import { agentsService } from '../../services/agentsService';
import { useToast } from '../../context/ToastContext';

export default function AdminUtilisateurs() {
  const { success, error } = useToast();
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [searchType, setSearchType] = useState('matricule');
  const [searchValue, setSearchValue] = useState('');
  const [searching, setSearching] = useState(false);
  const [agentFound, setAgentFound] = useState(false);
  const [agentNotFound, setAgentNotFound] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nom: '',
    prenom: '',
    roles: ['RESPONSABLE'],
    agentId: '',
    directionId: '',
    serviceId: '',
    gradeId: '',
    posteId: '',
    isActive: true,
  });
  const [directions, setDirections] = useState([]);
  const [services, setServices] = useState([]);
  const [grades, setGrades] = useState([]);
  const [postes, setPostes] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const steps = ['Recherche agent', 'Informations personnelles', 'Informations professionnelles'];

  useEffect(() => {
    fetchUsers();
    fetchReferentiels();
  }, []);

  const fetchReferentiels = async () => {
    try {
      const [directionsRes, servicesRes, gradesRes, postesRes] = await Promise.all([
        referentielsService.getDirections(),
        referentielsService.getServices(),
        referentielsService.getGrades(),
        postesService.getAll(),
      ]);
      setDirections(directionsRes.data || []);
      setServices(servicesRes.data || []);
      setGrades(gradesRes.data || []);
      setPostes(postesRes.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des référentiels', error);
    }
  };

  // Recherche de l'agent par Type/Valeur
  const searchAgentByIdentifier = async () => {
    if (!searchValue || searchValue.trim() === '') {
      setAgentNotFound(false);
      return;
    }

    setSearching(true);
    setAgentNotFound(false);

    try {
      const response = await agentsService.findByIdentifierPublic(searchType, searchValue.trim());
      
      if (response.data.found && response.data.agent) {
        const agent = response.data.agent;
        
        // Extraire les IDs (en string)
        const serviceId = agent.serviceId?._id 
          ? (typeof agent.serviceId._id === 'string' ? agent.serviceId._id : agent.serviceId._id.toString())
          : (agent.serviceId ? (typeof agent.serviceId === 'string' ? agent.serviceId : agent.serviceId.toString()) : '');
        
        const directionId = agent.serviceId?.directionId?._id
          ? (typeof agent.serviceId.directionId._id === 'string' ? agent.serviceId.directionId._id : agent.serviceId.directionId._id.toString())
          : (agent.serviceId?.directionId ? (typeof agent.serviceId.directionId === 'string' ? agent.serviceId.directionId : agent.serviceId.directionId.toString()) : '');
        
        const gradeId = agent.gradeId?._id
          ? (typeof agent.gradeId._id === 'string' ? agent.gradeId._id : agent.gradeId._id.toString())
          : (agent.gradeId ? (typeof agent.gradeId === 'string' ? agent.gradeId : agent.gradeId.toString()) : '');
        
        // Récupérer le poste actuel (dernière affectation)
        let posteId = '';
        if (agent.affectationsPostes && agent.affectationsPostes.length > 0) {
          const derniereAffectation = agent.affectationsPostes[agent.affectationsPostes.length - 1];
          if (derniereAffectation.posteId) {
            const poste = derniereAffectation.posteId;
            if (typeof poste === 'object' && poste !== null) {
              posteId = poste._id ? (typeof poste._id === 'string' ? poste._id : poste._id.toString()) : '';
            } else {
              posteId = poste.toString();
            }
          }
        }

        // Extraire l'ID de l'agent
        const agentId = agent._id 
          ? (typeof agent._id === 'string' ? agent._id : agent._id.toString())
          : '';

        // Pré-remplir les champs
        setFormData({
          ...formData,
          nom: agent.nom || '',
          prenom: agent.prenom || '',
          directionId: directionId || '',
          serviceId: serviceId || '',
          gradeId: gradeId || '',
          posteId: posteId || '',
          agentId: agentId || '',
        });

        setAgentFound(true);
        setAgentNotFound(false);
        // Passer à l'étape suivante
        setCurrentStep(1);
      } else {
        setAgentFound(false);
        setAgentNotFound(true);
      }
    } catch (error) {
      console.error('Erreur lors de la recherche de l\'agent:', error);
      setAgentFound(false);
      setAgentNotFound(true);
      // Afficher un message d'erreur si c'est une erreur réseau ou serveur
      let errorMessage = 'Erreur lors de la recherche de l\'agent';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = `Erreur lors de la recherche: ${error.message}`;
      }
      error(errorMessage);
    } finally {
      setSearching(false);
    }
  };

  // Réinitialiser l'état si la valeur de recherche change
  useEffect(() => {
    if (!searchValue || searchValue.trim() === '') {
      setAgentFound(false);
      setAgentNotFound(false);
    }
  }, [searchValue]);

  // Filtrer les services par direction sélectionnée
  const filteredServices = formData.directionId
    ? services.filter((s) => {
        const serviceDirectionId = typeof s.directionId === 'object' ? s.directionId._id : s.directionId;
        return serviceDirectionId === formData.directionId;
      })
    : services;

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Erreur', error);
    }
  };

  const validateStep = (step) => {
    if (editingUser) {
      // Pour l'édition, validation simple
      return true;
    }
    
    switch (step) {
      case 0:
        return agentFound;
      case 1:
        return formData.nom && formData.prenom && formData.email && formData.password && formData.roles && formData.roles.length > 0 && formData.roles.length <= 2;
      case 2:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prevStep) => prevStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async () => {
    try {
      // Validation : maximum 2 rôles
      if (formData.roles && formData.roles.length > 2) {
        error('Un utilisateur ne peut avoir au maximum que 2 rôles');
        return;
      }
      
      // Nettoyer les données avant envoi
      const dataToSend = { ...formData };
      // S'assurer qu'on n'envoie que les 2 premiers rôles au cas où
      if (dataToSend.roles && dataToSend.roles.length > 2) {
        dataToSend.roles = dataToSend.roles.slice(0, 2);
      }
      if (!dataToSend.agentId || dataToSend.agentId.trim() === '') {
        delete dataToSend.agentId;
      }
      if (!dataToSend.directionId) delete dataToSend.directionId;
      if (!dataToSend.serviceId) delete dataToSend.serviceId;
      if (!dataToSend.gradeId) delete dataToSend.gradeId;
      if (!dataToSend.posteId) delete dataToSend.posteId;
      // Ne pas envoyer le mot de passe s'il est vide lors de l'édition
      if (editingUser && !dataToSend.password) {
        delete dataToSend.password;
      }
      
      if (editingUser) {
        await api.patch(`/users/${editingUser._id}`, dataToSend);
      } else {
        // L'admin crée des comptes actifs par défaut
        dataToSend.isActive = true;
        // skipTokenStorage = true pour ne pas écraser le token de l'admin
        await authService.register(dataToSend, true);
      }
      handleClose();
      // Attendre un peu avant de rafraîchir pour s'assurer que la création est terminée
      setTimeout(() => {
        fetchUsers();
      }, 100);
      success(editingUser ? 'Utilisateur modifié avec succès' : 'Utilisateur créé avec succès');
    } catch (err) {
      console.error('Erreur', err);
      // Extraire le message d'erreur de différentes façons possibles
      let errorMessage = 'Erreur lors de la sauvegarde';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      error(errorMessage);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setEditingUser(null);
    setCurrentStep(0);
    setAgentFound(false);
    setAgentNotFound(false);
    setSearchValue('');
    setSearchType('matricule');
    setFormData({
      email: '',
      password: '',
      nom: '',
      prenom: '',
      roles: ['RESPONSABLE'],
      agentId: '',
      directionId: '',
      serviceId: '',
      gradeId: '',
      posteId: '',
      isActive: true,
    });
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    // Gérer les IDs qui peuvent être des objets (populés) ou des strings
    const directionId = user.directionId 
      ? (typeof user.directionId === 'object' ? user.directionId._id : user.directionId)
      : '';
    const serviceId = user.serviceId 
      ? (typeof user.serviceId === 'object' ? user.serviceId._id : user.serviceId)
      : '';
    const gradeId = user.gradeId 
      ? (typeof user.gradeId === 'object' ? user.gradeId._id : user.gradeId)
      : '';
    const posteId = user.posteId 
      ? (typeof user.posteId === 'object' ? user.posteId._id : user.posteId)
      : '';
    
    // Gérer les rôles multiples : utiliser roles si disponible, sinon role pour compatibilité
    const userRoles = user.roles && Array.isArray(user.roles) && user.roles.length > 0
      ? user.roles
      : user.role
        ? [user.role]
        : ['RESPONSABLE'];
    
    setFormData({
      email: user.email,
      password: '',
      nom: user.nom,
      prenom: user.prenom,
      roles: userRoles,
      agentId: user.agentId || '',
      directionId: directionId,
      serviceId: serviceId,
      gradeId: gradeId,
      posteId: posteId,
      isActive: user.isActive,
    });
    setCurrentStep(0); // Pour l'édition, on commence à l'étape 0 (informations personnelles)
    setOpen(true);
  };

  const handleNewUser = () => {
    setEditingUser(null);
    setCurrentStep(0);
    setAgentFound(false);
    setAgentNotFound(false);
    setSearchValue('');
    setSearchType('matricule');
    setFormData({
      email: '',
      password: '',
      nom: '',
      prenom: '',
      roles: ['RESPONSABLE'],
      agentId: '',
      directionId: '',
      serviceId: '',
      gradeId: '',
      posteId: '',
      isActive: true,
    });
    setOpen(true);
  };

  const handleDelete = (userId) => {
    setUserToDelete(userId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      await api.delete(`/users/${userToDelete}`);
      fetchUsers();
      success('Utilisateur supprimé avec succès');
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (err) {
      console.error('Erreur', err);
      error('Erreur lors de la suppression');
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleToggleActive = async (user) => {
    try {
      await api.patch(`/users/${user._id}/activate`, { isActive: !user.isActive });
      fetchUsers();
      success(user.isActive ? 'Compte désactivé avec succès' : 'Compte activé avec succès');
    } catch (err) {
      console.error('Erreur', err);
      error('Erreur lors de la modification du statut');
    }
  };

  const roles = [
    { value: 'RESPONSABLE', label: 'Responsable' },
    { value: 'DGR', label: 'DGR' },
    { value: 'CVR', label: 'CVR' },
    { value: 'DNCF', label: 'DNCF' },
    { value: 'ADMIN', label: 'Admin' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Gestion des utilisateurs</Typography>
        <Button variant="contained" onClick={handleNewUser}>
          Nouvel utilisateur
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Prénom</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rôle</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.nom}</TableCell>
                <TableCell>{user.prenom}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  {user.roles && Array.isArray(user.roles) && user.roles.length > 0
                    ? user.roles.map((role) => (
                        <Chip key={role} label={role} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      ))
                    : user.role
                      ? <Chip label={user.role} size="small" />
                      : <Chip label="Aucun" size="small" />
                  }
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.isActive ? 'Actif' : 'Inactif'}
                    color={user.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleToggleActive(user)}
                    color={user.isActive ? 'warning' : 'success'}
                    title={user.isActive ? 'Désactiver le compte' : 'Activer le compte'}
                  >
                    {user.isActive ? <CancelIcon /> : <CheckCircleIcon />}
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(user)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(user._id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingUser ? 'Modifier utilisateur' : 'Nouvel utilisateur'}
        </DialogTitle>
        <DialogContent>
          {!editingUser && (
            <Stepper activeStep={currentStep} sx={{ mt: 2, mb: 4 }}>
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          )}

          {/* Étape 0 : Recherche Agent (uniquement pour création) */}
          {!editingUser && currentStep === 0 && (
            <Box sx={{ py: 2 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Recherchez l'agent dans le système pour pré-remplir automatiquement ses informations.
              </Alert>
              
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Type de recherche</InputLabel>
                    <Select
                      value={searchType}
                      label="Type de recherche"
                      onChange={(e) => {
                        setSearchType(e.target.value);
                        setSearchValue('');
                        setAgentFound(false);
                        setAgentNotFound(false);
                      }}
                      disabled={agentFound}
                    >
                      <MenuItem value="matricule">Matricule</MenuItem>
                      <MenuItem value="npi">NPI</MenuItem>
                      <MenuItem value="ifu">IFU</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label={`Valeur (${searchType === 'matricule' ? 'Matricule' : searchType === 'npi' ? 'NPI' : 'IFU'})`}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onBlur={searchAgentByIdentifier}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        searchAgentByIdentifier();
                      }
                    }}
                    disabled={agentFound}
                    placeholder={`Entrez le ${searchType}`}
                  />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={searchAgentByIdentifier}
                    disabled={searching || !searchValue || agentFound}
                    startIcon={searching ? <CircularProgress size={20} /> : <SearchIcon />}
                    sx={{ height: '56px' }}
                  >
                    Rechercher
                  </Button>
                </Grid>
              </Grid>

              {agentNotFound && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  Aucun agent trouvé avec ce {searchType === 'matricule' ? 'matricule' : searchType === 'npi' ? 'NPI' : 'IFU'}. Veuillez vérifier la valeur saisie.
                </Alert>
              )}
              
              {agentFound && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Agent trouvé ! Vous pouvez maintenant continuer vers l'étape suivante.
                </Alert>
              )}
            </Box>
          )}

          {/* Étape 1 : Informations personnelles */}
          {((!editingUser && currentStep === 1) || editingUser) && (
            <Box sx={{ py: 2 }}>
              <TextField
                fullWidth
                label="Nom"
                value={formData.nom}
                onChange={(e) =>
                  setFormData({ ...formData, nom: e.target.value })
                }
                required
                disabled={!editingUser && agentFound}
                sx={{ mt: 2 }}
              />
              <TextField
                fullWidth
                label="Prénom"
                value={formData.prenom}
                onChange={(e) =>
                  setFormData({ ...formData, prenom: e.target.value })
                }
                required
                disabled={!editingUser && agentFound}
                sx={{ mt: 2 }}
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                sx={{ mt: 2 }}
              />
              {!editingUser && (
                <TextField
                  fullWidth
                  label="Mot de passe"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  sx={{ mt: 2 }}
                />
              )}
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Rôles (maximum 2)</InputLabel>
                <Select
                  multiple
                  value={formData.roles || []}
                  onChange={(e) => {
                    const newRoles = e.target.value;
                    // Limiter à 2 rôles maximum
                    if (newRoles.length <= 2) {
                      setFormData({ ...formData, roles: newRoles });
                    } else {
                      // Si l'utilisateur essaie de sélectionner plus de 2 rôles, garder seulement les 2 premiers
                      setFormData({ ...formData, roles: newRoles.slice(0, 2) });
                      error('Un utilisateur ne peut avoir au maximum que 2 rôles');
                    }
                  }}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={roles.find(r => r.value === value)?.label || value} size="small" />
                      ))}
                      {selected.length === 2 && (
                        <Chip 
                          label="Maximum atteint" 
                          size="small" 
                          color="warning"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                  )}
                >
                  {roles.map((role) => {
                    const isSelected = formData.roles?.indexOf(role.value) > -1;
                    const isDisabled = !isSelected && formData.roles && formData.roles.length >= 2;
                    return (
                      <MenuItem 
                        key={role.value} 
                        value={role.value}
                        disabled={isDisabled}
                      >
                        <Checkbox checked={isSelected} />
                        <ListItemText 
                          primary={role.label}
                          secondary={isDisabled ? "Maximum 2 rôles autorisés" : ""}
                        />
                      </MenuItem>
                    );
                  })}
                </Select>
                {formData.roles && formData.roles.length >= 1 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                    {formData.roles.length === 2 
                      ? "Maximum de 2 rôles atteint" 
                      : `${formData.roles.length}/2 rôles sélectionné(s)`}
                  </Typography>
                )}
              </FormControl>
            </Box>
          )}

          {/* Étape 2 : Informations professionnelles */}
          {((!editingUser && currentStep === 2) || (editingUser && currentStep === 1)) && (
            <Box sx={{ py: 2 }}>
              <TextField
                fullWidth
                select
                label="Direction"
                value={formData.directionId}
                onChange={(e) => {
                  setFormData({ ...formData, directionId: e.target.value, serviceId: '' });
                }}
                disabled={!editingUser && agentFound}
                sx={{ mt: 2 }}
              >
                <MenuItem value="">Aucune</MenuItem>
                {directions.map((direction) => (
                  <MenuItem key={direction._id} value={direction._id}>
                    {direction.libelle}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                select
                label="Service"
                value={formData.serviceId}
                onChange={(e) =>
                  setFormData({ ...formData, serviceId: e.target.value })
                }
                disabled={(!editingUser && agentFound) || !formData.directionId}
                helperText={!formData.directionId ? 'Veuillez d\'abord sélectionner une direction' : ''}
                sx={{ mt: 2 }}
              >
                <MenuItem value="">Aucun</MenuItem>
                {filteredServices.map((service) => (
                  <MenuItem key={service._id} value={service._id}>
                    {service.libelle}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                select
                label="Grade"
                value={formData.gradeId}
                onChange={(e) =>
                  setFormData({ ...formData, gradeId: e.target.value })
                }
                disabled={!editingUser && agentFound}
                sx={{ mt: 2 }}
              >
                <MenuItem value="">Aucun</MenuItem>
                {grades.map((grade) => (
                  <MenuItem key={grade._id} value={grade._id}>
                    {grade.libelle}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                select
                label="Poste"
                value={formData.posteId}
                onChange={(e) =>
                  setFormData({ ...formData, posteId: e.target.value })
                }
                disabled={!editingUser && agentFound}
                sx={{ mt: 2 }}
              >
                <MenuItem value="">Aucun</MenuItem>
                {postes.map((poste) => (
                  <MenuItem key={poste._id} value={poste._id}>
                    {poste.intitule}
                  </MenuItem>
                ))}
              </TextField>
              {/* ID Agent est rempli automatiquement lors de la recherche et n'est pas modifiable */}
              {editingUser && (
                <TextField
                  fullWidth
                  select
                  label="Statut"
                  value={formData.isActive ? 'active' : 'inactive'}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.value === 'active' })
                  }
                  sx={{ mt: 2 }}
                >
                  <MenuItem value="active">Actif</MenuItem>
                  <MenuItem value="inactive">Inactif</MenuItem>
                </TextField>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Annuler</Button>
          {!editingUser && currentStep > 0 && (
            <Button onClick={handleBack}>Précédent</Button>
          )}
          {!editingUser && currentStep < 2 && (
            <Button onClick={handleNext} variant="contained" disabled={!validateStep(currentStep)}>
              Suivant
            </Button>
          )}
          {editingUser && currentStep === 0 && (
            <Button onClick={() => setCurrentStep(1)} variant="outlined">
              Suivant
            </Button>
          )}
          {((!editingUser && currentStep === 2) || (editingUser && currentStep === 1)) && (
            <Button onClick={handleSubmit} variant="contained">
              {editingUser ? 'Modifier' : 'Créer'}
            </Button>
          )}
          {editingUser && currentStep === 1 && (
            <Button onClick={() => setCurrentStep(0)} variant="outlined">
              Précédent
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Modale de confirmation de suppression */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <Typography id="delete-dialog-description">
            Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            Annuler
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" autoFocus>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
