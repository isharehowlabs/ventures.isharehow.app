import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
} from '@mui/icons-material';

export interface PricingTier {
  id: string;
  name: string;
  price: number;
  priceAnnual?: number;
  description: string;
  features: string[];
  color: string;
  popular?: boolean;
  ctaText?: string;
}

interface PricingTierCardProps {
  tier: PricingTier;
  isAnnual: boolean;
  onSelect?: (tierId: string) => void;
}

const PricingTierCard: React.FC<PricingTierCardProps> = ({
  tier,
  isAnnual,
  onSelect,
}) => {
  const displayPrice = isAnnual && tier.priceAnnual ? tier.priceAnnual : tier.price;
  const monthlyPrice = isAnnual && tier.priceAnnual 
    ? Math.round(tier.priceAnnual / 12) 
    : tier.price;

  return (
    <Card
      elevation={tier.popular ? 8 : 2}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        border: tier.popular ? `2px solid ${tier.color}` : '1px solid',
        borderColor: tier.popular ? tier.color : 'divider',
        transition: 'transform 0.3s, box-shadow 0.3s',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: tier.popular ? 12 : 6,
        },
      }}
    >
      {tier.popular && (
        <Chip
          icon={<StarIcon />}
          label="Most Popular"
          color="primary"
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            fontWeight: 700,
            bgcolor: tier.color,
            color: 'white',
          }}
        />
      )}
      <CardContent sx={{ flexGrow: 1, p: 4 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          {tier.name}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: 40 }}>
          {tier.description}
        </Typography>
        <Box sx={{ mb: 3 }}>
          <Stack direction="row" alignItems="baseline" spacing={1}>
            <Typography variant="h3" fontWeight={800} color={tier.color}>
              ${monthlyPrice}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              /month
            </Typography>
          </Stack>
          {isAnnual && tier.priceAnnual && (
            <Typography variant="caption" color="text.secondary">
              Billed annually (${displayPrice}/year)
            </Typography>
          )}
          {isAnnual && tier.priceAnnual && (
            <Typography variant="caption" color="success.main" display="block" sx={{ mt: 0.5 }}>
              Save ${(tier.price * 12) - displayPrice}/year
            </Typography>
          )}
        </Box>
        <List dense sx={{ mb: 3 }}>
          {tier.features.map((feature, index) => (
            <ListItem key={index} disableGutters>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckCircleIcon sx={{ color: tier.color, fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText
                primary={feature}
                primaryTypographyProps={{
                  variant: 'body2',
                }}
              />
            </ListItem>
          ))}
        </List>
        <Button
          fullWidth
          variant={tier.popular ? 'contained' : 'outlined'}
          size="large"
          onClick={() => onSelect?.(tier.id)}
          sx={{
            mt: 'auto',
            bgcolor: tier.popular ? tier.color : 'transparent',
            borderColor: tier.color,
            color: tier.popular ? 'white' : tier.color,
            fontWeight: 700,
            py: 1.5,
            '&:hover': {
              bgcolor: tier.popular ? tier.color : `${tier.color}10`,
              borderColor: tier.color,
            },
          }}
        >
          {tier.ctaText || 'Get Started'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PricingTierCard;

