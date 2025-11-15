import { useState, useEffect, useCallback } from 'react';
import { getBackendUrl } from '../utils/backendUrl';

interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  patreonId?: string;
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
      const response = await fetch(`${backendUrl}/api/auth/me`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

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
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.message,
      });
    }
  }, []);

  useEffect(() => {
    checkAuth();
    
    // Check for auth success parameter in URL and refresh auth
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('auth') === 'success') {
        // Small delay to ensure session cookie is set
        setTimeout(() => {
          checkAuth();
          // Clean up URL parameter
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
        }, 500); // Increased delay to ensure cookie is available
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

