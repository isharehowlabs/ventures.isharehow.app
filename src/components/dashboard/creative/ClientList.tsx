'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Select,
  FormControl,
  InputLabel,
  Button,
  Stack,
  Tooltip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';

export interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  status: 'active' | 'inactive' | 'pending';
  systemsConnected: string[];
  assignedEmployee?: string;
  tags?: string[];
  createdAt: string;
}

import { getBackendUrl } from '../../../utils/backendUrl';
import { useEffect } from 'react';
import AssignEmployeeDialog from './AssignEmployeeDialog';

interface ClientListProps {
  onAddClient: () => void;
}

export default function ClientList({ onAddClient }: ClientListProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);

  // Fetch clients from API
  useEffect(() => {
    fetchClients();
  }, [statusFilter, employeeFilter, searchQuery]);

  const fetchClients = async () => {
    setLoading(true);
    setError(null);
    try {
      const backendUrl = getBackendUrl();
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

      const response = await fetch(`${backendUrl}/api/creative/clients?${params.toString()}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }

      const data = await response.json();
      
      // Filter unassigned clients if needed
      let filteredClients = data.clients || [];
      if (employeeFilter === 'unassigned') {
        filteredClients = filteredClients.filter((c: Client) => !c.assignedEmployee);
      }

      setClients(filteredClients);
    } catch (err: any) {
      console.error('Error fetching clients:', err);
      setError(err.message || 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, client: Client) => {
    setAnchorEl(event.currentTarget);
    setSelectedClient(client);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedClient(null);
  };

  const handleView = () => {
    // Navigate to client details
    handleMenuClose();
  };

  const handleEdit = () => {
    // Open edit dialog
    handleMenuClose();
  };

  const handleDelete = async () => {
    if (!selectedClient) {
      handleMenuClose();
      return;
    }

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/creative/clients/${selectedClient.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete client');
      }

      // Refresh client list
      await fetchClients();
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
    if (!selectedClient) return;

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/creative/clients/${selectedClient.id}/assign-employee`, {
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

      // Refresh client list
      await fetchClients();
    } catch (err: any) {
      console.error('Error assigning employee:', err);
      throw err;
    }
  };

  // Clients are already filtered by API, but we can do additional client-side filtering if needed
  const filteredClients = clients;

  const uniqueEmployees = Array.from(
    new Set(clients.filter(c => c.assignedEmployee).map(c => c.assignedEmployee))
  ) as string[];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h5" fontWeight={700}>
          Client List
        </Typography>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={onAddClient}
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Client Table */}
      <TableContainer component={Paper}>
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : filteredClients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No clients found. Click "Add Client" to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredClients.map((client) => (
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
                          : client.status === 'pending'
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

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
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

      {/* Assign Employee Dialog */}
      <AssignEmployeeDialog
        open={assignDialogOpen}
        onClose={() => {
          setAssignDialogOpen(false);
          setSelectedClient(null);
        }}
        clientId={selectedClient?.id || ''}
        clientName={selectedClient?.name || ''}
        currentEmployee={selectedClient?.assignedEmployee}
        onAssign={handleEmployeeAssign}
      />
    </Box>
  );
}

