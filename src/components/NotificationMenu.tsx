import { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Typography,
  Box,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Link,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  AccessTime as TimerIcon,
  LiveTv as LiveIcon,
  Group as BoardIcon,
  Timer as PomodoroIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNotifications, Notification } from '../contexts/NotificationContext';
import { useTimer } from '../contexts/TimerContext';
import { useRouter } from 'next/router';

export default function NotificationMenu() {
  const { notifications, unreadCount, markAsRead, markAllRead, deleteNotification } = useNotifications();
  const { timerState } = useTimer();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [timerDisplay, setTimerDisplay] = useState<string>('');
  
  const open = Boolean(anchorEl);

  // Update timer display every second
  useEffect(() => {
    if (timerState && timerState.isRunning) {
      const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      };

      const updateTimer = () => {
        setTimerDisplay(formatTime(timerState.timeLeft));
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    } else {
      setTimerDisplay('');
    }
  }, [timerState]);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    if (notification.metadata?.link) {
      router.push(notification.metadata.link);
      handleClose();
    }
  };

  const handleMarkAllRead = () => {
    markAllRead();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'timer':
        return <PomodoroIcon fontSize="small" />;
      case 'live-update':
      case 'twitch':
        return <LiveIcon fontSize="small" />;
      case 'board':
        return <BoardIcon fontSize="small" />;
      default:
        return <NotificationsIcon fontSize="small" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'timer':
        return 'primary.main';
      case 'success':
      case 'twitch':
        return 'success.main';
      case 'warning':
        return 'warning.main';
      case 'error':
        return 'error.main';
      case 'live-update':
        return 'info.main';
      case 'board':
        return 'secondary.main';
      default:
        return 'info.main';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const formatTimerTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTimerClick = () => {
    if (timerState?.location === 'rise') {
      router.push('/rise');
    } else if (timerState?.location === 'cowork') {
      router.push('/creative?tab=cowork');
    }
    handleClose();
  };

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-label={`${unreadCount} unread notifications`}
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        hideBackdrop={true}
        BackdropProps={{
          invisible: true,
          style: { display: 'none', pointerEvents: 'none' },
        }}
        sx={{
          zIndex: 1400,
        }}
        PaperProps={{
          sx: {
            width: 360,
            maxWidth: '100%',
            maxHeight: 500,
            zIndex: 1400,
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllRead}>
              Mark all read
            </Button>
          )}
        </Box>

        <Divider />

        {/* Timer Status Section */}
        {timerState && timerState.isRunning && (
          <>
            <Box
              sx={{
                px: 2,
                py: 1.5,
                bgcolor: timerState.isBreak ? 'secondary.light' : 'primary.light',
                cursor: 'pointer',
                '&:hover': { bgcolor: timerState.isBreak ? 'secondary.main' : 'primary.main', color: 'white' },
              }}
              onClick={handleTimerClick}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimerIcon />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {timerState.isBreak ? '☕ Break Timer' : '⏱️ Focus Timer'}
                  </Typography>
                  <Typography variant="body2">
                    {formatTimerTime(timerState.timeLeft)} remaining
                  </Typography>
                </Box>
                <Chip
                  label={timerState.location === 'rise' ? 'RISE' : 'Co-Work'}
                  size="small"
                  color={timerState.isBreak ? 'secondary' : 'primary'}
                />
              </Box>
            </Box>
            <Divider />
          </>
        )}

        {notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No notifications
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0, maxHeight: 400, overflow: 'auto' }}>
            {notifications.map((notification) => (
              <ListItem
                key={notification.id}
                alignItems="flex-start"
                sx={{
                  bgcolor: notification.read ? 'transparent' : 'action.hover',
                  '&:hover': { bgcolor: 'action.selected', cursor: 'pointer' },
                }}
                onClick={() => handleNotificationClick(notification)}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: getTypeColor(notification.type) }}>
                    {getTypeIcon(notification.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2" fontWeight={notification.read ? 400 : 600}>
                        {notification.title}
                      </Typography>
                      {!notification.read && (
                        <Chip label="New" size="small" color="error" sx={{ height: 16, fontSize: '0.65rem' }} />
                      )}
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTime(notification.timestamp)}
                      </Typography>
                    </>
                  }
                />
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNotification(notification.id);
                  }}
                  sx={{ ml: 1 }}
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </ListItem>
            ))}
          </List>
        )}
      </Menu>
    </>
  );
}
