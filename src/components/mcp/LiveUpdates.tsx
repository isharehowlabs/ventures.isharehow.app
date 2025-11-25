import { useEffect, useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Chip, 
  IconButton, 
  Tooltip, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  TextField, 
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Notifications, NotificationsOff, Add as AddIcon } from '@mui/icons-material';
import { getSocket } from '../../utils/socket';
import { getBackendUrl } from '../../utils/backendUrl';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../contexts/NotificationContext';

interface Update {
  id: string;
  type: 'token' | 'component' | 'document' | 'twitch' | 'cowork' | 'admin';
  message: string;
  timestamp: Date;
  author?: string;
}

export default function LiveUpdates() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [updates, setUpdates] = useState<Update[]>([]);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isLive, setIsLive] = useState(false);
  const [adminDialogOpen, setAdminDialogOpen] = useState(false);
  const [adminMessage, setAdminMessage] = useState('');
  const [adminType, setAdminType] = useState<'admin' | 'twitch' | 'cowork'>('admin');
  const [isPosting, setIsPosting] = useState(false);

  // Check if user is admin (paid member or specific email)
  const isAdmin = user?.isPaidMember || user?.email === 'soc@isharehowlabs.com' || user?.email === 'admin@isharehowlabs.com';

  // Function to send browser notification
  const sendNotification = (title: string, options?: NotificationOptions) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: title, // Prevent duplicate notifications
        requireInteraction: false,
        ...options,
      });

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close();
      }, 5000);

      // Handle click to focus window
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  };

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      
      if (Notification.permission === 'default') {
        // Auto-request permission
        Notification.requestPermission().then((permission) => {
          setNotificationPermission(permission);
        });
      }
    }
  }, []);

  useEffect(() => {
    const socket = getSocket();

    // Check Twitch live status
    const checkTwitchStatus = async () => {
      try {
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/twitch/status`, {
          credentials: 'include',
        });
        
        if (response.ok) {
          const data = await response.json();
          setIsLive((prevIsLive) => {
            const wasLive = prevIsLive;
            const nowLive = data.isLive || false;
            
            if (!wasLive && nowLive) {
              // Just went live
              const update = {
                id: Date.now().toString(),
                type: 'twitch' as const,
                message: '🔴 You\'re now LIVE on Twitch!',
                timestamp: new Date(),
              };
              setUpdates((prev) => [update, ...prev.slice(0, 9)]);
              sendNotification('🔴 Live on Twitch!', {
                body: 'Your stream is now live. Join the co-work session!',
                tag: 'twitch-live',
              });
            }
            
            return nowLive;
          });
        }
      } catch (err) {
        // Silently fail - endpoint might not exist yet
        console.log('Twitch status check failed (endpoint may not be available)');
      }
    };

    // Check cowork time (you can customize this logic)
    const checkCoworkTime = () => {
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay(); // 0 = Sunday, 5 = Friday
      
      // Define cowork hours (e.g., 9 AM - 5 PM, Monday-Friday)
      const isCoworkHour = hour >= 9 && hour < 17;
      const isCoworkDay = day >= 1 && day <= 5; // Monday to Friday
      
      if (isCoworkHour && isCoworkDay) {
        // Check if we haven't notified in the last hour
        const lastCoworkNotification = localStorage.getItem('lastCoworkNotification');
        const oneHourAgo = Date.now() - 60 * 60 * 1000;
        
        if (!lastCoworkNotification || parseInt(lastCoworkNotification) < oneHourAgo) {
          const update = {
            id: Date.now().toString(),
            type: 'cowork' as const,
            message: '⏰ Co-work time! Ready to collaborate?',
            timestamp: new Date(),
          };
          setUpdates((prev) => [update, ...prev.slice(0, 9)]);
          sendNotification('⏰ Co-work Time!', {
            body: 'It\'s co-work hours. Time to collaborate!',
            tag: 'cowork-time',
          });
          localStorage.setItem('lastCoworkNotification', Date.now().toString());
        }
      }
    };

    socket.on('connect', () => {
      console.log('Connected to Socket.io server');
      socket.emit('join:design-tokens');
    });

    socket.on('design-token:updated', (data: any) => {
      const update = {
        id: Date.now().toString(),
        type: 'token' as const,
        message: `Design token "${data.name}" updated`,
        timestamp: new Date(),
      };
      setUpdates((prev) => [update, ...prev.slice(0, 9)]);
    });

    socket.on('component:linked', (data: any) => {
      const update = {
        id: Date.now().toString(),
        type: 'component' as const,
        message: `Component "${data.componentName}" linked to ${data.filePath}`,
        timestamp: new Date(),
      };
      setUpdates((prev) => [update, ...prev.slice(0, 9)]);
      
      // Add to unified notification system
      addNotification({
        type: 'live-update',
        title: 'Component Linked',
        message: `Component "${data.componentName}" linked to ${data.filePath}`,
        metadata: { link: '/labs' },
      }).catch(err => console.error('Failed to add notification:', err));
    });

    socket.on('document:updated', (data: any) => {
      const update = {
        id: Date.now().toString(),
        type: 'document' as const,
        message: `Document "${data.title}" updated`,
        timestamp: new Date(),
      };
      setUpdates((prev) => [update, ...prev.slice(0, 9)]);
      
      // Add to unified notification system
      addNotification({
        type: 'live-update',
        title: 'Document Updated',
        message: `Document "${data.title}" has been updated`,
        metadata: { link: '/labs' },
      }).catch(err => console.error('Failed to add notification:', err));
    });

    // Listen for Twitch live events from backend
    socket.on('twitch:live', (data: any) => {
      const update = {
        id: Date.now().toString(),
        type: 'twitch' as const,
        message: data.message || '🔴 You\'re now LIVE on Twitch!',
        timestamp: new Date(),
      };
      setUpdates((prev) => [update, ...prev.slice(0, 9)]);
      
      // Add to unified notification system
      addNotification({
        type: 'twitch',
        title: '🔴 Live on Twitch!',
        message: data.message || 'Your stream is now live. Join the co-work session!',
        metadata: { link: '/labs' },
      }).catch(err => console.error('Failed to add notification:', err));
      
      // Also send browser notification
      sendNotification('🔴 Live on Twitch!', {
        body: data.message || 'Your stream is now live. Join the co-work session!',
        tag: 'twitch-live',
      });
      setIsLive(true);
    });

    socket.on('twitch:offline', (data: any) => {
      setIsLive(false);
    });

    // Listen for admin updates
    socket.on('admin:update', (data: any) => {
      const update = {
        id: Date.now().toString(),
        type: data.type || 'admin' as const,
        message: data.message || 'Admin update',
        timestamp: new Date(),
        author: data.author || 'Admin',
      };
      setUpdates((prev) => [update, ...prev.slice(0, 9)]);
      
      // Add to unified notification system
      addNotification({
        type: data.type === 'twitch' ? 'twitch' : data.type === 'cowork' ? 'live-update' : 'admin',
        title: data.title || '📢 Admin Update',
        message: data.message || 'New update from admin',
        metadata: { 
          link: data.link || '/labs',
          actor: data.author ? { id: 'admin', name: data.author } : undefined,
        },
      }).catch(err => console.error('Failed to add notification:', err));
      
      // Also send browser notification
      sendNotification(data.title || '📢 Admin Update', {
        body: data.message || 'New update from admin',
        tag: `admin-update-${Date.now()}`,
      });
    });

    // Check Twitch status every 2 minutes
    checkTwitchStatus();
    const twitchInterval = setInterval(checkTwitchStatus, 2 * 60 * 1000);

    // Check cowork time every 5 minutes
    checkCoworkTime();
    const coworkInterval = setInterval(checkCoworkTime, 5 * 60 * 1000);

    return () => {
      socket.off('design-token:updated');
      socket.off('component:linked');
      socket.off('document:updated');
      socket.off('twitch:live');
      socket.off('twitch:offline');
      socket.off('admin:update');
      clearInterval(twitchInterval);
      clearInterval(coworkInterval);
    };
  }, []);

  const handlePostAdminUpdate = async () => {
    if (!adminMessage.trim()) return;

    setIsPosting(true);
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/admin/update`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: adminMessage,
          type: adminType,
          title: adminType === 'twitch' ? '🔴 Live on Twitch!' : adminType === 'cowork' ? '⏰ Co-work Time!' : '📢 Admin Update',
        }),
      });

      if (response.ok) {
        setAdminMessage('');
        setAdminDialogOpen(false);
        // The update will be received via Socket.IO event
      } else {
        // Check if response is JSON
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Unknown error';
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const error = await response.json();
            errorMessage = error.error || error.message || `Server error: ${response.status}`;
          } catch (e) {
            errorMessage = `Server error: ${response.status} ${response.statusText}`;
          }
        } else {
          // Response is HTML (error page)
          const text = await response.text();
          errorMessage = `Server error: ${response.status} ${response.statusText}`;
          console.error('Non-JSON error response:', text.substring(0, 200));
        }
        
        alert(`Failed to post update: ${errorMessage}`);
      }
    } catch (err: any) {
      console.error('Error posting admin update:', err);
      alert(`Failed to post update: ${err.message || 'Network error'}`);
    } finally {
      setIsPosting(false);
    }
  };

  const handleRequestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        sendNotification('Notifications Enabled', {
          body: 'You\'ll now receive notifications for live streams and co-work times!',
        });
      }
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'token': return 'primary';
      case 'component': return 'secondary';
      case 'twitch': return 'error';
      case 'cowork': return 'warning';
      case 'admin': return 'info';
      default: return 'default';
    }
  };

  return (
    <>
      <Paper sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2">
            Live Updates
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isLive && (
              <Chip
                label="🔴 LIVE"
                size="small"
                color="error"
                sx={{ fontWeight: 'bold' }}
              />
            )}
            {isAdmin && (
              <Tooltip title="Post an admin update">
                <IconButton
                  size="small"
                  onClick={() => setAdminDialogOpen(true)}
                  color="primary"
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
            )}
            {notificationPermission !== 'granted' && (
              <Tooltip title="Enable notifications for live streams and co-work times">
                <IconButton
                  size="small"
                  onClick={handleRequestNotificationPermission}
                  color={notificationPermission === 'denied' ? 'error' : 'default'}
                >
                  {notificationPermission === 'denied' ? <NotificationsOff /> : <Notifications />}
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
      <Box sx={{ maxHeight: 200, overflow: 'auto' }}>
        {updates.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No recent updates
          </Typography>
        ) : (
          updates.map((update) => (
            <Box key={update.id} sx={{ mb: 1, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Chip
                  label={update.type}
                  size="small"
                  color={getTypeColor(update.type)}
                />
                <Typography variant="caption" color="text.secondary">
                  {update.timestamp.toLocaleTimeString()}
                </Typography>
              </Box>
              <Typography variant="body2">{update.message}</Typography>
              {update.author && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  — {update.author}
                </Typography>
              )}
            </Box>
          ))
        )}
      </Box>
    </Paper>

    {/* Admin Update Dialog */}
    <Dialog open={adminDialogOpen} onClose={() => setAdminDialogOpen(false)} maxWidth="sm" fullWidth>
      <DialogTitle>Post Admin Update</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
          <FormControl fullWidth>
            <InputLabel>Update Type</InputLabel>
            <Select
              value={adminType}
              label="Update Type"
              onChange={(e) => setAdminType(e.target.value as 'admin' | 'twitch' | 'cowork')}
            >
              <MenuItem value="admin">📢 General Update</MenuItem>
              <MenuItem value="twitch">🔴 Twitch Live</MenuItem>
              <MenuItem value="cowork">⏰ Co-work Time</MenuItem>
            </Select>
          </FormControl>
          <TextField
            autoFocus
            margin="dense"
            label="Message"
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={adminMessage}
            onChange={(e) => setAdminMessage(e.target.value)}
            placeholder="Enter your update message..."
            helperText="This will be sent as a notification to all users who have enabled notifications"
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setAdminDialogOpen(false)}>Cancel</Button>
        <Button
          onClick={handlePostAdminUpdate}
          variant="contained"
          disabled={!adminMessage.trim() || isPosting}
        >
          {isPosting ? 'Posting...' : 'Post Update'}
        </Button>
      </DialogActions>
    </Dialog>
    </>
  );
}

