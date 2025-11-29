import React from 'react';
import AppShell from '../components/AppShell';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import Workspace from '../components/dashboard/Workspace';
import FloatingWeb3MQChat from '../components/chat/FloatingWeb3MQChat';

function CoworkDashboard() {
  return (
    <AppShell active="labs">
      <Workspace />
      <FloatingWeb3MQChat
        channelId="cowork-general"
        channelName="Co-Work Chat"
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
