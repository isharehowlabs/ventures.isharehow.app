'use client';

import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Button, TextField, InputAdornment,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination,
  IconButton, Menu, MenuItem, ListItemIcon, ListItemText, Chip, Avatar,
  Dialog, DialogTitle, DialogContent, DialogActions, Grid, FormControl,
  InputLabel, Select, Radio, RadioGroup, FormControlLabel, FormLabel,
  Checkbox, Alert, CircularProgress, Breadcrumbs, Link, Tabs, Tab,
  Switch, Divider, Stack, Autocomplete,
} from '@mui/material';
import {
  Search as SearchIcon, Add as AddIcon, MoreVert as MoreVertIcon,
  Edit as EditIcon, Delete as DeleteIcon, Block as BlockIcon,
  Home as HomeIcon, Person as PersonIcon, CameraAlt as CameraIcon,
  VpnKey as PasswordIcon, Work as WorkIcon, Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../hooks/useAuth';

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
  created_at?: string;
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
  status: 'active' | 'inactive' | 'pending' | 'prospect';
  systemsConnected: string[];
  assignedEmployee?: string;
  assignedEmployeeId?: number;
  tags?: string[];
  createdAt: string;
  phone?: string;
  notes?: string;
}

interface UserRole {
  value: string;
  label: string;
  description: string;
}

const ROLES: UserRole[] = [
  { value: 'super_admin', label: 'Super Admin', description: 'Has full access to all settings, users, and system configurations.' },
  { value: 'admin', label: 'Admin', description: 'Manages users, roles, and system settings with high-level access.' },
  { value: 'engineer', label: 'Engineer', description: 'Handles technical operations, infrastructure, and system maintenance.' },
  { value: 'developer', label: 'Developer', description: 'Develops and maintains applications, features, and integrations.' },
  { value: 'employee', label: 'Employee', description: 'Regular employee with standard access.' },
  { value: 'client', label: 'Client', description: 'External client with limited access.' },
];

const SYSTEMS = ['CRM', 'Analytics', 'Email Marketing', 'Project Management', 'Support Desk', 'Billing'];

export default function ClientEmployeeMatcher() {
  const { user } = useAuth();
  const isAdmin = user?.isAdmin || false;
  
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [assignClientDialogOpen, setAssignClientDialogOpen] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    zipcode: '',
    address: '',
    joiningDate: '',
    status: 'active' as 'active' | 'pending' | 'blocked' | 'reported',
    role: 'employee',
    isEmployee: false,
    isAdmin: false,
    isClient: false,
    systemsConnected: [] as string[],
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  // Assignment state
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>([]);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchUsers();
    fetchClients();
  }, []);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/api/admin/users`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
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

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, user: User) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    if (selectedUser) {
      setEditForm({
        firstName: selectedUser.first_name || '',
        lastName: selectedUser.last_name || '',
        username: selectedUser.username || '',
        email: selectedUser.email || '',
        phone: selectedUser.phone || '',
        zipcode: selectedUser.zipcode || '',
        address: selectedUser.address || '',
        joiningDate: selectedUser.joining_date || new Date().toISOString().split('T')[0],
        status: selectedUser.status || 'active',
        role: selectedUser.is_admin ? 'super_admin' : selectedUser.is_employee ? 'employee' : selectedUser.is_client ? 'client' : 'employee',
        isEmployee: selectedUser.is_employee || false,
        isAdmin: selectedUser.is_admin || false,
        isClient: selectedUser.is_client || false,
        systemsConnected: [],
      });
      setEditDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handlePasswordClick = () => {
    setPasswordForm({ newPassword: '', confirmPassword: '' });
    setPasswordDialogOpen(true);
    handleMenuClose();
  };

  const handleAssignClientsClick = () => {
    setSelectedClientIds([]);
    setAssignClientDialogOpen(true);
    handleMenuClose();
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`${backendUrl}/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: editForm.firstName,
          last_name: editForm.lastName,
          username: editForm.username,
          email: editForm.email,
          phone: editForm.phone,
          zipcode: editForm.zipcode,
          address: editForm.address,
          joining_date: editForm.joiningDate,
          status: editForm.status,
          is_admin: editForm.isAdmin,
          is_employee: editForm.isEmployee,
          is_client: editForm.isClient,
        }),
      });

      if (response.ok) {
        setSuccess('User updated successfully');
        fetchUsers();
        setEditDialogOpen(false);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update user');
      }
    } catch (err) {
      setError('Failed to update user');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`${backendUrl}/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        setSuccess('User deleted successfully');
        fetchUsers();
        setDeleteDialogOpen(false);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete user');
      }
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  const handleChangePassword = async () => {
    if (!selectedUser) return;
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/admin/users/${selectedUser.id}/password`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordForm.newPassword }),
      });

      if (response.ok) {
        setSuccess('Password changed successfully');
        setPasswordDialogOpen(false);
        setPasswordForm({ newPassword: '', confirmPassword: '' });
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to change password');
      }
    } catch (err) {
      setError('Failed to change password');
    }
  };

  const handleAssignClients = async () => {
    if (!selectedUser || selectedClientIds.length === 0) return;

    try {
      const response = await fetch(`${backendUrl}/api/admin/users/${selectedUser.id}/assign-clients`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientIds: selectedClientIds }),
      });

      if (response.ok) {
        setSuccess(`Assigned ${selectedClientIds.length} client(s) successfully`);
        setAssignClientDialogOpen(false);
        setSelectedClientIds([]);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to assign clients');
      }
    } catch (err) {
      setError('Failed to assign clients');
    }
  };

  const toggleEmployeeStatus = async (userId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(`${backendUrl}/api/admin/users/${userId}/employee`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isEmployee: !currentStatus }),
      });

      if (response.ok) {
        setSuccess(`Employee status ${!currentStatus ? 'enabled' : 'disabled'}`);
        fetchUsers();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to update employee status');
      }
    } catch (err) {
      setError('Failed to update employee status');
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    return (
      user.username?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.first_name?.toLowerCase().includes(searchLower) ||
      user.last_name?.toLowerCase().includes(searchLower)
    );
  });

  const paginatedUsers = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'blocked': return 'error';
      case 'reported': return 'info';
      default: return 'default';
    }
  };

  const getUserRole = (user: User) => {
    if (user.is_admin) return 'Super Admin';
    if (user.is_employee) return 'Employee';
    if (user.is_client) return 'Client';
    return 'User';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Alerts */}
      {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}
      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}

      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link href="/" color="inherit" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />
          Home
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <PersonIcon sx={{ mr: 0.5, fontSize: 20 }} />
          User Management
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={600}>User Management</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>Add New User</Button>
      </Box>

      {/* Search and Table */}
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box p={2}>
          <TextField
            fullWidth
            placeholder="Search by name, email, or username..."
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
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox"><Checkbox /></TableCell>
                <TableCell>Profile</TableCell>
                <TableCell>Email & Username</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell padding="checkbox"><Checkbox /></TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar src={user.profile_image} sx={{ width: 40, height: 40 }}>
                        {user.first_name?.[0] || user.username?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {user.first_name} {user.last_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">#{user.id}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{user.email}</Typography>
                    <Typography variant="caption" color="text.secondary">{user.username}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label={getUserRole(user)} size="small" color="primary" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{user.address || 'N/A'}</Typography>
                    <Typography variant="caption" color="text.secondary">{user.zipcode || ''}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.status || 'Active'}
                      size="small"
                      color={getStatusColor(user.status)}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, user)}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Action Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleEditClick}>
          <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Edit User</ListItemText>
        </MenuItem>
        <MenuItem onClick={handlePasswordClick}>
          <ListItemIcon><PasswordIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Change Password</ListItemText>
        </MenuItem>
        {selectedUser?.is_employee && (
          <MenuItem onClick={handleAssignClientsClick}>
            <ListItemIcon><AssignmentIcon fontSize="small" /></ListItemIcon>
            <ListItemText>Assign Clients</ListItemText>
          </MenuItem>
        )}
        <Divider />
        <MenuItem onClick={handleDeleteClick}>
          <ListItemIcon><DeleteIcon fontSize="small" color="error" /></ListItemIcon>
          <ListItemText>Delete User</ListItemText>
        </MenuItem>
      </Menu>

      {/* Edit User Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>Edit User</Typography>
          <Typography variant="body2" color="text.secondary">
            Update user settings and permissions
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Box display="flex" justifyContent="center" mb={3}>
            <Box position="relative">
              <Avatar src={selectedUser?.profile_image} sx={{ width: 80, height: 80 }}>
                {editForm.firstName?.[0] || 'U'}
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

          <Typography variant="subtitle2" fontWeight={600} mb={2}>Personal Details</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="First Name"
                required
                value={editForm.firstName}
                onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Last Name"
                required
                value={editForm.lastName}
                onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Username"
                required
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Email"
                required
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Phone"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Joining Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={editForm.joiningDate}
                onChange={(e) => setEditForm({ ...editForm, joiningDate: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Zip/Code"
                value={editForm.zipcode}
                onChange={(e) => setEditForm({ ...editForm, zipcode: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={2}
                value={editForm.address}
                onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
              />
            </Grid>
          </Grid>

          <Typography variant="subtitle2" fontWeight={600} mt={3} mb={2}>Permissions</Typography>
          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={editForm.isAdmin}
                  onChange={(e) => setEditForm({ ...editForm, isAdmin: e.target.checked })}
                />
              }
              label="Admin Access"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={editForm.isEmployee}
                  onChange={(e) => setEditForm({ ...editForm, isEmployee: e.target.checked })}
                />
              }
              label="Employee Status"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={editForm.isClient}
                  onChange={(e) => setEditForm({ ...editForm, isClient: e.target.checked })}
                />
              }
              label="Client Status"
            />
          </Stack>

          <Typography variant="subtitle2" fontWeight={600} mt={3} mb={2}>Status</Typography>
          <RadioGroup
            row
            value={editForm.status}
            onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
          >
            <FormControlLabel value="active" control={<Radio />} label="Active" />
            <FormControlLabel value="pending" control={<Radio />} label="Pending" />
            <FormControlLabel value="reported" control={<Radio />} label="Reported" />
            <FormControlLabel value="blocked" control={<Radio />} label="Blocked" />
          </RadioGroup>

          {editForm.isClient && (
            <>
              <Typography variant="subtitle2" fontWeight={600} mt={3} mb={2}>Systems Connected</Typography>
              <Autocomplete
                multiple
                options={SYSTEMS}
                value={editForm.systemsConnected}
                onChange={(e, newValue) => setEditForm({ ...editForm, systemsConnected: newValue })}
                renderInput={(params) => <TextField {...params} label="Select Systems" />}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateUser}>Update User</Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={() => setPasswordDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Set a new password for {selectedUser?.username}
          </Typography>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            />
            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleChangePassword}>Change Password</Button>
        </DialogActions>
      </Dialog>

      {/* Assign Clients Dialog */}
      <Dialog open={assignClientDialogOpen} onClose={() => setAssignClientDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Assign Clients</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Select clients to assign to {selectedUser?.username}
          </Typography>
          <Autocomplete
            multiple
            options={clients}
            getOptionLabel={(option) => `${option.name} (${option.company})`}
            value={clients.filter(c => selectedClientIds.includes(c.id))}
            onChange={(e, newValue) => setSelectedClientIds(newValue.map(c => c.id))}
            renderInput={(params) => <TextField {...params} label="Select Clients" />}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAssignClientDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAssignClients}>Assign Clients</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Delete User</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Are you sure you want to delete this user? This action cannot be undone.
          </Alert>
          <Typography variant="body2">
            User: <strong>{selectedUser?.username}</strong>
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleDeleteUser}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
