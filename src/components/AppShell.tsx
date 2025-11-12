import { ReactNode } from 'react';
import { useState } from 'react';
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
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Article as ArticleIcon,
  Psychology as PsychologyIcon,
  LiveTv as LiveTvIcon,
  ShoppingBag as ShoppingBagIcon,
  Hub as HubIcon,
} from '@mui/icons-material';

type NavKey = 'ventures' | 'content' | 'journal' | 'live' | 'products' | 'web3';

interface NavigationItem {
  key: NavKey;
  label: string;
  href: string;
  icon: React.ComponentType<SvgIconProps>;
}

const navigationItems: NavigationItem[] = [
  { key: 'ventures', label: 'Venture Directory', href: '/', icon: HomeIcon },
  { key: 'content', label: 'Content Library', href: '/content', icon: ArticleIcon },
  { key: 'products', label: 'Product Catalog', href: '/products', icon: ShoppingBagIcon },
  { key: 'web3', label: 'Web3 Hub', href: '/web3', icon: HubIcon },
  { key: 'journal', label: 'AI Journal', href: '/journal', icon: PsychologyIcon },
  { key: 'live', label: 'Live Streaming', href: '/live', icon: LiveTvIcon },
];

interface AppShellProps {
  active: NavKey;
  children: ReactNode;
}

const AppShell = ({ active, children }: AppShellProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const drawer = (
    <Box sx={{ width: 280, height: '100%', bgcolor: 'background.paper' }}>
      <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary">
          iShareHow Navigation
        </Typography>
      </Box>
      <List sx={{ px: 2, py: 2 }}>
        {navigationItems.map((item) => {
          const selected = item.key === active;
          const IconComponent = item.icon;

          return (
            <ListItemButton
              key={item.key}
              onClick={() => {
                if (window.location.pathname !== item.href) {
                  window.location.href = item.href;
                }
              }}
              selected={selected}
              sx={{ borderRadius: 2, mb: 1 }}
            >
              <ListItemIcon>
                <IconComponent color={selected ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: selected ? 600 : 400,
                  color: selected ? 'primary.main' : 'inherit',
                }}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

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
          <IconButton edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: { xs: 'none', sm: 'block' },
            }}
          >
            iShareHow Labs
          </Typography>

          <Box sx={{ flexGrow: 1 }} />
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
            width: 280,
            boxSizing: 'border-box',
            border: 'none',
            borderRight: 1,
            borderColor: 'divider',
            top: '64px',
            height: 'calc(100% - 64px)',
          },
        }}
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: 'calc(100% - 280px)' },
          ml: { md: '280px' },
          mt: '64px',
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

