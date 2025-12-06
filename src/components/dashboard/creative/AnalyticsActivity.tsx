'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { getBackendUrl } from '../../../utils/backendUrl';

interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  status: string;
}

export default function AnalyticsActivity() {
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingClients, setLoadingClients] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/creative/clients`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setClients(data.clients || []);
        }
      } catch (err) {
        console.error('Error fetching clients:', err);
      } finally {
        setLoadingClients(false);
      }
    };
    fetchClients();
  }, []);

  const handleSync = async () => {
    setLoading(true);
    try {
      // TODO: Call Google Analytics API
      // await fetch('/api/analytics/sync', { method: 'POST' });
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call
      setLastSync(new Date());
    } catch (error) {
      console.error('Failed to sync analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    // TODO: Generate and download report
    console.log('Exporting analytics report...');
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Analytics & Activity
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track client usage, activity, and system analytics with Google Analytics integration
          </Typography>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={handleSync}
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : 'Sync Analytics'}
          </Button>
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={handleExport}
          >
            Export Report
          </Button>
        </Stack>
      </Stack>

      {lastSync && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Last synced: {lastSync.toLocaleString()}
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2" fontWeight={600} gutterBottom>
          Google Analytics Integration
        </Typography>
        <Typography variant="body2">
          Connect your Google Analytics account to import project data for clients.
          Analytics data will be automatically synced and displayed here.
        </Typography>
        <Button
          size="small"
          variant="outlined"
          sx={{ mt: 1 }}
          onClick={() => {
            // TODO: Open Google Analytics OAuth flow
            console.log('Connect Google Analytics');
          }}
        >
          Connect Google Analytics
        </Button>
      </Alert>

      {/* Client Selector */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Select Client</InputLabel>
          <Select
            value={selectedClient}
            label="Select Client"
            onChange={(e) => setSelectedClient(e.target.value)}
            disabled={loadingClients}
          >
            <MenuItem value="all">All Clients</MenuItem>
            {clients.map((client) => (
              <MenuItem key={client.id} value={client.id}>
                {client.company || client.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Paper>

      {/* Analytics Metrics */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <AnalyticsIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" fontWeight={700}>
              --
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Sessions
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <AnalyticsIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" fontWeight={700}>
              --
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Users
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <AnalyticsIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
            <Typography variant="h4" fontWeight={700}>
              --
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Page Views
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Activity Log */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Recent Activity
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Activity logs will appear here once Google Analytics is connected and synced.
        </Typography>
      </Paper>
    </Box>
  );
}

