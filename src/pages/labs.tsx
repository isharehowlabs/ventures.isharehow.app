import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, CircularProgress, Typography } from '@mui/material';
import AppShell from '../components/AppShell';
import ProtectedRoute from '../components/auth/ProtectedRoute';

function LabsDashboard() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to Creative Dashboard with Co-Work tab
    router.replace('/creative?tab=cowork');
  }, [router]);

  return (
    <AppShell active="creative">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
          gap: 2,
        }}
      >
        <CircularProgress />
        <Typography variant="body1" color="text.secondary">
          Redirecting to Creative Dashboard...
        </Typography>
      </Box>
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
