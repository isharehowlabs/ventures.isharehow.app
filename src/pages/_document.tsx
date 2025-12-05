import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Urbanist Font from Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
        {/* Initial color-scheme meta tag */}
        <meta name="color-scheme" content="light dark" />
      </Head>
      <body>
        {/* Initialize theme before React hydrates to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  function getSystemPreference() {
                    if (typeof window === 'undefined') return 'light';
                    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  
                  function getInitialTheme() {
                    try {
                      const savedMode = localStorage.getItem('themeMode');
                      if (savedMode === 'light' || savedMode === 'dark') {
                        return savedMode;
                      }
                      if (savedMode === 'system' || !savedMode) {
                        return getSystemPreference();
                      }
                    } catch (e) {
                      console.warn('Failed to read theme from localStorage:', e);
                    }
                    return getSystemPreference();
                  }
                  
                  const theme = getInitialTheme();
                  const html = document.documentElement;
                  const body = document.body;
                  
                  // Remove any existing theme classes first
                  html.classList.remove('light-mode', 'dark-mode');
                  
                  // Set data attribute for CSS modules
                  html.setAttribute('data-theme', theme);
                  
                  // Set class for any class-based theme selectors
                  html.classList.add(theme + '-mode');
                  
                  // Set body background to match theme immediately
                  if (theme === 'dark') {
                    body.style.backgroundColor = '#0f172a';
                    body.style.color = '#f7fafc';
                  } else {
                    body.style.backgroundColor = '#FFFFFF';
                    body.style.color = '#212529';
                  }
                  
                  // Update color-scheme meta tag
                  const colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');
                  if (colorSchemeMeta) {
                    colorSchemeMeta.setAttribute('content', theme);
                  } else {
                    // Create if it doesn't exist
                    const meta = document.createElement('meta');
                    meta.setAttribute('name', 'color-scheme');
                    meta.setAttribute('content', theme);
                    document.head.appendChild(meta);
                  }
                } catch (e) {
                  console.error('Failed to initialize theme:', e);
                  // Fallback to light mode on error
                  document.documentElement.setAttribute('data-theme', 'light');
                  document.documentElement.classList.add('light-mode');
                }
              })();
            `,
          }}
        />
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
