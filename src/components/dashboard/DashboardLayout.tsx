import { ReactNode, useState, useEffect } from 'react';
import { Box, Tabs, Tab, useTheme, useMediaQuery, Paper, Typography } from '@mui/material';
import StreamingPanel from './StreamingPanel';
import FigmaPanel from './FigmaPanel';
import DocsPanel from './DocsPanel';
import LearningPanel from './LearningPanel';
import OpportunityPanel from './OpportunityPanel';
import Web3Panel from './Web3Panel';
import FocusPanel from './FocusPanel';
import AIJournalPanel from './AIJournalPanel';
import AiAgentPanel from './AiAgentPanel';
import { useSettings } from '../../hooks/useSettings';

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
  communityQA?: ReactNode;
}

export default function DashboardLayout({ children, taskList, communityQA }: DashboardLayoutProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { settings, getVisiblePanels } = useSettings();

  // Get visible panels in order
  const visiblePanels = getVisiblePanels();
  
  // Map panel keys to components and labels
  const panelComponents: Record<string, { component: ReactNode; label: string }> = {
    streaming: { component: <StreamingPanel />, label: 'Streaming' },
    figma: { component: <FigmaPanel />, label: 'Designs & Code' },
    docs: { component: <DocsPanel />, label: 'Documents' },
    opportunities: { component: <OpportunityPanel />, label: 'Opportunities' },
    learning: { component: <LearningPanel />, label: 'Learning Hub' },
    communityQA: { component: communityQA, label: 'Community Q&A' },
    web3: { component: <Web3Panel />, label: 'Web3' },
    focus: { component: <FocusPanel />, label: 'Focus Timer' },
    aiJournal: { component: <AIJournalPanel />, label: 'Mindset Journal' },
    aiAgent: { component: <AiAgentPanel />, label: 'AI Agent' },
  };

  // Filter tabs to only show visible panels
  const visibleTabs = visiblePanels
    .filter(key => panelComponents[key])
    .map((key) => ({
      key,
      component: panelComponents[key].component,
      label: panelComponents[key].label,
    }));

  // Map the activeTab (which is based on defaultTab setting) to the visible tab index
  // If the default tab is not visible, default to 0
  const getActiveTabIndex = () => {
    if (visibleTabs.length === 0) return 0;
    // Find which visible tab corresponds to the default tab
    const defaultTabKeys = ['streaming', 'figma', 'docs', 'opportunities', 'learning'];
    const defaultTabKey = defaultTabKeys[settings.dashboard.defaultTab];
    const visibleIndex = visibleTabs.findIndex(tab => tab.key === defaultTabKey);
    return visibleIndex >= 0 ? visibleIndex : 0;
  };

  const [activeTab, setActiveTab] = useState(getActiveTabIndex());

  useEffect(() => {
    setActiveTab(getActiveTabIndex());
  }, [settings.dashboard.defaultTab, visibleTabs.length]);

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
          {visibleTabs.map((tab, index) => (
            <Tab key={tab.key} label={tab.label} />
          ))}
        </Tabs>
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          {visibleTabs.map((tab, index) => (
            <TabPanel key={tab.key} value={activeTab} index={index}>
              {tab.component}
            </TabPanel>
          ))}
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
        {visibleTabs.map((tab) => (
          <Tab key={tab.key} label={tab.label} />
        ))}
      </Tabs>
      <Box 
        sx={{ 
          flexGrow: 1, 
          overflow: 'hidden', 
          display: 'grid', 
          gridTemplateColumns: { 
            xs: '1fr', 
            sm: '1fr', 
            md: '1fr' 
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
            {visibleTabs.map((tab, index) => (
              <TabPanel key={tab.key} value={activeTab} index={index}>
                {tab.component}
              </TabPanel>
            ))}
          </Box>
          {/* Session Tasks on the left side with work tabs */}
          {settings.dashboard.showTaskList && taskList}
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
        </Box>
      </Box>
    </Box>
  );
}

