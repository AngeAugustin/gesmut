import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Avatar,
} from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';

export default function Step5AgentRecapitulatif({
  formData,
  photoPreview,
  grades,
  statuts,
  directions,
  services,
  localites,
  postes,
  diplomes,
}) {
  const selectedGrade = grades.find((g) => g._id === formData.gradeId);
  const selectedStatut = statuts.find((s) => s._id === formData.statutId);
  const selectedDirection = directions.find((d) => d._id === formData.directionId);
  const selectedService = services.find((s) => s._id === formData.serviceId);
  const selectedLocalisation = localites.find((l) => l._id === formData.localisationActuelleId);
  const affectationsPostes = (formData.affectationsPostes || []).map((aff) => ({
    ...aff,
    poste: postes.find((p) => p._id === aff.posteId),
  })).sort((a, b) => {
    // Trier chronologiquement par date de début (plus ancienne en premier)
    const dateA = new Date(a.dateDebut).getTime();
    const dateB = new Date(b.dateDebut).getTime();
    return dateA - dateB;
  });
  
  const affectationsActuelles = affectationsPostes.filter((aff) => !aff.dateFin);
  const affectationsPassees = affectationsPostes.filter((aff) => aff.dateFin).sort((a, b) => {
    // Pour l'historique, trier par date de fin décroissante (plus récent en premier)
    const dateFinA = a.dateFin ? new Date(a.dateFin).getTime() : 0;
    const dateFinB = b.dateFin ? new Date(b.dateFin).getTime() : 0;
    return dateFinB - dateFinA;
  });
  const selectedDiplomes = (formData.diplomeIds || [])
    .map((id) => diplomes.find((d) => d._id === id))
    .filter(Boolean);

  return (
    <Box sx={{ py: 2 }}>
      {/* Informations personnelles */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircleIcon color="success" />
          Informations personnelles
        </Typography>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Matricule</Typography>
            <Typography variant="body1" fontWeight={600}>{formData.matricule || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Nom complet</Typography>
            <Typography variant="body1" fontWeight={600}>
              {formData.nom} {formData.prenom}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Date de naissance</Typography>
            <Typography variant="body1" fontWeight={600}>
              {formData.dateNaissance
                ? new Date(formData.dateNaissance).toLocaleDateString('fr-FR')
                : '-'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Sexe</Typography>
            <Typography variant="body1" fontWeight={600}>
              {formData.sexe === 'M'
                ? 'Masculin'
                : formData.sexe === 'F'
                ? 'Féminin'
                : formData.sexe || '-'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Email</Typography>
            <Typography variant="body1" fontWeight={600}>{formData.email || '-'}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Téléphone</Typography>
            <Typography variant="body1" fontWeight={600}>{formData.telephone || '-'}</Typography>
          </Grid>
          {selectedStatut && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Statut</Typography>
              <Typography variant="body1" fontWeight={600}>
                {selectedStatut.libelle}
              </Typography>
            </Grid>
          )}
          {photoPreview && (
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Photo
              </Typography>
              <Avatar src={photoPreview} sx={{ width: 100, height: 100 }} />
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Informations familiales */}
      {(formData.conjoints?.length > 0 || formData.enfants?.length > 0) && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Famille</Typography>
          <Divider sx={{ my: 2 }} />
          {formData.conjoints?.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Conjoints ({formData.conjoints.length})
              </Typography>
              <List dense>
                {formData.conjoints.map((c, i) => (
                  <ListItem key={i}>
                    <ListItemText primary={`${c.nom} ${c.prenom}`} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          {formData.enfants?.length > 0 && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Enfants ({formData.enfants.length})
              </Typography>
              <List dense>
                {formData.enfants.map((e, i) => (
                  <ListItem key={i}>
                    <ListItemText primary={`${e.nom} ${e.prenom}`} />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Paper>
      )}

      {/* Informations professionnelles */}
      <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>Informations professionnelles</Typography>
        <Divider sx={{ my: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Date d'embauche</Typography>
            <Typography variant="body1" fontWeight={600}>
              {formData.dateEmbauche
                ? new Date(formData.dateEmbauche).toLocaleDateString('fr-FR')
                : '-'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Grade</Typography>
            <Typography variant="body1" fontWeight={600}>
              {selectedGrade?.libelle || '-'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Statut</Typography>
            <Typography variant="body1" fontWeight={600}>
              {selectedStatut?.libelle || '-'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Direction</Typography>
            <Typography variant="body1" fontWeight={600}>
              {selectedDirection?.libelle || '-'}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" color="text.secondary">Service</Typography>
            <Typography variant="body1" fontWeight={600}>
              {selectedService?.libelle || '-'}
            </Typography>
          </Grid>
          {selectedLocalisation && (
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">Localisation actuelle</Typography>
              <Typography variant="body1" fontWeight={600}>
                {selectedLocalisation.libelle}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Affectations de postes */}
      {affectationsPostes.length > 0 && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Affectations de postes</Typography>
          <Divider sx={{ my: 2 }} />
          {affectationsActuelles.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="success.main" gutterBottom sx={{ fontWeight: 600 }}>
                Postes actuels ({affectationsActuelles.length})
              </Typography>
              <List dense>
                {affectationsActuelles.map((aff, i) => (
                  <ListItem key={i}>
                    <ListItemText
                      primary={aff.poste?.intitule || '-'}
                      secondary={`Depuis le ${new Date(aff.dateDebut).toLocaleDateString('fr-FR')}`}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
          {affectationsPassees.length > 0 && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom sx={{ fontWeight: 600 }}>
                Historique ({affectationsPassees.length})
              </Typography>
              <List dense>
                {affectationsPassees.map((aff, i) => (
                  <ListItem key={i}>
                    <ListItemText
                      primary={aff.poste?.intitule || '-'}
                      secondary={
                        <Box>
                          <Typography variant="caption" display="block">
                            Du {new Date(aff.dateDebut).toLocaleDateString('fr-FR')} au{' '}
                            {aff.dateFin ? new Date(aff.dateFin).toLocaleDateString('fr-FR') : '-'}
                          </Typography>
                          {aff.motifFin && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              Motif: {aff.motifFin}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Paper>
      )}

      {/* Diplômes et compétences */}
      {(selectedDiplomes.length > 0 || formData.competences?.length > 0) && (
        <Paper variant="outlined" sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Diplômes et compétences</Typography>
          <Divider sx={{ my: 2 }} />
          {selectedDiplomes.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Diplômes ({selectedDiplomes.length})
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {selectedDiplomes.map((diplome) => (
                  <Chip key={diplome._id} label={diplome.libelle} size="small" />
                ))}
              </Box>
            </Box>
          )}
          {formData.competences?.length > 0 && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Compétences ({formData.competences.length})
              </Typography>
              <List dense>
                {formData.competences.map((competence, i) => (
                  <ListItem key={i}>
                    <ListItemText
                      primary={competence.nom}
                      secondary={
                        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                          <Chip
                            label={competence.categorie}
                            size="small"
                            color={
                              competence.categorie === 'A'
                                ? 'primary'
                                : competence.categorie === 'B'
                                ? 'info'
                                : 'default'
                            }
                          />
                          {competence.niveau && (
                            <Chip label={competence.niveau} size="small" variant="outlined" />
                          )}
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Paper>
      )}

      <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
        <Typography variant="body2" color="info.dark">
          <strong>Vérifiez attentivement toutes les informations avant de créer l'agent.</strong>
          <br />
          Une fois créé, l'agent pourra être utilisé dans le système.
        </Typography>
      </Box>
    </Box>
  );
}

