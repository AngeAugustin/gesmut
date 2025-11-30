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
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { demandesService } from '../../services/demandesService';
import { validationsService } from '../../services/validationsService';
import { documentsService } from '../../services/documentsService';
import { uploadService } from '../../services/uploadService';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';

const getStatusColor = (status) => {
  const colors = {
    BROUILLON: 'default',
    SOUMISE: 'info',
    EN_VALIDATION_HIERARCHIQUE: 'warning',
    VALIDEE_HIERARCHIQUE: 'success',
    EN_ETUDE_DGR: 'warning',
    AVIS_DGR_FAVORABLE: 'success',
    AVIS_DGR_DEFAVORABLE: 'error',
    EN_VERIFICATION_CVR: 'warning',
    VALIDEE_CVR: 'success',
    EN_ETUDE_DNCF: 'warning',
    ACCEPTEE: 'success',
    REJETEE: 'error',
  };
  return colors[status] || 'default';
};

export default function DetailDemande() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [demande, setDemande] = useState(null);
  const [validations, setValidations] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openSoumettre, setOpenSoumettre] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [demandeRes, validationsRes, documentsRes] = await Promise.all([
          demandesService.getById(id),
          validationsService.getByDemande(id),
          documentsService.findByDemande(id),
        ]);
        setDemande(demandeRes.data);
        setValidations(validationsRes.data);
        setDocuments(documentsRes.data);
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
      navigate('/agent/demandes');
    } catch (error) {
      console.error('Erreur lors de la soumission', error);
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Détails de la demande</Typography>
        <Box>
          {demande.statut === 'BROUILLON' && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenSoumettre(true)}
              sx={{ mr: 1 }}
            >
              Soumettre
            </Button>
          )}
          <Button variant="outlined" onClick={() => navigate('/agent/demandes')}>
            Retour
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
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
                <Chip
                  label={demande.statut}
                  color={getStatusColor(demande.statut)}
                  sx={{ mt: 1 }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Type
                </Typography>
                <Typography variant="body1">{demande.type}</Typography>
              </Grid>
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
                  {typeof demande.posteSouhaiteId === 'object' && demande.posteSouhaiteId !== null
                    ? demande.posteSouhaiteId.intitule || '-'
                    : '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Localisation souhaitée
                </Typography>
                <Typography variant="body1">
                  {typeof demande.localisationSouhaiteId === 'object' && demande.localisationSouhaiteId !== null
                    ? demande.localisationSouhaiteId.libelle || '-'
                    : '-'}
                </Typography>
              </Grid>
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

          {validations.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Historique des validations
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                {validations.map((validation, index) => (
                  <React.Fragment key={validation._id}>
                    <ListItem>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1">
                              {validation.validateurRole} - {validation.decision}
                            </Typography>
                            <Chip
                              label={validation.decision}
                              color={validation.decision === 'VALIDE' ? 'success' : 'error'}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary">
                              {validation.commentaire}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(validation.dateValidation).toLocaleString('fr-FR')}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    {index < validations.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          )}

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
                      <Button
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownloadFile(piece.fichierId)}
                      >
                        Télécharger
                      </Button>
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
          {documents.length > 0 && (
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Documents générés
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List>
                {documents.map((doc) => (
                  <ListItem
                    key={doc._id}
                    secondaryAction={
                      <Button
                        size="small"
                        startIcon={<DownloadIcon />}
                        onClick={() => handleDownloadFile(doc.fichierId)}
                      >
                        Télécharger
                      </Button>
                    }
                  >
                    <DescriptionIcon sx={{ mr: 2 }} />
                    <ListItemText
                      primary={doc.type}
                      secondary={new Date(doc.createdAt).toLocaleDateString('fr-FR')}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
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
    </Box>
  );
}

