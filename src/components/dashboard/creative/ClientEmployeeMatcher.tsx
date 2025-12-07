'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Stack,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Menu,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Autocomplete,
  Tooltip,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  PersonAdd as PersonAddIcon,
  TrendingUp as TrendingUpIcon,
  Add as AddIcon,
  Email as EmailIcon,
  Notifications as NotificationsIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { getBackendUrl } from '../../../utils/backendUrl';
import AddClientDialog from './AddClientDialog';
import EditClientDialog from './EditClientDialog';
import AssignEmployeeDialog from './AssignEmployeeDialog';
import { useAuth } from '../../../hooks/useAuth';
import AdminClientAssignmentDialog from './AdminClientAssignmentDialog';
import {
  AdminPanelSettings as AdminPanelSettingsIcon,
  VpnKey as VpnKeyIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';

interface Employee {
  id: number;
  name: string;
  email: string;
  is_admin?: boolean;
  is_employee?: boolean;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  status: 'active' | 'inactive' | 'pending' | 'prospect';
  systemsConnected: string[];
  assignedEmployee?: string;
  assignedEmployeeId?: number;
  tags?: string[];
  createdAt: string;
  phone?: string;
  notes?: string;
}

interface ClientEmployeeMatcherProps {
  onAssignmentChange?: () => void;
  onAddClient?: () => void;
}

export default function ClientEmployeeMatcher({ onAssignmentChange, onAddClient }: ClientEmployeeMatcherProps) {
  const { user } = useAuth();
  const isAdmin = user?.isAdmin || false;
  
  // State for all sections
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [prospects, setProspects] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Employee Management state (admin only)
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userError, setUserError] = useState<string | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [adminAssignDialogOpen, setAdminAssignDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUserForDelete, setSelectedUserForDelete] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Match Clients & Employees state
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [assigning, setAssigning] = useState(false);

  // Client List state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedClientForAction, setSelectedClientForAction] = useState<Client | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [addClientDialogOpen, setAddClientDialogOpen] = useState(false);

  // Prospects state
  const [prospectDialogOpen, setProspectDialogOpen] = useState(false);
  const [editingProspect, setEditingProspect] = useState<Client | null>(null);
  const [prospectForm, setProspectForm] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    notes: '',
  });

  useEffect(() => {
    fetchData();
    if (isAdmin) {
      fetchAllUsers();
    }
  }, [statusFilter, employeeFilter, searchQuery, isAdmin]);
  
  const fetchAllUsers = async () => {
    if (!isAdmin) return;
    setLoadingUsers(true);
    setUserError(null);
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/admin/users`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setAllUsers(data.users || []);
      } else {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        setUserError(errorData.error || `Failed to load users (${response.status})`);
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      setUserError(error.message || 'Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };
  
  const toggleEmployeeStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/admin/users/${userId}/employee`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isEmployee: !currentStatus }),
      });
      if (response.ok) {
        await fetchAllUsers();
        await fetchData(); // Refresh employees list
        setSuccess(`Employee status ${!currentStatus ? 'enabled' : 'disabled'} successfully`);
      } else {
        const errorData = await response.json();
        setUserError(errorData.error || 'Failed to update employee status');
      }
    } catch (error: any) {
      setUserError(error.message || 'Failed to update employee status');
    }
  };
  
  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/admin/users/${userId}/admin`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isAdmin: !currentStatus }),
      });
      if (response.ok) {
        await fetchAllUsers();
        setSuccess(`Admin status ${!currentStatus ? 'enabled' : 'disabled'} successfully`);
      } else {
        const errorData = await response.json();
        setUserError(errorData.error || 'Failed to update admin status');
      }
    } catch (error: any) {
      setUserError(error.message || 'Failed to update admin status');
    }
  };
  
  const handleOpenPasswordDialog = (user: any) => {
    setSelectedUserForPassword(user);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError(null);
    setPasswordDialogOpen(true);
  };
  
  const handleClosePasswordDialog = () => {
    setPasswordDialogOpen(false);
    setSelectedUserForPassword(null);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError(null);
  };
  
  const handleChangePassword = async () => {
    if (!selectedUserForPassword) return;
    
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    setChangingPassword(true);
    setPasswordError(null);
    
    try {
      const backendUrl = getBackendUrl();
      const userId = selectedUserForPassword.id || selectedUserForPassword.username || selectedUserForPassword.user_id;
      const encodedUserId = encodeURIComponent(userId);
      
      const response = await fetch(`${backendUrl}/api/admin/users/${encodedUserId}/password`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: newPassword }),
      });
      
      if (response.ok) {
        handleClosePasswordDialog();
        setSuccess('Password changed successfully');
      } else {
        const errorData = await response.json();
        setPasswordError(errorData.error || 'Failed to change password');
      }
    } catch (error: any) {
      setPasswordError(error.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };
  
  const handleOpenDeleteDialog = (usr: any) => {
    setSelectedUserForDelete(usr);
    setDeleteError(null);
    setDeleteDialogOpen(true);
  };
  
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedUserForDelete(null);
    setDeleteError(null);
  };
  
  const handleDeleteUser = async () => {
    if (!selectedUserForDelete) return;
    
    // Prevent self-deletion
    const userIdToDelete = selectedUserForDelete.id || selectedUserForDelete.user_id;
    if (userIdToDelete === user?.id || selectedUserForDelete.username === user?.username) {
      setDeleteError('Cannot delete your own account');
      return;
    }
    
    setDeleting(true);
    setDeleteError(null);
    
    try {
      const backendUrl = getBackendUrl();
      const encodedUserId = encodeURIComponent(userIdToDelete);
      
      const response = await fetch(`${backendUrl}/api/admin/users/${encodedUserId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        handleCloseDeleteDialog();
        await fetchAllUsers();
        await fetchData(); // Refresh employees list
        setSuccess('User deleted successfully');
      } else {
        const errorData = await response.json();
        setDeleteError(errorData.error || 'Failed to delete user');
      }
    } catch (error: any) {
      setDeleteError(error.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const backendUrl = getBackendUrl();
      
      // Fetch employees
      const employeesResponse = await fetch(`${backendUrl}/api/creative/employees`, {
        credentials: 'include',
      });
      if (!employeesResponse.ok) {
        throw new Error('Failed to fetch employees');
      }
      const employeesData = await employeesResponse.json();
      setEmployees(employeesData.employees || []);

      // Fetch clients with filters
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (employeeFilter !== 'all' && employeeFilter !== 'unassigned') {
        params.append('employee_id', employeeFilter);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const clientsResponse = await fetch(`${backendUrl}/api/creative/clients?${params.toString()}`, {
        credentials: 'include',
      });
      if (!clientsResponse.ok) {
        throw new Error('Failed to fetch clients');
      }
      const clientsData = await clientsResponse.json();
      const allClients = clientsData.clients || [];
      
      // Filter unassigned if needed
      let filteredClients = allClients;
      if (employeeFilter === 'unassigned') {
        filteredClients = filteredClients.filter((c: Client) => !c.assignedEmployee);
      }

      setClients(filteredClients);
      
      // Separate prospects (status === 'prospect')
      const prospectClients = allClients.filter((c: Client) => c.status === 'prospect');
      setProspects(prospectClients);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Match Clients & Employees handlers
  const handleAssign = async () => {
    if (!selectedClient || !selectedEmployee) {
      setError('Please select both a client and an employee');
      return;
    }

    setAssigning(true);
    setError(null);
    setSuccess(null);

    try {
      const backendUrl = getBackendUrl();
      const employee = employees.find((e) => e.id === selectedEmployee);
      
      const response = await fetch(`${backendUrl}/api/creative/clients/${selectedClient}/assign-employee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          employee_id: selectedEmployee,
          employee_name: employee?.name || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to assign employee' }));
        throw new Error(errorData.error || 'Failed to assign employee');
      }

      setSuccess(`Successfully assigned ${employee?.name} to ${clients.find(c => c.id === selectedClient)?.name}`);
      
      await fetchData();
      
      setSelectedClient('');
      setSelectedEmployee(null);
      
      if (onAssignmentChange) {
        onAssignmentChange();
      }
    } catch (err: any) {
      console.error('Error assigning employee:', err);
      setError(err.message || 'Failed to assign employee');
    } finally {
      setAssigning(false);
    }
  };

  // Client List handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, client: Client) => {
    setMenuAnchor(event.currentTarget);
    setSelectedClientForAction(client);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setSelectedClientForAction(null);
  };

  const handleView = () => {
    setIsViewMode(true);
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleEdit = () => {
    setIsViewMode(false);
    setEditDialogOpen(true);
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (!selectedClientForAction) {
      handleMenuClose();
      return;
    }

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/creative/clients/${selectedClientForAction.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete client');
      }

      await fetchData();
    } catch (err: any) {
      console.error('Error deleting client:', err);
      alert(err.message || 'Failed to delete client');
    }

    handleMenuClose();
  };

  const handleAssignEmployee = async () => {
    handleMenuClose();
    setAssignDialogOpen(true);
  };

  const handleEmployeeAssign = async (employeeId: number | null, employeeName: string | null) => {
    if (!selectedClientForAction) return;

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/creative/clients/${selectedClientForAction.id}/assign-employee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          employee_id: employeeId,
          employee_name: employeeName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to assign employee');
      }

      await fetchData();
    } catch (err: any) {
      console.error('Error assigning employee:', err);
      throw err;
    }
  };

  // Prospects handlers
  const handleCreateProspect = async () => {
    if (!prospectForm.name || !prospectForm.email || !prospectForm.company) {
      setError('Name, email, and company are required');
      return;
    }

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/creative/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: prospectForm.name,
          email: prospectForm.email,
          company: prospectForm.company,
          phone: prospectForm.phone,
          notes: prospectForm.notes,
          status: 'prospect',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create prospect');
      }

      setProspectDialogOpen(false);
      setProspectForm({ name: '', email: '', company: '', phone: '', notes: '' });
      await fetchData();
      setSuccess('Prospect created successfully');
    } catch (err: any) {
      console.error('Error creating prospect:', err);
      setError(err.message || 'Failed to create prospect');
    }
  };

  const handleEditProspect = (prospect: Client) => {
    setEditingProspect(prospect);
    setProspectForm({
      name: prospect.name,
      email: prospect.email,
      company: prospect.company,
      phone: prospect.phone || '',
      notes: prospect.notes || '',
    });
    setProspectDialogOpen(true);
  };

  const handleUpdateProspect = async () => {
    if (!editingProspect || !prospectForm.name || !prospectForm.email || !prospectForm.company) {
      setError('Name, email, and company are required');
      return;
    }

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/creative/clients/${editingProspect.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: prospectForm.name,
          email: prospectForm.email,
          company: prospectForm.company,
          phone: prospectForm.phone,
          notes: prospectForm.notes,
          status: 'prospect',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update prospect');
      }

      setProspectDialogOpen(false);
      setEditingProspect(null);
      setProspectForm({ name: '', email: '', company: '', phone: '', notes: '' });
      await fetchData();
      setSuccess('Prospect updated successfully');
    } catch (err: any) {
      console.error('Error updating prospect:', err);
      setError(err.message || 'Failed to update prospect');
    }
  };

  const handleSendEmail = async (prospect: Client) => {
    // TODO: Implement email sending functionality
    alert(`Send email to ${prospect.email} - Feature coming soon`);
  };

  const handleSendNotification = async (prospect: Client) => {
    // TODO: Implement notification sending functionality
    alert(`Send notification to ${prospect.name} - Feature coming soon`);
  };

  const uniqueEmployees = Array.from(
    new Set(clients.filter(c => c.assignedEmployee).map(c => c.assignedEmployee))
  ) as string[];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess(null)} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Section 1: Prospects */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <TrendingUpIcon color="primary" sx={{ fontSize: 32 }} />
                  <Box>
                    <Typography variant="h5" fontWeight={700}>
                      Prospects
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      People we need to keep prospecting with email and notifications to finish checkout
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => {
                    setEditingProspect(null);
                    setProspectForm({ name: '', email: '', company: '', phone: '', notes: '' });
                    setProspectDialogOpen(true);
                  }}
                >
                  Add Prospect
                </Button>
              </Stack>

              {prospects.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center' }}>
                  <TrendingUpIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No prospects yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Add prospects to track and nurture potential clients
                  </Typography>
                </Paper>
              ) : (
                <Grid container spacing={2}>
                  {prospects.map((prospect) => (
                    <Grid item xs={12} sm={6} md={4} key={prospect.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Stack direction="row" justifyContent="space-between" alignItems="start" sx={{ mb: 1 }}>
                            <Box>
                              <Typography variant="h6">{prospect.name}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {prospect.company}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {prospect.email}
                              </Typography>
                            </Box>
                            <Chip label="Prospect" size="small" color="warning" />
                          </Stack>
                          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleEditProspect(prospect)}
                              color="primary"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleSendEmail(prospect)}
                              color="info"
                            >
                              <EmailIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleSendNotification(prospect)}
                              color="secondary"
                            >
                              <NotificationsIcon />
                            </IconButton>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Section 2: Client List */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <BusinessIcon color="primary" sx={{ fontSize: 32 }} />
                  <Typography variant="h5" fontWeight={700}>
                    Client List
                  </Typography>
                </Stack>
                <Button
                  variant="contained"
                  startIcon={<PersonAddIcon />}
                  onClick={() => {
                    if (onAddClient) {
                      onAddClient();
                    } else {
                      setAddClientDialogOpen(true);
                    }
                  }}
                >
                  Add Client
                </Button>
              </Stack>

              {/* Filters */}
              <Paper sx={{ p: 2, mb: 3 }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search clients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={statusFilter}
                      label="Status"
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <MenuItem value="all">All Status</MenuItem>
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="prospect">Prospect</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <InputLabel>Employee</InputLabel>
                    <Select
                      value={employeeFilter}
                      label="Employee"
                      onChange={(e) => setEmployeeFilter(e.target.value)}
                    >
                      <MenuItem value="all">All Employees</MenuItem>
                      <MenuItem value="unassigned">Unassigned</MenuItem>
                      {uniqueEmployees.map((emp) => (
                        <MenuItem key={emp} value={emp}>
                          {emp}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Paper>

              {/* Client Table */}
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700 }}>Client Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Assigned To</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Systems Connected</TableCell>
                      <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {clients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            No clients found. Click "Add Client" to get started.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      clients.map((client) => (
                        <TableRow key={client.id} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {client.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {client.company}
                            </Typography>
                          </TableCell>
                          <TableCell>{client.email}</TableCell>
                          <TableCell>
                            <Chip
                              label={client.status}
                              size="small"
                              color={
                                client.status === 'active'
                                  ? 'success'
                                  : client.status === 'pending' || client.status === 'prospect'
                                  ? 'warning'
                                  : 'default'
                              }
                            />
                          </TableCell>
                          <TableCell>
                            {client.assignedEmployee || (
                              <Chip label="Unassigned" size="small" variant="outlined" />
                            )}
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={0.5} flexWrap="wrap">
                              {client.systemsConnected.map((system) => (
                                <Chip
                                  key={system}
                                  label={system}
                                  size="small"
                                  variant="outlined"
                                />
                              ))}
                            </Stack>
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuOpen(e, client)}
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
            </CardContent>
          </Card>
        </Grid>

        {/* Section 3: Match Clients & Employees */}
        <Grid item xs={12}>
          <Card elevation={2}>
            <CardContent>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <AssignmentIcon color="primary" sx={{ fontSize: 32 }} />
                <Typography variant="h5" fontWeight={700}>
                  Match Clients & Employees
                </Typography>
              </Stack>

              <Grid container spacing={3}>
                {/* Client Selection */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                        <BusinessIcon color="primary" />
                        <Typography variant="h6">Select Client</Typography>
                      </Stack>
                      <FormControl fullWidth>
                        <InputLabel>Client</InputLabel>
                        <Select
                          value={selectedClient}
                          onChange={(e) => setSelectedClient(e.target.value)}
                          label="Client"
                        >
                          <MenuItem value="">
                            <em>Select a client...</em>
                          </MenuItem>
                          {clients.map((client) => (
                            <MenuItem key={client.id} value={client.id}>
                              <Box>
                                <Typography variant="body1">{client.name}</Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {client.company} • {client.email}
                                </Typography>
                                {client.assignedEmployee && (
                                  <Chip
                                    label={`Assigned to: ${client.assignedEmployee}`}
                                    size="small"
                                    color="info"
                                    sx={{ mt: 0.5 }}
                                  />
                                )}
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {clients.find(c => c.id === selectedClient) && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Selected Client:
                          </Typography>
                          <Typography variant="body1" fontWeight={600}>
                            {clients.find(c => c.id === selectedClient)?.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {clients.find(c => c.id === selectedClient)?.company}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Employee Selection */}
                <Grid item xs={12} md={6}>
                  <Card variant="outlined">
                    <CardContent>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                        <PeopleIcon color="secondary" />
                        <Typography variant="h6">Select Employee</Typography>
                      </Stack>
                      <FormControl fullWidth>
                        <InputLabel>Employee</InputLabel>
                        <Select
                          value={selectedEmployee || ''}
                          onChange={(e) => setSelectedEmployee(e.target.value ? Number(e.target.value) : null)}
                          label="Employee"
                        >
                          <MenuItem value="">
                            <em>Select an employee...</em>
                          </MenuItem>
                          {employees.map((employee) => (
                            <MenuItem key={employee.id} value={employee.id}>
                              <Box>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Typography variant="body1">{employee.name}</Typography>
                                  {employee.is_admin && (
                                    <Chip label="Admin" size="small" color="error" />
                                  )}
                                </Stack>
                                <Typography variant="caption" color="text.secondary">
                                  {employee.email}
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {employees.find(e => e.id === selectedEmployee) && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Selected Employee:
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Typography variant="body1" fontWeight={600}>
                              {employees.find(e => e.id === selectedEmployee)?.name}
                            </Typography>
                            {employees.find(e => e.id === selectedEmployee)?.is_admin && (
                              <Chip label="Admin" size="small" color="error" />
                            )}
                          </Stack>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Assignment Action */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={fetchData}
                  disabled={assigning}
                >
                  Refresh Lists
                </Button>
                <Button
                  variant="contained"
                  startIcon={assigning ? <CircularProgress size={20} /> : <CheckCircleIcon />}
                  onClick={handleAssign}
                  disabled={!selectedClient || !selectedEmployee || assigning}
                  size="large"
                >
                  {assigning ? 'Assigning...' : 'Assign Employee to Client'}
                </Button>
              </Box>

              {/* Current Assignments Summary */}
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>
                  Current Assignments
                </Typography>
                <Grid container spacing={2}>
                  {clients
                    .filter((c) => c.assignedEmployee)
                    .map((client) => (
                      <Grid item xs={12} sm={6} md={4} key={client.id}>
                        <Card variant="outlined">
                          <CardContent>
                            <Typography variant="body1" fontWeight={600}>
                              {client.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {client.company}
                            </Typography>
                            <Chip
                              label={`→ ${client.assignedEmployee}`}
                              size="small"
                              color="primary"
                              sx={{ mt: 1 }}
                            />
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  {clients.filter((c) => c.assignedEmployee).length === 0 && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                        No assignments yet. Use the form above to assign employees to clients.
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
              
              {/* Employee Management Section (Admin Only) */}
              {isAdmin && (
                <>
                  <Divider sx={{ my: 4 }} />
                  <Box>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                      <AdminPanelSettingsIcon color="primary" sx={{ fontSize: 28 }} />
                      <Typography variant="h6" fontWeight={700}>
                        Employee Management (Admin Only)
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Manage employee status for users. Employees have access to the Creative Dashboard and can be assigned to clients.
                    </Typography>
                    
                    {userError && (
                      <Alert severity="error" sx={{ mb: 2 }} onClose={() => setUserError(null)}>
                        {userError}
                      </Alert>
                    )}
                    
                    {loadingUsers ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <CircularProgress />
                      </Box>
                    ) : allUsers.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        No users found.
                      </Typography>
                    ) : (
                      <Grid container spacing={2}>
                        {allUsers.map((usr: any) => (
                          <Grid item xs={12} sm={6} md={4} key={usr.id || usr.user_id}>
                            <Card variant="outlined">
                              <CardContent>
                                <Stack spacing={2}>
                                  <Box>
                                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                      {usr.name || usr.username || usr.email || 'Unknown User'}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      {usr.ensName || usr.id} {usr.email && `• ${usr.email}`}
                                    </Typography>
                                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                      {usr.isAdmin && (
                                        <Chip label="Admin" color="error" size="small" />
                                      )}
                                      {usr.isEmployee && (
                                        <Chip label="Employee" color="secondary" size="small" />
                                      )}
                                      {usr.isPaidMember && (
                                        <Chip label="Paid Member" color="success" size="small" variant="outlined" />
                                      )}
                                    </Stack>
                                  </Box>
                                  <Divider />
                                  <Stack spacing={1}>
                                    <FormControlLabel
                                      control={
                                        <Switch
                                          checked={usr.isAdmin || false}
                                          onChange={() => toggleAdminStatus(usr.id || usr.user_id, usr.isAdmin || false)}
                                          disabled={usr.id === user?.id || usr.username === user?.username}
                                          size="small"
                                        />
                                      }
                                      label="Admin"
                                    />
                                    <FormControlLabel
                                      control={
                                        <Switch
                                          checked={usr.isEmployee || false}
                                          onChange={() => toggleEmployeeStatus(usr.id || usr.user_id, usr.isEmployee || false)}
                                          disabled={usr.isAdmin}
                                          size="small"
                                        />
                                      }
                                      label={usr.isEmployee ? 'Employee: On' : 'Employee: Off'}
                                    />
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      startIcon={<VpnKeyIcon />}
                                      onClick={() => handleOpenPasswordDialog(usr)}
                                      fullWidth
                                    >
                                      Change Password
                                    </Button>
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      color="error"
                                      startIcon={<DeleteIcon />}
                                      onClick={() => handleOpenDeleteDialog(usr)}
                                      fullWidth
                                      disabled={usr.id === user?.id || usr.username === user?.username}
                                    >
                                      Delete User
                                    </Button>
                                  </Stack>
                                </Stack>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    )}
                    
                    <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                      <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={fetchAllUsers}
                        disabled={loadingUsers}
                      >
                        {loadingUsers ? 'Loading...' : 'Refresh Users'}
                      </Button>
                      <Button
                        variant="contained"
                        startIcon={<AssignmentIcon />}
                        onClick={() => setAdminAssignDialogOpen(true)}
                        disabled={loadingUsers}
                      >
                        Manage Client Assignments
                      </Button>
                    </Stack>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Actions Menu */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>
          <VisibilityIcon sx={{ mr: 1, fontSize: 20 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1, fontSize: 20 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleAssignEmployee}>
          <PersonAddIcon sx={{ mr: 1, fontSize: 20 }} />
          Assign Employee
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Dialogs */}
      <AddClientDialog
        open={addClientDialogOpen}
        onClose={() => {
          setAddClientDialogOpen(false);
          fetchData();
        }}
      />

      <EditClientDialog
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedClientForAction(null);
          setIsViewMode(false);
          fetchData();
        }}
        client={selectedClientForAction}
        onSave={() => fetchData()}
        readOnly={isViewMode}
      />

      <AssignEmployeeDialog
        open={assignDialogOpen}
        onClose={() => {
          setAssignDialogOpen(false);
          setSelectedClientForAction(null);
        }}
        clientId={selectedClientForAction?.id || ''}
        clientName={selectedClientForAction?.name || ''}
        currentEmployee={selectedClientForAction?.assignedEmployee}
        onAssign={handleEmployeeAssign}
      />

      {/* Admin Client Assignment Dialog */}
      {isAdmin && (
        <AdminClientAssignmentDialog
          open={adminAssignDialogOpen}
          onClose={() => setAdminAssignDialogOpen(false)}
          currentUser={user}
          isAdminView={isAdmin}
        />
      )}
      
      {/* Delete User Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDeleteDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1} alignItems="center">
              <WarningIcon color="error" />
              <Typography variant="h6">Delete User</Typography>
            </Stack>
            <Button onClick={handleCloseDeleteDialog} size="small" sx={{ minWidth: 'auto' }}>
              <CloseIcon />
            </Button>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedUserForDelete && (
            <>
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight={600}>
                  This action cannot be undone!
                </Typography>
                <Typography variant="body2">
                  Deleting this user will permanently remove their account and all associated data.
                </Typography>
              </Alert>
              <Box sx={{ mb: 3 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  User to delete:
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {selectedUserForDelete.name || selectedUserForDelete.username || selectedUserForDelete.email}
                </Typography>
                {selectedUserForDelete.email && (
                  <Typography variant="body2" color="text.secondary">
                    {selectedUserForDelete.email}
                  </Typography>
                )}
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  {selectedUserForDelete.isAdmin && (
                    <Chip label="Admin" color="error" size="small" />
                  )}
                  {selectedUserForDelete.isEmployee && (
                    <Chip label="Employee" color="secondary" size="small" />
                  )}
                </Stack>
              </Box>
            </>
          )}
          
          {deleteError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setDeleteError(null)}>
              {deleteError}
            </Alert>
          )}
          
          <Typography variant="body2" color="text.secondary">
            Are you sure you want to delete this user? This will permanently delete:
          </Typography>
          <Box component="ul" sx={{ mt: 1, pl: 2 }}>
            <Typography component="li" variant="body2" color="text.secondary">
              User account and profile
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              All client assignments
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              All notifications
            </Typography>
            <Typography component="li" variant="body2" color="text.secondary">
              All subscriptions
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} disabled={deleting}>
            Cancel
          </Button>
          <Button
            onClick={handleDeleteUser}
            variant="contained"
            color="error"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {deleting ? 'Deleting...' : 'Delete User'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={handleClosePasswordDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1} alignItems="center">
              <VpnKeyIcon />
              <Typography variant="h6">Change Password</Typography>
            </Stack>
            <Button onClick={handleClosePasswordDialog} size="small" sx={{ minWidth: 'auto' }}>
              <CloseIcon />
            </Button>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedUserForPassword && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Changing password for:
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {selectedUserForPassword.name || selectedUserForPassword.username || selectedUserForPassword.email}
              </Typography>
              {selectedUserForPassword.email && (
                <Typography variant="body2" color="text.secondary">
                  {selectedUserForPassword.email}
                </Typography>
              )}
            </Box>
          )}
          
          {passwordError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPasswordError(null)}>
              {passwordError}
            </Alert>
          )}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              type="password"
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 6 characters)"
              disabled={changingPassword}
              helperText="Password must be at least 6 characters long"
            />
            <TextField
              fullWidth
              type="password"
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              disabled={changingPassword}
              error={confirmPassword !== '' && newPassword !== confirmPassword}
              helperText={confirmPassword !== '' && newPassword !== confirmPassword ? 'Passwords do not match' : ''}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog} disabled={changingPassword}>
            Cancel
          </Button>
          <Button
            onClick={handleChangePassword}
            variant="contained"
            disabled={changingPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 6}
            startIcon={changingPassword ? <CircularProgress size={20} /> : <VpnKeyIcon />}
          >
            {changingPassword ? 'Changing...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Prospect Dialog */}
      <Dialog open={prospectDialogOpen} onClose={() => setProspectDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingProspect ? 'Edit Prospect' : 'Add New Prospect'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Name"
              value={prospectForm.name}
              onChange={(e) => setProspectForm({ ...prospectForm, name: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Email"
              type="email"
              value={prospectForm.email}
              onChange={(e) => setProspectForm({ ...prospectForm, email: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Company"
              value={prospectForm.company}
              onChange={(e) => setProspectForm({ ...prospectForm, company: e.target.value })}
              fullWidth
              required
            />
            <TextField
              label="Phone"
              value={prospectForm.phone}
              onChange={(e) => setProspectForm({ ...prospectForm, phone: e.target.value })}
              fullWidth
            />
            <TextField
              label="Notes"
              value={prospectForm.notes}
              onChange={(e) => setProspectForm({ ...prospectForm, notes: e.target.value })}
              fullWidth
              multiline
              rows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setProspectDialogOpen(false);
            setEditingProspect(null);
            setProspectForm({ name: '', email: '', company: '', phone: '', notes: '' });
          }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={editingProspect ? handleUpdateProspect : handleCreateProspect}
          >
            {editingProspect ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
