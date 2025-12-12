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
  Button,
  TextField,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { demandesService } from '../../services/demandesService';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';

const getStatusLabel = (status) => {
  const labels = {
    BROUILLON: 'Brouillon',
    SOUMISE: 'Soumise',
    VALIDEE_HIERARCHIQUE: 'Validée hiérarchique',
    EN_ETUDE_DGR: 'En étude DGR',
    AVIS_DGR_FAVORABLE: 'Avis DGR favorable',
    AVIS_DGR_DEFAVORABLE: 'Avis DGR défavorable',
    EN_VERIFICATION_CVR: 'En vérification CVR',
    VERIFIEE_CVR: 'Vérifiée CVR',
    DECISION_DNCF: 'Décision DNCF',
    ACCEPTEE: 'Acceptée',
    REJETEE: 'Rejetée',
  };
  return labels[status] || status;
};

export default function AdminDemandes() {
  const [demandes, setDemandes] = useState([]);
  const [filteredDemandes, setFilteredDemandes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDemandes = async () => {
      try {
        const response = await demandesService.getAll();
        setDemandes(response.data);
        setFilteredDemandes(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des demandes', error);
      }
    };
    fetchDemandes();
    const interval = setInterval(fetchDemandes, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredDemandes(demandes);
      return;
    }

    const filtered = demandes.filter((demande) => {
      // Gérer les deux cas : agentId (connecté) ou informationsAgent (public)
      let agentName = '';
      if (demande.agentId && typeof demande.agentId === 'object') {
        agentName = `${demande.agentId.nom || ''} ${demande.agentId.prenom || ''}`.toLowerCase();
      } else if (demande.informationsAgent) {
        agentName = `${demande.informationsAgent.nom || ''} ${demande.informationsAgent.prenom || ''}`.toLowerCase();
      }
      
      const motif = (demande.motif || '').toLowerCase();
      const poste = typeof demande.posteSouhaiteId === 'object' && demande.posteSouhaiteId !== null
        ? (demande.posteSouhaiteId.intitule || '').toLowerCase()
        : '';
      // Gérer les localisations multiples (nouveau) ou unique (ancien pour compatibilité)
      const localisations = demande.localisationsSouhaitees || (demande.localisationSouhaiteId ? [demande.localisationSouhaiteId] : []);
      const localisationsLibelles = Array.isArray(localisations)
        ? localisations
            .map((loc) => {
              if (typeof loc === 'object' && loc !== null) {
                return loc.libelle || '';
              }
              return '';
            })
            .filter((lib) => lib !== '')
        : [];
      const localisation = localisationsLibelles.join(' ').toLowerCase();
      const statut = getStatusLabel(demande.statut).toLowerCase();
      const search = searchTerm.toLowerCase();

      return (
        agentName.includes(search) ||
        motif.includes(search) ||
        poste.includes(search) ||
        localisation.includes(search) ||
        statut.includes(search)
      );
    });
    setFilteredDemandes(filtered);
  }, [searchTerm, demandes]);

  return (
    <Box>
      <PageHeader
        title="Gestion des demandes"
        subtitle="Vue d'ensemble de toutes les demandes de mutation"
      />
      
      <Box sx={{ mb: 3, mt: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher par agent, motif, poste ou statut..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Agent</strong></TableCell>
              <TableCell><strong>Type</strong></TableCell>
              <TableCell><strong>Motif</strong></TableCell>
              <TableCell><strong>Nouveau poste</strong></TableCell>
              <TableCell><strong>Localisation(s) souhaitée(s)</strong></TableCell>
              <TableCell><strong>Statut</strong></TableCell>
              <TableCell><strong>Date de soumission</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDemandes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                    {searchTerm ? 'Aucune demande ne correspond à votre recherche' : 'Aucune demande trouvée'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredDemandes.map((demande) => {
                // Gérer les cas où les données peuvent être populées ou non
                // Pour les demandes publiques, agentId est null et les infos sont dans informationsAgent
                const agent = demande.agentId;
                let agentNom = '-';
                let agentMatricule = null;
                
                if (agent && typeof agent === 'object' && agent !== null) {
                  // Agent connecté (agentId populé)
                  agentNom = `${agent.nom || ''} ${agent.prenom || ''}`.trim();
                  agentMatricule = agent.matricule;
                } else if (demande.informationsAgent) {
                  // Demande publique (informationsAgent)
                  agentNom = `${demande.informationsAgent.nom || ''} ${demande.informationsAgent.prenom || ''}`.trim();
                  agentMatricule = demande.informationsAgent.matricule;
                }
                
                const poste = demande.posteSouhaiteId;
                const posteLibelle = typeof poste === 'object' && poste !== null
                  ? poste.intitule
                  : '-';
                
                // Gérer les localisations multiples (nouveau) ou unique (ancien pour compatibilité)
                const localisations = demande.localisationsSouhaitees || (demande.localisationSouhaiteId ? [demande.localisationSouhaiteId] : []);
                const localisationsLibelles = Array.isArray(localisations)
                  ? localisations
                      .map((loc) => {
                        if (typeof loc === 'object' && loc !== null) {
                          return loc.libelle || '-';
                        }
                        return '-';
                      })
                      .filter((lib) => lib !== '-')
                  : [];
                const localisationLibelle = localisationsLibelles.length > 0 ? localisationsLibelles.join(', ') : '-';

                return (
                <TableRow key={demande._id} hover>
                  <TableCell>
                    {agentNom || '-'}
                    {agentMatricule && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        Matricule: {agentMatricule}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={demande.type === 'SIMPLE' ? 'Simple' : 'Stratégique'}
                      size="small"
                      color={demande.type === 'SIMPLE' ? 'primary' : 'secondary'}
                    />
                  </TableCell>
                  <TableCell>{demande.motif || '-'}</TableCell>
                  <TableCell>
                    {posteLibelle}
                  </TableCell>
                  <TableCell>
                    {localisationLibelle}
                  </TableCell>
                  <TableCell>
                    <StatusChip
                      status={demande.statut}
                      label={getStatusLabel(demande.statut)}
                    />
                  </TableCell>
                  <TableCell>
                    {demande.dateSoumission
                      ? new Date(demande.dateSoumission).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : demande.createdAt
                      ? new Date(demande.createdAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      onClick={() => navigate(`/admin/demandes/${demande._id}`)}
                    >
                      Voir détails
                    </Button>
                  </TableCell>
                </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

