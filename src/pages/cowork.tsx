import React from 'react';
import AppShell from '../components/AppShell';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import Workspace from '../components/dashboard/Workspace';

function CoworkDashboard() {
  return (
    <AppShell active="labs">
      <Workspace />
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
