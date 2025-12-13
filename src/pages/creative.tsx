import React from 'react';
import Head from 'next/head';
import AppShell from '../components/AppShell';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import CreativeDashboardPanel from '../components/dashboard/CreativeDashboardPanel';

function CreativeDashboard() {
  return (
    <>
      <Head>
        <title>Creative Dashboard - iShareHow Labs</title>
        <link rel="canonical" href="https://ventures.isharehow.app/creative" />
        <meta
          name="description"
          content="Creative dashboard for managing creative projects and requests."
        />
      </Head>
      <ProtectedRoute>
        <AppShell active="creative">
          <CreativeDashboardPanel />
        </AppShell>
      </ProtectedRoute>
    </>
  );
}

export default CreativeDashboard;
