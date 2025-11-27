'use client';

import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Typography,
  Container,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon,
  Support as SupportIcon,
} from '@mui/icons-material';
import ClientList from './creative/ClientList';
import AddClientDialog from './creative/AddClientDialog';
import DashboardConnections from './creative/DashboardConnections';
import AnalyticsActivity from './creative/AnalyticsActivity';
import SupportRequests from './creative/SupportRequests';
import DashboardMetrics from './DashboardMetrics';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`creative-tabpanel-${index}`}
      aria-labelledby={`creative-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function CreativeDashboardPanel() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeTab, setActiveTab] = useState(0);
  const [addClientOpen, setAddClientOpen] = useState(false);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, #6366F1 0%, #8b5cf6 100%)',
          color: 'white',
          borderRadius: 0,
        }}
      >
        <Container maxWidth="xl">
          <Typography variant="h4" fontWeight={800} gutterBottom>
            Creative Dashboard
          </Typography>
          <Typography variant="body1" sx={{ opacity: 0.9 }}>
            Your central hub for managing clients across all dashboards and systems
          </Typography>
        </Container>
      </Paper>

      {/* Tabs */}
      <Paper elevation={1} sx={{ borderRadius: 0 }}>
        <Container maxWidth="xl">
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons="auto"
            sx={{
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Tab
              icon={<DashboardIcon />}
              iconPosition="start"
              label="Overview"
              id="creative-tab-0"
              aria-controls="creative-tabpanel-0"
            />
            <Tab
              icon={<PeopleIcon />}
              iconPosition="start"
              label="Client List"
              id="creative-tab-1"
              aria-controls="creative-tabpanel-1"
            />
            <Tab
              icon={<AnalyticsIcon />}
              iconPosition="start"
              label="Analytics & Activity"
              id="creative-tab-2"
              aria-controls="creative-tabpanel-2"
            />
            <Tab
              icon={<SettingsIcon />}
              iconPosition="start"
              label="Dashboard Connections"
              id="creative-tab-3"
              aria-controls="creative-tabpanel-3"
            />
            <Tab
              icon={<SupportIcon />}
              iconPosition="start"
              label="Support Requests"
              id="creative-tab-4"
              aria-controls="creative-tabpanel-4"
            />
          </Tabs>
        </Container>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto', bgcolor: 'background.default' }}>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <TabPanel value={activeTab} index={0}>
            <OverviewTab onAddClient={() => setAddClientOpen(true)} />
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <ClientList onAddClient={() => setAddClientOpen(true)} />
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            <AnalyticsActivity />
          </TabPanel>
          <TabPanel value={activeTab} index={3}>
            <DashboardConnections />
          </TabPanel>
          <TabPanel value={activeTab} index={4}>
            <SupportRequests />
          </TabPanel>
        </Container>
      </Box>

      {/* Add Client Dialog */}
      <AddClientDialog
        open={addClientOpen}
        onClose={() => setAddClientOpen(false)}
      />
    </Box>
  );
}

// Overview Tab Component
function OverviewTab({ onAddClient }: { onAddClient: () => void }) {
  // Fetch metrics from backend (placeholder for now)
  const metrics = {
    clients: 12, // Active Clients
    projects: 24, // This month Projects
    tasks: 48, // Tasks Completed today
    completion: 75, // Overall completion
  };

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Overview
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Welcome to your mission control for managing clients across all your dashboards and systems.
      </Typography>

      {/* Dashboard Metrics */}
      <Box sx={{ mb: 4 }}>
        <DashboardMetrics metrics={metrics} />
      </Box>

      {/* Key Features Grid */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Key Features
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Centralized Client Directory
            </Typography>
            <Typography variant="body2" color="text.secondary">
              View and manage all your client accounts in one place
            </Typography>
          </Paper>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Integrations with Dashboards
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Connect clients to Co-Work and Rise dashboards
            </Typography>
          </Paper>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Quick Add/Edit/Remove Clients
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Streamline onboarding and administration
            </Typography>
          </Paper>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Analytics & Activity Tracking
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track client usage, activity, and generate reports
            </Typography>
          </Paper>
        </Box>
      </Box>

      {/* Quick Actions */}
      <Box>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Quick Actions
        </Typography>
        <Paper sx={{ p: 3, bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="body1" gutterBottom>
            Ready to add a new client?
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
            Add client leads and send them to the sign-up page to get started.
          </Typography>
          <Box
            component="button"
            onClick={onAddClient}
            sx={{
              bgcolor: 'white',
              color: 'primary.main',
              border: 'none',
              px: 3,
              py: 1.5,
              borderRadius: 1,
              fontWeight: 600,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.9)',
              },
            }}
          >
            Add New Client
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

