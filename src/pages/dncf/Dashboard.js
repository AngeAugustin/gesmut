import React, { useEffect, useState } from 'react';
import { Box, Grid } from '@mui/material';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AssignmentIcon from '@mui/icons-material/Assignment';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';
import { demandesService } from '../../services/demandesService';
import PieChart from '../../components/charts/PieChart';
import BarChart from '../../components/charts/BarChart';
import GaugeChart from '../../components/charts/GaugeChart';

export default function DNCFDashboard() {
  const [stats, setStats] = useState({
    enEtude: 0,
    acceptees: 0,
    rejetees: 0,
    total: 0,
  });
  const [chartData, setChartData] = useState({
    pieData: [],
    barData: [],
    typeData: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await demandesService.getAll();
        const demandes = response.data;
        const enEtude = demandes.filter(
            (d) => d.statut === 'VALIDEE_CVR' || d.statut === 'EN_ETUDE_DNCF'
        ).length;
        const acceptees = demandes.filter((d) => d.statut === 'ACCEPTEE').length;
        const rejetees = demandes.filter((d) => d.statut === 'REJETEE').length;
        const total = demandes.length;
        
        setStats({ enEtude, acceptees, rejetees, total });

        // Graphique circulaire
        const pieData = [
          { name: 'En étude', value: enEtude },
          { name: 'Acceptées', value: acceptees },
          { name: 'Rejetées', value: rejetees },
        ].filter(item => item.value > 0);

        // Graphique en barres - Évolution mensuelle
        const barData = demandes.reduce((acc, demande) => {
          const month = new Date(demande.createdAt || demande.dateSoumission).toLocaleDateString('fr-FR', { month: 'short' });
          const existing = acc.find(item => item.mois === month);
          if (existing) {
            existing.nombre++;
          } else {
            acc.push({ mois: month, nombre: 1 });
          }
          return acc;
        }, []).slice(-6);

        // Graphique en barres - Par type de mutation
        const typeData = demandes.reduce((acc, demande) => {
          const type = demande.type === 'STRATEGIQUE' ? 'Stratégique' : 'Simple';
          const existing = acc.find(item => item.type === type);
          if (existing) {
            existing.nombre++;
          } else {
            acc.push({ type, nombre: 1 });
          }
          return acc;
        }, []);

        setChartData({ pieData, barData, typeData });
      } catch (error) {
        console.error('Erreur', error);
      }
    };
    fetchStats();
  }, []);

  const tauxDecision = (stats.enEtude + stats.acceptees + stats.rejetees) > 0
    ? (((stats.acceptees + stats.rejetees) / (stats.enEtude + stats.acceptees + stats.rejetees)) * 100).toFixed(0)
    : 0;

  return (
    <Box>
      <PageHeader
        title="Tableau de bord"
        subtitle="DNCF - Décisions finales et mutations stratégiques"
      />
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="En étude"
            value={stats.enEtude}
            icon={PendingActionsIcon}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Acceptées"
            value={stats.acceptees}
            icon={CheckCircleIcon}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Rejetées"
            value={stats.rejetees}
            icon={CancelIcon}
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total"
            value={stats.total}
            icon={AssignmentIcon}
            color="primary"
          />
        </Grid>
        
        {/* Graphiques */}
        <Grid item xs={12} md={4}>
          <PieChart 
            title="Répartition des décisions"
            data={chartData.pieData}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <GaugeChart
            title="Taux de décision"
            value={parseInt(tauxDecision)}
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
        <Grid item xs={12} md={6}>
          <BarChart
            title="Répartition par type de mutation"
            data={chartData.typeData}
            dataKey="nombre"
            nameKey="type"
          />
        </Grid>
      </Grid>
    </Box>
  );
}
