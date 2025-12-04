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
import {
  saveApiCredentials,
  getApiCredentials,
  clearApiCredentials,
} from '../../services/intervalsIcu';

export default function IntervalsSettings() {
  const [apiKey, setApiKey] = useState('');
  const [athleteId, setAthleteId] = useState('');
  const [existingKey, setExistingKey] = useState<string | null>(null);
  const [existingAthleteId, setExistingAthleteId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadExistingCredentials();
  }, []);

  const loadExistingCredentials = () => {
    try {
      const { apiKey: savedKey, athleteId: savedId } = getApiCredentials();
      if (savedKey) {
        setExistingKey(savedKey);
      }
      if (savedId) {
        setExistingAthleteId(savedId);
      }
    } catch (error) {
      console.error('Failed to load credentials:', error);
    }
  };

  const handleSave = () => {
    try {
      if (!apiKey || !athleteId) {
        setMessage({ type: 'error', text: 'Please provide both API Key and Athlete ID' });
        return;
      }

      // Validate API key format (should be API_KEY:athlete_id or just API_KEY)
      if (!apiKey.includes(':') && !athleteId) {
        setMessage({ type: 'error', text: 'API Key should be in format API_KEY:athlete_id or provide Athlete ID separately' });
        return;
      }

      // If API key contains athlete ID, extract it
      let finalApiKey = apiKey;
      let finalAthleteId = athleteId;
      
      if (apiKey.includes(':') && !athleteId) {
        const parts = apiKey.split(':');
        finalApiKey = apiKey; // Keep full format for auth
        finalAthleteId = parts[1];
      }

      saveApiCredentials(finalApiKey, finalAthleteId);
      setExistingKey(finalApiKey);
      setExistingAthleteId(finalAthleteId);
      setApiKey('');
      setAthleteId('');
      setMessage({ type: 'success', text: 'API credentials saved successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save credentials' });
    }
  };

  const handleClear = () => {
    try {
      clearApiCredentials();
      setExistingKey(null);
      setExistingAthleteId(null);
      setMessage({ type: 'success', text: 'API credentials cleared' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to clear credentials' });
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <LinkIcon color="primary" />
            <Typography variant="h5" component="h2">
              Intervals.icu Integration
            </Typography>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Connect your Intervals.icu account to view your training data and wellness metrics.
            You'll need an API key from your Intervals.icu account.
          </Typography>

          {message && (
            <Alert severity={message.type} sx={{ mb: 2 }} onClose={() => setMessage(null)}>
              {message.text}
            </Alert>
          )}

          {existingKey ? (
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Check color="success" />
                <Typography variant="body1" color="success.main">
                  API Key Configured
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Key: {existingKey.substring(0, 8)}...
              </Typography>
              {existingAthleteId && (
                <Typography variant="body2" color="text.secondary">
                  Athlete ID: {existingAthleteId}
                </Typography>
              )}
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={handleClear}
                sx={{ mt: 2 }}
              >
                Clear Credentials
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
              <TextField
                id="api-key"
                label="API Key"
                placeholder="API_KEY:athlete_id or just API_KEY"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                fullWidth
                type="password"
              />
              <TextField
                id="athlete-id"
                label="Athlete ID"
                placeholder="i1234567"
                value={athleteId}
                onChange={(e) => setAthleteId(e.target.value)}
                fullWidth
                helperText="Your athlete ID (e.g., i1234567). Can be extracted from API key if it's in API_KEY:athlete_id format."
              />
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={!apiKey}
              >
                Save API Credentials
              </Button>
            </Box>
          )}

          <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              How to get your API Key:
            </Typography>
            <Typography variant="body2" component="div">
              <ol style={{ margin: 0, paddingLeft: 20 }}>
                <li>
                  Go to{' '}
                  <Link href="https://intervals.icu/settings" target="_blank" rel="noopener">
                    Intervals.icu Settings
                  </Link>
                </li>
                <li>Find the "Developer Settings" section</li>
                <li>Generate or copy your API key</li>
                <li>The key format is usually: API_KEY:athlete_id</li>
                <li>Paste it above and save</li>
              </ol>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
