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
import { Save, Check, Link as LinkIcon } from '@mui/icons-material';
import {
  saveApiKey,
  getApiKeys,
  deleteApiKey,
  type APIKey,
} from '../../services/intervalsIcu';

export default function IntervalsSettings() {
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);
  const [existingKey, setExistingKey] = useState<APIKey | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadExistingKey();
  }, []);

  const loadExistingKey = async () => {
    try {
      const keys = await getApiKeys();
      const intervalsKey = keys.find(k => k.serviceName === 'intervals_icu');
      if (intervalsKey) {
        setExistingKey(intervalsKey);
      }
    } catch (error) {
      console.error('Failed to load API keys:', error);
    }
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
        text: error instanceof Error ? error.message : 'Failed to save API key',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to remove your Intervals.icu API key?')) {
      return;
    }

    try {
      await deleteApiKey('intervals_icu');
      setExistingKey(null);
      setMessage({ type: 'success', text: 'API key removed successfully' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to remove API key',
      });
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Intervals.icu Integration
        </Typography>
        
        <Typography variant="body2" color="text.secondary" paragraph>
          Connect your Intervals.icu account to import activity data, RPE, Feel, power metrics, heart rate data, and wellness tracking.
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Link
            href="https://intervals.icu/settings"
            target="_blank"
            rel="noopener noreferrer"
            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
          >
            <LinkIcon fontSize="small" />
            Get your API key from Intervals.icu settings
          </Link>
        </Box>

        {message && (
          <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
            {message.text}
          </Alert>
        )}

        {existingKey ? (
          <Box>
            <Alert severity="success" icon={<Check />} sx={{ mb: 2 }}>
              Intervals.icu is connected
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Connected since: {new Date(existingKey.createdAt).toLocaleDateString()}
              </Typography>
            </Alert>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant="outlined" color="error" onClick={handleDelete}>
                Remove Connection
              </Button>
            </Box>
          </Box>
        ) : (
          <Box>
            <TextField
              fullWidth
              label="API Key"
              placeholder="API_KEY_xxxxx:athlete_id"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              sx={{ mb: 2 }}
              helperText="Format: API_KEY:athlete_id (e.g., API_KEY_xxxxx:12345)"
            />
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <Save />}
              onClick={handleSave}
              disabled={saving || !apiKey.trim()}
            >
              {saving ? 'Saving...' : 'Save API Key'}
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
