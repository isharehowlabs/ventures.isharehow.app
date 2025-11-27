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

// Mock data
const mockConnections: DashboardConnection[] = [
  {
    id: '1',
    name: 'Co-Work Dashboard',
    type: 'cowork',
    enabled: true,
    clients: ['Example Inc.', 'Kabloom LLC.'],
  },
  {
    id: '2',
    name: 'RISE Dashboard',
    type: 'rise',
    enabled: true,
    clients: ['Kabloom LLC.'],
  },
];

export default function DashboardConnections() {
  const [connections, setConnections] = useState<DashboardConnection[]>(mockConnections);
  const [selectedConnection, setSelectedConnection] = useState<DashboardConnection | null>(null);
  const [configDialogOpen, setConfigDialogOpen] = useState(false);

  const handleToggle = (id: string) => {
    setConnections((prev) =>
      prev.map((conn) =>
        conn.id === id ? { ...conn, enabled: !conn.enabled } : conn
      )
    );
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
                      onChange={() => handleToggle(connection.id)}
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

