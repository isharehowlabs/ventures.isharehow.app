// Get backend URL - supports environment variable or defaults
// For Render.com backends, set NEXT_PUBLIC_BACKEND_URL environment variable
// Default Render.com backend: https://ventures-isharehow-app.onrender.com
export const getBackendUrl = (): string => {
  // Check for explicit environment variable (available at build time for static export)
  // This is the recommended way for Render.com backends
  const envUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }
  
  // For client-side, check window location
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // In development, default to localhost:3001
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3001';
    }
    
    // Production: Use Render.com backend for ventures.isharehow.app
    if (hostname.includes('ventures.isharehow.app')) {
      return 'https://ventures-isharehow-app.onrender.com';
    }
    
    // Fallback: try API subdomain for other domains
    return `https://api.${hostname}`;
  }
  
  // Fallback for SSR/build time
  return '';
};

