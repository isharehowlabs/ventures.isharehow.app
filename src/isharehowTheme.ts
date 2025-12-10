import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// SaasAble Color Scheme - Clean Light Theme Only
export const saasableColors = {
  // Primary - Indigo
  primary: {
    main: '#6366f1',      // Indigo 500
    light: '#818cf8',     // Indigo 400
    dark: '#4f46e5',      // Indigo 600
    contrastText: '#ffffff',
  },
  
  // Pure white backgrounds - NO GRAY
  background: {
    default: '#ffffff',   // Pure white
    paper: '#ffffff',     // Pure white
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
  
  // Chart colors
  chart: {
    primary: '#6366f1',
    secondary: '#a78bfa',
    tertiary: '#10b981',
    quaternary: '#f59e0b',
    cyan: '#22d3ee',
    rose: '#f43f5e',
  },
};

const getTheme = (mode: 'light' | 'dark') => {
  // Force light mode always - ignore dark mode
  const baseTheme = createTheme({
  palette: {
    mode: 'light', // Always light
    primary: {
      main: saasableColors.primary.main,
      light: saasableColors.primary.light,
      dark: saasableColors.primary.dark,
      contrastText: saasableColors.primary.contrastText,
    },
    secondary: {
      main: '#64748b',
      light: '#94a3b8',
      dark: '#475569',
      contrastText: '#fff',
    },
    background: {
      default: '#ffffff',  // Pure white always
      paper: '#ffffff',    // Pure white always
    },
    text: {
      primary: saasableColors.text.primary,
      secondary: saasableColors.text.secondary,
      disabled: saasableColors.text.disabled,
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
    divider: saasableColors.border.light,
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
          colorScheme: 'light',
          backgroundColor: '#ffffff',
        },
        body: {
          margin: 0,
          padding: 0,
          boxSizing: 'border-box',
          lineHeight: 1.5,
          fontFamily: '"Urbanist", "Inter", "DM Sans", "Roboto", "Helvetica", "Arial", sans-serif',
          backgroundColor: '#ffffff', // Pure white
          scrollbarColor: `${saasableColors.primary.main} #ffffff`,
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: 12,
            height: 12,
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: saasableColors.text.disabled,
            minHeight: 24,
            border: '2px solid #ffffff',
          },
          '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
            backgroundColor: '#ffffff',
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
          border: `1px solid ${saasableColors.border.light}`,
          backgroundColor: '#ffffff',
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
            backgroundColor: '#ffffff',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#ffffff',
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
          backgroundColor: '#ffffff',
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

// Always return light theme
export const lightTheme = getTheme('light');
export const darkTheme = getTheme('light'); // Force light even for "dark"

// Default export for backward compatibility
export default getTheme;
