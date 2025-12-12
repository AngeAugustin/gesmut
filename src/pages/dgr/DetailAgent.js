import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar,
  CircularProgress,
  Alert,
  Dialog,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SchoolIcon from '@mui/icons-material/School';
import StarIcon from '@mui/icons-material/Star';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import BadgeIcon from '@mui/icons-material/Badge';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import WorkIcon from '@mui/icons-material/Work';
import { agentsService } from '../../services/agentsService';
import { referentielsService } from '../../services/referentielsService';
import { postesService } from '../../services/postesService';
import { uploadService } from '../../services/uploadService';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/errorHandler';
import PageHeader from '../../components/common/PageHeader';
import AffectationsTimeline from '../../components/common/AffectationsTimeline';
import AgentWizard from '../../components/wizard/AgentWizard';
import Step1AgentInfosPersonnelles from '../../components/wizard/steps/agent/Step1AgentInfosPersonnelles';
import Step2AgentFamille from '../../components/wizard/steps/agent/Step2AgentFamille';
import Step3AgentProfessionnel from '../../components/wizard/steps/agent/Step3AgentProfessionnel';
import Step4AgentDiplomesCompetences from '../../components/wizard/steps/agent/Step4AgentDiplomesCompetences';
import Step5AgentRecapitulatif from '../../components/wizard/steps/agent/Step5AgentRecapitulatif';

export default function DetailAgent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { success, error: showError, warning } = useToast();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anciennete, setAnciennete] = useState(null);
  const [photoError, setPhotoError] = useState(false);
  
  // États pour le wizard de modification
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [loadingUpdate, setLoadingUpdate] = useState(false);
  const [grades, setGrades] = useState([]);
  const [services, setServices] = useState([]);
  const [directions, setDirections] = useState([]);
  const [statuts, setStatuts] = useState([]);
  const [localites, setLocalites] = useState([]);
  const [postes, setPostes] = useState([]);
  const [diplomes, setDiplomes] = useState([]);
  const [competences, setCompetences] = useState([]);
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
    directionId: '',
    serviceId: '',
    localisationActuelleId: '',
    affectationsPostes: [],
    diplomeIds: [],
    competences: [],
    conjoints: [],
    enfants: [],
  });
  
  // Déterminer le chemin de retour selon le rôle
  const getBackPath = () => {
    if (location.pathname.startsWith('/admin')) {
      return '/admin/agents';
    }
    if (location.pathname.startsWith('/dncf')) {
      return '/dncf/mutations-strategiques';
    }
    return '/dgr/agents';
  };

  const fetchAgentData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [agentRes, ancienneteRes] = await Promise.all([
        agentsService.getById(id),
        agentsService.getAnciennete(id).catch(() => ({ data: { anciennete: 0 } })),
      ]);
      console.log('Agent reçu:', agentRes.data);
      console.log('Grade:', agentRes.data?.gradeId);
      console.log('Statut:', agentRes.data?.statutId);
      console.log('Service:', agentRes.data?.serviceId);
      console.log('Localisation:', agentRes.data?.localisationActuelleId);
      console.log('Affectations postes:', agentRes.data?.affectationsPostes);
      if (agentRes.data?.affectationsPostes && agentRes.data.affectationsPostes.length > 0) {
        console.log('Première affectation:', agentRes.data.affectationsPostes[0]);
        console.log('Poste de la première affectation:', agentRes.data.affectationsPostes[0]?.posteId);
      }
      setAgent(agentRes.data);
      setAnciennete(ancienneteRes.data?.anciennete || 0);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'agent:', error);
      setError('Erreur lors du chargement des informations de l\'agent');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentData();
  }, [id]);

  const fetchReferentiels = async () => {
    try {
      const [gradesRes, servicesRes, directionsRes, statutsRes, localitesRes, postesRes, diplomesRes, competencesRes] = await Promise.all([
        referentielsService.getGrades(),
        referentielsService.getServices(),
        referentielsService.getDirections(),
        referentielsService.getStatuts(),
        referentielsService.getLocalites(),
        postesService.getAll(),
        referentielsService.getDiplomes(),
        referentielsService.getCompetences(),
      ]);
      setGrades(gradesRes.data);
      setServices(servicesRes.data);
      setDirections(directionsRes.data);
      setStatuts(statutsRes.data);
      setLocalites(localitesRes.data);
      setPostes(postesRes.data);
      setDiplomes(diplomesRes.data);
      setCompetences(competencesRes.data);
    } catch (error) {
      console.error('Erreur lors du chargement des référentiels:', error);
      showError('Erreur lors du chargement des référentiels');
    }
  };

  const initializeFormData = (agentData) => {
    if (!agentData) return;
    
    // Formater les dates pour les inputs
    const formatDateForInput = (date) => {
      if (!date) return '';
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Récupérer les IDs (peuvent être des objets ou des strings)
    const getObjectId = (obj) => {
      if (!obj) return '';
      if (typeof obj === 'string') return obj;
      if (typeof obj === 'object' && obj._id) return obj._id.toString();
      return '';
    };

    // Récupérer directionId depuis serviceId si disponible
    let directionId = '';
    if (agentData.serviceId) {
      const service = typeof agentData.serviceId === 'object' && agentData.serviceId !== null
        ? agentData.serviceId
        : null;
      if (service && service.directionId) {
        directionId = getObjectId(service.directionId);
      }
    }

    setFormData({
      matricule: agentData.matricule || '',
      nom: agentData.nom || '',
      prenom: agentData.prenom || '',
      nomMariage: agentData.nomMariage || '',
      sexe: agentData.sexe || '',
      dateNaissance: formatDateForInput(agentData.dateNaissance),
      dateEmbauche: formatDateForInput(agentData.dateEmbauche),
      email: agentData.email || '',
      telephone: agentData.telephone || '',
      ifu: agentData.ifu || '',
      npi: agentData.npi || '',
      adresseVille: agentData.adresseVille || '',
      gradeId: getObjectId(agentData.gradeId),
      statutId: getObjectId(agentData.statutId),
      directionId: directionId,
      serviceId: getObjectId(agentData.serviceId),
      localisationActuelleId: getObjectId(agentData.localisationActuelleId),
      affectationsPostes: agentData.affectationsPostes || [],
      diplomeIds: agentData.diplomeIds ? agentData.diplomeIds.map(getObjectId) : [],
      competences: agentData.competences || [],
      conjoints: agentData.conjoints || [],
      enfants: agentData.enfants || [],
    });

    // Charger la photo si elle existe
    if (agentData.photo) {
      setPhotoPreview(uploadService.getFile(agentData.photo));
    } else {
      setPhotoPreview(null);
    }
    setPhotoFile(null);
  };

  const handleOpenEdit = async () => {
    await fetchReferentiels();
    initializeFormData(agent);
    setActiveStep(0);
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setActiveStep(0);
    setPhotoFile(null);
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

  const canProceedToNextStep = () => {
    switch (activeStep) {
      case 0:
        return !!(formData.matricule && formData.nom && formData.prenom && formData.dateNaissance);
      case 1:
        return true;
      case 2:
        return !!(formData.dateEmbauche && formData.gradeId && formData.statutId && formData.directionId && formData.serviceId);
      case 3:
        return true;
      case 4:
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

  const handleUpdate = async () => {
    if (!formData.matricule || !formData.nom || !formData.prenom || !formData.dateNaissance || !formData.dateEmbauche || !formData.gradeId || !formData.statutId || !formData.directionId || !formData.serviceId) {
      warning('Veuillez remplir tous les champs obligatoires (y compris la direction et le service)');
      return;
    }

    try {
      setLoadingUpdate(true);
      
      // Upload de la photo si elle existe
      let photoId = agent?.photo || null;
      if (photoFile) {
        try {
          const photoRes = await uploadService.uploadFile(photoFile);
          photoId = photoRes.fileId;
        } catch (uploadError) {
          console.error('Erreur lors de l\'upload de la photo:', uploadError);
          warning('Erreur lors de l\'upload de la photo. L\'agent sera mis à jour sans nouvelle photo.');
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
          posteId: typeof aff.posteId === 'object' && aff.posteId !== null ? (aff.posteId._id || aff.posteId) : aff.posteId,
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

      await agentsService.update(id, agentData);
      success('Agent modifié avec succès !');
      handleCloseEditDialog();
      await fetchAgentData();
    } catch (err) {
      console.error('Erreur lors de la modification de l\'agent:', err);
      const errorMessage = getErrorMessage(err);
      showError(`Erreur lors de la modification: ${errorMessage}`);
    } finally {
      setLoadingUpdate(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !agent) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Agent non trouvé'}
        </Alert>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/dgr/agents')}>
          Retour à la liste
        </Button>
      </Box>
    );
  }

  const photoUrl = agent.photo && !photoError ? uploadService.getFile(agent.photo) : null;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <PageHeader
          title={`Profil de ${agent.nom} ${agent.prenom}`}
          subtitle={`Matricule: ${agent.matricule}`}
        />
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={handleOpenEdit}
          sx={{ ml: 2 }}
        >
          Modifier
        </Button>
      </Box>

      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(getBackPath())}
        sx={{ mb: 3 }}
      >
        Retour à la liste
      </Button>

      <Grid container spacing={3}>
        {/* Informations principales */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            {photoUrl ? (
              <Avatar
                src={photoUrl}
                alt={`${agent.nom} ${agent.prenom}`}
                sx={{ width: 150, height: 150, mx: 'auto', mb: 2 }}
                onError={() => setPhotoError(true)}
              />
            ) : (
              <Avatar sx={{ width: 150, height: 150, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}>
                <PersonIcon sx={{ fontSize: 80 }} />
              </Avatar>
            )}
            <Typography variant="h5" gutterBottom>
              {agent.nom} {agent.prenom}
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {agent.nomMariage && `Née ${agent.nomMariage}`}
            </Typography>
            <Chip
              label={agent.sexe === 'M' ? 'Masculin' : agent.sexe === 'F' ? 'Féminin' : agent.sexe}
              color="primary"
              size="small"
              sx={{ mt: 1 }}
            />
          </Paper>

          {/* Informations personnelles */}
          <Paper sx={{ p: 3, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Informations personnelles
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
              {agent.dateNaissance && (
                <ListItem>
                  <PersonIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText 
                    primary="Date de naissance" 
                    secondary={new Date(agent.dateNaissance).toLocaleDateString('fr-FR')} 
                  />
                </ListItem>
              )}
              {agent.sexe && (
                <ListItem>
                  <PersonIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText 
                    primary="Sexe" 
                    secondary={agent.sexe === 'M' ? 'Masculin' : agent.sexe === 'F' ? 'Féminin' : agent.sexe} 
                  />
                </ListItem>
              )}
              {agent.email && (
                <ListItem>
                  <EmailIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText primary="Email" secondary={agent.email} />
                </ListItem>
              )}
              {agent.telephone && (
                <ListItem>
                  <PhoneIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText primary="Téléphone" secondary={agent.telephone} />
                </ListItem>
              )}
              {agent.adresseVille && (
                <ListItem>
                  <LocationOnIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText primary="Adresse" secondary={agent.adresseVille} />
                </ListItem>
              )}
              {agent.ifu && (
                <ListItem>
                  <BadgeIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText primary="IFU (Identifiant Fiscal Unique)" secondary={agent.ifu} />
                </ListItem>
              )}
              {agent.npi && (
                <ListItem>
                  <FingerprintIcon sx={{ mr: 2, color: 'text.secondary' }} />
                  <ListItemText primary="NPI (Numéro Personnel d'Identification)" secondary={agent.npi} />
                </ListItem>
              )}
            </List>
          </Paper>
        </Grid>

        {/* Informations détaillées */}
        <Grid item xs={12} md={8}>
          {/* Informations professionnelles */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Informations professionnelles
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Matricule
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {agent.matricule}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Grade
                </Typography>
                <Typography variant="body1">
                  {(() => {
                    const grade = agent.gradeId;
                    if (!grade) return '-';
                    if (typeof grade === 'object' && grade !== null) {
                      return grade.libelle || grade.code || '-';
                    }
                    return '-';
                  })()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Statut
                </Typography>
                <Typography variant="body1">
                  {(() => {
                    const statut = agent.statutId;
                    if (!statut) return '-';
                    if (typeof statut === 'object' && statut !== null) {
                      return statut.libelle || statut.code || '-';
                    }
                    return '-';
                  })()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Service
                </Typography>
                <Typography variant="body1">
                  {(() => {
                    const service = agent.serviceId;
                    if (!service) return '-';
                    if (typeof service === 'object' && service !== null) {
                      return service.libelle || service.code || '-';
                    }
                    return '-';
                  })()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Localisation actuelle
                </Typography>
                <Typography variant="body1">
                  {(() => {
                    const localisation = agent.localisationActuelleId;
                    if (!localisation) return '-';
                    if (typeof localisation === 'object' && localisation !== null) {
                      return localisation.libelle || localisation.code || '-';
                    }
                    return '-';
                  })()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Date d'embauche
                </Typography>
                <Typography variant="body1">
                  {agent.dateEmbauche
                    ? new Date(agent.dateEmbauche).toLocaleDateString('fr-FR')
                    : '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Ancienneté
                </Typography>
                <Typography variant="body1" fontWeight="bold" color="primary.main">
                  {anciennete} an(s)
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Historique des affectations de postes */}
          {agent.affectationsPostes && agent.affectationsPostes.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                <WorkIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Historique des affectations de postes
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <AffectationsTimeline affectationsPostes={agent.affectationsPostes} />
            </Paper>
          )}

          {/* Compétences */}
          {agent.competences && agent.competences.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                <StarIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Compétences
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                {agent.competences.map((competence, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={competence.categorie}
                        size="small"
                        color={competence.categorie === 'A' ? 'primary' : competence.categorie === 'B' ? 'info' : 'default'}
                      />
                      <Typography variant="body1" fontWeight="bold">
                        {competence.nom}
                      </Typography>
                      {competence.niveau && (
                        <Chip
                          label={competence.niveau}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}

          {/* Diplômes */}
          {agent.diplomeIds && agent.diplomeIds.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                <SchoolIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Diplômes
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                {agent.diplomeIds.map((diplome, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={diplome.libelle || diplome.code || `Diplôme ${index + 1}`}
                      secondary={diplome.description}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}

          {/* Famille */}
          {(agent.conjoints?.length > 0 || agent.enfants?.length > 0) && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                <FamilyRestroomIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Situation familiale
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {agent.conjoints && agent.conjoints.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Conjoint(s)
                  </Typography>
                  <List>
                    {agent.conjoints.map((conjoint, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={`${conjoint.prenom} ${conjoint.nom}`}
                          secondary={conjoint.code && `Code: ${conjoint.code}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
              {agent.enfants && agent.enfants.length > 0 && (
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Enfant(s)
                  </Typography>
                  <List>
                    {agent.enfants.map((enfant, index) => (
                      <ListItem key={index}>
                        <ListItemText
                          primary={`${enfant.prenom} ${enfant.nom}`}
                          secondary={enfant.code && `Code: ${enfant.code}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Paper>
          )}
        </Grid>
      </Grid>

      {/* Dialog de modification */}
      <Dialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: '80vh',
            maxHeight: '90vh',
          },
        }}
      >
        <AgentWizard
          activeStep={activeStep}
          onStepChange={setActiveStep}
          onNext={handleNextStep}
          onBack={handleBackStep}
          onSubmit={handleUpdate}
          loading={loadingUpdate}
          canProceed={canProceedToNextStep()}
          isEditMode={true}
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
      </Dialog>
    </Box>
  );
}

