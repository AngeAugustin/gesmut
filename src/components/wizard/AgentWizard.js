import React from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Paper,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  FamilyRestroom as FamilyIcon,
  Work as WorkIcon,
  School as SchoolIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

const steps = [
  {
    label: 'Informations personnelles',
    icon: <PersonIcon />,
    description: 'Identité et coordonnées de l\'agent',
  },
  {
    label: 'Informations familiales',
    icon: <FamilyIcon />,
    description: 'Conjoints et enfants',
  },
  {
    label: 'Informations professionnelles',
    icon: <WorkIcon />,
    description: 'Grade, statut, poste et localisation',
  },
  {
    label: 'Diplômes et compétences',
    icon: <SchoolIcon />,
    description: 'Formation et compétences de l\'agent',
  },
  {
    label: 'Récapitulatif',
    icon: <CheckCircleIcon />,
    description: 'Vérification avant création',
  },
];

export default function AgentWizard({
  activeStep = 0,
  onStepChange,
  onNext,
  onBack,
  onSubmit,
  loading = false,
  canProceed = true,
  children,
  showNavigation = true,
  isEditMode = false,
}) {
  const handleNext = () => {
    if (onNext) {
      onNext();
    } else if (onStepChange) {
      onStepChange(Math.min(activeStep + 1, steps.length - 1));
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (onStepChange) {
      onStepChange(Math.max(activeStep - 1, 0));
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
            {isEditMode ? 'Modifier l\'agent' : 'Ajouter un nouvel agent'}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {isEditMode 
              ? 'Modifiez les informations de l\'agent dans les étapes ci-dessous'
              : 'Remplissez toutes les étapes pour créer le profil de l\'agent'}
          </Typography>
        </Box>

        {/* Stepper horizontal */}
        <Box sx={{ mb: 4, overflowX: 'auto', px: 2 }}>
          <Stepper activeStep={activeStep} orientation="horizontal" sx={{ minWidth: 800 }}>
            {steps.map((step, index) => (
              <Step key={step.label} completed={index < activeStep} active={index === activeStep}>
                <StepLabel
                  StepIconComponent={() => (
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: index < activeStep ? 'success.main' : index === activeStep ? 'primary.main' : 'grey.300',
                        color: index <= activeStep ? 'white' : 'grey.600',
                        fontWeight: 'bold',
                        fontSize: '1.2rem',
                      }}
                    >
                      {index < activeStep ? <CheckCircleIcon /> : step.icon}
                    </Box>
                  )}
                >
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      fontWeight: index === activeStep ? 700 : 500, 
                      fontSize: { xs: '0.75rem', sm: '0.875rem' },
                      textAlign: 'center',
                    }}
                  >
                    {step.label}
                  </Typography>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Contenu de l'étape active */}
        <Box sx={{ mt: 4, mb: 4, minHeight: 300 }}>
          {children}
        </Box>

        {/* Navigation */}
        {showNavigation && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              pt: 4,
              borderTop: 1,
              borderColor: 'divider',
            }}
          >
            <Button
              disabled={activeStep === 0 || loading}
              onClick={handleBack}
              variant="outlined"
              size="large"
            >
              Précédent
            </Button>

            <Box sx={{ display: 'flex', gap: 2 }}>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  size="large"
                  onClick={onSubmit}
                  disabled={loading || !canProceed}
                  sx={{ minWidth: 150 }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} color="inherit" />
                      <span>{isEditMode ? 'Modification...' : 'Création...'}</span>
                    </Box>
                  ) : (
                    isEditMode ? 'Modifier l\'agent' : 'Créer l\'agent'
                  )}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleNext}
                  disabled={!canProceed || loading}
                  sx={{ minWidth: 150 }}
                >
                  Suivant
                </Button>
              )}
            </Box>
          </Box>
        )}

        {/* Progress indicator */}
        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Étape {activeStep + 1} sur {steps.length}
          </Typography>
          <Box
            sx={{
              width: '100%',
              height: 4,
              bgcolor: 'grey.200',
              borderRadius: 2,
              mt: 1,
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                width: `${((activeStep + 1) / steps.length) * 100}%`,
                height: '100%',
                bgcolor: 'primary.main',
                transition: 'width 0.3s ease',
              }}
            />
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}

