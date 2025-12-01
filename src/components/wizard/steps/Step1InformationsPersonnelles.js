import React from 'react';
import { Box, Grid, TextField, Select, MenuItem, FormControl, InputLabel, Avatar } from '@mui/material';

export default function Step1InformationsPersonnelles({ formData, setFormData, directions, services, onPhotoChange }) {
  const filteredServices = services.filter((service) => {
    if (!formData.directionId) return false;
    const serviceDirectionId = service.directionId?._id || service.directionId;
    return serviceDirectionId === formData.directionId;
  });

  return (
    <Box sx={{ py: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Matricule"
            required
            value={formData.matricule}
            onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Nom"
            required
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Prénom"
            required
            value={formData.prenom}
            onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Nom de mariage"
            value={formData.nomMariage}
            onChange={(e) => setFormData({ ...formData, nomMariage: e.target.value })}
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Adresse ville"
            value={formData.adresseVille}
            onChange={(e) => setFormData({ ...formData, adresseVille: e.target.value })}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Sexe</InputLabel>
            <Select
              value={formData.sexe}
              label="Sexe"
              onChange={(e) => setFormData({ ...formData, sexe: e.target.value })}
            >
              <MenuItem value="">Sélectionner</MenuItem>
              <MenuItem value="M">Masculin</MenuItem>
              <MenuItem value="F">Féminin</MenuItem>
              <MenuItem value="Autre">Autre</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            margin="normal"
            helperText="Vous recevrez la décision finale à cette adresse"
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Direction</InputLabel>
            <Select
              value={formData.directionId}
              label="Direction"
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
          <FormControl fullWidth margin="normal" required disabled={!formData.directionId}>
            <InputLabel>Service</InputLabel>
            <Select
              value={formData.serviceId}
              label="Service"
              onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
            >
              <MenuItem value="">Sélectionner un service</MenuItem>
              {filteredServices.map((service) => (
                <MenuItem key={service._id} value={service._id}>
                  {service.libelle}
                </MenuItem>
              ))}
            </Select>
            {!formData.directionId && (
              <Box sx={{ mt: 1 }}>
                <small style={{ color: '#666' }}>Veuillez d'abord sélectionner une direction</small>
              </Box>
            )}
          </FormControl>
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={formData.photoPreview} sx={{ width: 80, height: 80 }}>
              {!formData.photoPreview && 'Photo'}
            </Avatar>
            <label>
              <input
                type="file"
                accept="image/*"
                onChange={onPhotoChange}
                style={{ display: 'none' }}
              />
              <Box
                component="span"
                sx={{
                  display: 'inline-block',
                  px: 2,
                  py: 1,
                  bgcolor: 'primary.main',
                  color: 'white',
                  borderRadius: 1,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'primary.dark' },
                }}
              >
                Choisir une photo
              </Box>
            </label>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
