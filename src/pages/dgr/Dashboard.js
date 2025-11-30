import React, { useEffect, useState } from 'react';
import { Box, Grid } from '@mui/material';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PeopleIcon from '@mui/icons-material/People';
import WorkIcon from '@mui/icons-material/Work';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';
import { demandesService } from '../../services/demandesService';
import { agentsService } from '../../services/agentsService';
import { postesService } from '../../services/postesService';
import PieChart from '../../components/charts/PieChart';
import BarChart from '../../components/charts/BarChart';
import GaugeChart from '../../components/charts/GaugeChart';

export default function DGRDashboard() {
  const [stats, setStats] = useState({
    demandesEnAttente: 0,
    demandesValidees: 0,
    totalAgents: 0,
    postesLibres: 0,
  });
  const [chartData, setChartData] = useState({
    pieData: [],
    barData: [],
    serviceData: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [demandesRes, agentsRes, postesRes] = await Promise.all([
          demandesService.getAll(),
          agentsService.getAll(),
          postesService.getLibres(),
        ]);
        
        const demandes = demandesRes.data;
        const enAttente = demandes.filter(d => 
            d.statut === 'VALIDEE_HIERARCHIQUE' || d.statut === 'EN_ETUDE_DGR'
        ).length;
        const validees = demandes.filter(d => 
            d.statut === 'AVIS_DGR_FAVORABLE' || d.statut === 'AVIS_DGR_DEFAVORABLE'
        ).length;
        
        setStats({
          demandesEnAttente: enAttente,
          demandesValidees: validees,
          totalAgents: agentsRes.data.length,
          postesLibres: postesRes.data.length,
        });

        // Graphique circulaire - Répartition des statuts
        const pieData = [
          { name: 'En attente', value: enAttente },
          { name: 'Traitées', value: validees },
        ].filter(item => item.value > 0);

        // Graphique en barres - Demandes par service
        const serviceData = demandes.reduce((acc, demande) => {
          const serviceName = demande.agentId?.serviceId?.libelle || demande.informationsAgent?.serviceId || 'Non défini';
          const existing = acc.find(item => item.service === serviceName);
          if (existing) {
            existing.nombre++;
          } else {
            acc.push({ service: serviceName, nombre: 1 });
          }
          return acc;
        }, []).slice(0, 10).sort((a, b) => b.nombre - a.nombre);

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

        setChartData({ pieData, barData, serviceData });
      } catch (error) {
        console.error('Erreur lors de la récupération des statistiques', error);
      }
    };
    fetchStats();
  }, []);

  const tauxTraitement = (stats.demandesEnAttente + stats.demandesValidees) > 0 
    ? ((stats.demandesValidees / (stats.demandesEnAttente + stats.demandesValidees)) * 100).toFixed(0)
    : 0;

  return (
    <Box>
      <PageHeader
        title="Tableau de bord"
        subtitle="DGR - Vue d'ensemble des demandes et ressources"
      />
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Demandes en attente"
            value={stats.demandesEnAttente}
            icon={PendingActionsIcon}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Demandes traitées"
            value={stats.demandesValidees}
            icon={CheckCircleIcon}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total agents"
            value={stats.totalAgents}
            icon={PeopleIcon}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Postes libres"
            value={stats.postesLibres}
            icon={WorkIcon}
            color="info"
          />
        </Grid>
        
        {/* Graphiques */}
        <Grid item xs={12} md={4}>
          <PieChart 
            title="Répartition des demandes"
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
        <Grid item xs={12}>
          <BarChart
            title="Top 10 des services par nombre de demandes"
            data={chartData.serviceData}
            dataKey="nombre"
            nameKey="service"
          />
        </Grid>
      </Grid>
    </Box>
  );
}
