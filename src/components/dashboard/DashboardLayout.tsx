import { ReactNode, useState } from 'react';
import { Box, Tabs, Tab, useTheme, useMediaQuery, Paper, Typography } from '@mui/material';
import StreamingPanel from './StreamingPanel';
import FigmaPanel from './FigmaPanel';
import DocsPanel from './DocsPanel';
import CodeHandoffPanel from './CodeHandoffPanel';
import AIJournalPanel from './AIJournalPanel';
import Web3Panel from './Web3Panel';

interface TabPanelProps {
  children?: ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`dashboard-tabpanel-${index}`}
      aria-labelledby={`dashboard-tab-${index}`}
      {...other}
      style={{ height: '100%' }}
    >
      {value === index && <Box sx={{ height: '100%' }}>{children}</Box>}
    </div>
  );
}

interface DashboardLayoutProps {
  children?: ReactNode;
  taskList?: ReactNode;
}

export default function DashboardLayout({ children, taskList }: DashboardLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (isMobile) {
    return (
      <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Streaming" />
          <Tab label="Designs" />
          <Tab label="Documents" />
          <Tab label="Code Handoff" />
          <Tab label="AI Journal" />
          <Tab label="Web3 Hub" />
        </Tabs>
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <TabPanel value={activeTab} index={0}>
            <StreamingPanel />
          </TabPanel>
          <TabPanel value={activeTab} index={1}>
            <FigmaPanel />
          </TabPanel>
          <TabPanel value={activeTab} index={2}>
            <DocsPanel />
          </TabPanel>
          <TabPanel value={activeTab} index={3}>
            <CodeHandoffPanel />
          </TabPanel>
          <TabPanel value={activeTab} index={4}>
            <AIJournalPanel />
          </TabPanel>
          <TabPanel value={activeTab} index={5}>
            <Web3Panel />
          </TabPanel>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{ 
          borderBottom: 1, 
          borderColor: 'divider', 
          minHeight: 48,
          flexShrink: 0,
        }}
      >
        <Tab label="Streaming" />
        <Tab label="Designs" />
        <Tab label="Documents" />
        <Tab label="Code Handoff" />
        <Tab label="AI Journal" />
        <Tab label="Web3 Hub" />
      </Tabs>
      <Box 
        sx={{ 
          flexGrow: 1, 
          overflow: 'hidden', 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: '1fr', 
            md: '68% 32%' 
          }, 
          gap: { xs: 1, sm: 2 },
          minHeight: 0,
        }}
      >
        <Box 
          sx={{ 
            overflow: 'auto', 
            height: '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: { xs: 1, sm: 2 }, 
            p: { xs: 1, sm: 2 },
            minHeight: 0,
          }}
        >
          <Box sx={{ flexGrow: 1, overflow: 'auto', minHeight: 0 }}>
            <TabPanel value={activeTab} index={0}>
              <StreamingPanel />
            </TabPanel>
            <TabPanel value={activeTab} index={1}>
              <FigmaPanel />
            </TabPanel>
            <TabPanel value={activeTab} index={2}>
              <DocsPanel />
            </TabPanel>
            <TabPanel value={activeTab} index={3}>
              <CodeHandoffPanel />
            </TabPanel>
            <TabPanel value={activeTab} index={4}>
              <AIJournalPanel />
            </TabPanel>
            <TabPanel value={activeTab} index={5}>
              <Web3Panel />
            </TabPanel>
          </Box>
          {/* Session Tasks on the left side with work tabs */}
          {taskList}
        </Box>
        <Box 
          sx={{ 
            p: { xs: 1, sm: 2 }, 
            height: '100%', 
            overflow: 'hidden', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: { xs: 1, sm: 2 },
            minHeight: 0,
          }}
        >
          {children}
          {/* Chat on the right side - always visible */}
          <Paper 
            sx={{ 
              p: { xs: 1, sm: 2 }, 
              flexGrow: 1, 
              minHeight: { xs: 300, sm: 400 },
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ flexShrink: 0 }}>
              Chat
            </Typography>
            <Box 
              sx={{ 
                flexGrow: 1,
                minHeight: 0,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <iframe
                src="https://www.twitch.tv/embed/jameleliyah/chat?darkpopout&parent=ventures.isharehow.app"
                style={{
                  border: 'none',
                  borderRadius: 8,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                }}
              />
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}

