import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { ThemeProviderWrapper as ThemeProvider } from '../ThemeContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { TimerProvider } from '../contexts/TimerContext';
import { initAnalytics, trackPageView } from '../utils/analytics';
import ErrorBoundary from '../components/ErrorBoundary';
import '../index.css';
import '../styles/dashboard.css';
import '../styles/shell.css';

function AppContent({ Component, pageProps }: AppProps) {
  const router = useRouter();

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

  // Track page views
  useEffect(() => {
    const handleRouteChange = (url: string) => {
      trackPageView(url, document.title);
    };

    router.events.on('routeChangeComplete', handleRouteChange);
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);

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
