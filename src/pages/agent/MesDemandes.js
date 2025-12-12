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
      label: 'Nouveau poste',
      render: (value) => {
        if (!value) return '-';
        return typeof value === 'object' && value !== null ? value.intitule || '-' : '-';
      },
    },
    {
      id: 'localisationsSouhaitees',
      label: 'Localisation(s) souhaitée(s)',
      render: (value, row) => {
        // Gérer les localisations multiples (nouveau) ou unique (ancien pour compatibilité)
        const localisations = row.localisationsSouhaitees || (row.localisationSouhaiteId ? [row.localisationSouhaiteId] : []);
        if (!localisations || localisations.length === 0) return '-';
        const libelles = Array.isArray(localisations)
          ? localisations
              .map((loc) => {
                if (typeof loc === 'object' && loc !== null) {
                  return loc.libelle || '-';
                }
                return '-';
              })
              .filter((lib) => lib !== '-')
          : [];
        return libelles.length > 0 ? libelles.join(', ') : '-';
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
          localisationsSouhaitees: d.localisationsSouhaitees,
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
