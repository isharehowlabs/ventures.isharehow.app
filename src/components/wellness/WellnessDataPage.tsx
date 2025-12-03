import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Link as MuiLink,
} from '@mui/material';
import {
  OpenInNew,
} from '@mui/icons-material';

const STORAGE_KEY = 'intervals_icu_api_key';

export default function WellnessDataPage() {
  const [athleteId, setAthleteId] = useState<string | null>(null);

  useState(() => {
    // Get athlete ID from stored API key
    try {
      const apiKey = localStorage.getItem(STORAGE_KEY);
      if (apiKey && apiKey.includes(':')) {
        const id = apiKey.split(':')[1];
        setAthleteId(id);
      }
    } catch (error) {
      console.error('Failed to get athlete ID:', error);
    }
  });

  if (!athleteId) {
    return (
      <Alert severity="info">
        <Typography variant="body2">
          Please configure your Intervals.icu API key above to get started.
        </Typography>
      </Alert>
    );
  }

  const intervalsUrl = `https://intervals.icu/athlete/${athleteId}`;

  return (
    <Box sx={{ width: '100%' }}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            View Your Intervals.icu Data
          </Typography>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2" gutterBottom>
              Due to browser security restrictions (CORS), we cannot directly access your Intervals.icu data 
              from this dashboard.
            </Typography>
            <Typography variant="body2">
              Click the button below to view your activities, wellness metrics, and performance analytics 
              directly on Intervals.icu.
            </Typography>
          </Alert>

          <Button
            variant="contained"
            size="large"
            startIcon={<OpenInNew />}
            href={intervalsUrl}
            target="_blank"
            rel="noopener noreferrer"
            fullWidth
          >
            Open Intervals.icu Dashboard
          </Button>

          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              What you'll see:
            </Typography>
            <Typography variant="body2" component="ul" sx={{ pl: 2 }}>
              <li>Recent cycling activities and workouts</li>
              <li>Wellness metrics (HRV, sleep, mood, fatigue)</li>
              <li>Performance charts and analytics</li>
              <li>Training load and fitness trends</li>
              <li>Calendar view with planned workouts</li>
            </Typography>
          </Box>

          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              <strong>Note:</strong> Your API key (athlete ID: {athleteId}) is stored locally in your browser 
              and is not sent to any server except Intervals.icu directly.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
