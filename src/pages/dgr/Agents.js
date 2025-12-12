import React, { useEffect, useState } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Chip,
  Button,
  Alert,
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
import AgentWizard from '../../components/wizard/AgentWizard';
import Step1AgentInfosPersonnelles from '../../components/wizard/steps/agent/Step1AgentInfosPersonnelles';
import Step2AgentFamille from '../../components/wizard/steps/agent/Step2AgentFamille';
import Step3AgentProfessionnel from '../../components/wizard/steps/agent/Step3AgentProfessionnel';
import Step4AgentDiplomesCompetences from '../../components/wizard/steps/agent/Step4AgentDiplomesCompetences';
import Step5AgentRecapitulatif from '../../components/wizard/steps/agent/Step5AgentRecapitulatif';

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
  const [activeStep, setActiveStep] = useState(0);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [conjointForm, setConjointForm] = useState({ code: '', nom: '', prenom: '' });
  const [enfantForm, setEnfantForm] = useState({ code: '', nom: '', prenom: '' });
  const [competenceForm, setCompetenceForm] = useState({ competenceId: '', nom: '', categorie: 'A', niveau: '' });
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
    ifu: '',
    npi: '',
    adresseVille: '',
    gradeId: '',
    statutId: '',
    serviceId: '',
    localisationActuelleId: '',
    affectationsPostes: [],
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
        console.log('Affectations postes du premier agent:', agentsRes.data[0].affectationsPostes);
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
      ifu: '',
      npi: '',
      adresseVille: '',
      gradeId: '',
      statutId: '',
      directionId: '',
      serviceId: '',
      localisationActuelleId: '',
      affectationsPostes: [],
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
    setCompetenceForm({ competenceId: '', nom: '', categorie: 'A', niveau: '' });
    setActiveStep(0);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setActiveStep(0);
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
      ifu: '',
      npi: '',
      adresseVille: '',
      gradeId: '',
      statutId: '',
      directionId: '',
      serviceId: '',
      localisationActuelleId: '',
      affectationsPostes: [],
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
    setCompetenceForm({ competenceId: '', nom: '', categorie: 'A', niveau: '' });
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
    if (competenceForm.competenceId && competenceForm.nom) {
      // Ne garder que nom, categorie et niveau (pas competenceId dans les données finales)
      const { competenceId, ...competenceData } = competenceForm;
      setFormData((prev) => ({
        ...prev,
        competences: [...prev.competences, competenceData],
      }));
      setCompetenceForm({ competenceId: '', nom: '', categorie: 'A', niveau: '' });
    }
  };

  const handleRemoveCompetence = (index) => {
    setFormData((prev) => ({
      ...prev,
      competences: prev.competences.filter((_, i) => i !== index),
    }));
  };

  // Validation des étapes
  const canProceedToNextStep = () => {
    switch (activeStep) {
      case 0: // Informations personnelles
        return !!(formData.matricule && formData.nom && formData.prenom && formData.dateNaissance);
      case 1: // Famille - toujours possible (optionnel)
        return true;
      case 2: // Informations professionnelles
        return !!(
          formData.dateEmbauche &&
          formData.gradeId &&
          formData.statutId &&
          formData.directionId &&
          formData.serviceId
        );
      case 3: // Diplômes et compétences - toujours possible (optionnel)
        return true;
      case 4: // Récapitulatif
        return true;
      default:
        return false;
    }
  };

  const handleNextStep = () => {
    if (canProceedToNextStep()) {
      setActiveStep((prev) => Math.min(prev + 1, 4));
    } else {
      warning('Veuillez remplir tous les champs obligatoires avant de continuer.');
    }
  };

  const handleBackStep = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
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
      if (formData.ifu && formData.ifu.trim()) {
        agentData.ifu = formData.ifu.trim();
      }
      if (formData.npi && formData.npi.trim()) {
        agentData.npi = formData.npi.trim();
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
      if (formData.affectationsPostes && formData.affectationsPostes.length > 0) {
        agentData.affectationsPostes = formData.affectationsPostes.map((aff) => ({
          posteId: aff.posteId,
          dateDebut: new Date(aff.dateDebut).toISOString(),
          dateFin: aff.dateFin ? new Date(aff.dateFin).toISOString() : null,
          motifFin: aff.motifFin || null,
        }));
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
      await fetchData();
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <PageHeader
          title="Gestion des agents"
          subtitle="Consultez et gérez tous les agents du système"
        />
      </Box>

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

      {/* Wizard pour créer un agent */}
      {openDialog && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 1300,
            overflow: 'auto',
            py: 4,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseDialog();
            }
          }}
        >
          <AgentWizard
            activeStep={activeStep}
            onStepChange={setActiveStep}
            onNext={handleNextStep}
            onBack={handleBackStep}
            onSubmit={handleSubmit}
            loading={loading}
            canProceed={canProceedToNextStep()}
          >
            {activeStep === 0 && (
              <Step1AgentInfosPersonnelles
                formData={formData}
                setFormData={setFormData}
                photoPreview={photoPreview}
                onPhotoChange={handlePhotoChange}
                onRemovePhoto={handleRemovePhoto}
              />
            )}
            {activeStep === 1 && (
              <Step2AgentFamille
                formData={formData}
                setFormData={setFormData}
                conjointForm={conjointForm}
                setConjointForm={setConjointForm}
                enfantForm={enfantForm}
                setEnfantForm={setEnfantForm}
                onAddConjoint={handleAddConjoint}
                onRemoveConjoint={handleRemoveConjoint}
                onAddEnfant={handleAddEnfant}
                onRemoveEnfant={handleRemoveEnfant}
              />
            )}
            {activeStep === 2 && (
              <Step3AgentProfessionnel
                formData={formData}
                setFormData={setFormData}
                grades={grades}
                statuts={statuts}
                directions={directions}
                services={services}
                localites={localites}
                postes={postes}
              />
            )}
            {activeStep === 3 && (
              <Step4AgentDiplomesCompetences
                formData={formData}
                setFormData={setFormData}
                diplomes={diplomes}
                competences={competences}
                competenceForm={competenceForm}
                setCompetenceForm={setCompetenceForm}
                onAddCompetence={handleAddCompetence}
                onRemoveCompetence={handleRemoveCompetence}
              />
            )}
            {activeStep === 4 && (
              <Step5AgentRecapitulatif
                formData={formData}
                photoPreview={photoPreview}
                grades={grades}
                statuts={statuts}
                directions={directions}
                services={services}
                localites={localites}
                postes={postes}
                diplomes={diplomes}
              />
            )}
          </AgentWizard>
        </Box>
      )}


    </Box>
  );
}
