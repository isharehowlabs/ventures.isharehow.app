import React from 'react';
import { Box, Typography, Switch, Stack, Chip } from '@mui/material';

interface PricingToggleProps {
  isAnnual: boolean;
  onChange: (isAnnual: boolean) => void;
}

const PricingToggle: React.FC<PricingToggleProps> = ({ isAnnual, onChange }) => {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 4 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Typography
          variant="body1"
          sx={{
            fontWeight: isAnnual ? 400 : 700,
            color: isAnnual ? 'text.secondary' : 'text.primary',
            transition: 'all 0.3s',
          }}
        >
          Monthly
        </Typography>
        <Switch
          checked={isAnnual}
          onChange={(e) => onChange(e.target.checked)}
          color="primary"
        />
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography
            variant="body1"
            sx={{
              fontWeight: isAnnual ? 700 : 400,
              color: isAnnual ? 'text.primary' : 'text.secondary',
              transition: 'all 0.3s',
            }}
          >
            Annual
          </Typography>
          <Chip
            label="Save up to 20%"
            size="small"
            color="success"
            sx={{ fontWeight: 600 }}
          />
        </Stack>
      </Stack>
    </Box>
  );
};

export default PricingToggle;

