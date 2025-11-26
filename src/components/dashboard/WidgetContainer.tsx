import { ReactNode, useState } from 'react';
import { Box, IconButton, Menu, MenuItem, Paper, Typography } from '@mui/material';
import { MoreVert as MoreVertIcon, Close as CloseIcon } from '@mui/icons-material';

interface WidgetContainerProps {
  title?: string;
  children: ReactNode;
  onRemove?: () => void;
  actions?: Array<{
    label: string;
    onClick: () => void;
    icon?: ReactNode;
  }>;
  className?: string;
}

export default function WidgetContainer({ 
  title, 
  children, 
  onRemove, 
  actions = [],
  className = 'widget-container'
}: WidgetContainerProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <Paper 
      className={className}
      elevation={2}
      sx={{ 
        p: 2, 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {(title || actions.length > 0 || onRemove) && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          {title && (
            <Typography variant="h6" fontWeight={600}>
              {title}
            </Typography>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {actions.length > 0 && (
              <>
                <IconButton
                  size="small"
                  onClick={handleMenuOpen}
                  aria-label="widget actions"
                >
                  <MoreVertIcon />
                </IconButton>
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                >
                  {actions.map((action, index) => (
                    <MenuItem
                      key={index}
                      onClick={() => {
                        action.onClick();
                        handleMenuClose();
                      }}
                    >
                      {action.icon}
                      {action.label}
                    </MenuItem>
                  ))}
                </Menu>
              </>
            )}
            {onRemove && (
              <IconButton
                size="small"
                onClick={onRemove}
                aria-label="remove widget"
                color="error"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        </Box>
      )}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {children}
      </Box>
    </Paper>
  );
}

