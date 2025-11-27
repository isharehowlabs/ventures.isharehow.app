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

// Mock data - replace with API call
const mockClients: Client[] = [
  {
    id: '1',
    name: 'Example Inc.',
    email: 'info@example.com',
    company: 'Example Inc.',
    status: 'active',
    systemsConnected: ['CRM', 'Analytics'],
    assignedEmployee: 'John Doe',
    tags: ['Enterprise'],
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    name: 'Beta Corp.',
    email: 'hello@beta.com',
    company: 'Beta Corp.',
    status: 'inactive',
    systemsConnected: ['Marketing'],
    tags: ['SMB'],
    createdAt: '2024-02-20',
  },
  {
    id: '3',
    name: 'Kabloom LLC.',
    email: 'kabloomplants@gmail.com',
    company: 'Kabloom LLC.',
    status: 'active',
    systemsConnected: ['CRM', 'Dashboards', 'Analytics'],
    assignedEmployee: 'Jane Smith',
    tags: ['Venture Partnership'],
    createdAt: '2024-03-10',
  },
];

interface ClientListProps {
  onAddClient: () => void;
}

export default function ClientList({ onAddClient }: ClientListProps) {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [employeeFilter, setEmployeeFilter] = useState<string>('all');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

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

  const handleDelete = () => {
    if (selectedClient) {
      setClients(clients.filter(c => c.id !== selectedClient.id));
    }
    handleMenuClose();
  };

  const handleAssignEmployee = () => {
    // Open employee assignment dialog
    handleMenuClose();
  };

  const filteredClients = clients.filter(client => {
    const matchesSearch =
      !searchQuery ||
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.company.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    const matchesEmployee =
      employeeFilter === 'all' ||
      (employeeFilter === 'unassigned' && !client.assignedEmployee) ||
      client.assignedEmployee === employeeFilter;

    return matchesSearch && matchesStatus && matchesEmployee;
  });

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
            {filteredClients.length === 0 ? (
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
    </Box>
  );
}

