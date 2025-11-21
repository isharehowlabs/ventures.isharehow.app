import React from 'react';
import { Box, Typography, Paper, LinearProgress } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

interface AuraBarProps {
  auraType: string;
  value: number;
  maxValue?: number;
  icon?: React.ReactNode;
  onChange?: (value: number) => void;
  editable?: boolean;
}

// Aura color mapping
const AURA_COLORS: Record<string, { primary: string; secondary: string; glow: string }> = {
  Physical: { primary: '#ff6b6b', secondary: '#ff8787', glow: '#ff6b6baa' },
  Mental: { primary: '#4ecdc4', secondary: '#7eddd8', glow: '#4ecdc4aa' },
  Spiritual: { primary: '#a29bfe', secondary: '#b8b3ff', glow: '#a29bfeaa' },
  Nutrition: { primary: '#55efc4', secondary: '#81f0d5', glow: '#55efc4aa' },
  Sleep: { primary: '#74b9ff', secondary: '#a8d8ff', glow: '#74b9ffaa' },
  Stress: { primary: '#fd79a8', secondary: '#ff9dc6', glow: '#fd79a8aa' },
  Energy: { primary: '#fdcb6e', secondary: '#ffe08a', glow: '#fdcb6eaa' },
};

// Pulsing animation for high values
const pulse = keyframes`
  0%, 100% {
    box-shadow: 0 0 20px var(--glow-color);
  }
  50% {
    box-shadow: 0 0 35px var(--glow-color);
  }
`;

// Gradient fill animation
const fillAnimation = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const StyledAuraContainer = styled(Paper)<{ auracolor: string; glowcolor: string; value: number }>(
  ({ auracolor, glowcolor, value }) => ({
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
    padding: '1.5rem',
    borderRadius: '12px',
    border: `2px solid ${auracolor}33`,
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    '--glow-color': glowcolor,
    
    '&:hover': {
      transform: 'translateY(-4px)',
      borderColor: `${auracolor}66`,
      boxShadow: value >= 80 ? `0 8px 24px ${glowcolor}` : `0 4px 12px ${auracolor}44`,
    },
    
    // Add pulsing glow effect for high values
    ...(value >= 80 && {
      animation: `${pulse} 2s ease-in-out infinite`,
    }),
    
    // Background gradient effect
    '&::before': {
      content: '""',
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `radial-gradient(circle at top right, ${auracolor}15 0%, transparent 60%)`,
      opacity: 0.6,
      zIndex: 0,
    },
  })
);

const StyledLinearProgress = styled(LinearProgress)<{ auracolor: string; secondarycolor: string }>(
  ({ auracolor, secondarycolor }) => ({
    height: 24,
    borderRadius: 12,
    backgroundColor: '#0f0f0f',
    border: `1px solid ${auracolor}44`,
    position: 'relative',
    overflow: 'hidden',
    
    '& .MuiLinearProgress-bar': {
      borderRadius: 12,
      background: `linear-gradient(90deg, ${auracolor} 0%, ${secondarycolor} 50%, ${auracolor} 100%)`,
      backgroundSize: '200% 100%',
      animation: `${fillAnimation} 3s ease infinite`,
      transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
    },
  })
);

const AuraBar: React.FC<AuraBarProps> = ({
  auraType,
  value,
  maxValue = 100,
  icon,
  onChange,
  editable = false,
}) => {
  // Guard against undefined/empty auraType to avoid rendering invalid text nodes
  const safeAuraType = typeof auraType === 'string' && auraType.trim().length > 0 ? auraType : 'Aura';
  const safeValue = Number.isFinite(value) ? value : 0;
  
  const colors = AURA_COLORS[safeAuraType] || AURA_COLORS.Physical;
  const percentage = Math.min((safeValue / maxValue) * 100, 100);
  
  // Determine value color based on level
  const getValueColor = () => {
    if (safeValue >= 80) return colors.primary;
    if (safeValue >= 50) return colors.secondary;
    return '#999';
  };

  return (
    <StyledAuraContainer 
      auracolor={colors.primary}
      glowcolor={colors.glow}
      value={safeValue}
      elevation={3}
    >
      {/* Content wrapper with higher z-index */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* Header with aura type and value */}
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 1.5,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {icon && (
              <Box sx={{ color: colors.primary, display: 'flex', alignItems: 'center' }}>
                {icon}
              </Box>
            )}
            <Typography 
              variant="h6" 
              fontWeight={700}
              sx={{ 
                color: colors.primary,
                textShadow: `0 0 10px ${colors.glow}`,
              }}
            >
              {safeAuraType}
            </Typography>
          </Box>
          
          <Typography 
            variant="h5" 
            fontWeight={900}
            sx={{ 
              color: getValueColor(),
              textShadow: safeValue >= 80 ? `0 0 15px ${colors.glow}` : 'none',
              transition: 'all 0.3s ease',
            }}
          >
            {Math.round(safeValue)}
          </Typography>
        </Box>
        
        {/* Progress bar */}
        <StyledLinearProgress 
          variant="determinate" 
          value={percentage}
          auracolor={colors.primary}
          secondarycolor={colors.secondary}
        />
        
        {/* Max value indicator */}
        <Typography 
          variant="caption" 
          sx={{ 
            color: '#666',
            display: 'block',
            textAlign: 'right',
            mt: 0.5,
          }}
        >
          / {maxValue}
        </Typography>
      </Box>
    </StyledAuraContainer>
  );
};

export default AuraBar;
