import { useEffect, useState } from 'react';
import { Box, Typography, Paper, Chip } from '@mui/material';
import { getSocket } from '../../utils/socket';

interface Update {
  id: string;
  type: 'token' | 'component' | 'document';
  message: string;
  timestamp: Date;
}

export default function LiveUpdates() {
  const [updates, setUpdates] = useState<Update[]>([]);

  useEffect(() => {
    const socket = getSocket();

    socket.on('connect', () => {
      console.log('Connected to Socket.io server');
      socket.emit('join:design-tokens');
    });

    socket.on('design-token:updated', (data: any) => {
      setUpdates((prev) => [
        {
          id: Date.now().toString(),
          type: 'token',
          message: `Design token "${data.name}" updated`,
          timestamp: new Date(),
        },
        ...prev.slice(0, 9), // Keep last 10 updates
      ]);
    });

    socket.on('component:linked', (data: any) => {
      setUpdates((prev) => [
        {
          id: Date.now().toString(),
          type: 'component',
          message: `Component "${data.componentName}" linked to ${data.filePath}`,
          timestamp: new Date(),
        },
        ...prev.slice(0, 9),
      ]);
    });

    socket.on('document:updated', (data: any) => {
      setUpdates((prev) => [
        {
          id: Date.now().toString(),
          type: 'document',
          message: `Document "${data.title}" updated`,
          timestamp: new Date(),
        },
        ...prev.slice(0, 9),
      ]);
    });

    return () => {
      socket.off('design-token:updated');
      socket.off('component:linked');
      socket.off('document:updated');
    };
  }, []);

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="subtitle2" gutterBottom>
        Live Updates
      </Typography>
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
                  color={update.type === 'token' ? 'primary' : update.type === 'component' ? 'secondary' : 'default'}
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

