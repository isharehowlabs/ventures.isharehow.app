import { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Alert, CircularProgress, Link, Divider } from '@mui/material';
import { getBackendUrl } from '../../utils/backendUrl';
import { WalletLoginButton } from './WalletLoginButton';
import { GoogleLoginButton } from './GoogleLoginButton';

interface LoginFormProps {
  onSuccess: (token: string, user: any) => void;
  onRegisterClick?: () => void;
}

export default function LoginForm({ onSuccess, onRegisterClick }: LoginFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
        }
        onSuccess(data.token, data.user);
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4, textAlign: 'center', maxWidth: 450, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Sign In
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose your preferred sign in method
      </Typography>

      {/* Web3 Wallet & Google Login */}
      <Box sx={{ mb: 3 }}>
        <WalletLoginButton />
        <GoogleLoginButton />
      </Box>

      {/* Divider */}
      <Divider sx={{ my: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ px: 2 }}>
          OR
        </Typography>
      </Divider>

      {/* Traditional Login */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, textAlign: 'left' }}>
        Sign in with username and password
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleLogin}>
        <TextField
          fullWidth
          label="Username or Email"
          name="username"
          id="username"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          margin="normal"
          required
          disabled={isLoading}
          size="small"
        />

        <TextField
          fullWidth
          label="Password"
          name="password"
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          required
          disabled={isLoading}
          size="small"
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={isLoading || !username || !password}
          sx={{
            mt: 3,
            mb: 2,
            bgcolor: '#1976d2',
            '&:hover': {
              bgcolor: '#1565c0',
            },
          }}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
        </Button>
      </form>

      {onRegisterClick && (
        <Typography variant="body2" sx={{ mt: 3 }}>
          Don't have an account?{' '}
          <Link
            component="button"
            variant="body2"
            onClick={onRegisterClick}
            sx={{ cursor: 'pointer' }}
          >
            Register here
          </Link>
        </Typography>
      )}

      {/* Wallet Linking Info */}
      <Typography variant="caption" color="text.secondary" sx={{ mt: 3, display: 'block' }}>
        Already have an account?{' '}
        <Link href="/link-wallet" sx={{ textDecoration: 'none' }}>
          Link your wallet here
        </Link>
      </Typography>
    </Box>
  );
}
