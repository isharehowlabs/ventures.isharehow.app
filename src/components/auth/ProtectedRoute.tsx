import { ReactNode, useEffect, useState } from 'react';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import PatreonAuth from './PatreonAuth';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user, logout, error } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(false);
  const [refreshTimer, setRefreshTimer] = useState<NodeJS.Timeout | null>(null);
  const [showLogoutOption, setShowLogoutOption] = useState(false);
  const [authFailureCount, setAuthFailureCount] = useState(0);

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

  // Track authentication failures
  useEffect(() => {
    if (!isLoading && !isAuthenticated && error) {
      setAuthFailureCount(prev => prev + 1);
    } else if (isAuthenticated) {
      setAuthFailureCount(0);
    }
  }, [isLoading, isAuthenticated, error]);

  // Show logout option after 3 authentication failures or after 3 seconds
  useEffect(() => {
    if (authFailureCount >= 3 || (isLoading && !checkingAuth)) {
      const timer = setTimeout(() => {
        setShowLogoutOption(true);
      }, authFailureCount >= 3 ? 0 : 3000);
      return () => clearTimeout(timer);
    } else {
      setShowLogoutOption(false);
    }
  }, [authFailureCount, isLoading, checkingAuth]);

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
              Having trouble? Clear your session and try again.
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
        {authFailureCount > 0 && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="error" sx={{ mb: 1 }}>
              Authentication failed. Please try clearing your session.
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                logout();
                window.location.reload();
              }}
              sx={{ mr: 1 }}
            >
              Clear Session
            </Button>
          </Box>
        )}
        <PatreonAuth />
      </Box>
    );
  }

  // Only block dashboard pages (/rise and /learning-hub) for unpaid members
  // BUT allow access if user is employee, admin, or assigned to a client
  // Note: /labs now redirects to /creative?tab=cowork which is protected by Creative Dashboard auth
  // All other pages (including profile, cowork, live) are accessible to authenticated users
  const isDashboardPage = typeof window !== 'undefined' && 
    (window.location.pathname === '/rise' || 
     window.location.pathname === '/learning-hub');
  
  // Allow access if user is employee, admin, or has assigned clients
  const hasAccess = user?.isPaidMember || 
                    user?.isEmployee || 
                    user?.isAdmin ||
                    (user?.id && typeof user.id === 'string' && user.id.toLowerCase() === 'isharehow');
  
  if (!hasAccess && isDashboardPage) {
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

