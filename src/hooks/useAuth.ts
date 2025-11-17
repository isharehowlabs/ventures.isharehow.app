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

  const checkAuth = useCallback(async () => {
    try {
      const backendUrl = getBackendUrl();
      
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 10000);
      });

      // Race the fetch against the timeout
      const response = await Promise.race([
        fetch(`${backendUrl}/api/auth/me`, {
          method: 'GET',
          credentials: 'include', // Important: include cookies
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors', // Ensure CORS mode
        }),
        timeoutPromise
      ]);

      if (response.ok) {
        const user = await response.json();
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        // Log error details for debugging
        const errorData = await response.json().catch(() => ({}));
        console.warn('Auth check failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: errorData.message || 'Authentication failed',
        });
      }
    } catch (error: any) {
      console.error('Auth check error:', error);
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
    
    // Check for auth success parameter in URL and refresh auth
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('auth') === 'success') {
        // Multiple attempts to check auth as session cookie becomes available
        const attempts = [500, 1000, 2000];
        attempts.forEach((delay) => {
          setTimeout(() => {
            checkAuth();
          }, delay);
        });
        
        // Clean up URL parameter after last attempt
        setTimeout(() => {
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
        }, 2500);
      }
    }
  }, [checkAuth]);

  const login = () => {
    const backendUrl = getBackendUrl();
    window.location.href = `${backendUrl}/api/auth/patreon`;
  };

  const logout = async () => {
    try {
      const backendUrl = getBackendUrl();
      await fetch(`${backendUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Logout error:', error);
    }
  };

  return {
    ...authState,
    login,
    logout,
    refresh: checkAuth,
  };
}

