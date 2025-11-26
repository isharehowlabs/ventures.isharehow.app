import React from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

interface PasswordStrengthMeterProps {
  password: string;
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const calculateStrength = (pwd: string): { value: number; label: string; color: 'error' | 'warning' | 'info' | 'success' } => {
    if (!pwd) return { value: 0, label: '', color: 'error' };
    
    let strength = 0;
    if (pwd.length >= 8) strength += 25;
    if (pwd.length >= 12) strength += 25;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength += 25;
    if (/\d/.test(pwd)) strength += 12.5;
    if (/[^a-zA-Z\d]/.test(pwd)) strength += 12.5;

    if (strength < 50) return { value: strength, label: 'Weak', color: 'error' };
    if (strength < 75) return { value: strength, label: 'Medium', color: 'warning' };
    if (strength < 100) return { value: strength, label: 'Strong', color: 'info' };
    return { value: strength, label: 'Very Strong', color: 'success' };
  };

  const strength = calculateStrength(password);

  return (
    <Box sx={{ mt: 1 }}>
      <LinearProgress
        variant="determinate"
        value={strength.value}
        color={strength.color}
        sx={{ height: 8, borderRadius: 1 }}
      />
      {password && (
        <Typography variant="caption" color={`${strength.color}.main`} sx={{ mt: 0.5, display: 'block' }}>
          Password strength: {strength.label}
        </Typography>
      )}
    </Box>
  );
};

export default PasswordStrengthMeter;

