'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Alert,
} from '@mui/material';
import { useRouter } from 'next/router';

interface AddClientDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function AddClientDialog({ open, onClose }: AddClientDialogProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    tier: '',
    notes: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setError(null);
  };

  const handleTierChange = (e: any) => {
    setFormData((prev) => ({ ...prev, tier: e.target.value }));
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.name || !formData.email || !formData.company) {
      setError('Please fill in all required fields (Name, Email, Company)');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // TODO: Save client lead to backend
      // For now, redirect to signup page with client info
      const params = new URLSearchParams({
        name: formData.name,
        email: formData.email,
        company: formData.company,
        ...(formData.tier && { tier: formData.tier }),
      });

      // Close dialog and navigate to signup
      onClose();
      router.push(`/demo?${params.toString()}`);

      // Reset form
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        tier: '',
        notes: '',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to add client. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      email: '',
      company: '',
      phone: '',
      tier: '',
      notes: '',
    });
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight={700}>
          Add New Client
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Add a client lead and send them to the sign-up page
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Client Name"
            required
            value={formData.name}
            onChange={handleChange('name')}
            placeholder="John Doe"
          />

          <TextField
            fullWidth
            label="Email Address"
            type="email"
            required
            value={formData.email}
            onChange={handleChange('email')}
            placeholder="john@company.com"
          />

          <TextField
            fullWidth
            label="Company Name"
            required
            value={formData.company}
            onChange={handleChange('company')}
            placeholder="Company Inc."
          />

          <TextField
            fullWidth
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={handleChange('phone')}
            placeholder="+1 (555) 123-4567"
          />

          <FormControl fullWidth>
            <InputLabel>Recommended Tier</InputLabel>
            <Select
              value={formData.tier}
              label="Recommended Tier"
              onChange={handleTierChange}
            >
              <MenuItem value="">None</MenuItem>
              <MenuItem value="starter">Starter</MenuItem>
              <MenuItem value="professional">Professional</MenuItem>
              <MenuItem value="enterprise">Enterprise</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Notes (Optional)"
            multiline
            rows={3}
            value={formData.notes}
            onChange={handleChange('notes')}
            placeholder="Any additional information about this client..."
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send to Sign-Up'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

