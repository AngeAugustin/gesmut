import React, { useEffect, useState } from 'react';
import { Box, Grid } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import PendingIcon from '@mui/icons-material/Pending';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';
import { demandesService } from '../../services/demandesService';
import PieChart from '../../components/charts/PieChart';
import BarChart from '../../components/charts/BarChart';
import GaugeChart from '../../components/charts/GaugeChart';

export default function AgentDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    enCours: 0,
    acceptees: 0,
    rejetees: 0,
  });
  const [chartData, setChartData] = useState({
    pieData: [],
    barData: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await demandesService.getMesDemandes();
        const demandes = response.data;
        const total = demandes.length;
        const enCours = demandes.filter(d => d.statut !== 'ACCEPTEE' && d.statut !== 'REJETEE').length;
        const acceptees = demandes.filter(d => d.statut === 'ACCEPTEE').length;
        const rejetees = demandes.filter(d => d.statut === 'REJETEE').length;
        
        setStats({ total, enCours, acceptees, rejetees });

        // Graphique circulaire
        const pieData = [
          { name: 'En cours', value: enCours },
          { name: 'Acceptées', value: acceptees },
          { name: 'Rejetées', value: rejetees },
        ].filter(item => item.value > 0);

        // Graphique en barres - Évolution
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

        setChartData({ pieData, barData });
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques', error);
      }
    };
    fetchStats();
  }, []);

  const tauxReussite = stats.total > 0 ? ((stats.acceptees / stats.total) * 100).toFixed(0) : 0;

  return (
    <Box>
      <PageHeader
        title="Tableau de bord"
        subtitle="Vue d'ensemble de vos demandes de mutation"
      />
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total des demandes"
            value={stats.total}
            icon={AssignmentIcon}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="En cours"
            value={stats.enCours}
            icon={PendingIcon}
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
        
        {/* Graphiques */}
        <Grid item xs={12} md={4}>
          <PieChart 
            title="Répartition de vos demandes"
            data={chartData.pieData}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <GaugeChart
            title="Taux de réussite"
            value={parseInt(tauxReussite)}
            max={100}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <BarChart
            title="Évolution de vos demandes"
            data={chartData.barData}
            dataKey="nombre"
            nameKey="mois"
          />
        </Grid>
      </Grid>
    </Box>
  );
}
