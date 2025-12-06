'use client';

import React, { useState, useEffect } from 'react';
import { getBackendUrl } from '../../../utils/backendUrl';
import {
  Box,
  Paper,
  Typography,
  Button,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Autocomplete,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';

interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
}

interface SupportRequest {
  id: string;
  client: string;
  subject: string;
  status: 'open' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  description: string;
}


export default function SupportRequests() {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [newRequest, setNewRequest] = useState({
    client: '',
    subject: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  // Fetch support requests and clients on mount
  useEffect(() => {
    fetchRequests();
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/creative/clients`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      }
    } catch (err) {
      console.error('Error fetching clients:', err);
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/creative/support-requests`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch support requests');
      }

      const data = await response.json();
      setRequests(data.requests || []);
    } catch (err: any) {
      console.error('Error fetching support requests:', err);
      setError(err.message || 'Failed to load support requests');
      // Fallback to empty array on error
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (request: SupportRequest) => {
    setSelectedRequest(request);
    setDialogOpen(true);
  };

  const handleCreate = async () => {
    if (!newRequest.subject || !newRequest.description) {
      setError('Subject and description are required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/creative/support-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          client: selectedClient ? (selectedClient.company || selectedClient.name) : newRequest.client,
          client_id: selectedClient?.id,
          subject: newRequest.subject,
          description: newRequest.description,
          priority: newRequest.priority,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create support request');
      }

      const data = await response.json();
      setRequests([...requests, data]);
      setNewRequest({
        client: '',
        subject: '',
        description: '',
        priority: 'medium',
      });
      setSelectedClient(null);
      setDialogOpen(false);
    } catch (err: any) {
      console.error('Error creating support request:', err);
      setError(err.message || 'Failed to create support request');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'success';
      case 'in-progress':
        return 'warning';
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
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            iShareHow Support Requests
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage and track support requests from clients
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setSelectedRequest(null);
            setDialogOpen(true);
          }}
        >
          New Request
        </Button>
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Client</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Subject</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Created</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No support requests yet.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              requests.map((request) => (
                <TableRow key={request.id} hover>
                  <TableCell>{request.client}</TableCell>
                  <TableCell>{request.subject}</TableCell>
                  <TableCell>
                    <Chip
                      label={request.status}
                      size="small"
                      color={getStatusColor(request.status)}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={request.priority}
                      size="small"
                      color={getPriorityColor(request.priority)}
                    />
                  </TableCell>
                  <TableCell>{request.createdAt}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleView(request)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* View/Create Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedRequest(null);
          setSelectedClient(null);
          setNewRequest({
            client: '',
            subject: '',
            description: '',
            priority: 'medium',
          });
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedRequest ? 'Support Request Details' : 'Create Support Request'}
        </DialogTitle>
        <DialogContent>
          {selectedRequest ? (
            <Box>
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Client
                  </Typography>
                  <Typography variant="body1">{selectedRequest.client}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Subject
                  </Typography>
                  <Typography variant="body1">{selectedRequest.subject}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1">{selectedRequest.description}</Typography>
                </Box>
                <Stack direction="row" spacing={2}>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={selectedRequest.status}
                      color={getStatusColor(selectedRequest.status)}
                    />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Priority
                    </Typography>
                    <Chip
                      label={selectedRequest.priority}
                      color={getPriorityColor(selectedRequest.priority)}
                    />
                  </Box>
                </Stack>
              </Stack>
            </Box>
          ) : (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <Autocomplete
                fullWidth
                options={clients}
                getOptionLabel={(option) => option.company || option.name || ''}
                value={selectedClient}
                onChange={(_, newValue) => {
                  setSelectedClient(newValue);
                  setNewRequest({ ...newRequest, client: newValue ? (newValue.company || newValue.name) : '' });
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Client"
                    placeholder="Select a client..."
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Stack>
                      <Typography variant="body1">{option.company || option.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {option.email}
                      </Typography>
                    </Stack>
                  </Box>
                )}
              />
              <TextField
                fullWidth
                label="Subject"
                value={newRequest.subject}
                onChange={(e) =>
                  setNewRequest({ ...newRequest, subject: e.target.value })
                }
              />
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={newRequest.description}
                onChange={(e) =>
                  setNewRequest({ ...newRequest, description: e.target.value })
                }
              />
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={newRequest.priority}
                  label="Priority"
                  onChange={(e) =>
                    setNewRequest({
                      ...newRequest,
                      priority: e.target.value as 'low' | 'medium' | 'high',
                    })
                  }
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setDialogOpen(false);
            setSelectedRequest(null);
            setSelectedClient(null);
            setNewRequest({
              client: '',
              subject: '',
              description: '',
              priority: 'medium',
            });
          }}>
            {selectedRequest ? 'Close' : 'Cancel'}
          </Button>
          {!selectedRequest && (
            <Button variant="contained" onClick={handleCreate}>
              Create Request
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

