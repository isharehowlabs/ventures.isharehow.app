import React from 'react';
import AppShell from '../components/AppShell';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import CoworkDashboardPanel from '../components/dashboard/CoworkDashboardPanel';

function CoworkDashboard() {
  return (
    <AppShell active="labs">
      <CoworkDashboardPanel />
    </AppShell>
  );
}

function App() {
  return (
    <ProtectedRoute>
      <CoworkDashboard />
    </ProtectedRoute>
  );
}

export default App;
