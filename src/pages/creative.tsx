import React from 'react';
import AppShell from '../components/AppShell';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import CreativeDashboardPanel from '../components/dashboard/CreativeDashboardPanel';

function CreativeDashboard() {
  return (
    <AppShell active="creative">
      <CreativeDashboardPanel />
    </AppShell>
  );
}

function App() {
  return (
    <ProtectedRoute>
      <CreativeDashboard />
    </ProtectedRoute>
  );
}

export default App;

