import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  Box,
  Typography,
} from '@mui/material';
import {
  Home as HomeIcon,
  Article as ArticleIcon,
  ShoppingBag as ShoppingBagIcon,
  Science as LabsIcon,
  TrendingUp as RiseIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Info as InfoIcon,
  Login as LoginIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';

type NavKey = 'home' | 'content' | 'products' | 'labs' | 'rise' | 'profile' | 'settings' | 'about';

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
    key: 'about',
    label: 'About',
    href: '/about',
    icon: <InfoIcon />,
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
    <Box sx={{ overflow: 'auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {!collapsed && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="h6" color="primary" fontWeight="bold">
            iShareHow
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Ventures
          </Typography>
        </Box>
      )}
      
      <List sx={{ px: 1, flexGrow: 1 }}>
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
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: collapsed ? 0 : 3,
                    justifyContent: 'center',
                    color: active === item.key ? 'primary.main' : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontWeight: active === item.key ? 600 : 400,
                      color: active === item.key ? 'primary.main' : 'inherit',
                    }}
                  />
                )}
              </ListItemButton>
            </Tooltip>
            {item.dividerAfter && <Divider sx={{ my: 1 }} />}
          </Box>
        ))}
        
        {/* Sign In button for unauthenticated users */}
        {!isAuthenticated && onLogin && (
          <>
            <Divider sx={{ my: 1 }} />
            <Tooltip title={collapsed ? 'Sign In' : ''} placement="right">
              <ListItemButton
                onClick={onLogin}
                sx={{
                  minHeight: 48,
                  justifyContent: collapsed ? 'center' : 'initial',
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: collapsed ? 0 : 3,
                    justifyContent: 'center',
                    color: 'primary.main',
                  }}
                >
                  <LoginIcon />
                </ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primary="Sign In"
                    primaryTypographyProps={{
                      fontWeight: 600,
                      color: 'primary.main',
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
