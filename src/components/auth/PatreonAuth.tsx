import { useEffect, useState } from 'react';
import { Box, Button, Typography, CircularProgress, Alert } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';

interface PatreonAuthProps {
  onSuccess?: () => void;
}

export default function PatreonAuth({ onSuccess }: PatreonAuthProps) {
  const { isAuthenticated, isLoading, login, user } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check for error messages in URL
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const authError = urlParams.get('auth');
      const message = urlParams.get('message');
      
      if (authError === 'error') {
        if (message === 'not_paid_member') {
          setErrorMessage('You need to be an active paid member to access the dashboard.');
        } else if (message === 'missing_code') {
          setErrorMessage('Authentication code missing. Please try again.');
        } else if (message === 'missing_config') {
          setErrorMessage('Authentication service not properly configured. Please contact support.');
        } else if (message === 'token_error') {
          setErrorMessage('Failed to obtain access token. Please try again.');
        } else if (message === 'api_error') {
          setErrorMessage('Patreon API error. Please try again later.');
        } else if (message === 'timeout') {
          setErrorMessage('Request timed out. Please check your connection and try again.');
        } else if (message === 'network_error') {
          setErrorMessage('Network error. Please check your connection and try again.');
        } else if (message === 'user_fetch_failed') {
          setErrorMessage('Failed to fetch user information. Please try again.');
        } else if (message === 'invalid_state') {
          setErrorMessage('Authentication failed. Please try again.');
        } else if (message) {
          setErrorMessage(`Authentication error: ${message}. Please try again.`);
        } else {
          setErrorMessage('Authentication error. Please try again.');
        }
        
        // Clean up URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }

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
        Access the co-working space dashboard by signing in with your Patreon account
      </Typography>
      
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
          {errorMessage}
        </Alert>
      )}
      
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
      
      <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
        Note: You must be an active paid member to access the dashboard
      </Typography>
    </Box>
  );
}

