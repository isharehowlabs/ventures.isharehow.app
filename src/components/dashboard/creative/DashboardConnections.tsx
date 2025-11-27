'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Stack,
  Chip,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  TrendingUp as RiseIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';

interface DashboardConnection {
  id: string;
  name: string;
  type: 'cowork' | 'rise';
  enabled: boolean;
  clients: string[];
}

import { getBackendUrl } from '../../../utils/backendUrl';
import { useEffect } from 'react';

export default function DashboardConnections() {
  const [connections, setConnections] = useState<DashboardConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all clients and their dashboard connections
  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    setLoading(true);
    setError(null);
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/creative/clients`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }

      const data = await response.json();
      const clients = data.clients || [];

      // Group clients by dashboard type
      const dashboardMap: Record<string, { clients: string[]; enabled: boolean }> = {
        cowork: { clients: [], enabled: true },
        rise: { clients: [], enabled: true },
      };

      clients.forEach((client: any) => {
        const systems = client.systemsConnected || [];
        systems.forEach((system: string) => {
          const type = system.toLowerCase().includes('cowork') ? 'cowork' : 
                      system.toLowerCase().includes('rise') ? 'rise' : null;
          if (type && dashboardMap[type]) {
            dashboardMap[type].clients.push(client.name);
          }
        });
      });

      setConnections([
        {
          id: '1',
          name: 'Co-Work Dashboard',
          type: 'cowork',
          enabled: dashboardMap.cowork.enabled,
          clients: dashboardMap.cowork.clients,
        },
        {
          id: '2',
          name: 'RISE Dashboard',
          type: 'rise',
          enabled: dashboardMap.rise.enabled,
          clients: dashboardMap.rise.clients,
        },
      ]);
    } catch (err: any) {
      console.error('Error fetching connections:', err);
      setError(err.message || 'Failed to load dashboard connections');
    } finally {
      setLoading(false);
    }
  };
  const [selectedConnection, setSelectedConnection] = useState<DashboardConnection | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);

  const handleToggle = async (id: string, connection: DashboardConnection) => {
    const newEnabled = !connection.enabled;
    
    try {
      // Update all clients with this dashboard type
      const backendUrl = getBackendUrl();
      const clientsResponse = await fetch(`${backendUrl}/api/creative/clients`, {
        credentials: 'include',
      });

      if (!clientsResponse.ok) {
        throw new Error('Failed to fetch clients');
      }

      const clientsData = await clientsResponse.json();
      const clients = clientsData.clients || [];

      // Update each client's dashboard connection
      for (const client of clients) {
        const systems = client.systemsConnected || [];
        if (systems.includes(connection.name) || systems.some((s: string) => 
          s.toLowerCase().includes(connection.type))) {
          
          const dashboardTypes = [...new Set([...systems, connection.type])];
          const enabledMap: Record<string, boolean> = {};
          dashboardTypes.forEach((type: string) => {
            enabledMap[type] = type === connection.type ? newEnabled : true;
          });

          await fetch(`${backendUrl}/api/creative/clients/${client.id}/dashboard-connections`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              dashboardTypes: dashboardTypes,
              enabled: enabledMap,
            }),
          });
        }
      }

      // Update local state
      setConnections((prev) =>
        prev.map((conn) =>
          conn.id === id ? { ...conn, enabled: newEnabled } : conn
        )
      );
    } catch (err: any) {
      console.error('Error toggling connection:', err);
      alert(err.message || 'Failed to update dashboard connection');
    }
  };

  const handleConfigure = (connection: DashboardConnection) => {
    setSelectedConnection(connection);
    setConfigDialogOpen(true);
  };

  const getIcon = (type: string) => {
    return type === 'cowork' ? <DashboardIcon /> : <RiseIcon />;
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Dashboard Connections
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Admin control for client dashboards including Co-Work and Rise dashboards
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Configure which clients have access to which dashboards. You can enable/disable
        dashboard access and manage client permissions.
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={2}>
        {connections.map((connection) => (
          <Paper key={connection.id} sx={{ p: 3 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Stack direction="row" spacing={2} alignItems="center" flex={1}>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: connection.enabled ? 'primary.main' : 'grey.300',
                    color: connection.enabled ? 'white' : 'text.secondary',
                  }}
                >
                  {getIcon(connection.type)}
                </Box>
                <Box flex={1}>
                  <Typography variant="h6" fontWeight={600}>
                    {connection.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {connection.clients.length} client(s) connected
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                    {connection.clients.map((client) => (
                      <Chip key={client} label={client} size="small" />
                    ))}
                  </Stack>
                </Box>
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <FormControlLabel
                  control={
                    <Switch
                      checked={connection.enabled}
                      onChange={() => handleToggle(connection.id, connection)}
                      disabled={loading}
                    />
                  }
                  label={connection.enabled ? 'Enabled' : 'Disabled'}
                />
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleConfigure(connection)}
                >
                  Configure
                </Button>
              </Stack>
            </Stack>
          </Paper>
        ))}
        </Stack>
      )}

      {/* Configuration Dialog */}
      <Dialog
        open={configDialogOpen}
        onClose={() => setConfigDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Configure {selectedConnection?.name}
        </DialogTitle>
        <DialogContent>
          {selectedConnection && (
            <Box>
              <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                Connected Clients
              </Typography>
              <List>
                {selectedConnection.clients.map((client, index) => (
                  <React.Fragment key={client}>
                    <ListItem>
                      <ListItemText primary={client} />
                      <ListItemSecondaryAction>
                        <Chip
                          icon={<CheckCircleIcon />}
                          label="Connected"
                          color="success"
                          size="small"
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < selectedConnection.clients.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
              <Alert severity="info" sx={{ mt: 2 }}>
                Client access can be managed from the Client List. Add or remove
                clients from this dashboard connection.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

