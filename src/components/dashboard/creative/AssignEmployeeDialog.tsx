'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import { getBackendUrl } from '../../../utils/backendUrl';

interface Employee {
  id: number;
  name: string;
  email: string;
}

interface AssignEmployeeDialogProps {
  open: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
  currentEmployee?: string;
  onAssign: (employeeId: number | null, employeeName: string | null) => Promise<void>;
}

export default function AssignEmployeeDialog({
  open,
  onClose,
  clientId,
  clientName,
  currentEmployee,
  onAssign,
}: AssignEmployeeDialogProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [customName, setCustomName] = useState<string>('');
  const [useCustomName, setUseCustomName] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [fetchingEmployees, setFetchingEmployees] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch employees when dialog opens
  useEffect(() => {
    if (open) {
      fetchEmployees();
      // Set custom name if current employee is not in list
      if (currentEmployee) {
        setCustomName(currentEmployee);
        setUseCustomName(true);
      }
    } else {
      // Reset state when dialog closes
      setSelectedEmployee(null);
      setCustomName('');
      setUseCustomName(false);
      setError(null);
    }
  }, [open, currentEmployee]);

  const fetchEmployees = async () => {
    setFetchingEmployees(true);
    setError(null);
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/creative/employees`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }

      const data = await response.json();
      setEmployees(data.employees || []);

      // Try to find current employee in the list
      if (currentEmployee && data.employees) {
        const found = data.employees.find(
          (emp: Employee) => emp.name === currentEmployee || emp.email === currentEmployee
        );
        if (found) {
          setSelectedEmployee(found);
          setUseCustomName(false);
        }
      }
    } catch (err: any) {
      console.error('Error fetching employees:', err);
      setError(err.message || 'Failed to load employees');
    } finally {
      setFetchingEmployees(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const employeeId = useCustomName ? null : selectedEmployee?.id || null;
      const employeeName = useCustomName ? customName.trim() : selectedEmployee?.name || null;

      if (!employeeName && !employeeId) {
        setError('Please select an employee or enter a custom name');
        setLoading(false);
        return;
      }

      await onAssign(employeeId, employeeName);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to assign employee');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async () => {
    setLoading(true);
    setError(null);

    try {
      await onAssign(null, null);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to remove employee assignment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Assign Employee to {clientName}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {fetchingEmployees ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <FormControl fullWidth>
                <InputLabel>Assignment Type</InputLabel>
                <Select
                  value={useCustomName ? 'custom' : 'employee'}
                  onChange={(e) => setUseCustomName(e.target.value === 'custom')}
                  label="Assignment Type"
                >
                  <MenuItem value="employee">Select from Employees</MenuItem>
                  <MenuItem value="custom">Enter Custom Name</MenuItem>
                </Select>
              </FormControl>

              {useCustomName ? (
                <TextField
                  fullWidth
                  label="Employee Name"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Enter employee name"
                  helperText="Use this for external employees or contractors"
                />
              ) : (
                <Autocomplete
                  options={employees}
                  getOptionLabel={(option) => `${option.name} (${option.email})`}
                  value={selectedEmployee}
                  onChange={(_, newValue) => setSelectedEmployee(newValue)}
                  loading={fetchingEmployees}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Employee"
                      placeholder="Search employees..."
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      <Stack>
                        <Typography variant="body1">{option.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.email}
                        </Typography>
                      </Stack>
                    </Box>
                  )}
                />
              )}
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        {currentEmployee && (
          <Button
            onClick={handleRemove}
            color="error"
            disabled={loading}
          >
            Remove Assignment
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading || (useCustomName ? !customName.trim() : !selectedEmployee)}
        >
          {loading ? <CircularProgress size={20} /> : 'Assign'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

