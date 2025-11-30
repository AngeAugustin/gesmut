import React, { useEffect, useState } from 'react';
import { Box, TextField, MenuItem, Button, Typography, Chip } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import FilterListIcon from '@mui/icons-material/FilterList';
import { validationsService } from '../../services/validationsService';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusChip from '../../components/common/StatusChip';
import ActionButton from '../../components/common/ActionButton';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export default function Historique() {
  const { user } = useAuth();
  const [validations, setValidations] = useState([]);
  const [filteredValidations, setFilteredValidations] = useState([]);
  const [filters, setFilters] = useState({
    dateDebut: '',
    dateFin: '',
    statut: '',
    type: '',
    agent: '',
  });

  useEffect(() => {
    const fetchValidations = async () => {
      try {
        const response = await validationsService.getAll();
        // Filtrer pour ne garder que les validations du DNCF connecté
        const mesValidations = response.data.filter(v => {
          // Comparer l'ID du validateur avec l'ID de l'utilisateur connecté
          const validateurId = v.validateurId?._id || v.validateurId;
          const userId = user?._id || user?.id;
          // Vérifier aussi que le rôle est DNCF
          const roleMatch = v.validateurRole && String(v.validateurRole).toUpperCase() === 'DNCF';
          return roleMatch && (validateurId === userId || String(validateurId) === String(userId));
        });
        setValidations(mesValidations);
        setFilteredValidations(mesValidations);
      } catch (error) {
        console.error('Erreur', error);
      }
    };
    if (user) {
      fetchValidations();
    }
  }, [user]);

  useEffect(() => {
    let filtered = [...validations];

    if (filters.dateDebut) {
      filtered = filtered.filter(
        (v) => new Date(v.dateValidation) >= new Date(filters.dateDebut)
      );
    }
    if (filters.dateFin) {
      filtered = filtered.filter(
        (v) => new Date(v.dateValidation) <= new Date(filters.dateFin)
      );
    }
    if (filters.statut) {
      filtered = filtered.filter((v) => v.decision === filters.statut);
    }
    if (filters.type) {
      filtered = filtered.filter((v) => {
        const demande = v.demandeId;
        if (!demande || typeof demande === 'string') return false;
        return demande.type === filters.type;
      });
    }
    if (filters.agent) {
      filtered = filtered.filter((v) => {
        const search = filters.agent.toLowerCase();
        // Gérer les deux cas : agentId (connecté) ou informationsAgent (public)
        if (v.demandeId?.agentId && typeof v.demandeId.agentId === 'object') {
          return (
            (v.demandeId.agentId.nom || '').toLowerCase().includes(search) ||
            (v.demandeId.agentId.prenom || '').toLowerCase().includes(search) ||
            (v.demandeId.agentId.matricule || '').toLowerCase().includes(search)
          );
        } else if (v.demandeId?.informationsAgent) {
          return (
            (v.demandeId.informationsAgent.nom || '').toLowerCase().includes(search) ||
            (v.demandeId.informationsAgent.prenom || '').toLowerCase().includes(search) ||
            (v.demandeId.informationsAgent.matricule || '').toLowerCase().includes(search)
          );
        }
        return false;
      });
    }

    setFilteredValidations(filtered);
  }, [filters, validations]);

  const handleExport = () => {
    const data = filteredValidations.map((v) => {
      // Gérer les deux cas : agentId (connecté) ou informationsAgent (public)
      let agentNom = '';
      let agentPrenom = '';
      let agentMatricule = '';
      
      if (v.demandeId?.agentId && typeof v.demandeId.agentId === 'object') {
        agentNom = v.demandeId.agentId.nom || '';
        agentPrenom = v.demandeId.agentId.prenom || '';
        agentMatricule = v.demandeId.agentId.matricule || '';
      } else if (v.demandeId?.informationsAgent) {
        agentNom = v.demandeId.informationsAgent.nom || '';
        agentPrenom = v.demandeId.informationsAgent.prenom || '';
        agentMatricule = v.demandeId.informationsAgent.matricule || '';
      }
      
      // Récupérer le type de demande
      const demandeType = v.demandeId?.type || '';
      const typeLabel = demandeType === 'SIMPLE' ? 'Simple' : demandeType === 'STRATEGIQUE' ? 'Stratégique' : demandeType || '-';
      
      return {
        Date: new Date(v.dateValidation).toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        Agent: `${agentNom} ${agentPrenom}`.trim(),
        Matricule: agentMatricule,
        Type: typeLabel,
        Motif: v.demandeId?.motif || '',
        Décision: v.decision,
        Commentaire: v.commentaire || '',
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Historique');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, `historique-decisions-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const columns = [
    {
      id: 'date',
      label: 'Date',
      render: (value) => new Date(value).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    },
    {
      id: 'agent',
      label: 'Agent',
      render: (value, row) => {
        // Gérer les cas où demandeId peut être un string (anciennes données) ou un objet (populé)
        const demande = row.demandeId;
        if (!demande) return '-';
        
        // Si demandeId est encore un string (anciennes données), on ne peut pas afficher les infos
        if (typeof demande === 'string') {
          return <Typography variant="body2">-</Typography>;
        }
        
        // Gérer les deux cas : agentId (connecté) ou informationsAgent (public)
        let agentNom = '';
        let agentPrenom = '';
        let agentMatricule = '';
        
        if (demande.agentId && typeof demande.agentId === 'object') {
          agentNom = demande.agentId.nom || '';
          agentPrenom = demande.agentId.prenom || '';
          agentMatricule = demande.agentId.matricule || '';
        } else if (demande.informationsAgent) {
          agentNom = demande.informationsAgent.nom || '';
          agentPrenom = demande.informationsAgent.prenom || '';
          agentMatricule = demande.informationsAgent.matricule || '';
        }
        
        const nomComplet = `${agentNom} ${agentPrenom}`.trim();
        
        return (
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {nomComplet || '-'}
            </Typography>
            {agentMatricule && (
              <Typography variant="caption" color="text.secondary">
                Matricule: {agentMatricule}
              </Typography>
            )}
          </Box>
        );
      },
    },
    {
      id: 'type',
      label: 'Type',
      render: (value, row) => {
        const demande = row.demandeId;
        if (!demande) return '-';
        // Si demandeId est encore un string (anciennes données), on ne peut pas afficher le type
        if (typeof demande === 'string') return '-';
        const type = demande.type || '-';
        // Afficher le type avec un style approprié
        return (
          <Chip
            label={type === 'SIMPLE' ? 'Simple' : type === 'STRATEGIQUE' ? 'Stratégique' : type}
            size="small"
            color={type === 'STRATEGIQUE' ? 'primary' : 'default'}
            variant={type === 'STRATEGIQUE' ? 'filled' : 'outlined'}
          />
        );
      },
    },
    {
      id: 'motif',
      label: 'Motif',
      render: (value, row) => {
        const demande = row.demandeId;
        if (!demande) return '-';
        // Si demandeId est encore un string (anciennes données), on ne peut pas afficher le motif
        if (typeof demande === 'string') return '-';
        return demande.motif || '-';
      },
    },
    {
      id: 'decision',
      label: 'Décision',
      render: (value) => <StatusChip status={value === 'VALIDE' ? 'ACCEPTEE' : 'REJETEE'} label={value} />,
    },
    {
      id: 'commentaire',
      label: 'Commentaire',
      render: (value) => value || '-',
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Historique des décisions"
        subtitle="Consultez toutes vos décisions finales"
        action={
          <ActionButton
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
          >
            Exporter
          </ActionButton>
        }
      />

      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          label="Date début"
          type="date"
          value={filters.dateDebut}
          onChange={(e) => setFilters({ ...filters, dateDebut: e.target.value })}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 180 }}
        />
        <TextField
          label="Date fin"
          type="date"
          value={filters.dateFin}
          onChange={(e) => setFilters({ ...filters, dateFin: e.target.value })}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 180 }}
        />
        <TextField
          select
          label="Statut"
          value={filters.statut}
          onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">Tous</MenuItem>
          <MenuItem value="VALIDE">Accepté</MenuItem>
          <MenuItem value="REJETE">Rejeté</MenuItem>
        </TextField>
        <TextField
          select
          label="Type"
          value={filters.type}
          onChange={(e) => setFilters({ ...filters, type: e.target.value })}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">Tous</MenuItem>
          <MenuItem value="SIMPLE">Simple</MenuItem>
          <MenuItem value="STRATEGIQUE">Stratégique</MenuItem>
        </TextField>
        <TextField
          label="Rechercher un agent"
          value={filters.agent}
          onChange={(e) => setFilters({ ...filters, agent: e.target.value })}
          sx={{ flex: 1, minWidth: 200 }}
        />
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={() => setFilters({ dateDebut: '', dateFin: '', statut: '', type: '', agent: '' })}
        >
          Réinitialiser
        </Button>
      </Box>

      <DataTable
        columns={columns}
        rows={filteredValidations.map((v) => ({
          id: v._id,
          date: v.dateValidation,
          demandeId: v.demandeId, // Passer l'objet demandeId complet
          decision: v.decision,
          commentaire: v.commentaire,
          ...v,
        }))}
        emptyMessage="Aucune décision dans l'historique"
      />
    </Box>
  );
}

