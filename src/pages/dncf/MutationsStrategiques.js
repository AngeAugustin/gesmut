import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { demandesService } from '../../services/demandesService';
import { agentsService } from '../../services/agentsService';
import { postesService } from '../../services/postesService';
import { referentielsService } from '../../services/referentielsService';
import { useToast } from '../../context/ToastContext';

// Fonction pour calculer l'ancienneté en années
const calculerAnciennete = (dateEmbauche) => {
  if (!dateEmbauche) return 0;
  const date = new Date(dateEmbauche);
  const maintenant = new Date();
  const diffTime = maintenant - date;
  const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
  return diffYears;
};

export default function DNCFMutationsStrategiques() {
  const { success, error, warning } = useToast();
  const [agents, setAgents] = useState([]);
  const [filteredAgents, setFilteredAgents] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [postes, setPostes] = useState([]);
  const [localites, setLocalites] = useState([]);
  const [grades, setGrades] = useState([]);
  const [services, setServices] = useState([]);
  const [directions, setDirections] = useState([]);
  const [filters, setFilters] = useState({
    recherche: '',
    directionId: '',
    serviceId: '',
    gradeId: '',
    ancienneteMin: '',
  });
  const [formData, setFormData] = useState({
    posteSouhaiteId: '',
    localisationSouhaiteId: '',
    motif: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [agentsRes, postesRes, localitesRes, gradesRes, servicesRes, directionsRes] = await Promise.all([
          agentsService.getAll(),
          postesService.getAll(),
          referentielsService.getLocalites(),
          referentielsService.getGrades(),
          referentielsService.getServices(),
          referentielsService.getDirections(),
        ]);
        setAgents(agentsRes.data || []);
        setFilteredAgents(agentsRes.data || []);
        setPostes(postesRes.data);
        setLocalites(localitesRes.data);
        setGrades(gradesRes.data);
        setServices(servicesRes.data);
        setDirections(directionsRes.data);
      } catch (error) {
        console.error('Erreur', error);
        error('Erreur lors du chargement des données');
      }
    };
    fetchData();
  }, []);

  // Filtrer les agents selon les critères
  useEffect(() => {
    // Filtrer d'abord les agents null ou undefined
    let filtered = agents.filter((a) => a != null);

    // Filtre par recherche (nom, prénom, matricule)
    if (filters.recherche) {
      const search = filters.recherche.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a?.nom?.toLowerCase().includes(search) ||
          a?.prenom?.toLowerCase().includes(search) ||
          a?.matricule?.toLowerCase().includes(search)
      );
    }

    // Filtre par direction
    if (filters.directionId) {
      filtered = filtered.filter((a) => {
        const serviceDirectionId = a.serviceId?.directionId?._id || a.serviceId?.directionId;
        return serviceDirectionId === filters.directionId;
      });
    }

    // Filtre par service
    if (filters.serviceId) {
      filtered = filtered.filter((a) => {
        const serviceId = a.serviceId?._id || a.serviceId;
        return serviceId === filters.serviceId;
      });
    }

    // Filtre par grade
    if (filters.gradeId) {
      filtered = filtered.filter((a) => {
        const gradeId = a.gradeId?._id || a.gradeId;
        return gradeId === filters.gradeId;
      });
    }

    // Filtre par ancienneté minimale
    if (filters.ancienneteMin) {
      const ancienneteMin = parseInt(filters.ancienneteMin);
      filtered = filtered.filter((a) => {
        const anciennete = calculerAnciennete(a.dateEmbauche);
        return anciennete >= ancienneteMin;
      });
    }

    setFilteredAgents(filtered);
  }, [agents, filters]);

  const handleOpenDialog = (agent) => {
    setSelectedAgent(agent);
    setFormData({
      posteSouhaiteId: '',
      localisationSouhaiteId: '',
      motif: '',
    });
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setSelectedAgent(null);
    setFormData({
      posteSouhaiteId: '',
      localisationSouhaiteId: '',
      motif: '',
    });
  };

  const handleCreate = async () => {
    if (!selectedAgent || !formData.motif) {
      warning('Veuillez remplir tous les champs obligatoires');
      return;
    }
    try {
      await demandesService.createStrategique({
        agentId: selectedAgent._id,
        posteSouhaiteId: formData.posteSouhaiteId || undefined,
        localisationSouhaiteId: formData.localisationSouhaiteId || undefined,
        motif: formData.motif,
      });
      handleCloseDialog();
      success('Mutation stratégique créée avec succès');
    } catch (err) {
      console.error('Erreur', err);
      error('Erreur lors de la création');
    }
  };

  // Obtenir le libellé de la direction d'un agent
  const getDirectionLibelle = (agent) => {
    if (!agent || !agent.serviceId) return '-';
    // Si le service est déjà populé avec sa direction (depuis le backend)
    if (agent.serviceId?.directionId) {
      const direction = agent.serviceId.directionId;
      return typeof direction === 'object' ? direction.libelle : '-';
    }
    // Sinon, chercher dans la liste des services
    const service = services.find(
      (s) => s._id === (agent.serviceId?._id || agent.serviceId)
    );
    if (!service || !service.directionId) return '-';
    const direction = directions.find(
      (d) => d._id === (service.directionId?._id || service.directionId)
    );
    return direction?.libelle || '-';
  };

  // Obtenir le libellé du service d'un agent
  const getServiceLibelle = (agent) => {
    if (!agent || !agent.serviceId) return '-';
    // Si le service est déjà un objet populé
    if (typeof agent.serviceId === 'object' && agent.serviceId !== null) {
      return agent.serviceId.libelle || '-';
    }
    // Sinon, chercher dans la liste des services
    const service = services.find(
      (s) => s._id === agent.serviceId
    );
    return service?.libelle || '-';
  };

  // Obtenir le libellé du grade d'un agent
  const getGradeLibelle = (agent) => {
    if (!agent || !agent.gradeId) return '-';
    const grade = grades.find(
      (g) => g._id === (agent.gradeId?._id || agent.gradeId)
    );
    return grade?.libelle || '-';
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Mutations stratégiques
      </Typography>

      {/* Filtres */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Filtres
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Recherche"
            placeholder="Nom, prénom ou matricule"
            value={filters.recherche}
            onChange={(e) =>
              setFilters({ ...filters, recherche: e.target.value })
            }
            size="small"
            sx={{ minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            label="Direction"
            value={filters.directionId}
            onChange={(e) =>
              setFilters({ ...filters, directionId: e.target.value })
            }
            size="small"
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Toutes</MenuItem>
            {directions.map((direction) => (
              <MenuItem key={direction._id} value={direction._id}>
                {direction.libelle}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Service"
            value={filters.serviceId}
            onChange={(e) =>
              setFilters({ ...filters, serviceId: e.target.value })
            }
            size="small"
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Tous</MenuItem>
            {services
              .filter((s) => {
                if (!filters.directionId) return true;
                const serviceDirectionId = s.directionId?._id || s.directionId;
                return serviceDirectionId === filters.directionId;
              })
              .map((service) => (
                <MenuItem key={service._id} value={service._id}>
                  {service.libelle}
                </MenuItem>
              ))}
          </TextField>
          <TextField
            select
            label="Grade"
            value={filters.gradeId}
            onChange={(e) =>
              setFilters({ ...filters, gradeId: e.target.value })
            }
            size="small"
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="">Tous</MenuItem>
            {grades.map((grade) => (
              <MenuItem key={grade._id} value={grade._id}>
                {grade.libelle}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Ancienneté min. (années)"
            type="number"
            value={filters.ancienneteMin}
            onChange={(e) =>
              setFilters({ ...filters, ancienneteMin: e.target.value })
            }
            size="small"
            sx={{ minWidth: 180 }}
            inputProps={{ min: 0 }}
          />
          <Button
            variant="outlined"
            onClick={() =>
              setFilters({
                recherche: '',
                directionId: '',
                serviceId: '',
                gradeId: '',
                ancienneteMin: '',
              })
            }
            sx={{ minWidth: 120 }}
          >
            Réinitialiser
          </Button>
        </Box>
      </Paper>

      {/* Tableau des agents */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Action</TableCell>
              <TableCell>Matricule</TableCell>
              <TableCell>Nom & Prénom</TableCell>
              <TableCell>Direction</TableCell>
              <TableCell>Service</TableCell>
              <TableCell>Grade</TableCell>
              <TableCell>Ancienneté</TableCell>
              <TableCell>Localisation actuelle</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredAgents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  <Typography variant="body2" color="text.secondary">
                    Aucun agent trouvé
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredAgents
                .filter((agent) => agent != null && agent._id)
                .map((agent) => (
                  <TableRow key={agent._id} hover>
                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handleOpenDialog(agent)}
                      >
                        Muter
                      </Button>
                    </TableCell>
                    <TableCell>{agent?.matricule || '-'}</TableCell>
                    <TableCell>
                      {agent?.nom || ''} {agent?.prenom || ''}
                    </TableCell>
                    <TableCell>{getDirectionLibelle(agent)}</TableCell>
                    <TableCell>{getServiceLibelle(agent)}</TableCell>
                    <TableCell>{getGradeLibelle(agent)}</TableCell>
                    <TableCell>
                      {calculerAnciennete(agent?.dateEmbauche)} ans
                    </TableCell>
                    <TableCell>
                      {agent?.localisationActuelleId?.libelle ||
                        agent?.localisationActuelleId ||
                        '-'}
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialogue pour créer une mutation stratégique */}
      <Dialog open={open} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Créer une mutation stratégique - {selectedAgent?.nom}{' '}
          {selectedAgent?.prenom}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Informations de l'agent
              </Typography>
              <Typography variant="body2">
                <strong>Matricule:</strong> {selectedAgent?.matricule}
              </Typography>
              <Typography variant="body2">
                <strong>Direction:</strong> {getDirectionLibelle(selectedAgent)}
              </Typography>
              <Typography variant="body2">
                <strong>Service:</strong> {getServiceLibelle(selectedAgent)}
              </Typography>
              <Typography variant="body2">
                <strong>Grade:</strong> {getGradeLibelle(selectedAgent)}
              </Typography>
              <Typography variant="body2">
                <strong>Ancienneté:</strong>{' '}
                {calculerAnciennete(selectedAgent?.dateEmbauche)} ans
              </Typography>
            </Box>

            <TextField
              fullWidth
              select
              label="Poste souhaité"
              value={formData.posteSouhaiteId}
              onChange={(e) =>
                setFormData({ ...formData, posteSouhaiteId: e.target.value })
              }
              sx={{ mb: 2 }}
            >
              <MenuItem value="">Aucun</MenuItem>
              {postes.map((poste) => (
                <MenuItem key={poste._id} value={poste._id}>
                  {poste.intitule} - {poste.localisationId?.libelle}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              select
              label="Localisation souhaitée"
              value={formData.localisationSouhaiteId}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  localisationSouhaiteId: e.target.value,
                })
              }
              sx={{ mb: 2 }}
            >
              <MenuItem value="">Aucune</MenuItem>
              {localites.map((localite) => (
                <MenuItem key={localite._id} value={localite._id}>
                  {localite.libelle}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Motif (obligatoire)"
              value={formData.motif}
              onChange={(e) =>
                setFormData({ ...formData, motif: e.target.value })
              }
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={!formData.motif}
          >
            Créer la mutation
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
