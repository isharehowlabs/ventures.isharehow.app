import { createTheme } from '@mui/material/styles';

const getTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode,
    primary: {
      main: '#4ecdc4', // Teal/turquoise brand color
      light: '#7eddd6',
      dark: '#3ba99f',
      contrastText: '#fff',
    },
    secondary: {
      main: '#ff6b6b', // Complementary coral
      light: '#ff9393',
      dark: '#cc5555',
      contrastText: '#fff',
    },
    background: {
      default: mode === 'light' ? '#f8f9fa' : '#0f172a',
      paper: mode === 'light' ? '#ffffff' : '#1e293b',
    },
    text: {
      primary: mode === 'light' ? '#1a202c' : '#f7fafc',
      secondary: mode === 'light' ? '#4a5568' : '#cbd5e0',
    },
    divider: mode === 'light' ? '#e2e8f0' : '#334155',
    success: {
      main: '#10b981',
      light: '#34d399',
      dark: '#059669',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '2.5rem',
      letterSpacing: -1.5,
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      letterSpacing: -0.5,
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 700,
      fontSize: '1.75rem',
      letterSpacing: 0,
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      letterSpacing: 0.25,
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      letterSpacing: 0,
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      letterSpacing: 0.15,
      lineHeight: 1.6,
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1rem',
      letterSpacing: 0.15,
      lineHeight: 1.75,
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.875rem',
      letterSpacing: 0.1,
      lineHeight: 1.57,
    },
    body1: {
      fontWeight: 400,
      fontSize: '1rem',
      letterSpacing: 0.5,
      lineHeight: 1.5,
    },
    body2: {
      fontWeight: 400,
      fontSize: '0.875rem',
      letterSpacing: 0.25,
      lineHeight: 1.43,
    },
    button: {
      fontWeight: 600,
      fontSize: '0.875rem',
      letterSpacing: 0.5,
      textTransform: 'none',
    },
    caption: {
      fontWeight: 400,
      fontSize: '0.75rem',
      letterSpacing: 0.4,
      lineHeight: 1.66,
    },
    overline: {
      fontWeight: 600,
      fontSize: '0.75rem',
      letterSpacing: 1,
      lineHeight: 2.66,
      textTransform: 'uppercase',
    },
  },
  shadows: [
    'none',
    mode === 'light' ? '0px 2px 4px rgba(78, 205, 196, 0.08)' : '0px 2px 4px rgba(0, 0, 0, 0.3)',
    mode === 'light' ? '0px 4px 8px rgba(78, 205, 196, 0.12)' : '0px 4px 8px rgba(0, 0, 0, 0.4)',
    mode === 'light' ? '0px 6px 12px rgba(78, 205, 196, 0.14)' : '0px 6px 12px rgba(0, 0, 0, 0.45)',
    mode === 'light' ? '0px 8px 16px rgba(78, 205, 196, 0.16)' : '0px 8px 16px rgba(0, 0, 0, 0.5)',
    mode === 'light' ? '0px 10px 20px rgba(78, 205, 196, 0.18)' : '0px 10px 20px rgba(0, 0, 0, 0.55)',
    mode === 'light' ? '0px 12px 24px rgba(78, 205, 196, 0.2)' : '0px 12px 24px rgba(0, 0, 0, 0.6)',
    mode === 'light' ? '0px 14px 28px rgba(78, 205, 196, 0.22)' : '0px 14px 28px rgba(0, 0, 0, 0.65)',
    mode === 'light' ? '0px 16px 32px rgba(78, 205, 196, 0.24)' : '0px 16px 32px rgba(0, 0, 0, 0.7)',
    mode === 'light' ? '0px 18px 36px rgba(78, 205, 196, 0.26)' : '0px 18px 36px rgba(0, 0, 0, 0.75)',
    mode === 'light' ? '0px 20px 40px rgba(78, 205, 196, 0.28)' : '0px 20px 40px rgba(0, 0, 0, 0.8)',
    mode === 'light' ? '0px 22px 44px rgba(78, 205, 196, 0.3)' : '0px 22px 44px rgba(0, 0, 0, 0.85)',
    mode === 'light' ? '0px 24px 48px rgba(78, 205, 196, 0.32)' : '0px 24px 48px rgba(0, 0, 0, 0.9)',
    mode === 'light' ? '0px 26px 52px rgba(78, 205, 196, 0.34)' : '0px 26px 52px rgba(0, 0, 0, 0.92)',
    mode === 'light' ? '0px 28px 56px rgba(78, 205, 196, 0.36)' : '0px 28px 56px rgba(0, 0, 0, 0.94)',
    mode === 'light' ? '0px 30px 60px rgba(78, 205, 196, 0.38)' : '0px 30px 60px rgba(0, 0, 0, 0.96)',
    mode === 'light' ? '0px 32px 64px rgba(78, 205, 196, 0.4)' : '0px 32px 64px rgba(0, 0, 0, 0.98)',
    mode === 'light' ? '0px 34px 68px rgba(78, 205, 196, 0.42)' : '0px 34px 68px rgba(0, 0, 0, 1)',
    mode === 'light' ? '0px 36px 72px rgba(78, 205, 196, 0.44)' : '0px 36px 72px rgba(0, 0, 0, 1)',
    mode === 'light' ? '0px 38px 76px rgba(78, 205, 196, 0.46)' : '0px 38px 76px rgba(0, 0, 0, 1)',
    mode === 'light' ? '0px 40px 80px rgba(78, 205, 196, 0.48)' : '0px 40px 80px rgba(0, 0, 0, 1)',
    mode === 'light' ? '0px 42px 84px rgba(78, 205, 196, 0.5)' : '0px 42px 84px rgba(0, 0, 0, 1)',
    mode === 'light' ? '0px 44px 88px rgba(78, 205, 196, 0.52)' : '0px 44px 88px rgba(0, 0, 0, 1)',
    mode === 'light' ? '0px 46px 92px rgba(78, 205, 196, 0.54)' : '0px 46px 92px rgba(0, 0, 0, 1)',
    mode === 'light' ? '0px 48px 96px rgba(78, 205, 196, 0.56)' : '0px 48px 96px rgba(0, 0, 0, 1)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarColor: mode === 'light' ? '#4ecdc4 #f8f9fa' : '#4ecdc4 #0f172a',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: 8,
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: '#4ecdc4',
            minHeight: 24,
          },
          '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
            backgroundColor: mode === 'light' ? '#f8f9fa' : '#0f172a',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: mode === 'light' 
            ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
            : '0 1px 3px 0 rgba(0, 0, 0, 0.5)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: mode === 'light' 
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            : '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          fontWeight: 600,
        },
        contained: {
          boxShadow: mode === 'light'
            ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
            : '0 1px 3px 0 rgba(0, 0, 0, 0.5)',
          '&:hover': {
            boxShadow: mode === 'light'
              ? '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              : '0 4px 6px -1px rgba(0, 0, 0, 0.6)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        elevation1: {
          boxShadow: mode === 'light'
            ? '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
            : '0 1px 3px 0 rgba(0, 0, 0, 0.5)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: mode === 'light' ? '1px solid #e2e8f0' : '1px solid #334155',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          '&.Mui-selected': {
            backgroundColor: mode === 'light' ? 'rgba(78, 205, 196, 0.12)' : 'rgba(78, 205, 196, 0.24)',
            '&:hover': {
              backgroundColor: mode === 'light' ? 'rgba(78, 205, 196, 0.18)' : 'rgba(78, 205, 196, 0.32)',
            },
          },
          '&:hover': {
            backgroundColor: mode === 'light' ? 'rgba(78, 205, 196, 0.08)' : 'rgba(78, 205, 196, 0.16)',
          },
        },
      },
    },
  },
});

export default getTheme;
