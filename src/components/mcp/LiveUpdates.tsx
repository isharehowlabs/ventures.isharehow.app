import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Chip, IconButton, Tooltip } from '@mui/material';
import { Notifications, NotificationsOff } from '@mui/icons-material';
import { getSocket } from '../../utils/socket';
import { getBackendUrl } from '../../utils/backendUrl';

interface Update {
  id: string;
  type: 'token' | 'component' | 'document' | 'twitch' | 'cowork';
  message: string;
  timestamp: Date;
}

export default function LiveUpdates() {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [isLive, setIsLive] = useState(false);

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
    });

    socket.on('document:updated', (data: any) => {
      const update = {
        id: Date.now().toString(),
        type: 'document' as const,
        message: `Document "${data.title}" updated`,
        timestamp: new Date(),
      };
      setUpdates((prev) => [update, ...prev.slice(0, 9)]);
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
      sendNotification('🔴 Live on Twitch!', {
        body: data.message || 'Your stream is now live. Join the co-work session!',
        tag: 'twitch-live',
      });
      setIsLive(true);
    });

    socket.on('twitch:offline', (data: any) => {
      setIsLive(false);
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
      clearInterval(twitchInterval);
      clearInterval(coworkInterval);
    };
  }, []);

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
      default: return 'default';
    }
  };

  return (
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
            </Box>
          ))
        )}
      </Box>
    </Paper>
  );
}

