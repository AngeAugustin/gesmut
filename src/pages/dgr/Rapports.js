import React, { useEffect, useState } from 'react';
import { Box, Grid, Paper, Chip } from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { demandesService } from '../../services/demandesService';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import ActionButton from '../../components/common/ActionButton';
import StatusChip from '../../components/common/StatusChip';

export default function DGRRapports() {
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    parStatut: {},
    parType: {},
  });

  useEffect(() => {
    const fetchDemandes = async () => {
      try {
        const response = await demandesService.getAll();
        setDemandes(response.data);
        calculateStats(response.data);
      } catch (error) {
        console.error('Erreur', error);
      }
    };
    fetchDemandes();
  }, []);

  const calculateStats = (data) => {
    const parStatut = {};
    const parType = {};
    data.forEach((d) => {
      parStatut[d.statut] = (parStatut[d.statut] || 0) + 1;
      parType[d.type] = (parType[d.type] || 0) + 1;
    });
    setStats({
      total: data.length,
      parStatut,
      parType,
    });
  };

  const exportToExcel = () => {
    setLoading(true);
    const data = demandes.map((d) => {
      // Gérer les deux cas : agentId (connecté) ou informationsAgent (public)
      const agentInfo = d.agentId || d.informationsAgent;
      const agentNom = `${agentInfo?.nom || ''} ${agentInfo?.prenom || ''}`.trim();
      const agentMatricule = agentInfo?.matricule || '';
      
      const poste = d.posteSouhaiteId;
      const posteLibelle = typeof poste === 'object' && poste !== null
        ? poste.intitule
        : '-';
      
      return {
        Date: new Date(d.createdAt).toLocaleDateString('fr-FR'),
        Agent: agentNom || '-',
        Matricule: agentMatricule || '-',
        Motif: d.motif || '',
        'Poste souhaité': posteLibelle,
        Statut: d.statut,
        Type: d.type,
      };
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Demandes');
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, `rapport-demandes-${new Date().toISOString().split('T')[0]}.xlsx`);
    setLoading(false);
  };

  const columns = [
    {
      id: 'date',
      label: 'Date',
      render: (value) => new Date(value).toLocaleDateString('fr-FR'),
    },
    {
      id: 'agent',
      label: 'Agent',
      render: (value, row) => {
        // Gérer les deux cas : agentId (connecté) ou informationsAgent (public)
        const agentInfo = row.agentId || row.informationsAgent;
        const agentNom = `${agentInfo?.nom || ''} ${agentInfo?.prenom || ''}`.trim();
        return agentNom || '-';
      },
    },
    {
      id: 'matricule',
      label: 'Matricule',
      render: (value, row) => {
        // Gérer les deux cas : agentId (connecté) ou informationsAgent (public)
        const agentInfo = row.agentId || row.informationsAgent;
        return agentInfo?.matricule || '-';
      },
    },
    {
      id: 'motif',
      label: 'Motif',
    },
    {
      id: 'poste',
      label: 'Poste souhaité',
      render: (value, row) => {
        const poste = row.posteSouhaiteId;
        return typeof poste === 'object' && poste !== null
          ? poste.intitule || '-'
          : '-';
      },
    },
    {
      id: 'statut',
      label: 'Statut',
      render: (value) => <StatusChip status={value} />,
    },
    {
      id: 'type',
      label: 'Type',
      render: (value) => (
        <Chip
          label={value}
          size="small"
          color={value === 'STRATEGIQUE' ? 'primary' : 'default'}
        />
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Rapports et statistiques"
        subtitle="Analysez les données des demandes de mutation"
        action={
          <ActionButton
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={exportToExcel}
            disabled={loading}
          >
            {loading ? 'Export...' : 'Exporter en Excel'}
          </ActionButton>
        }
      />

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Box>
                <Box sx={{ fontSize: '2rem', fontWeight: 600, color: 'primary.main' }}>
                  {stats.total}
                </Box>
                <Box sx={{ color: 'text.secondary' }}>Total demandes</Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ mb: 2, fontWeight: 600 }}>Répartition par type</Box>
            {Object.entries(stats.parType).map(([type, count]) => (
              <Box
                key={type}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 1,
                  pb: 1,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Chip
                  label={type}
                  size="small"
                  color={type === 'STRATEGIQUE' ? 'primary' : 'default'}
                />
                <Box sx={{ fontWeight: 600 }}>{count}</Box>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>

      <Paper sx={{ mt: 3, p: 2 }}>
        <DataTable
          columns={columns}
          rows={demandes.map((d) => {
            // Gérer les deux cas : agentId (connecté) ou informationsAgent (public)
            const agentInfo = d.agentId || d.informationsAgent;
            const poste = d.posteSouhaiteId;
            
            return {
              id: d._id,
              date: d.createdAt,
              agent: agentInfo, // Passer l'objet complet
              informationsAgent: d.informationsAgent, // Passer aussi informationsAgent
              matricule: agentInfo?.matricule,
              motif: d.motif,
              poste: poste,
              statut: d.statut,
              type: d.type,
              ...d,
            };
          })}
          emptyMessage="Aucune demande disponible"
        />
      </Paper>
    </Box>
  );
}
