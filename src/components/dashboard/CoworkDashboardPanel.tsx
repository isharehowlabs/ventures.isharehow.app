'use client';

import React from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
} from '@mui/material';
import TasksPanel from './shared/TasksPanel';

// Figma file embed URL (replace with real document or make dynamic as needed)
const FIGMA_EMBED_URL = "";

function DesignCodePanel() {
  return (
    <Paper elevation={2} sx={{ p: 2, height: "100%", display: "flex", flexDirection: "column" }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Design & Code Document
      </Typography>
      <Box
        sx={{
          flex: 1,
          minHeight: 350,
          border: "1px solid #e0e0e0",
          borderRadius: 2,
          overflow: "hidden",
          bgcolor: 'background.default',
        }}
      >
        {/* Figma embed gives editing/copy code buttons */}
        <iframe
          title="Figma Design Doc"
          width="100%"
          height="100%"
          style={{ minHeight: 340, border: "none" }}
          src={FIGMA_EMBED_URL}
          allowFullScreen
        />
      </Box>
    </Paper>
  );
}

export default function CoworkDashboardPanel() {
  // Layout: left = tasks, large right = design/code
  return (
    <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: "background.default", p: { xs: 1, md: 3 } }}>
      <Grid container spacing={3}>
        {/* Task List - left third on desktop, top on mobile */}
        <Grid item xs={12} md={4} lg={3}>
          <TasksPanel height="100%" />
        </Grid>

        {/* Design/Code Doc - main area */}
        <Grid item xs={12} md={8} lg={9}>
          <DesignCodePanel />
        </Grid>
      </Grid>
    </Box>
  );
}
