'use client';

import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import CollaborativeDrawingPad from './CollaborativeDrawingPad';
import TasksPanel from './shared/TasksPanel';

export default function Workspace() {
  // Hyperbeam embed configuration
  const HYPERBEAM_EMBED_URL = "https://5e3drln9et7g5dz9zi8h2nkly.hyperbeam.com/Z_1SrobgS76pKHX6GaLkTw?token=jASHNMS1E1pYOup41Jv4ntGDMXZCot_r94XOGkTPD0Q";
  const HYPERBEAM_SESSION_ID = "67fd52ae-86e0-4bbe-a928-75fa19a2e44f";
  const HYPERBEAM_ADMIN_TOKEN = "PYVxXA9Uiee8teWDEhZ_I2X3z6Tht7HHrxC6zec7tqM";

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={3}>
        
        {/* Collaborative Drawing Pad */}
        <Grid item xs={12} lg={6}>
          <CollaborativeDrawingPad height={500} />
        </Grid>
        
        {/* Tasks Section */}
        <Grid item xs={12} lg={6}>
          <TasksPanel height={500} />
        </Grid>

        {/* Hyperbeam Embed */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, height: 600, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
              Hyperbeam Session
            </Typography>
            <Box
              sx={{
                flex: 1,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                overflow: 'hidden',
                bgcolor: 'background.paper',
              }}
            >
              <iframe
                title="Hyperbeam Session"
                src={HYPERBEAM_EMBED_URL}
                width="100%"
                height="100%"
                style={{ border: 'none', minHeight: 550 }}
                allowFullScreen
                allow="clipboard-read; clipboard-write; display-capture"
              />
            </Box>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
}
