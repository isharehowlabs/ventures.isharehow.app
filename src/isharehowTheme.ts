import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Shell colors - fixed for consistency across all pages
const SHELL_COLORS = {
  header: '#0a0e1a',
  sidebar: '#151b2e',
  border: '#1e293b',
  textPrimary: '#f7fafc',
  textSecondary: '#cbd5e0',
};

const getTheme = (mode: 'light' | 'dark') => {
  const baseTheme = createTheme({
  palette: {
    mode,
    // Default MUI primary color (blue)
    primary: {
      light: '#42a5f5',
      main: '#1976d2',
      dark: '#1565c0',
      contrastText: '#fff',
    },
    // Default MUI secondary color (purple)
    secondary: {
      light: '#ba68c8',
      main: '#9c27b0',
      dark: '#7b1fa2',
      contrastText: '#fff',
    },
    // Default MUI error color
    error: {
      light: '#ef5350',
      main: '#d32f2f',
      dark: '#c62828',
      contrastText: '#fff',
    },
    // Default MUI warning color
    warning: {
      light: '#ff9800',
      main: '#ed6c02',
      dark: '#e65100',
      contrastText: '#fff',
    },
    // Default MUI info color
    info: {
      light: '#03a9f4',
      main: '#0288d1',
      dark: '#01579b',
      contrastText: '#fff',
    },
    // Default MUI success color
    success: {
      light: '#4caf50',
      main: '#2e7d32',
      dark: '#1b5e20',
      contrastText: '#fff',
    },
    // Backgrounds - content area (not shell)
    background: {
      default: mode === 'light' ? '#f5f5f5' : '#0f172a',
      paper: mode === 'light' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(15, 23, 42, 0.6)', // Subtle transparent backgrounds for premium look
    },
    // Default MUI text colors
    text: {
      primary: mode === 'light' ? '#212529' : '#f7fafc',
      secondary: mode === 'light' ? '#8b95a8' : '#cbd5e0',
      disabled: mode === 'light' ? 'rgba(33, 37, 41, 0.38)' : 'rgba(247, 250, 252, 0.5)',
    },
    divider: mode === 'light' ? '#dee2e6' : '#334155',
    // Custom colors for shell
    ...(mode === 'dark' && {
      custom: {
        shell: SHELL_COLORS,
      },
    }),
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 300,
      fontSize: '6rem',
      lineHeight: 1.167,
      letterSpacing: '-0.01562em',
    },
    h2: {
      fontWeight: 300,
      fontSize: '3.75rem',
      lineHeight: 1.2,
      letterSpacing: '-0.00833em',
    },
    h3: {
      fontWeight: 400,
      fontSize: '3rem',
      lineHeight: 1.167,
      letterSpacing: '0em',
    },
    h4: {
      fontWeight: 400,
      fontSize: '2.125rem',
      lineHeight: 1.235,
      letterSpacing: '0.00735em',
    },
    h5: {
      fontWeight: 400,
      fontSize: '1.5rem',
      lineHeight: 1.334,
      letterSpacing: '0em',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.25rem',
      lineHeight: 1.6,
      letterSpacing: '0.0075em',
    },
    body1: {
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.5,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: 1.43,
      letterSpacing: '0.01071em',
    },
    button: {
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.75,
      letterSpacing: '0.02857em',
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: mode === 'light' ? '#f5f5f5' : '#0f172a',
          color: mode === 'light' ? '#212529' : '#f7fafc',
          scrollbarColor: mode === 'light' ? '#bbb #f5f5f5' : '#8a94a6 #0f172a',
          '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
            width: 10,
            height: 10,
          },
          '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
            borderRadius: 5,
            background: mode === 'light' 
              ? 'linear-gradient(45deg, #ff6b6b, #4ecdc4)' 
              : 'linear-gradient(45deg, #ff8a80, #80deea)',
            minHeight: 24,
            '&:hover': {
              background: mode === 'light'
                ? 'linear-gradient(45deg, #ff5252, #26a69a)'
                : 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
            },
          },
          '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
            backgroundColor: mode === 'light' ? '#f5f5f5' : '#0f172a',
          },
        },
        '#__next': {
          backgroundColor: mode === 'light' ? '#f5f5f5' : '#0f172a',
          minHeight: '100vh',
        },
      },
    },
    MuiModal: {
      styleOverrides: {
        root: {
          zIndex: 1400,
        },
        backdrop: {
          backgroundColor: mode === 'light' 
            ? 'rgba(0, 0, 0, 0.5)' 
            : 'rgba(0, 0, 0, 0.7)',
          zIndex: 1400,
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'light' 
            ? 'rgba(0, 0, 0, 0.5)' 
            : 'rgba(0, 0, 0, 0.7)',
          zIndex: 1400,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        root: {
          zIndex: 1400,
          '& .MuiBackdrop-root': {
            backgroundColor: mode === 'light' 
              ? 'rgba(0, 0, 0, 0.5)' 
              : 'rgba(0, 0, 0, 0.7)',
            zIndex: 1400,
          },
        },
        container: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          '& > *': {
            pointerEvents: 'auto',
          },
        },
        paper: {
          backgroundColor: mode === 'light' ? '#ffffff' : '#1e293b',
          backgroundImage: 'none',
          opacity: 1,
          position: 'relative',
          zIndex: 1401,
          margin: '32px',
          maxHeight: 'calc(100% - 64px)',
          display: 'flex',
          flexDirection: 'column',
          pointerEvents: 'auto',
        },
        paperScrollPaper: {
          maxHeight: 'calc(100% - 64px)',
        },
        paperWidthXs: {
          maxWidth: '444px',
        },
        paperWidthSm: {
          maxWidth: '600px',
        },
        paperWidthMd: {
          maxWidth: '900px',
        },
        paperWidthLg: {
          maxWidth: '1200px',
        },
        paperWidthXl: {
          maxWidth: '1536px',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'light' ? '#ffffff' : '#1e293b',
          borderBottom: `1px solid ${mode === 'light' ? '#e2e8f0' : '#334155'}`,
          padding: '16px 24px',
          pointerEvents: 'auto',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'light' ? '#ffffff' : '#1e293b',
          padding: '20px 24px',
          pointerEvents: 'auto',
          overflow: 'auto',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          backgroundColor: mode === 'light' ? '#ffffff' : '#1e293b',
          borderTop: `1px solid ${mode === 'light' ? '#e2e8f0' : '#334155'}`,
          padding: '8px 24px',
          pointerEvents: 'auto',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        root: {
          zIndex: 1300,
        },
        paper: {
          backgroundColor: mode === 'light' ? '#ffffff' : '#1e293b',
          pointerEvents: 'auto',
        },
        list: {
          pointerEvents: 'auto',
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        root: {
          zIndex: 1300,
        },
        paper: {
          backgroundColor: mode === 'light' ? '#ffffff' : '#1e293b',
          pointerEvents: 'auto',
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          pointerEvents: 'auto',
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          pointerEvents: 'auto',
          '&:hover': {
            pointerEvents: 'auto',
          },
        },
      },
    },
  },
});

  return responsiveFontSizes(baseTheme);
};

export const lightTheme = getTheme('light');
export const darkTheme = getTheme('dark');
export { SHELL_COLORS };

// Default export for backward compatibility
export default getTheme;
