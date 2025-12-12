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
  Collapse,
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
  AutoAwesome as AutoAwesomeIcon,
  ExpandLess,
  ExpandMore,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { useDarkMode } from '../hooks/useDarkMode';
import { SHELL_COLORS } from '../isharehowTheme';

type NavKey = 'home' | 'content' | 'products' | 'rise' | 'live' | 'lookupcafe' | 'profile' | 'billing' | 'settings' | 'web3' | 'demo' | 'creative' | 'blog' | 'learning-hub' | 'about' | 'enterprise' | 'crm' | 'website-apps' | 'growth-machine' | 'dashboard' | 'fractional-digital-agency' | 'ai-help';

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
    key: 'dashboard',
    label: 'Dashboard',
    href: '/creative',
    icon: <CreativeIcon />,
    authRequired: false,
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
  const [homeExpanded, setHomeExpanded] = useState(false);
  const [dashboardExpanded, setDashboardExpanded] = useState(false);
  const isDarkMode = useDarkMode();
  
  // Get text colors - use fixed shell colors
  const textPrimary = SHELL_COLORS.textPrimary;
  const textSecondary = SHELL_COLORS.textSecondary;
  // Legacy dark mode check (keeping for compatibility)

  // Sales pages sub-items for Home
  const salesPages = [
    { key: 'products' as NavKey, label: 'Products', href: '/products', icon: <ShoppingBagIcon /> },
    { key: 'ai-help' as NavKey, label: 'AI Help', href: '/ai-help', icon: <AutoAwesomeIcon /> },
    { key: 'fractional-digital-agency' as NavKey, label: 'Fractional Digital Agency', href: '/fractional-digital-agency', icon: <CreativeIcon /> },
    { key: 'website-apps' as NavKey, label: 'Website Apps', href: '/website-apps', icon: <AppsIcon /> },
    { key: 'growth-machine' as NavKey, label: 'Growth Machine', href: '/growth-machine', icon: <RiseIcon /> },
    { key: 'enterprise' as NavKey, label: 'Enterprise', href: '/enterprise', icon: <BusinessIcon /> },
  ];

  // Check if any sales page is active
  const isSalesPageActive = salesPages.some(page => active === page.key);

  // Dashboard sub-items
  const dashboardPages = [
    { key: 'creative' as NavKey, label: 'Creative Dashboard', href: '/creative', icon: <CreativeIcon /> },
    { key: 'rise' as NavKey, label: 'RISE Dashboard', href: '/rise', icon: <RiseIcon /> },
    { key: 'learning-hub' as NavKey, label: 'Learning Dashboard', href: '/learning-hub', icon: <LearningHubIcon /> },
  ];

  // Check if any dashboard page is active
  const isDashboardPageActive = dashboardPages.some(page => active === page.key);

  // Auto-expand Home if a sales page is active
  useEffect(() => {
    if (isSalesPageActive && !homeExpanded) {
      setHomeExpanded(true);
    }
  }, [isSalesPageActive, homeExpanded]);

  // Auto-expand Dashboard if a dashboard page is active
  useEffect(() => {
    if (isDashboardPageActive && !dashboardExpanded) {
      setDashboardExpanded(true);
    }
  }, [isDashboardPageActive, dashboardExpanded]);

  const handleNavigate = (href: string) => {
    router.push(href);
  };

  const handleHomeClick = () => {
    if (collapsed) {
      router.push('/');
    } else {
      setHomeExpanded(!homeExpanded);
      if (!homeExpanded) {
        router.push('/');
      }
    }
  };

  const handleDashboardClick = () => {
    if (collapsed) {
      router.push('/creative');
    } else {
      setDashboardExpanded(!dashboardExpanded);
      if (!dashboardExpanded) {
        router.push('/creative');
      }
    }
  };

  const filteredItems = navigationItems.filter(item => {
    if (item.authRequired && !isAuthenticated) {
      return false;
    }
    // Filter out individual dashboard items since they're sub-items of Dashboard
    if (item.key === 'creative' || item.key === 'rise' || item.key === 'learning-hub') {
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
        backgroundColor: SHELL_COLORS.sidebar,
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
            borderBottom: `1px solid ${SHELL_COLORS.border}`,
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
          backgroundColor: SHELL_COLORS.sidebar,
          color: theme.palette.text.primary,
        }}
      >
        {filteredItems.map((item) => {
          // Special handling for Dashboard item with nested dashboard pages
          if (item.key === 'dashboard' && !collapsed) {
            return (
              <Box key={item.key}>
                <Tooltip title={collapsed ? item.label : ''} placement="right">
                  <ListItemButton
                    selected={active === item.key || isDashboardPageActive}
                    onClick={handleDashboardClick}
                    sx={{
                      minHeight: 48,
                      justifyContent: 'initial',
                      px: 2.5,
                      mx: 0,
                      mb: 0.5,
                      borderRadius: 1,
                      backgroundColor: (active === item.key || isDashboardPageActive)
                        ? isDarkMode 
                          ? 'rgba(144, 202, 249, 0.16)' 
                          : 'rgba(25, 118, 210, 0.08)'
                        : 'transparent',
                      '&:hover': {
                        backgroundColor: isDarkMode
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(0, 0, 0, 0.04)',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                        mr: 2,
                        justifyContent: 'center',
                        color: (active === item.key || isDashboardPageActive)
                          ? theme.palette.primary.main 
                          : textSecondary,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: (active === item.key || isDashboardPageActive) ? 600 : 500,
                        fontSize: '0.875rem',
                        sx: {
                          color: (active === item.key || isDashboardPageActive)
                            ? theme.palette.primary.main 
                            : textPrimary,
                        },
                      }}
                    />
                    <Box
                      sx={{
                        ml: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        color: (active === item.key || isDashboardPageActive)
                          ? theme.palette.primary.main 
                          : textSecondary,
                      }}
                    >
                      {dashboardExpanded ? <ExpandLess /> : <ExpandMore />}
                    </Box>
                  </ListItemButton>
                </Tooltip>
                <Collapse in={dashboardExpanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {dashboardPages.map((dashboardPage) => (
                      <ListItemButton
                        key={dashboardPage.key}
                        selected={active === dashboardPage.key}
                        onClick={() => handleNavigate(dashboardPage.href)}
                        sx={{
                          pl: 6,
                          minHeight: 40,
                          mb: 0.25,
                          borderRadius: 1,
                          backgroundColor: active === dashboardPage.key 
                            ? isDarkMode 
                              ? 'rgba(144, 202, 249, 0.16)' 
                              : 'rgba(25, 118, 210, 0.08)'
                            : 'transparent',
                          '&:hover': {
                            backgroundColor: isDarkMode
                              ? 'rgba(255, 255, 255, 0.08)'
                              : 'rgba(0, 0, 0, 0.04)',
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 32,
                            mr: 2,
                            justifyContent: 'center',
                            color: active === dashboardPage.key 
                              ? theme.palette.primary.main 
                              : textSecondary,
                          }}
                        >
                          {dashboardPage.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={dashboardPage.label}
                          primaryTypographyProps={{
                            fontWeight: active === dashboardPage.key ? 600 : 400,
                            fontSize: '0.8125rem',
                            sx: {
                              color: active === dashboardPage.key 
                                ? theme.palette.primary.main 
                                : textSecondary,
                            },
                          }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </Box>
            );
          }

          // Special handling for Home item with nested sales pages
          if (item.key === 'home' && !collapsed) {
            return (
              <Box key={item.key}>
                <Tooltip title={collapsed ? item.label : ''} placement="right">
                  <ListItemButton
                    selected={active === item.key || isSalesPageActive}
                    onClick={handleHomeClick}
                    sx={{
                      minHeight: 48,
                      justifyContent: 'initial',
                      px: 2.5,
                      mx: 0,
                      mb: 0.5,
                      borderRadius: 1,
                      backgroundColor: (active === item.key || isSalesPageActive)
                        ? isDarkMode 
                          ? 'rgba(144, 202, 249, 0.16)' 
                          : 'rgba(25, 118, 210, 0.08)'
                        : 'transparent',
                      '&:hover': {
                        backgroundColor: isDarkMode
                          ? 'rgba(255, 255, 255, 0.08)'
                          : 'rgba(0, 0, 0, 0.04)',
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 40,
                        mr: 2,
                        justifyContent: 'center',
                        color: (active === item.key || isSalesPageActive)
                          ? theme.palette.primary.main 
                          : textSecondary,
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontWeight: (active === item.key || isSalesPageActive) ? 600 : 500,
                        fontSize: '0.875rem',
                        sx: {
                          color: (active === item.key || isSalesPageActive)
                            ? theme.palette.primary.main 
                            : textPrimary,
                        },
                      }}
                    />
                    <Box
                      sx={{
                        ml: 'auto',
                        display: 'flex',
                        alignItems: 'center',
                        color: (active === item.key || isSalesPageActive)
                          ? theme.palette.primary.main 
                          : textSecondary,
                      }}
                    >
                      {homeExpanded ? <ExpandLess /> : <ExpandMore />}
                    </Box>
                  </ListItemButton>
                </Tooltip>
                <Collapse in={homeExpanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {salesPages.map((salesPage) => (
                      <ListItemButton
                        key={salesPage.key}
                        selected={active === salesPage.key}
                        onClick={() => handleNavigate(salesPage.href)}
                        sx={{
                          pl: 6,
                          minHeight: 40,
                          mb: 0.25,
                          borderRadius: 1,
                          backgroundColor: active === salesPage.key 
                            ? isDarkMode 
                              ? 'rgba(144, 202, 249, 0.16)' 
                              : 'rgba(25, 118, 210, 0.08)'
                            : 'transparent',
                          '&:hover': {
                            backgroundColor: isDarkMode
                              ? 'rgba(255, 255, 255, 0.08)'
                              : 'rgba(0, 0, 0, 0.04)',
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 32,
                            mr: 2,
                            justifyContent: 'center',
                            color: active === salesPage.key 
                              ? theme.palette.primary.main 
                              : textSecondary,
                          }}
                        >
                          {salesPage.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={salesPage.label}
                          primaryTypographyProps={{
                            fontWeight: active === salesPage.key ? 600 : 400,
                            fontSize: '0.8125rem',
                            sx: {
                              color: active === salesPage.key 
                                ? theme.palette.primary.main 
                                : textSecondary,
                            },
                          }}
                        />
                      </ListItemButton>
                    ))}
                  </List>
                </Collapse>
              </Box>
            );
          }

          // Regular items
          return (
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
                      ? isDarkMode 
                        ? 'rgba(144, 202, 249, 0.16)' 
                        : 'rgba(25, 118, 210, 0.08)'
                      : 'transparent',
                    '&:hover': {
                      backgroundColor: isDarkMode
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(0, 0, 0, 0.04)',
                    },
                    '&.Mui-selected': {
                      backgroundColor: active === item.key 
                        ? isDarkMode 
                          ? 'rgba(144, 202, 249, 0.16)' 
                          : 'rgba(25, 118, 210, 0.08)'
                        : 'transparent',
                      '&:hover': {
                        backgroundColor: active === item.key
                          ? isDarkMode 
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
                        : textSecondary,
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
                            : textPrimary,
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
                    borderColor: SHELL_COLORS.border,
                  }} 
                />
              )}
            </Box>
          );
        })}
        
        {/* Sign In button for unauthenticated users */}
        {!isAuthenticated && onLogin && (
          <>
            <Divider 
              sx={{ 
                my: 1.5,
                mx: collapsed ? 1 : 2,
                borderColor: SHELL_COLORS.border,
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
                    backgroundColor: isDarkMode
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
