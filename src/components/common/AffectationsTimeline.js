import React from 'react';
import {
  Box,
  Typography,
  Chip,
  Stack,
} from '@mui/material';
import WorkIcon from '@mui/icons-material/Work';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

export default function AffectationsTimeline({ affectationsPostes = [] }) {
  // Fonction pour obtenir le nom du poste
  const getPosteNom = (aff) => {
    if (typeof aff.posteId === 'object' && aff.posteId !== null) {
      if (aff.posteId.intitule) {
        return aff.posteId.intitule;
      }
      if (aff.posteId.description) {
        return aff.posteId.description;
      }
      if (aff.posteId._id) {
        return 'Poste (ID: ' + aff.posteId._id.toString() + ')';
      }
      return 'Poste (ID: ' + aff.posteId.toString() + ')';
    }
    if (typeof aff.posteId === 'string') {
      return 'Poste (ID: ' + aff.posteId + ')';
    }
    return 'Poste non trouvé';
  };

  // Trier toutes les affectations par date de début (plus récente en premier pour l'affichage)
  const affectationsTriees = [...affectationsPostes].sort((a, b) => {
    const dateA = new Date(a.dateDebut).getTime();
    const dateB = new Date(b.dateDebut).getTime();
    return dateB - dateA; // Plus récent en premier
  });

  // Séparer les affectations actuelles et passées
  const affectationsActuelles = affectationsTriees.filter((aff) => !aff.dateFin);
  const affectationsPassees = affectationsTriees.filter((aff) => aff.dateFin);

  // Combiner : actuelles d'abord, puis passées (toutes triées du plus récent au plus ancien)
  const toutesAffectations = [...affectationsActuelles, ...affectationsPassees];

  if (toutesAffectations.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Aucune affectation de poste enregistrée
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 1 }}>
      <Stack spacing={1}>
        {toutesAffectations.map((aff, index) => {
          const posteNom = getPosteNom(aff);
          const dateDebut = new Date(aff.dateDebut).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          });
          const dateFin = aff.dateFin 
            ? new Date(aff.dateFin).toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              })
            : null;
          const isActuel = !aff.dateFin;

          return (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                borderRadius: 1,
                bgcolor: isActuel ? 'success.light' : 'background.paper',
                borderLeft: `3px solid ${isActuel ? 'success.main' : 'primary.main'}`,
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: isActuel ? 'success.light' : 'action.hover',
                },
              }}
            >
              {/* Point indicateur */}
              <Box
                sx={{
                  minWidth: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: isActuel ? 'success.main' : 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isActuel && (
                  <FiberManualRecordIcon sx={{ fontSize: 8, color: 'white' }} />
                )}
              </Box>

              {/* Nom du poste */}
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  minWidth: 200,
                  color: isActuel ? 'success.dark' : 'text.primary',
                }}
              >
                {posteNom}
              </Typography>

              {/* Dates */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                  Du {dateDebut}
                </Typography>
                {dateFin ? (
                  <>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                      au {dateFin}
                    </Typography>
                  </>
                ) : (
                  <Chip
                    label="En cours"
                    size="small"
                    color="success"
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                )}
              </Box>

              {/* Motif de fin */}
              {aff.motifFin && (
                <Chip
                  label={aff.motifFin}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 24 }}
                />
              )}
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}

