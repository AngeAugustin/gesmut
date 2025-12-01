import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Chip,
} from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' Ko';
  return (bytes / 1048576).toFixed(2) + ' Mo';
};

export default function Step5Recapitulatif({ formData, files, postes, localites, directions, services }) {
  const selectedPoste = postes.find((p) => p._id === formData.posteSouhaiteId);
  const selectedLocalite = localites.find((l) => l._id === formData.localisationSouhaiteId);
  const selectedDirection = directions.find((d) => d._id === formData.directionId);
  const selectedService = services.find((s) => s._id === formData.serviceId);

  return (
    <Box sx={{ py: 2 }}>
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircleIcon color="success" />
          Informations personnelles
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Matricule</Typography>
            <Typography variant="body1" fontWeight={600}>{formData.matricule || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Nom complet</Typography>
            <Typography variant="body1" fontWeight={600}>
              {formData.nom} {formData.prenom} {formData.nomMariage && `(${formData.nomMariage})`}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Email</Typography>
            <Typography variant="body1" fontWeight={600}>{formData.email || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Sexe</Typography>
            <Typography variant="body1" fontWeight={600}>{formData.sexe || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Direction</Typography>
            <Typography variant="body1" fontWeight={600}>{selectedDirection?.libelle || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Service</Typography>
            <Typography variant="body1" fontWeight={600}>{selectedService?.libelle || '-'}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {(formData.conjoints.length > 0 || formData.enfants.length > 0) && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Famille</Typography>
          <Divider sx={{ my: 2 }} />
          {formData.conjoints.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Conjoints ({formData.conjoints.length})
              </Typography>
              <List dense>
                {formData.conjoints.map((c, i) => (
                  <ListItem key={i}>
                    <ListItemText primary={`${c.nom} ${c.prenom}`} secondary={c.code || 'Sans code'} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          {formData.enfants.length > 0 && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Enfants ({formData.enfants.length})
              </Typography>
              <List dense>
                {formData.enfants.map((e, i) => (
                  <ListItem key={i}>
                    <ListItemText primary={`${e.nom} ${e.prenom}`} secondary={e.code || 'Sans code'} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Paper>
      )}

      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Détails de la demande</Typography>
        <Divider sx={{ my: 2 }} />
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>Motif</Typography>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
            {formData.motif || '-'}
          </Typography>
        </Box>
        <Grid container spacing={2}>
          {selectedPoste && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Poste souhaité</Typography>
              <Typography variant="body1" fontWeight={600}>
                {selectedPoste.intitule} - {selectedPoste.localisationId?.libelle}
              </Typography>
            </Grid>
          )}
          {selectedLocalite && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Localisation souhaitée</Typography>
              <Typography variant="body1" fontWeight={600}>{selectedLocalite.libelle}</Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      {files.length > 0 && (
        <Paper variant="outlined" sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>Pièces justificatives</Typography>
          <Divider sx={{ my: 2 }} />
          <List>
            {files.map((file, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={file.name}
                  secondary={
                    <Chip
                      label={formatFileSize(file.size)}
                      size="small"
                      variant="outlined"
                      color={file.size > 3145728 ? 'error' : 'default'}
                    />
                  }
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
        <Typography variant="body2" color="info.dark">
          <strong>Vérifiez attentivement toutes les informations avant de soumettre votre demande.</strong>
          <br />
          Une fois soumise, vous pourrez suivre l'évolution de votre demande via l'identifiant qui vous sera fourni.
        </Typography>
      </Box>
    </Box>
  );
}
