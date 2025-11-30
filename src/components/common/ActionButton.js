import React from 'react';
import { Button } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledButton = styled(Button)(({ theme, variant: btnVariant, color: btnColor }) => {
  const color = btnColor || 'primary';
  const isContained = btnVariant === 'contained';

  return {
    borderRadius: 10,
    padding: '10px 24px',
    fontSize: '0.9375rem',
    fontWeight: 600,
    textTransform: 'none',
    boxShadow: isContained
      ? `0px 4px 12px ${theme.palette[color]?.main || theme.palette.primary.main}30`
      : 'none',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: isContained
        ? `0px 8px 16px ${theme.palette[color]?.main || theme.palette.primary.main}40`
        : `0px 4px 8px rgba(0, 0, 0, 0.1)`,
    },
    '&:active': {
      transform: 'translateY(0)',
    },
    ...(isContained && {
      background: `linear-gradient(135deg, ${theme.palette[color]?.main || theme.palette.primary.main} 0%, ${theme.palette[color]?.dark || theme.palette.primary.dark} 100%)`,
      '&:hover': {
        background: `linear-gradient(135deg, ${theme.palette[color]?.dark || theme.palette.primary.dark} 0%, ${theme.palette[color]?.main || theme.palette.primary.main} 100%)`,
      },
    }),
  };
});

export default function ActionButton({ children, ...props }) {
  return <StyledButton {...props}>{children}</StyledButton>;
}

