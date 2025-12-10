import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// SaasAble Color Scheme - Exact Match
// Based on https://admin.saasable.io/dashboard/analytics/overview
export const saasableColors = {
  // Primary - Indigo
  primary: {
    main: '#6366f1',      // Indigo 500
    light: '#818cf8',     // Indigo 400
    dark: '#4f46e5',      // Indigo 600
    contrastText: '#ffffff',
  },
  
  // Backgrounds
  background: {
    default: '#f8f9fa',   // Light gray background
    paper: '#ffffff',     // White cards
  },
  
  // Text colors
  text: {
    primary: '#1e293b',   // Dark slate
    secondary: '#64748b', // Slate 500
    disabled: '#94a3b8',  // Slate 400
  },
  
  // Border colors
  border: {
    light: '#e2e8f0',     // Slate 200
    main: '#cbd5e1',      // Slate 300
  },
  
  // Status colors
  success: {
    main: '#10b981',      // Green 500
    light: '#34d399',     // Green 400
    dark: '#059669',      // Green 600
  },
  
  warning: {
    main: '#f59e0b',      // Amber 500
    light: '#fbbf24',     // Amber 400
    dark: '#d97706',      // Amber 600
  },
  
  error: {
    main: '#ef4444',      // Red 500
    light: '#f87171',     // Red 400
    dark: '#dc2626',      // Red 600
  },
  
  info: {
    main: '#3b82f6',      // Blue 500
    light: '#60a5fa',     // Blue 400
    dark: '#2563eb',      // Blue 600
  },
  
  // Chart colors
  chart: {
    primary: '#6366f1',   // Indigo
    secondary: '#a78bfa', // Purple 400
    tertiary: '#10b981',  // Green
    quaternary: '#f59e0b', // Amber
    cyan: '#22d3ee',      // Cyan 400
    rose: '#f43f5e',      // Rose 500
  },
};

const getTheme = (mode: 'light' | 'dark') => {
  const baseTheme = createTheme({
  palette: {
    mode,
    primary: {
      main: saasableColors.primary.main,
      light: saasableColors.primary.light,
      dark: saasableColors.primary.dark,
      contrastText: saasableColors.primary.contrastText,
    },
    secondary: {
      main: '#64748b',     // Slate for secondary actions
      light: '#94a3b8',
      dark: '#475569',
      contrastText: '#fff',
    },
    background: {
      default: mode === 'light' ? saasableColors.background.default : '#0f172a',
      paper: mode === 'light' ? saasableColors.background.paper : '#1e293b',
    },
    text: {
      primary: mode === 'light' ? saasableColors.text.primary : '#f7fafc',
      secondary: mode === 'light' ? saasableColors.text.secondary : '#cbd5e0',
      disabled: mode === 'light' ? saasableColors.text.disabled : '#94a3b8',
    },
    success: {
      main: saasableColors.success.main,
      light: saasableColors.success.light,
      dark: saasableColors.success.dark,
      contrastText: '#fff',
    },
    warning: {
      main: saasableColors.warning.main,
      light: saasableColors.warning.light,
      dark: saasableColors.warning.dark,
      contrastText: '#fff',
    },
    error: {
      main: saasableColors.error.main,
      light: saasableColors.error.light,
      dark: saasableColors.error.dark,
      contrastText: '#fff',
    },
    info: {
      main: saasableColors.info.main,
      light: saasableColors.info.light,
      dark: saasableColors.info.dark,
      contrastText: '#fff',
    },
    divider: mode === 'light' ? saasableColors.border.light : '#334155',
  },
  typography: {
    fontFamily: '"Urbanist", "Inter", "DM Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '3rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 600,
      fontSize: '2rem',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.7,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 8,
  },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.1)',
    '0 2px 4px rgba(0,0,0,0.1)',
    '0 4px 6px rgba(0,0,0,0.1)',
    '0 5px 15px rgba(0,0,0,0.1)',
    '0 10px 24px rgba(0,0,0,0.1)',
    '0 15px 35px rgba(0,0,0,0.1)',
    '0 20px 40px rgba(0,0,0,0.1)',
    '0 1px 3px rgba(0,0,0,0.1)',
    '0 1px 3px rgba(0,0,0,0.1)',
    '0 1px 3px rgba(0,0,0,0.1)',
    '0 1px 3px rgba(0,0,0,0.1)',
    '0 1px 3px rgba(0,0,0,0.1)',
    '0 1px 3px rgba(0,0,0,0.1)',
    '0 1px 3px rgba(0,0,0,0.1)',
    '0 1px 3px rgba(0,0,0,0.1)',
    '0 1px 3px rgba(0,0,0,0.1)',
    '0 1px 3px rgba(0,0,0,0.1)',
    '0 1px 3px rgba(0,0,0,0.1)',
    '0 1px 3px rgba(0,0,0,0.1)',
    '0 1px 3px rgba(0,0,0,0.1)',
    '0 1px 3px rgba(0,0,0,0.1)',
    '0 1px 3px rgba(0,0,0,0.1)',
    '0 1px 3px rgba(0,0,0,0.1)',
    '0 1px 3px rgba(0,0,0,0.1)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          colorScheme: mode === 'light' ? 'light' : 'dark',
          transition: "none",
          '&[data-theme="light"]': {
            backgroundColor: saasableColors.background.default,
          },
          '&[data-theme="dark"]': {
            backgroundColor: "#0f172a",
          },
        },
        body: {
          margin: 0,
          padding: 0,
          boxSizing: 'border-box',
          lineHeight: 1.5,
          fontFamily: '"Urbanist", "Inter", "DM Sans", "Roboto", "Helvetica", "Arial", sans-serif',
          backgroundColor: mode === 'light' ? saasableColors.background.default : '#0f172a',
          scrollbarColor: mode === 'light' ? `${saasableColors.primary.main} ${saasableColors.background.default}` : `${saasableColors.primary.main} #0f172a`,
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: 12,
            height: 12,
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: mode === 'light' ? saasableColors.text.disabled : saasableColors.primary.main,
            minHeight: 24,
            border: mode === 'light' ? `2px solid ${saasableColors.background.paper}` : '2px solid #0f172a',
          },
          '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
            backgroundColor: mode === 'light' ? saasableColors.background.default : '#0f172a',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 24px',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          },
        },
        outlined: {
          borderWidth: 1.5,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: mode === 'light' ? `1px solid ${saasableColors.border.light}` : '1px solid #334155',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
        },
      },
    },
  },
});

  return responsiveFontSizes(baseTheme);
};

export const lightTheme = getTheme('light');
export const darkTheme = getTheme('dark');

// Default export for backward compatibility
export default getTheme;
