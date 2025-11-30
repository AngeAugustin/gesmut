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
} from '@mui/material';
import { postesService } from '../../services/postesService';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import ActionButton from '../../components/common/ActionButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import SchoolIcon from '@mui/icons-material/School';
import { getErrorMessage } from '../../utils/errorHandler';

export default function DetailPoste() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [poste, setPoste] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await postesService.getById(id);
        setPoste(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement', err);
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
      <PageHeader
        title="Détails du poste"
        subtitle={poste.intitule}
      />

      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <ActionButton
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/dgr/postes')}
        >
          Retour à la liste
        </ActionButton>
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
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Agent affecté
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
    </Box>
  );
}

