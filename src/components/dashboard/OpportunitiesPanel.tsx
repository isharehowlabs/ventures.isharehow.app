'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Launch as LaunchIcon,
} from '@mui/icons-material';

interface Opportunity {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in-progress' | 'closed' | 'won' | 'lost';
  value?: number;
  client?: string;
  createdAt: string;
  updatedAt: string;
}

export default function OpportunitiesPanel() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<Opportunity['status']>('open');
  const [value, setValue] = useState('');
  const [client, setClient] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Load opportunities from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('opportunities');
    if (stored) {
      try {
        setOpportunities(JSON.parse(stored));
      } catch (e) {
        console.error('Error loading opportunities:', e);
      }
    }
  }, []);

  // Save opportunities to localStorage
  const saveOpportunities = (ops: Opportunity[]) => {
    localStorage.setItem('opportunities', JSON.stringify(ops));
    setOpportunities(ops);
  };

  const handleOpenDialog = (opportunity?: Opportunity) => {
    if (opportunity) {
      setEditingOpportunity(opportunity);
      setTitle(opportunity.title);
      setDescription(opportunity.description);
      setStatus(opportunity.status);
      setValue(opportunity.value?.toString() || '');
      setClient(opportunity.client || '');
    } else {
      setEditingOpportunity(null);
      setTitle('');
      setDescription('');
      setStatus('open');
      setValue('');
      setClient('');
    }
    setError(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingOpportunity(null);
    setTitle('');
    setDescription('');
    setStatus('open');
    setValue('');
    setClient('');
    setError(null);
  };

  const handleSave = () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    const now = new Date().toISOString();
    const opportunityValue = value ? parseFloat(value) : undefined;

    if (editingOpportunity) {
      const updated = opportunities.map((opp) =>
        opp.id === editingOpportunity.id
          ? {
              ...opp,
              title: title.trim(),
              description: description.trim(),
              status,
              value: opportunityValue,
              client: client.trim() || undefined,
              updatedAt: now,
            }
          : opp
      );
      saveOpportunities(updated);
    } else {
      const newOpportunity: Opportunity = {
        id: Date.now().toString(),
        title: title.trim(),
        description: description.trim(),
        status,
        value: opportunityValue,
        client: client.trim() || undefined,
        createdAt: now,
        updatedAt: now,
      };
      saveOpportunities([...opportunities, newOpportunity]);
    }

    handleCloseDialog();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this opportunity?')) {
      saveOpportunities(opportunities.filter((opp) => opp.id !== id));
    }
  };

  const getStatusColor = (status: Opportunity['status']) => {
    switch (status) {
      case 'open':
        return 'default';
      case 'in-progress':
        return 'primary';
      case 'won':
        return 'success';
      case 'lost':
        return 'error';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Opportunities
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Opportunity
        </Button>
      </Box>

      {opportunities.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <TrendingUpIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No opportunities yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Start tracking business opportunities and potential projects
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Create Your First Opportunity
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {opportunities.map((opportunity) => (
            <Grid item xs={12} sm={6} md={4} key={opportunity.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Typography variant="h6" component="h2" sx={{ flex: 1 }}>
                      {opportunity.title}
                    </Typography>
                    <Chip
                      label={opportunity.status}
                      color={getStatusColor(opportunity.status) as any}
                      size="small"
                    />
                  </Box>
                  {opportunity.client && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Client: {opportunity.client}
                    </Typography>
                  )}
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                    {opportunity.description || 'No description'}
                  </Typography>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Typography variant="body2" fontWeight="medium">
                      Value: {formatCurrency(opportunity.value)}
                    </Typography>
                  </Stack>
                </CardContent>
                <CardActions>
                  <IconButton
                    size="small"
                    onClick={() => handleOpenDialog(opportunity)}
                    aria-label="edit"
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(opportunity.id)}
                    aria-label="delete"
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                  <Box sx={{ flexGrow: 1 }} />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingOpportunity ? 'Edit Opportunity' : 'Add New Opportunity'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
              autoFocus
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={4}
            />
            <TextField
              label="Client"
              value={client}
              onChange={(e) => setClient(e.target.value)}
              fullWidth
            />
            <TextField
              label="Value ($)"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              fullWidth
              inputProps={{ min: 0, step: 0.01 }}
            />
            <TextField
              label="Status"
              select
              value={status}
              onChange={(e) => setStatus(e.target.value as Opportunity['status'])}
              fullWidth
              SelectProps={{
                native: true,
              }}
            >
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="won">Won</option>
              <option value="lost">Lost</option>
              <option value="closed">Closed</option>
            </TextField>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editingOpportunity ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

