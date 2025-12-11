import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const CreativeServicesRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new fractional digital agency page
    router.replace('/fractional-digital-agency');
  }, [router]);

  return (
    <>
      <Head>
        <title>Redirecting to Fractional Digital Agency...</title>
        <meta httpEquiv="refresh" content="0;url=/fractional-digital-agency" />
      </Head>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <p>Redirecting to Fractional Digital Agency...</p>
      </div>
    </>
  );
};

export default CreativeServicesRedirect;

