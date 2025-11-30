import React, { useEffect, useState } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
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

  useEffect(() => {
    const fetchDemandes = async () => {
      if (!user) return; // Attendre que l'utilisateur soit chargé
      
      try {
        // Utiliser l'endpoint backend qui filtre automatiquement par service
        const [demandesRes, validationsRes] = await Promise.all([
          demandesService.getDemandesPourResponsable(),
          validationsService.getAll(),
        ]);
        
        const demandesDeMonService = demandesRes.data || [];
        console.log('Demandes de mon service:', demandesDeMonService);
        
        // Filtrer les demandes qui sont en attente de validation hiérarchique
        const demandesFiltrees = demandesDeMonService.filter(
          (d) =>
            d.statut === 'EN_VALIDATION_HIERARCHIQUE' ||
            d.statut === 'EN_ETUDE_DGR' // Même si rejetée, la demande continue
        );
        
        // Filtrer les validations du responsable connecté avec le rôle RESPONSABLE
        const validationsResponsable = validationsRes.data.filter(v => {
          const validateurId = v.validateurId?._id || v.validateurId;
          const userId = user?._id || user?.id;
          const roleMatch = v.validateurRole && String(v.validateurRole).toUpperCase() === 'RESPONSABLE';
          return roleMatch && (validateurId === userId || String(validateurId) === String(userId));
        });
        
        // Créer un Set des IDs des demandes déjà validées par ce responsable
        const demandesValideesIds = new Set(
          validationsResponsable.map(v => String(v.demandeId?._id || v.demandeId))
        );
        
        // Filtrer pour ne garder que les demandes non encore validées par ce responsable
        const demandesNonValidees = demandesFiltrees.filter(
          (d) => !demandesValideesIds.has(String(d._id))
        );
        
        console.log('Demandes non validées:', demandesNonValidees);
        setDemandes(demandesNonValidees);
      } catch (error) {
        console.error('Erreur lors de la récupération des demandes:', error);
        console.error('Détails:', error.response?.data || error.message);
      }
    };
    fetchDemandes();
    const interval = setInterval(fetchDemandes, 30000);
    return () => clearInterval(interval);
  }, [user]);

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
        validateurRole: 'RESPONSABLE', // Spécifier le rôle du validateur
      });
      setOpen(false);
      setCommentaire('');
      setSelectedDemande(null);
      
      // Recharger les demandes avec le même filtre
      const [demandesRes, validationsRes] = await Promise.all([
        demandesService.getDemandesPourResponsable(),
        validationsService.getAll(),
      ]);
      
      const demandesDeMonService = demandesRes.data || [];
      const demandesFiltrees = demandesDeMonService.filter(
        (d) =>
          d.statut === 'EN_VALIDATION_HIERARCHIQUE' ||
          d.statut === 'EN_ETUDE_DGR'
      );
      
      const validationsResponsable = validationsRes.data.filter(v => {
        const validateurId = v.validateurId?._id || v.validateurId;
        const userId = user?._id || user?.id;
        const roleMatch = v.validateurRole && String(v.validateurRole).toUpperCase() === 'RESPONSABLE';
        return roleMatch && (validateurId === userId || String(validateurId) === String(userId));
      });
      
      const demandesValideesIds = new Set(
        validationsResponsable.map(v => String(v.demandeId?._id || v.demandeId))
      );
      
      const demandesNonValidees = demandesFiltrees.filter(
        (d) => !demandesValideesIds.has(String(d._id))
      );
      
      setDemandes(demandesNonValidees);
      success(decision === 'VALIDE' ? 'Demande validée avec succès' : 'Demande rejetée');
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
      label: 'Poste souhaité',
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
        onClick: () => navigate(`/responsable/demandes/${row._id}`),
      },
    ];

    if (row.statut === 'EN_VALIDATION_HIERARCHIQUE') {
      actionsList.push({
        icon: <CheckCircleIcon />,
        tooltip: 'Valider',
        color: 'success',
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
        title="Demandes à valider"
        subtitle="Examinez et validez les demandes de mutation de vos agents"
      />
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
        <DialogTitle>Validation de la demande</DialogTitle>
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
            Valider
          </ActionButton>
          <ActionButton
            onClick={() => handleValidation('REJETE')}
            color="error"
            variant="contained"
            disabled={loading || !commentaire.trim()}
            startIcon={<CancelIcon />}
          >
            Rejeter
          </ActionButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
