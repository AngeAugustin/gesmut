import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import BusinessIcon from '@mui/icons-material/Business';
import VerifiedIcon from '@mui/icons-material/Verified';
import GavelIcon from '@mui/icons-material/Gavel';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { workflowService } from '../../services/workflowService';

export default function AdminWorkflow() {
  const [workflow, setWorkflow] = useState(null);

  useEffect(() => {
    fetchWorkflow();
  }, []);

  const fetchWorkflow = async () => {
    try {
      const response = await workflowService.getActiveWorkflow();
      setWorkflow(response.data);
    } catch (error) {
      console.error('Erreur', error);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4">Gestion du Workflow</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Le workflow par défaut du système est utilisé. Vous pouvez gérer les règles métiers et prérequis ci-dessous.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Workflow actif
              </Typography>
              <Box>
                {workflow && (
                  <>
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      <strong>Nom:</strong> {workflow.nom || 'Workflow par défaut'}
                    </Typography>
                    {workflow.description && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {workflow.description}
                      </Typography>
                    )}
                  </>
                )}
                
                <Typography variant="subtitle1" sx={{ mb: 2, mt: workflow ? 2 : 0, fontWeight: 600 }}>
                  Étapes du workflow par défaut
                </Typography>

                {/* Workflow visuel */}
                <Box sx={{ position: 'relative', py: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: { xs: 'wrap', md: 'nowrap' },
                      gap: { xs: 2, md: 1 },
                    }}
                  >
                    {/* Étape 1: Validation hiérarchique */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: { xs: '100%', md: 'auto' } }}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: '50%',
                          bgcolor: 'primary.main',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: 2,
                          mb: 1,
                          position: 'relative',
                        }}
                      >
                        <PersonIcon sx={{ fontSize: 28 }} />
                        <Box
                          sx={{
                            position: 'absolute',
                            top: -6,
                            right: -6,
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: 'primary.dark',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                          }}
                        >
                          1
                        </Box>
                      </Box>
                      <Typography variant="body2" fontWeight="600" textAlign="center" sx={{ fontSize: '0.875rem' }}>
                        Validation hiérarchique
                      </Typography>
                      <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ mt: 0.25, fontSize: '0.7rem' }}>
                        Responsable
                      </Typography>
                    </Box>

                    {/* Flèche */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', mx: 0.5 }}>
                      <ArrowForwardIcon sx={{ fontSize: 28, color: 'primary.main' }} />
                    </Box>
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, width: '100%', justifyContent: 'center', my: 0.5 }}>
                      <ArrowForwardIcon sx={{ fontSize: 28, color: 'primary.main', transform: 'rotate(90deg)' }} />
                    </Box>

                    {/* Étape 2: Étude DGR */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: { xs: '100%', md: 'auto' } }}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: '50%',
                          bgcolor: 'info.main',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: 2,
                          mb: 1,
                          position: 'relative',
                        }}
                      >
                        <BusinessIcon sx={{ fontSize: 28 }} />
                        <Box
                          sx={{
                            position: 'absolute',
                            top: -6,
                            right: -6,
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: 'info.dark',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                          }}
                        >
                          2
                        </Box>
                      </Box>
                      <Typography variant="body2" fontWeight="600" textAlign="center" sx={{ fontSize: '0.875rem' }}>
                        Étude DGR
                      </Typography>
                      <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ mt: 0.25, fontSize: '0.7rem' }}>
                        Direction Générale
                      </Typography>
                    </Box>

                    {/* Flèche */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', mx: 0.5 }}>
                      <ArrowForwardIcon sx={{ fontSize: 28, color: 'info.main' }} />
                    </Box>
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, width: '100%', justifyContent: 'center', my: 0.5 }}>
                      <ArrowForwardIcon sx={{ fontSize: 28, color: 'info.main', transform: 'rotate(90deg)' }} />
                    </Box>

                    {/* Étape 3: Vérification CVR */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: { xs: '100%', md: 'auto' } }}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: '50%',
                          bgcolor: 'warning.main',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: 2,
                          mb: 1,
                          position: 'relative',
                        }}
                      >
                        <VerifiedIcon sx={{ fontSize: 28 }} />
                        <Box
                          sx={{
                            position: 'absolute',
                            top: -6,
                            right: -6,
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: 'warning.dark',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                          }}
                        >
                          3
                        </Box>
                      </Box>
                      <Typography variant="body2" fontWeight="600" textAlign="center" sx={{ fontSize: '0.875rem' }}>
                        Vérification CVR
                      </Typography>
                      <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ mt: 0.25, fontSize: '0.7rem' }}>
                        Cellule de Vérification
                      </Typography>
                    </Box>

                    {/* Flèche */}
                    <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', mx: 0.5 }}>
                      <ArrowForwardIcon sx={{ fontSize: 28, color: 'warning.main' }} />
                    </Box>
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, width: '100%', justifyContent: 'center', my: 0.5 }}>
                      <ArrowForwardIcon sx={{ fontSize: 28, color: 'warning.main', transform: 'rotate(90deg)' }} />
                    </Box>

                    {/* Étape 4: Décision DNCF */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: { xs: '100%', md: 'auto' } }}>
                      <Box
                        sx={{
                          width: 56,
                          height: 56,
                          borderRadius: '50%',
                          bgcolor: 'success.main',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: 2,
                          mb: 1,
                          position: 'relative',
                        }}
                      >
                        <GavelIcon sx={{ fontSize: 28 }} />
                        <Box
                          sx={{
                            position: 'absolute',
                            top: -6,
                            right: -6,
                            width: 24,
                            height: 24,
                            borderRadius: '50%',
                            bgcolor: 'success.dark',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                          }}
                        >
                          4
                        </Box>
                      </Box>
                      <Typography variant="body2" fontWeight="600" textAlign="center" sx={{ fontSize: '0.875rem' }}>
                        Décision DNCF
                      </Typography>
                      <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ mt: 0.25, fontSize: '0.7rem' }}>
                        Décision finale
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Alert severity="info" sx={{ mt: 3 }}>
                  Le workflow est fixe et ne peut pas être modifié.
                </Alert>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>


    </Box>
  );
}

