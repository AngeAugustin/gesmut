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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  InputAdornment,
  Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { demandesService } from '../../services/demandesService';
import { validationsService } from '../../services/validationsService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';

const getStatusLabel = (status) => {
  const labels = {
    BROUILLON: 'Brouillon',
    SOUMISE: 'Soumise',
    INELIGIBLE: 'Inéligible',
    EN_VALIDATION_HIERARCHIQUE: 'En validation hiérarchique',
    VALIDEE_HIERARCHIQUE: 'Validée hiérarchique',
    REJETEE_HIERARCHIQUE: 'Rejetée hiérarchique',
    EN_ETUDE_DGR: 'En étude DGR',
    AVIS_DGR_FAVORABLE: 'Avis DGR favorable',
    AVIS_DGR_DEFAVORABLE: 'Avis DGR défavorable',
    EN_VERIFICATION_CVR: 'En vérification CVR',
    VALIDEE_CVR: 'Validée CVR',
    REJETEE_CVR: 'Rejetée CVR',
    EN_ETUDE_DNCF: 'En étude DNCF',
    ACCEPTEE: 'Acceptée',
    REJETEE: 'Rejetée',
  };
  return labels[status] || status;
};

export default function DGRDemandes() {
  const { user } = useAuth();
  const { success, error, warning } = useToast();
  const [demandes, setDemandes] = useState([]);
  const [filteredDemandes, setFilteredDemandes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    decision: 'VALIDE',
    commentaire: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDemandes = async () => {
      if (!user) return; // Attendre que l'utilisateur soit chargé
      
      try {
        // Récupérer les demandes et les validations en parallèle
        const [demandesRes, validationsRes] = await Promise.all([
          demandesService.getAll(),
          validationsService.getAll(),
        ]);
        
        // Filtrer les demandes qui sont en attente d'étude DGR
        const demandesFiltrees = demandesRes.data.filter(
          (d) =>
            d.statut === 'VALIDEE_HIERARCHIQUE' ||
            d.statut === 'EN_ETUDE_DGR' ||
            d.statut === 'EN_VERIFICATION_CVR' // Même si rejetée, la demande continue
        );
        
        // Filtrer les validations du DGR connecté avec le rôle DGR
        const validationsDGR = validationsRes.data.filter(v => {
          const validateurId = v.validateurId?._id || v.validateurId;
          const userId = user?._id || user?.id;
          const roleMatch = v.validateurRole && String(v.validateurRole).toUpperCase() === 'DGR';
          return roleMatch && (validateurId === userId || String(validateurId) === String(userId));
        });
        
        // Créer un Set des IDs des demandes déjà traitées par ce DGR
        const demandesTraiteesIds = new Set(
          validationsDGR.map(v => String(v.demandeId?._id || v.demandeId))
        );
        
        // Filtrer pour ne garder que les demandes non encore traitées par ce DGR
        const demandesNonTraitees = demandesFiltrees.filter(
          (d) => !demandesTraiteesIds.has(String(d._id))
        );
        
        setDemandes(demandesNonTraitees);
        setFilteredDemandes(demandesNonTraitees);
      } catch (error) {
        console.error('Erreur', error);
      }
    };
    fetchDemandes();
    const interval = setInterval(fetchDemandes, 30000);
    return () => clearInterval(interval);
  }, [user]);

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
      const localisation = typeof demande.localisationSouhaiteId === 'object' && demande.localisationSouhaiteId !== null
        ? (demande.localisationSouhaiteId.libelle || '').toLowerCase()
        : '';
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

  const handleValidation = async () => {
    if (!formData.commentaire.trim()) {
      warning('Le commentaire est obligatoire');
      return;
    }
    setLoading(true);
    try {
      await validationsService.create({
        demandeId: selectedDemande._id,
        decision: formData.decision,
        commentaire: formData.commentaire,
        validateurRole: 'DGR', // Spécifier le rôle du validateur
      });
      setOpen(false);
      setFormData({ decision: 'VALIDE', commentaire: '' });
      setSelectedDemande(null);
      
      // Recharger avec le même filtre
      const [demandesRes, validationsRes] = await Promise.all([
        demandesService.getAll(),
        validationsService.getAll(),
      ]);
      
      const demandesFiltrees = demandesRes.data.filter(
        (d) =>
          d.statut === 'VALIDEE_HIERARCHIQUE' ||
          d.statut === 'EN_ETUDE_DGR' ||
          d.statut === 'EN_VERIFICATION_CVR'
      );
      
      const validationsDGR = validationsRes.data.filter(v => {
        const validateurId = v.validateurId?._id || v.validateurId;
        const userId = user?._id || user?.id;
        const roleMatch = v.validateurRole && String(v.validateurRole).toUpperCase() === 'DGR';
        return roleMatch && (validateurId === userId || String(validateurId) === String(userId));
      });
      
      const demandesTraiteesIds = new Set(
        validationsDGR.map(v => String(v.demandeId?._id || v.demandeId))
      );
      
      const demandesNonTraitees = demandesFiltrees.filter(
        (d) => !demandesTraiteesIds.has(String(d._id))
      );
      
      setDemandes(demandesNonTraitees);
      setFilteredDemandes(demandesNonTraitees);
      success(formData.decision === 'VALIDE' ? 'Demande validée avec succès' : 'Demande rejetée');
    } catch (err) {
      console.error('Erreur', err);
      error('Erreur lors de la validation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Demandes à traiter"
        subtitle="Examinez et donnez votre avis sur les demandes de mutation validées hiérarchiquement"
      />
      
      <Box sx={{ mb: 3, mt: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Rechercher par agent, motif, poste, localisation ou statut..."
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
              <TableCell><strong>Motif</strong></TableCell>
              <TableCell><strong>Poste souhaité</strong></TableCell>
              <TableCell><strong>Localisation souhaitée</strong></TableCell>
              <TableCell><strong>Statut</strong></TableCell>
              <TableCell><strong>Date de soumission</strong></TableCell>
              <TableCell><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDemandes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
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
              let agentPrenom = '';
              let agentMatricule = null;
              
              if (agent && typeof agent === 'object' && agent !== null) {
                // Agent connecté (agentId populé)
                agentNom = agent.nom || '';
                agentPrenom = agent.prenom || '';
                agentMatricule = agent.matricule;
              } else if (demande.informationsAgent) {
                // Demande publique (informationsAgent)
                agentNom = demande.informationsAgent.nom || '';
                agentPrenom = demande.informationsAgent.prenom || '';
                agentMatricule = demande.informationsAgent.matricule;
              }
              
              const agentNomComplet = `${agentNom} ${agentPrenom}`.trim() || '-';
              
              const poste = demande.posteSouhaiteId;
              const posteLibelle = typeof poste === 'object' && poste !== null
                ? poste.intitule
                : '-';
              
              const localisation = demande.localisationSouhaiteId;
              const localisationLibelle = typeof localisation === 'object' && localisation !== null
                ? localisation.libelle
                : '-';

              return (
              <TableRow key={demande._id}>
                <TableCell>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {agentNomComplet}
                    </Typography>
                    {agentMatricule && (
                      <Typography variant="caption" color="text.secondary">
                        Matricule: {agentMatricule}
                      </Typography>
                    )}
                  </Box>
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
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<VisibilityIcon />}
                      onClick={() => navigate(`/dgr/demandes/${demande._id}`)}
                    >
                      Voir détails
                    </Button>
                    {(demande.statut === 'VALIDEE_HIERARCHIQUE' ||
                      demande.statut === 'EN_ETUDE_DGR' ||
                      demande.statut === 'AVIS_DGR_FAVORABLE' ||
                      demande.statut === 'AVIS_DGR_DEFAVORABLE') && (
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          setSelectedDemande(demande);
                          setOpen(true);
                        }}
                      >
                        Traiter
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
              );
            })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Donner un avis sur la demande</DialogTitle>
        <DialogContent>
          {selectedDemande && (() => {
            // Gérer les deux cas : agentId (connecté) ou informationsAgent (public)
            let agentNom = '-';
            let agentPrenom = '';
            let agentMatricule = null;
            
            if (selectedDemande.agentId && typeof selectedDemande.agentId === 'object') {
              agentNom = selectedDemande.agentId.nom || '';
              agentPrenom = selectedDemande.agentId.prenom || '';
              agentMatricule = selectedDemande.agentId.matricule;
            } else if (selectedDemande.informationsAgent) {
              agentNom = selectedDemande.informationsAgent.nom || '';
              agentPrenom = selectedDemande.informationsAgent.prenom || '';
              agentMatricule = selectedDemande.informationsAgent.matricule;
            }
            
            const agentNomComplet = `${agentNom} ${agentPrenom}`.trim() || '-';
            
            return (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                <strong>Agent:</strong> {agentNomComplet}
              </Typography>
              {agentMatricule && (
                <Typography variant="body2" color="text.secondary">
                  <strong>Matricule:</strong> {agentMatricule}
                </Typography>
              )}
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                <strong>Motif:</strong> {selectedDemande.motif || '-'}
              </Typography>
            </Box>
            );
          })()}
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Commentaire (obligatoire)"
            value={formData.commentaire}
            onChange={(e) =>
              setFormData({ ...formData, commentaire: e.target.value })
            }
            required
            sx={{ mb: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setOpen(false);
            setFormData({ decision: 'VALIDE', commentaire: '' });
          }} disabled={loading}>
            Annuler
          </Button>
          <Button
            onClick={() => {
              setFormData({ ...formData, decision: 'VALIDE' });
              handleValidation();
            }}
            variant="contained"
            color="success"
            disabled={!formData.commentaire.trim() || loading}
            startIcon={<CheckCircleIcon />}
            sx={{ mr: 1 }}
          >
            Avis favorable
          </Button>
          <Button
            onClick={() => {
              setFormData({ ...formData, decision: 'REJETE' });
              handleValidation();
            }}
            variant="contained"
            color="error"
            disabled={!formData.commentaire.trim() || loading}
            startIcon={<CancelIcon />}
          >
            Avis défavorable
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
