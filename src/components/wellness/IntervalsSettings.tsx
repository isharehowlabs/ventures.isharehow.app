import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  Link,
} from '@mui/material';
import { Save, Check, Link as LinkIcon } from '@mui/icons-material';

const STORAGE_KEY = 'intervals_icu_api_key';

export default function IntervalsSettings() {
  const [apiKey, setApiKey] = useState('');
  const [existingKey, setExistingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadExistingKey();
  }, []);

  const loadExistingKey = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setExistingKey(saved);
      }
    } catch (error) {
      console.error('Failed to load API key:', error);
    }
  };

  const handleSave = () => {
    if (!apiKey.trim()) {
      setMessage({ type: 'error', text: 'Please enter an API key' });
      return;
    }

    // Validate format (should be API_KEY_xxxxx:athlete_id)
    if (!apiKey.includes(':')) {
      setMessage({ type: 'error', text: 'Invalid format. API key should include ":" (e.g., API_KEY_xxxxx:12345)' });
      return;
    }

    try {
      localStorage.setItem(STORAGE_KEY, apiKey);
      setExistingKey(apiKey);
      setMessage({ type: 'success', text: 'API key saved successfully!' });
      setApiKey('');
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to save API key. Please check your browser settings.',
      });
    }
  };

  const handleDelete = () => {
    if (!confirm('Are you sure you want to remove the Intervals.icu connection?')) {
      return;
    }

    try {
      localStorage.removeItem(STORAGE_KEY);
      setExistingKey(null);
      setMessage({ type: 'success', text: 'API key removed successfully!' });
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to remove API key.',
      });
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
          wellness metrics, and performance data. Your API key is stored locally in your browser.
        </Typography>

        <Link
          href="https://intervals.icu/settings"
          target="_blank"
          rel="noopener"
          sx={{ display: 'inline-block', mb: 2 }}
        >
          Get your API key from Intervals.icu settings
        </Link>

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
                API Key: {existingKey.substring(0, 15)}...
              </Typography>
            </Alert>
            <Button
              variant="outlined"
              color="error"
              onClick={handleDelete}
            >
              Remove Connection
            </Button>
          </>
        ) : (
          <Box>
            <TextField
              id="intervals-api-key"
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
              startIcon={<Save />}
              onClick={handleSave}
              disabled={!apiKey.trim()}
            >
              Save API Key
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
