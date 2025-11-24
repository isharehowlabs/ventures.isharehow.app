import { useState, useEffect } from 'react';
import { Box, Button, Typography, Alert, CircularProgress } from '@mui/material';
import { getBackendUrl } from '../../utils/backendUrl';

interface PatreonVerificationProps {
  token: string;
  onSuccess: () => void;
  onSkip?: () => void;
}

export default function PatreonVerification({ token, onSuccess, onSkip }: PatreonVerificationProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsConnection, setNeedsConnection] = useState(false);

  const handleVerify = async () => {
    setIsVerifying(true);
    setError(null);

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/auth/verify-patreon`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess();
      } else {
        if (data.needsConnection) {
          setNeedsConnection(true);
        } else {
          setError(data.error || 'Verification failed');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleConnectPatreon = () => {
    const backendUrl = getBackendUrl();
    window.location.href = `${backendUrl}/api/auth/patreon`;
  };

  useEffect(() => {
    // Auto-verify on mount if user has Patreon connected
    handleVerify();
  }, []);

  return (
    <Box sx={{ p: 4, textAlign: 'center', maxWidth: 500, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Verify Patreon Membership
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        We need to verify your Patreon membership status to grant access to the dashboard.
      </Typography>

      {error && !needsConnection && (
        <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
          {error}
        </Alert>
      )}

      {needsConnection ? (
        <>
          <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
            You need to connect your Patreon account first. This will securely store your Patreon
            membership information so you don't need to verify every time you log in.
          </Alert>
          <Button
            variant="contained"
            size="large"
            onClick={handleConnectPatreon}
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
            Connect Patreon Account
          </Button>
          {onSkip && (
            <Button
              variant="outlined"
              size="medium"
              onClick={onSkip}
              fullWidth
              sx={{ mt: 1 }}
            >
              Skip for Now
            </Button>
          )}
        </>
      ) : (
        <>
          {isVerifying ? (
            <Box sx={{ py: 4 }}>
              <CircularProgress />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Verifying your Patreon membership status...
              </Typography>
            </Box>
          ) : (
            <>
              <Button
                variant="contained"
                size="large"
                onClick={handleVerify}
                fullWidth
                disabled={isVerifying}
                sx={{
                  bgcolor: '#1976d2',
                  '&:hover': {
                    bgcolor: '#1565c0',
                  },
                  px: 4,
                  py: 1.5,
                  mb: 2,
                }}
              >
                Verify Membership
              </Button>
              {onSkip && (
                <Button
                  variant="outlined"
                  size="medium"
                  onClick={onSkip}
                  fullWidth
                  sx={{ mt: 1 }}
                >
                  Skip Verification
                </Button>
              )}
            </>
          )}
        </>
      )}
    </Box>
  );
}

