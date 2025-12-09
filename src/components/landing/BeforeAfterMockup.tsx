'use client';

import React, { useState, useEffect } from 'react';
import { Box, Typography, Slider, Stack, useTheme } from '@mui/material';
import { CompareArrows as CompareIcon } from '@mui/icons-material';
import styles from '../../styles/landing/BeforeAfterMockup.module.css';

interface BeforeAfterMockupProps {
  beforeImage?: string;
  afterImage?: string;
  beforeLabel?: string;
  afterLabel?: string;
  title?: string;
  description?: string;
  autoAnimate?: boolean;
  animationSpeed?: number;
}

const BeforeAfterMockup: React.FC<BeforeAfterMockupProps> = ({
  beforeImage = '/api/placeholder/800/600?text=Before',
  afterImage = '/api/placeholder/800/600?text=After',
  beforeLabel = 'Before',
  afterLabel = 'After',
  title = 'Transform Your User Experience',
  description = 'See the dramatic difference our UX/UI improvements make',
  autoAnimate = true,
  animationSpeed = 3000,
}) => {
  const [sliderValue, setSliderValue] = useState(50);
  const [isAnimating, setIsAnimating] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    if (autoAnimate) {
      setIsAnimating(true);
      const interval = setInterval(() => {
        setSliderValue((prev) => {
          if (prev >= 100) {
            return 0;
          }
          return prev + 2;
        });
      }, animationSpeed / 50);

      return () => clearInterval(interval);
    }
  }, [autoAnimate, animationSpeed]);

  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    setSliderValue(newValue as number);
    setIsAnimating(false);
  };

  return (
    <Box className={styles.container}>
      <Box className={styles.header}>
        <Typography variant="h4" className={styles.title} sx={{ fontWeight: 800, mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body1" className={styles.description} sx={{ color: 'text.secondary' }}>
          {description}
        </Typography>
      </Box>

      <Box className={styles.mockupContainer}>
        <Box className={styles.imageWrapper}>
          {/* Before Image */}
          <Box
            className={styles.beforeImage}
            sx={{
              backgroundImage: `url(${beforeImage})`,
              clipPath: `inset(0 ${100 - sliderValue}% 0 0)`,
            }}
          />

          {/* After Image */}
          <Box
            className={styles.afterImage}
            sx={{
              backgroundImage: `url(${afterImage})`,
              clipPath: `inset(0 0 0 ${sliderValue}%)`,
            }}
          />

          {/* Divider Line */}
          <Box
            className={styles.divider}
            sx={{
              left: `${sliderValue}%`,
            }}
          >
            <Box className={styles.dividerHandle}>
              <CompareIcon sx={{ fontSize: 32, color: 'white' }} />
            </Box>
          </Box>

          {/* Labels */}
          <Box className={styles.beforeLabel}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
              {beforeLabel}
            </Typography>
          </Box>
          <Box className={styles.afterLabel}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'white', textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
              {afterLabel}
            </Typography>
          </Box>
        </Box>

        {/* Slider Control */}
        <Box className={styles.sliderContainer}>
          <Stack spacing={2} sx={{ width: '100%', px: 2 }}>
            <Slider
              value={sliderValue}
              onChange={handleSliderChange}
              min={0}
              max={100}
              step={1}
              sx={{
                color: 'primary.main',
                height: 8,
                '& .MuiSlider-thumb': {
                  width: 24,
                  height: 24,
                  backgroundColor: 'primary.main',
                  border: '3px solid white',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(0,0,0,0.4)',
                  },
                },
                '& .MuiSlider-track': {
                  height: 8,
                  borderRadius: 4,
                },
                '& .MuiSlider-rail': {
                  height: 8,
                  borderRadius: 4,
                  opacity: 0.3,
                },
              }}
            />
            <Stack direction="row" justifyContent="space-between" sx={{ px: 1 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Drag to compare
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {Math.round(sliderValue)}%
              </Typography>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
};

export default BeforeAfterMockup;

