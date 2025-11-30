import React from 'react';
import { Card, CardContent, Box, Typography, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme, color }) => ({
  position: 'relative',
  overflow: 'hidden',
  background: `linear-gradient(135deg, ${theme.palette[color]?.main || theme.palette.primary.main}15 0%, ${theme.palette[color]?.light || theme.palette.primary.light}08 100%)`,
  border: `1px solid ${theme.palette[color]?.main || theme.palette.primary.main}20`,
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    right: 0,
    width: '100px',
    height: '100px',
    background: `radial-gradient(circle, ${theme.palette[color]?.main || theme.palette.primary.main}20 0%, transparent 70%)`,
    borderRadius: '50%',
    transform: 'translate(30%, -30%)',
  },
}));

const IconWrapper = styled(Avatar)(({ theme, color }) => ({
  width: 56,
  height: 56,
  background: `linear-gradient(135deg, ${theme.palette[color]?.main || theme.palette.primary.main} 0%, ${theme.palette[color]?.dark || theme.palette.primary.dark} 100%)`,
  boxShadow: `0px 4px 12px ${theme.palette[color]?.main || theme.palette.primary.main}40`,
  marginBottom: theme.spacing(2),
}));

export default function StatCard({ title, value, icon: Icon, color = 'primary', subtitle, trend }) {
  return (
    <StyledCard color={color}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1, fontWeight: 500, fontSize: '0.8125rem' }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                mb: subtitle ? 0.5 : 0,
                background: `linear-gradient(135deg, ${color === 'primary' ? '#0f766e' : color === 'success' ? '#10B981' : color === 'warning' ? '#F59E0B' : '#EC4899'} 0%, ${color === 'primary' ? '#115e59' : color === 'success' ? '#059669' : color === 'warning' ? '#D97706' : '#DB2777'} 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Typography
                variant="caption"
                sx={{
                  mt: 1,
                  display: 'inline-block',
                  color: trend > 0 ? 'success.main' : 'error.main',
                  fontWeight: 600,
                }}
              >
                {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
              </Typography>
            )}
          </Box>
          {Icon && (
            <IconWrapper color={color}>
              <Icon sx={{ fontSize: 28, color: 'white' }} />
            </IconWrapper>
          )}
        </Box>
      </CardContent>
    </StyledCard>
  );
}

