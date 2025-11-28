import React from 'react';
import AppShell from '../components/AppShell';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { Box, Grid, Paper, Typography } from '@mui/material';
import Web3MQChat from '../components/chat/Web3MQChat';
import Workspace from '../components/dashboard/Workspace';

function LiveDashboard() {
  return (
    <AppShell active="labs">
      <Box sx={{ p: 3, height: '100%' }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Live Collaboration
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Real-time collaborative workspace with Web3MQ messaging
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Workspace />
          </Grid>
          <Grid item xs={12} md={4}>
            <Web3MQChat
              channelId="live-session"
              channelName="Live Session Chat"
              compact={false}
            />
          </Grid>
        </Grid>
      </Box>
    </AppShell>
  );
}

function App() {
  return (
    <ProtectedRoute>
      <LiveDashboard />
    </ProtectedRoute>
  );
}

export default App;

