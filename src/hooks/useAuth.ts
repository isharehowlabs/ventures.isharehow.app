import { useState, useEffect, useCallback } from 'react';
import { getBackendUrl } from '../utils/backendUrl';

// Global state to prevent duplicate auth checks across all hook instances
let globalAuthCheckInProgress = false;
let globalAuthCheckPromise: Promise<void> | null = null;
let globalAuthState: AuthState | null = null;
let globalAuthListeners: Set<(state: AuthState) => void> = new Set();

export interface User {
  id: string;
  userId?: string;  // Numeric database ID
  name: string;
  username?: string;  // Username field
  email?: string;
  avatar?: string;
  avatarUrl?: string;
  // Deprecated Patreon fields (kept for backward compatibility)
  patreonId?: string;
  patreonConnected?: boolean;
  // Subscription fields
  isPaidMember?: boolean;
  membershipPaid?: boolean;  // Database field name for paid status
  membershipTier?: string;
  lifetimeSupportAmount?: number;
  membershipRenewalDate?: string;
  hasSubscriptionUpdate?: boolean;
  subscriptionUpdateActive?: boolean;
  shopifyCustomerId?: string;
  boldSubscriptionId?: string;
  // ETH payment fields
  ethPaymentVerified?: boolean;
  ethPaymentAmount?: string | number;
  ethPaymentTxHash?: string;
  ethPaymentDate?: string;
  // User roles
  isEmployee?: boolean;
  isAdmin?: boolean;
  createdAt?: string;
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
      const backendUrl = getBackendUrl();
      const maxRetries = 3;
      let lastError: any = null;
      
      // Debug: Log auth check attempt (only once per global check)
      if (globalAuthListeners.size === 1) {
        console.log('[Auth] Checking authentication...', {
          backendUrl,
          timestamp: new Date().toISOString(),
          listeners: globalAuthListeners.size,
        });
      }

      // Retry logic for network errors and timeouts
      try {
        for (let attempt = 0; attempt < maxRetries; attempt++) {
          try {
            // Create a timeout promise (15 seconds per attempt)
            const timeoutPromise = new Promise<never>((_, reject) => {
              setTimeout(() => {
                reject(new Error('Request timeout'));
              }, 15000);
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
          if (globalAuthListeners.size === 1 && attempt === 0) {
            console.log('[Auth] Response received:', {
              status: response.status,
              statusText: response.statusText,
            });
          }

          if (response.ok) {
            const data = await response.json();
            
            // Check if user is authenticated (backend returns {authenticated: false} when no token)
            if (data.authenticated === false || !data.id) {
              // User is definitively not authenticated - log out
              const newState: AuthState = {
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
              };
              updateGlobalAuthState(newState);
              return; // Exit retry loop on success
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
              return; // Exit retry loop on success
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
            
            // If it's a 401 (Unauthorized), user is definitively not authenticated
            if (response.status === 401) {
              if (globalAuthListeners.size === 1) {
                console.warn('[Auth] ✗ Unauthorized (401) - user not authenticated');
              }
              const newState: AuthState = {
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
              };
              updateGlobalAuthState(newState);
              return; // Exit retry loop - user is not authenticated
            }
            
            // For 500 errors, retry (might be temporary server issue)
            if (response.status === 500) {
              lastError = new Error(`Server error: ${response.status}`);
              if (globalAuthListeners.size === 1 && attempt < maxRetries - 1) {
                console.warn(`[Auth] Server error (500), retrying... (attempt ${attempt + 1}/${maxRetries})`);
              }
              // Continue to retry
            } else {
              // Other errors - don't retry, but don't log out either
              lastError = new Error(errorData.message || `HTTP ${response.status}`);
              if (globalAuthListeners.size === 1) {
                console.warn('[Auth] ✗ Auth check failed:', {
                  status: response.status,
                  statusText: response.statusText,
                  error: errorData,
                });
              }
              // Don't update state - keep previous auth state
              return;
            }
          }
        } catch (error: any) {
          lastError = error;
          const isTimeout = error.message === 'Request timeout';
          const isNetworkError = error.name === 'TypeError' || error.message.includes('fetch');
          
          if (globalAuthListeners.size === 1 && attempt < maxRetries - 1) {
            if (isTimeout) {
              console.warn(`[Auth] Request timed out, retrying... (attempt ${attempt + 1}/${maxRetries})`);
            } else if (isNetworkError) {
              console.warn(`[Auth] Network error, retrying... (attempt ${attempt + 1}/${maxRetries})`);
            } else {
              console.warn(`[Auth] Error: ${error.message}, retrying... (attempt ${attempt + 1}/${maxRetries})`);
            }
          }
          
          // Wait before retrying (exponential backoff)
          if (attempt < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, Math.min(1000 * Math.pow(2, attempt), 5000)));
            continue; // Retry
          }
        }
        }
        
        // All retries exhausted - don't log out, just log the error
        if (globalAuthListeners.size === 1) {
          console.error('[Auth] ✗ Auth check failed after all retries:', lastError?.message || 'Unknown error');
          console.warn('[Auth] Keeping previous authentication state to prevent unwanted logout');
        }
        
        // Don't update state on retry exhaustion - keep previous auth state
        // This prevents users from being logged out due to temporary network issues
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
    // Redirect to login page - Patreon login removed, use email/password or Google OAuth
    if (typeof window !== 'undefined') {
      window.location.href = '/?login=true';
    }
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


  // ============================================================================
  // WALLET AUTHENTICATION METHODS
  // ============================================================================

  const loginWithWallet = useCallback(async (
    address: string,
    signature: string,
    nonce: string
  ): Promise<{ success: boolean; requiresRegistration?: boolean; error?: string }> => {
    try {
      const response = await fetch(`${getBackendUrl()}/api/auth/wallet/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ address, signature, nonce })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Wallet login successful
        await checkAuth();
        return { success: true };
      } else if (response.status === 404 && data.requiresRegistration) {
        // Wallet not registered - needs email
        return { 
          success: false, 
          requiresRegistration: true 
        };
      } else {
        return { 
          success: false, 
          error: data.error || 'Wallet login failed' 
        };
      }
    } catch (error: any) {
      console.error('Error logging in with wallet:', error);
      return { 
        success: false, 
        error: error.message || 'Network error during wallet login' 
      };
    }
  }, [checkAuth]);

  const registerWithWallet = useCallback(async (
    address: string,
    signature: string,
    nonce: string,
    email: string,
    username?: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${getBackendUrl()}/api/auth/wallet/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ address, signature, nonce, email, username })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Registration successful
        await checkAuth();
        return { success: true };
      } else {
        return { 
          success: false, 
          error: data.error || 'Wallet registration failed' 
        };
      }
    } catch (error: any) {
      console.error('Error registering with wallet:', error);
      return { 
        success: false, 
        error: error.message || 'Network error during registration' 
      };
    }
  }, [checkAuth]);

  const linkWallet = useCallback(async (
    address: string,
    signature: string,
    nonce: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${getBackendUrl()}/api/auth/wallet/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ address, signature, nonce })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Wallet linked successfully
        await checkAuth(); // Refresh user data
        return { success: true };
      } else {
        return { 
          success: false, 
          error: data.error || 'Failed to link wallet' 
        };
      }
    } catch (error: any) {
      console.error('Error linking wallet:', error);
      return { 
        success: false, 
        error: error.message || 'Network error while linking wallet' 
      };
    }
  }, [checkAuth]);

  const getWalletNonce = useCallback(async (
    address: string
  ): Promise<{ nonce?: string; message?: string; error?: string }> => {
    try {
      const response = await fetch(`${getBackendUrl()}/api/auth/wallet/nonce`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        return { 
          nonce: data.nonce, 
          message: data.message 
        };
      } else {
        return { 
          error: data.error || 'Failed to get nonce' 
        };
      }
    } catch (error: any) {
      console.error('Error getting wallet nonce:', error);
      return { 
        error: error.message || 'Network error while getting nonce' 
      };
    }
  }, []);

  const loginWithGoogle = useCallback(() => {
    // Redirect to Google OAuth
    window.location.href = `${getBackendUrl()}/api/auth/google/login`;
  }, []);

  const startTrial = useCallback(async (
    email: string
  ): Promise<{ success: boolean; trialExpires?: string; error?: string }> => {
    try {
      const response = await fetch(`${getBackendUrl()}/api/auth/start-trial`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await checkAuth();
        return { 
          success: true, 
          trialExpires: data.trial_expires 
        };
      } else {
        return { 
          success: false, 
          error: data.error || 'Failed to start trial' 
        };
      }
    } catch (error: any) {
      console.error('Error starting trial:', error);
      return { 
        success: false, 
        error: error.message || 'Network error while starting trial' 
        };
    }
  }, [checkAuth]);

  const getUserAccess = useCallback(async (): Promise<any> => {
    try {
      const response = await fetch(`${getBackendUrl()}/api/user/access`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (response.ok) {
        return await response.json();
      } else {
        throw new Error('Failed to get user access');
      }
    } catch (error: any) {
      console.error('Error getting user access:', error);
      throw error;
    }
  }, []);

  return {
    ...authState,
    login,
    logout,
    refresh: checkAuth,
    loginWithWallet,
    registerWithWallet,
    linkWallet,
    getWalletNonce,
    loginWithGoogle,
    startTrial,
    getUserAccess,
  };
}
