'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Grid, Box, Typography, Tabs, Tab,
  FormControlLabel, Switch, Radio, RadioGroup, Avatar,
  IconButton, CircularProgress, Paper, Stack, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Alert, Autocomplete,
} from '@mui/material';
import {
  CameraAlt as CameraIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { getBackendUrl } from '../../../utils/backendUrl';

interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_admin?: boolean;
  is_employee?: boolean;
  is_client?: boolean;
  profile_image?: string;
  phone?: string;
  address?: string;
  zipcode?: string;
  joining_date?: string;
  status?: 'active' | 'pending' | 'blocked' | 'reported';
}

interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  status: string;
}

interface EditUserDialogProps {
  open: boolean;
  user: User | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  availableClients: Client[];
}

const SYSTEMS = ['CRM', 'Analytics', 'Email Marketing', 'Project Management', 'Support Desk', 'Billing'];

export default function EditUserDialog({ 
  open, 
  user, 
  onClose, 
  onSuccess, 
  onError,
  availableClients 
}: EditUserDialogProps) {
  const [currentTab, setCurrentTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingTabs, setLoadingTabs] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    zipcode: '',
    address: '',
    joiningDate: '',
    status: 'active' as 'active' | 'pending' | 'blocked' | 'reported',
    isEmployee: false,
    isAdmin: false,
    isClient: false,
    systemsConnected: [] as string[],
  });

  // Tab data state
  const [assignedClients, setAssignedClients] = useState<Client[]>([]);
  const [userTasks, setUserTasks] = useState<any[]>([]);
  const [userSupportRequests, setUserSupportRequests] = useState<any[]>([]);

  const backendUrl = getBackendUrl();

  useEffect(() => {
    if (user && open) {
      setFormData({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        username: user.username || '',
        email: user.email || '',
        phone: user.phone || '',
        zipcode: user.zipcode || '',
        address: user.address || '',
        joiningDate: user.joining_date || new Date().toISOString().split('T')[0],
        status: user.status || 'active',
        isEmployee: user.is_employee || false,
        isAdmin: user.is_admin || false,
        isClient: user.is_client || false,
        systemsConnected: [],
      });
      setCurrentTab(0);
      fetchUserData(user.id);
    }
  }, [user, open]);

  const fetchUserData = async (userId: number) => {
    setLoadingTabs(true);
    try {
      const [clientsRes, tasksRes, supportRes] = await Promise.all([
        fetch(`${backendUrl}/api/admin/users/${userId}/clients`, { credentials: 'include' }),
        fetch(`${backendUrl}/api/admin/users/${userId}/tasks`, { credentials: 'include' }),
        fetch(`${backendUrl}/api/admin/users/${userId}/support-requests`, { credentials: 'include' })
      ]);
      
      if (clientsRes.ok) {
        const data = await clientsRes.json();
        setAssignedClients(data.clients || []);
      }
      if (tasksRes.ok) {
        const data = await tasksRes.json();
        setUserTasks(data.tasks || []);
      }
      if (supportRes.ok) {
        const data = await supportRes.json();
        setUserSupportRequests(data.requests || []);
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    } finally {
      setLoadingTabs(false);
    }
  };

  const handleUpdate = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/admin/users/${user.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: formData.firstName,
          last_name: formData.lastName,
          username: formData.username,
          email: formData.email,
          phone: formData.phone,
          zipcode: formData.zipcode,
          address: formData.address,
          joining_date: formData.joiningDate,
          status: formData.status,
          is_admin: formData.isAdmin,
          is_employee: formData.isEmployee,
          is_client: formData.isClient,
        }),
      });

      if (response.ok) {
        onSuccess('User updated successfully');
        onClose();
      } else {
        const data = await response.json();
        onError(data.error || 'Failed to update user');
      }
    } catch (err) {
      onError('Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleUnassignClient = async (clientId: string) => {
    if (!user) return;
    
    try {
      const response = await fetch(
        `${backendUrl}/api/admin/users/${user.id}/unassign-client/${clientId}`,
        { method: 'DELETE', credentials: 'include' }
      );
      
      if (response.ok) {
        onSuccess('Client unassigned successfully');
        fetchUserData(user.id);
      } else {
        const data = await response.json();
        onError(data.error || 'Failed to unassign client');
      }
    } catch (err) {
      onError('Failed to unassign client');
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight={600}>
          Edit User
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage user settings, permissions, and assignments
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {/* Profile Image */}
        <Box display="flex" justifyContent="center" mb={3}>
          <Box position="relative">
            <Avatar
              src={user.profile_image}
              sx={{ width: 80, height: 80 }}
            >
              {formData.firstName?.[0] || user.username?.[0]}
            </Avatar>
            <IconButton
              size="small"
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' },
              }}
            >
              <CameraIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>

        {/* Tabs */}
        <Tabs
          value={currentTab}
          onChange={(e, v) => setCurrentTab(v)}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
        >
          <Tab label="Personal Details" />
          <Tab label={`Assigned Clients (${assignedClients.length})`} />
          <Tab label={`Tasks (${userTasks.length})`} />
          <Tab label={`Support (${userSupportRequests.length})`} />
        </Tabs>

        {/* Tab 0: Personal Details */}
        {currentTab === 0 && (
          <Box>
            <Typography variant="subtitle2" fontWeight={600} mb={2}>
              Personal Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Username"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Email"
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  fullWidth
                  label="Joining Date"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Zip/Code"
                  value={formData.zipcode}
                  onChange={(e) => setFormData({ ...formData, zipcode: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Address"
                  multiline
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </Grid>
            </Grid>

            <Typography variant="subtitle2" fontWeight={600} mt={3} mb={2}>
              Permissions
            </Typography>
            <Stack spacing={2}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isAdmin}
                    onChange={(e) => setFormData({ ...formData, isAdmin: e.target.checked })}
                  />
                }
                label="Admin Access - Full system control and user management"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isEmployee}
                    onChange={(e) => setFormData({ ...formData, isEmployee: e.target.checked })}
                  />
                }
                label="Employee Status - Can be assigned clients and tasks"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isClient}
                    onChange={(e) => setFormData({ ...formData, isClient: e.target.checked })}
                  />
                }
                label="Client Status - External client with limited access"
              />
            </Stack>

            <Typography variant="subtitle2" fontWeight={600} mt={3} mb={2}>
              Account Status
            </Typography>
            <RadioGroup
              row
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
            >
              <FormControlLabel value="active" control={<Radio />} label="Active" />
              <FormControlLabel value="pending" control={<Radio />} label="Pending" />
              <FormControlLabel value="reported" control={<Radio />} label="Reported" />
              <FormControlLabel value="blocked" control={<Radio />} label="Blocked" />
            </RadioGroup>

            {formData.isClient && (
              <>
                <Typography variant="subtitle2" fontWeight={600} mt={3} mb={2}>
                  Systems Connected
                </Typography>
                <Autocomplete
                  multiple
                  options={SYSTEMS}
                  value={formData.systemsConnected}
                  onChange={(e, newValue) => setFormData({ ...formData, systemsConnected: newValue })}
                  renderInput={(params) => <TextField {...params} label="Select Systems" />}
                />
              </>
            )}
          </Box>
        )}

        {/* Tab 1: Assigned Clients */}
        {currentTab === 1 && (
          <Box>
            {loadingTabs ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : assignedClients.length === 0 ? (
              <Alert severity="info">No clients assigned yet</Alert>
            ) : (
              <Stack spacing={1}>
                {assignedClients.map((client) => (
                  <Paper
                    key={client.id}
                    sx={{
                      p: 2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {client.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {client.company} • {client.email}
                      </Typography>
                      <Box mt={0.5}>
                        <Chip
                          label={client.status}
                          size="small"
                          color={client.status === 'active' ? 'success' : 'default'}
                          sx={{ textTransform: 'capitalize' }}
                        />
                      </Box>
                    </Box>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleUnassignClient(client.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Paper>
                ))}
              </Stack>
            )}
          </Box>
        )}

        {/* Tab 2: Tasks */}
        {currentTab === 2 && (
          <Box>
            {loadingTabs ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : userTasks.length === 0 ? (
              <Alert severity="info">No tasks assigned</Alert>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Task</TableCell>
                      <TableCell>Client</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Due Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {userTasks.map((task) => (
                      <TableRow key={task.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {task.title}
                          </Typography>
                          {task.description && (
                            <Typography variant="caption" color="text.secondary">
                              {task.description.substring(0, 50)}...
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{task.client_name || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip label={task.status} size="small" />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={task.priority}
                            size="small"
                            color={task.priority === 'high' ? 'error' : task.priority === 'medium' ? 'warning' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* Tab 3: Support Requests */}
        {currentTab === 3 && (
          <Box>
            {loadingTabs ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : userSupportRequests.length === 0 ? (
              <Alert severity="info">No support requests</Alert>
            ) : (
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Subject</TableCell>
                      <TableCell>Client</TableCell>
                      <TableCell>Priority</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Created</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {userSupportRequests.map((req) => (
                      <TableRow key={req.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {req.subject}
                          </Typography>
                        </TableCell>
                        <TableCell>{req.client_name || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip
                            label={req.priority}
                            size="small"
                            color={req.priority === 'urgent' ? 'error' : req.priority === 'high' ? 'warning' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <Chip label={req.status} size="small" />
                        </TableCell>
                        <TableCell>
                          {new Date(req.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleUpdate}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Update User'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
