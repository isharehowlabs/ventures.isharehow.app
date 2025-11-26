import React from 'react';
import { Box, Typography, Stack, Paper } from '@mui/material';
import {
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Support as SupportIcon,
  Verified as VerifiedIcon,
} from '@mui/icons-material';

interface TrustBadge {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const badges: TrustBadge[] = [
  {
    icon: <SecurityIcon />,
    title: '256-bit SSL Encryption',
    description: 'Your data is safe with us',
  },
  {
    icon: <SpeedIcon />,
    title: '99.9% Uptime',
    description: 'Reliable service guarantee',
  },
  {
    icon: <SupportIcon />,
    title: '24/7 Support',
    description: 'Always here to help',
  },
  {
    icon: <VerifiedIcon />,
    title: 'AI Support Guarantee',
    description: 'Backed by our commitment',
  },
];

const TrustBadges: React.FC = () => {
  return (
    <Box sx={{ py: 4 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={3}
        justifyContent="center"
      >
        {badges.map((badge, index) => (
          <Paper
            key={index}
            elevation={1}
            sx={{
              p: 3,
              textAlign: 'center',
              flex: 1,
              minWidth: 200,
              transition: 'transform 0.3s',
              '&:hover': {
                transform: 'translateY(-4px)',
              },
            }}
          >
            <Box sx={{ color: 'primary.main', mb: 1, display: 'flex', justifyContent: 'center' }}>
              {badge.icon}
            </Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              {badge.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {badge.description}
            </Typography>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
};

export default TrustBadges;

