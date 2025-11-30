import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  CircularProgress,
  Alert,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import DescriptionIcon from '@mui/icons-material/Description';
import PageHeader from '../../components/common/PageHeader';
import { documentsService } from '../../services/documentsService';

export default function TestDocuments() {
  const [loading, setLoading] = useState({});
  const [error, setError] = useState(null);

  const documentTypes = [
    {
      type: 'ORDRE_MUTATION',
      title: 'Ordre de mutation',
      description: 'Document officiel ordonnant la mutation d\'un agent vers un nouveau poste',
      icon: <DescriptionIcon sx={{ fontSize: 48, color: 'primary.main' }} />,
    },
    {
      type: 'LETTRE_NOTIFICATION',
      title: 'Lettre de notification',
      description: 'Lettre informant l\'agent de sa mutation et des modalités de prise de fonction',
      icon: <DescriptionIcon sx={{ fontSize: 48, color: 'info.main' }} />,
    },
    {
      type: 'ATTESTATION_ADMINISTRATIVE',
      title: 'Attestation administrative',
      description: 'Attestation certifiant l\'appartenance de l\'agent à l\'administration',
      icon: <DescriptionIcon sx={{ fontSize: 48, color: 'success.main' }} />,
    },
  ];

  const handleDownload = async (type, filename) => {
    try {
      setLoading((prev) => ({ ...prev, [type]: true }));
      setError(null);

      console.log('Tentative de téléchargement du document:', type);
      const response = await documentsService.downloadTestDocument(type);
      console.log('Réponse reçue:', response.status, response.headers);
      
      // Vérifier si c'est une erreur
      if (response.status !== 200) {
        // Lire le blob comme texte pour obtenir le message d'erreur JSON
        const text = await response.data.text();
        let errorData;
        try {
          errorData = JSON.parse(text);
        } catch {
          errorData = { error: text || 'Erreur inconnue lors de la génération du document' };
        }
        throw new Error(errorData.message || errorData.error || 'Erreur lors de la génération du document');
      }
      
      // Vérifier le Content-Type pour s'assurer que c'est un PDF
      const contentType = response.headers['content-type'] || '';
      if (!contentType.includes('application/pdf')) {
        // Si ce n'est pas un PDF, essayer de lire comme texte pour voir l'erreur
        const text = await response.data.text();
        let errorData;
        try {
          errorData = JSON.parse(text);
          throw new Error(errorData.message || errorData.error || 'Réponse inattendue du serveur');
        } catch (parseError) {
          throw new Error(text || 'Format de réponse inattendu');
        }
      }
      
      // Créer un blob et le télécharger
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `${type}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur lors du téléchargement:', err);
      const errorMessage = err.message || err.response?.data?.message || err.response?.data?.error || 'Erreur inconnue';
      setError(`Erreur lors du téléchargement du document ${type}: ${errorMessage}`);
    } finally {
      setLoading((prev) => ({ ...prev, [type]: false }));
    }
  };

  const getFilename = (type) => {
    const filenames = {
      'ORDRE_MUTATION': 'Ordre_de_mutation.pdf',
      'LETTRE_NOTIFICATION': 'Lettre_de_notification.pdf',
      'ATTESTATION_ADMINISTRATIVE': 'Attestation_administrative.pdf',
    };
    return filenames[type] || `${type}.pdf`;
  };

  return (
    <Box>
      <PageHeader
        title="Test des documents"
        subtitle="Générer et télécharger les documents pour les corriger et les uniformiser"
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="body1" color="text.secondary" paragraph>
          Cette page permet de générer et télécharger les différents types de documents administratifs
          utilisés dans le processus de mutation. Utilisez cette fonctionnalité pour :
        </Typography>
        <Box component="ul" sx={{ pl: 3, mb: 0 }}>
          <Typography component="li" variant="body2" color="text.secondary" paragraph>
            Vérifier le format et la mise en page des documents
          </Typography>
          <Typography component="li" variant="body2" color="text.secondary" paragraph>
            Corriger le contenu et la structure des documents
          </Typography>
          <Typography component="li" variant="body2" color="text.secondary">
            Uniformiser le style avant l'intégration dans le processus
          </Typography>
        </Box>
      </Paper>

      <Grid container spacing={3}>
        {documentTypes.map((doc) => (
          <Grid item xs={12} md={4} key={doc.type}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 4 }}>
                <Box sx={{ mb: 2 }}>{doc.icon}</Box>
                <Typography variant="h6" gutterBottom fontWeight={600}>
                  {doc.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {doc.description}
                </Typography>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button
                  variant="contained"
                  startIcon={
                    loading[doc.type] ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      <DownloadIcon />
                    )
                  }
                  onClick={() => handleDownload(doc.type, getFilename(doc.type))}
                  disabled={loading[doc.type]}
                  sx={{
                    minWidth: 200,
                    backgroundColor: 'primary.main',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  }}
                >
                  {loading[doc.type] ? 'Génération...' : 'Télécharger'}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ p: 3, mt: 4, bgcolor: 'info.light', color: 'info.contrastText' }}>
        <Typography variant="subtitle2" gutterBottom fontWeight={600}>
          Note importante
        </Typography>
        <Typography variant="body2">
          Les documents générés contiennent des placeholders (ex: [NOM_AGENT], [MATRICULE], etc.)
          qui seront remplacés par les données réelles lors de la génération dans le processus.
          Après avoir téléchargé et vérifié les documents, vous pouvez les modifier dans le code
          backend pour ajuster le format, le contenu et la mise en page.
        </Typography>
      </Paper>
    </Box>
  );
}

