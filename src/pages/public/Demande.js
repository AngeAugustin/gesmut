import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Alert, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, IconButton } from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { demandesService } from '../../services/demandesService';
import { postesService } from '../../services/postesService';
import { referentielsService } from '../../services/referentielsService';
import { uploadService } from '../../services/uploadService';
import { useToast } from '../../context/ToastContext';
import DemandeWizard from '../../components/wizard/DemandeWizard';
import Step1InformationsPersonnelles from '../../components/wizard/steps/Step1InformationsPersonnelles';
import Step2Famille from '../../components/wizard/steps/Step2Famille';
import Step3DetailsDemande from '../../components/wizard/steps/Step3DetailsDemande';
import Step4PiecesJustificatives from '../../components/wizard/steps/Step4PiecesJustificatives';
import Step5Recapitulatif from '../../components/wizard/steps/Step5Recapitulatif';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const publicApi = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default function Demande() {
  const { warning, error: showError } = useToast();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    matricule: '',
    nom: '',
    prenom: '',
    nomMariage: '',
    adresseVille: '',
    sexe: '',
    email: '',
    photo: null,
    photoPreview: null,
    conjoints: [],
    enfants: [],
    motif: '',
    posteSouhaiteId: '',
    localisationSouhaiteId: '',
    directionId: '',
    serviceId: '',
  });
  const [conjointForm, setConjointForm] = useState({ code: '', nom: '', prenom: '' });
  const [enfantForm, setEnfantForm] = useState({ code: '', nom: '', prenom: '' });
  const [postes, setPostes] = useState([]);
  const [localites, setLocalites] = useState([]);
  const [directions, setDirections] = useState([]);
  const [services, setServices] = useState([]);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demandeId, setDemandeId] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postesRes, localitesRes, directionsRes, servicesRes] = await Promise.all([
          publicApi.get('/postes/libres'),
          publicApi.get('/referentiels/localites'),
          publicApi.get('/referentiels/directions'),
          publicApi.get('/referentiels/services'),
        ]);
        setPostes(postesRes.data);
        setLocalites(localitesRes.data);
        setDirections(directionsRes.data || []);
        setServices(servicesRes.data || []);
      } catch (error) {
        console.error('Erreur lors du chargement des données', error);
        setDirections([]);
        setServices([]);
      }
    };
    fetchData();
  }, []);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files).slice(0, 4);
    setFiles(selectedFiles);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 3145728) {
        warning('La photo ne doit pas dépasser 3 Mo');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          photo: file,
          photoPreview: reader.result,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
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

  const validateStep = (step) => {
    switch (step) {
      case 0:
        return (
          formData.matricule &&
          formData.nom &&
          formData.prenom &&
          formData.email &&
          formData.email.includes('@') &&
          formData.directionId &&
          formData.serviceId
        );
      case 1:
        return true;
      case 2:
        return formData.motif.trim().length > 0;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prev) => Math.min(prev + 1, 4));
    } else {
      warning('Veuillez remplir tous les champs obligatoires avant de continuer');
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      if (!formData.motif.trim()) {
        throw new Error('Le motif est obligatoire');
      }
      if (!formData.matricule || !formData.nom || !formData.prenom) {
        throw new Error('Les informations de base (matricule, nom, prénom) sont obligatoires');
      }
      if (!formData.email || !formData.email.includes('@')) {
        throw new Error('Un email valide est obligatoire pour recevoir la décision finale');
      }
      if (!formData.directionId || !formData.serviceId) {
        throw new Error('La direction et le service sont obligatoires pour déterminer les responsables hiérarchiques');
      }

      let photoId = null;
      if (formData.photo) {
        const photoRes = await uploadService.uploadFile(formData.photo, true);
        photoId = photoRes.fileId;
      }

      const piecesJustificatives = [];
      for (const file of files) {
        if (file.size > 3145728) {
          throw new Error(`Le fichier ${file.name} dépasse 3 Mo`);
        }
        const uploadRes = await uploadService.uploadFile(file, true);
        piecesJustificatives.push({
          nom: file.name,
          type: file.type,
          taille: file.size,
          fichierId: uploadRes.fileId,
        });
      }

      const response = await demandesService.createPublic({
        motif: formData.motif,
        posteSouhaiteId: formData.posteSouhaiteId || undefined,
        localisationSouhaiteId: formData.localisationSouhaiteId || undefined,
        piecesJustificatives,
        informationsAgent: {
          matricule: formData.matricule,
          nom: formData.nom,
          prenom: formData.prenom,
          nomMariage: formData.nomMariage,
          adresseVille: formData.adresseVille,
          sexe: formData.sexe,
          email: formData.email,
          directionId: formData.directionId,
          serviceId: formData.serviceId,
          conjoints: formData.conjoints,
          enfants: formData.enfants,
          photo: photoId,
        },
      });

      const demandeId = response.data?._id || response.data?.id || response._id;
      if (!demandeId) {
        throw new Error('Impossible de récupérer l\'identifiant de la demande');
      }

      setDemandeId(demandeId);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la création de la demande';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(demandeId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCloseDialog = () => {
    setDemandeId(null);
    navigate('/');
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Step1InformationsPersonnelles
            formData={formData}
            setFormData={setFormData}
            directions={directions}
            services={services}
            onPhotoChange={handlePhotoChange}
          />
        );
      case 1:
        return (
          <Step2Famille
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
        );
      case 2:
        return (
          <Step3DetailsDemande
            formData={formData}
            setFormData={setFormData}
            postes={postes}
            localites={localites}
          />
        );
      case 3:
        return (
          <Step4PiecesJustificatives
            files={files}
            onFileChange={handleFileChange}
            onRemoveFile={handleRemoveFile}
          />
        );
      case 4:
        return (
          <Step5Recapitulatif
            formData={formData}
            files={files}
            postes={postes}
            localites={localites}
            directions={directions}
            services={services}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 4 }}>
      {error && (
        <Box sx={{ maxWidth: 1200, mx: 'auto', mb: 2, px: 2 }}>
          <Alert severity="error" onClose={() => setError('')}>
            {error}
          </Alert>
        </Box>
      )}
      <DemandeWizard
        activeStep={activeStep}
        onStepChange={setActiveStep}
        onNext={handleNext}
        onBack={handleBack}
        onSubmit={handleSubmit}
        loading={loading}
        canProceed={validateStep(activeStep)}
      >
        {renderStepContent()}
      </DemandeWizard>

      {/* Dialog avec identifiant de la demande */}
      <Dialog open={!!demandeId} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" component="div">
            Demande créée avec succès !
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Votre demande a été enregistrée. Veuillez copier l'identifiant de votre demande pour pouvoir suivre son évolution.
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 2,
                bgcolor: 'grey.100',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'grey.300',
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  color: 'primary.main',
                  flex: 1,
                }}
              >
                {demandeId}
              </Typography>
              <IconButton
                onClick={handleCopyId}
                color="primary"
                sx={{
                  bgcolor: 'white',
                  '&:hover': { bgcolor: 'grey.50' },
                }}
              >
                {copied ? <CheckIcon /> : <ContentCopyIcon />}
              </IconButton>
            </Box>
            {copied && (
              <Typography variant="caption" color="success.main" sx={{ mt: 1, display: 'block' }}>
                Identifiant copié !
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Vous pouvez utiliser cet identifiant sur la page de suivi pour connaître l'état d'avancement de votre demande.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => navigate('/suivi')} variant="outlined">
            Suivre ma demande
          </Button>
          <Button onClick={handleCloseDialog} variant="contained" color="primary">
            Retour à l'accueil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
