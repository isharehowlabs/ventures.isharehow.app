import { ReactNode, useState } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  ListItemIcon,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Login as LoginIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import ThemeToggle from './ThemeToggle';
import SearchBar from './SearchBar';
import NotificationMenu from './NotificationMenu';
import FocusTimer from './shared/FocusTimer';
import Navigation, { type NavKey } from './Navigation';
import { getBackendUrl } from '../utils/backendUrl';
import { useAuth } from '../hooks/useAuth';

const DRAWER_WIDTH = 240;
const APPBAR_HEIGHT = 64;

interface AppShellProps {
  active: NavKey;
  children: ReactNode;
}

const AppShell = ({ active, children }: AppShellProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const { user, isAuthenticated, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleProfileClick = () => {
    router.push('/profile');
    handleUserMenuClose();
  };

  const handleSettingsClick = () => {
    router.push('/settings');
    handleUserMenuClose();
  };

  const handleLogout = () => {
    logout();
    handleUserMenuClose();
    router.push('/');
  };

  const handleLogin = () => {
    // Redirect to login page (or current page if it shows login form)
    // The ProtectedRoute component will show the login form
    router.push('/creative?tab=cowork');
  };

  const drawerContent = (
    <Navigation 
      active={active} 
      isAuthenticated={isAuthenticated}
      collapsed={false}
      onLogin={handleLogin}
    />
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: 1201,
          backgroundColor: theme.palette.mode === 'dark' ? theme.palette.background.paper : theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
        elevation={1}
      >
        <Toolbar sx={{ minHeight: APPBAR_HEIGHT }}>
          {/* Mobile menu button */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo/Brand */}
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{
              flexGrow: 0,
              fontWeight: 700,
              color: 'primary.main',
              display: { xs: 'none', sm: 'block' },
              mr: 3,
            }}
          >
            iShareHow Ventures
          </Typography>

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Right side items */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SearchBar />
            <FocusTimer location={active === 'rise' ? 'rise' : 'cowork'} />
            <NotificationMenu />
            <ThemeToggle />

            {/* User menu */}
            {isAuthenticated ? (
              <>
                <IconButton
                  onClick={handleUserMenuOpen}
                  sx={{ ml: 1 }}
                  aria-label="user menu"
                >
                  <Avatar
                    src={user?.avatar}
                    alt={user?.name || 'User'}
                    sx={{ width: 32, height: 32 }}
                  >
                    {user?.name?.charAt(0) || 'U'}
                  </Avatar>
                </IconButton>

                <Menu
                  anchorEl={userMenuAnchor}
                  open={Boolean(userMenuAnchor)}
                  onClose={handleUserMenuClose}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  PaperProps={{
                    sx: { 
                      minWidth: 200, 
                      mt: 1,
                      backgroundColor: theme.palette.background.paper,
                      color: theme.palette.text.primary,
                      border: `1px solid ${theme.palette.divider}`,
                    },
                  }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {user?.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user?.email}
                    </Typography>
                  </Box>
                  <Divider sx={{ borderColor: theme.palette.divider }} />
                  <MenuItem 
                    onClick={handleProfileClick}
                    sx={{
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <ListItemIcon>
                      <PersonIcon fontSize="small" sx={{ color: theme.palette.text.primary }} />
                    </ListItemIcon>
                    <Typography sx={{ color: theme.palette.text.primary }}>Profile</Typography>
                  </MenuItem>
                  <MenuItem 
                    onClick={handleSettingsClick}
                    sx={{
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <ListItemIcon>
                      <SettingsIcon fontSize="small" sx={{ color: theme.palette.text.primary }} />
                    </ListItemIcon>
                    <Typography sx={{ color: theme.palette.text.primary }}>Settings</Typography>
                  </MenuItem>
                  <Divider sx={{ borderColor: theme.palette.divider }} />
                  <MenuItem 
                    onClick={handleLogout}
                    sx={{
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" sx={{ color: theme.palette.text.primary }} />
                    </ListItemIcon>
                    <Typography sx={{ color: theme.palette.text.primary }}>Logout</Typography>
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <IconButton
                onClick={handleLogin}
                color="primary"
                aria-label="login"
                sx={{ ml: 1 }}
              >
                <LoginIcon />
              </IconButton>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              zIndex: 1200,
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          <Toolbar 
            sx={{ 
              minHeight: APPBAR_HEIGHT,
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
            }} 
          />
          {drawerContent}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              zIndex: 1200,
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
          open
        >
          <Toolbar 
            sx={{ 
              minHeight: APPBAR_HEIGHT,
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
            }} 
          />
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { xs: '100%', md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          mt: `${APPBAR_HEIGHT}px`,
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AppShell;
