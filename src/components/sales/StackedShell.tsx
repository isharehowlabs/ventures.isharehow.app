import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ShoppingBag as ShoppingBagIcon,
  Brush as CreativeIcon,
  Business as BusinessIcon,
  TrendingUp as GrowthIcon,
  Apps as AppsIcon,
} from '@mui/icons-material';

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
      id={`sales-tabpanel-${index}`}
      aria-labelledby={`sales-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function StackedShell() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    // Navigate to the sales page
    const routes = ['/products', '/fractional-digital-agency', '/website-apps', '/growth-machine', '/enterprise'];
    router.push(routes[newValue]);
  };

  const tabs = [
    {
      key: 'products',
      label: 'Products',
      icon: <ShoppingBagIcon />,
      href: '/products',
    },
    {
      key: 'fractional-digital-agency',
      label: 'Fractional Digital Agency',
      icon: <CreativeIcon />,
      href: '/fractional-digital-agency',
    },
    {
      key: 'website-apps',
      label: 'Website Apps',
      icon: <AppsIcon />,
      href: '/website-apps',
    },
    {
      key: 'growth-machine',
      label: 'Growth Machine',
      icon: <GrowthIcon />,
      href: '/growth-machine',
    },
    {
      key: 'enterprise',
      label: 'Enterprise',
      icon: <BusinessIcon />,
      href: '/enterprise',
    },
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Paper
        elevation={2}
        sx={{
          mb: 3,
          bgcolor: 'transparent',
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={isMobile ? 'scrollable' : 'fullWidth'}
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
              fontWeight: 600,
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
              id={`sales-tab-${index}`}
              aria-controls={`sales-tabpanel-${index}`}
            />
          ))}
        </Tabs>
      </Paper>
    </Box>
  );
}

