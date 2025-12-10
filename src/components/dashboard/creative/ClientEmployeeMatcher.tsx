'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  Home as HomeIcon,
  Person as PersonIcon,
  CameraAlt as CameraIcon,
} from '@mui/icons-material';

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

interface UserRole {
  value: string;
  label: string;
  description: string;
}

const ROLES: UserRole[] = [
  {
    value: 'super_admin',
    label: 'Super Admin',
    description: 'Has full access to all settings, users, and system configurations.',
  },
  {
    value: 'admin',
    label: 'Admin',
    description: 'Manages users, roles, and system settings with high-level access.',
  },
  {
    value: 'engineer',
    label: 'Engineer',
    description: 'Handles technical operations, infrastructure, and system maintenance.',
  },
  {
    value: 'developer',
    label: 'Developer',
    description: 'Develops and maintains applications, features, and integrations.',
  },
];

export default function ClientEmployeeMatcher() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
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
    role: 'admin',
  });

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${backendUrl}/api/users`, {
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
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
        role: selectedUser.is_admin ? 'super_admin' : 'admin',
      });
      setEditDialogOpen(true);
    }
    handleMenuClose();
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const handleBlockClick = async () => {
    if (selectedUser) {
      // Implement block user logic
      console.log('Block user:', selectedUser.id);
    }
    handleMenuClose();
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`${backendUrl}/api/users/${selectedUser.id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
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
          is_admin: editForm.role === 'super_admin' || editForm.role === 'admin',
        }),
      });

      if (response.ok) {
        fetchUsers();
        setEditDialogOpen(false);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`${backendUrl}/api/users/${selectedUser.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        fetchUsers();
        setDeleteDialogOpen(false);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
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

  const paginatedUsers = filteredUsers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'blocked': return 'error';
      case 'reported': return 'info';
      default: return 'default';
    }
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
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          href="/"
          color="inherit"
          sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />
          Home
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <PersonIcon sx={{ mr: 0.5, fontSize: 20 }} />
          User
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h5" fontWeight={600}>
          User
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {/* Add new user logic */}}
        >
          Add New
        </Button>
      </Box>

      {/* Search and Table */}
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Box p={2}>
          <TextField
            fullWidth
            placeholder="Search here"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox />
                </TableCell>
                <TableCell>Profile</TableCell>
                <TableCell>Email & Username</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUsers.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell padding="checkbox">
                    <Checkbox />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Avatar
                        src={user.profile_image}
                        alt={user.username}
                        sx={{ width: 40, height: 40 }}
                      >
                        {user.first_name?.[0] || user.username?.[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {user.first_name} {user.last_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          #{user.id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{user.email}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.username}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{user.address || 'N/A'}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {user.zipcode || ''}
                    </Typography>
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
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, user)}
                    >
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
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditClick}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteClick}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleBlockClick}>
          <ListItemIcon>
            <BlockIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Block</ListItemText>
        </MenuItem>
      </Menu>

      {/* Edit User Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>
            Edit User
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Extending or new user custom settings and permissions.
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {/* Profile Image */}
          <Box display="flex" justifyContent="center" mb={3}>
            <Box position="relative">
              <Avatar
                src={selectedUser?.profile_image}
                sx={{ width: 80, height: 80 }}
              >
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

          {/* Personal Detail */}
          <Typography variant="subtitle2" fontWeight={600} mb={2}>
            Personal Detail
          </Typography>
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
                label="Contact Us"
                placeholder="US"
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

          {/* Status */}
          <Typography variant="subtitle2" fontWeight={600} mt={3} mb={2}>
            Status
          </Typography>
          <RadioGroup
            row
            value={editForm.status}
            onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })}
          >
            <FormControlLabel value="active" control={<Radio />} label="Active" />
            <FormControlLabel value="pending" control={<Radio />} label="Pending" />
            <FormControlLabel value="reported" control={<Radio />} label="Reported" />
            <FormControlLabel value="blocked" control={<Radio />} label="Block" />
          </RadioGroup>

          {/* Roles */}
          <Typography variant="subtitle2" fontWeight={600} mt={3} mb={2}>
            Roles
          </Typography>
          <RadioGroup
            value={editForm.role}
            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
          >
            {ROLES.map((role) => (
              <Box key={role.value} mb={2}>
                <FormControlLabel
                  value={role.value}
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body2" fontWeight={500}>
                        {role.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {role.description}
                      </Typography>
                    </Box>
                  }
                />
              </Box>
            ))}
          </RadioGroup>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setEditDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleUpdateUser}>
            Update User
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
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
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={handleDeleteUser}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
