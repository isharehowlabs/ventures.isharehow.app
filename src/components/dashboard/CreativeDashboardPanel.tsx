import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Grid,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  SupportAgent as SupportIcon,
  PeopleAlt as PeopleIcon,
  Language as BrowserIcon,
  Psychology as AiIcon,
  Palette as DesignIcon,
} from '@mui/icons-material';

// Component imports - keeping all existing functionality
import AddClientDialog from './creative/AddClientDialog';
import AnalyticsActivity from './creative/AnalyticsActivity';
import SupportRequests from './creative/SupportRequests';
import AiAgentPanel from './AiAgentPanel';
import DesignFigmaPanel from './creative/DesignFigmaPanel';
import Workspace from './Workspace';
import FloatingAIChat from './FloatingAIChat';
import StatCard from './StatCard';
import ChartCard from './ChartCard';
import { useAuth } from '../../hooks/useAuth';
import { getBackendUrl } from '../../utils/backendUrl';

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
  
  // Tab configuration
  const tabMap: Record<string, number> = {
    analytics: 0,
    support: 1,
    browser: 2,
    design: 3,
    ai: 4,
  };

  const tabs = [
    { key: 'analytics', label: 'Analytics', icon: <BarChartIcon /> },
    { key: 'support', label: 'Support', icon: <SupportIcon /> },
    { key: 'browser', label: 'Browser', icon: <BrowserIcon /> },
    { key: 'design', label: 'Design & Figma', icon: <DesignIcon /> },
    { key: 'ai', label: 'AI Agent', icon: <AiIcon /> },
  ];

  // Initialize tab from URL
  useEffect(() => {
    const tabParam = router.query.tab as string;
    if (tabParam && tabMap[tabParam] !== undefined) {
      setActiveTab(tabMap[tabParam]);
    }
  }, [router.query.tab]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    const tabNames = Object.keys(tabMap);
    const tabName = tabNames.find(key => tabMap[key] === newValue);
    if (tabName) {
      router.push(`/creative?tab=${tabName}`, undefined, { shallow: true });
    }
  };

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: '100vh', pb: 4 }}>
      {/* Header */}
      <Box sx={{ 
        bgcolor: 'white', 
        borderBottom: '1px solid',
        borderColor: 'divider',
        mb: 3
      }}>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Creative Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Your central hub for managing clients across all dashboards and systems
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="xl">
        {/* Modern Tab Navigation */}
        <Paper sx={{ 
          mb: 3,
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            variant={isMobile ? 'scrollable' : 'standard'}
            scrollButtons={isMobile ? 'auto' : false}
            sx={{
              '& .MuiTab-root': {
                minHeight: 64,
                textTransform: 'none',
                fontSize: '0.95rem',
                fontWeight: 500,
                '&.Mui-selected': {
                  color: 'primary.main',
                  fontWeight: 600,
                },
              },
              '& .MuiTabs-indicator': {
                bgcolor: 'primary.main',
                height: 3,
              },
            }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={tab.key}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
                id={`creative-tab-${index}`}
                aria-controls={`creative-tabpanel-${index}`}
              />
            ))}
          </Tabs>
        </Paper>

        {/* Tab Panels */}
        <TabPanel value={activeTab} index={0}>
          <Card sx={{ boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <AnalyticsActivity />
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <Card sx={{ boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <SupportRequests />
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <BrowserSessionTab />
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <Card sx={{ boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <DesignFigmaPanel />
            </CardContent>
          </Card>
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          <Card sx={{ boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', mb: 3 }}>
            <CardContent sx={{ p: 3 }}>
              <AiAgentPanel />
            </CardContent>
          </Card>
        </TabPanel>
      </Container>

      {/* Dialogs */}
      <AddClientDialog
        open={addClientOpen}
        onClose={() => setAddClientOpen(false)}
      />

      {/* Floating AI Chat - Available in Browser tab */}
      {activeTab === 2 && <FloatingAIChat />}
    </Box>
  );
}


// Browser Session Tab Component (Modernized)
function BrowserSessionTab() {
  const [iframeError, setIframeError] = useState<string | null>(null);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [hyperbeamUrl, setHyperbeamUrl] = useState<string | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    const createHyperbeamSession = async () => {
      try {
        setSessionLoading(true);
        const backendUrl = getBackendUrl();
        const parent = typeof window !== 'undefined' ? window.location.hostname : '';
        
        const response = await fetch(`${backendUrl}/api/hyperbeam/create-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ parent }),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.embedUrl) {
          setHyperbeamUrl(data.embedUrl);
          setIframeError(null);
        } else {
          throw new Error(data.error || 'Failed to get Hyperbeam session URL');
        }
      } catch (error: any) {
        console.error('Error creating Hyperbeam session:', error);
        setIframeError(error.message || 'Failed to create Hyperbeam session. Please try refreshing the page.');
      } finally {
        setSessionLoading(false);
      }
    };

    createHyperbeamSession();
  }, []);

  return (
    <Card sx={{ boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', mb: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Browser Session
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Shared browser powered by Hyperbeam
          </Typography>
        </Box>

        {sessionLoading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress />
          </Box>
        )}

        {iframeError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {iframeError}
          </Alert>
        )}

        {!sessionLoading && hyperbeamUrl && (
          <Box sx={{ 
            position: 'relative', 
            width: '100%', 
            height: '70vh',
            bgcolor: '#000',
            borderRadius: 1,
            overflow: 'hidden'
          }}>
            {iframeLoading && (
              <Box sx={{ 
                position: 'absolute', 
                top: 0, 
                left: 0, 
                right: 0, 
                bottom: 0, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                bgcolor: 'rgba(0,0,0,0.5)'
              }}>
                <CircularProgress />
              </Box>
            )}
            <iframe
              src={hyperbeamUrl}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                display: 'block',
              }}
              allow="clipboard-read; clipboard-write; microphone; camera; display-capture"
              onLoad={() => setIframeLoading(false)}
              onError={() => {
                setIframeLoading(false);
                setIframeError('Failed to load Hyperbeam session');
              }}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
