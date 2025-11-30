import React, { useEffect, useState } from 'react';
import { Box, Grid } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person';
import StatCard from '../../components/common/StatCard';
import PageHeader from '../../components/common/PageHeader';
import api from '../../services/api';
import PieChart from '../../components/charts/PieChart';
import BarChart from '../../components/charts/BarChart';
import GaugeChart from '../../components/charts/GaugeChart';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAgents: 0,
    totalDemandes: 0,
    totalPostes: 0,
  });
  const [chartData, setChartData] = useState({
    usersByRole: [],
    demandesByStatus: [],
    demandesByMonth: [],
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, agentsRes, demandesRes, postesRes] = await Promise.all([
          api.get('/users'),
          api.get('/agents'),
          api.get('/demandes'),
          api.get('/postes'),
        ]);
        
        const users = usersRes.data;
        const demandes = demandesRes.data;
        
        setStats({
          totalUsers: users.length,
          totalAgents: agentsRes.data.length,
          totalDemandes: demandes.length,
          totalPostes: postesRes.data.length,
        });

        // Graphique - Utilisateurs par rôle
        const usersByRole = users.reduce((acc, user) => {
          const role = user.role || 'AUTRE';
          const existing = acc.find(item => item.name === role);
          if (existing) {
            existing.value++;
          } else {
            acc.push({ name: role, value: 1 });
          }
          return acc;
        }, []);

        // Graphique - Demandes par statut
        const demandesByStatus = demandes.reduce((acc, demande) => {
          const statut = demande.statut || 'AUTRE';
          const existing = acc.find(item => item.name === statut);
          if (existing) {
            existing.value++;
          } else {
            acc.push({ name: statut, value: 1 });
          }
          return acc;
        }, []).slice(0, 8); // Top 8 statuts

        // Graphique - Évolution mensuelle des demandes
        const demandesByMonth = demandes.reduce((acc, demande) => {
          const month = new Date(demande.createdAt || demande.dateSoumission).toLocaleDateString('fr-FR', { month: 'short' });
          const existing = acc.find(item => item.mois === month);
          if (existing) {
            existing.nombre++;
          } else {
            acc.push({ mois: month, nombre: 1 });
          }
          return acc;
        }, []).slice(-6);

        setChartData({ usersByRole, demandesByStatus, demandesByMonth });
      } catch (error) {
        console.error('Erreur', error);
      }
    };
    fetchStats();
  }, []);

  const tauxActivation = stats.totalUsers > 0 ? ((stats.totalAgents / stats.totalUsers) * 100).toFixed(0) : 0;

  return (
    <Box>
      <PageHeader
        title="Tableau de bord"
        subtitle="Administrateur - Vue d'ensemble du système"
      />
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Utilisateurs"
            value={stats.totalUsers}
            icon={PeopleIcon}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Agents"
            value={stats.totalAgents}
            icon={PersonIcon}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Demandes"
            value={stats.totalDemandes}
            icon={AssignmentIcon}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Postes"
            value={stats.totalPostes}
            icon={WorkIcon}
            color="success"
          />
        </Grid>
        
        {/* Graphiques */}
        <Grid item xs={12} md={4}>
          <PieChart 
            title="Utilisateurs par rôle"
            data={chartData.usersByRole}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <GaugeChart
            title="Taux d'activation agents"
            value={parseInt(tauxActivation)}
            max={100}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <BarChart
            title="Évolution mensuelle des demandes"
            data={chartData.demandesByMonth}
            dataKey="nombre"
            nameKey="mois"
          />
        </Grid>
        <Grid item xs={12}>
          <BarChart
            title="Top 8 statuts des demandes"
            data={chartData.demandesByStatus}
            dataKey="value"
            nameKey="name"
          />
        </Grid>
      </Grid>
    </Box>
  );
}
