import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { ThemeProviderWrapper as ThemeProvider } from '../ThemeContext';
import { initAnalytics, trackPageView } from '../utils/analytics';

function AppContent({ Component, pageProps }: AppProps) {
  const router = useRouter();

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
    <ThemeProvider>
      <AppContent {...props} />
    </ThemeProvider>
  );
}
