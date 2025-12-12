import React from 'react';
import {
  Box,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Alert,
} from '@mui/material';
import AffectationsPostes from './AffectationsPostes';

export default function Step3AgentProfessionnel({
  formData,
  setFormData,
  grades,
  statuts,
  directions,
  services,
  localites,
  postes,
}) {
  const filteredServices = services.filter((service) => {
    if (!formData.directionId) return false;
    const serviceDirectionId = service.directionId?._id || service.directionId;
    return serviceDirectionId === formData.directionId;
  });

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Informations professionnelles
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Date d'embauche *"
            type="date"
            required
            value={formData.dateEmbauche || ''}
            onChange={(e) => setFormData({ ...formData, dateEmbauche: e.target.value })}
            InputLabelProps={{ shrink: true }}
            margin="normal"
            helperText="Pour calculer l'ancienneté"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Grade *</InputLabel>
            <Select
              value={formData.gradeId || ''}
              label="Grade *"
              onChange={(e) => setFormData({ ...formData, gradeId: e.target.value })}
            >
              <MenuItem value="">Sélectionner un grade</MenuItem>
              {grades.map((grade) => (
                <MenuItem key={grade._id} value={grade._id}>
                  {grade.libelle}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Statut *</InputLabel>
            <Select
              value={formData.statutId || ''}
              label="Statut *"
              onChange={(e) => setFormData({ ...formData, statutId: e.target.value })}
            >
              <MenuItem value="">Sélectionner un statut</MenuItem>
              {statuts.map((statut) => (
                <MenuItem key={statut._id} value={statut._id}>
                  {statut.libelle}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Direction *</InputLabel>
            <Select
              value={formData.directionId || ''}
              label="Direction *"
              onChange={(e) => setFormData({ ...formData, directionId: e.target.value, serviceId: '' })}
            >
              <MenuItem value="">Sélectionner une direction</MenuItem>
              {directions.map((direction) => (
                <MenuItem key={direction._id} value={direction._id}>
                  {direction.libelle}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth margin="normal" required disabled={!formData.directionId}>
            <InputLabel>Service *</InputLabel>
            <Select
              value={formData.serviceId || ''}
              label="Service *"
              onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
            >
              <MenuItem value="">Sélectionner un service</MenuItem>
              {filteredServices.map((service) => (
                <MenuItem key={service._id} value={service._id}>
                  {service.libelle}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {!formData.directionId && (
            <Alert severity="info" sx={{ mt: 1 }}>
              Veuillez d'abord sélectionner une direction
            </Alert>
          )}
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Localisation actuelle</InputLabel>
            <Select
              value={formData.localisationActuelleId || ''}
              label="Localisation actuelle"
              onChange={(e) => setFormData({ ...formData, localisationActuelleId: e.target.value })}
            >
              <MenuItem value="">Aucune</MenuItem>
              {localites.map((localite) => (
                <MenuItem key={localite._id} value={localite._id}>
                  {localite.libelle}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Affectations de postes */}
      <Box sx={{ mt: 4 }}>
        <AffectationsPostes
          affectationsPostes={formData.affectationsPostes || []}
          setAffectationsPostes={(affectations) => setFormData({ ...formData, affectationsPostes: affectations })}
          postes={postes}
        />
      </Box>
    </Box>
  );
}

