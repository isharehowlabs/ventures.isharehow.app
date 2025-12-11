import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  Box,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Home as HomeIcon,
  Article as ArticleIcon,
  MenuBook as BlogIcon,
  ShoppingBag as ShoppingBagIcon,
  TrendingUp as RiseIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Login as LoginIcon,
  VideoCall as DemoIcon,
  Brush as CreativeIcon,
  LiveTv as LiveIcon,
  SportsEsports as GamesIcon,
  School as LearningHubIcon,
  CreditCard as CreditCardIcon,
  Info as InfoIcon,
  Business as BusinessIcon,
  PeopleAlt as CrmIcon,
  Apps as AppsIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';

type NavKey = 'home' | 'content' | 'products' | 'rise' | 'live' | 'lookupcafe' | 'profile' | 'billing' | 'settings' | 'web3' | 'demo' | 'creative' | 'blog' | 'learning-hub' | 'about' | 'enterprise' | 'crm' | 'website-apps';

interface NavigationItem {
  key: NavKey;
  label: string;
  href: string;
  icon: React.ReactNode;
  authRequired?: boolean;
  dividerAfter?: boolean;
}

const navigationItems: NavigationItem[] = [
  {
    key: 'home',
    label: 'Home',
    href: '/',
    icon: <HomeIcon />,
  },
  {
    key: 'demo',
    label: 'Book Demo',
    href: '/demo',
    icon: <DemoIcon />,
    dividerAfter: true,
  },
  {
    key: 'content',
    label: 'Portfolio',
    href: '/portfolio',
    icon: <ArticleIcon />,
  },
  {
    key: 'blog',
    label: 'Blog',
    href: '/blog',
    icon: <BlogIcon />,
  },
  {
    key: 'about',
    label: 'About',
    href: '/about',
    icon: <InfoIcon />,
  },
  {
    key: 'products',
    label: 'Products',
    href: '/products',
    icon: <ShoppingBagIcon />,
  },
  {
    key: 'website-apps',
    label: 'Website Apps',
    href: '/website-apps',
    icon: <AppsIcon />,
  },
  {
    key: 'enterprise',
    label: 'Enterprise',
    href: '/enterprise',
    icon: <BusinessIcon />,
  },
  {
    key: 'live',
    label: 'Live Stream',
    href: '/live',
    icon: <LiveIcon />,
    authRequired: false, // Public
  },
  {
    key: 'lookupcafe',
    label: 'LookUp.Cafe',
    href: '/lookupcafe',
    icon: <GamesIcon />,
    authRequired: false, // Public - free tier
    dividerAfter: true,
  },
  {
    key: 'rise',
    label: 'RISE Dashboard',
    href: '/rise',
    icon: <RiseIcon />,
    authRequired: false, // Public but enhanced when authenticated
  },
  {
    key: 'learning-hub',
    label: 'Learning Dashboard',
    href: '/learning-hub',
    icon: <LearningHubIcon />,
    authRequired: false, // Public but enhanced when authenticated
  },
  {
    key: 'creative',
    label: 'Creative Dashboard',
    href: '/creative',
    icon: <CreativeIcon />,
    authRequired: true,
  },
  {
    key: 'crm',
    label: 'CRM',
    href: '/crm',
    icon: <CrmIcon />,
    authRequired: true,
    dividerAfter: true,
  },
  {
    key: 'profile',
    label: 'Profile',
    href: '/profile',
    icon: <PersonIcon />,
    authRequired: true,
  },
  {
    key: 'billing',
    label: 'Billing',
    href: '/billing',
    icon: <CreditCardIcon />,
    authRequired: true,
  },
  {
    key: 'settings',
    label: 'Settings',
    href: '/settings',
    icon: <SettingsIcon />,
    authRequired: true,
  },
];

interface NavigationProps {
  active: NavKey;
  isAuthenticated?: boolean;
  collapsed?: boolean;
  onLogin?: () => void;
}

export default function Navigation({ active, isAuthenticated = false, collapsed = false, onLogin }: NavigationProps) {
  const router = useRouter();
  const theme = useTheme();

  const handleNavigate = (href: string) => {
    router.push(href);
  };

  const filteredItems = navigationItems.filter(item => {
    if (item.authRequired && !isAuthenticated) {
      return false;
    }
    return true;
  });

  return (
    <Box 
      sx={{ 
        overflow: 'auto', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
      }}
    >
      {/* Logo/Icon when collapsed */}
      {collapsed && (
        <Box 
          sx={{ 
            p: 2, 
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderBottom: `1px solid ${theme.palette.divider}`,
            minHeight: 64,
          }}
        >
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 1,
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '0.875rem',
            }}
          >
            IH
          </Box>
        </Box>
      )}
      
      <List 
        sx={{ 
          px: collapsed ? 0.5 : 1, 
          py: 1,
          flexGrow: 1,
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
        }}
      >
        {filteredItems.map((item) => (
          <Box key={item.key}>
            <Tooltip title={collapsed ? item.label : ''} placement="right">
              <ListItemButton
                selected={active === item.key}
                onClick={() => handleNavigate(item.href)}
                sx={{
                  minHeight: 48,
                  justifyContent: collapsed ? 'center' : 'initial',
                  px: collapsed ? 1.5 : 2.5,
                  mx: collapsed ? 0.5 : 0,
                  mb: 0.5,
                  borderRadius: 1,
                  backgroundColor: active === item.key 
                    ? theme.palette.mode === 'dark' 
                      ? 'rgba(144, 202, 249, 0.16)' 
                      : 'rgba(25, 118, 210, 0.08)'
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.04)',
                  },
                  '&.Mui-selected': {
                    backgroundColor: active === item.key 
                      ? theme.palette.mode === 'dark' 
                        ? 'rgba(144, 202, 249, 0.16)' 
                        : 'rgba(25, 118, 210, 0.08)'
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: active === item.key
                        ? theme.palette.mode === 'dark' 
                          ? 'rgba(144, 202, 249, 0.24)' 
                          : 'rgba(25, 118, 210, 0.12)'
                        : theme.palette.action.hover,
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: collapsed ? 40 : 40,
                    mr: collapsed ? 0 : 2,
                    justifyContent: 'center',
                    color: active === item.key 
                      ? theme.palette.primary.main 
                      : theme.palette.text.secondary,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: active === item.key ? 600 : 500,
                      fontSize: '0.875rem',
                      sx: {
                        color: active === item.key 
                          ? theme.palette.primary.main 
                          : theme.palette.text.primary,
                      },
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
            {item.dividerAfter && (
              <Divider 
                sx={{ 
                  my: 1.5,
                  mx: collapsed ? 1 : 2,
                  borderColor: theme.palette.divider,
                }} 
              />
            )}
          </Box>
        ))}
        
        {/* Sign In button for unauthenticated users */}
        {!isAuthenticated && onLogin && (
          <>
            <Divider 
              sx={{ 
                my: 1.5,
                mx: collapsed ? 1 : 2,
                borderColor: theme.palette.divider,
              }} 
            />
            <Tooltip title={collapsed ? 'Sign In' : ''} placement="right">
              <ListItemButton
                onClick={onLogin}
                sx={{
                  minHeight: 48,
                  justifyContent: collapsed ? 'center' : 'initial',
                  px: collapsed ? 1.5 : 2.5,
                  mx: collapsed ? 0.5 : 0,
                  mb: 0.5,
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.08)'
                      : 'rgba(0, 0, 0, 0.04)',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: collapsed ? 40 : 40,
                    mr: collapsed ? 0 : 2,
                    justifyContent: 'center',
                    color: theme.palette.primary.main,
                  }}
                >
                  <LoginIcon />
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary="Sign In"
                    primaryTypographyProps={{
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      sx: {
                        color: theme.palette.primary.main,
                      },
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          </>
        )}
      </List>
    </Box>
  );
}

export type { NavKey };
