// UNIQUE_BUILD_TEST_2025_OCT_24_V3
// Redirect from /content to /portfolio
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

function ContentRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/portfolio');
  }, [router]);
  
  return (
    <>
      <Head>
        <title>Redirecting to Portfolio...</title>
        <link rel="canonical" href="https://ventures.isharehow.app/portfolio" />
        <meta httpEquiv="refresh" content="0;url=/portfolio" />
      </Head>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <p>Redirecting to Portfolio...</p>
      </div>
    </>
  );
}

export default ContentRedirect;
