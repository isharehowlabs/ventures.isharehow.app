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
      </Head>
      <body>
        {/* Initialize theme before React hydrates to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function getSystemPreference() {
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
                    // localStorage might be blocked
                  }
                  return getSystemPreference();
                }
                
                const theme = getInitialTheme();
                document.documentElement.setAttribute('data-theme', theme);
                document.documentElement.classList.add(theme + '-mode');
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
