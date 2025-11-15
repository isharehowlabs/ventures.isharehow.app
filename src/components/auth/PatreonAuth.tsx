import { useEffect } from 'react';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';

interface PatreonAuthProps {
  onSuccess?: () => void;
}

export default function PatreonAuth({ onSuccess }: PatreonAuthProps) {
  const { isAuthenticated, isLoading, login, user } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user && onSuccess) {
      onSuccess();
    }
  }, [isAuthenticated, user, onSuccess]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isAuthenticated && user) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          Welcome, {user.name}!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          You're authenticated with Patreon
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4, textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Sign in with Patreon
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Access the cowork dashboard by signing in with your Patreon account
      </Typography>
      <Button
        variant="contained"
        size="large"
        onClick={login}
        sx={{
          bgcolor: '#FF424D',
          '&:hover': {
            bgcolor: '#E63946',
          },
          px: 4,
          py: 1.5,
        }}
      >
        Sign in with Patreon
      </Button>
    </Box>
  );
}

