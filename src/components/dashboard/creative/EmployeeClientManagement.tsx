'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Stack,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
} from '@mui/material';
import {
  AdminPanelSettings as AdminPanelSettingsIcon,
  Assignment as AssignmentIcon,
  Refresh,
  VpnKey as VpnKeyIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { getBackendUrl } from '../../../utils/backendUrl';
import AdminClientAssignmentDialog from './AdminClientAssignmentDialog';
import { useAuth } from '../../../hooks/useAuth';

export default function EmployeeClientManagement() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<any[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [employeeError, setEmployeeError] = useState<string | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    setEmployeeError(null);
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/admin/users`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.users || []);
      } else {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        setEmployeeError(errorData.error || `Failed to load users (${response.status})`);
      }
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      setEmployeeError(error.message || 'Failed to load users');
    } finally {
      setLoadingEmployees(false);
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
        fetchEmployees();
      } else {
        const errorData = await response.json();
        setEmployeeError(errorData.error || 'Failed to update employee status');
      }
    } catch (error: any) {
      setEmployeeError(error.message || 'Failed to update employee status');
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
        fetchEmployees();
      } else {
        const errorData = await response.json();
        setEmployeeError(errorData.error || 'Failed to update admin status');
      }
    } catch (error: any) {
      setEmployeeError(error.message || 'Failed to update admin status');
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

  // Check if user is admin
  const isAdmin = user?.isAdmin || false;

  if (!isAdmin) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 3 }}>
          Authentication required. Admin access only.
        </Alert>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h6" gutterBottom>
            Employee & Client Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This section is only accessible to administrators.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box>
      {/* Employee Management Section */}
      <Paper elevation={3} sx={{ p: 4, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <AdminPanelSettingsIcon sx={{ color: 'primary.main', fontSize: 32 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Employee Management
          </Typography>
        </Stack>
        <Divider sx={{ mb: 3 }} />
        
        {employeeError && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setEmployeeError(null)}>
            {employeeError}
          </Alert>
        )}
        
        <Typography variant="body1" sx={{ mb: 3 }}>
          Manage employee status for users. Employees have access to the Creative Dashboard and can be assigned to clients.
        </Typography>
        
        {loadingEmployees ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : employees.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No users found.
          </Typography>
        ) : (
          <Stack spacing={2}>
            {employees.map((emp: any) => (
              <Paper key={emp.id} variant="outlined" sx={{ p: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      {emp.name || emp.username || emp.email || 'Unknown User'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {emp.ensName || emp.id} {emp.email && `• ${emp.email}`}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      {emp.isAdmin && (
                        <Chip label="Admin" color="error" size="small" />
                      )}
                      {emp.isEmployee && (
                        <Chip label="Employee" color="secondary" size="small" />
                      )}
                      {emp.isPaidMember && (
                        <Chip label="Paid Member" color="success" size="small" variant="outlined" />
                      )}
                    </Stack>
                  </Box>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={emp.isAdmin || false}
                          onChange={() => toggleAdminStatus(emp.id || emp.user_id, emp.isAdmin || false)}
                          disabled={emp.id === user?.id || emp.username === user?.username}
                        />
                      }
                      label="Admin"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={emp.isEmployee || false}
                          onChange={() => toggleEmployeeStatus(emp.id || emp.user_id, emp.isEmployee || false)}
                          disabled={emp.isAdmin}
                        />
                      }
                      label={emp.isEmployee ? 'Employee' : 'Not Employee'}
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleOpenPasswordDialog(emp)}
                      sx={{ ml: 2 }}
                    >
                      Change Password
                    </Button>
                  </Stack>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
        
        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={fetchEmployees}
            disabled={loadingEmployees}
          >
            {loadingEmployees ? 'Loading...' : 'Refresh List'}
          </Button>
          <Button
            variant="contained"
            startIcon={<AssignmentIcon />}
            onClick={() => setAssignDialogOpen(true)}
            disabled={loadingEmployees}
          >
            Manage Client Assignments
          </Button>
        </Stack>
      </Paper>
      
      {/* Client Assignment Management Section */}
      <Paper elevation={3} sx={{ p: 4 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <AssignmentIcon sx={{ color: 'primary.main', fontSize: 32 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Client Assignment Management
          </Typography>
        </Stack>
        <Divider sx={{ mb: 3 }} />
        <Typography variant="body1" sx={{ mb: 3 }}>
          Assign clients to employees. Admins can reassign any client to any employee. Employees can view their assigned clients.
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            startIcon={<AssignmentIcon />}
            onClick={() => setAssignDialogOpen(true)}
          >
            Open Assignment Dialog
          </Button>
        </Stack>
      </Paper>
      
      {/* Admin Client Assignment Dialog */}
      <AdminClientAssignmentDialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        currentUser={user}
        isAdminView={isAdmin}
      />
      
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
    </Box>
  );
}

