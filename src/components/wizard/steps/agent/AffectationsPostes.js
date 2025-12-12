import React from 'react';
import {
  Box,
  Grid,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Typography,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

export default function AffectationsPostes({
  affectationsPostes = [],
  setAffectationsPostes,
  postes,
}) {
  const [affectationForm, setAffectationForm] = React.useState({
    posteId: '',
    dateDebut: '',
    dateFin: '',
    motifFin: '',
  });

  const handleAddAffectation = () => {
    if (!affectationForm.posteId || !affectationForm.dateDebut) {
      return;
    }

    // Vérifier que la date de fin est après la date de début
    if (affectationForm.dateFin && new Date(affectationForm.dateFin) <= new Date(affectationForm.dateDebut)) {
      alert('La date de fin doit être postérieure à la date de début');
      return;
    }

    const newAffectation = {
      posteId: affectationForm.posteId,
      dateDebut: affectationForm.dateDebut,
      dateFin: affectationForm.dateFin || null,
      motifFin: affectationForm.motifFin || null,
    };

    setAffectationsPostes([...affectationsPostes, newAffectation]);
    setAffectationForm({
      posteId: '',
      dateDebut: '',
      dateFin: '',
      motifFin: '',
    });
  };

  const handleRemoveAffectation = (index) => {
    setAffectationsPostes(affectationsPostes.filter((_, i) => i !== index));
  };

  const getPosteLibelle = (posteId) => {
    const poste = postes.find((p) => p._id === posteId);
    return poste ? poste.intitule : '-';
  };

  // Trier les affectations chronologiquement par date de début (plus ancienne en premier)
  const affectationsTriees = [...affectationsPostes].sort((a, b) => {
    const dateA = new Date(a.dateDebut).getTime();
    const dateB = new Date(b.dateDebut).getTime();
    return dateA - dateB;
  });

  const affectationsActuelles = affectationsTriees.filter((aff) => !aff.dateFin);
  const affectationsPassees = affectationsTriees.filter((aff) => aff.dateFin).sort((a, b) => {
    // Pour l'historique, trier par date de fin décroissante (plus récent en premier)
    const dateFinA = a.dateFin ? new Date(a.dateFin).getTime() : 0;
    const dateFinB = b.dateFin ? new Date(b.dateFin).getTime() : 0;
    return dateFinB - dateFinA;
  });

  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Affectations de postes
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Un agent peut occuper plusieurs postes simultanément ou successivement. 
        La date de fin correspond à la date de début du poste suivant ou à la date de mutation.
      </Alert>

      {/* Formulaire d'ajout */}
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
          Ajouter une affectation
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth required>
              <InputLabel>Poste *</InputLabel>
              <Select
                value={affectationForm.posteId}
                label="Poste *"
                onChange={(e) => setAffectationForm({ ...affectationForm, posteId: e.target.value })}
              >
                <MenuItem value="">Sélectionner un poste</MenuItem>
                {postes.map((poste) => (
                  <MenuItem key={poste._id} value={poste._id}>
                    {poste.intitule}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Date de début *"
              type="date"
              required
              value={affectationForm.dateDebut}
              onChange={(e) => setAffectationForm({ ...affectationForm, dateDebut: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Date de fin"
              type="date"
              value={affectationForm.dateFin}
              onChange={(e) => setAffectationForm({ ...affectationForm, dateFin: e.target.value })}
              InputLabelProps={{ shrink: true }}
              helperText="Laisser vide si poste actuel"
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddAffectation}
              disabled={!affectationForm.posteId || !affectationForm.dateDebut}
              sx={{ height: '56px' }}
            >
              Ajouter
            </Button>
          </Grid>
          {affectationForm.dateFin && (
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Motif de fin (optionnel)"
                value={affectationForm.motifFin}
                onChange={(e) => setAffectationForm({ ...affectationForm, motifFin: e.target.value })}
                placeholder="Ex: Mutation, Promotion, etc."
              />
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Affectations actuelles */}
      {affectationsActuelles.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'success.main' }}>
            Postes actuels ({affectationsActuelles.length})
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'success.light' }}>
                  <TableCell>Poste</TableCell>
                  <TableCell>Date de début</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {affectationsActuelles.map((affectation, index) => {
                  const originalIndex = affectationsPostes.findIndex((aff) => aff === affectation);
                  return (
                    <TableRow key={originalIndex} hover>
                      <TableCell>{getPosteLibelle(affectation.posteId)}</TableCell>
                      <TableCell>
                        {new Date(affectation.dateDebut).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveAffectation(originalIndex)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {/* Affectations passées */}
      {affectationsPassees.length > 0 && (
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, color: 'text.secondary' }}>
            Historique des postes ({affectationsPassees.length})
          </Typography>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.100' }}>
                  <TableCell>Poste</TableCell>
                  <TableCell>Date de début</TableCell>
                  <TableCell>Date de fin</TableCell>
                  <TableCell>Motif de fin</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {affectationsPassees.map((affectation, index) => {
                  const originalIndex = affectationsPostes.findIndex((aff) => aff === affectation);
                  return (
                    <TableRow key={originalIndex} hover>
                      <TableCell>{getPosteLibelle(affectation.posteId)}</TableCell>
                      <TableCell>
                        {new Date(affectation.dateDebut).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        {affectation.dateFin ? new Date(affectation.dateFin).toLocaleDateString('fr-FR') : '-'}
                      </TableCell>
                      <TableCell>{affectation.motifFin || '-'}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveAffectation(originalIndex)}
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {affectationsPostes.length === 0 && (
        <Alert severity="info">
          Aucune affectation de poste. Vous pouvez ajouter une ou plusieurs affectations ci-dessus.
        </Alert>
      )}
    </Box>
  );
}

