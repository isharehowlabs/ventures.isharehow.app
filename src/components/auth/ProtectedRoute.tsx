import { ReactNode } from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import PatreonAuth from './PatreonAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <PatreonAuth />;
  }

  // Check if user is a paid member
  if (!user?.isPaidMember) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
          p: 4,
          textAlign: 'center',
        }}
      >
        <Typography variant="h4" gutterBottom>
          Membership Required
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500 }}>
          You need to be an active paid member of our Patreon to access the dashboard.
          Please become a patron to continue.
        </Typography>
        <Button
          variant="contained"
          href="https://www.patreon.com/cw/JamelEliYah"
          target="_blank"
          sx={{
            bgcolor: '#FF424D',
            '&:hover': {
              bgcolor: '#E63946',
            },
          }}
        >
          Join Patreon
        </Button>
      </Box>
    );
  }

  return <>{children}</>;
}

