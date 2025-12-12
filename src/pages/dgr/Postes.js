import React, { useEffect, useState } from 'react';
import { Box, TextField, MenuItem, Chip, Button, Dialog, DialogTitle, DialogContent, DialogActions, FormControlLabel, Checkbox, Typography, Stepper, Step, StepLabel } from '@mui/material';
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
import DeleteIcon from '@mui/icons-material/Delete';
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
  const [openLiberation, setOpenLiberation] = useState(false);
  const [openSuppression, setOpenSuppression] = useState(false);
  const [selectedPoste, setSelectedPoste] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState('');
  const [posteALiberer, setPosteALiberer] = useState(null);
  const [posteASupprimer, setPosteASupprimer] = useState(null);
  const [activeStep, setActiveStep] = useState(0);
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

  const handleLiberer = (posteId) => {
    const poste = postes.find((p) => p._id === posteId);
    setPosteALiberer(poste);
    setOpenLiberation(true);
  };

  const confirmLiberer = async () => {
    if (!posteALiberer) return;
    
    try {
      await postesService.liberer(posteALiberer._id);
      const response = await postesService.getAll();
      const postesData = response.data || [];
      setPostes(postesData);
      setFilteredPostes(postesData);
      success('Poste libéré avec succès');
      setOpenLiberation(false);
      setPosteALiberer(null);
    } catch (err) {
      console.error('Erreur', err);
      const errorMessage = getErrorMessage(err);
      error(`Erreur lors de la libération: ${errorMessage}`);
    }
  };

  const handleNext = () => {
    // Valider l'étape 1 avant de passer à l'étape 2
    if (activeStep === 0) {
      if (!formData.intitule || !formData.serviceId || !formData.localisationId) {
        warning('Veuillez remplir tous les champs obligatoires de cette étape');
        return;
      }
    }
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleCreatePoste = async () => {
    if (!formData.intitule || !formData.serviceId || !formData.localisationId || !formData.gradeRequisId) {
      warning('Veuillez remplir tous les champs obligatoires');
      return;
    }
    try {
      await postesService.create(formData);
      setOpenCreation(false);
      setActiveStep(0);
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

  const handleCloseCreation = () => {
    setOpenCreation(false);
    setActiveStep(0);
    setFormData({
      intitule: '',
      description: '',
      serviceId: '',
      localisationId: '',
      gradeRequisId: '',
      estCritique: false,
    });
  };

  const steps = ['Informations générales', 'Spécifications'];

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

  const handleSupprimer = (posteId) => {
    const poste = postes.find((p) => p._id === posteId);
    setPosteASupprimer(poste);
    setOpenSuppression(true);
  };

  const confirmSupprimer = async () => {
    if (!posteASupprimer) return;
    
    try {
      await postesService.delete(posteASupprimer._id);
      const response = await postesService.getAll();
      const postesData = response.data || [];
      setPostes(postesData);
      setFilteredPostes(postesData);
      success('Poste supprimé avec succès');
      setOpenSuppression(false);
      setPosteASupprimer(null);
    } catch (err) {
      console.error('Erreur', err);
      const errorMessage = getErrorMessage(err);
      error(`Erreur lors de la suppression: ${errorMessage}`);
    }
  };

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
      actionsList.push({
        icon: <DeleteIcon />,
        tooltip: 'Supprimer le poste',
        color: 'error',
        onClick: () => handleSupprimer(row._id),
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
            helperText="Tous les agents sont affichés. Les agents avec une affectation actuelle sur un autre poste sont exclus."
          >
            {agents
              .filter((a) => {
                // Exclure les agents qui ont déjà une affectation actuelle sur un autre poste
                if (a.affectationsPostes && a.affectationsPostes.length > 0) {
                  const affectationsActuelles = a.affectationsPostes.filter((aff) => !aff.dateFin);
                  const currentPosteId = selectedPoste?._id;
                  
                  // Vérifier si l'agent a déjà ce poste en affectation actuelle
                  const aDejaCePoste = affectationsActuelles.some((aff) => {
                    const posteId = typeof aff.posteId === 'object' ? aff.posteId._id : aff.posteId;
                    return posteId && posteId.toString() === currentPosteId?.toString();
                  });
                  
                  // Si l'agent a déjà une autre affectation actuelle, l'exclure (sauf si c'est le même poste)
                  if (affectationsActuelles.length > 0 && !aDejaCePoste) {
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

      <Dialog open={openCreation} onClose={handleCloseCreation} maxWidth="md" fullWidth>
        <DialogTitle>Créer un nouveau poste</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, mb: 3 }}>
            <Stepper activeStep={activeStep}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minHeight: 300 }}>
            {activeStep === 0 && (
              <>
                <Typography variant="h6" gutterBottom>
                  Informations générales
                </Typography>
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
                  helperText="Description optionnelle du poste"
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
              </>
            )}

            {activeStep === 1 && (
              <>
                <Typography variant="h6" gutterBottom>
                  Spécifications
                </Typography>
                <TextField
                  fullWidth
                  select
                  label="Grade requis *"
                  value={formData.gradeRequisId}
                  onChange={(e) => setFormData({ ...formData, gradeRequisId: e.target.value })}
                  required
                  helperText="Grade minimum requis pour occuper ce poste"
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
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Un poste critique nécessite une attention particulière et doit être pourvu rapidement.
                </Typography>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <ActionButton onClick={handleCloseCreation}>Annuler</ActionButton>
          {activeStep > 0 && (
            <ActionButton onClick={handleBack}>
              Précédent
            </ActionButton>
          )}
          {activeStep < steps.length - 1 ? (
            <ActionButton
              onClick={handleNext}
              variant="contained"
              disabled={!formData.intitule || !formData.serviceId || !formData.localisationId}
            >
              Suivant
            </ActionButton>
          ) : (
            <ActionButton
              onClick={handleCreatePoste}
              variant="contained"
              disabled={!formData.intitule || !formData.serviceId || !formData.localisationId || !formData.gradeRequisId}
            >
              Créer
            </ActionButton>
          )}
        </DialogActions>
      </Dialog>

      {/* Modal de confirmation de libération */}
      <Dialog open={openLiberation} onClose={() => setOpenLiberation(false)}>
        <DialogTitle>Confirmer la libération du poste</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {posteALiberer && (
              <>
                <Typography variant="body1" gutterBottom>
                  Êtes-vous sûr de vouloir libérer le poste <strong>{posteALiberer.intitule}</strong> ?
                </Typography>
                {posteALiberer.agentId && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    L'agent <strong>{posteALiberer.agentId.nom} {posteALiberer.agentId.prenom}</strong> sera retiré de ce poste.
                  </Typography>
                )}
                <Typography variant="body2" color="warning.main" sx={{ mt: 2, fontWeight: 500 }}>
                  Cette action mettra fin à l'affectation actuelle et libérera le poste.
                </Typography>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <ActionButton onClick={() => setOpenLiberation(false)}>Annuler</ActionButton>
          <ActionButton
            onClick={confirmLiberer}
            variant="contained"
            color="warning"
          >
            Confirmer la libération
          </ActionButton>
        </DialogActions>
      </Dialog>

      {/* Modal de confirmation de suppression */}
      <Dialog open={openSuppression} onClose={() => setOpenSuppression(false)}>
        <DialogTitle>Confirmer la suppression du poste</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            {posteASupprimer && (
              <>
                <Typography variant="body1" gutterBottom>
                  Êtes-vous sûr de vouloir supprimer le poste <strong>{posteASupprimer.intitule}</strong> ?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Service: <strong>{posteASupprimer.serviceId?.libelle || '-'}</strong>
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Localisation: <strong>{posteASupprimer.localisationId?.libelle || '-'}</strong>
                </Typography>
                <Typography variant="body2" color="error.main" sx={{ mt: 2, fontWeight: 500 }}>
                  ⚠️ Cette action est irréversible. Le poste sera définitivement supprimé.
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Note: Un poste ne peut être supprimé que s'il n'a aucun agent affecté.
                </Typography>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <ActionButton onClick={() => setOpenSuppression(false)}>Annuler</ActionButton>
          <ActionButton
            onClick={confirmSupprimer}
            variant="contained"
            color="error"
          >
            Supprimer
          </ActionButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
