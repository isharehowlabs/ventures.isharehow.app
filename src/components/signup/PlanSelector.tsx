import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import PricingTierCard, { PricingTier } from '../pricing/PricingTierCard';
import PricingToggle from '../pricing/PricingToggle';

interface PlanSelectorProps {
  tiers: PricingTier[];
  selectedTier: string | null;
  isAnnual: boolean;
  onTierSelect: (tierId: string) => void;
  onBillingChange: (isAnnual: boolean) => void;
}

const PlanSelector: React.FC<PlanSelectorProps> = ({
  tiers,
  selectedTier,
  isAnnual,
  onTierSelect,
  onBillingChange,
}) => {
  return (
    <Box>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          mb: 2,
          textAlign: 'center',
        }}
      >
        Choose Your Plan
      </Typography>
      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 4, textAlign: 'center' }}
      >
        Select the plan that best fits your needs. You can change it anytime.
      </Typography>

      <PricingToggle isAnnual={isAnnual} onChange={onBillingChange} />

      <Grid container spacing={3}>
        {tiers.map((tier) => (
          <Grid item xs={12} md={4} key={tier.id}>
            <Box
              sx={{
                position: 'relative',
                border: selectedTier === tier.id ? `3px solid ${tier.color}` : 'none',
                borderRadius: 2,
                p: selectedTier === tier.id ? 0.5 : 0,
                transition: 'all 0.3s',
              }}
            >
              <PricingTierCard
                tier={tier}
                isAnnual={isAnnual}
                onSelect={onTierSelect}
              />
            </Box>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default PlanSelector;

