'use client';

import React from 'react';
import {
  Box,
  Grid,
} from '@mui/material';
import CollaborativeDrawingPad from './CollaborativeDrawingPad';
import TasksPanel from './shared/TasksPanel';

export default function Workspace() {

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

      </Grid>
    </Box>
  );
}
