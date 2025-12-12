import React, { useState } from 'react';
import { 
  Box, 
  Grid, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  FormControlLabel,
  Checkbox,
  Paper,
  Typography,
  Divider,
  OutlinedInput
} from '@mui/material';

export default function Step3DetailsDemande({ formData, setFormData, postes, localites }) {
  const [openLocalisations, setOpenLocalisations] = useState(false);

  const handleLocalisationChange = (localiteId) => {
    const currentLocalisations = formData.localisationsSouhaitees || [];
    if (currentLocalisations.includes(localiteId)) {
      setFormData({
        ...formData,
        localisationsSouhaitees: currentLocalisations.filter((id) => id !== localiteId),
      });
    } else {
      setFormData({
        ...formData,
        localisationsSouhaitees: [...currentLocalisations, localiteId],
      });
    }
  };

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
            <InputLabel>Nouveau poste</InputLabel>
            <Select
              value={formData.posteSouhaiteId}
              label="Nouveau poste"
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
            <InputLabel>Localisations souhaitées</InputLabel>
            <Select
              multiple
              open={openLocalisations}
              onClose={() => setOpenLocalisations(false)}
              onOpen={() => setOpenLocalisations(true)}
              value={formData.localisationsSouhaitees || []}
              input={<OutlinedInput label="Localisations souhaitées" />}
              renderValue={(selected) => {
                if (selected.length === 0) return 'Aucune localisation sélectionnée';
                if (selected.length === 1) {
                  const localite = localites.find((l) => l._id === selected[0]);
                  return localite?.libelle || selected[0];
                }
                return `${selected.length} localisation(s) sélectionnée(s)`;
              }}
              MenuProps={{
                PaperProps: {
                  style: {
                    maxHeight: 400,
                  },
                },
              }}
            >
              {localites.map((localite) => (
                <MenuItem
                  key={localite._id}
                  value={localite._id}
                  onClick={(e) => {
                    e.preventDefault();
                    handleLocalisationChange(localite._id);
                  }}
                >
                  <Checkbox
                    checked={(formData.localisationsSouhaitees || []).includes(localite._id)}
                  />
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
