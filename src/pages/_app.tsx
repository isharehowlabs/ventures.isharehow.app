import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { ThemeProviderWrapper as ThemeProvider } from '../ThemeContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { TimerProvider } from '../contexts/TimerContext';
import { 
  initAnalytics, 
  trackPageView, 
  trackScrollDepth, 
  trackUserEngagement,
  setUserProperties 
} from '../utils/analytics';
import { useAuth } from '../hooks/useAuth';
import ErrorBoundary from '../components/ErrorBoundary';
import '../index.css';
import '../styles/dashboard.css';
import '../styles/shell.css';

function AppContent({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  // Suppress webpack-dev-server errors in production
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      const originalError = console.error;
      const originalWarn = console.warn;
      
      // Filter out webpack-dev-server and HMR connection errors
      const shouldSuppress = (message: string): boolean => {
        return (
          message.includes('WebSocket connection to') ||
          message.includes('ws://localhost:3000') ||
          message.includes('[webpack-dev-server]') ||
          message.includes('[HMR]') ||
          message.includes('Waiting for update signal from WDS') ||
          message.includes('Hot Module Replacement enabled') ||
          message.includes('Disconnected!')
        );
      };

      console.error = (...args: any[]) => {
        const message = args.map(arg => 
          typeof arg === 'string' ? arg : JSON.stringify(arg)
        ).join(' ');
        if (!shouldSuppress(message)) {
          originalError.apply(console, args);
        }
      };

      console.warn = (...args: any[]) => {
        const message = args.map(arg => 
          typeof arg === 'string' ? arg : JSON.stringify(arg)
        ).join(' ');
        if (!shouldSuppress(message)) {
          originalWarn.apply(console, args);
        }
      };

      return () => {
        console.error = originalError;
        console.warn = originalWarn;
      };
    }
  }, []);

  // Fix browser password manager autocomplete issues
  useEffect(() => {
    // Ensure browser password manager globals are properly initialized
    // This prevents errors when browser-injected code tries to access undefined controls
    if (typeof window !== 'undefined') {
      // Initialize browser password manager globals if they don't exist
      const initBrowserPasswordManager = () => {
        // Ensure g_usernameControls and g_passwordControls exist
        if (!(window as any).g_usernameControls) {
          (window as any).g_usernameControls = {};
        }
        if (!(window as any).g_passwordControls) {
          (window as any).g_passwordControls = {};
        }
        
        // Ensure ForCompletionList arrays exist and filter out undefined values
        const ForCompletionList = 'ForCompletionList';
        if (!(window as any).g_usernameControls[ForCompletionList]) {
          (window as any).g_usernameControls[ForCompletionList] = [];
        }
        if (!(window as any).g_passwordControls[ForCompletionList]) {
          (window as any).g_passwordControls[ForCompletionList] = [];
        }
        
        // Filter out undefined values from arrays to prevent .some() errors
        (window as any).g_usernameControls[ForCompletionList] = 
          (window as any).g_usernameControls[ForCompletionList].filter((item: any) => item != null);
        (window as any).g_passwordControls[ForCompletionList] = 
          (window as any).g_passwordControls[ForCompletionList].filter((item: any) => item != null);
      };
      
      initBrowserPasswordManager();
      
      // Re-initialize after a short delay to catch any late browser injections
      const timeout = setTimeout(initBrowserPasswordManager, 100);
      
      return () => clearTimeout(timeout);
    }
  }, []);

  // Initialize Google Analytics
  useEffect(() => {
    const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (GA_MEASUREMENT_ID) {
      initAnalytics(GA_MEASUREMENT_ID);
    }
  }, []);

  // Set user properties when user changes
  useEffect(() => {
    if (isAuthenticated && user) {
      setUserProperties({
        userId: user.id?.toString(),
        userType: user.isAdmin ? 'enterprise' : user.isEmployee ? 'customer' : 'lead',
        userRole: user.isAdmin ? 'admin' : user.isEmployee ? 'employee' : 'user',
      });
    }
  }, [isAuthenticated, user]);

  // Track page views with enhanced data
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      // Determine funnel stage based on page
      let funnelStage: 'awareness' | 'interest' | 'consideration' | 'purchase' | 'retention' | undefined;
      if (url.includes('/enterprise') || url.includes('/pricing')) {
        funnelStage = 'consideration';
      } else if (url.includes('/signup') || url.includes('/register') || url.includes('/login')) {
        funnelStage = 'interest';
      } else if (url.includes('/dashboard') || url.includes('/creative') || url.includes('/crm')) {
        funnelStage = 'retention';
      } else if (url === '/' || url.includes('/about') || url.includes('/features')) {
        funnelStage = 'awareness';
      }

      trackPageView(url, document.title, {
        funnel_stage: funnelStage,
        user_type: isAuthenticated ? (user?.isAdmin ? 'enterprise' : 'customer') : 'visitor',
      });
    };

    // Track initial page load
    handleRouteChange(router.asPath);

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events, router.asPath, isAuthenticated, user]);

  // Track scroll depth and engagement
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let scrollDepthTracked = {
      25: false,
      50: false,
      75: false,
      90: false,
    };
    let engagementStartTime = Date.now();
    let lastActivityTime = Date.now();
    let totalEngagementTime = 0;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.round((scrollTop / scrollHeight) * 100);

      // Track scroll depth milestones
      if (scrollPercent >= 25 && !scrollDepthTracked[25]) {
        trackScrollDepth(25);
        scrollDepthTracked[25] = true;
      }
      if (scrollPercent >= 50 && !scrollDepthTracked[50]) {
        trackScrollDepth(50);
        scrollDepthTracked[50] = true;
      }
      if (scrollPercent >= 75 && !scrollDepthTracked[75]) {
        trackScrollDepth(75);
        scrollDepthTracked[75] = true;
      }
      if (scrollPercent >= 90 && !scrollDepthTracked[90]) {
        trackScrollDepth(90);
        scrollDepthTracked[90] = true;
      }

      lastActivityTime = Date.now();
    };

    const handleActivity = () => {
      lastActivityTime = Date.now();
    };

    const trackEngagement = () => {
      const timeSinceLastActivity = Date.now() - lastActivityTime;
      if (timeSinceLastActivity < 30000) { // 30 seconds
        totalEngagementTime += 1000; // Add 1 second
        if (totalEngagementTime % 10000 === 0) { // Every 10 seconds
          trackUserEngagement(totalEngagementTime, 'active');
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    
    const engagementInterval = setInterval(trackEngagement, 1000);

    // Track engagement on page unload
    const handleBeforeUnload = () => {
      const finalEngagementTime = Date.now() - engagementStartTime;
      if (finalEngagementTime > 1000) {
        trackUserEngagement(finalEngagementTime, 'page_view');
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      clearInterval(engagementInterval);
      
      // Final engagement tracking
      const finalEngagementTime = Date.now() - engagementStartTime;
      if (finalEngagementTime > 1000) {
        trackUserEngagement(finalEngagementTime, 'page_view');
      }
    };
  }, [router.asPath]);

  return <Component {...pageProps} />;
}

export default function App(props: AppProps) {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <NotificationProvider>
          <TimerProvider>
            <AppContent {...props} />
          </TimerProvider>
        </NotificationProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
