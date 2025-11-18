// Get backend URL - supports environment variable or defaults
// For Render.com backends, set NEXT_PUBLIC_BACKEND_URL environment variable
// Default Render.com backend: https://api.ventures.isharehow.app
// Internal Render address: http://ventures-isharehow-app:5000
export const getBackendUrl = (): string => {
  // Check for explicit environment variable (available at build time for static export)
  // This is the recommended way for Render.com backends
  const envUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }
  
  // For Render internal communication (server-side or build-time)
  // Use internal address for better performance and security
  if (typeof window === 'undefined' && process.env.RENDER) {
    return 'http://ventures-isharehow-app:5000';
  }
  
  // For browser/client-side requests, use external HTTPS URL
  // The backend is deployed on Render at https://api.ventures.isharehow.app
  return 'https://api.ventures.isharehow.app';
  
  // Legacy logic (commented out since we always use Render now)
  /*
  // For client-side, check window location
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // In development, default to localhost:5000 (Python Flask)
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    
    // Production: Use Render.com backend for ventures.isharehow.app
    if (hostname.includes('ventures.isharehow.app')) {
      return 'https://api.ventures.isharehow.app';
    }
    
    // Firebase app: Use Render.com backend
    if (hostname.includes('isharehowdash.firebaseapp.com') || hostname.includes('isharehowdash.web.app')) {
      return 'https://api.ventures.isharehow.app';
    }
    
    // Fallback: try API subdomain for other domains
    return `https://api.${hostname}`;
  }
  
  // Fallback for SSR/build time
  return '';
  */
};

// Helper function for robust fetch with error handling
export const fetchWithErrorHandling = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  try {
    // Only add Content-Type for requests that have a body (POST, PUT, PATCH)
    const hasBody = options.body !== undefined && options.body !== null;
    const method = (options.method || 'GET').toUpperCase();
    const needsContentType = hasBody && ['POST', 'PUT', 'PATCH'].includes(method);
    
    const headers: HeadersInit = {
      ...options.headers,
    };
    
    // Only add Content-Type for requests with body
    if (needsContentType && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      headers,
    });

    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch (e) {
        const errorText = await response.text().catch(() => '');
        if (errorText) errorMessage = errorText;
      }
      throw new Error(errorMessage);
    }

    return response;
  } catch (error: any) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to the server. Please check your internet connection.');
    }
    throw error;
  }
};

