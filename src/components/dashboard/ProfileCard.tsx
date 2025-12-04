'use client';

import React from 'react';
import {
  Box,
  Paper,
  Avatar,
  Typography,
  Stack,
  Divider,
  Chip,
  Button,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  AccountCircle as AccountCircleIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/router';

export default function ProfileCard() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
        <AccountCircleIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Not logged in
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please log in to view your profile
        </Typography>
      </Paper>
    );
  }

  const handleViewProfile = () => {
    router.push('/profile');
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Stack spacing={2}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar
            src={user.avatar}
            alt={user.name || 'User'}
            sx={{
              width: 64,
              height: 64,
              bgcolor: 'primary.main',
              fontSize: '1.5rem',
            }}
          >
            {user.name?.charAt(0).toUpperCase() || <PersonIcon />}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h6" noWrap>
              {user.name || 'User'}
            </Typography>
            {user.email && (
              <Typography variant="body2" color="text.secondary" noWrap>
                {user.email}
              </Typography>
            )}
          </Box>
        </Box>

        <Divider />

        {(user.membershipTier || (user as any)?.userRole) && (
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              {user.membershipTier ? 'Membership' : 'Role'}
            </Typography>
            <Chip
              label={user.membershipTier || (user as any)?.userRole}
              size="small"
              color="primary"
              variant="outlined"
            />
          </Box>
        )}

        {(user.isEmployee || user.isAdmin) && (
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              Status
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              {user.isAdmin && (
                <Chip
                  label="Admin"
                  size="small"
                  color="error"
                  variant="outlined"
                />
              )}
              {user.isEmployee && (
                <Chip
                  label="Employee"
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              )}
            </Stack>
          </Box>
        )}

        {user.ensName && (
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
              ENS Name
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              {user.ensName}
            </Typography>
          </Box>
        )}

        <Button
          variant="outlined"
          fullWidth
          startIcon={<SettingsIcon />}
          onClick={handleViewProfile}
          sx={{ mt: 1 }}
        >
          View Full Profile
        </Button>
      </Stack>
    </Paper>
  );
}

