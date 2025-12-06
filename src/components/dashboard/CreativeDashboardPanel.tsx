'use client';

import React, { useState, useEffect } from 'react';
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
  Support as SupportIcon,
  School as SchoolIcon,
  SmartToy as SmartToyIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import ClientList from './creative/ClientList';
import AddClientDialog from './creative/AddClientDialog';
import AnalyticsActivity from './creative/AnalyticsActivity';
import SupportRequests from './creative/SupportRequests';
import DashboardMetrics from './DashboardMetrics';
import { getBackendUrl } from '../../utils/backendUrl';
import LearningPanel from './LearningPanel';
import AiAgentPanel from './AiAgentPanel';
import OpportunitiesPanel from './OpportunitiesPanel';
import ClientEmployeeMatcher from './creative/ClientEmployeeMatcher';

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
              icon={<SupportIcon />}
              iconPosition="start"
              label="Support Requests"
              id="creative-tab-3"
              aria-controls="creative-tabpanel-3"
            />
            <Tab
              icon={<PeopleIcon />}
              iconPosition="start"
              label="Match Clients & Employees"
              id="creative-tab-4"
              aria-controls="creative-tabpanel-4"
            />
            <Tab
              icon={<SchoolIcon />}
              iconPosition="start"
              label="Learning Hub"
              id="creative-tab-5"
              aria-controls="creative-tabpanel-5"
            />
            <Tab
              icon={<SmartToyIcon />}
              iconPosition="start"
              label="AI Agent"
              id="creative-tab-6"
              aria-controls="creative-tabpanel-6"
            />
            <Tab
              icon={<TrendingUpIcon />}
              iconPosition="start"
              label="Opportunities"
              id="creative-tab-7"
              aria-controls="creative-tabpanel-7"
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
            <SupportRequests />
          </TabPanel>
          <TabPanel value={activeTab} index={4}>
            <ClientEmployeeMatcher />
          </TabPanel>
          <TabPanel value={activeTab} index={5}>
            <LearningPanel />
          </TabPanel>
          <TabPanel value={activeTab} index={6}>
            <AiAgentPanel />
          </TabPanel>
          <TabPanel value={activeTab} index={7}>
            <OpportunitiesPanel />
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
  const [metrics, setMetrics] = useState({
    clients: 0,
    projects: 0,
    tasks: 0,
    completion: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/creative/metrics`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setMetrics({
            clients: data.clients || 0,
            projects: data.projects || 0,
            tasks: data.tasks || 0,
            completion: data.completion || 0,
          });
          setError(null);
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Failed to fetch metrics' }));
          setError(errorData.error || 'Failed to load metrics');
          // Use defaults on error
          setMetrics({
            clients: 0,
            projects: 0,
            tasks: 0,
            completion: 0,
          });
        }
      } catch (err: any) {
        console.error('Error fetching metrics:', err);
        setError(err.message || 'Failed to load metrics');
        setMetrics({
          clients: 0,
          projects: 0,
          tasks: 0,
          completion: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

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
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <Typography>Loading metrics...</Typography>
          </Box>
        ) : error ? (
          <Box sx={{ p: 2, bgcolor: 'error.light', borderRadius: 1, mb: 2 }}>
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          </Box>
        ) : null}
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

