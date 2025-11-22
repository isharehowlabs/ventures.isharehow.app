import React, { useState, useEffect } from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Badge,
  Popover,
  Box,
  Typography,
  Divider,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useBoardContext, BoardNotification } from '../../hooks/useBoardContext';

export default function NotificationToast() {
  const { notifications } = useBoardContext();
  const [currentNotif, setCurrentNotif] = useState<BoardNotification | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Show toast for new notifications
    if (notifications.length > 0) {
      const latest = notifications[notifications.length - 1];
      setCurrentNotif(latest);
      setUnreadCount(prev => prev + 1);

      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setCurrentNotif(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notifications]);

  const handleClose = () => {
    setCurrentNotif(null);
  };

  const handleOpenHistory = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    setUnreadCount(0);
  };

  const handleCloseHistory = () => {
    setAnchorEl(null);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };

  const getNotificationTitle = (type: string) => {
    switch (type) {
      case 'join':
        return 'User Joined';
      case 'leave':
        return 'User Left';
      case 'update':
        return 'Board Updated';
      case 'milestone':
        return 'Milestone Reached';
      default:
        return 'Notification';
    }
  };

  const open = Boolean(anchorEl);

  return (
    <>
      {/* Notification Bell Icon */}
      <IconButton
        onClick={handleOpenHistory}
        color="inherit"
        sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1300 }}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      {/* Toast Notification */}
      <Snackbar
        open={!!currentNotif}
        autoHideDuration={5000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {currentNotif && (
          <Alert
            onClose={handleClose}
            severity={getSeverityColor(currentNotif.severity)}
            sx={{ width: '100%', maxWidth: 400 }}
          >
            <AlertTitle>{getNotificationTitle(currentNotif.type)}</AlertTitle>
            <Typography variant="body2">{currentNotif.message}</Typography>
            {currentNotif.actor && (
              <Typography variant="caption" color="text.secondary">
                by {currentNotif.actor.name}
              </Typography>
            )}
          </Alert>
        )}
      </Snackbar>

      {/* Notification History Popover */}
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleCloseHistory}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <Box sx={{ width: 400, maxHeight: 500, overflow: 'auto' }}>
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Notifications</Typography>
            <IconButton size="small" onClick={handleCloseHistory}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Divider />
          {notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                No notifications yet
              </Typography>
            </Box>
          ) : (
            <List>
              {notifications.slice().reverse().map((notif) => (
                <React.Fragment key={notif.id}>
                  <ListItem>
                    <ListItemText
                      primary={notif.message}
                      secondary={
                        <>
                          <Typography component="span" variant="caption" color="text.secondary">
                            {getNotificationTitle(notif.type)}
                          </Typography>
                          {notif.actor && (
                            <>
                              {' • '}
                              <Typography component="span" variant="caption">
                                {notif.actor.name}
                              </Typography>
                            </>
                          )}
                          {' • '}
                          <Typography component="span" variant="caption" color="text.secondary">
                            {new Date(notif.timestamp).toLocaleTimeString()}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          )}
        </Box>
      </Popover>
    </>
  );
}
