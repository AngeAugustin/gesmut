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
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import SchoolIcon from '@mui/icons-material/School';
import StarIcon from '@mui/icons-material/Star';
import FamilyRestroomIcon from '@mui/icons-material/FamilyRestroom';
import { agentsService } from '../../services/agentsService';
import { uploadService } from '../../services/uploadService';
import PageHeader from '../../components/common/PageHeader';

export default function DetailAgent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anciennete, setAnciennete] = useState(null);
  const [responsables, setResponsables] = useState([]);
  
  // Déterminer le chemin de retour selon le rôle
  const getBackPath = () => {
    if (location.pathname.startsWith('/admin')) {
      return '/admin/agents';
    }
    return '/dgr/agents';
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [agentRes, ancienneteRes, responsablesRes] = await Promise.all([
          agentsService.getById(id),
          agentsService.getAnciennete(id).catch(() => ({ data: { anciennete: 0 } })),
          agentsService.getResponsables(id).catch(() => ({ data: [] })),
        ]);
        console.log('Agent reçu:', agentRes.data);
        console.log('Grade:', agentRes.data?.gradeId);
        console.log('Statut:', agentRes.data?.statutId);
        console.log('Service:', agentRes.data?.serviceId);
        console.log('Localisation:', agentRes.data?.localisationActuelleId);
        console.log('Poste:', agentRes.data?.posteActuelId);
        setAgent(agentRes.data);
        setAnciennete(ancienneteRes.data?.anciennete || 0);
        setResponsables(responsablesRes.data || []);
      } catch (error) {
        console.error('Erreur lors du chargement de l\'agent:', error);
        setError('Erreur lors du chargement des informations de l\'agent');
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

  const photoUrl = agent.photo ? uploadService.getFile(agent.photo) : null;

  return (
    <Box>
      <PageHeader
        title={`Profil de ${agent.nom} ${agent.prenom}`}
        subtitle={`Matricule: ${agent.matricule}`}
      />

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

          {/* Coordonnées */}
          <Paper sx={{ p: 3, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Coordonnées
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <List>
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
                  Poste actuel
                </Typography>
                <Typography variant="body1">
                  {(() => {
                    const poste = agent.posteActuelId;
                    if (!poste) return '-';
                    if (typeof poste === 'object' && poste !== null) {
                      return poste.intitule || poste.description || '-';
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

          {/* Informations personnelles */}
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Informations personnelles
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Date de naissance
                </Typography>
                <Typography variant="body1">
                  {agent.dateNaissance
                    ? new Date(agent.dateNaissance).toLocaleDateString('fr-FR')
                    : '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Sexe
                </Typography>
                <Typography variant="body1">
                  {agent.sexe === 'M' ? 'Masculin' : agent.sexe === 'F' ? 'Féminin' : agent.sexe || '-'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

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

          {/* Responsables */}
          {responsables && responsables.length > 0 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                <BusinessIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                Responsables hiérarchiques
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                {responsables.map((responsable, index) => (
                  <ListItem key={index}>
                    <ListItemText
                      primary={`${responsable.nom || ''} ${responsable.prenom || ''}`.trim() || `Responsable ${index + 1}`}
                      secondary={responsable.email}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}

