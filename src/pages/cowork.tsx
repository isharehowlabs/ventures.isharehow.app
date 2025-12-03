import React from 'react';
import AppShell from '../components/AppShell';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import Workspace from '../components/dashboard/Workspace';
import FloatingPushChat from '../components/chat/FloatingPushChat';

function CoworkDashboard() {
  return (
    <AppShell active="labs">
      <Workspace />
      <FloatingPushChat
        peerAddress="0x0000000000000000000000000000000000000000"
        chatName="Co-Work Chat"
        position="bottom-right"
      />
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
