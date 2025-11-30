import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Alert, 
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DescriptionIcon from '@mui/icons-material/Description';
import DownloadIcon from '@mui/icons-material/Download';
import { demandesService } from '../../services/demandesService';
import { documentsService } from '../../services/documentsService';
import { useToast } from '../../context/ToastContext';
import StatusChip from '../../components/common/StatusChip';

const getStatusLabel = (status) => {
  const labels = {
    BROUILLON: 'Brouillon',
    SOUMISE: 'Soumise',
    INELIGIBLE: 'Inéligible',
    EN_VALIDATION_HIERARCHIQUE: 'En validation hiérarchique',
    VALIDEE_HIERARCHIQUE: 'Validée hiérarchique',
    REJETEE_HIERARCHIQUE: 'Rejetée hiérarchique',
    EN_ETUDE_DGR: 'En étude DGR',
    AVIS_DGR_FAVORABLE: 'Avis DGR favorable',
    AVIS_DGR_DEFAVORABLE: 'Avis DGR défavorable',
    EN_VERIFICATION_CVR: 'En vérification CVR',
    VALIDEE_CVR: 'Validée CVR',
    REJETEE_CVR: 'Rejetée CVR',
    EN_ETUDE_DNCF: 'En étude DNCF',
    ACCEPTEE: 'Acceptée',
    REJETEE: 'Rejetée',
  };
  return labels[status] || status;
};

export default function Suivi() {
  const { error: showError } = useToast();
  const navigate = useNavigate();
  const [demandeId, setDemandeId] = useState('');
  const [demande, setDemande] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!demandeId.trim()) {
      setError('Veuillez saisir un identifiant de demande');
      return;
    }

    setLoading(true);
    setError('');
    setDemande(null);
    setDocuments([]);

    try {
      const response = await demandesService.getById(demandeId.trim());
      setDemande(response.data);
      
      // Récupérer les documents générés si la décision est rendue
      if (response.data && (response.data.statut === 'ACCEPTEE' || response.data.statut === 'REJETEE')) {
        try {
          const documentsRes = await documentsService.findPublicByDemande(response.data._id);
          setDocuments(Array.isArray(documentsRes.data) ? documentsRes.data : []);
        } catch (docError) {
          console.error('Erreur lors de la récupération des documents:', docError);
          // Ne pas bloquer l'affichage si les documents ne peuvent pas être récupérés
        }
      }
    } catch (err) {
      setError('Demande non trouvée. Vérifiez que l\'identifiant est correct.');
      setDemande(null);
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDownloadDocument = async (documentId) => {
    try {
      const response = await documentsService.downloadPublicDocument(documentId);
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
      showError('Erreur lors du téléchargement du document');
    }
  };

  // Gérer les données populées ou non
  const agent = demande?.agentId;
  const agentNom = agent && typeof agent === 'object' && agent !== null 
    ? `${agent.nom || ''} ${agent.prenom || ''}`.trim()
    : demande?.informationsAgent
    ? `${demande.informationsAgent.nom || ''} ${demande.informationsAgent.prenom || ''}`.trim()
    : '-';

  const poste = demande?.posteSouhaiteId;
  const posteLibelle = poste && typeof poste === 'object' && poste !== null
    ? poste.intitule
    : '-';

  const localisation = demande?.localisationSouhaiteId;
  const localisationLibelle = localisation && typeof localisation === 'object' && localisation !== null
    ? localisation.libelle
    : '-';

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 2,
      }}
    >
      <Box sx={{ maxWidth: 800, width: '100%' }}>
        <Paper sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              component="img"
              src="/dncf.jpg"
              alt="DNCF"
              sx={{
                height: 60,
                width: 'auto',
                mb: 2,
                mx: 'auto',
              }}
            />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 1, color: 'primary.main' }}>
              Suivi de demande
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Saisissez l'identifiant de votre demande pour connaître son état d'avancement
            </Typography>
          </Box>

          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Identifiant de la demande"
              value={demandeId}
              onChange={(e) => setDemandeId(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ex: 507f1f77bcf86cd799439011"
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
              }}
              sx={{ mb: 2 }}
            />
            <Button
              fullWidth
              variant="contained"
              onClick={handleSearch}
              disabled={loading || !demandeId.trim()}
              size="large"
            >
              {loading ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  Recherche en cours...
                </>
              ) : (
                'Rechercher'
              )}
            </Button>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {demande && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                Informations de la demande
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Identifiant:
                  </Typography>
                  <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                    {demande._id}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Agent:
                  </Typography>
                  <Typography variant="body2">
                    {agentNom}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Statut:
                  </Typography>
                  <StatusChip status={demande.statut} label={getStatusLabel(demande.statut)} />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Motif:
                  </Typography>
                  <Typography variant="body2" sx={{ textAlign: 'right', maxWidth: '60%' }}>
                    {demande.motif || '-'}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Poste souhaité:
                  </Typography>
                  <Typography variant="body2">
                    {posteLibelle}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Localisation souhaitée:
                  </Typography>
                  <Typography variant="body2">
                    {localisationLibelle}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                    Date de création:
                  </Typography>
                  <Typography variant="body2">
                    {new Date(demande.createdAt).toLocaleString('fr-FR')}
                  </Typography>
                </Box>

                {demande.dateSoumission && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                      Date de soumission:
                    </Typography>
                    <Typography variant="body2">
                      {new Date(demande.dateSoumission).toLocaleString('fr-FR')}
                    </Typography>
                  </Box>
                )}

                {demande.raisonsIneligibilite && demande.raisonsIneligibilite.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Alert severity="warning">
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
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
                  </Box>
                )}
              </Box>
            </Box>
          )}

          {demande && documents.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Documents générés
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Documents officiels générés et envoyés par email
              </Typography>
              <Paper sx={{ p: 2 }}>
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
                            <Typography variant="caption" display="block">
                              Généré le {new Date(doc.createdAt).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </Typography>
                          }
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Paper>
            </Box>
          )}

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button variant="outlined" onClick={() => navigate('/')}>
              Retour à l'accueil
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

