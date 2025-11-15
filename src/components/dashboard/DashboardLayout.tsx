import { ReactNode, useState } from 'react';
import { Box, Tabs, Tab, useTheme, useMediaQuery } from '@mui/material';
import StreamingPanel from './StreamingPanel';
import FigmaPanel from './FigmaPanel';
import DocsPanel from './DocsPanel';
import CodeHandoffPanel from './CodeHandoffPanel';
import LiveUpdates from '../mcp/LiveUpdates';

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
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
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
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        sx={{ borderBottom: 1, borderColor: 'divider', minHeight: 48 }}
      >
        <Tab label="Streaming" />
        <Tab label="Designs" />
        <Tab label="Documents" />
        <Tab label="Code Handoff" />
      </Tabs>
      <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
        <Box sx={{ overflow: 'auto', height: '100%' }}>
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
        </Box>
        <Box sx={{ p: 2, height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {children || (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <p>Select a tab to view content</p>
            </Box>
          )}
          <LiveUpdates />
        </Box>
      </Box>
    </Box>
  );
}

