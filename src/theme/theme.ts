import { createTheme, PaletteMode } from '@mui/material';

export const getCustomTheme = (mode: PaletteMode = 'dark') => createTheme({
  palette: {
    mode,
    primary: {
      main: '#00C9A7', // Emerald Medical Teal
      light: '#33D4B8',
      dark: '#00967D',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#6C5CE7', // Deep Electric Indigo
      light: '#8F82F0',
      dark: '#4834D4',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#FF4D6D',
      light: '#FF758F',
      dark: '#C71F3D',
    },
    warning: {
      main: '#FFB703',
      light: '#FFC533',
      dark: '#CC9200',
    },
    info: {
      main: '#00B4D8',
      light: '#33C3E0',
      dark: '#00839E',
    },
    success: {
      main: '#06D6A0',
    },
    background: {
      default: mode === 'dark' ? '#0A0F1D' : '#F4F7FB',
      paper: mode === 'dark' ? 'rgba(16, 24, 44, 0.75)' : '#FFFFFF',
    },
    text: {
      primary: mode === 'dark' ? '#F0F4FC' : '#1E293B',
      secondary: mode === 'dark' ? '#94A3B8' : '#64748B',
    },
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 800,
      letterSpacing: '-0.02em',
    },
    h5: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h6: {
      fontWeight: 700,
    },
    subtitle1: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 700,
      borderRadius: '12px',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(16px)',
          border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
          boxShadow: mode === 'dark'
            ? '0 10px 30px -5px rgba(0, 0, 0, 0.5)'
            : '0 10px 30px -5px rgba(0, 100, 150, 0.08)',
          backgroundImage: 'none',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 22px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 6px 20px rgba(0, 201, 167, 0.3)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #00C9A7 0%, #00967D 100%)',
        },
        containedSecondary: {
          background: 'linear-gradient(135deg, #6C5CE7 0%, #4834D4 100%)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
  },
});
