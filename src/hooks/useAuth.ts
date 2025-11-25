import { useState, useEffect, useCallback } from 'react';
import { getBackendUrl } from '../utils/backendUrl';

interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  patreonId?: string;
  isPaidMember?: boolean;
  membershipTier?: string;
  membershipAmount?: number;
  lifetimeSupportAmount?: number;
  membershipPaymentDate?: string;
  membershipRenewalDate?: string;
  isTeamMember?: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // JWT tokens are now stored in httpOnly cookies (set by backend)
  // We don't need to access tokens from JavaScript - backend handles it automatically

  const checkAuth = useCallback(async () => {
    try {
      const backendUrl = getBackendUrl();
      
      // Debug: Log auth check attempt
      console.log('[Auth] Checking authentication...', {
        backendUrl,
        timestamp: new Date().toISOString(),
      });
      
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          console.log('[Auth] Request timed out after 10 seconds');
          reject(new Error('Request timeout'));
        }, 10000);
      });

      console.log('[Auth] About to start Promise.race...');

      // JWT token is in httpOnly cookie, backend will read it automatically
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      // Race the fetch against the timeout
      console.log('[Auth] Starting fetch request...');
      const response = await Promise.race([
        fetch(`${backendUrl}/api/auth/me`, {
          method: 'GET',
          credentials: 'include', // Important: include cookies (for httpOnly JWT cookie)
          headers,
          mode: 'cors', // Ensure CORS mode
        }),
        timeoutPromise
      ]);
      console.log('[Auth] Fetch completed, got response');

      // Debug: Log response details
      console.log('[Auth] Response received:', {
        status: response.status,
        statusText: response.statusText,
        headers: {
          'content-type': response.headers.get('content-type'),
          'set-cookie': response.headers.get('set-cookie') ? 'present' : 'not present',
        },
      });

      if (response.ok) {
        const user = await response.json();
        console.log('[Auth] ✓ Authentication successful:', {
          userId: user.id,
          userName: user.name,
          isPaidMember: user.isPaidMember,
        });
        
        // JWT token is in httpOnly cookie, no need to store in localStorage
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        // Log error details for debugging
        const errorData = await response.json().catch(() => ({}));
        console.warn('[Auth] ✗ Auth check failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
          credentialsMode: 'include',
        });
        
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: errorData.message || 'Authentication failed',
        });
      }
    } catch (error: any) {
      console.error('[Auth] ✗ Auth check error:', {
        message: error.message,
        name: error.name,
        stack: error.stack?.split('\n')[0],
      });
      const isTimeout = error.message === 'Request timeout';
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: isTimeout ? 'Request timeout' : error.message,
      });
    }
  }, []);

  useEffect(() => {
    checkAuth();
    
    // Check for auth success parameter in URL (JWT is in httpOnly cookie now)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('auth') === 'success') {
        console.log('[Auth] Detected auth=success in URL, JWT should be in httpOnly cookie');
        
        // Clean URL immediately
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
        console.log('[Auth] Cleaned up URL parameter');
        
        // Multiple attempts to check auth (cookie might need a moment to be available)
        const attempts = [500, 1000, 2000];
        attempts.forEach((delay, index) => {
          setTimeout(() => {
            console.log(`[Auth] Retry attempt ${index + 1}/${attempts.length} after ${delay}ms`);
            checkAuth();
          }, delay);
        });
      }
    }
  }, [checkAuth]);

  const login = () => {
    const backendUrl = getBackendUrl();
    console.log('[Auth] Initiating Patreon login...', { backendUrl });
    window.location.href = `${backendUrl}/api/auth/patreon`;
  };

  const logout = async () => {
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
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      console.log('[Auth] ✓ Logged out successfully');
    } catch (error: any) {
      console.error('[Auth] Logout error:', error);
      // Clear state even on error
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  };

  return {
    ...authState,
    login,
    logout,
    refresh: checkAuth,
  };
}
