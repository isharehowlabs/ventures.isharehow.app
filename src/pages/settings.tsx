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

            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.dashboard.showTaskList}
                    onChange={(e) => updateDashboardSettings({ showTaskList: e.target.checked })}
                  />
                }
                label="Show Task List"
              />
              <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4, mt: 0.5 }}>
                Display the session task list in the dashboard
              </Typography>
            </Box>

            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.dashboard.showLiveUpdates}
                    onChange={(e) => updateDashboardSettings({ showLiveUpdates: e.target.checked })}
                  />
                }
                label="Show Live Updates"
              />
              <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4, mt: 0.5 }}>
                Display real-time updates in the dashboard
              </Typography>
            </Box>

            <Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.dashboard.autoRefresh}
                    onChange={(e) => updateDashboardSettings({ autoRefresh: e.target.checked })}
                  />
                }
                label="Auto Refresh"
              />
              <Typography variant="caption" color="text.secondary" display="block" sx={{ ml: 4, mt: 0.5 }}>
                Automatically refresh dashboard data
              </Typography>
            </Box>

            {settings.dashboard.autoRefresh && (
              <Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  Refresh Interval: {settings.dashboard.refreshInterval} seconds
                </Typography>
                <Slider
                  value={settings.dashboard.refreshInterval}
                  onChange={(_, value) => updateDashboardSettings({ refreshInterval: value as number })}
                  min={60}
                  max={1800}
                  step={60}
                  marks={[
                    { value: 60, label: '1m' },
                    { value: 300, label: '5m' },
                    { value: 600, label: '10m' },
                    { value: 1800, label: '30m' },
                  ]}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}s`}
                />
              </Box>
            )}
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
        <Paper elevation={2} sx={{ p: 3 }}>
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

