'use client';

import React from 'react';
import { Box } from '@mui/material';
import AppShell from '../components/AppShell';
import LearningPanel from '../components/dashboard/LearningPanel';
import Head from 'next/head';

export default function LearningHubPage() {
  return (
    <>
      <Head>
        <title>Learning Hub - iShareHow Labs</title>
        <meta
          name="description"
          content="Access courses, classes, PDF resources, and learning materials to enhance your skills."
        />
      </Head>
      <AppShell active="learning-hub">
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
          <LearningPanel />
        </Box>
      </AppShell>
    </>
  );
}

