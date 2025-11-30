import React, { useEffect, useState } from 'react';
import { Box, Grid } from '@mui/material';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AssignmentIcon from '@mui/icons-material/Assignment';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';
import { demandesService } from '../../services/demandesService';
import { useAuth } from '../../context/AuthContext';
import PieChart from '../../components/charts/PieChart';
import BarChart from '../../components/charts/BarChart';
import GaugeChart from '../../components/charts/GaugeChart';

export default function ResponsableDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    enAttente: 0,
    validees: 0,
    rejetees: 0,
    total: 0,
  });
  const [chartData, setChartData] = useState({
    pieData: [],
    barData: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      try {
        // Utiliser l'endpoint backend qui filtre automatiquement par service
        const response = await demandesService.getDemandesPourResponsable();
        const demandesDeMonService = response.data || [];
        
        const enAttente = demandesDeMonService.filter(d => d.statut === 'EN_VALIDATION_HIERARCHIQUE').length;
        const validees = demandesDeMonService.filter(d => d.statut === 'VALIDEE_HIERARCHIQUE').length;
        const rejetees = demandesDeMonService.filter(d => d.statut === 'REJETEE_HIERARCHIQUE').length;
        const total = demandesDeMonService.length;
        
        setStats({ enAttente, validees, rejetees, total });

        // Données pour le graphique circulaire
        const pieData = [
          { name: 'En attente', value: enAttente },
          { name: 'Validées', value: validees },
          { name: 'Rejetées', value: rejetees },
        ].filter(item => item.value > 0);

        // Données pour le graphique en barres (par mois)
        const barData = demandesDeMonService.reduce((acc, demande) => {
          const month = new Date(demande.createdAt || demande.dateSoumission).toLocaleDateString('fr-FR', { month: 'short' });
          const existing = acc.find(item => item.mois === month);
          if (existing) {
            existing.nombre++;
          } else {
            acc.push({ mois: month, nombre: 1 });
          }
          return acc;
        }, []).slice(-6); // Derniers 6 mois

        setChartData({ pieData, barData });
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques', error);
        console.error('Détails:', error.response?.data || error.message);
      }
    };
    fetchStats();
  }, [user]);

  const tauxTraitement = stats.total > 0 ? ((stats.validees + stats.rejetees) / stats.total * 100).toFixed(0) : 0;

  return (
    <Box>
      <PageHeader
        title="Tableau de bord"
        subtitle="Responsable Hiérarchique - Vue d'ensemble des validations"
      />
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="En attente"
            value={stats.enAttente}
            icon={PendingActionsIcon}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Validées"
            value={stats.validees}
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
            title="Répartition des statuts"
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
            title="Demandes par mois"
            data={chartData.barData}
            dataKey="nombre"
            nameKey="mois"
          />
        </Grid>
      </Grid>
    </Box>
  );
}
