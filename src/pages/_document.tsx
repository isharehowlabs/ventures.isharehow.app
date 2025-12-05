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
                    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
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
                      console.warn('[_document] Failed to read theme from localStorage:', e);
                    }
                    return getSystemPreference();
                  }
                  
                  const theme = getInitialTheme();
                  console.log('[_document] Initial theme:', theme);
                  
                  const html = document.documentElement;
                  
                  // Set data attribute FIRST for CSS modules
                  html.setAttribute('data-theme', theme);
                  
                  // Set class for any class-based theme selectors
                  html.classList.add(theme + '-mode');
                  
                  // Update color-scheme meta tag
                  const colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');
                  if (colorSchemeMeta) {
                    colorSchemeMeta.setAttribute('content', theme);
                  }
                  
                  console.log('[_document] Theme initialized, data-theme:', html.getAttribute('data-theme'));
                } catch (e) {
                  console.error('[_document] Failed to initialize theme:', e);
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
