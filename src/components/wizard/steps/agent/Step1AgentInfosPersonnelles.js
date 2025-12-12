import React from 'react';
import {
  Box,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Avatar,
  IconButton,
} from '@mui/material';
import { PhotoCamera as PhotoCameraIcon, Delete as DeleteIcon } from '@mui/icons-material';
import InputAdornment from '@mui/material/InputAdornment';

export default function Step1AgentInfosPersonnelles({
  formData,
  setFormData,
  photoPreview,
  onPhotoChange,
  onRemovePhoto,
}) {
  return (
    <Box sx={{ py: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Matricule *"
            required
            value={formData.matricule}
            onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
            margin="normal"
            helperText="Identifiant unique de l'agent"
          />
          <TextField
            fullWidth
            label="Nom *"
            required
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Prénom *"
            required
            value={formData.prenom}
            onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Sexe</InputLabel>
            <Select
              value={formData.sexe || ''}
              label="Sexe"
              onChange={(e) => setFormData({ ...formData, sexe: e.target.value })}
            >
              <MenuItem value="">Non spécifié</MenuItem>
              <MenuItem value="M">Masculin</MenuItem>
              <MenuItem value="F">Féminin</MenuItem>
              <MenuItem value="Autre">Autre</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Date de naissance *"
            type="date"
            required
            value={formData.dateNaissance || ''}
            onChange={(e) => setFormData({ ...formData, dateNaissance: e.target.value })}
            InputLabelProps={{ shrink: true }}
            margin="normal"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Téléphone"
            value={formData.telephone || ''}
            onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
            margin="normal"
            InputProps={{
              startAdornment: <InputAdornment position="start">+229</InputAdornment>,
            }}
          />
          
          {/* Photo */}
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            {photoPreview ? (
              <Box sx={{ position: 'relative' }}>
                <Avatar src={photoPreview} sx={{ width: 100, height: 100 }} />
                <IconButton
                  size="small"
                  onClick={onRemovePhoto}
                  sx={{ position: 'absolute', top: -8, right: -8, bgcolor: 'error.main', color: 'white' }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ) : (
              <Avatar sx={{ width: 100, height: 100, bgcolor: 'grey.300' }}>
                <PhotoCameraIcon />
              </Avatar>
            )}
            <Box>
              <input
                type="file"
                accept="image/*"
                onChange={onPhotoChange}
                style={{ display: 'none' }}
                id="photo-upload"
              />
              <label htmlFor="photo-upload">
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
                  {photoPreview ? 'Changer la photo' : 'Ajouter une photo'}
                </Box>
              </label>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

