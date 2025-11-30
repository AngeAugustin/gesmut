import React, { useEffect, useState } from 'react';
import { Box, Grid } from '@mui/material';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';
import { demandesService } from '../../services/demandesService';
import PieChart from '../../components/charts/PieChart';
import BarChart from '../../components/charts/BarChart';
import GaugeChart from '../../components/charts/GaugeChart';

export default function CVRDashboard() {
  const [stats, setStats] = useState({
    enAttente: 0,
    validees: 0,
    rejetees: 0,
  });
  const [chartData, setChartData] = useState({
    pieData: [],
    barData: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await demandesService.getAll();
        const demandes = response.data;
        const enAttente = demandes.filter(
            (d) =>
              d.statut === 'AVIS_DGR_FAVORABLE' ||
              d.statut === 'EN_VERIFICATION_CVR'
        ).length;
        const validees = demandes.filter((d) => d.statut === 'VALIDEE_CVR').length;
        const rejetees = demandes.filter((d) => d.statut === 'REJETEE_CVR').length;
        
        setStats({ enAttente, validees, rejetees });

        // Graphique circulaire
        const pieData = [
          { name: 'En attente', value: enAttente },
          { name: 'Validées', value: validees },
          { name: 'Rejetées', value: rejetees },
        ].filter(item => item.value > 0);

        // Graphique en barres - Évolution mensuelle
        const barData = demandes
          .filter(d => d.statut === 'VALIDEE_CVR' || d.statut === 'REJETEE_CVR' || d.statut === 'EN_VERIFICATION_CVR')
          .reduce((acc, demande) => {
            const month = new Date(demande.createdAt || demande.dateSoumission).toLocaleDateString('fr-FR', { month: 'short' });
            const existing = acc.find(item => item.mois === month);
            if (existing) {
              existing.nombre++;
            } else {
              acc.push({ mois: month, nombre: 1 });
            }
            return acc;
          }, []).slice(-6);

        setChartData({ pieData, barData });
      } catch (error) {
        console.error('Erreur', error);
      }
    };
    fetchStats();
  }, []);

  const tauxTraitement = (stats.enAttente + stats.validees + stats.rejetees) > 0
    ? (((stats.validees + stats.rejetees) / (stats.enAttente + stats.validees + stats.rejetees)) * 100).toFixed(0)
    : 0;

  return (
    <Box>
      <PageHeader
        title="Tableau de bord"
        subtitle="CVR - Vérifications administratives"
      />
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="En attente de vérification"
            value={stats.enAttente}
            icon={PendingActionsIcon}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Validées"
            value={stats.validees}
            icon={CheckCircleIcon}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <StatCard
            title="Rejetées"
            value={stats.rejetees}
            icon={CancelIcon}
            color="error"
          />
        </Grid>
        
        {/* Graphiques */}
        <Grid item xs={12} md={4}>
          <PieChart 
            title="Répartition des vérifications"
            data={chartData.pieData}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <GaugeChart
            title="Taux de traitement"
            value={parseInt(tauxTraitement)}
            max={100}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <BarChart
            title="Évolution mensuelle"
            data={chartData.barData}
            dataKey="nombre"
            nameKey="mois"
          />
        </Grid>
      </Grid>
    </Box>
  );
}
