import React from 'react';
import { Box, ThemeProvider } from '@mui/material';
import CreativeDashboardPanel from '../components/dashboard/CreativeDashboardPanel';
import Navigation from '../components/Navigation';
import { useTheme } from '../ThemeContext';

function CreativeDashboard() {
  const { theme } = useTheme();
  
  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary'
      }}>
        <Navigation active="creative" isAuthenticated={false} />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <CreativeDashboardPanel />
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default CreativeDashboard;
