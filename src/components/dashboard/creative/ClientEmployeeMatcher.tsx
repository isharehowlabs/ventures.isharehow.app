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
} from '@mui/material';
import {
  Assignment as AssignmentIcon,
  People as PeopleIcon,
  Business as BusinessIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { getBackendUrl } from '../../../utils/backendUrl';

interface Employee {
  id: number;
  name: string;
  email: string;
  is_admin?: boolean;
  is_employee?: boolean;
}

interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  assignedEmployee?: string;
  assignedEmployeeId?: number;
}

interface ClientEmployeeMatcherProps {
  onAssignmentChange?: () => void;
}

export default function ClientEmployeeMatcher({ onAssignmentChange }: ClientEmployeeMatcherProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [selectedEmployee, setSelectedEmployee] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

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

      // Fetch clients
      const clientsResponse = await fetch(`${backendUrl}/api/creative/clients`, {
        credentials: 'include',
      });
      if (!clientsResponse.ok) {
        throw new Error('Failed to fetch clients');
      }
      const clientsData = await clientsResponse.json();
      setClients(clientsData.clients || []);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

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
      
      // Refresh data
      await fetchData();
      
      // Reset selections
      setSelectedClient('');
      setSelectedEmployee(null);
      
      // Notify parent
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

  const selectedClientData = clients.find((c) => c.id === selectedClient);
  const selectedEmployeeData = employees.find((e) => e.id === selectedEmployee);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <AssignmentIcon color="primary" sx={{ fontSize: 32 }} />
        <Typography variant="h5" fontWeight={700}>
          Match Clients & Employees
        </Typography>
      </Stack>

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
              {selectedClientData && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Selected Client:
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {selectedClientData.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedClientData.company}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedClientData.email}
                  </Typography>
                  {selectedClientData.assignedEmployee && (
                    <Chip
                      label={`Currently assigned to: ${selectedClientData.assignedEmployee}`}
                      size="small"
                      color="warning"
                      sx={{ mt: 1 }}
                    />
                  )}
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
              {selectedEmployeeData && (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Selected Employee:
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body1" fontWeight={600}>
                      {selectedEmployeeData.name}
                    </Typography>
                    {selectedEmployeeData.is_admin && (
                      <Chip label="Admin" size="small" color="error" />
                    )}
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {selectedEmployeeData.email}
                  </Typography>
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
    </Paper>
  );
}
