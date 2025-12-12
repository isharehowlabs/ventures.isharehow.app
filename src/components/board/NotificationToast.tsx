import React, { useState, useEffect, useRef } from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  Typography,
} from '@mui/material';
import { useBoardContext, BoardNotification } from '../../hooks/useBoardContext';
import { useNotifications } from '../../contexts/NotificationContext';

export default function NotificationToast() {
  const { notifications } = useBoardContext();
  const { addNotification } = useNotifications();
  const [currentNotif, setCurrentNotif] = useState<BoardNotification | null>(null);
  const previousNotificationsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Show toast for new notifications and add to unified system
    if (notifications.length > 0) {
      const latest = notifications[notifications.length - 1];
      
      // Skip join/leave notifications entirely - don't process or display them
      if (latest.type === 'join' || latest.type === 'leave') {
        return;
      }
      
      // Only process if we haven't seen this notification before
      if (!previousNotificationsRef.current.has(latest.id)) {
        previousNotificationsRef.current.add(latest.id);
        setCurrentNotif(latest);

        const getNotificationTitle = (type: string) => {
          switch (type) {
            case 'update': return 'Board Updated';
            case 'milestone': return 'Milestone Reached';
            default: return 'Board Notification';
          }
        };

        addNotification({
          type: 'board',
          title: getNotificationTitle(latest.type),
          message: latest.message,
          metadata: {
            link: '/creative?tab=cowork',
            actor: latest.actor ? {
              id: latest.actor.userId,
              name: latest.actor.name,
            } : undefined,
          },
        }).catch(err => console.error('Failed to add notification:', err));

        // Auto-hide after 5 seconds
        const timer = setTimeout(() => {
          setCurrentNotif(null);
        }, 5000);

        return () => clearTimeout(timer);
      }
    }
  }, [notifications, addNotification]);

  const handleClose = () => {
    setCurrentNotif(null);
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
      case 'update':
        return 'Board Updated';
      case 'milestone':
        return 'Milestone Reached';
      default:
        return 'Board Notification';
    }
  };

  // Don't show join/leave notifications
  const shouldShowNotification = currentNotif && currentNotif.type !== 'join' && currentNotif.type !== 'leave';

  return (
    <>
      {/* Toast Notification - Keep for immediate feedback (excluding join/leave) */}
      <Snackbar
        open={!!shouldShowNotification}
        autoHideDuration={5000}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {shouldShowNotification && currentNotif && (
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
    </>
  );
}
