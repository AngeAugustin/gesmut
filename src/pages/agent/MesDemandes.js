import React, { useEffect, useState } from 'react';
import { Box, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import { demandesService } from '../../services/demandesService';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusChip from '../../components/common/StatusChip';
import ActionButton from '../../components/common/ActionButton';
import VisibilityIcon from '@mui/icons-material/Visibility';

export default function MesDemandes() {
  const [demandes, setDemandes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDemandes = async () => {
      try {
        const response = await demandesService.getMesDemandes();
        setDemandes(response.data);
      } catch (error) {
        console.error('Erreur lors de la récupération des demandes', error);
      }
    };
    fetchDemandes();
  }, []);

  const columns = [
    {
      id: 'date',
      label: 'Date',
      render: (value) => new Date(value).toLocaleDateString('fr-FR'),
    },
    {
      id: 'motif',
      label: 'Motif',
    },
    {
      id: 'posteSouhaiteId',
      label: 'Poste souhaité',
      render: (value) => {
        if (!value) return '-';
        return typeof value === 'object' && value !== null ? value.intitule || '-' : '-';
      },
    },
    {
      id: 'localisationSouhaiteId',
      label: 'Localisation souhaitée',
      render: (value) => {
        if (!value) return '-';
        return typeof value === 'object' && value !== null ? value.libelle || '-' : '-';
      },
    },
    {
      id: 'statut',
      label: 'Statut',
      render: (value) => <StatusChip status={value} />,
    },
  ];

  const actions = (row) => [
    {
      icon: <VisibilityIcon />,
      tooltip: 'Voir les détails',
      onClick: () => navigate(`/agent/demandes/${row._id}`),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Mes demandes"
        subtitle="Gérez et suivez toutes vos demandes de mutation"
        action={
          <ActionButton
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/agent/demandes/nouvelle')}
          >
            Nouvelle demande
          </ActionButton>
        }
      />
      <DataTable
        columns={columns}
        rows={demandes.map((d) => ({
          id: d._id,
          date: d.createdAt,
          motif: d.motif || '-',
          posteSouhaiteId: d.posteSouhaiteId,
          localisationSouhaiteId: d.localisationSouhaiteId,
          statut: d.statut,
        }))}
        actions={actions}
        onRowClick={(row) => navigate(`/agent/demandes/${row.id}`)}
        emptyMessage="Aucune demande pour le moment"
      />
    </Box>
  );
}
