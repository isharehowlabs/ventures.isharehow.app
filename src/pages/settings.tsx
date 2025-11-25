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
  Tabs,
  Tab,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  ViewModule as ViewModuleIcon,
  ExpandMore,
  Refresh,
  RestartAlt,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import AppShell from '../components/AppShell';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { useSettings } from '../hooks/useSettings';
import { getBackendUrl } from '../utils/backendUrl';

const PANEL_LABELS: Record<string, string> = {
  streaming: 'Streaming Panel',
  figma: 'Designs & Code Panel',
  docs: 'Documents Panel',
  learning: 'Learning Hub Panel',
  aiJournal: 'AI Journal Panel',
  web3: 'Web3 Panel',
  aiAgent: 'AI Agent Panel',
};

function SettingsPage() {
  const { settings, updateDashboardSettings, updatePanelSettings, updateApiKeys, resetSettings } = useSettings();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const backendUrl = getBackendUrl();
        console.log('[Settings] Fetching profile from:', `${backendUrl}/api/profile`);
        const response = await fetch(`${backendUrl}/api/profile`, { credentials: 'include' });
        console.log('[Settings] Profile response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('[Settings] Profile data received:', data);
          setUser(data);
        } else {
          // Try to get error message
          let errorMessage = `HTTP ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch (e) {
            const text = await response.text();
            console.error('[Settings] Failed to fetch profile (non-JSON):', response.status, text.substring(0, 200));
          }
          console.error('[Settings] Failed to fetch user profile:', errorMessage);
        }
      } catch (err) {
        console.error('[Settings] Error fetching user profile:', err);
      }
    };
    fetchProfile();
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

  const handleSendNotification = async () => {
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      setNotificationError('Title and message are required');
      return;
    }

    setNotificationSending(true);
    setNotificationError(null);
    setNotificationSuccess(null);

    try {
      const backendUrl = getBackendUrl();
      
      if (notificationTarget === 'all') {
        // For now, send to all users by making a request to a special endpoint
        // We'll need to create this endpoint in the backend
        const response = await fetch(`${backendUrl}/api/notifications/broadcast`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: notificationType,
            title: notificationTitle,
            message: notificationMessage,
            metadata: {
              admin: true,
              sentBy: user?.username || 'admin',
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to send notification' }));
          throw new Error(errorData.error || 'Failed to send notification');
        }

        setNotificationSuccess('Notification sent to all users successfully!');
      } else {
        // Send to current user
        const response = await fetch(`${backendUrl}/api/notifications`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: notificationType,
            title: notificationTitle,
            message: notificationMessage,
            metadata: {
              admin: true,
              sentBy: user?.username || 'admin',
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to send notification' }));
          throw new Error(errorData.error || 'Failed to send notification');
        }

        setNotificationSuccess('Notification sent successfully!');
      }

      // Clear form
      setNotificationTitle('');
      setNotificationMessage('');
    } catch (error: any) {
      setNotificationError(error.message || 'Failed to send notification');
    } finally {
      setNotificationSending(false);
    }
  };

  // Admin check: Super Admin if Patreon ID 56776112, user.isAdmin, or username/id is 'isharehow'
  const isAdmin = user?.isAdmin || 
                  user?.patreonId === 56776112 || 
                  user?.username === 'isharehow' || 
                  user?.id === 'isharehow' ||
                  (user?.username && user.username.toLowerCase() === 'isharehow') ||
                  (user?.id && String(user.id).toLowerCase() === 'isharehow');
  
  // Tab state
  const [activeTab, setActiveTab] = useState(0);
  
  // Admin notification form state
  const [notificationType, setNotificationType] = useState<string>('admin');
  const [notificationTitle, setNotificationTitle] = useState<string>('');
  const [notificationMessage, setNotificationMessage] = useState<string>('');
  const [notificationTarget, setNotificationTarget] = useState<string>('self'); // 'self' or 'all'
  const [notificationSending, setNotificationSending] = useState<boolean>(false);
  const [notificationSuccess, setNotificationSuccess] = useState<string | null>(null);
  const [notificationError, setNotificationError] = useState<string | null>(null);

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

        {/* Tabs */}
        <Paper elevation={2} sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="General" icon={<SettingsIcon />} iconPosition="start" />
            {isAdmin && <Tab label="Admin" icon={<AdminPanelSettingsIcon />} iconPosition="start" />}
          </Tabs>
        </Paper>

        {/* General Settings Tab */}
        {activeTab === 0 && (
          <Box>

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

        {/* API Keys Settings */}
        <Paper elevation={2} sx={{ p: 4, mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <SettingsIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              API Keys
            </Typography>
          </Stack>
          <Divider sx={{ mb: 3 }} />
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Revid.ai API Key"
              type="password"
              value={settings.apiKeys?.revidApiKey || ''}
              onChange={(e) => updateApiKeys({ revidApiKey: e.target.value })}
              placeholder="Enter your Revid.ai API key"
              helperText="Required for AI Agent panel to generate and auto-post videos"
            />
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
          </Box>
        )}

        {/* Admin Tab */}
        {activeTab === 1 && isAdmin && (
          <Box>
            {/* Notification System */}
            <Paper elevation={3} sx={{ p: 4, mb: 3, border: '2px solid gold' }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <NotificationsIcon sx={{ color: 'gold', fontSize: 32 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'gold' }}>
                  Send Notification
                </Typography>
              </Stack>
              <Divider sx={{ mb: 3, borderColor: 'gold' }} />
              
              {notificationSuccess && (
                <Alert severity="success" sx={{ mb: 3 }} onClose={() => setNotificationSuccess(null)}>
                  {notificationSuccess}
                </Alert>
              )}
              
              {notificationError && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setNotificationError(null)}>
                  {notificationError}
                </Alert>
              )}

              <Stack spacing={3}>
                <FormControl fullWidth>
                  <InputLabel>Notification Type</InputLabel>
                  <Select
                    value={notificationType}
                    label="Notification Type"
                    onChange={(e) => setNotificationType(e.target.value)}
                  >
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="system">System</MenuItem>
                    <MenuItem value="live-update">Live Update</MenuItem>
                    <MenuItem value="board">Board</MenuItem>
                    <MenuItem value="timer">Timer</MenuItem>
                    <MenuItem value="twitch">Twitch</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Target</InputLabel>
                  <Select
                    value={notificationTarget}
                    label="Target"
                    onChange={(e) => setNotificationTarget(e.target.value)}
                  >
                    <MenuItem value="self">Send to Myself (Test)</MenuItem>
                    <MenuItem value="all">Send to All Users</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Title"
                  value={notificationTitle}
                  onChange={(e) => setNotificationTitle(e.target.value)}
                  placeholder="Enter notification title"
                  required
                />

                <TextField
                  fullWidth
                  label="Message"
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  placeholder="Enter notification message"
                  multiline
                  rows={4}
                  required
                />

                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<NotificationsIcon />}
                  onClick={handleSendNotification}
                  disabled={notificationSending || !notificationTitle.trim() || !notificationMessage.trim()}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  {notificationSending ? 'Sending...' : 'Send Notification'}
                </Button>
              </Stack>
            </Paper>

            {/* Q&A Moderation Section */}
            <Paper elevation={3} sx={{ p: 4, mb: 3, border: '2px solid gold' }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <SettingsIcon sx={{ color: 'gold', fontSize: 32 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'gold' }}>
                  Community Q&A Moderation
                </Typography>
              </Stack>
              <Divider sx={{ mb: 3, borderColor: 'gold' }} />
              <Typography variant="body1" sx={{ mb: 2 }}>
                Review, approve, or remove questions and answers. Set question visibility duration. Manage categories and highlight featured questions. Bulk moderation and audit logging supported.
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
          </Box>
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

