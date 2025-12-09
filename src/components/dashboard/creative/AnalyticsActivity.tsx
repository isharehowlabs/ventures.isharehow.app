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
  TextField,
  Collapse,
  Divider,
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Key as KeyIcon,
  AccountTree as AccountTreeIcon,
} from '@mui/icons-material';
import { getBackendUrl } from '../../../utils/backendUrl';

interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  status: string;
  googleAnalyticsPropertyKey?: string;
}

export default function AnalyticsActivity() {
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingClients, setLoadingClients] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [showConnectForm, setShowConnectForm] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [connectSuccess, setConnectSuccess] = useState(false);
  const [formData, setFormData] = useState({
    propertyId: '',
    measurementId: '',
    apiKey: '',
    viewId: '',
  });
  const [clientAnalyticsKey, setClientAnalyticsKey] = useState<string>('');
  const [savingClientKey, setSavingClientKey] = useState(false);
  const [clientKeyError, setClientKeyError] = useState<string | null>(null);
  const [clientKeySuccess, setClientKeySuccess] = useState(false);

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

  // Load client analytics key when client is selected
  useEffect(() => {
    if (selectedClient && selectedClient !== 'all') {
      const client = clients.find((c) => c.id === selectedClient);
      if (client) {
        setClientAnalyticsKey(client.googleAnalyticsPropertyKey || '');
      }
    } else {
      setClientAnalyticsKey('');
    }
  }, [selectedClient, clients]);

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

  const handleConnectClick = () => {
    setShowConnectForm(!showConnectForm);
    setConnectError(null);
    setConnectSuccess(false);
  };

  const handleFormChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
    setConnectError(null);
  };

  const handleConnectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);
    setConnectError(null);
    setConnectSuccess(false);

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/analytics/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to connect' }));
        throw new Error(errorData.message || 'Failed to connect to Google Analytics');
      }

      setConnectSuccess(true);
      setShowConnectForm(false);
      // Reset form after successful connection
      setFormData({
        propertyId: '',
        measurementId: '',
        apiKey: '',
        viewId: '',
      });
      // Trigger a sync after connection
      setTimeout(() => {
        handleSync();
      }, 1000);
    } catch (error: any) {
      setConnectError(error.message || 'An error occurred while connecting to Google Analytics');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSaveClientAnalyticsKey = async () => {
    if (!selectedClient || selectedClient === 'all') {
      setClientKeyError('Please select a client first');
      return;
    }

    setSavingClientKey(true);
    setClientKeyError(null);
    setClientKeySuccess(false);

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/creative/clients/${selectedClient}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          googleAnalyticsPropertyKey: clientAnalyticsKey || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to save' }));
        throw new Error(errorData.error || 'Failed to save analytics key');
      }

      const updatedClient = await response.json();
      // Update the client in the clients array
      setClients((prev) =>
        prev.map((c) => (c.id === selectedClient ? { ...c, googleAnalyticsPropertyKey: updatedClient.googleAnalyticsPropertyKey } : c))
      );

      setClientKeySuccess(true);
      setTimeout(() => {
        setClientKeySuccess(false);
      }, 3000);
    } catch (error: any) {
      setClientKeyError(error.message || 'An error occurred while saving the analytics key');
    } finally {
      setSavingClientKey(false);
    }
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

      <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'white' }}>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={700}>
            Google Analytics Integration
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            Connect your Google Analytics account to import project data for clients.
            Analytics data will be automatically synced and displayed here.
          </Typography>
          <Button
            variant="contained"
            size="large"
            endIcon={showConnectForm ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              alignSelf: 'flex-start',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.9)',
              },
            }}
            onClick={handleConnectClick}
          >
            Connect Google Analytics
          </Button>
        </Stack>

        {/* Connection Form */}
        <Collapse in={showConnectForm}>
          <Box
            component="form"
            onSubmit={handleConnectSubmit}
            sx={{
              mt: 3,
              p: 3,
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 2,
              backdropFilter: 'blur(10px)',
            }}
          >
            <Stack spacing={3}>
              {connectSuccess && (
                <Alert severity="success" sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}>
                  Successfully connected to Google Analytics! Syncing data...
                </Alert>
              )}
              {connectError && (
                <Alert severity="error" sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'white' }}>
                  {connectError}
                </Alert>
              )}

              <Typography variant="subtitle1" fontWeight={600} sx={{ color: 'white' }}>
                Enter your Google Analytics credentials
              </Typography>

              <TextField
                fullWidth
                required
                label="Property ID"
                value={formData.propertyId}
                onChange={handleFormChange('propertyId')}
                placeholder="G-XXXXXXXXXX"
                disabled={isConnecting}
                InputProps={{
                  startAdornment: <AccountTreeIcon sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'white',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.8)',
                  },
                }}
                helperText="Your Google Analytics 4 Property ID (starts with G-)"
              />

              <TextField
                fullWidth
                required
                label="Measurement ID"
                value={formData.measurementId}
                onChange={handleFormChange('measurementId')}
                placeholder="G-XXXXXXXXXX"
                disabled={isConnecting}
                InputProps={{
                  startAdornment: <AnalyticsIcon sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'white',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.8)',
                  },
                }}
                helperText="Your GA4 Measurement ID (usually same as Property ID)"
              />

              <TextField
                fullWidth
                required
                label="API Key"
                type="password"
                value={formData.apiKey}
                onChange={handleFormChange('apiKey')}
                placeholder="Enter your Google Analytics API key"
                disabled={isConnecting}
                InputProps={{
                  startAdornment: <KeyIcon sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'white',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.8)',
                  },
                }}
                helperText="Your Google Analytics API key (from Google Cloud Console)"
              />

              <TextField
                fullWidth
                label="View ID (Optional)"
                value={formData.viewId}
                onChange={handleFormChange('viewId')}
                placeholder="Enter View ID for Universal Analytics (if applicable)"
                disabled={isConnecting}
                InputProps={{
                  startAdornment: <AccountTreeIcon sx={{ mr: 1, color: 'rgba(255, 255, 255, 0.7)' }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'white',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.8)',
                  },
                }}
                helperText="Only needed for Universal Analytics (GA3) properties"
              />

              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.2)' }} />

              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button
                  variant="outlined"
                  onClick={() => {
                    setShowConnectForm(false);
                    setConnectError(null);
                    setConnectSuccess(false);
                  }}
                  disabled={isConnecting}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'rgba(255, 255, 255, 0.8)',
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isConnecting || !formData.propertyId || !formData.measurementId || !formData.apiKey}
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.9)',
                    },
                    '&:disabled': {
                      bgcolor: 'rgba(255, 255, 255, 0.5)',
                      color: 'rgba(0, 0, 0, 0.3)',
                    },
                  }}
                  startIcon={isConnecting ? <CircularProgress size={20} /> : <AnalyticsIcon />}
                >
                  {isConnecting ? 'Connecting...' : 'Connect & Sync'}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Collapse>
      </Paper>

      {/* Client Selector */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack spacing={2}>
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

          {/* Client Analytics Key Input */}
          {selectedClient && selectedClient !== 'all' && (
            <Box>
              <Stack spacing={2}>
                <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                  Client Google Analytics Property Key
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Add or update the Google Analytics Property ID (G-XXXXXXXXXX) for this client to track their analytics growth.
                </Typography>
                {clientKeySuccess && (
                  <Alert severity="success" onClose={() => setClientKeySuccess(false)}>
                    Analytics key saved successfully!
                  </Alert>
                )}
                {clientKeyError && (
                  <Alert severity="error" onClose={() => setClientKeyError(null)}>
                    {clientKeyError}
                  </Alert>
                )}
                <Stack direction="row" spacing={2}>
                  <TextField
                    fullWidth
                    label="Google Analytics Property Key"
                    value={clientAnalyticsKey}
                    onChange={(e) => setClientAnalyticsKey(e.target.value)}
                    placeholder="G-XXXXXXXXXX"
                    helperText="Enter the client's Google Analytics 4 Property ID"
                    InputProps={{
                      startAdornment: <AccountTreeIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                    disabled={savingClientKey}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSaveClientAnalyticsKey}
                    disabled={savingClientKey || !clientAnalyticsKey.trim()}
                    startIcon={savingClientKey ? <CircularProgress size={20} /> : <KeyIcon />}
                    sx={{ minWidth: 150 }}
                  >
                    {savingClientKey ? 'Saving...' : 'Save Key'}
                  </Button>
                </Stack>
                {selectedClient && selectedClient !== 'all' && (
                  <Typography variant="caption" color="text.secondary">
                    {(() => {
                      const client = clients.find((c) => c.id === selectedClient);
                      return client?.googleAnalyticsPropertyKey
                        ? `Current key: ${client.googleAnalyticsPropertyKey}`
                        : 'No analytics key set for this client';
                    })()}
                  </Typography>
                )}
              </Stack>
            </Box>
          )}
        </Stack>
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

