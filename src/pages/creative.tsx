import React from 'react';
import AppShell from '../components/AppShell';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import CreativeDashboardPanel from '../components/dashboard/CreativeDashboardPanel';

function CreativeDashboard() {
  return (
    <ProtectedRoute>
      <AppShell active="creative">
        <CreativeDashboardPanel />
      </AppShell>
    </ProtectedRoute>
  );
}

export default CreativeDashboard;
