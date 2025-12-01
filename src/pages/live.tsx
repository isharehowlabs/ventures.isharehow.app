import React from 'react';
import AppShell from '../components/AppShell';
import StreamingPanel from '../components/dashboard/StreamingPanel';

function LiveStreamPage() {
  return (
    <AppShell active="live">
      <StreamingPanel />
    </AppShell>
  );
}

export default LiveStreamPage;

