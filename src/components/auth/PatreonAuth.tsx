import { useEffect, useState } from 'react';
import { Box, Button, Typography, CircularProgress, Alert, TextField, Divider, Collapse } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { getBackendUrl } from '../../utils/backendUrl';

interface PatreonAuthProps {
  onSuccess?: () => void;
}

export default function PatreonAuth({ onSuccess }: PatreonAuthProps) {
  const { isAuthenticated, isLoading, login, user, refresh } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualPatreonId, setManualPatreonId] = useState('');
  const [manualAccessToken, setManualAccessToken] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState<string | null>(null);

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

  const handleManualVerify = async () => {
    if (!manualAccessToken.trim()) {
      setErrorMessage('Patreon access token is required');
      return;
    }

    setIsVerifying(true);
    setErrorMessage(null);
    setVerifySuccess(null);

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/auth/verify-and-create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          patreon_id: manualPatreonId.trim(),
          access_token: manualAccessToken.trim() || undefined,
          email: manualEmail.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setVerifySuccess(`User verified successfully! ${data.user.isPaidMember ? 'Active paid member.' : 'Not an active paid member.'}`);
        setManualPatreonId('');
        setManualAccessToken('');
        setManualEmail('');
        // Refresh auth state
        setTimeout(() => {
          refresh();
        }, 1000);
      } else {
        setErrorMessage(data.error || 'Failed to verify user');
      }
    } catch (error: any) {
      setErrorMessage(`Error: ${error.message || 'Network error'}`);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Box sx={{ p: 4, textAlign: 'center', maxWidth: 500, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Sign in with Patreon
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Access the co-working space dashboard by signing in with your Patreon account.
        Your membership status will be verified automatically.
      </Typography>
      
      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
          {errorMessage}
        </Alert>
      )}

      {verifySuccess && (
        <Alert severity="success" sx={{ mb: 3, textAlign: 'left' }}>
          {verifySuccess}
        </Alert>
      )}
      
      <Button
        variant="contained"
        size="large"
        onClick={login}
        fullWidth
        sx={{
          bgcolor: '#FF424D',
          '&:hover': {
            bgcolor: '#E63946',
          },
          px: 4,
          py: 1.5,
          mb: 2,
        }}
      >
        Sign in with Patreon (OAuth)
      </Button>

      <Divider sx={{ my: 3 }}>OR</Divider>

      <Button
        variant="outlined"
        size="medium"
        onClick={() => setShowManualForm(!showManualForm)}
        sx={{ mb: 2 }}
      >
        {showManualForm ? 'Hide' : 'Show'} Manual Verification Form
      </Button>

      <Collapse in={showManualForm}>
        <Box sx={{ mt: 2, textAlign: 'left' }}>
          <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
            Manual Verification
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
            Enter Patreon user information to verify membership and add to database.
            Access token is optional but recommended for accurate verification.
          </Typography>

          <TextField
            fullWidth
            label="Patreon Access Token *"
            type="password"
            value={manualAccessToken}
            onChange={(e) => setManualAccessToken(e.target.value)}
            margin="normal"
            required
            helperText="Patreon access token (required for verification). Get one via OAuth or from Patreon API settings."
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Patreon User ID (Optional)"
            value={manualPatreonId}
            onChange={(e) => setManualPatreonId(e.target.value)}
            margin="normal"
            helperText="Optional: Verify the token belongs to this specific user ID"
          />

          <TextField
            fullWidth
            label="Email (Optional)"
            type="email"
            value={manualEmail}
            onChange={(e) => setManualEmail(e.target.value)}
            margin="normal"
            helperText="Optional: User's email address (will be fetched from Patreon if not provided)"
            sx={{ mb: 2 }}
          />

          <Button
            variant="contained"
            fullWidth
            onClick={handleManualVerify}
            disabled={isVerifying || !manualAccessToken.trim()}
            sx={{
              bgcolor: '#1976d2',
              '&:hover': {
                bgcolor: '#1565c0',
              },
            }}
          >
            {isVerifying ? 'Verifying...' : 'Verify & Add User'}
          </Button>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
            Note: The easiest way to get an access token is to use the OAuth login above.
            Manual verification is for admin use or when OAuth is not available.
          </Typography>
        </Box>
      </Collapse>
    </Box>
  );
}

