import React from 'react';
import {
  Box,
  TextField,
  Stack,
  Typography,
  InputAdornment,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  VpnKey as VpnKeyIcon,
} from '@mui/icons-material';
import PasswordStrengthMeter from './PasswordStrengthMeter';

interface AccountFormData {
  email: string;
  password: string;
  fullName: string;
  companyName: string;
  phone: string;
  referralCode: string;
}

interface AccountFormProps {
  data: AccountFormData;
  onChange: (field: keyof AccountFormData, value: string) => void;
  errors?: Partial<Record<keyof AccountFormData, string>>;
  companyRequired?: boolean;
}

const AccountForm: React.FC<AccountFormProps> = ({
  data,
  onChange,
  errors = {},
  companyRequired = false,
}) => {
  return (
    <Box>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          mb: 1,
        }}
      >
        Create Your Account
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 4 }}
      >
        We'll use this information to set up your account and keep you updated.
      </Typography>

      <Stack spacing={3}>
        <TextField
          fullWidth
          label="Full Name"
          required
          value={data.fullName}
          onChange={(e) => onChange('fullName', e.target.value)}
          error={!!errors.fullName}
          helperText={errors.fullName}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PersonIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          label="Email Address"
          type="email"
          required
          value={data.email}
          onChange={(e) => onChange('email', e.target.value)}
          error={!!errors.email}
          helperText={errors.email}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          label="Password"
          type="password"
          required
          value={data.password}
          onChange={(e) => onChange('password', e.target.value)}
          error={!!errors.password}
          helperText={errors.password}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <VpnKeyIcon color="action" />
              </InputAdornment>
            ),
          }}
        />
        <PasswordStrengthMeter password={data.password} />

        <TextField
          fullWidth
          label="Company Name (Optional)"
          value={data.companyName}
          onChange={(e) => onChange('companyName', e.target.value)}
          error={!!errors.companyName}
          helperText={errors.companyName}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <BusinessIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          label="Phone Number"
          type="tel"
          required
          value={data.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          error={!!errors.phone}
          helperText={errors.phone}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <PhoneIcon color="action" />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          label="Referral Code (Optional)"
          value={data.referralCode}
          onChange={(e) => onChange('referralCode', e.target.value)}
          error={!!errors.referralCode}
          helperText={errors.referralCode || 'Have a referral code? Enter it here.'}
        />
      </Stack>
    </Box>
  );
};

export default AccountForm;

