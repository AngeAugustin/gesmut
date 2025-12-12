import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { agentsService } from '../../services/agentsService';
import PageHeader from '../../components/common/PageHeader';
import { useToast } from '../../context/ToastContext';

export default function Affectations() {
  const [affectations, setAffectations] = useState([]);
  const [filteredAffectations, setFilteredAffectations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { error } = useToast();

  useEffect(() => {
    const fetchAffectations = async () => {
      try {
        setLoading(true);
        const response = await agentsService.getAllAffectations();
        setAffectations(response.data || []);
        setFilteredAffectations(response.data || []);
      } catch (err) {
        console.error('Erreur lors de la récupération des affectations:', err);
        error('Erreur lors de la récupération des affectations');
      } finally {
        setLoading(false);
      }
    };
    fetchAffectations();
  }, [error]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredAffectations(affectations);
      return;
    }

    const search = searchTerm.toLowerCase();
    const filtered = affectations.filter((aff) => {
      return (
        aff.agentNomComplet?.toLowerCase().includes(search) ||
        aff.agentMatricule?.toLowerCase().includes(search) ||
        aff.posteIntitule?.toLowerCase().includes(search) ||
        aff.servicePoste?.toLowerCase().includes(search) ||
        aff.localisationPoste?.toLowerCase().includes(search)
      );
    });
    setFilteredAffectations(filtered);
  }, [searchTerm, affectations]);

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Affectations"
        subtitle="Liste de toutes les affectations de postes effectuées"
      />

      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField
          placeholder="Rechercher par agent, poste, service ou localisation..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ flex: 1, maxWidth: 500 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Chip
          label={`${filteredAffectations.length} affectation(s)`}
          color="primary"
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Agent</strong></TableCell>
              <TableCell><strong>Matricule</strong></TableCell>
              <TableCell><strong>Poste</strong></TableCell>
              <TableCell><strong>Service</strong></TableCell>
              <TableCell><strong>Localisation</strong></TableCell>
              <TableCell><strong>Date début</strong></TableCell>
              <TableCell><strong>Date fin</strong></TableCell>
              <TableCell><strong>Motif fin</strong></TableCell>
              <TableCell><strong>Statut</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAffectations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    {searchTerm ? 'Aucune affectation trouvée pour cette recherche' : 'Aucune affectation enregistrée'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredAffectations.map((aff) => (
                <TableRow key={aff.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {aff.agentNomComplet || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>{aff.agentMatricule || '-'}</TableCell>
                  <TableCell>{aff.posteIntitule || '-'}</TableCell>
                  <TableCell>{aff.servicePoste || '-'}</TableCell>
                  <TableCell>{aff.localisationPoste || '-'}</TableCell>
                  <TableCell>{formatDate(aff.dateDebut)}</TableCell>
                  <TableCell>{formatDate(aff.dateFin)}</TableCell>
                  <TableCell>{aff.motifFin || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={aff.estActuelle ? 'Actuelle' : 'Terminée'}
                      color={aff.estActuelle ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

