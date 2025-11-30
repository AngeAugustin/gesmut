import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  IconButton,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { authService } from '../../services/authService';
import api from '../../services/api';
import { referentielsService } from '../../services/referentielsService';
import { postesService } from '../../services/postesService';
import { useToast } from '../../context/ToastContext';

export default function AdminUtilisateurs() {
  const { success, error } = useToast();
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nom: '',
    prenom: '',
    role: 'AGENT',
    agentId: '',
    directionId: '',
    serviceId: '',
    gradeId: '',
    posteId: '',
    isActive: true,
  });
  const [directions, setDirections] = useState([]);
  const [services, setServices] = useState([]);
  const [grades, setGrades] = useState([]);
  const [postes, setPostes] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchReferentiels();
  }, []);

  const fetchReferentiels = async () => {
    try {
      const [directionsRes, servicesRes, gradesRes, postesRes] = await Promise.all([
        referentielsService.getDirections(),
        referentielsService.getServices(),
        referentielsService.getGrades(),
        postesService.getAll(),
      ]);
      setDirections(directionsRes.data || []);
      setServices(servicesRes.data || []);
      setGrades(gradesRes.data || []);
      setPostes(postesRes.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des référentiels', error);
    }
  };

  // Filtrer les services par direction sélectionnée
  const filteredServices = formData.directionId
    ? services.filter((s) => {
        const serviceDirectionId = typeof s.directionId === 'object' ? s.directionId._id : s.directionId;
        return serviceDirectionId === formData.directionId;
      })
    : services;

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Erreur', error);
    }
  };

  const handleSubmit = async () => {
    try {
      // Nettoyer les données avant envoi
      const dataToSend = { ...formData };
      if (!dataToSend.agentId || dataToSend.agentId.trim() === '') {
        delete dataToSend.agentId;
      }
      if (!dataToSend.directionId) delete dataToSend.directionId;
      if (!dataToSend.serviceId) delete dataToSend.serviceId;
      if (!dataToSend.gradeId) delete dataToSend.gradeId;
      if (!dataToSend.posteId) delete dataToSend.posteId;
      // Ne pas envoyer le mot de passe s'il est vide lors de l'édition
      if (editingUser && !dataToSend.password) {
        delete dataToSend.password;
      }
      
      if (editingUser) {
        await api.patch(`/users/${editingUser._id}`, dataToSend);
      } else {
        // L'admin crée des comptes actifs par défaut
        dataToSend.isActive = true;
        // skipTokenStorage = true pour ne pas écraser le token de l'admin
        await authService.register(dataToSend, true);
      }
      setOpen(false);
      setEditingUser(null);
      setFormData({
        email: '',
        password: '',
        nom: '',
        prenom: '',
        role: 'AGENT',
        agentId: '',
        directionId: '',
        serviceId: '',
        gradeId: '',
        posteId: '',
        isActive: true,
      });
      // Attendre un peu avant de rafraîchir pour s'assurer que la création est terminée
      setTimeout(() => {
        fetchUsers();
      }, 100);
      success(editingUser ? 'Utilisateur modifié avec succès' : 'Utilisateur créé avec succès');
    } catch (err) {
      console.error('Erreur', err);
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la sauvegarde';
      error(errorMessage);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    // Gérer les IDs qui peuvent être des objets (populés) ou des strings
    const directionId = user.directionId 
      ? (typeof user.directionId === 'object' ? user.directionId._id : user.directionId)
      : '';
    const serviceId = user.serviceId 
      ? (typeof user.serviceId === 'object' ? user.serviceId._id : user.serviceId)
      : '';
    const gradeId = user.gradeId 
      ? (typeof user.gradeId === 'object' ? user.gradeId._id : user.gradeId)
      : '';
    const posteId = user.posteId 
      ? (typeof user.posteId === 'object' ? user.posteId._id : user.posteId)
      : '';
    
    setFormData({
      email: user.email,
      password: '',
      nom: user.nom,
      prenom: user.prenom,
      role: user.role,
      agentId: user.agentId || '',
      directionId: directionId,
      serviceId: serviceId,
      gradeId: gradeId,
      posteId: posteId,
      isActive: user.isActive,
    });
    setOpen(true);
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await api.delete(`/users/${userId}`);
        fetchUsers();
        success('Utilisateur supprimé avec succès');
      } catch (err) {
        console.error('Erreur', err);
        error('Erreur lors de la suppression');
      }
    }
  };

  const handleToggleActive = async (user) => {
    try {
      await api.patch(`/users/${user._id}/activate`, { isActive: !user.isActive });
      fetchUsers();
      success(user.isActive ? 'Compte désactivé avec succès' : 'Compte activé avec succès');
    } catch (err) {
      console.error('Erreur', err);
      error('Erreur lors de la modification du statut');
    }
  };

  const roles = [
    { value: 'AGENT', label: 'Agent' },
    { value: 'RESPONSABLE', label: 'Responsable' },
    { value: 'DGR', label: 'DGR' },
    { value: 'CVR', label: 'CVR' },
    { value: 'DNCF', label: 'DNCF' },
    { value: 'ADMIN', label: 'Admin' },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Gestion des utilisateurs</Typography>
        <Button variant="contained" onClick={() => setOpen(true)}>
          Nouvel utilisateur
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nom</TableCell>
              <TableCell>Prénom</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rôle</TableCell>
              <TableCell>Statut</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.nom}</TableCell>
                <TableCell>{user.prenom}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip label={user.role} size="small" />
                </TableCell>
                <TableCell>
                  <Chip
                    label={user.isActive ? 'Actif' : 'Inactif'}
                    color={user.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => handleToggleActive(user)}
                    color={user.isActive ? 'warning' : 'success'}
                    title={user.isActive ? 'Désactiver le compte' : 'Activer le compte'}
                  >
                    {user.isActive ? <CancelIcon /> : <CheckCircleIcon />}
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleEdit(user)}
                    color="primary"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(user._id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingUser ? 'Modifier utilisateur' : 'Nouvel utilisateur'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Nom"
            value={formData.nom}
            onChange={(e) =>
              setFormData({ ...formData, nom: e.target.value })
            }
            required
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Prénom"
            value={formData.prenom}
            onChange={(e) =>
              setFormData({ ...formData, prenom: e.target.value })
            }
            required
            sx={{ mt: 2 }}
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
            sx={{ mt: 2 }}
          />
          {!editingUser && (
            <TextField
              fullWidth
              label="Mot de passe"
              type="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              sx={{ mt: 2 }}
            />
          )}
          <TextField
            fullWidth
            select
            label="Rôle"
            value={formData.role}
            onChange={(e) =>
              setFormData({ ...formData, role: e.target.value })
            }
            sx={{ mt: 2 }}
          >
            {roles.map((role) => (
              <MenuItem key={role.value} value={role.value}>
                {role.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            select
            label="Direction (optionnel)"
            value={formData.directionId}
            onChange={(e) => {
              setFormData({ ...formData, directionId: e.target.value, serviceId: '' });
            }}
            sx={{ mt: 2 }}
          >
            <MenuItem value="">Aucune</MenuItem>
            {directions.map((direction) => (
              <MenuItem key={direction._id} value={direction._id}>
                {direction.libelle}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            select
            label="Service (optionnel)"
            value={formData.serviceId}
            onChange={(e) =>
              setFormData({ ...formData, serviceId: e.target.value })
            }
            disabled={!formData.directionId}
            helperText={!formData.directionId ? 'Veuillez d\'abord sélectionner une direction' : ''}
            sx={{ mt: 2 }}
          >
            <MenuItem value="">Aucun</MenuItem>
            {filteredServices.map((service) => (
              <MenuItem key={service._id} value={service._id}>
                {service.libelle}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            select
            label="Grade (optionnel)"
            value={formData.gradeId}
            onChange={(e) =>
              setFormData({ ...formData, gradeId: e.target.value })
            }
            sx={{ mt: 2 }}
          >
            <MenuItem value="">Aucun</MenuItem>
            {grades.map((grade) => (
              <MenuItem key={grade._id} value={grade._id}>
                {grade.libelle}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            select
            label="Poste (optionnel)"
            value={formData.posteId}
            onChange={(e) =>
              setFormData({ ...formData, posteId: e.target.value })
            }
            sx={{ mt: 2 }}
          >
            <MenuItem value="">Aucun</MenuItem>
            {postes.map((poste) => (
              <MenuItem key={poste._id} value={poste._id}>
                {poste.intitule}
              </MenuItem>
            ))}
          </TextField>
          {formData.role === 'AGENT' && (
            <TextField
              fullWidth
              label="ID Agent (optionnel)"
              value={formData.agentId}
              onChange={(e) =>
                setFormData({ ...formData, agentId: e.target.value })
              }
              sx={{ mt: 2 }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Annuler</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingUser ? 'Modifier' : 'Créer'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
