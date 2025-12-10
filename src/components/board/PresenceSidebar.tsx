import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Paper,
  Badge,
} from '@mui/material';
import {
  Circle as CircleIcon,
  FiberManualRecord as DotIcon,
} from '@mui/icons-material';
import { useBoardContext } from '../../hooks/useBoardContext';

export default function PresenceSidebar() {
  const { presence, isConnected } = useBoardContext();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'idle':
        return 'warning';
      default:
        return 'action';
    }
  };

  const getStatusIcon = (status: string) => {
    const color = getStatusColor(status);
    return <DotIcon sx={{ fontSize: 12 }} color={color} />;
  };

  const activeUsers = Array.from(presence.values()).filter(p => p.status === 'active');
  const idleUsers = Array.from(presence.values()).filter(p => p.status === 'idle');
  const offlineUsers = Array.from(presence.values()).filter(p => p.status === 'offline');

  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        width: '100%',
        maxWidth: '100%',
        maxHeight: '100%',
        overflow: 'auto',
      }}
    >
      {/* Connection Status */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="subtitle2">Presence</Typography>
        <Chip
          label={isConnected ? 'Connected' : 'Disconnected'}
          size="small"
          color={isConnected ? 'success' : 'error'}
          icon={<CircleIcon />}
        />
      </Box>

      {/* Active Users */}
      {activeUsers.length > 0 && (
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Active ({activeUsers.length})
          </Typography>
          <List dense>
            {activeUsers.map((user) => (
              <ListItem key={user.userId} sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={getStatusIcon(user.status)}
                  >
                    <Avatar
                      src={user.avatar}
                      alt={user.name}
                      sx={{ width: 32, height: 32 }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={user.name}
                  secondary={
                    user.cursor
                      ? `(${Math.round(user.cursor.x)}, ${Math.round(user.cursor.y)})`
                      : 'Active'
                  }
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Idle Users */}
      {idleUsers.length > 0 && (
        <Box>
          <Typography variant="caption" color="text.secondary" gutterBottom>
            Idle ({idleUsers.length})
          </Typography>
          <List dense>
            {idleUsers.map((user) => (
              <ListItem key={user.userId} sx={{ px: 0 }}>
                <ListItemAvatar>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={getStatusIcon(user.status)}
                  >
                    <Avatar
                      src={user.avatar}
                      alt={user.name}
                      sx={{ width: 32, height: 32, opacity: 0.6 }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={user.name}
                  secondary="Idle"
                  primaryTypographyProps={{ variant: 'body2' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                  sx={{ opacity: 0.6 }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      )}

      {/* Empty State */}
      {presence.size === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            No other users online
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
