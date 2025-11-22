import { ReactNode } from 'react';
import { useState, useEffect, useRef } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Container,
  Stack,
  Button,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  type SvgIconProps,
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Article as ArticleIcon,
  LiveTv as LiveTvIcon,
  ShoppingBag as ShoppingBagIcon,
  TrendingUp as TrendingUpIcon,
  Info as InfoIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../hooks/useAuth';

type NavKey = 'content' | 'labs' | 'products' | 'rise' | 'about';

interface NavigationItem {
  key: NavKey;
  label: string;
  href: string;
  icon: React.ComponentType<SvgIconProps>;
}

const navigationItems: NavigationItem[] = [
  { key: 'about', label: 'Home', href: '/', icon: HomeIcon },
  { key: 'content', label: 'Our Portfolio', href: '/content', icon: ArticleIcon },
  { key: 'products', label: 'Product Catalog', href: '/products', icon: ShoppingBagIcon },
  { key: 'labs', label: 'Co-Work Dashboard', href: '/labs', icon: LiveTvIcon },
  { key: 'rise', label: 'RISE Dashboard', href: '/rise', icon: TrendingUpIcon },
];

interface AppShellProps {
  active: NavKey;
  children: ReactNode;
}

const AppShell = ({ active, children }: AppShellProps): React.ReactElement => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [userMenuAnchor, setUserMenuAnchor] = useState<null | HTMLElement>(null);
  const { user, isAuthenticated } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const DRAWER_WIDTH = 280;
  const COLLAPSED_WIDTH = 64;
  const HOVER_ZONE_WIDTH = 80; // Width of the hover zone on the left edge

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleNavigate = (path: string) => {
    handleUserMenuClose();
    if (typeof window !== 'undefined' && window.location.pathname !== path) {
      window.location.href = path;
    }
  };

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  useEffect(() => {
    if (isMobile) return; // Only apply on desktop

    const handleMouseMove = (e: MouseEvent) => {
      const mouseX = e.clientX;
      
      // If mouse is in the hover zone (left edge) or in the drawer area
      if (mouseX <= HOVER_ZONE_WIDTH || (drawerRef.current && drawerRef.current.contains(e.target as Node))) {
        setIsCollapsed(false);
        setIsHovering(true);
        
        // Clear any existing timeout
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
          hoverTimeoutRef.current = null;
        }
      } else {
        // Mouse is away from drawer, set a delay before collapsing
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
        }
        
        hoverTimeoutRef.current = setTimeout(() => {
          if (!drawerRef.current?.contains(e.target as Node)) {
            setIsCollapsed(true);
            setIsHovering(false);
          }
        }, 300); // 300ms delay before collapsing
      }
    };

    const handleMouseLeave = () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      hoverTimeoutRef.current = setTimeout(() => {
        setIsCollapsed(true);
        setIsHovering(false);
      }, 300);
    };

    // Initialize as collapsed after a short delay
    initTimeoutRef.current = setTimeout(() => {
      setIsCollapsed(true);
    }, 1000); // Start collapsed after 1 second

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = null;
      }
    };
  }, [isMobile]);

  // Removed orphaned drawer variable. All JSX is returned below.

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Toolbar sx={{ minHeight: '64px !important', px: { xs: 1, sm: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <IconButton 
              edge="start" 
              onClick={handleDrawerToggle} 
              sx={{ display: { md: 'none' }, mr: 1 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="body2"
              sx={{
                display: { md: 'none' },
                fontWeight: 600,
                color: 'text.primary',
                cursor: 'pointer',
              }}
              onClick={handleDrawerToggle}
            >
              Menu
            </Typography>
          </Box>
          {/* AppBar remains, but features are moved to Drawer */}
        </Toolbar>
      </AppBar>
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block' },
          '& .MuiDrawer-paper': {
            width: isCollapsed && !isMobile ? COLLAPSED_WIDTH : DRAWER_WIDTH,
            boxSizing: 'border-box',
            border: 'none',
            borderRight: 1,
            borderColor: 'divider',
            top: '64px',
            height: 'calc(100% - 64px)',
            transition: 'width 0.3s ease-in-out',
            overflowX: 'hidden',
          },
        }}
      >
        <Box 
          sx={{ 
            p: isCollapsed && !isMobile ? 2 : 3, 
            borderBottom: 1, 
            borderColor: 'divider',
            transition: 'padding 0.3s ease-in-out',
            display: 'flex',
            flexDirection: 'column',
            alignItems: isCollapsed && !isMobile ? 'center' : 'flex-start',
            gap: 2,
          }}
        >
          {/* Branding */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: { xs: 'none', sm: 'block' },
              mb: 1,
              cursor: 'pointer',
            }}
            onClick={() => handleNavigate('/')}
          >
            iShareHow Labs
          </Typography>
          {/* Theme toggle */}
          <ThemeToggle />
          {/* Profile button */}
          {isAuthenticated && user && (
            <Tooltip title="Account">
              <IconButton
                onClick={handleUserMenuOpen}
                sx={{ ml: 0 }}
                size="small"
              >
                <Avatar
                  src={user.avatar}
                  sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
                >
                  {user.name?.charAt(0).toUpperCase() || <PersonIcon />}
                </Avatar>
              </IconButton>
            </Tooltip>
          )}
          <Menu
            anchorEl={userMenuAnchor}
            open={Boolean(userMenuAnchor)}
            onClose={handleUserMenuClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            <MenuItem onClick={() => handleNavigate('/profile')}>
              <PersonIcon sx={{ mr: 1 }} fontSize="small" />
              Profile
            </MenuItem>
            <MenuItem onClick={() => handleNavigate('/settings')}>
              <SettingsIcon sx={{ mr: 1 }} fontSize="small" />
              Settings
            </MenuItem>
          </Menu>
        </Box>
        {/* ...existing navigation code... */}
      </Drawer>

      <Box
        sx={{
          flexGrow: 1,
          width: {
            md: isCollapsed && !isMobile
              ? `calc(100% - ${COLLAPSED_WIDTH}px)`
              : `calc(100% - ${DRAWER_WIDTH}px)`
          },
          ml: {
            md: isCollapsed && !isMobile
              ? `${COLLAPSED_WIDTH}px`
              : `${DRAWER_WIDTH}px`
          },
          transition: 'margin-left 0.3s ease-in-out, width 0.3s ease-in-out',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
      >
        {isMobile && <Toolbar />}

        <Container maxWidth="xl" sx={{ py: 4 }}>
          {children}
        </Container>

        <Box
          sx={{
            borderTop: 1,
            borderColor: 'divider',
            py: 4,
            bgcolor: 'background.paper',
            mt: 'auto',
          }}
        >
          <Container maxWidth="xl">
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="body2" color="text.secondary">
                © {new Date().getFullYear()} iShareHow LABS LLC. All rights reserved.
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button size="small" sx={{ textTransform: 'none' }}>
                  About
                </Button>
                <Button size="small" sx={{ textTransform: 'none' }}>
                  Contact
                </Button>
                <Button size="small" sx={{ textTransform: 'none' }}>
                  Privacy
                </Button>
              </Stack>
            </Stack>
          </Container>
        </Box>
      </Box>
    </Box>
  );
};

export default AppShell;

