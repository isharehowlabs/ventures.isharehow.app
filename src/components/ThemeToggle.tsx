import React, { useState } from 'react';
import {
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Box,
} from '@mui/material';
import {
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
  SettingsBrightness as SystemModeIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import { useThemeContext } from '../ThemeContext';

const ThemeToggle: React.FC = () => {
  const { mode, resolvedMode, setThemeMode } = useThemeContext();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleModeSelect = (selectedMode: 'light' | 'dark' | 'system') => {
    setThemeMode(selectedMode);
    handleClose();
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
      return `System (${resolvedMode === 'dark' ? 'Dark' : 'Light'})`;
    }
    return mode === 'dark' ? 'Dark Mode' : 'Light Mode';
  };

  return (
    <>
      <Tooltip title={getTooltipText()}>
        <IconButton
          onClick={handleClick}
          size="small"
          sx={{
            color: 'text.primary',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          {getIcon()}
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem
          onClick={() => handleModeSelect('light')}
          selected={mode === 'light'}
        >
          <ListItemIcon>
            <LightModeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Light</ListItemText>
          {mode === 'light' && (
            <CheckIcon fontSize="small" sx={{ ml: 1, color: 'primary.main' }} />
          )}
        </MenuItem>
        <MenuItem
          onClick={() => handleModeSelect('dark')}
          selected={mode === 'dark'}
        >
          <ListItemIcon>
            <DarkModeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Dark</ListItemText>
          {mode === 'dark' && (
            <CheckIcon fontSize="small" sx={{ ml: 1, color: 'primary.main' }} />
          )}
        </MenuItem>
        <MenuItem
          onClick={() => handleModeSelect('system')}
          selected={mode === 'system'}
        >
          <ListItemIcon>
            <SystemModeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            <Box>
              System
              <Box component="span" sx={{ fontSize: '0.75rem', color: 'text.secondary', ml: 0.5 }}>
                ({resolvedMode === 'dark' ? 'Dark' : 'Light'})
              </Box>
            </Box>
          </ListItemText>
          {mode === 'system' && (
            <CheckIcon fontSize="small" sx={{ ml: 1, color: 'primary.main' }} />
          )}
        </MenuItem>
      </Menu>
    </>
  );
};

export default ThemeToggle;

