'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import AppShell from '../components/AppShell';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import LearningPanel from '../components/dashboard/LearningPanel';
import Head from 'next/head';

function LearningDashboard() {
  return (
    <>
      <Head>
        <title>Learning Dashboard - iShareHow Labs</title>
        <meta
          name="description"
          content="Access courses, classes, PDF resources, and learning materials to enhance your skills."
        />
      </Head>
      <AppShell active="learning-hub">
        {/* Header Section */}
        <Box sx={{ p: { xs: 2, sm: 3 }, pb: 1 }}>
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Learning Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Access courses, classes, PDF resources, and learning materials to enhance your skills
          </Typography>
        </Box>

        {/* Main Content */}
        <Box 
          sx={{ 
            px: { xs: 2, sm: 3 }, 
            pb: 3, 
            flexGrow: 1, 
            display: 'flex', 
            flexDirection: 'column',
            overflow: 'auto',
            bgcolor: 'background.default'
          }}
        >
          <LearningPanel />
        </Box>
      </AppShell>
    </>
  );
}

function App() {
  return (
    <ProtectedRoute>
      <LearningDashboard />
    </ProtectedRoute>
  );
}

export default App;

