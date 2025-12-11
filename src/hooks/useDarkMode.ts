import { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { useThemeContext } from '../ThemeContext';

/**
 * Centralized hook for dark mode detection
 * Always returns the correct dark mode state by checking both MUI theme and DOM
 */
export function useDarkMode(): boolean {
  const theme = useTheme();
  const { resolvedMode } = useThemeContext();
  const [isDark, setIsDark] = useState(() => {
    // Check MUI theme first
    if (theme.palette.mode === 'dark') return true;
    // Check resolved mode from context
    if (resolvedMode === 'dark') return true;
    // Check DOM as fallback
    if (typeof window !== 'undefined') {
      return document.documentElement.getAttribute('data-theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    // Update when resolvedMode changes
    const checkDarkMode = () => {
      const muiDark = theme.palette.mode === 'dark';
      const contextDark = resolvedMode === 'dark';
      const domDark = typeof window !== 'undefined' 
        ? document.documentElement.getAttribute('data-theme') === 'dark'
        : false;
      
      // Use the most authoritative source
      const shouldBeDark = contextDark || muiDark || domDark;
      setIsDark(shouldBeDark);
    };

    checkDarkMode();

    // Listen for theme changes
    const observer = new MutationObserver(checkDarkMode);
    if (typeof window !== 'undefined') {
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['data-theme', 'class'],
      });
    }

    const handleThemeChange = () => checkDarkMode();
    if (typeof window !== 'undefined') {
      document.addEventListener('themechange', handleThemeChange);
    }

    return () => {
      observer.disconnect();
      if (typeof window !== 'undefined') {
        document.removeEventListener('themechange', handleThemeChange);
      }
    };
  }, [theme.palette.mode, resolvedMode]);

  return isDark;
}

