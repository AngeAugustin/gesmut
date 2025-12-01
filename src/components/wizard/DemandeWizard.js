import React from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Button,
  Paper,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  Person as PersonIcon,
  FamilyRestroom as FamilyIcon,
  Description as DescriptionIcon,
  AttachFile as AttachFileIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

const steps = [
  {
    label: 'Informations personnelles',
    icon: <PersonIcon />,
    description: 'Vos informations de base et coordonnées',
  },
  {
    label: 'Famille',
    icon: <FamilyIcon />,
    description: 'Conjoints et enfants',
  },
  {
    label: 'Détails de la demande',
    icon: <DescriptionIcon />,
    description: 'Motif et préférences',
  },
  {
    label: 'Pièces justificatives',
    icon: <AttachFileIcon />,
    description: 'Documents à joindre',
  },
  {
    label: 'Récapitulatif',
    icon: <CheckCircleIcon />,
    description: 'Vérification avant envoi',
  },
];

export default function DemandeWizard({
  activeStep = 0,
  onStepChange,
  onNext,
  onBack,
  onSubmit,
  loading = false,
  canProceed = true,
  children,
  showNavigation = true,
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
            Demande de mutation
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Remplissez toutes les étapes pour soumettre votre demande
          </Typography>
        </Box>

        {/* Stepper */}
        <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 4 }}>
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
                <Typography variant="h6" sx={{ fontWeight: index === activeStep ? 700 : 500 }}>
                  {step.label}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                  {step.description}
                </Typography>
              </StepLabel>
              <StepContent>
                <Box sx={{ mt: 2, mb: 4, minHeight: 200 }}>
                  {index === activeStep && children}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>

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
                      <span>Envoi...</span>
                    </Box>
                  ) : (
                    'Soumettre la demande'
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
