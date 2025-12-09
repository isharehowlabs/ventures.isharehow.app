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
  Edit as EditIcon,
  MoreVert as MoreVertIcon,
} from '@mui/icons-material';
import {
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Menu,
} from '@mui/material';

interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
}

interface Employee {
  id: number;
  name: string;
  email: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  supportRequestId?: string;
  assignedTo?: string;
  assignedToName?: string;
  createdAt?: string;
}

interface SupportRequest {
  id: string;
  client: string;
  clientId?: string;
  subject: string;
  status: 'open' | 'in-progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  description: string;
  assignedTo?: string;
  linkedTasks?: Task[];
}


export default function SupportRequests() {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<SupportRequest | null>(null);
  const [editingRequest, setEditingRequest] = useState<SupportRequest | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuRequestId, setMenuRequestId] = useState<string | null>(null);
  const [newRequest, setNewRequest] = useState({
    client: '',
    subject: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });
  const [editRequest, setEditRequest] = useState({
    subject: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    status: 'open' as 'open' | 'in-progress' | 'resolved',
    assignedTo: '',
  });

  // Fetch support requests, clients, employees, and tasks on mount
  useEffect(() => {
    fetchRequests();
    fetchClients();
    fetchEmployees();
    fetchTasks();
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

  const fetchEmployees = async () => {
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/creative/employees`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.employees || []);
      }
    } catch (err) {
      console.error('Error fetching employees:', err);
    }
  };

  const fetchTasks = async () => {
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/tasks`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
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
        const errorData = await response.json().catch(() => ({ error: 'Failed to fetch support requests' }));
        throw new Error(errorData.error || errorData.details || 'Failed to fetch support requests');
      }

      const data = await response.json();
      setRequests(data.requests || []);
    } catch (err: any) {
      console.error('Error fetching support requests:', err);
      const errorMessage = err.message || 'Failed to load support requests';
      setError(errorMessage);
      // Fallback to empty array on error
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (request: SupportRequest) => {
    setSelectedRequest(request);
    setEditingRequest(null);
    setDialogOpen(true);
  };

  const handleEdit = (request: SupportRequest) => {
    setEditingRequest(request);
    setSelectedRequest(null);
    
    // Find and set the employee if assigned
    const assignedEmployee = request.assignedTo 
      ? employees.find(emp => emp.name === request.assignedTo || emp.email === request.assignedTo)
      : null;
    setSelectedEmployee(assignedEmployee || null);
    
    // Find and set the linked task if any
    const linkedTask = request.linkedTasks && request.linkedTasks.length > 0
      ? tasks.find(t => t.id === request.linkedTasks![0].id)
      : null;
    setSelectedTask(linkedTask || null);
    
    setEditRequest({
      subject: request.subject,
      description: request.description,
      priority: request.priority,
      status: request.status,
      assignedTo: request.assignedTo || '',
    });
    setDialogOpen(true);
    setMenuAnchor(null);
    setMenuRequestId(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, requestId: string) => {
    event.stopPropagation();
    setMenuAnchor(event.currentTarget);
    setMenuRequestId(requestId);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuRequestId(null);
  };

  const handleUpdate = async () => {
    if (!editingRequest || !editRequest.subject || !editRequest.description) {
      setError('Subject and description are required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/creative/support-requests/${editingRequest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          subject: editRequest.subject,
          description: editRequest.description,
          priority: editRequest.priority,
          status: editRequest.status,
          assignedTo: selectedEmployee ? (selectedEmployee.name || selectedEmployee.email) : editRequest.assignedTo || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to update support request' }));
        const errorMessage = errorData.error || errorData.message || `Failed to update support request (${response.status})`;
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      // Link task if selected
      if (selectedTask && selectedTask.id) {
        try {
          await fetch(`${backendUrl}/api/tasks/${selectedTask.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              supportRequestId: editingRequest.id,
            }),
          });
        } catch (taskErr) {
          console.error('Error linking task:', taskErr);
        }
      }
      
      setRequests(requests.map(r => r.id === editingRequest.id ? data : r));
      setEditingRequest(null);
      setSelectedEmployee(null);
      setSelectedTask(null);
      setEditRequest({
        subject: '',
        description: '',
        priority: 'medium',
        status: 'open',
        assignedTo: '',
      });
      setDialogOpen(false);
      fetchRequests(); // Refresh to get updated data
      fetchTasks(); // Refresh tasks
    } catch (err: any) {
      console.error('Error updating support request:', err);
      setError(err.message || 'Failed to update support request');
    } finally {
      setLoading(false);
    }
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
          clientId: selectedClient?.id,
          subject: newRequest.subject,
          description: newRequest.description,
          priority: newRequest.priority,
          assignedTo: selectedEmployee ? (selectedEmployee.name || selectedEmployee.email) : null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to create support request' }));
        throw new Error(errorData.error || errorData.details || 'Failed to create support request');
      }

      const data = await response.json();
      
      // Link task if selected
      if (selectedTask && selectedTask.id) {
        try {
          await fetch(`${backendUrl}/api/tasks/${selectedTask.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({
              supportRequestId: data.id,
            }),
          });
        } catch (taskErr) {
          console.error('Error linking task:', taskErr);
        }
      }
      
      setRequests([data, ...requests]);
      setSuccess('Support request created successfully');
      setNewRequest({
        client: '',
        subject: '',
        description: '',
        priority: 'medium',
      });
      setSelectedClient(null);
      setSelectedEmployee(null);
      setSelectedTask(null);
      setDialogOpen(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
      fetchRequests(); // Refresh to get updated data
      fetchTasks(); // Refresh tasks
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
      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
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
              <TableCell sx={{ fontWeight: 700 }}>Assigned To</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Priority</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Created</TableCell>
              <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
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
                    {request.assignedTo ? (
                      <Chip label={request.assignedTo} size="small" variant="outlined" />
                    ) : (
                      <Typography variant="caption" color="text.secondary">Unassigned</Typography>
                    )}
                  </TableCell>
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
                  <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, request.id)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={() => {
            const request = requests.find(r => r.id === menuRequestId);
            if (request) {
              handleView(request);
            }
          }}
        >
          <VisibilityIcon sx={{ mr: 1, fontSize: 20 }} />
          View Details
        </MenuItem>
        <MenuItem
          onClick={() => {
            const request = requests.find(r => r.id === menuRequestId);
            if (request) {
              handleEdit(request);
            }
          }}
        >
          <EditIcon sx={{ mr: 1, fontSize: 20 }} />
          Edit
        </MenuItem>
      </Menu>

      {/* View/Create/Edit Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setSelectedRequest(null);
          setEditingRequest(null);
          setSelectedClient(null);
          setNewRequest({
            client: '',
            subject: '',
            description: '',
            priority: 'medium',
          });
          setEditRequest({
            subject: '',
            description: '',
            priority: 'medium',
            status: 'open',
            assignedTo: '',
          });
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedRequest ? 'Support Request Details' : editingRequest ? 'Edit Support Request' : 'Create Support Request'}
        </DialogTitle>
        <DialogContent>
          {editingRequest ? (
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Subject"
                value={editRequest.subject}
                onChange={(e) =>
                  setEditRequest({ ...editRequest, subject: e.target.value })
                }
              />
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                value={editRequest.description}
                onChange={(e) =>
                  setEditRequest({ ...editRequest, description: e.target.value })
                }
              />
              <FormControl fullWidth>
                <InputLabel>Assigned Employee</InputLabel>
                <Select
                  value={selectedEmployee?.id || ''}
                  label="Assigned Employee"
                  onChange={(e) => {
                    const emp = employees.find(em => em.id === Number(e.target.value));
                    setSelectedEmployee(emp || null);
                    setEditRequest({
                      ...editRequest,
                      assignedTo: emp ? (emp.name || emp.email) : '',
                    });
                  }}
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {employees.map((emp) => (
                    <MenuItem key={emp.id} value={emp.id}>
                      {emp.name} ({emp.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Autocomplete
                fullWidth
                options={tasks.filter(t => !t.supportRequestId || t.supportRequestId === editingRequest?.id)}
                getOptionLabel={(option) => {
                  const linked = option.supportRequestId ? ' (Linked)' : '';
                  return `${option.title || ''}${linked}`;
                }}
                value={selectedTask}
                onChange={(_, newValue) => {
                  setSelectedTask(newValue);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Link Task (Optional)"
                    placeholder="Select a task to link..."
                    helperText="Link a task from AI Agent or Co-Work tab. Shows all tasks including old ones."
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body1">{option.title}</Typography>
                        {option.supportRequestId && option.supportRequestId !== editingRequest?.id && (
                          <Chip
                            label="Already Linked"
                            size="small"
                            color="info"
                            variant="outlined"
                          />
                        )}
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {option.description?.substring(0, 50)}...
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                        <Chip
                          label={option.status}
                          size="small"
                          color={option.status === 'completed' ? 'success' : option.status === 'in-progress' ? 'warning' : 'default'}
                        />
                        {option.createdAt && (
                          <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
                            {new Date(option.createdAt).toLocaleDateString()}
                          </Typography>
                        )}
                      </Stack>
                    </Stack>
                  </Box>
                )}
              />
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={editRequest.priority}
                  label="Priority"
                  onChange={(e) =>
                    setEditRequest({
                      ...editRequest,
                      priority: e.target.value as 'low' | 'medium' | 'high',
                    })
                  }
                >
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={editRequest.status}
                  label="Status"
                  onChange={(e) =>
                    setEditRequest({
                      ...editRequest,
                      status: e.target.value as 'open' | 'in-progress' | 'resolved',
                    })
                  }
                >
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          ) : selectedRequest ? (
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
                    Assigned To
                  </Typography>
                  <Typography variant="body1">
                    {selectedRequest.assignedTo || 'Unassigned'}
                  </Typography>
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
                {selectedRequest.linkedTasks && selectedRequest.linkedTasks.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Linked Tasks
                    </Typography>
                    <Stack spacing={1}>
                      {selectedRequest.linkedTasks.map((task) => (
                        <Chip
                          key={task.id}
                          label={task.title}
                          size="small"
                          variant="outlined"
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}
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
                <InputLabel>Assigned Employee</InputLabel>
                <Select
                  value={selectedEmployee?.id || ''}
                  label="Assigned Employee"
                  onChange={(e) => {
                    const emp = employees.find(em => em.id === Number(e.target.value));
                    setSelectedEmployee(emp || null);
                  }}
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {employees.map((emp) => (
                    <MenuItem key={emp.id} value={emp.id}>
                      {emp.name} ({emp.email})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Autocomplete
                fullWidth
                options={tasks}
                getOptionLabel={(option) => {
                  const linked = option.supportRequestId ? ' (Already Linked)' : '';
                  return `${option.title || ''}${linked}`;
                }}
                value={selectedTask}
                onChange={(_, newValue) => {
                  // Only allow linking if task is not already linked to another request
                  if (newValue && !newValue.supportRequestId) {
                    setSelectedTask(newValue);
                  } else if (newValue && newValue.supportRequestId) {
                    setError('This task is already linked to another support request');
                    setTimeout(() => setError(null), 3000);
                  } else {
                    setSelectedTask(null);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Link Task (Optional)"
                    placeholder="Select a task to link..."
                    helperText="Link a task from AI Agent or Co-Work tab. Shows all tasks including old ones."
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props}>
                    <Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body1">{option.title}</Typography>
                        {option.supportRequestId && (
                          <Chip
                            label="Already Linked"
                            size="small"
                            color="info"
                            variant="outlined"
                          />
                        )}
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {option.description?.substring(0, 50)}...
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ mt: 0.5 }} flexWrap="wrap">
                        <Chip
                          label={option.status}
                          size="small"
                          color={option.status === 'completed' ? 'success' : option.status === 'in-progress' ? 'warning' : 'default'}
                        />
                        {option.assignedToName && (
                          <Chip
                            label={`Assigned: ${option.assignedToName}`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                        {option.createdAt && (
                          <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
                            {new Date(option.createdAt).toLocaleDateString()}
                          </Typography>
                        )}
                      </Stack>
                    </Stack>
                  </Box>
                )}
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
          <Button           onClick={() => {
            setDialogOpen(false);
            setSelectedRequest(null);
            setEditingRequest(null);
            setSelectedClient(null);
            setSelectedEmployee(null);
            setSelectedTask(null);
            setNewRequest({
              client: '',
              subject: '',
              description: '',
              priority: 'medium',
            });
            setEditRequest({
              subject: '',
              description: '',
              priority: 'medium',
              status: 'open',
              assignedTo: '',
            });
          }}>
            {selectedRequest ? 'Close' : editingRequest ? 'Cancel' : 'Cancel'}
          </Button>
          {editingRequest ? (
            <Button variant="contained" onClick={handleUpdate}>
              Update Request
            </Button>
          ) : !selectedRequest && (
            <Button variant="contained" onClick={handleCreate}>
              Create Request
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

