import React from 'react';
import {
  Box,
  Grid,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Alert,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

export default function Step2Famille({
  formData,
  setFormData,
  conjointForm,
  setConjointForm,
  enfantForm,
  setEnfantForm,
  onAddConjoint,
  onRemoveConjoint,
  onAddEnfant,
  onRemoveEnfant,
}) {
  return (
    <Box sx={{ py: 2 }}>
      {/* Conjoints */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Conjoints</h3>
        </Box>
        {formData.sexe === 'F' && formData.conjoints.length >= 1 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Pour le sexe Féminin, vous ne pouvez ajouter qu'un seul conjoint.
          </Alert>
        )}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Code"
              value={conjointForm.code}
              onChange={(e) => setConjointForm({ ...conjointForm, code: e.target.value })}
              disabled={formData.sexe === 'F' && formData.conjoints.length >= 1}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Nom *"
              value={conjointForm.nom}
              onChange={(e) => setConjointForm({ ...conjointForm, nom: e.target.value })}
              disabled={formData.sexe === 'F' && formData.conjoints.length >= 1}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Prénom *"
              value={conjointForm.prenom}
              onChange={(e) => setConjointForm({ ...conjointForm, prenom: e.target.value })}
              disabled={formData.sexe === 'F' && formData.conjoints.length >= 1}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAddConjoint}
              disabled={
                !conjointForm.nom ||
                !conjointForm.prenom ||
                (formData.sexe === 'F' && formData.conjoints.length >= 1)
              }
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
                <TableCell>Code</TableCell>
                <TableCell>Nom</TableCell>
                <TableCell>Prénom</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formData.conjoints.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    Aucun conjoint ajouté
                  </TableCell>
                </TableRow>
              ) : (
                formData.conjoints.map((conjoint, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{conjoint.code || '-'}</TableCell>
                    <TableCell>{conjoint.nom}</TableCell>
                    <TableCell>{conjoint.prenom}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="error"
                        onClick={() => onRemoveConjoint(index)}
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

      {/* Enfants */}
      <Box>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Enfants</h3>
        </Box>
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Code"
              value={enfantForm.code}
              onChange={(e) => setEnfantForm({ ...enfantForm, code: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Nom *"
              value={enfantForm.nom}
              onChange={(e) => setEnfantForm({ ...enfantForm, nom: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Prénom *"
              value={enfantForm.prenom}
              onChange={(e) => setEnfantForm({ ...enfantForm, prenom: e.target.value })}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onAddEnfant}
              disabled={!enfantForm.nom || !enfantForm.prenom}
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
                <TableCell>Code</TableCell>
                <TableCell>Nom</TableCell>
                <TableCell>Prénom</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {formData.enfants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                    Aucun enfant ajouté
                  </TableCell>
                </TableRow>
              ) : (
                formData.enfants.map((enfant, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{enfant.code || '-'}</TableCell>
                    <TableCell>{enfant.nom}</TableCell>
                    <TableCell>{enfant.prenom}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="error"
                        onClick={() => onRemoveEnfant(index)}
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
