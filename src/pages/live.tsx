import React from 'react';
import AppShell from '../components/AppShell';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import StreamingPanel from '../components/dashboard/StreamingPanel';

function LiveStreamPage() {
  return (
    <AppShell active="live">
      <StreamingPanel />
    </AppShell>
  );
}

function App() {
  return (
    <ProtectedRoute>
      <LiveStreamPage />
    </ProtectedRoute>
  );
}

export default App;

