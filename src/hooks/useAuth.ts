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

  // Helper function to get token from various sources
  const getAuthToken = useCallback((): string | null => {
    if (typeof window === 'undefined') return null;
    
    // First check localStorage
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) return storedToken;
    
    // Token might be in cookie (httpOnly), but we can't access it from JS
    // The backend will check cookies automatically
    return null;
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const backendUrl = getBackendUrl();
      const token = getAuthToken();
      
      // Debug: Log auth check attempt
      console.log('[Auth] Checking authentication...', {
        backendUrl,
        hasToken: !!token,
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

      // Build headers with token if available
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

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
        
        // Store token if returned in response (shouldn't normally happen, but handle it)
        if (user.token && typeof window !== 'undefined') {
          localStorage.setItem('auth_token', user.token);
        }
        
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
          // Check if cookies are being sent (can't access directly but can infer)
          credentialsMode: 'include',
        });
        
        // Clear invalid token
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
        
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
      
      // Clear token on error
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: isTimeout ? 'Request timeout' : error.message,
      });
    }
  }, [getAuthToken]);

  useEffect(() => {
    checkAuth();
    
    // Check for auth success parameter in URL and extract JWT token
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('auth') === 'success') {
        const token = urlParams.get('token');
        if (token) {
          console.log('[Auth] Detected auth=success with token in URL, storing token...');
          localStorage.setItem('auth_token', token);
          
          // Clean URL immediately
          const newUrl = window.location.pathname;
          window.history.replaceState({}, '', newUrl);
          console.log('[Auth] Cleaned up URL parameter');
          
          // Retry auth check with new token
          setTimeout(() => {
            checkAuth();
          }, 100);
        } else {
          console.log('[Auth] Detected auth=success in URL, will retry auth checks...');
          
          // Multiple attempts to check auth (cookie might be available)
          const attempts = [500, 1000, 2000];
          attempts.forEach((delay, index) => {
            setTimeout(() => {
              console.log(`[Auth] Retry attempt ${index + 1}/${attempts.length} after ${delay}ms`);
              checkAuth();
            }, delay);
          });
          
          // Clean up URL parameter after last attempt
          setTimeout(() => {
            const newUrl = window.location.pathname;
            window.history.replaceState({}, '', newUrl);
            console.log('[Auth] Cleaned up URL parameter');
          }, 2500);
        }
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
      const token = getAuthToken();
      
      console.log('[Auth] Logging out...');
      
      // Build headers with token if available
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      await fetch(`${backendUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers,
      });
      
      // Clear token from localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      console.log('[Auth] ✓ Logged out successfully');
    } catch (error: any) {
      console.error('[Auth] Logout error:', error);
      // Clear token even on error
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
      }
    }
  };

  return {
    ...authState,
    login,
    logout,
    refresh: checkAuth,
  };
}
