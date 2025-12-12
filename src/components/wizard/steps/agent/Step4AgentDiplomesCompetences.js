import React from 'react';
import {
  Box,
  Grid,
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
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

export default function Step4AgentDiplomesCompetences({
  formData,
  setFormData,
  diplomes,
  competences,
  competenceForm,
  setCompetenceForm,
  onAddCompetence,
  onRemoveCompetence,
}) {
  return (
    <Box sx={{ py: 2 }}>
      <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
        Diplômes et compétences
      </Typography>

      {/* Diplômes */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Diplômes
        </Typography>
        <FormControl fullWidth>
          <InputLabel>Diplômes</InputLabel>
          <Select
            multiple
            value={formData.diplomeIds || []}
            label="Diplômes"
            onChange={(e) => setFormData({ ...formData, diplomeIds: e.target.value })}
            renderValue={(selected) => {
              if (selected.length === 0) return 'Aucun diplôme sélectionné';
              return selected
                .map((id) => {
                  const diplome = diplomes.find((d) => d._id === id);
                  return diplome?.libelle || id;
                })
                .join(', ');
            }}
          >
            {diplomes.map((diplome) => (
              <MenuItem key={diplome._id} value={diplome._id}>
                {diplome.libelle}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Compétences */}
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Compétences
        </Typography>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={5}>
            <FormControl fullWidth>
              <InputLabel>Compétence *</InputLabel>
              <Select
                value={competenceForm.competenceId || ''}
                label="Compétence *"
                onChange={(e) => {
                  const selectedCompetence = competences.find((c) => c._id === e.target.value);
                  setCompetenceForm({
                    ...competenceForm,
                    competenceId: e.target.value,
                    nom: selectedCompetence?.libelle || '',
                    categorie: selectedCompetence?.categorie || 'A',
                  });
                }}
              >
                {competences.map((competence) => (
                  <MenuItem key={competence._id} value={competence._id}>
                    {competence.libelle}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={5}>
            <FormControl fullWidth>
              <InputLabel>Niveau</InputLabel>
              <Select
                value={competenceForm.niveau || ''}
                label="Niveau"
                onChange={(e) => setCompetenceForm({ ...competenceForm, niveau: e.target.value })}
              >
                <MenuItem value="">Non spécifié</MenuItem>
                <MenuItem value="Passable">Passable</MenuItem>
                <MenuItem value="Moyen">Moyen</MenuItem>
                <MenuItem value="Bon">Bon</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAddCompetence}
              disabled={!competenceForm.competenceId}
              sx={{ height: '56px' }}
            >
              Ajouter
            </Button>
          </Grid>
        </Grid>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.light' }}>
                <TableCell>Nom</TableCell>
                <TableCell>Catégorie</TableCell>
                <TableCell>Niveau</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!formData.competences || formData.competences.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    Aucune compétence ajoutée
                  </TableCell>
                </TableRow>
              ) : (
                formData.competences.map((competence, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{competence.nom}</TableCell>
                    <TableCell>
                      <Chip
                        label={competence.categorie}
                        size="small"
                        color={
                          competence.categorie === 'A'
                            ? 'primary'
                            : competence.categorie === 'B'
                            ? 'info'
                            : 'default'
                        }
                      />
                    </TableCell>
                    <TableCell>{competence.niveau || '-'}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="error"
                        onClick={() => onRemoveCompetence(index)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}

