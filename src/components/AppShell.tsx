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
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';
import ThemeToggle from './ThemeToggle';
import SearchBar from './SearchBar';
import NotificationMenu from './NotificationMenu';
import FocusTimer from './shared/FocusTimer';
import Navigation, { type NavKey } from './Navigation';
import { getBackendUrl } from '../utils/backendUrl';
import { useAuth } from '../hooks/useAuth';
import { useDarkMode } from '../hooks/useDarkMode';
import { SHELL_COLORS } from '../isharehowTheme';

const DRAWER_WIDTH = 240;
const DRAWER_WIDTH_COLLAPSED = 64;
const APPBAR_HEIGHT = 56; // Reduced from 64 for "short header" design

interface AppShellProps {
  active: NavKey;
  children: ReactNode;
}

const AppShell = ({ active, children }: AppShellProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const { user, isAuthenticated, logout } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  const isDark = useDarkMode();

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
    router.push('/creative?tab=cowork');
  };

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const drawerContent = (
    <Box sx={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Collapse Toggle Button - Top */}
      {!isMobile && (
        <Box
          className="app-shell-sidebar-logo"
          sx={{
            display: 'flex',
            justifyContent: sidebarCollapsed ? 'center' : 'flex-end',
            p: 1,
            bgcolor: SHELL_COLORS.sidebar,
            borderBottom: `1px solid ${SHELL_COLORS.border}`,
          }}
        >
          <IconButton
            onClick={handleSidebarToggle}
            sx={{
              bgcolor: 'transparent',
              color: SHELL_COLORS.textSecondary,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.08)',
                color: SHELL_COLORS.textPrimary,
              },
              width: 32,
              height: 32,
            }}
            size="small"
          >
            {sidebarCollapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
          </IconButton>
        </Box>
      )}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <Navigation 
          active={active} 
          isAuthenticated={isAuthenticated}
          collapsed={sidebarCollapsed}
          onLogin={handleLogin}
        />
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* AppBar - Fixed dark color - positioned after drawer */}
      <AppBar
        position="fixed"
        className="app-shell-header"
        sx={{
          zIndex: 1200,
          backgroundColor: SHELL_COLORS.header,
          color: SHELL_COLORS.textPrimary,
          borderBottom: `1px solid ${SHELL_COLORS.border}`,
          left: { xs: 0, md: sidebarCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH },
          width: { xs: '100%', md: `calc(100% - ${sidebarCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH}px)` },
          transition: theme.transitions.create(['left', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
        elevation={0}
      >
        <Toolbar sx={{ minHeight: `${APPBAR_HEIGHT}px !important`, height: APPBAR_HEIGHT }}>
          {/* Mobile menu button */}
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { md: 'none' },
              color: SHELL_COLORS.textPrimary,
            }}
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
                  sx={{ ml: 1, color: SHELL_COLORS.textPrimary }}
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
                  className="app-shell-menu"
                  anchorEl={userMenuAnchor}
                  open={Boolean(userMenuAnchor)}
                  onClose={handleUserMenuClose}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  PaperProps={{
                    sx: { 
                      minWidth: 200, 
                      mt: 1,
                      backgroundColor: SHELL_COLORS.sidebar,
                      color: SHELL_COLORS.textPrimary,
                      border: `1px solid ${SHELL_COLORS.border}`,
                    },
                  }}
                >
                  <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ color: SHELL_COLORS.textPrimary }}>
                      {user?.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: SHELL_COLORS.textSecondary }}>
                      {user?.email}
                    </Typography>
                  </Box>
                  <Divider sx={{ borderColor: SHELL_COLORS.border }} />
                  <MenuItem 
                    onClick={handleProfileClick}
                    sx={{
                      color: SHELL_COLORS.textPrimary,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      },
                    }}
                  >
                    <ListItemIcon>
                      <PersonIcon fontSize="small" sx={{ color: SHELL_COLORS.textPrimary }} />
                    </ListItemIcon>
                    <Typography>Profile</Typography>
                  </MenuItem>
                  <MenuItem 
                    onClick={handleSettingsClick}
                    sx={{
                      color: SHELL_COLORS.textPrimary,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      },
                    }}
                  >
                    <ListItemIcon>
                      <SettingsIcon fontSize="small" sx={{ color: SHELL_COLORS.textPrimary }} />
                    </ListItemIcon>
                    <Typography>Settings</Typography>
                  </MenuItem>
                  <Divider sx={{ borderColor: SHELL_COLORS.border }} />
                  <MenuItem 
                    onClick={handleLogout}
                    sx={{
                      color: SHELL_COLORS.textPrimary,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                      },
                    }}
                  >
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" sx={{ color: SHELL_COLORS.textPrimary }} />
                    </ListItemIcon>
                    <Typography>Logout</Typography>
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
        sx={{ 
          width: { 
            md: sidebarCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH 
          }, 
          flexShrink: { md: 0 },
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              zIndex: 1200,
              backgroundColor: SHELL_COLORS.sidebar,
              color: SHELL_COLORS.textPrimary,
              borderRight: `1px solid ${SHELL_COLORS.border}`,
            },
          }}
        >
          <Toolbar 
            sx={{ 
              minHeight: APPBAR_HEIGHT,
              backgroundColor: SHELL_COLORS.sidebar,
              color: SHELL_COLORS.textPrimary,
            }} 
          />
          {drawerContent}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          className="app-shell-sidebar"
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: sidebarCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
              zIndex: 1300,
              backgroundColor: SHELL_COLORS.sidebar,
              color: SHELL_COLORS.textPrimary,
              borderRight: `1px solid ${SHELL_COLORS.border}`,
              top: 0,
              height: '100vh',
              position: 'fixed',
              transition: theme.transitions.create('width', {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.enteringScreen,
              }),
              overflowX: 'hidden',
            },
          }}
          open
        >
          <Toolbar 
            sx={{ 
              minHeight: APPBAR_HEIGHT,
              backgroundColor: SHELL_COLORS.sidebar,
              color: SHELL_COLORS.textPrimary,
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
          width: { 
            xs: '100%', 
            md: `calc(100% - ${sidebarCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH}px)` 
          },
          minHeight: '100vh',
          mt: `${APPBAR_HEIGHT}px`,
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AppShell;
