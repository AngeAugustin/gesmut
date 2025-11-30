import React from 'react';
import { Box, Typography, Breadcrumbs, Link } from '@mui/material';
import { styled } from '@mui/material/styles';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const HeaderBox = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  paddingBottom: theme.spacing(3),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const Title = styled(Typography)(({ theme }) => ({
  fontWeight: 700,
  fontSize: '2rem',
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  marginBottom: theme.spacing(1),
}));

export default function PageHeader({ title, subtitle, breadcrumbs, action }) {
  return (
    <HeaderBox>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          {breadcrumbs && breadcrumbs.length > 0 && (
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" />}
              sx={{ mb: 2 }}
            >
              {breadcrumbs.map((crumb, index) =>
                index === breadcrumbs.length - 1 ? (
                  <Typography key={index} color="text.primary" sx={{ fontWeight: 500 }}>
                    {crumb.label}
                  </Typography>
                ) : (
                  <Link
                    key={index}
                    color="text.secondary"
                    href={crumb.href}
                    sx={{
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    {crumb.label}
                  </Link>
                )
              )}
            </Breadcrumbs>
          )}
          <Title variant="h4">{title}</Title>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && <Box>{action}</Box>}
      </Box>
    </HeaderBox>
  );
}

