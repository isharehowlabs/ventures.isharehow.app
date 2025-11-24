import { useState } from 'react';
import { Box, Button, TextField, Typography, Alert, CircularProgress, Link } from '@mui/material';
import { getBackendUrl } from '../../utils/backendUrl';

interface RegisterFormProps {
  onSuccess: (token: string, user: any) => void;
  onLoginClick?: () => void;
}

export default function RegisterForm({ onSuccess, onLoginClick }: RegisterFormProps) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token
        if (data.token) {
          localStorage.setItem('auth_token', data.token);
        }
        onSuccess(data.token, data.user);
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ p: 4, textAlign: 'center', maxWidth: 400, mx: 'auto' }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 2 }}>
        Create Account
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Create an account to get started. You'll connect your Patreon account next.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3, textAlign: 'left' }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleRegister}>
        <TextField
          fullWidth
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          margin="normal"
          required
          autoFocus
          disabled={isLoading}
        />

        <TextField
          fullWidth
          label="Email (Optional)"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          margin="normal"
          disabled={isLoading}
        />

        <TextField
          fullWidth
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          required
          disabled={isLoading}
          helperText="Must be at least 6 characters"
        />

        <TextField
          fullWidth
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          margin="normal"
          required
          disabled={isLoading}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          size="large"
          disabled={isLoading || !username || !password || password !== confirmPassword}
          sx={{
            mt: 3,
            mb: 2,
            bgcolor: '#1976d2',
            '&:hover': {
              bgcolor: '#1565c0',
            },
          }}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Create Account'}
        </Button>
      </form>

      {onLoginClick && (
        <Typography variant="body2" sx={{ mt: 2 }}>
          Already have an account?{' '}
          <Link
            component="button"
            variant="body2"
            onClick={onLoginClick}
            sx={{ cursor: 'pointer' }}
          >
            Sign in here
          </Link>
        </Typography>
      )}
    </Box>
  );
}

