import React from 'react';
import { Chip } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledChip = styled(Chip)(({ theme, status }) => {
  const statusColors = {
    success: {
      bg: theme.palette.success.main + '15',
      color: theme.palette.success.dark,
      border: theme.palette.success.main + '30',
    },
    warning: {
      bg: theme.palette.warning.main + '15',
      color: theme.palette.warning.dark,
      border: theme.palette.warning.main + '30',
    },
    error: {
      bg: theme.palette.error.main + '15',
      color: theme.palette.error.dark,
      border: theme.palette.error.main + '30',
    },
    info: {
      bg: theme.palette.info.main + '15',
      color: theme.palette.info.dark,
      border: theme.palette.info.main + '30',
    },
    default: {
      bg: theme.palette.grey[100],
      color: theme.palette.grey[700],
      border: theme.palette.grey[300],
    },
  };

  const colors = statusColors[status] || statusColors.default;

  return {
    backgroundColor: colors.bg,
    color: colors.color,
    border: `1px solid ${colors.border}`,
    fontWeight: 600,
    fontSize: '0.75rem',
    height: 28,
    borderRadius: 8,
    '& .MuiChip-label': {
      padding: '0 10px',
    },
  };
});

const statusMap = {
  BROUILLON: 'default',
  SOUMISE: 'info',
  INELIGIBLE: 'warning', // Demande acceptée mais inéligible
  EN_VALIDATION_HIERARCHIQUE: 'warning',
  VALIDEE_HIERARCHIQUE: 'success',
  EN_ETUDE_DGR: 'warning',
  AVIS_DGR_FAVORABLE: 'success',
  AVIS_DGR_DEFAVORABLE: 'error',
  EN_VERIFICATION_CVR: 'warning',
  VALIDEE_CVR: 'success',
  REJETEE_CVR: 'error',
  EN_ETUDE_DNCF: 'warning',
  ACCEPTEE: 'success',
  REJETEE: 'error',
  REJETEE_HIERARCHIQUE: 'error',
  LIBRE: 'success',
  OCCUPE: 'error',
  ACTIF: 'success',
  INACTIF: 'default',
};

export default function StatusChip({ status, label }) {
  const mappedStatus = statusMap[status] || 'default';
  return <StyledChip label={label || status} status={mappedStatus} size="small" />;
}

