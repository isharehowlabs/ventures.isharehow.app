import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  useTheme,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  ExpandMore as ExpandMoreIcon,
} from '@mui/icons-material';
import { PricingTier } from './PricingTierCard';

export interface Feature {
  name: string;
  'diy-plus'?: string | boolean;
  essential?: string | boolean;
  growth?: string | boolean;
  premium?: string | boolean;
  enterprise?: string | boolean;
  // Legacy support
  starter?: string | boolean;
  professional?: string | boolean;
  category?: string;
  [key: string]: string | boolean | undefined;
}

interface FeatureComparisonTableProps {
  features: Feature[];
  tiers: PricingTier[];
}

const FeatureComparisonTable: React.FC<FeatureComparisonTableProps> = ({
  features,
  tiers,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const renderFeatureValue = (value: string | boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <CheckCircleIcon sx={{ color: 'success.main' }} />
      ) : (
        <CancelIcon sx={{ color: 'error.main' }} />
      );
    }
    return <Typography variant="body2">{value}</Typography>;
  };

  if (isMobile) {
    // Mobile: Accordion view
    return (
      <Box>
        {features.map((feature, index) => (
          <Accordion key={index} sx={{ mb: 1 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>{feature.name}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                {tiers.map((tier) => (
                  <Box key={tier.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight={600}>
                      {tier.name}
                    </Typography>
                    {renderFeatureValue(
                      feature[tier.id as keyof Feature] as string | boolean
                    )}
                  </Box>
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    );
  }

  // Desktop: Table view
  return (
    <TableContainer component={Paper} elevation={2}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 700, width: '30%' }}>Feature</TableCell>
            {tiers.map((tier) => (
              <TableCell
                key={tier.id}
                align="center"
                sx={{
                  fontWeight: 700,
                  bgcolor: tier.popular ? `${tier.color}10` : 'transparent',
                }}
              >
                {tier.name}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {features.map((feature, index) => (
            <TableRow key={index} hover>
              <TableCell sx={{ fontWeight: 600 }}>{feature.name}</TableCell>
              {tiers.map((tier) => (
                <TableCell
                  key={tier.id}
                  align="center"
                  sx={{
                    bgcolor: tier.popular ? `${tier.color}05` : 'transparent',
                  }}
                >
                  {renderFeatureValue(
                    feature[tier.id as keyof Feature] as string | boolean
                  )}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default FeatureComparisonTable;

