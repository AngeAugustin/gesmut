import React from 'react';
import { Box, Grid, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

export default function Step3DetailsDemande({ formData, setFormData, postes, localites }) {
  return (
    <Box sx={{ py: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Motif de la demande"
            required
            multiline
            rows={6}
            value={formData.motif}
            onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
            placeholder="Décrivez les raisons de votre demande de mutation"
            helperText="Expliquez en détail pourquoi vous souhaitez cette mutation"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Poste souhaité</InputLabel>
            <Select
              value={formData.posteSouhaiteId}
              label="Poste souhaité"
              onChange={(e) => setFormData({ ...formData, posteSouhaiteId: e.target.value })}
            >
              <MenuItem value="">Aucun</MenuItem>
              {postes.map((poste) => (
                <MenuItem key={poste._id} value={poste._id}>
                  {poste.intitule} - {poste.localisationId?.libelle}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Localisation souhaitée</InputLabel>
            <Select
              value={formData.localisationSouhaiteId}
              label="Localisation souhaitée"
              onChange={(e) => setFormData({ ...formData, localisationSouhaiteId: e.target.value })}
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
    </Box>
  );
}
