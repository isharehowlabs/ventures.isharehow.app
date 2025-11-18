import * as React from 'react';
import Head from 'next/head';
import { ThemeProviderWrapper } from '../ThemeContext';
import PWAInstallButton from '../components/PWAInstallButton';

export default function MyApp({ Component, pageProps }: any) {
  return (
    <ThemeProviderWrapper>
      <Head>
        <meta name="application-name" content="iShareHow Labs" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="iShareHow Labs" />
        <meta name="description" content="Explore innovative solutions across cybersecurity, wellness, fitness, and more" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#ff6b6b" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#ff6b6b" />
        
        <link rel="manifest" href="/manifest.json" />
        {/* Icons - will work once icon files are added to /public */}
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-192.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon-192.png" />
        <link rel="shortcut icon" href="/icon-192.png" />
      </Head>
      <Component {...pageProps} />
      {typeof window !== 'undefined' && <PWAInstallButton />}
    </ThemeProviderWrapper>
  );
}
