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

// Helper function to read current resolved theme from DOM (set by _document.tsx)
const getInitialResolvedMode = (): ResolvedThemeMode => {
  if (typeof window === 'undefined') return 'light';
  const dataTheme = document.documentElement.getAttribute('data-theme');
  if (dataTheme === 'dark') return 'dark';
  return 'light';
};

// Helper function to update DOM with theme
const updateDOMTheme = (resolvedMode: ResolvedThemeMode) => {
  if (typeof window === 'undefined') return;
  
  console.log('[ThemeContext] Updating DOM theme to:', resolvedMode);
  
  const html = document.documentElement;
  
  // Prevent CSS transitions during theme change to avoid flashing
  html.classList.add('theme-transitioning');
  
  // Update data-theme attribute (most important for CSS modules)
  html.setAttribute('data-theme', resolvedMode);
  
  // Update class-based selectors
  html.classList.remove('light-mode', 'dark-mode');
  html.classList.add(`${resolvedMode}-mode`);
  
  // Update color-scheme meta tag for native browser elements
  let colorSchemeMetaTag = document.querySelector('meta[name="color-scheme"]');
  if (!colorSchemeMetaTag) {
    colorSchemeMetaTag = document.createElement('meta');
    colorSchemeMetaTag.setAttribute('name', 'color-scheme');
    document.head.appendChild(colorSchemeMetaTag);
  }
  colorSchemeMetaTag.setAttribute('content', resolvedMode);
  
  // Remove transition prevention class after a short delay
  requestAnimationFrame(() => {
    setTimeout(() => {
      html.classList.remove('theme-transitioning');
    }, 50);
  });
};

export const ThemeProviderWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with saved preference synchronously to avoid flash
  const [mode, setMode] = useState<ThemeMode>(() => getInitialMode());
  const [systemPreference, setSystemPreference] = useState<ResolvedThemeMode>(() => getSystemPreference());
  const mountedRef = useRef(false);
  const initialResolvedMode = useRef<ResolvedThemeMode>(getInitialResolvedMode());

  // Resolve the actual theme mode based on user preference
  const resolvedMode = useMemo<ResolvedThemeMode>(() => {
    const resolved = mode === 'system' ? systemPreference : mode;
    console.log('[ThemeContext] Resolved mode:', resolved, 'from mode:', mode, 'systemPref:', systemPreference);
    return resolved;
  }, [mode, systemPreference]);

  // On mount, ensure theme matches what _document.tsx set
  useLayoutEffect(() => {
    mountedRef.current = true;
    console.log('[ThemeContext] Component mounted, mode:', mode, 'resolvedMode:', resolvedMode, 'initialDOM:', initialResolvedMode.current);
    
    // Only update DOM if there's a mismatch (prevents unnecessary updates)
    if (resolvedMode !== initialResolvedMode.current) {
      console.log('[ThemeContext] Syncing DOM theme on mount');
      updateDOMTheme(resolvedMode);
    }
  }, []);

  // Listen for system preference changes
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
    
    // Dispatch custom event for any components listening to theme changes
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('themechange', { 
        bubbles: true, 
        detail: { mode: resolvedMode } 
      });
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
    const muiTheme = getTheme(resolvedMode);
    
    // Ensure MUI theme mode matches resolved mode
    if (muiTheme.palette.mode !== resolvedMode) {
      console.warn('[ThemeContext] MUI theme mode mismatch! Expected:', resolvedMode, 'Got:', muiTheme.palette.mode);
    }
    
    return muiTheme;
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
