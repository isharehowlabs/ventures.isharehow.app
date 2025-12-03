'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Add as AddIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingIcon,
  AttachMoney as MoneyIcon,
  Dashboard as BoardIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/router';

interface Opportunity {
  id: string;
  title: string;
  description: string;
  type: 'mssp' | 'soc' | 'venture' | 'client';
  status: 'lead' | 'negotiation' | 'active' | 'closed';
  value?: number;
  priority: 'low' | 'medium' | 'high';
}

export default function OpportunitiesPanel() {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'venture' as Opportunity['type'],
    status: 'lead' as Opportunity['status'],
    value: '',
    priority: 'medium' as Opportunity['priority'],
  });

  const handleOpenDialog = () => {
    setFormData({
      title: '',
      description: '',
      type: 'venture',
      status: 'lead',
      value: '',
      priority: 'medium',
    });
    setDialogOpen(true);
  };

  const handleSaveOpportunity = () => {
    const newOpportunity: Opportunity = {
      id: Date.now().toString(),
      title: formData.title,
      description: formData.description,
      type: formData.type,
      status: formData.status,
      value: formData.value ? parseFloat(formData.value) : undefined,
      priority: formData.priority,
    };
    setOpportunities([...opportunities, newOpportunity]);
    setDialogOpen(false);
  };

  const handleOpenBoard = (id: string) => {
    router.push(`/board?boardId=opportunity_${id}`);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'mssp':
      case 'soc':
        return <BusinessIcon />;
      default:
        return <TrendingIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'lead':
        return 'info';
      case 'negotiation':
        return 'warning';
      case 'active':
        return 'success';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Venture Opportunities</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          size="small"
        >
          Add Opportunity
        </Button>
      </Box>

      <Grid container spacing={2}>
        {opportunities.map((opp) => (
          <Grid item xs={12} md={6} key={opp.id}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ mr: 1, color: 'primary.main' }}>
                    {getTypeIcon(opp.type)}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div">
                      {opp.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {opp.description}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                  <Chip
                    label={opp.type.toUpperCase()}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={opp.status}
                    size="small"
                    color={getStatusColor(opp.status) as any}
                  />
                  <Chip
                    label={opp.priority}
                    size="small"
                    color={getPriorityColor(opp.priority) as any}
                  />
                  {opp.value && (
                    <Chip
                      icon={<MoneyIcon />}
                      label={`$${opp.value.toLocaleString()}`}
                      size="small"
                      color="success"
                      variant="outlined"
                    />
                  )}
                </Box>
              </CardContent>
              <CardActions>
                <Tooltip title="Open Collaboration Board">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenBoard(opp.id)}
                    color="primary"
                  >
                    <BoardIcon />
                  </IconButton>
                </Tooltip>
                <Button size="small">View Details</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {opportunities.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body2" color="text.secondary">
            No opportunities yet. Add your first venture opportunity!
          </Typography>
        </Box>
      )}

      {/* Add Opportunity Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Opportunity</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            variant="outlined"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={formData.type}
              label="Type"
              onChange={(e) => setFormData({ ...formData, type: e.target.value as Opportunity['type'] })}
            >
              <MenuItem value="mssp">MSSP</MenuItem>
              <MenuItem value="soc">SOC</MenuItem>
              <MenuItem value="venture">Venture</MenuItem>
              <MenuItem value="client">Client</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={formData.status}
              label="Status"
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Opportunity['status'] })}
            >
              <MenuItem value="lead">Lead</MenuItem>
              <MenuItem value="negotiation">Negotiation</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={formData.priority}
              label="Priority"
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as Opportunity['priority'] })}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Estimated Value ($)"
            fullWidth
            variant="outlined"
            type="number"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveOpportunity}
            variant="contained"
            disabled={!formData.title.trim()}
          >
            Add Opportunity
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
