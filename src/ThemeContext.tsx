import React, { createContext, useContext, useState, useEffect, useMemo, useRef, useLayoutEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import getTheme from './isharehowTheme';

type ThemeMode = 'light' | 'dark' | 'system';
type ResolvedThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  resolvedMode: ResolvedThemeMode;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

// Helper function to get system preference
const getSystemPreference = (): ResolvedThemeMode => {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

// Helper function to get initial mode from localStorage
const getInitialMode = (): ThemeMode => {
  if (typeof window === 'undefined') return 'system';
  try {
    const savedMode = localStorage.getItem('themeMode') as ThemeMode | null;
    console.log('[ThemeContext] Initial mode from localStorage:', savedMode);
    if (savedMode && (savedMode === 'light' || savedMode === 'dark' || savedMode === 'system')) {
      return savedMode;
    }
  } catch (e) {
    console.warn('[ThemeContext] Failed to read theme preference from localStorage:', e);
  }
  return 'system';
};

// Helper function to update DOM with theme
const updateDOMTheme = (resolvedMode: ResolvedThemeMode) => {
  if (typeof window === 'undefined') return;
  
  console.log('[ThemeContext] Updating DOM theme to:', resolvedMode);
  
  // Prevent CSS transitions during theme change to avoid flashing
  document.documentElement.classList.add('theme-transitioning');
  
  // Remove both classes first
  document.documentElement.classList.remove('light-mode', 'dark-mode');
  
  // Add the current mode class
  document.documentElement.classList.add(`${resolvedMode}-mode`);
  
  // Also set a data attribute for CSS modules
  document.documentElement.setAttribute('data-theme', resolvedMode);
  
  // Update color-scheme meta tag for native browser elements
  let colorSchemeMetaTag = document.querySelector('meta[name="color-scheme"]');
  if (!colorSchemeMetaTag) {
    colorSchemeMetaTag = document.createElement('meta');
    colorSchemeMetaTag.setAttribute('name', 'color-scheme');
    document.head.appendChild(colorSchemeMetaTag);
  }
  colorSchemeMetaTag.setAttribute('content', resolvedMode);
  
  // Also update the document.body style to match theme
  if (resolvedMode === 'dark') {
    document.body.style.backgroundColor = '#0f172a';
    document.body.style.color = '#f7fafc';
  } else {
    document.body.style.backgroundColor = '#FFFFFF';
    document.body.style.color = '#212529';
  }
  
  // Remove transition prevention class after a short delay
  requestAnimationFrame(() => {
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 50);
  });
};

export const ThemeProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with saved preference synchronously to avoid flash
  const [mode, setMode] = useState<ThemeMode>(() => getInitialMode());
  const [systemPreference, setSystemPreference] = useState<ResolvedThemeMode>(() => getSystemPreference());
  const mountedRef = useRef(false);

  // Resolve the actual theme mode based on user preference
  const resolvedMode = useMemo<ResolvedThemeMode>(() => {
    const resolved = mode === 'system' ? systemPreference : mode;
    console.log('[ThemeContext] Resolved mode:', resolved, 'from mode:', mode, 'systemPref:', systemPreference);
    return resolved;
  }, [mode, systemPreference]);

  // On mount, ensure theme is correct - use useLayoutEffect to run before paint
  useLayoutEffect(() => {
    mountedRef.current = true;
    console.log('[ThemeContext] Component mounted, mode:', mode, 'resolvedMode:', resolvedMode);
    
    // Force update DOM on mount to ensure consistency BEFORE React paints
    updateDOMTheme(resolvedMode);
    
    // Apply theme colors to body immediately to prevent flash
    if (typeof window !== 'undefined') {
      const body = document.body;
      if (resolvedMode === 'dark') {
        body.style.backgroundColor = '#0f172a';
        body.style.color = '#f7fafc';
      } else {
        body.style.backgroundColor = '#FFFFFF';
        body.style.color = '#212529';
      }
    }
  }, []);

  // Listen for system preference changes (single effect for system monitoring)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const newPreference = e.matches ? 'dark' : 'light';
      console.log('[ThemeContext] System preference changed to:', newPreference);
      setSystemPreference(newPreference);
    };

    // Listen for changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  // Update document when resolvedMode changes - use useLayoutEffect for immediate updates
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    if (!mountedRef.current) return; // Skip on initial render (handled by mount effect)
    
    console.log('[ThemeContext] resolvedMode changed, updating DOM to:', resolvedMode);
    updateDOMTheme(resolvedMode);
    
    // Force MUI components to re-render with new theme
    if (typeof window !== 'undefined') {
      // Trigger a reflow to ensure all components update
      const event = new Event('themechange', { bubbles: true });
      document.dispatchEvent(event);
    }
  }, [resolvedMode]);

  const setThemeMode = (newMode: ThemeMode) => {
    console.log('[ThemeContext] Setting theme mode to:', newMode);
    setMode(newMode);
    try {
      localStorage.setItem('themeMode', newMode);
    } catch (e) {
      console.warn('[ThemeContext] Failed to save theme preference to localStorage:', e);
    }
  };

  const toggleTheme = () => {
    // Cycle through: light -> dark -> system -> light
    const newMode: ThemeMode = mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light';
    console.log('[ThemeContext] Toggling theme from', mode, 'to', newMode);
    setThemeMode(newMode);
  };

  const theme = useMemo(() => {
    console.log('[ThemeContext] Creating theme for:', resolvedMode);
    return getTheme(resolvedMode);
  }, [resolvedMode]);

  return (
    <ThemeContext.Provider value={{ mode, resolvedMode, toggleTheme, setThemeMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
