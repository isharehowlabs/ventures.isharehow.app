import React from 'react';
import AppShell from '../components/AppShell';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import Markdown from '../components/dashboard/Markdown';

function CoworkDashboard() {
  return (
    <AppShell active="labs">
      <Markdown />
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
