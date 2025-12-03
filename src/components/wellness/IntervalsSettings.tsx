import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Link,
} from '@mui/material';
import { Save, Check, Link as LinkIcon, Login } from '@mui/icons-material';
import {
  saveApiKey,
  getApiKeys,
  deleteApiKey,
  type APIKey,
} from '../../services/intervalsIcu';
import { useAuth } from '../../hooks/useAuth';

export default function IntervalsSettings() {
  const { isAuthenticated, login } = useAuth();
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [existingKey, setExistingKey] = useState<APIKey | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadExistingKey();
    }
  }, [isAuthenticated]);

  const loadExistingKey = async () => {
    try {
      const keys = await getApiKeys();
      const intervalsKey = keys.find(k => k.serviceName === 'intervals_icu');
      if (intervalsKey) {
        setExistingKey(intervalsKey);
      }
    } catch (error) {
      console.error('Failed to load API keys:', error);
      // Don't show error to user for loading - they may not have a key yet
    }
  };

  const parseError = (error: any): string => {
    if (error instanceof Error) {
      // Check for CORS errors
      if (error.message.includes('fetch') || error.message.includes('CORS') || error.message.includes('Network')) {
        return 'Unable to connect to the server. This may be a temporary issue. Please try again later.';
      }
      // Check for auth errors
      if (error.message.includes('401') || error.message.includes('Unauthorized') || error.message.includes('Not authenticated')) {
        return 'Authentication failed. Please try logging out and logging back in.';
      }
      return error.message;
    }
    return 'An unexpected error occurred. Please try again.';
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setMessage({ type: 'error', text: 'Please enter an API key' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      await saveApiKey(apiKey);
      setMessage({ type: 'success', text: 'API key saved successfully!' });
      setApiKey('');
      await loadExistingKey();
    } catch (error) {
      setMessage({
        type: 'error',
        text: parseError(error),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove the Intervals.icu connection?')) {
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      await deleteApiKey('intervals_icu');
      setExistingKey(null);
      setMessage({ type: 'success', text: 'API key removed successfully!' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: parseError(error),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" gap={1} mb={2}>
          <LinkIcon color="primary" />
          <Typography variant="h6">Intervals.icu Integration</Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          Connect your Intervals.icu account to automatically sync your cycling activities,
          wellness metrics, and performance data.
        </Typography>

        <Link
          href="https://intervals.icu/settings"
          target="_blank"
          rel="noopener"
          sx={{ display: 'inline-block', mb: 2 }}
        >
          Get your API key from Intervals.icu settings
        </Link>

        {!isAuthenticated ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2" gutterBottom>
              You need to be logged in to connect your Intervals.icu account.
            </Typography>
            <Button
              variant="contained"
              startIcon={<Login />}
              onClick={login}
              sx={{ mt: 1 }}
            >
              Login with Patreon
            </Button>
          </Alert>
        ) : (
          <>
            {message && (
              <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
                {message.text}
              </Alert>
            )}

            {existingKey ? (
              <>
                <Alert severity="success" icon={<Check />} sx={{ mb: 2 }}>
                  <Typography variant="body2">Intervals.icu is connected</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Connected since: {new Date(existingKey.createdAt).toLocaleDateString()}
                  </Typography>
                </Alert>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleDelete}
                  disabled={saving}
                >
                  {saving ? <CircularProgress size={20} /> : 'Remove Connection'}
                </Button>
              </>
            ) : (
              <Box>
                <TextField
                  fullWidth
                  label="API Key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="API_KEY_xxxxx:athlete_id"
                  helperText="Format: API_KEY:athlete_id (e.g., API_KEY_xxxxx:12345)"
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={20} /> : <Save />}
                  onClick={handleSave}
                  disabled={saving || !apiKey.trim()}
                >
                  {saving ? 'Saving...' : 'Save API Key'}
                </Button>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
