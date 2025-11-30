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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import { demandesService } from '../../services/demandesService';
import { validationsService } from '../../services/validationsService';
import { documentsService } from '../../services/documentsService';
import { uploadService } from '../../services/uploadService';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HistoryIcon from '@mui/icons-material/History';
import PersonIcon from '@mui/icons-material/Person';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import PendingIcon from '@mui/icons-material/Pending';
import TextField from '@mui/material/TextField';
import StatusChip from '../../components/common/StatusChip';
import PageHeader from '../../components/common/PageHeader';
import { useToast } from '../../context/ToastContext';

const getStatusColor = (status) => {
  const colors = {
    BROUILLON: 'default',
    SOUMISE: 'info',
    INELIGIBLE: 'warning',
    EN_VALIDATION_HIERARCHIQUE: 'warning',
    VALIDEE_HIERARCHIQUE: 'success',
    REJETEE_HIERARCHIQUE: 'error',
    EN_ETUDE_DGR: 'warning',
    AVIS_DGR_FAVORABLE: 'success',
    AVIS_DGR_DEFAVORABLE: 'error',
    EN_VERIFICATION_CVR: 'warning',
    VALIDEE_CVR: 'success',
    REJETEE_CVR: 'error',
    EN_ETUDE_DNCF: 'warning',
    ACCEPTEE: 'success',
    REJETEE: 'error',
  };
  return colors[status] || 'default';
};

export default function DetailDemande() {
  const { success, error, warning } = useToast();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [demande, setDemande] = useState(null);
  const [validations, setValidations] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openSoumettre, setOpenSoumettre] = useState(false);
  const [openValidation, setOpenValidation] = useState(false);
  const [commentaireValidation, setCommentaireValidation] = useState('');
  const [validationDecision, setValidationDecision] = useState('VALIDE');
  const [loadingValidation, setLoadingValidation] = useState(false);

  // Déterminer le rôle et le chemin de retour depuis l'URL
  const getRoleFromPath = () => {
    if (location.pathname.includes('/agent/')) return 'agent';
    if (location.pathname.includes('/responsable/')) return 'responsable';
    if (location.pathname.includes('/dgr/')) return 'dgr';
    if (location.pathname.includes('/cvr/')) return 'cvr';
    if (location.pathname.includes('/admin/')) return 'admin';
    if (location.pathname.includes('/dncf/')) return 'dncf';
    return 'agent';
  };

  const role = getRoleFromPath();
  const backPath = role === 'responsable' 
    ? '/responsable/validations' 
    : role === 'cvr'
    ? '/cvr/verifications'
    : `/${role}/demandes`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [demandeRes, validationsRes, documentsRes] = await Promise.all([
          demandesService.getById(id),
          validationsService.getByDemande(id),
          documentsService.findByDemande(id),
        ]);
        setDemande(demandeRes.data);
        // S'assurer que validations est un tableau
        const validationsData = Array.isArray(validationsRes.data) ? validationsRes.data : [];
        setValidations(validationsData);
        setDocuments(documentsRes.data);
        
        // Debug pour vérifier les validations
        if (validationsData.length > 0) {
          console.log('Validations récupérées:', validationsData);
          validationsData.forEach(v => {
            console.log(`Validation - Role: ${v.validateurRole}, Decision: ${v.decision}, Date: ${v.dateValidation}`);
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleSoumettre = async () => {
    try {
      await demandesService.soumettre(id);
      setOpenSoumettre(false);
      navigate(backPath);
      success('Demande soumise avec succès');
    } catch (err) {
      console.error('Erreur lors de la soumission', err);
      error('Erreur lors de la soumission');
    }
  };

  const handleValidation = async () => {
    if (!commentaireValidation.trim()) {
      warning('Le commentaire est obligatoire');
      return;
    }
    setLoadingValidation(true);
    try {
      await validationsService.create({
        demandeId: id,
        decision: validationDecision,
        commentaire: commentaireValidation,
        validateurRole: role.toUpperCase(), // Envoyer le rôle du validateur
      });
      setOpenValidation(false);
      setCommentaireValidation('');
      // Recharger les données
      const [demandeRes, validationsRes] = await Promise.all([
        demandesService.getById(id),
        validationsService.getByDemande(id),
      ]);
      setDemande(demandeRes.data);
      setValidations(validationsRes.data);
      success(validationDecision === 'VALIDE' ? 'Demande validée avec succès' : 'Demande rejetée');
    } catch (err) {
      console.error('Erreur lors de la validation', err);
      error('Erreur lors de la validation');
    } finally {
      setLoadingValidation(false);
    }
  };

  const handleDownloadDocument = async (documentId) => {
    try {
      const response = await documentsService.downloadDocument(documentId);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `document_${documentId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur lors du téléchargement du document:', err);
      error('Erreur lors du téléchargement du document');
    }
  };

  const handleDownloadFile = (fileId) => {
    window.open(uploadService.getFile(fileId), '_blank');
  };

  if (loading) {
    return <Typography>Chargement...</Typography>;
  }

  if (!demande) {
    return <Alert severity="error">Demande non trouvée</Alert>;
  }

  // Gérer les données populées ou non
  // Pour les demandes publiques, agentId est null et les infos sont dans informationsAgent
  const agent = demande.agentId;
  let agentNom = '-';
  let agentPrenom = '';
  let agentMatricule = null;
  let agentPhoto = null;
  
  if (agent && typeof agent === 'object' && agent !== null) {
    // Agent connecté (agentId populé)
    agentNom = agent.nom || '';
    agentPrenom = agent.prenom || '';
    agentMatricule = agent.matricule;
    agentPhoto = agent.photo;
  } else if (demande.informationsAgent) {
    // Demande publique (informationsAgent)
    agentNom = demande.informationsAgent.nom || '';
    agentPrenom = demande.informationsAgent.prenom || '';
    agentMatricule = demande.informationsAgent.matricule;
    agentPhoto = demande.informationsAgent.photo;
  }
  
  const agentNomComplet = `${agentNom} ${agentPrenom}`.trim() || '-';

  const poste = demande.posteSouhaiteId;
  const posteLibelle = typeof poste === 'object' && poste !== null
    ? poste.intitule
    : '-';

  const localisation = demande.localisationSouhaiteId;
  const localisationLibelle = typeof localisation === 'object' && localisation !== null
    ? localisation.libelle
    : '-';

  return (
    <Box>
      <PageHeader
        title="Détails de la demande"
        subtitle={`Demande de mutation ${demande.type === 'SIMPLE' ? 'simple' : 'stratégique'}`}
        action={
          <Box>
            {role === 'agent' && demande.statut === 'BROUILLON' && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => setOpenSoumettre(true)}
                sx={{ mr: 1 }}
              >
                Soumettre
              </Button>
            )}
            {role === 'responsable' && demande.statut === 'EN_VALIDATION_HIERARCHIQUE' && 
              !validations.some(v => v.validateurRole && String(v.validateurRole).toUpperCase() === 'RESPONSABLE') && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => {
                    setOpenValidation(true);
                    setValidationDecision('VALIDE');
                  }}
                  sx={{ mr: 1 }}
                >
                  Valider
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => {
                    setOpenValidation(true);
                    setValidationDecision('REJETE');
                  }}
                  sx={{ mr: 1 }}
                >
                  Rejeter
                </Button>
              </>
            )}
            {role === 'dgr' && (demande.statut === 'VALIDEE_HIERARCHIQUE' || demande.statut === 'EN_ETUDE_DGR' || demande.statut === 'AVIS_DGR_FAVORABLE' || demande.statut === 'AVIS_DGR_DEFAVORABLE') && 
              !validations.some(v => v.validateurRole && String(v.validateurRole).toUpperCase() === 'DGR') && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => {
                    setOpenValidation(true);
                    setValidationDecision('VALIDE');
                  }}
                  sx={{ mr: 1 }}
                >
                  Avis favorable
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => {
                    setOpenValidation(true);
                    setValidationDecision('REJETE');
                  }}
                  sx={{ mr: 1 }}
                >
                  Avis défavorable
                </Button>
              </>
            )}
            {role === 'cvr' && (demande.statut === 'EN_VERIFICATION_CVR' || demande.statut === 'AVIS_DGR_FAVORABLE' || demande.statut === 'EN_ETUDE_DNCF') && 
              !validations.some(v => v.validateurRole && String(v.validateurRole).toUpperCase() === 'CVR') && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<CheckCircleIcon />}
                  onClick={() => {
                    setOpenValidation(true);
                    setValidationDecision('VALIDE');
                  }}
                  sx={{ mr: 1 }}
                >
                  Valider
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => {
                    setOpenValidation(true);
                    setValidationDecision('REJETE');
                  }}
                  sx={{ mr: 1 }}
                >
                  Rejeter
                </Button>
              </>
            )}
            <Button variant="outlined" onClick={() => navigate(backPath)}>
              Retour
            </Button>
          </Box>
        }
      />

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Informations générales
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Statut
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <StatusChip status={demande.statut} />
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Type
                </Typography>
                <Typography variant="body1">
                  {demande.type === 'SIMPLE' ? 'Simple' : 'Stratégique'}
                </Typography>
              </Grid>
              {role !== 'agent' && (
                <>
                  {agentPhoto && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Photo
                      </Typography>
                      <Box
                        component="img"
                        src={uploadService.getFile(agentPhoto)}
                        alt={`${agentNom} ${agentPrenom}`}
                        sx={{
                          width: 150,
                          height: 150,
                          objectFit: 'cover',
                          borderRadius: 2,
                          border: '2px solid',
                          borderColor: 'divider',
                          boxShadow: 2,
                        }}
                      />
                    </Grid>
                  )}
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Nom
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {agentNom || '-'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Prénom
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {agentPrenom || '-'}
                    </Typography>
                  </Grid>
                  {agentMatricule && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Matricule
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600, fontFamily: 'monospace' }}>
                        {agentMatricule}
                      </Typography>
                    </Grid>
                  )}
                </>
              )}
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Motif
                </Typography>
                <Typography variant="body1">{demande.motif || '-'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Poste souhaité
                </Typography>
                <Typography variant="body1">
                  {posteLibelle}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Localisation souhaitée
                </Typography>
                <Typography variant="body1">
                  {localisationLibelle}
                </Typography>
              </Grid>
              {demande.raisonsIneligibilite && demande.raisonsIneligibilite.length > 0 && (
                <Grid item xs={12}>
                  <Alert severity="warning">
                    <Typography variant="subtitle2" gutterBottom>
                      Raisons d'inéligibilité:
                    </Typography>
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {demande.raisonsIneligibilite.map((raison, index) => (
                        <li key={index}>
                          <Typography variant="body2">{raison}</Typography>
                        </li>
                      ))}
                    </ul>
                  </Alert>
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Date de création
                </Typography>
                <Typography variant="body1">
                  {new Date(demande.createdAt).toLocaleString('fr-FR')}
                </Typography>
              </Grid>
              {demande.dateSoumission && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Date de soumission
                  </Typography>
                  <Typography variant="body1">
                    {new Date(demande.dateSoumission).toLocaleString('fr-FR')}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <HistoryIcon color="primary" />
              <Typography variant="h6">
                Historique de la demande
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            
            {validations.length === 0 ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                Aucune validation enregistrée pour le moment.
              </Alert>
            ) : (
              <Box>
                {validations.map((validation, index) => {
                  const getRoleLabel = (role) => {
                    const labels = {
                      RESPONSABLE: 'Responsable hiérarchique',
                      DGR: 'DGR',
                      CVR: 'CVR',
                      DNCF: 'DNCF',
                    };
                    return labels[role] || role;
                  };

                  const getDecisionLabel = (decision) => {
                    return decision === 'VALIDE' ? 'Validé' : 'Rejeté';
                  };

                  return (
                    <Box
                      key={validation._id}
                      sx={{
                        position: 'relative',
                        pl: 4,
                        pb: 3,
                        borderLeft: index < validations.length - 1 ? '2px solid' : 'none',
                        borderColor: 'divider',
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          left: -8,
                          top: 4,
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          bgcolor: validation.decision === 'VALIDE' ? 'success.main' : 'error.main',
                          border: '2px solid',
                          borderColor: 'background.paper',
                        }}
                      />
                      <Box sx={{ mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <PersonIcon fontSize="small" color="action" />
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {getRoleLabel(validation.validateurRole)}
                          </Typography>
                          <Chip
                            label={getDecisionLabel(validation.decision)}
                            color={validation.decision === 'VALIDE' ? 'success' : 'error'}
                            size="small"
                            sx={{ ml: 'auto' }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
                          <AccessTimeIcon fontSize="small" color="action" sx={{ fontSize: 14 }} />
                          <Typography variant="caption" color="text.secondary">
                            {new Date(validation.dateValidation).toLocaleString('fr-FR', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Typography>
                        </Box>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            bgcolor: 'background.default',
                            borderLeft: '3px solid',
                            borderColor: validation.decision === 'VALIDE' ? 'success.main' : 'error.main',
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                            Commentaire :
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {validation.commentaire}
                          </Typography>
                        </Paper>
                      </Box>
                    </Box>
                  );
                })}
              </Box>
            )}
            
            {/* Workflow visuel de l'évolution du statut */}
            <Box sx={{ mt: 3, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 3 }}>
                Évolution du statut
              </Typography>
              
              {(() => {
                // Définir les étapes du workflow
                const workflowSteps = [
                  {
                    id: 'creation',
                    label: 'Création',
                    status: 'BROUILLON',
                    icon: <RadioButtonUncheckedIcon />,
                    date: demande.createdAt,
                  },
                  {
                    id: 'soumission',
                    label: 'Soumission',
                    status: 'EN_VALIDATION_HIERARCHIQUE',
                    icon: <RadioButtonUncheckedIcon />,
                    date: demande.dateSoumission,
                  },
                  {
                    id: 'hierarchique',
                    label: 'Validation hiérarchique',
                    status: 'EN_ETUDE_DGR',
                    icon: <RadioButtonUncheckedIcon />,
                    role: 'RESPONSABLE',
                  },
                  {
                    id: 'dgr',
                    label: 'Étude DGR',
                    status: 'EN_VERIFICATION_CVR',
                    icon: <RadioButtonUncheckedIcon />,
                    role: 'DGR',
                  },
                  {
                    id: 'cvr',
                    label: 'Vérification CVR',
                    status: 'EN_ETUDE_DNCF',
                    icon: <RadioButtonUncheckedIcon />,
                    role: 'CVR',
                  },
                  {
                    id: 'dncf',
                    label: 'Décision DNCF',
                    status: 'ACCEPTEE',
                    icon: <RadioButtonUncheckedIcon />,
                    role: 'DNCF',
                  },
                ];

                // Déterminer l'état de chaque étape
                const getStepStatus = (step, stepValidation, stepRejected) => {
                  const currentStatus = demande.statut;
                  
                  // Si la demande est terminée (ACCEPTEE ou REJETEE), toutes les étapes précédentes sont complétées
                  if (currentStatus === 'ACCEPTEE' || currentStatus === 'REJETEE') {
                    if (step.id === 'dncf') {
                      return currentStatus === 'ACCEPTEE' ? 'completed' : 'rejected';
                    }
                    // Si une étape précédente a été rejetée, on l'affiche comme rejetée
                    if (stepRejected) {
                      return 'rejected';
                    }
                    // Si elle a une validation (même si validée), elle est complétée
                    if (stepValidation) {
                      return 'completed';
                    }
                    return 'completed';
                  }

                  // Déterminer quelle étape est en cours
                  const statusMap = {
                    'BROUILLON': 'creation',
                    'SOUMISE': 'soumission',
                    'EN_VALIDATION_HIERARCHIQUE': 'hierarchique',
                    'EN_ETUDE_DGR': 'dgr',
                    'EN_VERIFICATION_CVR': 'cvr',
                    'EN_ETUDE_DNCF': 'dncf',
                  };

                  const currentStepId = statusMap[currentStatus] || 'creation';
                  const stepIndex = workflowSteps.findIndex(s => s.id === step.id);
                  const currentStepIndex = workflowSteps.findIndex(s => s.id === currentStepId);

                  if (stepIndex < currentStepIndex) {
                    // Étape passée - vérifier si elle a été rejetée
                    if (stepRejected) {
                      return 'rejected';
                    }
                    // Si elle a une validation, elle est complétée
                    if (stepValidation) {
                      return 'completed';
                    }
                    return 'completed';
                  } else if (stepIndex === currentStepIndex) {
                    // Étape en cours - vérifier si elle a déjà été traitée
                    if (stepRejected) {
                      return 'rejected';
                    }
                    if (stepValidation) {
                      // Si elle a été traitée mais qu'on est encore à cette étape, c'est complété
                      return 'completed';
                    }
                    return 'current'; // En cours sans traitement
                  } else {
                    return 'pending';
                  }
                };

                return (
                  <Box sx={{ position: 'relative' }}>
                    {workflowSteps.map((step, index) => {
                      // Trouver la validation pour cette étape si elle existe
                      const stepValidation = validations?.find(v => {
                        if (!step.role || !v || !v.validateurRole) return false;
                        // Comparer les rôles (normaliser pour éviter les problèmes de casse)
                        const validationRole = String(v.validateurRole).toUpperCase().trim();
                        const stepRole = String(step.role).toUpperCase().trim();
                        const match = validationRole === stepRole;
                        // Debug pour l'étape hiérarchique
                        if (step.role === 'RESPONSABLE' && match) {
                          console.log('Validation hiérarchique trouvée:', v);
                        }
                        return match;
                      }) || null;
                      
                      // Trouver si cette étape a été rejetée
                      const stepRejected = validations?.find(v => {
                        if (!step.role || !v || !v.validateurRole) return false;
                        const validationRole = String(v.validateurRole).toUpperCase().trim();
                        const stepRole = String(step.role).toUpperCase().trim();
                        return validationRole === stepRole 
                          && String(v.decision || '').toUpperCase() === 'REJETE';
                      }) || null;
                      
                      // Debug pour l'étape hiérarchique
                      if (step.role === 'RESPONSABLE') {
                        console.log('Étape hiérarchique - stepValidation:', stepValidation, 'stepRejected:', stepRejected);
                        if (stepValidation) {
                          console.log('Date validation:', stepValidation.dateValidation, 'CreatedAt:', stepValidation.createdAt);
                        }
                      }

                      const stepStatus = getStepStatus(step, stepValidation, stepRejected);
                      const isLast = index === workflowSteps.length - 1;
                      const isCompleted = stepStatus === 'completed';
                      const isCurrent = stepStatus === 'current';
                      const isRejected = stepStatus === 'rejected';
                      const isPending = stepStatus === 'pending';

                      return (
                        <Box key={step.id} sx={{ position: 'relative' }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 2,
                              mb: isLast ? 0 : 3,
                            }}
                          >
                            {/* Icône de l'étape */}
                            <Box
                              sx={{
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                bgcolor: isRejected
                                  ? 'error.main'
                                  : isCompleted
                                  ? 'success.main'
                                  : isCurrent
                                  ? 'warning.main' // Orange pour étape en cours sans traitement
                                  : 'grey.300',
                                color: 'white',
                                zIndex: 2,
                                boxShadow: isCurrent ? 3 : 1,
                                border: '3px solid',
                                borderColor: 'background.paper',
                              }}
                            >
                              {isRejected ? (
                                <CancelIcon />
                              ) : isCompleted ? (
                                <CheckCircleIcon />
                              ) : isCurrent ? (
                                <PendingIcon />
                              ) : (
                                step.icon
                              )}
                            </Box>

                            {/* Ligne de connexion */}
                            {!isLast && (
                              <Box
                                sx={{
                                  position: 'absolute',
                                  left: 19,
                                  top: 40,
                                  width: 2,
                                  height: 60,
                                  bgcolor: isRejected 
                                    ? 'error.main'
                                    : isCompleted 
                                    ? 'success.main' 
                                    : isCurrent
                                    ? 'warning.main'
                                    : 'grey.300',
                                  zIndex: 1,
                                }}
                              />
                            )}

                            {/* Contenu de l'étape */}
                            <Box sx={{ flex: 1, pt: 0.5 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography
                                  variant="subtitle2"
                                  sx={{
                                    fontWeight: isCurrent || isRejected ? 600 : 500,
                                    color: isRejected 
                                      ? 'error.main' 
                                      : isCurrent 
                                      ? 'warning.main' 
                                      : 'text.primary',
                                  }}
                                >
                                  {step.label}
                                </Typography>
                                {isCurrent && !stepValidation && (
                                  <Chip
                                    label="En attente"
                                    size="small"
                                    color="warning"
                                    variant="outlined"
                                  />
                                )}
                                {isCurrent && stepValidation && !stepRejected && (
                                  <Chip
                                    label="En cours"
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                  />
                                )}
                                {isCompleted && (
                                  <Chip
                                    label="Terminé"
                                    size="small"
                                    color="success"
                                    variant="outlined"
                                  />
                                )}
                                {isRejected && (
                                  <Chip
                                    label="Rejeté"
                                    size="small"
                                    color="error"
                                    variant="outlined"
                                  />
                                )}
                              </Box>
                              <Box sx={{ mt: 0.5 }}>
                                {stepValidation ? (
                                  <>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      <AccessTimeIcon fontSize="small" sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }} />
                                      {stepValidation.dateValidation 
                                        ? new Date(stepValidation.dateValidation).toLocaleString('fr-FR', {
                                            year: 'numeric',
                                            month: 'short',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                          })
                                        : (stepValidation.createdAt 
                                            ? new Date(stepValidation.createdAt).toLocaleString('fr-FR', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                              })
                                            : 'Date non disponible')}
                                    </Typography>
                                    <Typography 
                                      variant="caption" 
                                      color={stepRejected ? 'error.main' : 'success.main'} 
                                      display="block" 
                                      sx={{ mt: 0.5, fontWeight: 600 }}
                                    >
                                      Décision: {stepRejected ? 'Rejeté' : 'Validé'}
                                    </Typography>
                                    {stepValidation.commentaire && (
                                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                                        "{stepValidation.commentaire.substring(0, 50)}{stepValidation.commentaire.length > 50 ? '...' : ''}"
                                      </Typography>
                                    )}
                                  </>
                                ) : step.date ? (
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    <AccessTimeIcon fontSize="small" sx={{ fontSize: 12, verticalAlign: 'middle', mr: 0.5 }} />
                                    {new Date(step.date).toLocaleDateString('fr-FR', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                    })}
                                  </Typography>
                                ) : null}
                                {step.role && !stepValidation && isCurrent && (
                                  <Typography variant="caption" color="warning.main" display="block" sx={{ mt: 0.5 }}>
                                    En attente de traitement
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      );
                    })}
                  </Box>
                );
              })()}
            </Box>
          </Paper>

          {demande.piecesJustificatives && demande.piecesJustificatives.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Pièces justificatives
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                {demande.piecesJustificatives.map((piece, index) => (
                  <ListItem
                    key={index}
                    secondaryAction={
                      <IconButton
                        size="small"
                        onClick={() => handleDownloadFile(piece.fichierId)}
                        color="primary"
                        aria-label="Télécharger la pièce justificative"
                      >
                        <DownloadIcon />
                      </IconButton>
                    }
                  >
                    <DescriptionIcon sx={{ mr: 2 }} />
                    <ListItemText
                      primary={piece.nom}
                      secondary={`${(piece.taille / 1024).toFixed(2)} Ko`}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Documents générés
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Documents officiels générés et envoyés par email
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {documents.length > 0 ? (
              <List>
                {documents.map((doc) => {
                  // Formater le nom du document de manière plus lisible
                  const getDocumentName = (type) => {
                    const names = {
                      'ORDRE_MUTATION': 'Ordre de mutation',
                      'LETTRE_NOTIFICATION': 'Lettre de notification',
                      'ATTESTATION_ADMINISTRATIVE': 'Attestation administrative',
                      'ACCUSE_RECEPTION': 'Accusé de réception',
                    };
                    return names[type] || type;
                  };

                  return (
                    <ListItem
                      key={doc._id}
                      sx={{
                        mb: 1,
                        border: '1px solid #e0e0e0',
                        borderRadius: 1,
                        '&:hover': {
                          backgroundColor: '#f5f5f5',
                        },
                      }}
                      secondaryAction={
                        <IconButton
                          size="small"
                          onClick={() => handleDownloadDocument(doc._id)}
                          color="primary"
                          aria-label="Télécharger le document"
                        >
                          <DownloadIcon />
                        </IconButton>
                      }
                    >
                      <DescriptionIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <ListItemText
                        primary={getDocumentName(doc.type)}
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              Généré le {new Date(doc.createdAt).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </Typography>
                            {demande.informationsAgent?.email && (
                              <Typography variant="caption" color="success.main" display="block" sx={{ mt: 0.5 }}>
                                ✓ Envoyé par email
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  );
                })}
              </List>
            ) : (
              <Alert severity="info" sx={{ mt: 2 }}>
                Aucun document généré pour le moment. Les documents seront disponibles après la décision finale du DNCF.
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={openSoumettre} onClose={() => setOpenSoumettre(false)}>
        <DialogTitle>Confirmer la soumission</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir soumettre cette demande ? Une fois soumise, vous ne pourrez plus la modifier.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSoumettre(false)}>Annuler</Button>
          <Button onClick={handleSoumettre} variant="contained" color="primary">
            Soumettre
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openValidation} onClose={() => setOpenValidation(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {role === 'dgr' 
            ? (validationDecision === 'VALIDE' ? 'Donner un avis favorable' : 'Donner un avis défavorable')
            : role === 'cvr'
            ? (validationDecision === 'VALIDE' ? 'Valider la vérification' : 'Rejeter la vérification')
            : role === 'responsable'
            ? (validationDecision === 'VALIDE' ? 'Valider la demande' : 'Rejeter la demande')
            : (validationDecision === 'VALIDE' ? 'Valider la demande' : 'Rejeter la demande')
          }
        </DialogTitle>
        <DialogContent>
          {demande && (
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Agent"
                value={
                  demande.agentId && typeof demande.agentId === 'object'
                    ? `${demande.agentId.nom || ''} ${demande.agentId.prenom || ''}`.trim()
                    : demande.informationsAgent
                    ? `${demande.informationsAgent.nom || ''} ${demande.informationsAgent.prenom || ''}`.trim()
                    : '-'
                }
                disabled
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Motif"
                value={demande.motif || ''}
                disabled
                sx={{ mb: 2 }}
              />
            </Box>
          )}
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Commentaire (obligatoire)"
            value={commentaireValidation}
            onChange={(e) => setCommentaireValidation(e.target.value)}
            required
            placeholder="Veuillez saisir un commentaire pour justifier votre décision"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpenValidation(false);
            setCommentaireValidation('');
          }} disabled={loadingValidation}>
            Annuler
          </Button>
          {validationDecision === 'VALIDE' ? (
            <Button
              onClick={handleValidation}
              variant="contained"
              color="success"
              disabled={loadingValidation || !commentaireValidation.trim()}
              startIcon={<CheckCircleIcon />}
            >
              {role === 'dgr' ? 'Avis favorable' : role === 'cvr' ? 'Valider' : role === 'responsable' ? 'Valider' : 'Accepter'}
            </Button>
          ) : (
            <Button
              onClick={handleValidation}
              variant="contained"
              color="error"
              disabled={loadingValidation || !commentaireValidation.trim()}
              startIcon={<CancelIcon />}
            >
              {role === 'dgr' ? 'Avis défavorable' : role === 'cvr' ? 'Rejeter' : role === 'responsable' ? 'Rejeter' : 'Rejeter'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

