import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Divider,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material';
import { postesService } from '../../services/postesService';
import { referentielsService } from '../../services/referentielsService';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import ActionButton from '../../components/common/ActionButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import SchoolIcon from '@mui/icons-material/School';
import HistoryIcon from '@mui/icons-material/History';
import EditIcon from '@mui/icons-material/Edit';
import { getErrorMessage } from '../../utils/errorHandler';
import { useToast } from '../../context/ToastContext';

export default function DetailPoste() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { error: showError, success } = useToast();
  const [poste, setPoste] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [historiqueAgents, setHistoriqueAgents] = useState([]);
  const [loadingHistorique, setLoadingHistorique] = useState(false);
  const [openModification, setOpenModification] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    intitule: '',
    description: '',
    serviceId: '',
    localisationId: '',
    gradeRequisId: '',
    estCritique: false,
  });
  const [services, setServices] = useState([]);
  const [localites, setLocalites] = useState([]);
  const [grades, setGrades] = useState([]);
  const [canModify, setCanModify] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [posteRes, servicesRes, localitesRes, gradesRes] = await Promise.all([
          postesService.getById(id),
          referentielsService.getServices(),
          referentielsService.getLocalites(),
          referentielsService.getGrades(),
        ]);
        const posteData = posteRes.data;
        setPoste(posteData);
        setServices(servicesRes.data || []);
        setLocalites(localitesRes.data || []);
        setGrades(gradesRes.data || []);
        
        // Vérifier si le poste peut être modifié (pas d'historique d'affectations)
        const historiqueRes = await postesService.getHistoriqueAgents(id);
        const hasHistorique = historiqueRes.data && historiqueRes.data.length > 0;
        setCanModify(!hasHistorique && !posteData.agentId);
      } catch (err) {
        console.error('Erreur lors du chargement', err);
        const errorMessage = getErrorMessage(err);
        // Si c'est une erreur 403 (Forbidden), rediriger vers la liste
        if (err.response?.status === 403) {
          showError('Vous n\'avez pas les permissions pour voir ce poste');
          setTimeout(() => {
            navigate('/dgr/postes');
          }, 2000);
          return;
        }
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    if (id) {
      fetchData();
    }
  }, [id, navigate, showError]);

  useEffect(() => {
    const fetchHistorique = async () => {
      if (!id) return;
      setLoadingHistorique(true);
      try {
        const response = await postesService.getHistoriqueAgents(id);
        setHistoriqueAgents(response.data || []);
      } catch (err) {
        console.error('Erreur lors du chargement de l\'historique', err);
        // Ne pas afficher d'erreur si l'historique n'est pas disponible
      } finally {
        setLoadingHistorique(false);
      }
    };
    if (id) {
      fetchHistorique();
    }
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error">{error}</Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dgr/postes')}
          sx={{ mt: 2 }}
        >
          Retour à la liste
        </Button>
      </Box>
    );
  }

  if (!poste) {
    return (
      <Box>
        <Alert severity="error">Poste non trouvé</Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dgr/postes')}
          sx={{ mt: 2 }}
        >
          Retour à la liste
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <PageHeader
          title="Détails du poste"
          subtitle={poste.intitule}
        />
        {poste.estCritique && (
          <Chip
            label="CRITIQUE"
            color="error"
            size="medium"
            sx={{
              fontWeight: 700,
              fontSize: '0.875rem',
              height: 32,
              '& .MuiChip-label': {
                px: 2,
              },
            }}
          />
        )}
      </Box>

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <ActionButton
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dgr/postes')}
        >
          Retour à la liste
        </ActionButton>
        {canModify && (
          <ActionButton
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => {
              setFormData({
                intitule: poste.intitule || '',
                description: poste.description || '',
                serviceId: typeof poste.serviceId === 'object' ? poste.serviceId._id : poste.serviceId || '',
                localisationId: typeof poste.localisationId === 'object' ? poste.localisationId._id : poste.localisationId || '',
                gradeRequisId: typeof poste.gradeRequisId === 'object' ? poste.gradeRequisId._id : poste.gradeRequisId || '',
                estCritique: poste.estCritique || false,
              });
              setOpenModification(true);
              setActiveStep(0);
            }}
          >
            Modifier
          </ActionButton>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Informations générales
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Intitulé
                </Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {poste.intitule}
                </Typography>
              </Grid>

              {poste.description && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    {poste.description}
                  </Typography>
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Statut
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <StatusChip status={poste.statut} />
                </Box>
              </Grid>

              {poste.estCritique && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Type
                  </Typography>
                  <Chip
                    label="Poste critique"
                    color="error"
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Grid>
              )}
            </Grid>
          </Paper>

          {poste.agentId && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Agent affecté actuellement
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Nom complet
                  </Typography>
                  <Typography variant="body1">
                    {poste.agentId.nom} {poste.agentId.prenom}
                  </Typography>
                </Grid>
                {poste.agentId.matricule && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Matricule
                    </Typography>
                    <Typography variant="body1">
                      {poste.agentId.matricule}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>
          )}

          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <HistoryIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">
                Historique des agents
              </Typography>
            </Box>
            <Divider sx={{ mb: 2 }} />
            {loadingHistorique ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress size={24} />
              </Box>
            ) : historiqueAgents.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Agent</TableCell>
                      <TableCell>Matricule</TableCell>
                      <TableCell>Grade</TableCell>
                      <TableCell>Date de début</TableCell>
                      <TableCell>Date de fin</TableCell>
                      <TableCell>Motif de fin</TableCell>
                      <TableCell align="center">Statut</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {historiqueAgents.map((item, index) => (
                      <TableRow key={index} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.nomComplet}
                          </Typography>
                        </TableCell>
                        <TableCell>{item.matricule}</TableCell>
                        <TableCell>{item.grade}</TableCell>
                        <TableCell>
                          {new Date(item.dateDebut).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          {item.dateFin
                            ? new Date(item.dateFin).toLocaleDateString('fr-FR')
                            : '-'}
                        </TableCell>
                        <TableCell>{item.motifFin || '-'}</TableCell>
                        <TableCell align="center">
                          <Chip
                            label={item.estActuel ? 'Actuel' : 'Terminé'}
                            color={item.estActuel ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">
                Aucun agent n'a encore été affecté à ce poste.
              </Alert>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Service</Typography>
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {poste.serviceId?.libelle || '-'}
              </Typography>
              {poste.serviceId?.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {poste.serviceId.description}
                </Typography>
              )}
            </CardContent>
          </Card>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocationOnIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Localisation</Typography>
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {poste.localisationId?.libelle || '-'}
              </Typography>
              {poste.localisationId?.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {poste.localisationId.description}
                </Typography>
              )}
            </CardContent>
          </Card>

          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Grade requis</Typography>
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                {poste.gradeRequisId?.libelle || '-'}
              </Typography>
              {poste.gradeRequisId?.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {poste.gradeRequisId.description}
                </Typography>
              )}
              {poste.gradeRequisId?.niveau && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Niveau hiérarchique: {poste.gradeRequisId.niveau}
                </Typography>
              )}
            </CardContent>
          </Card>

          {poste.dateRenouvellement && (
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Date de renouvellement
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                  {new Date(poste.dateRenouvellement).toLocaleDateString('fr-FR')}
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Modal de modification */}
      <Dialog open={openModification} onClose={() => setOpenModification(false)} maxWidth="md" fullWidth>
        <DialogTitle>Modifier le poste</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, mb: 3 }}>
            <Stepper activeStep={activeStep}>
              <Step>
                <StepLabel>Informations générales</StepLabel>
              </Step>
              <Step>
                <StepLabel>Spécifications</StepLabel>
              </Step>
            </Stepper>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minHeight: 300 }}>
            {activeStep === 0 && (
              <>
                <Typography variant="h6" gutterBottom>
                  Informations générales
                </Typography>
                <TextField
                  fullWidth
                  label="Intitulé du poste *"
                  value={formData.intitule}
                  onChange={(e) => setFormData({ ...formData, intitule: e.target.value })}
                  required
                />
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  helperText="Description optionnelle du poste"
                />
                <TextField
                  fullWidth
                  select
                  label="Service *"
                  value={formData.serviceId}
                  onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
                  required
                >
                  {services.map((service) => (
                    <MenuItem key={service._id} value={service._id}>
                      {service.libelle}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  select
                  label="Localisation *"
                  value={formData.localisationId}
                  onChange={(e) => setFormData({ ...formData, localisationId: e.target.value })}
                  required
                >
                  {localites.map((localite) => (
                    <MenuItem key={localite._id} value={localite._id}>
                      {localite.libelle}
                    </MenuItem>
                  ))}
                </TextField>
              </>
            )}

            {activeStep === 1 && (
              <>
                <Typography variant="h6" gutterBottom>
                  Spécifications
                </Typography>
                <TextField
                  fullWidth
                  select
                  label="Grade requis *"
                  value={formData.gradeRequisId}
                  onChange={(e) => setFormData({ ...formData, gradeRequisId: e.target.value })}
                  required
                  helperText="Grade minimum requis pour occuper ce poste"
                >
                  {grades.map((grade) => (
                    <MenuItem key={grade._id} value={grade._id}>
                      {grade.libelle}
                    </MenuItem>
                  ))}
                </TextField>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.estCritique}
                      onChange={(e) => setFormData({ ...formData, estCritique: e.target.checked })}
                    />
                  }
                  label="Poste critique"
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Un poste critique nécessite une attention particulière et doit être pourvu rapidement.
                </Typography>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <ActionButton onClick={() => setOpenModification(false)}>Annuler</ActionButton>
          {activeStep > 0 && (
            <ActionButton onClick={() => setActiveStep(activeStep - 1)}>
              Précédent
            </ActionButton>
          )}
          {activeStep < 1 ? (
            <ActionButton
              onClick={() => {
                if (!formData.intitule || !formData.serviceId || !formData.localisationId) {
                  showError('Veuillez remplir tous les champs obligatoires de cette étape');
                  return;
                }
                setActiveStep(activeStep + 1);
              }}
              variant="contained"
              disabled={!formData.intitule || !formData.serviceId || !formData.localisationId}
            >
              Suivant
            </ActionButton>
          ) : (
            <ActionButton
              onClick={async () => {
                if (!formData.intitule || !formData.serviceId || !formData.localisationId || !formData.gradeRequisId) {
                  showError('Veuillez remplir tous les champs obligatoires');
                  return;
                }
                try {
                  await postesService.update(id, formData);
                  success('Poste modifié avec succès');
                  setOpenModification(false);
                  setActiveStep(0);
                  // Recharger les données
                  const response = await postesService.getById(id);
                  setPoste(response.data);
                } catch (err) {
                  console.error('Erreur lors de la modification', err);
                  const errorMessage = getErrorMessage(err);
                  showError(`Erreur lors de la modification: ${errorMessage}`);
                }
              }}
              variant="contained"
              disabled={!formData.intitule || !formData.serviceId || !formData.localisationId || !formData.gradeRequisId}
            >
              Enregistrer
            </ActionButton>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

