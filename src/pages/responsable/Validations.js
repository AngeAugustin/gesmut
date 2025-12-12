import React, { useEffect, useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import { validationsService } from '../../services/validationsService';
import { demandesService } from '../../services/demandesService';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusChip from '../../components/common/StatusChip';
import ActionButton from '../../components/common/ActionButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

export default function Validations() {
  const { user } = useAuth();
  const { success, error, warning } = useToast();
  const [demandes, setDemandes] = useState([]);
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [open, setOpen] = useState(false);
  const [commentaire, setCommentaire] = useState('');
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
  
  // Onglet actif (prioriser RESPONSABLE si disponible, sinon DGR, sinon premier rôle)
  const initialTab = rolesDisponibles.includes('RESPONSABLE') 
    ? rolesDisponibles.indexOf('RESPONSABLE')
    : rolesDisponibles.includes('DGR')
    ? rolesDisponibles.indexOf('DGR')
    : 0;
  const [activeTab, setActiveTab] = useState(initialTab);
  const roleActif = rolesDisponibles[activeTab] || rolesDisponibles[0] || 'RESPONSABLE';
  
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
        
        console.log('📊 Demandes non traitées pour', roleActif + ':', demandesNonTraitees.length);
        setDemandes(demandesNonTraitees);
      } catch (error) {
        console.error('Erreur lors de la récupération des demandes:', error);
        console.error('Détails:', error.response?.data || error.message);
      }
    };
    fetchDemandes();
    const interval = setInterval(fetchDemandes, 30000);
    return () => clearInterval(interval);
  }, [user, roleActif, rolesDisponibles]);

  const handleValidation = async (decision) => {
    if (!commentaire.trim()) {
      warning('Le commentaire est obligatoire');
      return;
    }
    setLoading(true);
    try {
      await validationsService.create({
        demandeId: selectedDemande._id,
        decision,
        commentaire,
        validateurRole: roleActif, // Utiliser le rôle actif (onglet sélectionné)
      });
      setOpen(false);
      setCommentaire('');
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
      
      // Message de succès adapté selon le rôle
      let messageSuccess = '';
      if (roleActif === 'RESPONSABLE') {
        messageSuccess = decision === 'VALIDE' ? 'Demande validée avec succès' : 'Demande rejetée';
      } else if (roleActif === 'DGR') {
        messageSuccess = decision === 'VALIDE' ? 'Avis favorable enregistré' : 'Avis défavorable enregistré';
      } else if (roleActif === 'CVR') {
        messageSuccess = decision === 'VALIDE' ? 'Vérification validée avec succès' : 'Vérification rejetée';
      } else if (roleActif === 'DNCF') {
        messageSuccess = decision === 'VALIDE' ? 'Demande acceptée avec succès' : 'Demande rejetée définitivement';
      } else {
        messageSuccess = decision === 'VALIDE' ? 'Demande validée avec succès' : 'Demande rejetée';
      }
      success(messageSuccess);
    } catch (err) {
      console.error('Erreur', err);
      error('Erreur lors de la validation');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      id: 'agent',
      label: 'Agent',
      render: (value, row) => {
        // Gérer les deux cas : agentId (connecté) ou informationsAgent (public)
        if (row.agentId && typeof row.agentId === 'object') {
          return `${row.agentId.nom || ''} ${row.agentId.prenom || ''}`.trim() || '-';
        } else if (row.informationsAgent) {
          return `${row.informationsAgent.nom || ''} ${row.informationsAgent.prenom || ''}`.trim() || '-';
        }
        return '-';
      },
    },
    {
      id: 'matricule',
      label: 'Matricule',
      render: (value, row) => {
        // Gérer les deux cas : agentId (connecté) ou informationsAgent (public)
        if (row.agentId && typeof row.agentId === 'object') {
          return row.agentId.matricule || '-';
        } else if (row.informationsAgent) {
          return row.informationsAgent.matricule || '-';
        }
        return '-';
      },
    },
    {
      id: 'motif',
      label: 'Motif',
      render: (value) => value || '-',
    },
    {
      id: 'poste',
      label: 'Nouveau poste',
      render: (value, row) => row.posteSouhaiteId?.intitule || '-',
    },
    {
      id: 'statut',
      label: 'Statut',
      render: (value) => <StatusChip status={value} />,
    },
    {
      id: 'date',
      label: 'Date',
      render: (value) => new Date(value).toLocaleDateString('fr-FR'),
    },
  ];

  const actions = (row) => {
    const actionsList = [
      {
        icon: <VisibilityIcon />,
        tooltip: 'Voir les détails',
        onClick: () => {
          // Naviguer vers la bonne route selon le rôle
          if (roleActif === 'RESPONSABLE') {
            navigate(`/responsable/demandes/${row._id}`);
          } else if (roleActif === 'DGR') {
            navigate(`/dgr/demandes/${row._id}`);
          } else if (roleActif === 'CVR') {
            navigate(`/cvr/verifications/${row._id}`);
          } else if (roleActif === 'DNCF') {
            navigate(`/dncf/decisions/${row._id}`);
          } else {
            navigate(`/responsable/demandes/${row._id}`);
          }
        },
      },
    ];

    // Afficher les boutons selon le rôle actif et le statut de la demande
    if (roleActif === 'RESPONSABLE' && (row.statut === 'EN_VALIDATION_HIERARCHIQUE' || row.statut === 'EN_ETUDE_DGR')) {
      actionsList.push({
        icon: <CheckCircleIcon />,
        tooltip: 'Valider',
        color: 'success',
        onClick: () => {
          setSelectedDemande(row);
          setOpen(true);
        },
      });
    } else if (roleActif === 'DGR' && (row.statut === 'VALIDEE_HIERARCHIQUE' || row.statut === 'EN_ETUDE_DGR' || row.statut === 'EN_VERIFICATION_CVR')) {
      actionsList.push({
        icon: <CheckCircleIcon />,
        tooltip: 'Traiter',
        color: 'primary',
        onClick: () => {
          setSelectedDemande(row);
          setOpen(true);
        },
      });
    } else if (roleActif === 'CVR' && (row.statut === 'AVIS_DGR_FAVORABLE' || row.statut === 'EN_VERIFICATION_CVR' || row.statut === 'VALIDEE_CVR')) {
      actionsList.push({
        icon: <CheckCircleIcon />,
        tooltip: 'Vérifier',
        color: 'primary',
        onClick: () => {
          setSelectedDemande(row);
          setOpen(true);
        },
      });
    } else if (roleActif === 'DNCF' && (row.statut === 'VALIDEE_CVR' || row.statut === 'EN_ETUDE_DNCF' || row.statut === 'ACCEPTEE' || row.statut === 'REJETEE')) {
      actionsList.push({
        icon: <CheckCircleIcon />,
        tooltip: 'Décider',
        color: 'primary',
        onClick: () => {
          setSelectedDemande(row);
          setOpen(true);
        },
      });
    }

    return actionsList;
  };

  return (
    <Box>
      <PageHeader
        title={rolesDisponibles.length > 1 ? "Demandes à valider" : "Demandes à valider"}
        subtitle={rolesDisponibles.length > 1 
          ? "Examinez et validez les demandes selon votre rôle" 
          : "Examinez et validez les demandes de mutation de vos agents"}
      />
      
      {/* Système d'onglets si plusieurs rôles */}
      {rolesDisponibles.length > 1 && (
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
      )}
      {demandes.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          Aucune demande en attente de validation
        </Alert>
      ) : (
        <DataTable
          columns={columns}
          rows={demandes.map((d) => ({
            id: d._id,
            agent: d.agentId,
            matricule: d.agentId?.matricule,
            motif: d.motif,
            poste: d.posteSouhaiteId,
            statut: d.statut,
            date: d.createdAt,
            ...d,
          }))}
          actions={actions}
          emptyMessage="Aucune demande en attente"
        />
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {roleActif === 'RESPONSABLE' 
            ? 'Validation de la demande' 
            : roleActif === 'DGR' 
            ? 'Donner un avis sur la demande' 
            : roleActif === 'CVR'
            ? 'Vérification de la demande'
            : roleActif === 'DNCF'
            ? 'Décision finale sur la demande'
            : 'Validation de la demande'}
        </DialogTitle>
        <DialogContent>
          {selectedDemande && (
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Agent"
                value={
                  selectedDemande.agentId && typeof selectedDemande.agentId === 'object'
                    ? `${selectedDemande.agentId.nom || ''} ${selectedDemande.agentId.prenom || ''}`.trim()
                    : selectedDemande.informationsAgent
                    ? `${selectedDemande.informationsAgent.nom || ''} ${selectedDemande.informationsAgent.prenom || ''}`.trim()
                    : '-'
                }
                disabled
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Matricule"
                value={
                  selectedDemande.agentId && typeof selectedDemande.agentId === 'object'
                    ? selectedDemande.agentId.matricule || '-'
                    : selectedDemande.informationsAgent
                    ? selectedDemande.informationsAgent.matricule || '-'
                    : '-'
                }
                disabled
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Motif"
                value={selectedDemande.motif || ''}
                disabled
                sx={{ mb: 2 }}
              />
            </Box>
          )}
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Commentaire (obligatoire)"
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <ActionButton onClick={() => setOpen(false)} disabled={loading}>
            Annuler
          </ActionButton>
          <ActionButton
            onClick={() => handleValidation('VALIDE')}
            color="success"
            variant="contained"
            disabled={loading || !commentaire.trim()}
            startIcon={<CheckCircleIcon />}
          >
            {roleActif === 'RESPONSABLE' 
              ? 'Valider' 
              : roleActif === 'DGR' 
              ? 'Avis favorable' 
              : roleActif === 'CVR'
              ? 'Valider'
              : roleActif === 'DNCF'
              ? 'Accepter'
              : 'Valider'}
          </ActionButton>
          <ActionButton
            onClick={() => handleValidation('REJETE')}
            color="error"
            variant="contained"
            disabled={loading || !commentaire.trim()}
            startIcon={<CancelIcon />}
          >
            {roleActif === 'RESPONSABLE' 
              ? 'Rejeter' 
              : roleActif === 'DGR' 
              ? 'Avis défavorable' 
              : roleActif === 'CVR'
              ? 'Rejeter'
              : roleActif === 'DNCF'
              ? 'Rejeter'
              : 'Rejeter'}
          </ActionButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
