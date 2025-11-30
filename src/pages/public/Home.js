import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SearchIcon from '@mui/icons-material/Search';
import LoginIcon from '@mui/icons-material/Login';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import DescriptionIcon from '@mui/icons-material/Description';
import WorkIcon from '@mui/icons-material/Work';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

export default function Home() {
  const navigate = useNavigate();

  // Icônes pour le fond mosaïque
  const icons = [
    { Icon: BusinessIcon, size: 50, opacity: 0.15 },
    { Icon: PeopleIcon, size: 45, opacity: 0.15 },
    { Icon: DescriptionIcon, size: 48, opacity: 0.15 },
    { Icon: WorkIcon, size: 46, opacity: 0.15 },
    { Icon: LocationOnIcon, size: 44, opacity: 0.15 },
    { Icon: CheckCircleIcon, size: 42, opacity: 0.15 },
    { Icon: TrendingUpIcon, size: 47, opacity: 0.15 },
    { Icon: AccountBalanceIcon, size: 49, opacity: 0.15 },
    { Icon: AssignmentIcon, size: 45, opacity: 0.15 },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'white',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        overflow: 'hidden',
      }}
    >
      {/* Bouton Se connecter en haut à droite */}
      <Box
        sx={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 1000,
        }}
      >
        <Button
          variant="contained"
          startIcon={<LoginIcon />}
          onClick={() => navigate('/auth/login')}
          sx={{
            backgroundColor: '#0f766e',
            color: 'white',
            px: 3,
            py: 1,
            fontSize: '1rem',
            fontWeight: 600,
            boxShadow: '0 2px 8px rgba(15, 118, 110, 0.3)',
            '&:hover': {
              backgroundColor: '#115e59',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(15, 118, 110, 0.4)',
            },
            transition: 'all 0.3s ease',
          }}
        >
          Se connecter
        </Button>
      </Box>

      {/* Fond mosaïque avec icônes */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gridTemplateRows: 'repeat(8, 1fr)',
          gap: { xs: 2, md: 4 },
          padding: { xs: 2, md: 4 },
          zIndex: 0,
        }}
      >
        {Array.from({ length: 48 }).map((_, index) => {
          const iconData = icons[index % icons.length];
          const Icon = iconData.Icon;
          const rotation = Math.random() * 20 - 10;
          const delay = Math.random() * 2;
          const duration = 3 + Math.random() * 2; // 3-5 secondes
          const pulseDelay = Math.random() * 2;
          const pulseDuration = 2 + Math.random() * 2; // 2-4 secondes
          
          return (
            <Box
              key={index}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0f766e',
                opacity: iconData.opacity,
                transform: `rotate(${rotation}deg)`,
                animation: `floatIcon ${duration}s ease-in-out infinite, pulseIcon ${pulseDuration}s ease-in-out infinite`,
                animationDelay: `${delay}s, ${pulseDelay}s`,
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  opacity: iconData.opacity * 3,
                  transform: `rotate(${rotation + 20}deg) scale(1.3)`,
                  color: '#115e59',
                  animationPlayState: 'paused',
                },
                '@keyframes floatIcon': {
                  '0%, 100%': {
                    transform: `rotate(${rotation}deg) translateY(0px)`,
                  },
                  '50%': {
                    transform: `rotate(${rotation + 5}deg) translateY(-15px)`,
                  },
                },
              }}
            >
              <Icon sx={{ fontSize: iconData.size }} />
            </Box>
          );
        })}
      </Box>
      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Box
          sx={{
            textAlign: 'center',
            color: '#0f766e',
            mb: 6,
          }}
        >
          <Box
            component="img"
            src="/dncf.jpg"
            alt="DNCF"
            sx={{
              height: 80,
              width: 'auto',
              mb: 4,
              display: 'block',
              mx: 'auto',
            }}
          />
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 700,
              mb: 2,
              fontSize: { xs: '2rem', md: '3rem' },
            }}
          >
            GESMUT
          </Typography>
          <Typography
            variant="h5"
            sx={{
              mb: 4,
              opacity: 0.9,
              fontSize: { xs: '1.1rem', md: '1.5rem' },
            }}
          >
            Gestion des Mutations
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 6,
              opacity: 0.8,
              fontSize: { xs: '1rem', md: '1.2rem' },
              maxWidth: '600px',
              mx: 'auto',
            }}
          >
            Système de gestion des mutations de personnel au sein de la DNCF
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Button
            variant="contained"
            size="large"
            startIcon={<AssignmentIcon />}
            onClick={() => navigate('/demande')}
            sx={{
              backgroundColor: '#0f766e',
              color: 'white',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#115e59',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(15, 118, 110, 0.3)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Faire une demande de mutation
          </Button>

          <Button
            variant="contained"
            size="large"
            startIcon={<SearchIcon />}
            onClick={() => navigate('/suivi')}
            sx={{
              backgroundColor: '#0f766e',
              color: 'white',
              px: 4,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#115e59',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(15, 118, 110, 0.3)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            Suivre ma demande
          </Button>
        </Box>

        <Box
          sx={{
            mt: 8,
            textAlign: 'center',
            color: '#0f766e',
            opacity: 0.7,
          }}
        >
          <Typography variant="body2">
            Copyright © 2025 DNCF. Tous droits réservés.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}

