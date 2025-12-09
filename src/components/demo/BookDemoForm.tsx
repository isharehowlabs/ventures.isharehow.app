'use client';

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Stack,
  Grid,
} from '@mui/material';
import {
  Send as SendIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import { getBackendUrl } from '../../utils/backendUrl';

interface BookDemoFormProps {
  onSuccess?: (clientId: string) => void;
}

export default function BookDemoForm({ onSuccess }: BookDemoFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
    marketingBudget: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const backendUrl = getBackendUrl();
      
      // Save demo lead to backend
      const response = await fetch(`${backendUrl}/api/demo/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
          body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          company: formData.company.trim() || undefined,
          phone: formData.phone.trim(),
          message: formData.message.trim() || undefined,
          marketingBudget: formData.marketingBudget.trim() || undefined,
          source: 'book_demo_form',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to submit demo request' }));
        throw new Error(errorData.error || 'Failed to submit demo request. Please try again.');
      }

      const data = await response.json();
      setSuccess(true);
      
      // Call onSuccess callback with client ID if provided
      if (onSuccess && data.clientId) {
        setTimeout(() => {
          onSuccess(data.clientId);
        }, 1500);
      } else if (onSuccess) {
        // Redirect after a short delay
        setTimeout(() => {
          onSuccess('');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit demo request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Paper
        elevation={4}
        sx={{
          p: 4,
          textAlign: 'center',
          borderRadius: 3,
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
        }}
      >
        <Box sx={{ mb: 2 }}>
          <SendIcon sx={{ fontSize: 64, color: 'success.main' }} />
        </Box>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Thank You!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Your demo request has been submitted successfully. We'll be in touch soon!
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Redirecting to demo page...
        </Typography>
        <CircularProgress size={24} sx={{ mt: 2 }} />
      </Paper>
    );
  }

  return (
    <Paper
      elevation={4}
      sx={{
        p: { xs: 3, md: 4 },
        borderRadius: 3,
        width: '100%',
      }}
    >
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Book Your Demo
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Fill out the form below and we'll get back to you soon
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            fullWidth
            required
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="John Doe"
            InputProps={{
              startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            disabled={loading}
          />

          <TextField
            fullWidth
            required
            type="email"
            label="Email Address"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            InputProps={{
              startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Company Name (Optional)"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="Acme Inc."
            InputProps={{
              startAdornment: <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            disabled={loading}
          />

          <TextField
            fullWidth
            required
            type="tel"
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1 (555) 123-4567"
            InputProps={{
              startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            disabled={loading}
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Message (Optional)"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Tell us what you're interested in learning about..."
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Marketing Budget"
            name="marketingBudget"
            value={formData.marketingBudget}
            onChange={handleChange}
            placeholder="Do you have a marketing budget available or willing to get one?"
            helperText="Do you have a marketing budget available or willing to get one?"
            InputProps={{
              startAdornment: <AttachMoneyIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            disabled={loading}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
            sx={{
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              },
            }}
          >
            {loading ? 'Submitting...' : 'Submit Demo Request'}
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}

