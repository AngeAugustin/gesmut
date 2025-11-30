import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Chip,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  InputAdornment,
  Avatar,
  IconButton,
  Typography,
  Divider,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate, useLocation } from 'react-router-dom';
import { agentsService } from '../../services/agentsService';
import { referentielsService } from '../../services/referentielsService';
import { postesService } from '../../services/postesService';
import { uploadService } from '../../services/uploadService';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import ActionButton from '../../components/common/ActionButton';
import { getErrorMessage } from '../../utils/errorHandler';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function DGRAgents() {
  const { success, error: showError, warning } = useToast();
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [grades, setGrades] = useState([]);
  const [services, setServices] = useState([]);
  const [directions, setDirections] = useState([]);
  const [statuts, setStatuts] = useState([]);
  const [localites, setLocalites] = useState([]);
  const [postes, setPostes] = useState([]);
  const [diplomes, setDiplomes] = useState([]);
  const [competences, setCompetences] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [conjointForm, setConjointForm] = useState({ code: '', nom: '', prenom: '' });
  const [enfantForm, setEnfantForm] = useState({ code: '', nom: '', prenom: '' });
  const [competenceForm, setCompetenceForm] = useState({ nom: '', categorie: 'A', niveau: '' });
  const [formData, setFormData] = useState({
    matricule: '',
    nom: '',
    prenom: '',
    nomMariage: '',
    sexe: '',
    dateNaissance: '',
    dateEmbauche: '',
    email: '',
    telephone: '',
    adresseVille: '',
    gradeId: '',
    statutId: '',
    serviceId: '',
    localisationActuelleId: '',
    posteActuelId: '',
    diplomeIds: [],
    competences: [],
    conjoints: [],
    enfants: [],
  });
  const [filters, setFilters] = useState({
    grade: '',
    service: '',
    recherche: '',
  });
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  
  // Déterminer le préfixe de route selon le rôle
  const getRoutePrefix = () => {
    if (location.pathname.startsWith('/admin')) {
      return '/admin';
    }
    return '/dgr';
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [agentsRes, gradesRes, servicesRes, directionsRes, statutsRes, localitesRes, postesRes, diplomesRes, competencesRes, usersRes] = await Promise.all([
        agentsService.getAll(),
        referentielsService.getGrades(),
        referentielsService.getServices(),
        referentielsService.getDirections(),
        referentielsService.getStatuts(),
        referentielsService.getLocalites(),
        postesService.getAll(),
        referentielsService.getDiplomes(),
        referentielsService.getCompetences(),
        api.get('/users').catch(() => ({ data: [] })),
      ]);
      
      console.log('Agents reçus:', agentsRes.data);
      if (agentsRes.data && agentsRes.data.length > 0) {
        console.log('Premier agent:', agentsRes.data[0]);
        console.log('Grade du premier agent:', agentsRes.data[0].gradeId);
        console.log('Statut du premier agent:', agentsRes.data[0].statutId);
        console.log('Service du premier agent:', agentsRes.data[0].serviceId);
        console.log('Localisation du premier agent:', agentsRes.data[0].localisationActuelleId);
        console.log('Poste du premier agent:', agentsRes.data[0].posteActuelId);
      }
      
      setAgents(agentsRes.data);
      setFilteredAgents(agentsRes.data);
      setGrades(gradesRes.data);
      setServices(servicesRes.data);
      setDirections(directionsRes.data);
      setStatuts(statutsRes.data);
      setLocalites(localitesRes.data);
      setPostes(postesRes.data);
      setDiplomes(diplomesRes.data);
      setCompetences(competencesRes.data);
      setUsers(usersRes.data || []);
    } catch (error) {
      console.error('Erreur', error);
      setError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDialog = () => {
    setFormData({
      matricule: '',
      nom: '',
      prenom: '',
      nomMariage: '',
      sexe: '',
      dateNaissance: '',
      dateEmbauche: '',
      email: '',
      telephone: '',
      adresseVille: '',
      gradeId: '',
      statutId: '',
      directionId: '',
      serviceId: '',
      localisationActuelleId: '',
      posteActuelId: '',
      diplomeIds: [],
      competences: [],
      conjoints: [],
      enfants: [],
      responsableIds: [],
    });
    setPhotoPreview(null);
    setPhotoFile(null);
    setConjointForm({ code: '', nom: '', prenom: '' });
    setEnfantForm({ code: '', nom: '', prenom: '' });
    setCompetenceForm({ nom: '', categorie: 'A', niveau: '' });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({
      matricule: '',
      nom: '',
      prenom: '',
      nomMariage: '',
      sexe: '',
      dateNaissance: '',
      dateEmbauche: '',
      email: '',
      telephone: '',
      adresseVille: '',
      gradeId: '',
      statutId: '',
      directionId: '',
      serviceId: '',
      localisationActuelleId: '',
      posteActuelId: '',
      diplomeIds: [],
      competences: [],
      conjoints: [],
      enfants: [],
      responsableIds: [],
    });
    setPhotoPreview(null);
    setPhotoFile(null);
    setConjointForm({ code: '', nom: '', prenom: '' });
    setEnfantForm({ code: '', nom: '', prenom: '' });
    setCompetenceForm({ nom: '', categorie: 'A', niveau: '' });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3145728) {
        warning('La photo ne doit pas dépasser 3 Mo');
        return;
      }
      if (!file.type.startsWith('image/')) {
        warning('Le fichier doit être une image');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result);
        setPhotoFile(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoPreview(null);
    setPhotoFile(null);
  };

  const handleAddConjoint = () => {
    if (conjointForm.nom && conjointForm.prenom) {
      // Si le sexe est Féminin, limiter à 1 conjoint maximum
      if (formData.sexe === 'F' && formData.conjoints.length >= 1) {
        warning('Pour le sexe Féminin, vous ne pouvez ajouter qu\'un seul conjoint.');
        return;
      }
      setFormData((prev) => ({
        ...prev,
        conjoints: [...prev.conjoints, { ...conjointForm }],
      }));
      setConjointForm({ code: '', nom: '', prenom: '' });
    }
  };

  const handleRemoveConjoint = (index) => {
    setFormData((prev) => ({
      ...prev,
      conjoints: prev.conjoints.filter((_, i) => i !== index),
    }));
  };

  const handleAddEnfant = () => {
    if (enfantForm.nom && enfantForm.prenom) {
      setFormData((prev) => ({
        ...prev,
        enfants: [...prev.enfants, { ...enfantForm }],
      }));
      setEnfantForm({ code: '', nom: '', prenom: '' });
    }
  };

  const handleRemoveEnfant = (index) => {
    setFormData((prev) => ({
      ...prev,
      enfants: prev.enfants.filter((_, i) => i !== index),
    }));
  };

  const handleAddCompetence = () => {
    if (competenceForm.nom) {
      setFormData((prev) => ({
        ...prev,
        competences: [...prev.competences, { ...competenceForm }],
      }));
      setCompetenceForm({ nom: '', categorie: 'A', niveau: '' });
    }
  };

  const handleRemoveCompetence = (index) => {
    setFormData((prev) => ({
      ...prev,
      competences: prev.competences.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    // Validation des champs obligatoires
    if (!formData.matricule || !formData.nom || !formData.prenom || !formData.dateNaissance || !formData.dateEmbauche || !formData.gradeId || !formData.statutId || !formData.directionId || !formData.serviceId) {
      warning('Veuillez remplir tous les champs obligatoires (y compris la direction et le service)');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Upload de la photo si elle existe
      let photoId = null;
      if (photoFile) {
        try {
          const photoRes = await uploadService.uploadFile(photoFile);
          photoId = photoRes.fileId;
        } catch (uploadError) {
          console.error('Erreur lors de l\'upload de la photo:', uploadError);
          warning('Erreur lors de l\'upload de la photo. L\'agent sera créé sans photo.');
        }
      }
      
      // Préparer les données à envoyer
      const agentData = {
        matricule: formData.matricule.trim(),
        nom: formData.nom.trim(),
        prenom: formData.prenom.trim(),
        dateNaissance: new Date(formData.dateNaissance).toISOString(),
        dateEmbauche: new Date(formData.dateEmbauche).toISOString(),
        gradeId: formData.gradeId,
        statutId: formData.statutId,
      };

      // Ajouter les champs optionnels seulement s'ils sont remplis
      if (formData.nomMariage && formData.nomMariage.trim()) {
        agentData.nomMariage = formData.nomMariage.trim();
      }
      if (formData.sexe) {
        agentData.sexe = formData.sexe;
      }
      if (formData.email && formData.email.trim()) {
        agentData.email = formData.email.trim();
      }
      if (formData.telephone && formData.telephone.trim()) {
        agentData.telephone = formData.telephone.trim();
      }
      if (formData.adresseVille && formData.adresseVille.trim()) {
        agentData.adresseVille = formData.adresseVille.trim();
      }
      if (photoId) {
        agentData.photo = photoId;
      }
      if (formData.serviceId) {
        agentData.serviceId = formData.serviceId;
      }
      if (formData.localisationActuelleId) {
        agentData.localisationActuelleId = formData.localisationActuelleId;
      }
      if (formData.posteActuelId) {
        agentData.posteActuelId = formData.posteActuelId;
      }
      if (formData.diplomeIds && formData.diplomeIds.length > 0) {
        agentData.diplomeIds = formData.diplomeIds;
      }
      if (formData.competences && formData.competences.length > 0) {
        agentData.competences = formData.competences;
      }
      if (formData.conjoints && formData.conjoints.length > 0) {
        agentData.conjoints = formData.conjoints;
      }
      if (formData.enfants && formData.enfants.length > 0) {
        agentData.enfants = formData.enfants;
      }

      await agentsService.create(agentData);
      success('Agent créé avec succès !');
      handleCloseDialog();
      fetchData();
    } catch (err) {
      console.error('Erreur lors de la création de l\'agent:', err);
      const errorMessage = getErrorMessage(err);
      setError(`Erreur lors de la création: ${errorMessage}`);
      showError(`Erreur lors de la création: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...agents];

    if (filters.grade) {
      filtered = filtered.filter((a) => a.gradeId?._id === filters.grade || a.gradeId === filters.grade);
    }
    if (filters.service) {
      filtered = filtered.filter((a) => a.serviceId?._id === filters.service || a.serviceId === filters.service);
    }
    if (filters.recherche) {
      const search = filters.recherche.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.nom?.toLowerCase().includes(search) ||
          a.prenom?.toLowerCase().includes(search) ||
          a.matricule?.toLowerCase().includes(search)
      );
    }

    setFilteredAgents(filtered);
  }, [filters, agents]);

  const columns = [
    {
      id: 'matricule',
      label: 'Matricule',
    },
    {
      id: 'nom',
      label: 'Nom',
      render: (value, row) => `${row.nom || ''} ${row.prenom || ''}`.trim() || '-',
    },
    {
      id: 'grade',
      label: 'Grade',
      render: (value, row) => {
        const grade = row.gradeId;
        if (!grade) return '-';
        if (typeof grade === 'object' && grade !== null) {
          return grade.libelle || grade.code || '-';
        }
        return '-';
      },
    },
    {
      id: 'service',
      label: 'Service',
      render: (value, row) => {
        const service = row.serviceId;
        if (!service) return '-';
        if (typeof service === 'object' && service !== null) {
          return service.libelle || service.code || '-';
        }
        return '-';
      },
    },
    {
      id: 'localisation',
      label: 'Localisation',
      render: (value, row) => {
        const localisation = row.localisationActuelleId;
        if (!localisation) return '-';
        if (typeof localisation === 'object' && localisation !== null) {
          return localisation.libelle || localisation.code || '-';
        }
        return '-';
      },
    },
    {
      id: 'statut',
      label: 'Statut',
      render: (value, row) => {
        const statut = row.statutId;
        if (!statut) return '-';
        if (typeof statut === 'object' && statut !== null) {
          return statut.libelle || statut.code || '-';
        }
        return '-';
      },
    },
  ];

  const actions = (row) => {
    const routePrefix = getRoutePrefix();
    return [
      {
        icon: <VisibilityIcon />,
        tooltip: 'Voir le profil',
        onClick: () => {
          const route = `${routePrefix}/agents/${row._id || row.id}`;
          console.log('Navigation vers:', route, 'Row:', row);
          navigate(route);
        },
      },
    ];
  };

  return (
    <Box>
      <PageHeader
        title="Gestion des agents"
        subtitle="Consultez et gérez tous les agents du système"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
        <TextField
          select
          label="Grade"
          value={filters.grade}
          onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Tous</MenuItem>
          {grades.map((grade) => (
            <MenuItem key={grade._id} value={grade._id}>
              {grade.libelle}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Service"
          value={filters.service}
          onChange={(e) => setFilters({ ...filters, service: e.target.value })}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Tous</MenuItem>
          {services.map((service) => (
            <MenuItem key={service._id} value={service._id}>
              {service.libelle}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Rechercher"
          value={filters.recherche}
          onChange={(e) => setFilters({ ...filters, recherche: e.target.value })}
          sx={{ flex: 1, minWidth: 200 }}
          placeholder="Nom, prénom ou matricule"
        />
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
            disabled={loading}
          >
            Ajouter un agent
          </Button>
          <Chip label={`${filteredAgents.length} agent(s)`} color="primary" />
        </Box>
      </Box>

      <DataTable
        columns={columns}
        rows={filteredAgents.map((a) => {
          const row = {
            id: a._id || a.id,
            _id: a._id || a.id,
            matricule: a.matricule,
            nom: a.nom,
            prenom: a.prenom,
            // Préserver les références complètes pour les colonnes
            gradeId: a.gradeId,
            serviceId: a.serviceId,
            localisationActuelleId: a.localisationActuelleId,
            statutId: a.statutId,
            // Copier toutes les autres propriétés
            ...a,
          };
          return row;
        })}
        actions={actions}
        emptyMessage="Aucun agent trouvé"
      />

      {/* Dialog pour créer un agent */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Ajouter un agent</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Matricule *"
                  value={formData.matricule}
                  onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nom *"
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Prénom *"
                  value={formData.prenom}
                  onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nom de mariage"
                  value={formData.nomMariage}
                  onChange={(e) => setFormData({ ...formData, nomMariage: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Sexe"
                  value={formData.sexe}
                  onChange={(e) => setFormData({ ...formData, sexe: e.target.value })}
                >
                  <MenuItem value="">Non spécifié</MenuItem>
                  <MenuItem value="M">Masculin</MenuItem>
                  <MenuItem value="F">Féminin</MenuItem>
                  <MenuItem value="Autre">Autre</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date de naissance *"
                  type="date"
                  value={formData.dateNaissance}
                  onChange={(e) => setFormData({ ...formData, dateNaissance: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Date d'embauche *"
                  type="date"
                  value={formData.dateEmbauche}
                  onChange={(e) => setFormData({ ...formData, dateEmbauche: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Téléphone"
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">+229</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Adresse/Ville"
                  value={formData.adresseVille}
                  onChange={(e) => setFormData({ ...formData, adresseVille: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Grade *"
                  value={formData.gradeId}
                  onChange={(e) => setFormData({ ...formData, gradeId: e.target.value })}
                  required
                >
                  <MenuItem value="">Sélectionner un grade</MenuItem>
                  {grades.map((grade) => (
                    <MenuItem key={grade._id} value={grade._id}>
                      {grade.libelle}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Statut *"
                  value={formData.statutId}
                  onChange={(e) => setFormData({ ...formData, statutId: e.target.value })}
                  required
                >
                  <MenuItem value="">Sélectionner un statut</MenuItem>
                  {statuts.map((statut) => (
                    <MenuItem key={statut._id} value={statut._id}>
                      {statut.libelle}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Direction *"
                  value={formData.directionId}
                  onChange={(e) => setFormData({ ...formData, directionId: e.target.value, serviceId: '' })}
                  required
                >
                  <MenuItem value="">Sélectionner une direction</MenuItem>
                  {directions.map((direction) => (
                    <MenuItem key={direction._id} value={direction._id}>
                      {direction.libelle}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Service *"
                  value={formData.serviceId}
                  onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                  required
                  disabled={!formData.directionId}
                  helperText={!formData.directionId ? 'Veuillez d\'abord sélectionner une direction' : ''}
                >
                  <MenuItem value="">Sélectionner un service</MenuItem>
                  {services
                    .filter((service) => {
                      if (!formData.directionId) return false;
                      const serviceDirectionId = service.directionId?._id || service.directionId;
                      return serviceDirectionId === formData.directionId;
                    })
                    .map((service) => (
                      <MenuItem key={service._id} value={service._id}>
                        {service.libelle}
                      </MenuItem>
                    ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Localisation actuelle"
                  value={formData.localisationActuelleId}
                  onChange={(e) => setFormData({ ...formData, localisationActuelleId: e.target.value })}
                >
                  <MenuItem value="">Aucune</MenuItem>
                  {localites.map((localite) => (
                    <MenuItem key={localite._id} value={localite._id}>
                      {localite.libelle}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Poste actuel"
                  value={formData.posteActuelId}
                  onChange={(e) => setFormData({ ...formData, posteActuelId: e.target.value })}
                >
                  <MenuItem value="">Aucun</MenuItem>
                  {postes.map((poste) => (
                    <MenuItem key={poste._id} value={poste._id}>
                      {poste.intitule}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  SelectProps={{
                    multiple: true,
                  }}
                  label="Diplômes"
                  value={formData.diplomeIds}
                  onChange={(e) => setFormData({ ...formData, diplomeIds: e.target.value })}
                  renderValue={(selected) => {
                    if (selected.length === 0) return 'Aucun';
                    return selected.map((id) => {
                      const diplome = diplomes.find((d) => d._id === id);
                      return diplome?.libelle || id;
                    }).join(', ');
                  }}
                >
                  {diplomes.map((diplome) => (
                    <MenuItem key={diplome._id} value={diplome._id}>
                      {diplome.libelle}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              
              {/* Photo */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Photo</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {photoPreview ? (
                    <Box sx={{ position: 'relative' }}>
                      <Avatar src={photoPreview} sx={{ width: 100, height: 100 }} />
                      <IconButton
                        size="small"
                        onClick={handleRemovePhoto}
                        sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'error.main', color: 'white' }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ) : (
                    <Avatar sx={{ width: 100, height: 100 }}>
                      <PhotoCameraIcon />
                    </Avatar>
                  )}
                  <Button
                    variant="outlined"
                    component="label"
                    startIcon={<PhotoCameraIcon />}
                  >
                    {photoPreview ? 'Changer la photo' : 'Ajouter une photo'}
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handlePhotoChange}
                    />
                  </Button>
                </Box>
              </Grid>

              {/* Compétences */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Compétences</Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                  <TextField
                    label="Nom de la compétence"
                    value={competenceForm.nom}
                    onChange={(e) => setCompetenceForm({ ...competenceForm, nom: e.target.value })}
                    sx={{ flex: 1, minWidth: 200 }}
                  />
                  <TextField
                    select
                    label="Catégorie"
                    value={competenceForm.categorie}
                    onChange={(e) => setCompetenceForm({ ...competenceForm, categorie: e.target.value })}
                    sx={{ minWidth: 150 }}
                  >
                    <MenuItem value="A">A - Direction & Expertise</MenuItem>
                    <MenuItem value="B">B - Intermédiaire</MenuItem>
                    <MenuItem value="C">C - Exécution</MenuItem>
                  </TextField>
                  <TextField
                    label="Niveau"
                    value={competenceForm.niveau}
                    onChange={(e) => setCompetenceForm({ ...competenceForm, niveau: e.target.value })}
                    placeholder="Ex: Avancé, Expert"
                    sx={{ minWidth: 150 }}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddCompetence}
                    disabled={!competenceForm.nom}
                  >
                    Ajouter
                  </Button>
                </Box>
                {formData.competences.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.competences.map((comp, index) => (
                      <Chip
                        key={index}
                        label={`${comp.nom} (${comp.categorie})${comp.niveau ? ' - ' + comp.niveau : ''}`}
                        onDelete={() => handleRemoveCompetence(index)}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                )}
              </Grid>

              {/* Conjoints */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Conjoints {formData.sexe === 'F' && '(Maximum 1)'}
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                  <TextField
                    label="Code"
                    value={conjointForm.code}
                    onChange={(e) => setConjointForm({ ...conjointForm, code: e.target.value })}
                    sx={{ minWidth: 120 }}
                  />
                  <TextField
                    label="Nom *"
                    value={conjointForm.nom}
                    onChange={(e) => setConjointForm({ ...conjointForm, nom: e.target.value })}
                    required
                    sx={{ flex: 1, minWidth: 150 }}
                  />
                  <TextField
                    label="Prénom *"
                    value={conjointForm.prenom}
                    onChange={(e) => setConjointForm({ ...conjointForm, prenom: e.target.value })}
                    required
                    sx={{ flex: 1, minWidth: 150 }}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddConjoint}
                    disabled={!conjointForm.nom || !conjointForm.prenom}
                  >
                    Ajouter
                  </Button>
                </Box>
                {formData.conjoints.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.conjoints.map((conjoint, index) => (
                      <Chip
                        key={index}
                        label={`${conjoint.nom} ${conjoint.prenom}${conjoint.code ? ' (' + conjoint.code + ')' : ''}`}
                        onDelete={() => handleRemoveConjoint(index)}
                        color="secondary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                )}
              </Grid>

              {/* Enfants */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Enfants</Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                  <TextField
                    label="Code"
                    value={enfantForm.code}
                    onChange={(e) => setEnfantForm({ ...enfantForm, code: e.target.value })}
                    sx={{ minWidth: 120 }}
                  />
                  <TextField
                    label="Nom *"
                    value={enfantForm.nom}
                    onChange={(e) => setEnfantForm({ ...enfantForm, nom: e.target.value })}
                    required
                    sx={{ flex: 1, minWidth: 150 }}
                  />
                  <TextField
                    label="Prénom *"
                    value={enfantForm.prenom}
                    onChange={(e) => setEnfantForm({ ...enfantForm, prenom: e.target.value })}
                    required
                    sx={{ flex: 1, minWidth: 150 }}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={handleAddEnfant}
                    disabled={!enfantForm.nom || !enfantForm.prenom}
                  >
                    Ajouter
                  </Button>
                </Box>
                {formData.enfants.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.enfants.map((enfant, index) => (
                      <Chip
                        key={index}
                        label={`${enfant.nom} ${enfant.prenom}${enfant.code ? ' (' + enfant.code + ')' : ''}`}
                        onDelete={() => handleRemoveEnfant(index)}
                        color="success"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                )}
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !formData.matricule || !formData.nom || !formData.prenom || !formData.dateNaissance || !formData.dateEmbauche || !formData.gradeId || !formData.statutId}
          >
            {loading ? 'Création...' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
