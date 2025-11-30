import { createTheme } from '@mui/material/styles';
import { frFR } from '@mui/material/locale';

// Palette de couleurs premium avec teal comme couleur principale
const colors = {
  primary: {
    main: '#0f766e', // Teal-700 - couleur principale
    light: '#0d9488', // Teal-600
    dark: '#115e59', // Teal-800
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#EC4899', // Rose moderne
    light: '#F472B6',
    dark: '#DB2777',
    contrastText: '#FFFFFF',
  },
  success: {
    main: '#10B981',
    light: '#34D399',
    dark: '#059669',
  },
  warning: {
    main: '#F59E0B',
    light: '#FBBF24',
    dark: '#D97706',
  },
  error: {
    main: '#EF4444',
    light: '#F87171',
    dark: '#DC2626',
  },
  info: {
    main: '#3B82F6',
    light: '#60A5FA',
    dark: '#2563EB',
  },
  background: {
    default: '#F8FAFC',
    paper: '#FFFFFF',
  },
  text: {
    primary: '#1E293B',
    secondary: '#64748B',
  },
};

export const premiumTheme = createTheme(
  {
    palette: {
      mode: 'light',
      ...colors,
    },
    typography: {
      fontFamily: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      h1: {
        fontSize: '2.5rem',
        fontWeight: 700,
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 700,
        lineHeight: 1.3,
        letterSpacing: '-0.01em',
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.5,
      },
      h6: {
        fontSize: '1.125rem',
        fontWeight: 600,
        lineHeight: 1.5,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
        letterSpacing: '0.01em',
      },
    },
    shape: {
      borderRadius: 12,
    },
    shadows: [
      'none',
      '0px 1px 2px rgba(0, 0, 0, 0.05)',
      '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
      '0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)',
      '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)',
      '0px 20px 25px -5px rgba(0, 0, 0, 0.1), 0px 10px 10px -5px rgba(0, 0, 0, 0.04)',
      '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
      '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
    ],
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: '10px 24px',
            fontSize: '0.9375rem',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.1)',
            },
          },
          contained: {
            background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
            '&:hover': {
              background: `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.primary.main} 100%)`,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              boxShadow: '0px 10px 15px -3px rgba(0, 0, 0, 0.1), 0px 4px 6px -2px rgba(0, 0, 0, 0.05)',
              transform: 'translateY(-2px)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundImage: 'none',
          },
          elevation1: {
            boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 10,
              transition: 'all 0.2s',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: colors.primary.main,
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderWidth: 2,
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 500,
            fontSize: '0.75rem',
            height: 28,
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-head': {
              fontWeight: 600,
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: colors.text.secondary,
              backgroundColor: colors.background.default,
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderColor: '#E2E8F0',
            padding: '16px',
          },
        },
      },
    },
  },
  frFR
);

