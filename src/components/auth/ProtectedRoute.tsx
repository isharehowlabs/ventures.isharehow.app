import { ReactNode, useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import PatreonAuth from './PatreonAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [refreshTimer, setRefreshTimer] = useState<NodeJS.Timeout | null>(null);
  const [showLogoutOption, setShowLogoutOption] = useState(false);

  // If we have auth=success in URL, give extra time for session to be available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('auth') === 'success' && isLoading) {
        setCheckingAuth(true);
        // Wait a bit longer for session cookie to be available
        const timer = setTimeout(() => {
          setCheckingAuth(false);
        }, 1500);
        return () => clearTimeout(timer);
      }
    }
  }, [isLoading]);

  // Set up refresh timer if stuck loading
  useEffect(() => {
    if (isLoading || checkingAuth) {
      // If stuck loading for 15 seconds, refresh the page
      const timer = setTimeout(() => {
        if (typeof window !== 'undefined') {
          console.warn('Authentication check stuck, refreshing page...');
          window.location.reload();
        }
      }, 15000);
      setRefreshTimer(timer);
      
      // Show logout option after 5 seconds
      const logoutTimer = setTimeout(() => {
        setShowLogoutOption(true);
      }, 5000);
      
      return () => {
        if (timer) clearTimeout(timer);
        clearTimeout(logoutTimer);
        setRefreshTimer(null);
      };
    } else {
      // Clear timer if no longer loading
      if (refreshTimer) {
        clearTimeout(refreshTimer);
        setRefreshTimer(null);
      }
      setShowLogoutOption(false);
    }
  }, [isLoading, checkingAuth, refreshTimer]);
    }
  }, [isLoading, checkingAuth, refreshTimer]);

  // Show loading while checking auth or if explicitly checking after redirect
  if (isLoading || checkingAuth) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
        }}
      >
        <CircularProgress />
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Verifying authentication...
        </Typography>
        {showLogoutOption && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Taking longer than expected?
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                logout();
                window.location.reload();
              }}
            >
              Clear Session & Retry
            </Button>
          </Box>
        )}
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <PatreonAuth />;
  }

  // Check if user is a paid member
  if (!user?.isPaidMember) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
          p: 4,
          textAlign: 'center',
        }}
      >
        <Typography variant="h4" gutterBottom>
          Membership Required
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 500 }}>
          You need to be an active paid member of our Patreon to access the dashboard.
          Please become a patron to continue.
        </Typography>
        <Button
          variant="contained"
          href="https://www.patreon.com/cw/JamelEliYah"
          target="_blank"
          sx={{
            bgcolor: '#FF424D',
            '&:hover': {
              bgcolor: '#E63946',
            },
          }}
        >
          Join Patreon
        </Button>
      </Box>
    );
  }

  return <>{children}</>;
}

