import React, { useState, useEffect } from 'react';
import { Box, Grid, TextField, Select, MenuItem, FormControl, InputLabel, Avatar, Alert, CircularProgress, IconButton } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { agentsService } from '../../../services/agentsService';

export default function Step1InformationsPersonnelles({ formData, setFormData, directions, services, onPhotoChange, onAgentFound, showOnlyMatricule = false }) {
  const [searching, setSearching] = useState(false);
  const [agentNotFound, setAgentNotFound] = useState(false);
  const [agentFound, setAgentFound] = useState(false);
  const [searchType, setSearchType] = useState('matricule');
  const [searchValue, setSearchValue] = useState('');

  const filteredServices = services.filter((service) => {
    if (!formData.directionId) return false;
    const serviceDirectionId = service.directionId?._id || service.directionId;
    return serviceDirectionId === formData.directionId;
  });

  const searchAgentByIdentifier = async () => {
    const value = showOnlyMatricule ? searchValue : formData.matricule;
    if (!value || value.trim() === '') {
      setAgentNotFound(false);
      return;
    }

    setSearching(true);
    setAgentNotFound(false);

    try {
      const response = await agentsService.findByIdentifierPublic(searchType, value.trim());
      
      if (response.data.found && response.data.agent) {
        const agent = response.data.agent;
        
        // Extraire les IDs
        const serviceId = agent.serviceId?._id || agent.serviceId;
        const directionId = agent.serviceId?.directionId?._id || agent.serviceId?.directionId;
        
        // Récupérer le poste actuel (dernière affectation)
        let posteActuel = '';
        if (agent.affectationsPostes && agent.affectationsPostes.length > 0) {
          const derniereAffectation = agent.affectationsPostes[agent.affectationsPostes.length - 1];
          if (derniereAffectation.posteId) {
            const poste = derniereAffectation.posteId;
            posteActuel = typeof poste === 'object' && poste !== null ? poste.intitule : '';
          }
        }

        // Pré-remplir les champs
        const updatedFormData = {
          ...formData,
          matricule: agent.matricule || formData.matricule || '',
          nom: agent.nom || '',
          prenom: agent.prenom || '',
          sexe: agent.sexe || '',
          directionId: directionId || '',
          serviceId: serviceId || '',
          posteActuel: posteActuel,
          // La photo sera gérée séparément si nécessaire
        };
        
        setFormData(updatedFormData);
        
        // Si on est en mode showOnlyMatricule, mettre à jour aussi searchValue avec le matricule trouvé
        if (showOnlyMatricule && agent.matricule) {
          setSearchValue(agent.matricule);
        }

        setAgentFound(true);
        setAgentNotFound(false);
        if (onAgentFound) {
          onAgentFound(true);
        }
      } else {
        setAgentFound(false);
        setAgentNotFound(true);
        if (onAgentFound) {
          onAgentFound(false);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la recherche de l\'agent:', error);
      setAgentFound(false);
      setAgentNotFound(true);
      if (onAgentFound) {
        onAgentFound(false);
      }
    } finally {
      setSearching(false);
    }
  };

  // Réinitialiser l'état si la valeur de recherche change
  useEffect(() => {
    const value = showOnlyMatricule ? searchValue : formData.matricule;
    if (!value || value.trim() === '') {
      setAgentFound(false);
      setAgentNotFound(false);
      if (onAgentFound) {
        onAgentFound(false);
      }
    }
  }, [showOnlyMatricule ? searchValue : formData.matricule]);

  const getSearchLabel = () => {
    switch (searchType) {
      case 'matricule':
        return 'Matricule';
      case 'npi':
        return 'NPI (Numéro Personnel d\'Identification)';
      case 'ifu':
        return 'IFU (Identifiant Fiscal Unique)';
      default:
        return 'Matricule';
    }
  };

  if (showOnlyMatricule) {
    return (
      <Box sx={{ py: 2 }}>
        {agentNotFound && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Aucun agent trouvé avec ce {searchType === 'matricule' ? 'matricule' : searchType === 'npi' ? 'NPI' : 'IFU'}. Vous devez être enregistré dans le système pour faire une demande de mutation.
          </Alert>
        )}
        <Box sx={{ maxWidth: 600, mx: 'auto' }}>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel>Type de recherche</InputLabel>
                <Select
                  value={searchType}
                  label="Type de recherche"
                  onChange={(e) => {
                    setSearchType(e.target.value);
                    setSearchValue('');
                    setAgentFound(false);
                    setAgentNotFound(false);
                    if (onAgentFound) {
                      onAgentFound(false);
                    }
                  }}
                  disabled={agentFound}
                >
                  <MenuItem value="matricule">Matricule</MenuItem>
                  <MenuItem value="npi">NPI</MenuItem>
                  <MenuItem value="ifu">IFU</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label={getSearchLabel()}
                required
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onBlur={searchAgentByIdentifier}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    searchAgentByIdentifier();
                  }
                }}
                disabled={agentFound}
                helperText={agentFound ? "Agent trouvé - Vous pouvez maintenant continuer" : `Entrez votre ${getSearchLabel().toLowerCase()} et appuyez sur Entrée ou cliquez sur Rechercher`}
              />
            </Grid>
            <Grid item xs={12} sm={2}>
              <IconButton
                onClick={searchAgentByIdentifier}
                disabled={searching || !searchValue || agentFound}
                fullWidth
                sx={{ height: '56px', mt: 1 }}
                color="primary"
                size="large"
              >
                {searching ? <CircularProgress size={24} /> : <SearchIcon />}
              </IconButton>
            </Grid>
          </Grid>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ py: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Nom"
            required
            value={formData.nom}
            onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
            margin="normal"
            disabled={agentFound}
          />
          <TextField
            fullWidth
            label="Prénom"
            required
            value={formData.prenom}
            onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
            margin="normal"
            disabled={agentFound}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          {formData.posteActuel && (
            <TextField
              fullWidth
              label="Poste actuel"
              value={formData.posteActuel}
              margin="normal"
              disabled
              helperText="Poste actuel (non modifiable)"
            />
          )}
          <FormControl fullWidth margin="normal">
            <InputLabel>Sexe</InputLabel>
            <Select
              value={formData.sexe}
              label="Sexe"
              onChange={(e) => setFormData({ ...formData, sexe: e.target.value })}
              disabled={agentFound}
            >
              <MenuItem value="">Sélectionner</MenuItem>
              <MenuItem value="M">Masculin</MenuItem>
              <MenuItem value="F">Féminin</MenuItem>
              <MenuItem value="Autre">Autre</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Email"
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            margin="normal"
            helperText="Vous recevrez la décision finale à cette adresse"
          />
          <TextField
            fullWidth
            label="Téléphone"
            value={formData.telephone || ''}
            onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
            margin="normal"
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Direction</InputLabel>
            <Select
              value={formData.directionId}
              label="Direction"
              onChange={(e) => setFormData({ ...formData, directionId: e.target.value, serviceId: '' })}
              disabled={agentFound}
            >
              <MenuItem value="">Sélectionner une direction</MenuItem>
              {directions.map((direction) => (
                <MenuItem key={direction._id} value={direction._id}>
                  {direction.libelle}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal" required disabled={!formData.directionId || agentFound}>
            <InputLabel>Service</InputLabel>
            <Select
              value={formData.serviceId}
              label="Service"
              onChange={(e) => setFormData({ ...formData, serviceId: e.target.value })}
              disabled={!formData.directionId || agentFound}
            >
              <MenuItem value="">Sélectionner un service</MenuItem>
              {filteredServices.map((service) => (
                <MenuItem key={service._id} value={service._id}>
                  {service.libelle}
                </MenuItem>
              ))}
            </Select>
            {!formData.directionId && (
              <Box sx={{ mt: 1 }}>
                <small style={{ color: '#666' }}>Veuillez d'abord sélectionner une direction</small>
              </Box>
            )}
          </FormControl>
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={formData.photoPreview} sx={{ width: 80, height: 80 }}>
              {!formData.photoPreview && 'Photo'}
            </Avatar>
            <label>
              <input
                type="file"
                accept="image/*"
                onChange={onPhotoChange}
                style={{ display: 'none' }}
              />
              <Box
                component="span"
                sx={{
                  display: 'inline-block',
                  px: 2,
                  py: 1,
                  bgcolor: 'primary.main',
                  color: 'white',
                  borderRadius: 1,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'primary.dark' },
                }}
              >
                Choisir une photo
              </Box>
            </label>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
