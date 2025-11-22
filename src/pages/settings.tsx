import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  TextField,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  ViewModule as ViewModuleIcon,
  ExpandMore,
  Refresh,
  RestartAlt,
} from '@mui/icons-material';
import AppShell from '../components/AppShell';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { useSettings } from '../hooks/useSettings';

const PANEL_LABELS: Record<string, string> = {
  streaming: 'Streaming Panel',
  figma: 'Designs & Code Panel',
  docs: 'Documents Panel',
  learning: 'Learning Hub Panel',
  aiJournal: 'AI Journal Panel',
  web3: 'Web3 Panel',
};

function SettingsPage() {
  const { settings, updateDashboardSettings, updatePanelSettings, resetSettings } = useSettings();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/profile', { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => console.error('Failed to fetch user profile:', err));
  }, []);
  const [showResetAlert, setShowResetAlert] = useState(false);
  const [panelOrders, setPanelOrders] = useState<Record<string, number>>(() => {
    const orders: Record<string, number> = {};
    Object.entries(settings.panels).forEach(([key, config]) => {
      orders[key] = config.order;
    });
    return orders;
  });

  // Sync panel orders when settings change
  useEffect(() => {
    const orders: Record<string, number> = {};
    Object.entries(settings.panels).forEach(([key, config]) => {
      orders[key] = config.order;
    });
    setPanelOrders(orders);
  }, [settings.panels]);

  const handleReset = () => {
    resetSettings();
    setShowResetAlert(true);
    setTimeout(() => setShowResetAlert(false), 3000);
    
    // Reset panel orders state
    const defaultOrders: Record<string, number> = {};
    Object.entries(settings.panels).forEach(([key, config]) => {
      defaultOrders[key] = config.order;
    });
    setPanelOrders(defaultOrders);
  };

  const handlePanelOrderChange = (panelKey: string, newOrder: number) => {
    const oldOrder = panelOrders[panelKey];
    
    // Find the panel that currently has the target order
    const swapKey = Object.entries(panelOrders).find(
      ([k, o]) => k !== panelKey && o === newOrder
    )?.[0];
    
    // Update both panels' orders
    const updatedOrders = { ...panelOrders };
    updatedOrders[panelKey] = newOrder;
    if (swapKey) {
      updatedOrders[swapKey] = oldOrder;
      updatePanelSettings(swapKey as any, { order: oldOrder });
    }
    
    setPanelOrders(updatedOrders);
    updatePanelSettings(panelKey as any, { order: newOrder });
  };

  // Admin check: Super Admin if Patreon ID 56776112 or user.isAdmin
  const isAdmin = user?.isAdmin || user?.patreonId === 56776112;

  return (
    <AppShell active="about">
      <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
          <SettingsIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(45deg, #9146FF, #ff6b6b, #4ecdc4)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Settings
          </Typography>
        </Stack>

        {showResetAlert && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setShowResetAlert(false)}>
            Settings have been reset to default values.
          </Alert>
        )}

        {/* Dashboard Settings */}
        <Paper elevation={2} sx={{ p: 4, mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <DashboardIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Dashboard Settings
            </Typography>
          </Stack>
          <Divider sx={{ mb: 3 }} />
          <Stack spacing={3}>
            <FormControl fullWidth>
              <InputLabel>Default Tab</InputLabel>
              <Select
                value={settings.dashboard.defaultTab}
                label="Default Tab"
                onChange={(e) => updateDashboardSettings({ defaultTab: Number(e.target.value) })}
              >
                <MenuItem value={0}>Streaming</MenuItem>
                <MenuItem value={1}>Designs & Code</MenuItem>
                <MenuItem value={2}>Documents</MenuItem>
                <MenuItem value={3}>Learning Hub</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Layout Style</InputLabel>
              <Select
                value={settings.dashboard.layout}
                label="Layout Style"
                onChange={(e) => updateDashboardSettings({ layout: e.target.value as 'grid' | 'list' })}
              >
                <MenuItem value="grid">Grid</MenuItem>
                <MenuItem value="list">List</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Paper>

        {/* Panel Settings */}
        <Paper elevation={2} sx={{ p: 4, mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <ViewModuleIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Component Panel Settings
            </Typography>
          </Stack>

          <Divider sx={{ mb: 3 }} />

          <Stack spacing={2}>
            {Object.entries(settings.panels).map(([key, config]) => (
              <Accordion key={key} defaultExpanded={key === 'streaming'}>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ width: '100%', pr: 2 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={config.visible}
                          onChange={(e) => {
                            e.stopPropagation();
                            updatePanelSettings(key as any, { visible: e.target.checked });
                          }}
                          onClick={(e) => e.stopPropagation()}
                        />
                      }
                      label={PANEL_LABELS[key] || key}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <Box sx={{ flexGrow: 1 }} />
                    <Typography variant="caption" color="text.secondary">
                      Order: {config.order + 1}
                    </Typography>
                    {/* Add link for Web3 Panel */}
                    {key === 'web3' && (
                      <Button
                        href="/web3"
                        target="_blank"
                        rel="noopener"
                        variant="outlined"
                        color="primary"
                        size="small"
                        sx={{ ml: 2 }}
                      >
                        Open Web3 Panel
                      </Button>
                    )}
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Panel Order (1-{Object.keys(settings.panels).length})
                      </Typography>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={panelOrders[key] === 0}
                          onClick={() => {
                            const newOrder = Math.max(0, panelOrders[key] - 1);
                            handlePanelOrderChange(key, newOrder);
                          }}
                        >
                          ↑ Move Up
                        </Button>
                        <TextField
                          type="number"
                          size="small"
                          value={panelOrders[key] + 1}
                          onChange={(e) => {
                            const newOrder = Math.max(0, Math.min(Object.keys(settings.panels).length - 1, Number(e.target.value) - 1));
                            handlePanelOrderChange(key, newOrder);
                          }}
                          inputProps={{ min: 1, max: Object.keys(settings.panels).length }}
                          sx={{ width: 80 }}
                        />
                        <Button
                          size="small"
                          variant="outlined"
                          disabled={panelOrders[key] === Object.keys(settings.panels).length - 1}
                          onClick={() => {
                            const newOrder = Math.min(Object.keys(settings.panels).length - 1, panelOrders[key] + 1);
                            handlePanelOrderChange(key, newOrder);
                          }}
                        >
                          ↓ Move Down
                        </Button>
                      </Stack>
                    </Box>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            ))}
          </Stack>
        </Paper>

        {/* Reset Button */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Reset Settings
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Restore all settings to their default values
              </Typography>
            </Box>
            <Button
              variant="outlined"
              color="error"
              startIcon={<RestartAlt />}
              onClick={handleReset}
            >
              Reset to Defaults
            </Button>
          </Stack>
        </Paper>

        {/* Admin Section: Q&A Moderation Only */}
        {isAdmin && (
          <Paper elevation={3} sx={{ p: 4, mb: 3, border: '2px solid gold' }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <SettingsIcon sx={{ color: 'gold', fontSize: 32 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'gold' }}>
                Admin Section
              </Typography>
            </Stack>
            <Divider sx={{ mb: 3, borderColor: 'gold' }} />
            {/* Q&A Moderation Controls */}
            <Typography variant="body1" sx={{ mb: 2 }}>
              <b>Community Q&A Moderation</b>: Review, approve, or remove questions and answers. Set question visibility duration. Manage categories and highlight featured questions. Bulk moderation and audit logging supported.
            </Typography>
            <Stack spacing={2}>
              <Button variant="contained" color="primary">Review Pending Questions</Button>
              <Button variant="contained" color="secondary">Manage Answers</Button>
              <Button variant="contained" color="info">Bulk Moderation</Button>
              <Stack direction="row" spacing={2} alignItems="center">
                <Typography variant="body2" sx={{ color: 'gold', minWidth: 180 }}>
                  Set Question Visibility (hours):
                </Typography>
                <TextField type="number" size="small" defaultValue={48} inputProps={{ min: 1, max: 168 }} sx={{ width: 100 }} />
                <Button variant="outlined" color="success">Update</Button>
              </Stack>
              <Button variant="outlined" color="warning">Manage Categories</Button>
              <Button variant="outlined" color="secondary">Bulk Category Management</Button>
            </Stack>
            <Divider sx={{ my: 3, borderColor: 'gold' }} />
            {/* Audit Logging Section */}
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'gold', mb: 2 }}>
              Audit Log (Render)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              All admin actions are logged for review and compliance. Logs are available in the Render dashboard.
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, background: 'rgba(255,255,224,0.15)', border: '1px solid gold' }}>
              <Typography variant="body2" color="gold">
                {/* Example log entries - replace with real log data */}
                [2025-11-22 10:15] Admin Jane approved question #123<br />
                [2025-11-22 10:16] Admin Jane removed answer #456<br />
                [2025-11-22 10:17] Admin Jane updated category "Streaming"<br />
                [2025-11-22 10:18] Admin Jane performed bulk moderation<br />
              </Typography>
            </Paper>
          </Paper>
        )}
      </Box>
    </AppShell>
  );
}

function App() {
  return (
    <ProtectedRoute>
      <SettingsPage />
    </ProtectedRoute>
  );
}

export default App;

