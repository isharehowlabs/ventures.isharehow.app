import React from 'react';
import AppShell from '../components/AppShell';
import CreativeDashboardPanel from '../components/dashboard/CreativeDashboardPanel';

function CreativeDashboard() {
  return (
    <AppShell active="creative">
      <CreativeDashboardPanel />
    </AppShell>
  );
}

export default CreativeDashboard;
