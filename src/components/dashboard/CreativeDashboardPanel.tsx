'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
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
  People as PeopleIcon,
  Analytics as AnalyticsIcon,
  Support as SupportIcon,
  SmartToy as SmartToyIcon,
  Science as LabsIcon,
} from '@mui/icons-material';
import AddClientDialog from './creative/AddClientDialog';
import AnalyticsActivity from './creative/AnalyticsActivity';
import SupportRequests from './creative/SupportRequests';
import AiAgentPanel from './AiAgentPanel';
import ClientEmployeeMatcher from './creative/ClientEmployeeMatcher';
import Workspace from './Workspace';
import FloatingAIChat from './FloatingAIChat';
import { useAuth } from '../../hooks/useAuth';

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
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [addClientOpen, setAddClientOpen] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.isAdmin || false;
  
  // Debug admin status
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('[CreativeDashboard] Admin check:', {
        isAdmin,
        userIsAdmin: user?.isAdmin,
        userId: user?.id,
        username: user?.username,
        fullUser: user
      });
    }
  }, [user, isAdmin]);

  // Map tab names to indices
  const tabMap: Record<string, number> = {
    analytics: 0,
    support: 1,
    match: 2,
    cowork: 3,
    ai: 4,
  };

  // Initialize tab from URL query parameter
  useEffect(() => {
    const tabParam = router.query.tab as string;
    if (tabParam && tabMap[tabParam] !== undefined) {
      setActiveTab(tabMap[tabParam]);
    }
  }, [router.query.tab]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    
    // Update URL with tab parameter
    const tabNames = Object.keys(tabMap);
    const tabName = tabNames.find(key => tabMap[key] === newValue);
    if (tabName) {
      router.push({
        pathname: router.pathname,
        query: { ...router.query, tab: tabName },
      }, undefined, { shallow: true });
    }
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
              icon={<AnalyticsIcon />}
              iconPosition="start"
              label="Analytics & Activity"
              id="creative-tab-0"
              aria-controls="creative-tabpanel-0"
            />
            <Tab
              icon={<SupportIcon />}
              iconPosition="start"
              label="Support Requests"
              id="creative-tab-1"
              aria-controls="creative-tabpanel-1"
            />
            <Tab
              icon={<PeopleIcon />}
              iconPosition="start"
              label="Match Clients & Employees"
              id="creative-tab-2"
              aria-controls="creative-tabpanel-2"
            />
            <Tab
              icon={<LabsIcon />}
              iconPosition="start"
              label="Co-Work"
              id="creative-tab-3"
              aria-controls="creative-tabpanel-3"
            />
            <Tab
              icon={<SmartToyIcon />}
              iconPosition="start"
              label="AI Agent"
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
            <AnalyticsActivity />
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <SupportRequests />
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            <ClientEmployeeMatcher onAddClient={() => setAddClientOpen(true)} />
          </TabPanel>
          <TabPanel value={activeTab} index={3}>
            <CoWorkTab />
          </TabPanel>
          <TabPanel value={activeTab} index={4}>
            <AiAgentPanel />
          </TabPanel>
        </Container>
      </Box>

      {/* Add Client Dialog */}
      <AddClientDialog
        open={addClientOpen}
        onClose={() => setAddClientOpen(false)}
      />

      {/* Floating AI Chat - Available in Co-Work tab */}
      {activeTab === 3 && <FloatingAIChat />}
    </Box>
  );
}

// Co-Work Tab Component
function CoWorkTab() {
  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Co-Work Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Collaborate, code, and create together with your team
        </Typography>
      </Box>

      {/* Main Workspace Content */}
      <Box 
        sx={{ 
          flexGrow: 1, 
          display: 'flex', 
          flexDirection: 'column',
          overflow: 'auto'
        }}
      >
        <Workspace />
      </Box>
    </Box>
  );
}


