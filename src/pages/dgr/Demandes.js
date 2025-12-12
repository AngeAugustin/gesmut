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
  Tabs,
  Tab,
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

// Composant TabPanel pour les onglets
function TabPanel({ children, value, index }) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

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
  
  // Gérer les rôles multiples et les onglets
  const userRoles = user?.roles && Array.isArray(user.roles) && user.roles.length > 0
    ? user.roles
    : user?.role
      ? [user.role]
      : [];
  
  // Déterminer les rôles disponibles pour validation
  const rolesDisponibles = userRoles.filter(role => 
    ['RESPONSABLE', 'DGR', 'CVR', 'DNCF'].includes(role)
  );
  
  // Onglet actif (0 = premier rôle)
  // Si l'utilisateur a DGR, commencer par DGR, sinon par le premier rôle
  const initialTab = rolesDisponibles.includes('DGR') 
    ? rolesDisponibles.indexOf('DGR')
    : 0;
  const [activeTab, setActiveTab] = useState(initialTab);
  const roleActif = rolesDisponibles[activeTab] || rolesDisponibles[0] || 'DGR';
  
  // Debug: log pour voir le rôle actif
  useEffect(() => {
    console.log('🔍 Rôle actif changé:', {
      roleActif,
      activeTab,
      rolesDisponibles,
      userRoles,
    });
  }, [roleActif, activeTab, rolesDisponibles, userRoles]);
  
  // Labels des rôles
  const roleLabels = {
    RESPONSABLE: 'Responsable hiérarchique',
    DGR: 'DGR',
    CVR: 'CVR',
    DNCF: 'DNCF',
  };

  useEffect(() => {
    const fetchDemandes = async () => {
      if (!user || rolesDisponibles.length === 0) return; // Attendre que l'utilisateur soit chargé
      
      console.log('📥 fetchDemandes appelé avec roleActif:', roleActif);
      
      try {
        let demandesRes, validationsRes;
        
        // Pour RESPONSABLE, utiliser l'endpoint spécialisé qui filtre par service
        if (roleActif === 'RESPONSABLE') {
          console.log('📞 Appel getDemandesPourResponsable()');
          [demandesRes, validationsRes] = await Promise.all([
            demandesService.getDemandesPourResponsable(),
            validationsService.getAll(),
          ]);
        } else {
          // Pour DGR, CVR, DNCF, récupérer toutes les demandes
          console.log('📞 Appel demandesService.getAll() pour rôle:', roleActif);
          [demandesRes, validationsRes] = await Promise.all([
            demandesService.getAll(),
            validationsService.getAll(),
          ]);
        }
        
        console.log('📊 Demandes récupérées:', {
          total: demandesRes.data?.length || 0,
          roleActif,
          premieresDemandes: demandesRes.data?.slice(0, 3).map(d => ({ id: d._id, statut: d.statut }))
        });
        
        // Filtrer les demandes selon le rôle actif
        let demandesFiltrees = [];
        if (roleActif === 'RESPONSABLE') {
          const demandesDeMonService = demandesRes.data || [];
          demandesFiltrees = demandesDeMonService.filter(
            (d) =>
              d.statut === 'EN_VALIDATION_HIERARCHIQUE' ||
              d.statut === 'EN_ETUDE_DGR'
          );
        } else if (roleActif === 'DGR') {
          demandesFiltrees = demandesRes.data.filter(
            (d) =>
              d.statut === 'VALIDEE_HIERARCHIQUE' ||
              d.statut === 'EN_ETUDE_DGR' ||
              d.statut === 'EN_VERIFICATION_CVR'
          );
        } else if (roleActif === 'CVR') {
          demandesFiltrees = demandesRes.data.filter(
            (d) =>
              d.statut === 'AVIS_DGR_FAVORABLE' ||
              d.statut === 'EN_VERIFICATION_CVR' ||
              d.statut === 'VALIDEE_CVR'
          );
        } else if (roleActif === 'DNCF') {
          demandesFiltrees = demandesRes.data.filter(
            (d) =>
              d.statut === 'VALIDEE_CVR' ||
              d.statut === 'EN_ETUDE_DNCF' ||
              d.statut === 'ACCEPTEE' ||
              d.statut === 'REJETEE'
          );
        }
        
        // Debug: afficher les statuts des demandes filtrées
        console.log('📋 Demandes avec statuts EN_ETUDE_DGR/VALIDEE_HIERARCHIQUE:', 
          demandesFiltrees.map(d => ({ id: d._id, statut: d.statut, agent: d.agentId?.nom || d.informationsAgent?.nom }))
        );
        
        // Filtrer les validations de l'utilisateur connecté avec le rôle actif uniquement
        const validationsRoleActif = validationsRes.data.filter(v => {
          const validateurId = v.validateurId?._id || v.validateurId;
          const userId = user?._id || user?.id;
          const roleMatch = v.validateurRole && String(v.validateurRole).toUpperCase() === roleActif.toUpperCase();
          const userIdMatch = validateurId === userId || String(validateurId) === String(userId);
          return roleMatch && userIdMatch;
        });
        
        // Créer un Set des IDs des demandes déjà traitées avec le rôle actif
        const demandesTraiteesIds = new Set(
          validationsRoleActif.map(v => String(v.demandeId?._id || v.demandeId))
        );
        
        // Filtrer pour ne garder que les demandes non encore traitées avec ce rôle
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
  }, [user, roleActif, rolesDisponibles]);

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
        validateurRole: roleActif, // Utiliser le rôle actif (onglet sélectionné)
      });
      setOpen(false);
      setFormData({ decision: 'VALIDE', commentaire: '' });
      setSelectedDemande(null);
      
      // Recharger avec le même filtre selon le rôle actif
      let demandesRes, validationsRes;
      if (roleActif === 'RESPONSABLE') {
        [demandesRes, validationsRes] = await Promise.all([
          demandesService.getDemandesPourResponsable(),
          validationsService.getAll(),
        ]);
      } else {
        [demandesRes, validationsRes] = await Promise.all([
          demandesService.getAll(),
          validationsService.getAll(),
        ]);
      }
      
      // Appliquer le même filtrage que dans useEffect
      let demandesFiltrees = [];
      if (roleActif === 'RESPONSABLE') {
        const demandesDeMonService = demandesRes.data || [];
        demandesFiltrees = demandesDeMonService.filter(
          (d) =>
            d.statut === 'EN_VALIDATION_HIERARCHIQUE' ||
            d.statut === 'EN_ETUDE_DGR'
        );
      } else if (roleActif === 'DGR') {
        demandesFiltrees = demandesRes.data.filter(
          (d) =>
            d.statut === 'VALIDEE_HIERARCHIQUE' ||
            d.statut === 'EN_ETUDE_DGR' ||
            d.statut === 'EN_VERIFICATION_CVR'
        );
      }
      
      const validationsRoleActif = validationsRes.data.filter(v => {
        const validateurId = v.validateurId?._id || v.validateurId;
        const userId = user?._id || user?.id;
        const roleMatch = v.validateurRole && String(v.validateurRole).toUpperCase() === roleActif.toUpperCase();
        return roleMatch && (validateurId === userId || String(validateurId) === String(userId));
      });
      
      const demandesTraiteesIds = new Set(
        validationsRoleActif.map(v => String(v.demandeId?._id || v.demandeId))
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

  // Debug: vérifier les rôles disponibles
  useEffect(() => {
    console.log('👤 Rôles utilisateur:', {
      userRoles,
      rolesDisponibles,
      roleActif,
      activeTab,
      afficherOnglets: rolesDisponibles.length > 1
    });
  }, [userRoles, rolesDisponibles, roleActif, activeTab]);

  return (
    <Box>
      <PageHeader
        title={rolesDisponibles.length > 1 ? "Demandes à valider" : "Demandes à traiter"}
        subtitle={rolesDisponibles.length > 1 
          ? "Examinez et validez les demandes selon votre rôle" 
          : "Examinez et donnez votre avis sur les demandes de mutation"}
      />
      
      {/* Système d'onglets si plusieurs rôles */}
      {rolesDisponibles.length > 1 ? (
        <Paper sx={{ mb: 3, mt: 2 }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, newValue) => {
              console.log('🔄 Changement d\'onglet:', { 
                ancien: activeTab, 
                nouveau: newValue, 
                ancienRole: rolesDisponibles[activeTab],
                nouveauRole: rolesDisponibles[newValue],
                rolesDisponibles
              });
              setActiveTab(newValue);
            }}
            variant="fullWidth"
            indicatorColor="primary"
            textColor="primary"
          >
            {rolesDisponibles.map((role, index) => (
              <Tab 
                key={role} 
                label={roleLabels[role] || role}
                sx={{ textTransform: 'none', fontSize: '1rem' }}
              />
            ))}
          </Tabs>
        </Paper>
      ) : (
        <Alert severity="info" sx={{ mb: 3, mt: 2 }}>
          Vous avez un seul rôle ({rolesDisponibles[0] || 'Aucun'}). Les onglets ne sont pas nécessaires.
        </Alert>
      )}
      
      <Box sx={{ mb: 3, mt: rolesDisponibles.length > 1 ? 0 : 3 }}>
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
                    {((roleActif === 'RESPONSABLE' && (demande.statut === 'EN_VALIDATION_HIERARCHIQUE' || demande.statut === 'EN_ETUDE_DGR')) ||
                      (roleActif === 'DGR' && (demande.statut === 'VALIDEE_HIERARCHIQUE' || demande.statut === 'EN_ETUDE_DGR' || demande.statut === 'AVIS_DGR_FAVORABLE' || demande.statut === 'AVIS_DGR_DEFAVORABLE'))) && (
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        onClick={() => {
                          setSelectedDemande(demande);
                          setOpen(true);
                        }}
                      >
                        {roleActif === 'RESPONSABLE' ? 'Valider' : 'Traiter'}
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
        <DialogTitle>
          {roleActif === 'RESPONSABLE' ? 'Valider ou rejeter la demande' : 'Donner un avis sur la demande'}
        </DialogTitle>
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
            {roleActif === 'RESPONSABLE' ? 'Valider' : 'Avis favorable'}
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
            {roleActif === 'RESPONSABLE' ? 'Rejeter' : 'Avis défavorable'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
