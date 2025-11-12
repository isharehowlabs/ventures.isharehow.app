import { createTheme } from '@mui/material/styles';

const getTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode,
    primary: {
      main: '#2563eb', // iShareHowLabs blue
      contrastText: '#fff',
    },
    secondary: {
      main: '#0ea5e9', // Accent blue
      contrastText: '#fff',
    },
    background: {
      default: mode === 'light' ? '#f4f6fa' : '#0f172a', // Soft gray / dark slate
      paper: mode === 'light' ? '#fff' : '#1e293b',
    },
    text: {
      primary: mode === 'light' ? '#1e293b' : '#f1f5f9',
      secondary: mode === 'light' ? '#64748b' : '#94a3b8',
    },
    divider: mode === 'light' ? '#e2e8f0' : '#334155',
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    h2: { fontWeight: 800, letterSpacing: -1 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 500 },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: mode === 'light' ? '0 4px 24px 0 rgba(30,41,59,0.08)' : '0 4px 24px 0 rgba(0,0,0,0.3)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
  },
});

export default getTheme;
