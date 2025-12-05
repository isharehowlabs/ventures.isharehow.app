import { createTheme, responsiveFontSizes } from '@mui/material/styles';

const getTheme = (mode: 'light' | 'dark') => {
  const baseTheme = createTheme({
  palette: {
    mode,
    primary: {
      main: '#4B5DBD', // Vibrant blue/indigo brand color
      light: '#6B7DD7',
      dark: '#3A4A9D',
      contrastText: '#fff',
    },
    secondary: {
      main: '#6c757d', // Neutral gray for secondary actions
      light: '#adb5bd',
      dark: '#495057',
      contrastText: '#fff',
    },
    background: {
      default: mode === 'light' ? '#FFFFFF' : '#0f172a', // Pure white background
      paper: mode === 'light' ? '#FFFFFF' : '#1e293b', // White cards on white
    },
    text: {
      primary: mode === 'light' ? '#212529' : '#f7fafc', // Darker text for better contrast
      secondary: mode === 'light' ? '#6c757d' : '#cbd5e0', // Muted gray
      disabled: mode === 'light' ? '#adb5bd' : '#94a3b8',
    },
    divider: mode === 'light' ? '#dee2e6' : '#334155', // Very light gray dividers
    success: {
      main: '#28a745', // Bright, clear success green
      light: '#48b461',
      dark: '#1e7e34',
      contrastText: '#fff',
    },
    warning: {
      main: '#ffc107',
      light: '#ffcd39',
      dark: '#d39e00',
      contrastText: '#000',
    },
    error: {
      main: '#dc3545',
      light: '#e35d6a',
      dark: '#b02a37',
      contrastText: '#fff',
    },
    info: {
      main: '#17a2b8',
      light: '#3ab5c4',
      dark: '#117a8b',
      contrastText: '#fff',
    },
    action: {
      active: mode === 'light' ? '#4B5DBD' : '#6B7DD7',
      hover: mode === 'light' ? 'rgba(75, 93, 189, 0.04)' : 'rgba(107, 125, 215, 0.08)',
      selected: mode === 'light' ? 'rgba(75, 93, 189, 0.08)' : 'rgba(107, 125, 215, 0.16)',
      disabled: mode === 'light' ? 'rgba(0, 0, 0, 0.26)' : 'rgba(255, 255, 255, 0.3)',
      disabledBackground: mode === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
      focus: mode === 'light' ? 'rgba(75, 93, 189, 0.12)' : 'rgba(107, 125, 215, 0.24)',
    },
  },
  shape: {
    borderRadius: 8, // Slightly less rounded for cleaner look
  },
  typography: {
    fontFamily: '"Urbanist", "Inter", "DM Sans", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
      fontSize: '1.75rem', // 28px
      letterSpacing: -0.5,
      lineHeight: 1.3,
    },
    h2: {
      fontWeight: 600,
      fontSize: '1.5rem', // 24px
      letterSpacing: -0.25,
      lineHeight: 1.4,
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.25rem', // 20px
      letterSpacing: 0,
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.125rem', // 18px
      letterSpacing: 0.15,
      lineHeight: 1.5,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1rem', // 16px
      letterSpacing: 0,
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 600,
      fontSize: '0.875rem', // 14px
      letterSpacing: 0.15,
      lineHeight: 1.5,
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
      fontSize: '0.875rem', // 14px
      letterSpacing: 0.15,
      lineHeight: 1.5,
    },
    body2: {
      fontWeight: 400,
      fontSize: '0.8125rem', // 13px
      letterSpacing: 0.17,
      lineHeight: 1.43,
    },
    button: {
      fontWeight: 600,
      fontSize: '0.875rem',
      letterSpacing: 0.4,
      textTransform: 'none',
    },
    caption: {
      fontWeight: 400,
      fontSize: '0.75rem', // 12px
      letterSpacing: 0.4,
      lineHeight: 1.66,
    },
    overline: {
      fontWeight: 600,
      fontSize: '0.625rem', // 10px
      letterSpacing: 1.5,
      lineHeight: 2.66,
      textTransform: 'uppercase',
    },
  },
  shadows: [
    'none',
    mode === 'light' ? '0px 1px 2px rgba(0, 0, 0, 0.05)' : '0px 2px 4px rgba(0, 0, 0, 0.3)',
    mode === 'light' ? '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)' : '0px 4px 8px rgba(0, 0, 0, 0.4)',
    mode === 'light' ? '0px 2px 4px rgba(0, 0, 0, 0.08), 0px 2px 3px rgba(0, 0, 0, 0.06)' : '0px 6px 12px rgba(0, 0, 0, 0.45)',
    mode === 'light' ? '0px 2px 6px rgba(0, 0, 0, 0.08), 0px 2px 4px rgba(0, 0, 0, 0.06)' : '0px 8px 16px rgba(0, 0, 0, 0.5)',
    mode === 'light' ? '0px 4px 8px rgba(0, 0, 0, 0.08), 0px 2px 4px rgba(0, 0, 0, 0.06)' : '0px 10px 20px rgba(0, 0, 0, 0.55)',
    mode === 'light' ? '0px 4px 12px rgba(0, 0, 0, 0.08), 0px 2px 6px rgba(0, 0, 0, 0.06)' : '0px 12px 24px rgba(0, 0, 0, 0.6)',
    mode === 'light' ? '0px 6px 16px rgba(0, 0, 0, 0.08), 0px 3px 6px rgba(0, 0, 0, 0.06)' : '0px 14px 28px rgba(0, 0, 0, 0.65)',
    mode === 'light' ? '0px 8px 20px rgba(0, 0, 0, 0.08), 0px 4px 8px rgba(0, 0, 0, 0.06)' : '0px 16px 32px rgba(0, 0, 0, 0.7)',
    mode === 'light' ? '0px 10px 24px rgba(0, 0, 0, 0.08), 0px 4px 10px rgba(0, 0, 0, 0.06)' : '0px 18px 36px rgba(0, 0, 0, 0.75)',
    mode === 'light' ? '0px 12px 28px rgba(0, 0, 0, 0.08), 0px 5px 12px rgba(0, 0, 0, 0.06)' : '0px 20px 40px rgba(0, 0, 0, 0.8)',
    mode === 'light' ? '0px 14px 32px rgba(0, 0, 0, 0.08), 0px 6px 14px rgba(0, 0, 0, 0.06)' : '0px 22px 44px rgba(0, 0, 0, 0.85)',
    mode === 'light' ? '0px 16px 36px rgba(0, 0, 0, 0.08), 0px 6px 16px rgba(0, 0, 0, 0.06)' : '0px 24px 48px rgba(0, 0, 0, 0.9)',
    mode === 'light' ? '0px 18px 40px rgba(0, 0, 0, 0.08), 0px 7px 18px rgba(0, 0, 0, 0.06)' : '0px 26px 52px rgba(0, 0, 0, 0.92)',
    mode === 'light' ? '0px 20px 44px rgba(0, 0, 0, 0.08), 0px 8px 20px rgba(0, 0, 0, 0.06)' : '0px 28px 56px rgba(0, 0, 0, 0.94)',
    mode === 'light' ? '0px 22px 48px rgba(0, 0, 0, 0.08), 0px 9px 22px rgba(0, 0, 0, 0.06)' : '0px 30px 60px rgba(0, 0, 0, 0.96)',
    mode === 'light' ? '0px 24px 52px rgba(0, 0, 0, 0.08), 0px 10px 24px rgba(0, 0, 0, 0.06)' : '0px 32px 64px rgba(0, 0, 0, 0.98)',
    mode === 'light' ? '0px 26px 56px rgba(0, 0, 0, 0.08), 0px 10px 26px rgba(0, 0, 0, 0.06)' : '0px 34px 68px rgba(0, 0, 0, 1)',
    mode === 'light' ? '0px 28px 60px rgba(0, 0, 0, 0.08), 0px 11px 28px rgba(0, 0, 0, 0.06)' : '0px 36px 72px rgba(0, 0, 0, 1)',
    mode === 'light' ? '0px 30px 64px rgba(0, 0, 0, 0.08), 0px 12px 30px rgba(0, 0, 0, 0.06)' : '0px 38px 76px rgba(0, 0, 0, 1)',
    mode === 'light' ? '0px 32px 68px rgba(0, 0, 0, 0.08), 0px 13px 32px rgba(0, 0, 0, 0.06)' : '0px 40px 80px rgba(0, 0, 0, 1)',
    mode === 'light' ? '0px 34px 72px rgba(0, 0, 0, 0.08), 0px 14px 34px rgba(0, 0, 0, 0.06)' : '0px 42px 84px rgba(0, 0, 0, 1)',
    mode === 'light' ? '0px 36px 76px rgba(0, 0, 0, 0.08), 0px 15px 36px rgba(0, 0, 0, 0.06)' : '0px 44px 88px rgba(0, 0, 0, 1)',
    mode === 'light' ? '0px 38px 80px rgba(0, 0, 0, 0.08), 0px 16px 38px rgba(0, 0, 0, 0.06)' : '0px 46px 92px rgba(0, 0, 0, 1)',
    mode === 'light' ? '0px 40px 84px rgba(0, 0, 0, 0.08), 0px 17px 40px rgba(0, 0, 0, 0.06)' : '0px 48px 96px rgba(0, 0, 0, 1)',
  ],
  spacing: 8,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        html: {
          transition: "none",
          '&[data-theme="light"]': {
            backgroundColor: "#FFFFFF",
          },
          '&[data-theme="dark"]': {
            backgroundColor: "#0f172a",
          },
        },
        body: {
          backgroundColor: "inherit",
          scrollbarColor: mode === 'light' ? '#4B5DBD #f8f9fa' : '#4B5DBD #0f172a',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: 8,
            height: 8,
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 8,
            backgroundColor: mode === 'light' ? '#adb5bd' : '#4B5DBD',
            minHeight: 24,
            border: mode === 'light' ? '2px solid #FFFFFF' : '2px solid #0f172a',
          },
          '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
            backgroundColor: mode === 'light' ? '#FFFFFF' : '#0f172a',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'light' ? '#FFFFFF' : '#1e293b',
          boxShadow: mode === 'light' 
            ? '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)' 
            : '0 1px 3px 0 rgba(0, 0, 0, 0.5)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: mode === 'light' ? '#FFFFFF' : '#1e293b',
          boxShadow: mode === 'light' 
            ? '0px 2px 4px rgba(0, 0, 0, 0.08), 0px 2px 3px rgba(0, 0, 0, 0.06)' 
            : '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
          border: mode === 'light' ? '1px solid #e9ecef' : 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          fontWeight: 600,
          textTransform: 'none',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: mode === 'light'
              ? '0px 2px 4px rgba(0, 0, 0, 0.08), 0px 2px 3px rgba(0, 0, 0, 0.06)'
              : '0 4px 6px -1px rgba(0, 0, 0, 0.6)',
          },
          '&:active': {
            boxShadow: 'none',
          },
        },
        outlined: {
          borderWidth: 1.5,
          '&:hover': {
            borderWidth: 1.5,
            backgroundColor: mode === 'light' ? 'rgba(75, 93, 189, 0.04)' : 'rgba(107, 125, 215, 0.08)',
          },
        },
        text: {
          '&:hover': {
            backgroundColor: mode === 'light' ? 'rgba(75, 93, 189, 0.04)' : 'rgba(107, 125, 215, 0.08)',
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&:hover': {
            backgroundColor: mode === 'light' ? 'rgba(75, 93, 189, 0.04)' : 'rgba(107, 125, 215, 0.08)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: mode === 'light' ? '#FFFFFF' : '#1e293b',
        },
        elevation1: {
          boxShadow: mode === 'light'
            ? '0px 2px 4px rgba(0, 0, 0, 0.08), 0px 2px 3px rgba(0, 0, 0, 0.06)'
            : '0 1px 3px 0 rgba(0, 0, 0, 0.5)',
          border: mode === 'light' ? '1px solid #e9ecef' : 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: mode === 'light' ? '#FFFFFF' : '#1e293b',
          borderRight: mode === 'light' ? '1px solid #e9ecef' : '1px solid #334155',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 8px',
          '&.Mui-selected': {
            backgroundColor: mode === 'light' ? 'rgba(75, 93, 189, 0.08)' : 'rgba(75, 93, 189, 0.24)',
            color: mode === 'light' ? '#4B5DBD' : '#6B7DD7',
            fontWeight: 600,
            '&:hover': {
              backgroundColor: mode === 'light' ? 'rgba(75, 93, 189, 0.12)' : 'rgba(75, 93, 189, 0.32)',
            },
          },
          '&:hover': {
            backgroundColor: mode === 'light' ? 'rgba(75, 93, 189, 0.04)' : 'rgba(75, 93, 189, 0.16)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
        outlined: {
          borderWidth: 1.5,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
            backgroundColor: mode === 'light' ? '#f8f9fa' : '#1e293b',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: mode === 'light' ? '#4B5DBD' : '#6B7DD7',
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: mode === 'light' ? '1px solid #e9ecef' : '1px solid #334155',
        },
        head: {
          fontWeight: 600,
          backgroundColor: mode === 'light' ? '#f8f9fa' : '#1e293b',
        },
      },
    },
  },
  });

  // Add dashboard-specific theme extensions
  const dashboardTheme = {
    ...baseTheme,
    dashboard: {
      spacing: {
        card: baseTheme.spacing(3),
        section: baseTheme.spacing(4),
        widget: baseTheme.spacing(2),
      },
      colors: {
        dataHighlight: mode === 'light' ? '#4B5DBD' : '#6B7DD7',
        metricPrimary: mode === 'light' ? '#4B5DBD' : '#6B7DD7',
        metricSecondary: mode === 'light' ? '#6c757d' : '#adb5bd',
        chartGrid: mode === 'light' ? 'rgba(0, 0, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)',
      },
    },
  };

  return responsiveFontSizes(dashboardTheme);
};

export default getTheme;
