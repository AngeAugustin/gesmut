import React, { useEffect, useState, useRef } from 'react';
import { Box, TextField, MenuItem, Chip, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FilterListIcon from '@mui/icons-material/FilterList';
import api from '../../services/api';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import ActionButton from '../../components/common/ActionButton';
import VisibilityIcon from '@mui/icons-material/Visibility';

export default function AdminAudit() {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    dateDebut: '',
    dateFin: '',
    action: '',
    utilisateur: '',
    module: '',
  });
  const [appliedFilters, setAppliedFilters] = useState({
    dateDebut: '',
    dateFin: '',
    action: '',
    utilisateur: '',
    module: '',
  });
  const appliedFiltersRef = useRef(appliedFilters);
  const utilisateurTimeoutRef = useRef(null);
  const otherFiltersRef = useRef({ dateDebut: '', dateFin: '', action: '', module: '' });

  // Mettre à jour la ref quand appliedFilters change
  useEffect(() => {
    appliedFiltersRef.current = appliedFilters;
  }, [appliedFilters]);

  // Fonction pour charger les logs avec les filtres appliqués
  const fetchLogs = async (filtersToApply = null, limit = 200) => {
    const filtersToUse = filtersToApply || appliedFiltersRef.current;
    setLoading(true);
      try {
        const params = new URLSearchParams();
      // Limiter le nombre de résultats pour éviter de surcharger le navigateur
      params.append('limit', limit.toString());
      if (filtersToUse.dateDebut) params.append('dateFrom', filtersToUse.dateDebut);
      if (filtersToUse.dateFin) params.append('dateTo', filtersToUse.dateFin);
      if (filtersToUse.action) params.append('action', filtersToUse.action);
      if (filtersToUse.module) params.append('module', filtersToUse.module);
      if (filtersToUse.utilisateur) {
          // Vérifier si c'est une IP ou un email/nom
        const isIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(filtersToUse.utilisateur);
          if (isIp) {
          params.append('ip', filtersToUse.utilisateur);
          } else {
          params.append('userEmail', filtersToUse.utilisateur);
          }
        }
        
        const response = await api.get(`/audit?${params.toString()}`);
      setLogs(response.data || []);
      setFilteredLogs(response.data || []);
      } catch (error) {
      console.error('Erreur lors du chargement des logs', error);
      setLogs([]);
      setFilteredLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // Charger les logs au montage du composant (sans rafraîchissement automatique pour éviter les problèmes de performance)
  useEffect(() => {
    fetchLogs(null, 200); // Limiter à 200 logs initialement
    // Désactiver le rafraîchissement automatique pour éviter les problèmes de performance
    // L'utilisateur peut recharger manuellement si nécessaire
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Ne s'exécute qu'une fois au montage

  // Debounce pour le champ utilisateur (recherche texte) - utiliser useRef pour éviter les dépendances
  useEffect(() => {
    // Nettoyer le timeout précédent
    if (utilisateurTimeoutRef.current) {
      clearTimeout(utilisateurTimeoutRef.current);
    }
    
    // Si la valeur n'a pas changé, ne rien faire
    if (filters.utilisateur === appliedFiltersRef.current.utilisateur) {
      return;
    }
    
    // Créer un nouveau timeout
    utilisateurTimeoutRef.current = setTimeout(() => {
      const newFilters = { ...appliedFiltersRef.current, utilisateur: filters.utilisateur };
      setAppliedFilters(newFilters);
      fetchLogs(newFilters, 200);
    }, 500); // Attendre 500ms après la dernière frappe
    
    return () => {
      if (utilisateurTimeoutRef.current) {
        clearTimeout(utilisateurTimeoutRef.current);
      }
    };
  }, [filters.utilisateur]); // Ne dépend que de filters.utilisateur

  // Appliquer immédiatement les autres filtres (select/date) - utiliser useRef pour éviter les dépendances
  useEffect(() => {
    // Vérifier si quelque chose a changé
    const hasChanged = 
      filters.dateDebut !== otherFiltersRef.current.dateDebut ||
      filters.dateFin !== otherFiltersRef.current.dateFin ||
      filters.action !== otherFiltersRef.current.action ||
      filters.module !== otherFiltersRef.current.module;
    
    if (!hasChanged) {
      return; // Pas de changement, ne rien faire
    }
    
    // Mettre à jour la ref
    otherFiltersRef.current = {
      dateDebut: filters.dateDebut,
      dateFin: filters.dateFin,
      action: filters.action,
      module: filters.module,
    };
    
    // Appliquer les filtres
    const newFilters = {
      ...appliedFiltersRef.current,
      dateDebut: filters.dateDebut,
      dateFin: filters.dateFin,
      action: filters.action,
      module: filters.module,
    };
    setAppliedFilters(newFilters);
    fetchLogs(newFilters, 200);
  }, [filters.dateDebut, filters.dateFin, filters.action, filters.module]);

  const getActionColor = (action) => {
    if (action.includes('CREATE') || action.includes('CREATION')) return 'success';
    if (action.includes('UPDATE') || action.includes('MODIFICATION')) return 'info';
    if (action.includes('DELETE') || action.includes('SUPPRESSION')) return 'error';
    if (action.includes('LOGIN') || action.includes('CONNEXION')) return 'primary';
    return 'default';
  };

  const columns = [
    {
      id: 'date',
      label: 'Date & Heure',
      render: (value, row) => (
        <Box>
          <Typography variant="body2">
            {new Date(row.dateAction || row.createdAt || value).toLocaleString('fr-FR')}
          </Typography>
          {row.duration && (
            <Typography variant="caption" color="text.secondary">
              {row.duration}ms
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'utilisateur',
      label: 'Utilisateur',
      render: (value, row) => (
        <Box>
          {row.userId || row.userEmail ? (
            <>
              <Typography variant="body2" fontWeight="bold">
                {row.userId?.nom || ''} {row.userId?.prenom || ''}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                {row.userEmail || row.userId?.email || ''}
              </Typography>
              {row.userRole && (
                <Chip label={row.userRole} size="small" sx={{ mt: 0.5, height: 20 }} />
              )}
            </>
          ) : (
            <Typography variant="body2" color="text.secondary">Système</Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'action',
      label: 'Action',
      render: (value, row) => (
        <Box>
          <Chip
            label={value}
            color={getActionColor(value)}
            size="small"
            sx={{ fontWeight: 600, mb: 0.5 }}
          />
          <Typography variant="caption" color="text.secondary" display="block">
            {row.module || '-'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'method',
      label: 'Méthode / URL',
      render: (value, row) => (
        <Box>
          <Chip
            label={row.method || 'N/A'}
            size="small"
            color={row.method === 'GET' ? 'default' : row.method === 'POST' ? 'success' : 'info'}
            sx={{ mb: 0.5 }}
          />
          <Typography variant="caption" color="text.secondary" display="block" sx={{ wordBreak: 'break-all' }}>
            {row.url || '-'}
          </Typography>
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Statut',
      render: (value, row) => {
        const statusCode = row.statusCode;
        if (!statusCode) return '-';
        const isError = statusCode >= 400;
        return (
          <Chip
            label={statusCode}
            size="small"
            color={isError ? 'error' : statusCode >= 300 ? 'warning' : 'success'}
          />
        );
      },
    },
    {
      id: 'ip',
      label: 'Adresse IP',
      render: (value, row) => (
        <Box>
          <Typography variant="body2" fontFamily="monospace">
            {row.ip || value || '-'}
          </Typography>
          {row.userAgent && (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }} title={row.userAgent}>
              {row.userAgent.substring(0, 50)}...
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'details',
      label: 'Détails',
      render: (value, row) => {
        const details = row.details || value;
        const detailsStr = typeof details === 'object' ? JSON.stringify(details) : details;
        return (
          <Box
            sx={{
              maxWidth: 300,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={detailsStr}
          >
            {detailsStr || '-'}
          </Box>
        );
      },
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Logs d'audit"
        subtitle="Journalisation de toutes les actions du système"
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
          label="Action"
          value={filters.action}
          onChange={(e) => setFilters({ ...filters, action: e.target.value })}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">Toutes</MenuItem>
          <MenuItem value="CREATE">Création</MenuItem>
          <MenuItem value="UPDATE">Modification</MenuItem>
          <MenuItem value="DELETE">Suppression</MenuItem>
          <MenuItem value="VIEW">Consultation</MenuItem>
          <MenuItem value="LOGIN">Connexion</MenuItem>
          <MenuItem value="REGISTER">Inscription</MenuItem>
          <MenuItem value="VALIDATION">Validation</MenuItem>
          <MenuItem value="SIGN">Signature</MenuItem>
          <MenuItem value="IMPORT">Import</MenuItem>
          <MenuItem value="EXPORT">Export</MenuItem>
        </TextField>
        <TextField
          select
          label="Module"
          value={filters.module || ''}
          onChange={(e) => setFilters({ ...filters, module: e.target.value })}
          sx={{ minWidth: 180 }}
        >
          <MenuItem value="">Tous</MenuItem>
          <MenuItem value="DEMANDES">Demandes</MenuItem>
          <MenuItem value="AGENTS">Agents</MenuItem>
          <MenuItem value="POSTES">Postes</MenuItem>
          <MenuItem value="VALIDATIONS">Validations</MenuItem>
          <MenuItem value="DOCUMENTS">Documents</MenuItem>
          <MenuItem value="USERS">Utilisateurs</MenuItem>
          <MenuItem value="AUTH">Authentification</MenuItem>
          <MenuItem value="REFERENTIELS">Référentiels</MenuItem>
        </TextField>
        <TextField
          label="Rechercher (utilisateur/IP)"
          value={filters.utilisateur}
          onChange={(e) => setFilters({ ...filters, utilisateur: e.target.value })}
          sx={{ flex: 1, minWidth: 200 }}
          placeholder="Email, nom ou adresse IP"
        />
        <ActionButton
          variant="outlined"
          startIcon={<FilterListIcon />}
          onClick={() => {
            const emptyFilters = { dateDebut: '', dateFin: '', action: '', utilisateur: '', module: '' };
            setFilters(emptyFilters);
            setAppliedFilters(emptyFilters);
            fetchLogs(emptyFilters, 200);
          }}
        >
          Réinitialiser
        </ActionButton>
        <ActionButton
          variant="outlined"
          onClick={() => fetchLogs(null, 200)}
          disabled={loading}
        >
          Actualiser
        </ActionButton>
        <Chip 
          label={loading ? 'Chargement...' : `${filteredLogs.length} log(s)${filteredLogs.length >= 200 ? ' (limité)' : ''}`} 
          color="primary" 
        />
      </Box>

      <DataTable
        columns={columns}
        rows={filteredLogs.map((l) => ({
          id: l._id,
          date: l.dateAction || l.createdAt || l.date,
          dateAction: l.dateAction || l.createdAt || l.date,
          utilisateur: l.userId,
          userId: l.userId,
          userEmail: l.userEmail,
          userRole: l.userRole,
          action: l.action,
          module: l.module,
          method: l.method,
          url: l.url,
          statusCode: l.statusCode,
          entite: l.module,
          details: l.details,
          ip: l.ip,
          userAgent: l.userAgent,
          duration: l.duration,
          ...l,
        }))}
        emptyMessage="Aucun log d'audit disponible"
      />
    </Box>
  );
}

