import { Box, Typography } from '@mui/material';
import AppShell from '../components/AppShell';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import Workspace from '../components/dashboard/Workspace';
import FloatingAIChat from '../components/dashboard/FloatingAIChat';

function LabsDashboard() {
  return (
    <AppShell active="labs">
      {/* Header Section */}
      <Box sx={{ p: { xs: 2, sm: 3 }, pb: 1 }}>
        <Typography variant="h4" fontWeight={800} gutterBottom>
          Labs Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Collaborate, code, and create together with your team
        </Typography>
      </Box>

      {/* Main Workspace Content - Single Scroll Grid Layout */}
      <Box 
        sx={{ 
          px: { xs: 2, sm: 3 }, 
          pb: 3, 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'auto'
        }}
      >
        <Workspace />
      </Box>

      {/* Floating AI Chat */}
      <FloatingAIChat />
    </AppShell>
  );
}

function App() {
  return (
    <ProtectedRoute>
      <LabsDashboard />
    </ProtectedRoute>
  );
}

export default App;
