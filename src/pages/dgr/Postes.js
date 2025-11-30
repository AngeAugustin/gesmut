import React, { useEffect, useState } from 'react';
import { Box, TextField, MenuItem, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, FormControlLabel, Checkbox } from '@mui/material';
import { postesService } from '../../services/postesService';
import { referentielsService } from '../../services/referentielsService';
import { agentsService } from '../../services/agentsService';
import PageHeader from '../../components/common/PageHeader';
import DataTable from '../../components/common/DataTable';
import StatusChip from '../../components/common/StatusChip';
import ActionButton from '../../components/common/ActionButton';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage } from '../../utils/errorHandler';
import { useToast } from '../../context/ToastContext';

export default function DGRPostes() {
  const { success, error, warning } = useToast();
  const [postes, setPostes] = useState([]);
  const [filteredPostes, setFilteredPostes] = useState([]);
  const [services, setServices] = useState([]);
  const [agents, setAgents] = useState([]);
  const [filters, setFilters] = useState({
    service: '',
    statut: '',
    recherche: '',
  });
  const [openAffectation, setOpenAffectation] = useState(false);
  const [openCreation, setOpenCreation] = useState(false);
  const [selectedPoste, setSelectedPoste] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [localites, setLocalites] = useState([]);
  const [grades, setGrades] = useState([]);
  const [formData, setFormData] = useState({
    intitule: '',
    description: '',
    serviceId: '',
    localisationId: '',
    gradeRequisId: '',
    estCritique: false,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [postesRes, servicesRes, agentsRes, localitesRes, gradesRes] = await Promise.all([
          postesService.getAll(),
          referentielsService.getServices(),
          agentsService.getAll(),
          referentielsService.getLocalites(),
          referentielsService.getGrades(),
        ]);
        const postesData = postesRes.data || [];
        // Debug: vérifier que les données sont bien populées
        if (postesData.length > 0) {
          console.log('Premier poste:', postesData[0]);
        }
        setPostes(postesData);
        setFilteredPostes(postesData);
        setServices(servicesRes.data || []);
        setAgents(agentsRes.data || []);
        setLocalites(localitesRes.data || []);
        setGrades(gradesRes.data || []);
      } catch (error) {
        console.error('Erreur', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...postes];

    if (filters.service) {
      filtered = filtered.filter((p) => p.serviceId?._id === filters.service || p.serviceId === filters.service);
    }
    if (filters.statut) {
      filtered = filtered.filter((p) => p.statut === filters.statut);
    }
    if (filters.recherche) {
      const search = filters.recherche.toLowerCase();
      filtered = filtered.filter((p) => p.intitule?.toLowerCase().includes(search));
    }

    setFilteredPostes(filtered);
  }, [filters, postes]);

  const handleAffecter = async () => {
    try {
      await postesService.affecterAgent(selectedPoste._id, selectedAgent);
      setOpenAffectation(false);
      setSelectedPoste(null);
      setSelectedAgent('');
      // Recharger
      const response = await postesService.getAll();
      const postesData = response.data || [];
      setPostes(postesData);
      setFilteredPostes(postesData);
      success('Agent affecté au poste avec succès');
    } catch (err) {
      console.error('Erreur', err);
      const errorMessage = getErrorMessage(err);
      error(`Erreur lors de l'affectation: ${errorMessage}`);
    }
  };

  const handleLiberer = async (posteId) => {
    if (window.confirm('Êtes-vous sûr de vouloir libérer ce poste ?')) {
      try {
        await postesService.liberer(posteId);
        const response = await postesService.getAll();
        const postesData = response.data || [];
        setPostes(postesData);
        setFilteredPostes(postesData);
        success('Poste libéré avec succès');
      } catch (err) {
        console.error('Erreur', err);
        const errorMessage = getErrorMessage(err);
        error(`Erreur lors de la libération: ${errorMessage}`);
      }
    }
  };

  const handleCreatePoste = async () => {
    if (!formData.intitule || !formData.serviceId || !formData.localisationId || !formData.gradeRequisId) {
      warning('Veuillez remplir tous les champs obligatoires');
      return;
    }
    try {
      await postesService.create(formData);
      setOpenCreation(false);
      setFormData({
        intitule: '',
        description: '',
        serviceId: '',
        localisationId: '',
        gradeRequisId: '',
        estCritique: false,
      });
      // Recharger les données avec populate
      const response = await postesService.getAll();
      const postesData = response.data || [];
      setPostes(postesData);
      setFilteredPostes(postesData);
      success('Poste créé avec succès');
    } catch (err) {
      console.error('Erreur', err);
      const errorMessage = getErrorMessage(err);
      error(`Erreur lors de la création du poste: ${errorMessage}`);
    }
  };

  const columns = [
    {
      id: 'intitule',
      label: 'Intitulé',
    },
    {
      id: 'service',
      label: 'Service',
      render: (value, row) => row.serviceId?.libelle || '-',
    },
    {
      id: 'localisation',
      label: 'Localisation',
      render: (value, row) => row.localisationId?.libelle || '-',
    },
    {
      id: 'grade',
      label: 'Grade requis',
      render: (value, row) => row.gradeRequisId?.libelle || '-',
    },
    {
      id: 'statut',
      label: 'Statut',
      render: (value) => <StatusChip status={value} />,
    },
    {
      id: 'agent',
      label: 'Agent affecté',
      render: (value, row) => row.agentId ? `${row.agentId.nom} ${row.agentId.prenom}` : '-',
    },
  ];

  const actions = (row) => {
    const actionsList = [
      {
        icon: <VisibilityIcon />,
        tooltip: 'Voir les détails',
        onClick: () => navigate(`/dgr/postes/${row._id}`),
      },
    ];

    if (row.statut === 'LIBRE') {
      actionsList.push({
        icon: <PersonAddIcon />,
        tooltip: 'Affecter un agent',
        color: 'primary',
        onClick: () => {
          setSelectedPoste(row);
          setOpenAffectation(true);
        },
      });
    } else if (row.statut === 'OCCUPE') {
      actionsList.push({
        icon: <PersonAddIcon />,
        tooltip: 'Libérer le poste',
        color: 'warning',
        onClick: () => handleLiberer(row._id),
      });
    }

    return actionsList;
  };

  return (
    <Box>
      <PageHeader
        title="Gestion des postes"
        subtitle="Consultez et gérez tous les postes du système"
      />

      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', flex: 1 }}>
          <TextField
            select
            label="Service"
            value={filters.service}
            onChange={(e) => setFilters({ ...filters, service: e.target.value })}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Tous</MenuItem>
            {services.map((service) => (
              <MenuItem key={service._id} value={service._id}>
                {service.libelle}
              </MenuItem>
            ))}
          </TextField>
        <TextField
          select
          label="Statut"
          value={filters.statut}
          onChange={(e) => setFilters({ ...filters, statut: e.target.value })}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="">Tous</MenuItem>
          <MenuItem value="LIBRE">Libre</MenuItem>
          <MenuItem value="OCCUPE">Occupé</MenuItem>
        </TextField>
        <TextField
          label="Rechercher"
          value={filters.recherche}
          onChange={(e) => setFilters({ ...filters, recherche: e.target.value })}
          sx={{ flex: 1, minWidth: 200 }}
          placeholder="Intitulé du poste"
        />
          <Chip label={`${filteredPostes.length} poste(s)`} color="primary" />
        </Box>
        <ActionButton
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreation(true)}
        >
          Créer un poste
        </ActionButton>
      </Box>

      <DataTable
        columns={columns}
        rows={filteredPostes.map((p) => ({
          id: p._id,
          intitule: p.intitule,
          service: p.serviceId,
          localisation: p.localisationId,
          grade: p.gradeRequisId,
          statut: p.statut,
          agent: p.agentId,
          // Préserver toutes les propriétés du poste pour que les fonctions render puissent y accéder
          serviceId: p.serviceId,
          localisationId: p.localisationId,
          gradeRequisId: p.gradeRequisId,
          agentId: p.agentId,
          ...p,
        }))}
        actions={actions}
        emptyMessage="Aucun poste trouvé"
      />

      <Dialog open={openAffectation} onClose={() => setOpenAffectation(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Affecter un agent au poste</DialogTitle>
        <DialogContent>
          {selectedPoste && (
            <Box sx={{ mb: 2 }}>
              <TextField
                fullWidth
                label="Poste"
                value={selectedPoste.intitule}
                disabled
                sx={{ mb: 2 }}
              />
            </Box>
          )}
          <TextField
            fullWidth
            select
            label="Agent"
            value={selectedAgent}
            onChange={(e) => setSelectedAgent(e.target.value)}
            helperText="Seuls les agents du même service et avec le grade requis sont affichés"
          >
            {agents
              .filter((a) => {
                // Filtrer par service du poste
                if (selectedPoste?.serviceId) {
                  const posteServiceId = typeof selectedPoste.serviceId === 'object' 
                    ? selectedPoste.serviceId._id 
                    : selectedPoste.serviceId;
                  const agentServiceId = typeof a.serviceId === 'object' 
                    ? a.serviceId?._id 
                    : a.serviceId;
                  
                  // Si le poste a un service, l'agent doit avoir le même service
                  if (posteServiceId) {
                    if (!agentServiceId || agentServiceId.toString() !== posteServiceId.toString()) {
                      return false;
                    }
                  }
                }
                
                // Filtrer par grade requis
                if (selectedPoste?.gradeRequisId) {
                  const posteGradeId = typeof selectedPoste.gradeRequisId === 'object' 
                    ? selectedPoste.gradeRequisId._id 
                    : selectedPoste.gradeRequisId;
                  const agentGradeId = typeof a.gradeId === 'object' 
                    ? a.gradeId?._id 
                    : a.gradeId;
                  
                  if (agentGradeId && posteGradeId && agentGradeId.toString() !== posteGradeId.toString()) {
                    return false;
                  }
                }
                
                // Exclure les agents qui ont déjà un poste actuel (sauf s'ils sont sur ce même poste)
                if (a.posteActuelId) {
                  const agentPosteId = typeof a.posteActuelId === 'object' 
                    ? a.posteActuelId._id 
                    : a.posteActuelId;
                  const currentPosteId = selectedPoste?._id;
                  
                  // Permettre de réaffecter le même agent au même poste, mais exclure les autres
                  if (agentPosteId && agentPosteId.toString() !== currentPosteId?.toString()) {
                    return false;
                  }
                }
                
                return true;
              })
              .map((agent) => (
                <MenuItem key={agent._id} value={agent._id}>
                  {agent.nom} {agent.prenom} - {agent.matricule} ({agent.gradeId?.libelle})
                  {agent.serviceId && ` - ${typeof agent.serviceId === 'object' ? agent.serviceId.libelle : 'Service'}`}
                </MenuItem>
              ))}
          </TextField>
        </DialogContent>
        <DialogActions>
          <ActionButton onClick={() => setOpenAffectation(false)}>Annuler</ActionButton>
          <ActionButton
            onClick={handleAffecter}
            variant="contained"
            disabled={!selectedAgent}
          >
            Affecter
          </ActionButton>
        </DialogActions>
      </Dialog>

      <Dialog open={openCreation} onClose={() => setOpenCreation(false)} maxWidth="md" fullWidth>
        <DialogTitle>Créer un nouveau poste</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Intitulé du poste *"
              value={formData.intitule}
              onChange={(e) => setFormData({ ...formData, intitule: e.target.value })}
              required
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <TextField
              fullWidth
              select
              label="Service *"
              value={formData.serviceId}
              onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
              required
            >
              {services.map((service) => (
                <MenuItem key={service._id} value={service._id}>
                  {service.libelle}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              select
              label="Localisation *"
              value={formData.localisationId}
              onChange={(e) => setFormData({ ...formData, localisationId: e.target.value })}
              required
            >
              {localites.map((localite) => (
                <MenuItem key={localite._id} value={localite._id}>
                  {localite.libelle}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              select
              label="Grade requis *"
              value={formData.gradeRequisId}
              onChange={(e) => setFormData({ ...formData, gradeRequisId: e.target.value })}
              required
            >
              {grades.map((grade) => (
                <MenuItem key={grade._id} value={grade._id}>
                  {grade.libelle}
                </MenuItem>
              ))}
            </TextField>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.estCritique}
                  onChange={(e) => setFormData({ ...formData, estCritique: e.target.checked })}
                />
              }
              label="Poste critique"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <ActionButton onClick={() => setOpenCreation(false)}>Annuler</ActionButton>
          <ActionButton
            onClick={handleCreatePoste}
            variant="contained"
            disabled={!formData.intitule || !formData.serviceId || !formData.localisationId || !formData.gradeRequisId}
          >
            Créer
          </ActionButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
