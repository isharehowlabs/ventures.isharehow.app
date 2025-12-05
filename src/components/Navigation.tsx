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
  ShoppingBag as ShoppingBagIcon,
  Science as LabsIcon,
  TrendingUp as RiseIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Login as LoginIcon,
  VideoCall as DemoIcon,
  Brush as CreativeIcon,
  LiveTv as LiveIcon,
  SportsEsports as GamesIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';

type NavKey = 'home' | 'content' | 'products' | 'labs' | 'rise' | 'live' | 'lookupcafe' | 'profile' | 'settings' | 'web3' | 'demo' | 'creative';

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
    href: '/content',
    icon: <ArticleIcon />,
  },
  {
    key: 'products',
    label: 'Products',
    href: '/products',
    icon: <ShoppingBagIcon />,
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
    key: 'labs',
    label: 'Co-Work Dashboard',
    href: '/labs',
    icon: <LabsIcon />,
    authRequired: false, // Public but enhanced when authenticated
  },
  {
    key: 'rise',
    label: 'RISE Dashboard',
    href: '/rise',
    icon: <RiseIcon />,
    authRequired: false, // Public but enhanced when authenticated
  },
  {
    key: 'creative',
    label: 'Creative Dashboard',
    href: '/creative',
    icon: <CreativeIcon />,
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
      {!collapsed && (
        <Box 
          sx={{ 
            p: 2, 
            textAlign: 'center',
            backgroundColor: theme.palette.background.paper,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography 
            variant="h6" 
            sx={{ 
              color: theme.palette.primary.main,
              fontWeight: 'bold',
            }}
          >
            iShareHow
          </Typography>
          <Typography 
            variant="caption" 
            sx={{ 
              color: theme.palette.text.secondary,
            }}
          >
            Ventures
          </Typography>
        </Box>
      )}
      
      <List 
        sx={{ 
          px: 1, 
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
                  px: 2.5,
                  backgroundColor: active === item.key 
                    ? theme.palette.action.selected 
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.action.selected,
                    '&:hover': {
                      backgroundColor: theme.palette.action.selected,
                    },
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: collapsed ? 0 : 3,
                    justifyContent: 'center',
                    color: active === item.key 
                      ? theme.palette.primary.main 
                      : theme.palette.text.primary,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: active === item.key ? 600 : 400,
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
                  my: 1,
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
                my: 1,
                borderColor: theme.palette.divider,
              }} 
            />
            <Tooltip title={collapsed ? 'Sign In' : ''} placement="right">
              <ListItemButton
                onClick={onLogin}
                sx={{
                  minHeight: 48,
                  justifyContent: collapsed ? 'center' : 'initial',
                  px: 2.5,
                  '&:hover': {
                    backgroundColor: theme.palette.action.hover,
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: collapsed ? 0 : 3,
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
