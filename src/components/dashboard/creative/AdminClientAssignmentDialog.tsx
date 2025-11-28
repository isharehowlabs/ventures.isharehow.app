'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Box,
  Typography,
} from '@mui/material';
import { getBackendUrl } from '../../../utils/backendUrl';

interface Employee {
  id: number;
  name: string;
  email: string;
  is_admin?: boolean;
}

interface Client {
  id: string;
  name: string;
  email: string;
  company: string;
  assignedEmployee?: string;
  assignedEmployeeId?: number;
}

interface AdminClientAssignmentDialogProps {
  open: boolean;
  onClose: () => void;
  currentUser: any;
  isAdminView: boolean;
}

export default function AdminClientAssignmentDialog({
  open,
  onClose,
  currentUser,
  isAdminView,
}: AdminClientAssignmentDialogProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [assignChanging, setAssignChanging] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data on mount
  useEffect(() => {
    if (open) {
      fetchData();
    }
  }, [open]);

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
        const errorData = await employeesResponse.json().catch(() => ({ error: `HTTP ${employeesResponse.status}` }));
        throw new Error(errorData.error || `Failed to fetch employees (${employeesResponse.status})`);
      }
      const employeesData = await employeesResponse.json();
      setEmployees(employeesData.employees || []);

      // Fetch clients
      const clientsResponse = await fetch(`${backendUrl}/api/creative/clients`, {
        credentials: 'include',
      });
      if (!clientsResponse.ok) {
        const errorData = await clientsResponse.json().catch(() => ({ error: `HTTP ${clientsResponse.status}` }));
        throw new Error(errorData.error || `Failed to fetch clients (${clientsResponse.status})`);
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

  // Helper for finding employee name
  const findEmployeeName = useCallback(
    (empId: number | string | undefined) => {
      if (!empId) return '(unassigned)';
      const emp = employees.find((e) => e.id === Number(empId));
      return emp ? emp.name : '(unassigned)';
    },
    [employees]
  );

  // Handle assignment change
  const handleAssignmentChange = async (clientId: string, employeeId: number | null) => {
    setAssignChanging((changing) => ({ ...changing, [clientId]: true }));
    setError(null);

    try {
      const backendUrl = getBackendUrl();
      
      // Find employee name if employeeId is provided
      let employeeName: string | null = null;
      if (employeeId) {
        const emp = employees.find((e) => e.id === employeeId);
        employeeName = emp ? emp.name : null;
      }

      const response = await fetch(`${backendUrl}/api/creative/clients/${clientId}/assign-employee`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          employee_id: employeeId,
          employee_name: employeeName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to assign employee' }));
        throw new Error(errorData.error || 'Failed to assign employee');
      }

      // Update local state
      setClients((clients) =>
        clients.map((c) =>
          c.id === clientId
            ? {
                ...c,
                assignedEmployee: employeeName || undefined,
                assignedEmployeeId: employeeId || undefined,
              }
            : c
        )
      );
    } catch (err: any) {
      console.error('Error assigning employee:', err);
      setError(err.message || 'Failed to assign employee');
    } finally {
      setAssignChanging((changing) => ({ ...changing, [clientId]: false }));
    }
  };

  // Filter clients based on view type
  const visibleClients = isAdminView
    ? clients
    : clients.filter((c) => {
        if (!currentUser?.id) return false;
        // Check if client is assigned to current user
        return (
          c.assignedEmployeeId === currentUser.id ||
          c.assignedEmployee === currentUser.name ||
          c.assignedEmployee === currentUser.username
        );
      });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isAdminView ? 'Admin Client Assignment' : 'Your Clients'}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Client Name</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Assigned Employee</TableCell>
                {isAdminView && <TableCell>Change Assignment</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>{client.name}</TableCell>
                  <TableCell>{client.company}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>
                    {findEmployeeName(client.assignedEmployeeId)}
                  </TableCell>
                  {isAdminView && (
                    <TableCell>
                      <FormControl variant="standard" size="small" fullWidth>
                        <Select
                          value={client.assignedEmployeeId || ''}
                          onChange={(e) =>
                            handleAssignmentChange(
                              client.id,
                              e.target.value ? Number(e.target.value) : null
                            )
                          }
                          disabled={!!assignChanging[client.id]}
                        >
                          <MenuItem value="">
                            <em>Unassign</em>
                          </MenuItem>
                          {employees.map((emp) => (
                            <MenuItem key={emp.id} value={emp.id}>
                              {emp.name} {emp.is_admin ? '(Admin)' : ''}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      {assignChanging[client.id] && (
                        <CircularProgress size={16} sx={{ ml: 1 }} />
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
              {visibleClients.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={isAdminView ? 5 : 4}
                    align="center"
                    sx={{ py: 4 }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      No client records found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={fetchData} disabled={loading}>
          Refresh
        </Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
