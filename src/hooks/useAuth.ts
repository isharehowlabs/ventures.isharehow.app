import { useState, useEffect, useCallback } from 'react';
import { getBackendUrl } from '../utils/backendUrl';

// Global state to prevent duplicate auth checks across all hook instances
let globalAuthCheckInProgress = false;
let globalAuthCheckPromise: Promise<void> | null = null;
let globalAuthState: AuthState | null = null;
let globalAuthListeners: Set<(state: AuthState) => void> = new Set();

interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  avatarUrl?: string;
  patreonId?: string;
  isPaidMember?: boolean;
  membershipTier?: string;
  lifetimeSupportAmount?: number;
  membershipRenewalDate?: string;
  isEmployee?: boolean;
  isAdmin?: boolean;
  createdAt?: string;
  patreonConnected?: boolean;
  lastChecked?: string;
  // Web3/ENS fields
  ensName?: string;
  cryptoAddress?: string;
  contentHash?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  // Initialize state from global cache if available, otherwise use defaults
  const [authState, setAuthState] = useState<AuthState>(() => 
    globalAuthState || {
      user: null,
      isAuthenticated: false,
      isLoading: true,
      error: null,
    }
  );

  // Register this component as a listener for global auth state changes
  useEffect(() => {
    const listener = (newState: AuthState) => {
      setAuthState(newState);
    };
    globalAuthListeners.add(listener);
    
    // If there's cached state, use it immediately
    if (globalAuthState && !globalAuthState.isLoading) {
      setAuthState(globalAuthState);
    }
    
    return () => {
      globalAuthListeners.delete(listener);
    };
  }, []);

  // Helper to update all listeners
  const updateGlobalAuthState = useCallback((newState: AuthState) => {
    globalAuthState = newState;
    globalAuthListeners.forEach(listener => listener(newState));
  }, []);

  // JWT tokens are now stored in httpOnly cookies (set by backend)
  // We don't need to access tokens from JavaScript - backend handles it automatically

  const checkAuth = useCallback(async () => {
    // If there's already a global auth check in progress, wait for it (with timeout)
    if (globalAuthCheckInProgress && globalAuthCheckPromise) {
      console.log('[Auth] Auth check already in progress globally, waiting for existing check...');
      try {
        // Wait for existing check but with a timeout
        await Promise.race([
          globalAuthCheckPromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error('Wait timeout')), 3000))
        ]);
        return;
      } catch (e) {
        // If the existing check failed or timed out, continue with a new check
        console.log('[Auth] Previous check failed or timed out, starting new check...');
        globalAuthCheckInProgress = false;
        globalAuthCheckPromise = null;
      }
    }
    
    // Start new global auth check
    globalAuthCheckInProgress = true;
    const authCheckPromise = (async () => {
      try {
        const backendUrl = getBackendUrl();
        
        // Debug: Log auth check attempt (only once per global check)
        if (globalAuthListeners.size === 1) {
          console.log('[Auth] Checking authentication...', {
            backendUrl,
            timestamp: new Date().toISOString(),
            listeners: globalAuthListeners.size,
          });
        }
        
        // Create a timeout promise (reduced to 5 seconds for better UX)
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            console.log('[Auth] Request timed out after 15 seconds');
            reject(new Error('Request timeout'));
          }, 15000); // Increased from 5s to 15s for slower connections
        });

        // JWT token is in httpOnly cookie, backend will read it automatically
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        // Race the fetch against the timeout
        const response = await Promise.race([
          fetch(`${backendUrl}/api/auth/me`, {
            method: 'GET',
            credentials: 'include', // Important: include cookies (for httpOnly JWT cookie)
            headers,
            mode: 'cors', // Ensure CORS mode
          }),
          timeoutPromise
        ]);

        // Debug: Log response details (only once)
        if (globalAuthListeners.size === 1) {
          console.log('[Auth] Response received:', {
            status: response.status,
            statusText: response.statusText,
          });
        }

        if (response.ok) {
          const data = await response.json();
          
          // Check if user is authenticated (backend returns {authenticated: false} when no token)
          if (data.authenticated === false || !data.id) {
            const newState: AuthState = {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null,
            };
            updateGlobalAuthState(newState);
          } else {
            if (globalAuthListeners.size === 1) {
              console.log('[Auth] ✓ Authentication successful:', {
                userId: data.id,
                userName: data.name,
                isPaidMember: data.isPaidMember,
              });
            }
            
            // JWT token is in httpOnly cookie, no need to store in localStorage
            const newState: AuthState = {
              user: data,
              isAuthenticated: true,
              isLoading: false,
              error: null,
            };
            updateGlobalAuthState(newState);
          }
        } else {
          // Log error details for debugging
          let errorData: any = {};
          try {
            const text = await response.text();
            if (text) {
              errorData = JSON.parse(text);
            }
          } catch (e) {
            // Response might not be JSON
            errorData = { message: `Server error: ${response.status} ${response.statusText}` };
          }
          
          if (globalAuthListeners.size === 1) {
            console.warn('[Auth] ✗ Auth check failed:', {
              status: response.status,
              statusText: response.statusText,
              error: errorData,
            });
          }
          
          // If it's a 500 error with migration_required, show helpful message
          let newState: AuthState;
          if (response.status === 500 && errorData.migration_required) {
            newState = {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: 'Database migration required. Please contact support.',
            };
          } else if (response.status === 500) {
            // For other 500 errors, treat as not authenticated (graceful degradation)
            newState = {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: null, // Don't show error for server issues, just treat as not authenticated
            };
          } else {
            newState = {
              user: null,
              isAuthenticated: false,
              isLoading: false,
              error: errorData.message || 'Authentication failed',
            };
          }
          updateGlobalAuthState(newState);
        }
      } catch (error: any) {
        if (globalAuthListeners.size === 1) {
          console.error('[Auth] ✗ Auth check error:', {
            message: error.message,
            name: error.name,
          });
        }
        const isTimeout = error.message === 'Request timeout';
        
        // On timeout, don't set error - just treat as not authenticated (graceful degradation)
        // This allows the app to continue functioning even if auth check is slow
        const newState: AuthState = {
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null, // Don't show timeout errors to user, just treat as not authenticated
        };
        updateGlobalAuthState(newState);
        
        if (isTimeout && globalAuthListeners.size === 1) {
          console.warn('[Auth] Auth check timed out - treating as not authenticated. App will continue to function.');
        }
      } finally {
        globalAuthCheckInProgress = false;
        globalAuthCheckPromise = null;
      }
    })();
    
    globalAuthCheckPromise = authCheckPromise;
    await authCheckPromise;
  }, [updateGlobalAuthState]);

  useEffect(() => {
    // Only check auth once on mount, not on every render
    let mounted = true;
    
    const performAuthCheck = async () => {
      if (mounted) {
        await checkAuth();
      }
    };
    
    performAuthCheck();
    
    // Check for auth success parameter in URL (JWT is in httpOnly cookie now)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('auth') === 'success') {
        console.log('[Auth] Detected auth=success in URL, JWT should be in httpOnly cookie');
        
        // Clean URL immediately
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
        console.log('[Auth] Cleaned up URL parameter');
        
        // Single retry after a short delay (cookie might need a moment to be available)
        setTimeout(() => {
          if (mounted) {
            console.log('[Auth] Retry auth check after URL cleanup');
            checkAuth();
          }
        }, 1000);
      }
    }
    
    return () => {
      mounted = false;
    };
  }, []); // Empty deps - only run once on mount

  const login = () => {
    const backendUrl = getBackendUrl();
    console.log('[Auth] Initiating Patreon login...', { backendUrl });
    window.location.href = `${backendUrl}/api/auth/patreon`;
  };

  const logout = useCallback(async () => {
    try {
      const backendUrl = getBackendUrl();
      
      console.log('[Auth] Logging out...');
      
      // JWT token is in httpOnly cookie, backend will read it automatically
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      await fetch(`${backendUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include', // Include cookies so backend can clear JWT cookie
        headers,
      });
      
      // Backend clears the JWT cookie, no need to clear localStorage
      const newState: AuthState = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
      updateGlobalAuthState(newState);
      console.log('[Auth] ✓ Logged out successfully');
    } catch (error: any) {
      console.error('[Auth] Logout error:', error);
      // Clear state even on error
      const newState: AuthState = {
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
      updateGlobalAuthState(newState);
    }
  }, [updateGlobalAuthState]);

  return {
    ...authState,
    login,
    logout,
    refresh: checkAuth,
  };
}
