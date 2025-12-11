import { Tabs, TabsProps, useMediaQuery, useTheme } from '@mui/material';
import { ReactNode } from 'react';

interface StyledTabsProps extends TabsProps {
  children: ReactNode;
}

/**
 * Enhanced Tabs component with improved mobile visibility
 * - Larger icons and text on mobile
 * - Bolder indicator line
 * - Better spacing and contrast
 * - Auto-scrollable on mobile
 */
export default function StyledTabs({ children, sx, ...props }: StyledTabsProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Tabs
      {...props}
      variant={isMobile ? 'scrollable' : props.variant || 'fullWidth'}
      scrollButtons="auto"
      sx={{
        '& .MuiTabs-indicator': {
          height: isMobile ? 4 : 2,
          backgroundColor: 'primary.main',
        },
        '& .MuiTab-root': {
          minHeight: isMobile ? 72 : 64,
          fontSize: isMobile ? '0.875rem' : '0.875rem',
          fontWeight: 600,
          textTransform: 'none',
          color: 'text.secondary',
          padding: isMobile ? '12px 16px' : '12px 16px',
          '&.Mui-selected': {
            color: 'primary.main',
            fontWeight: 700,
          },
          '& .MuiTab-iconWrapper': {
            fontSize: isMobile ? '1.75rem' : '1.5rem',
            marginBottom: isMobile ? '8px' : '4px',
          },
        },
        ...(typeof sx === 'function' ? sx(theme) : sx),
      }}
    >
      {children}
    </Tabs>
  );
}
