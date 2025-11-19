import React from 'react';
import { Box, Fab, Tooltip } from '@mui/material';
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  SettingsBrightness as SystemModeIcon,
} from '@mui/icons-material';
import { useThemeContext } from '../ThemeContext';

/**
 * Floating theme toggle button for pages that don't use AppShell
 * Positioned in the bottom-right corner
 */
const FloatingThemeToggle: React.FC = () => {
  const { mode, resolvedMode, setThemeMode } = useThemeContext();

  const handleClick = () => {
    // Cycle through: light -> dark -> system -> light
    const newMode = mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light';
    setThemeMode(newMode);
  };

  // Get the icon based on resolved mode
  const getIcon = () => {
    if (mode === 'system') {
      return <SystemModeIcon />;
    }
    return resolvedMode === 'dark' ? <DarkModeIcon /> : <LightModeIcon />;
  };

  // Get tooltip text
  const getTooltipText = () => {
    if (mode === 'system') {
      return `Theme: System (${resolvedMode === 'dark' ? 'Dark' : 'Light'}) - Click to change`;
    }
    return `Theme: ${mode === 'dark' ? 'Dark' : 'Light'} - Click to change`;
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 1000,
      }}
    >
      <Tooltip title={getTooltipText()} placement="left" arrow>
        <Fab
          size="medium"
          color="primary"
          onClick={handleClick}
          sx={{
            boxShadow: 3,
            '&:hover': {
              boxShadow: 6,
            },
          }}
        >
          {getIcon()}
        </Fab>
      </Tooltip>
    </Box>
  );
};

export default FloatingThemeToggle;

