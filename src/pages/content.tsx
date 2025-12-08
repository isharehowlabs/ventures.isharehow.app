// UNIQUE_BUILD_TEST_2025_OCT_24_V3
// Redirect from /content to /portfolio
import { useEffect } from 'react';
import { useRouter } from 'next/router';

function ContentRedirect() {
  const router = useRouter();
  
  useEffect(() => {
    router.replace('/portfolio');
  }, [router]);
  
  return null;
}

export default ContentRedirect;
