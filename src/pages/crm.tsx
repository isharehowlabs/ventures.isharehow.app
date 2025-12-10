'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Card,
  CardContent,
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
  FormControl,
  InputLabel,
  Select,
  Checkbox,
  Alert,
  CircularProgress,
  Stack,
  Autocomplete,
  Divider,
  useTheme,
  alpha,
  LinearProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  ShoppingCart as ShoppingCartIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  VpnKey as PasswordIcon,
  Refresh as RefreshIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import AppShell from '../components/AppShell';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { useAuth } from '../hooks/useAuth';
import { getBackendUrl } from '../utils/backendUrl';
import EditUserDialog from '../components/dashboard/creative/EditUserDialog';
import AddClientDialog from '../components/dashboard/creative/AddClientDialog';

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
  shopify_customer_id?: string;
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
  tier?: string;
  marketingBudget?: string;
}

interface ShopifyCustomer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  totalSpent: number;
  ordersCount: number;
  createdAt: string;
  tags?: string[];
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`crm-tabpanel-${index}`}
      aria-labelledby={`crm-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function CRMDashboard() {
  const theme = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [shopifyCustomers, setShopifyCustomers] = useState<ShopifyCustomer[]>([]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'prospect' | 'inactive'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'client' | 'prospect' | 'lead'>('all');

  // Pagination
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Dialogs
  const [addClientOpen, setAddClientOpen] = useState(false);
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuType, setMenuType] = useState<'user' | 'client' | null>(null);

  const backendUrl = getBackendUrl();

  // Fetch all data
  useEffect(() => {
    fetchAllData();
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

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUsers(),
        fetchClients(),
        fetchShopifyCustomers(),
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/admin/users`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
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

  const fetchShopifyCustomers = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/shopify/customers`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setShopifyCustomers(data.customers || []);
      } else {
        // If endpoint doesn't exist, set empty array
        setShopifyCustomers([]);
      }
    } catch (err) {
      console.error('Error fetching Shopify customers:', err);
      setShopifyCustomers([]);
    }
  };

  // Calculate stats
  const totalUsers = users.length;
  const totalClients = clients.filter(c => c.status === 'active' || c.status === 'pending').length;
  const totalProspects = clients.filter(c => c.status === 'prospect').length;
  const totalShopifyCustomers = shopifyCustomers.length;
  const activeEmployees = users.filter(u => u.is_employee && u.status === 'active').length;

  // Filter data based on active tab
  const getFilteredData = () => {
    const searchLower = searchQuery.toLowerCase();
    
    if (activeTab === 0) {
      // Users tab
      return users.filter(user => {
        const matchesSearch = 
          user.username?.toLowerCase().includes(searchLower) ||
          user.email?.toLowerCase().includes(searchLower) ||
          user.first_name?.toLowerCase().includes(searchLower) ||
          user.last_name?.toLowerCase().includes(searchLower);
        return matchesSearch;
      });
    } else if (activeTab === 1) {
      // Clients tab
      return clients.filter(client => {
        const matchesSearch = 
          client.name?.toLowerCase().includes(searchLower) ||
          client.email?.toLowerCase().includes(searchLower) ||
          client.company?.toLowerCase().includes(searchLower);
        const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
        const matchesType = typeFilter === 'all' || 
          (typeFilter === 'client' && (client.status === 'active' || client.status === 'pending')) ||
          (typeFilter === 'prospect' && client.status === 'prospect') ||
          (typeFilter === 'lead' && client.status === 'prospect');
        return matchesSearch && matchesStatus && matchesType;
      });
    } else if (activeTab === 2) {
      // Prospects/Leads tab
      return clients.filter(client => {
        const matchesSearch = 
          client.name?.toLowerCase().includes(searchLower) ||
          client.email?.toLowerCase().includes(searchLower) ||
          client.company?.toLowerCase().includes(searchLower);
        return (client.status === 'prospect' || client.status === 'pending') && matchesSearch;
      });
    } else {
      // Shopify tab
      return shopifyCustomers.filter(customer => {
        const matchesSearch = 
          customer.email?.toLowerCase().includes(searchLower) ||
          customer.firstName?.toLowerCase().includes(searchLower) ||
          customer.lastName?.toLowerCase().includes(searchLower);
        return matchesSearch;
      });
    }
  };

  const filteredData = getFilteredData();
  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, item: User | Client, type: 'user' | 'client') => {
    setMenuAnchor(event.currentTarget);
    setMenuType(type);
    if (type === 'user') {
      setSelectedUser(item as User);
    } else {
      setSelectedClient(item as Client);
    }
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
    setMenuType(null);
  };

  const handleEditClick = () => {
    if (menuType === 'user' && selectedUser) {
      setEditUserDialogOpen(true);
    } else if (menuType === 'client' && selectedClient) {
      // Open client edit dialog
      setAddClientOpen(true);
    }
    handleMenuClose();
  };

  const handleDeleteClick = async () => {
    if (menuType === 'user' && selectedUser) {
      try {
        const response = await fetch(`${backendUrl}/api/admin/users/${selectedUser.id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        if (response.ok) {
          setSuccess('User deleted successfully');
          fetchUsers();
        } else {
          const data = await response.json();
          setError(data.error || 'Failed to delete user');
        }
      } catch (err) {
        setError('Failed to delete user');
      }
    } else if (menuType === 'client' && selectedClient) {
      try {
        const response = await fetch(`${backendUrl}/api/creative/clients/${selectedClient.id}`, {
          method: 'DELETE',
          credentials: 'include',
        });
        if (response.ok) {
          setSuccess('Client deleted successfully');
          fetchClients();
        } else {
          const data = await response.json();
          setError(data.error || 'Failed to delete client');
        }
      } catch (err) {
        setError('Failed to delete client');
      }
    }
    handleMenuClose();
  };

  const handleStatusChange = async (item: User | Client, newStatus: string) => {
    if (menuType === 'client' && selectedClient) {
      try {
        const response = await fetch(`${backendUrl}/api/creative/clients/${selectedClient.id}`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus }),
        });
        if (response.ok) {
          setSuccess('Status updated successfully');
          fetchClients();
        } else {
          const data = await response.json();
          setError(data.error || 'Failed to update status');
        }
      } catch (err) {
        setError('Failed to update status');
      }
    }
    handleMenuClose();
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'prospect': return 'info';
      case 'blocked': return 'error';
      case 'inactive': return 'default';
      default: return 'default';
    }
  };

  const getUserRole = (user: User) => {
    if (user.is_admin) return 'Admin';
    if (user.is_employee) return 'Employee';
    if (user.is_client) return 'Client';
    return 'User';
  };

  return (
    <>
      <Head>
        <title>CRM Dashboard - iShareHow Labs</title>
        <meta name="description" content="Manage users, clients, prospects, and Shopify data" />
      </Head>
      <ProtectedRoute>
        <AppShell active={undefined}>
          <Container maxWidth="xl" sx={{ py: 4 }}>
            {/* Header Section */}
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" fontWeight={800} gutterBottom>
                CRM Dashboard
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage users, clients, prospects, and Shopify data all in one place
              </Typography>
            </Box>

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={2}>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                        <PeopleIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight={700}>
                          {totalUsers}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Users
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={2}>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: 'success.main', width: 56, height: 56 }}>
                        <BusinessIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight={700}>
                          {totalClients}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Active Clients
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={2}>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
                        <TrendingUpIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight={700}>
                          {totalProspects}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Prospects/Leads
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card elevation={2}>
                  <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ bgcolor: 'warning.main', width: 56, height: 56 }}>
                        <ShoppingCartIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h4" fontWeight={700}>
                          {totalShopifyCustomers}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Shopify Customers
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Alerts */}
            {success && (
              <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
                {success}
              </Alert>
            )}
            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {/* Main Content */}
            <Paper elevation={2} sx={{ borderRadius: 3, overflow: 'hidden' }}>
              {/* Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
                <Tabs
                  value={activeTab}
                  onChange={(e, newValue) => {
                    setActiveTab(newValue);
                    setPage(0);
                    setSearchQuery('');
                    setStatusFilter('all');
                    setTypeFilter('all');
                  }}
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  <Tab
                    icon={<PeopleIcon />}
                    iconPosition="start"
                    label="Users & Employees"
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  />
                  <Tab
                    icon={<BusinessIcon />}
                    iconPosition="start"
                    label="Clients & Customers"
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  />
                  <Tab
                    icon={<TrendingUpIcon />}
                    iconPosition="start"
                    label="Prospects & Leads"
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  />
                  <Tab
                    icon={<ShoppingCartIcon />}
                    iconPosition="start"
                    label="Shopify Data"
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  />
                </Tabs>
              </Box>

              <Box sx={{ p: 3 }}>
                {/* Search and Filters */}
                <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                  <TextField
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ flexGrow: 1, maxWidth: 400 }}
                  />
                  {(activeTab === 1 || activeTab === 2) && (
                    <>
                      <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={statusFilter}
                          label="Status"
                          onChange={(e) => setStatusFilter(e.target.value as any)}
                        >
                          <MenuItem value="all">All Status</MenuItem>
                          <MenuItem value="active">Active</MenuItem>
                          <MenuItem value="pending">Pending</MenuItem>
                          <MenuItem value="prospect">Prospect</MenuItem>
                          <MenuItem value="inactive">Inactive</MenuItem>
                        </Select>
                      </FormControl>
                      <FormControl size="small" sx={{ minWidth: 150 }}>
                        <InputLabel>Type</InputLabel>
                        <Select
                          value={typeFilter}
                          label="Type"
                          onChange={(e) => setTypeFilter(e.target.value as any)}
                        >
                          <MenuItem value="all">All Types</MenuItem>
                          <MenuItem value="client">Client</MenuItem>
                          <MenuItem value="prospect">Prospect</MenuItem>
                          <MenuItem value="lead">Lead</MenuItem>
                        </Select>
                      </FormControl>
                    </>
                  )}
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon />}
                    onClick={fetchAllData}
                    sx={{ textTransform: 'none' }}
                  >
                    Refresh
                  </Button>
                  {(activeTab === 1 || activeTab === 2) && (
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setAddClientOpen(true)}
                      sx={{ textTransform: 'none' }}
                    >
                      Add {activeTab === 2 ? 'Prospect' : 'Client'}
                    </Button>
                  )}
                </Box>

                {/* Tab Panels */}
                <TabPanel value={activeTab} index={0}>
                  {/* Users & Employees Tab */}
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell padding="checkbox">
                              <Checkbox />
                            </TableCell>
                            <TableCell>Profile</TableCell>
                            <TableCell>Email & Username</TableCell>
                            <TableCell>Role</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell align="right">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {paginatedData.map((item) => {
                            const user = item as User;
                            return (
                              <TableRow key={user.id} hover>
                                <TableCell padding="checkbox">
                                  <Checkbox />
                                </TableCell>
                                <TableCell>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Avatar src={user.profile_image} sx={{ width: 40, height: 40 }}>
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
                                  <Chip
                                    label={getUserRole(user)}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={user.status || 'Active'}
                                    size="small"
                                    color={getStatusColor(user.status)}
                                    sx={{ textTransform: 'capitalize' }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {user.created_at
                                      ? new Date(user.created_at).toLocaleDateString()
                                      : 'N/A'}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => handleMenuOpen(e, user, 'user')}
                                  >
                                    <MoreVertIcon />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                      <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={filteredData.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(e) => {
                          setRowsPerPage(parseInt(e.target.value, 10));
                          setPage(0);
                        }}
                      />
                    </TableContainer>
                  )}
                </TabPanel>

                <TabPanel value={activeTab} index={1}>
                  {/* Clients & Customers Tab */}
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell padding="checkbox">
                              <Checkbox />
                            </TableCell>
                            <TableCell>Company & Contact</TableCell>
                            <TableCell>Email & Phone</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Tier</TableCell>
                            <TableCell>Assigned To</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell align="right">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {paginatedData.map((item) => {
                            const client = item as Client;
                            return (
                              <TableRow key={client.id} hover>
                                <TableCell padding="checkbox">
                                  <Checkbox />
                                </TableCell>
                                <TableCell>
                                  <Box>
                                    <Typography variant="body2" fontWeight={500}>
                                      {client.company || client.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {client.name}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">{client.email}</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {client.phone || 'No phone'}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={client.status}
                                    size="small"
                                    color={getStatusColor(client.status)}
                                    sx={{ textTransform: 'capitalize' }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={client.tier || 'N/A'}
                                    size="small"
                                    variant="outlined"
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {client.assignedEmployee || 'Unassigned'}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {client.createdAt
                                      ? new Date(client.createdAt).toLocaleDateString()
                                      : 'N/A'}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => handleMenuOpen(e, client, 'client')}
                                  >
                                    <MoreVertIcon />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                      <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={filteredData.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(e) => {
                          setRowsPerPage(parseInt(e.target.value, 10));
                          setPage(0);
                        }}
                      />
                    </TableContainer>
                  )}
                </TabPanel>

                <TabPanel value={activeTab} index={2}>
                  {/* Prospects & Leads Tab */}
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell padding="checkbox">
                              <Checkbox />
                            </TableCell>
                            <TableCell>Contact Info</TableCell>
                            <TableCell>Company</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Source</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell align="right">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {paginatedData.map((item) => {
                            const prospect = item as Client;
                            return (
                              <TableRow key={prospect.id} hover>
                                <TableCell padding="checkbox">
                                  <Checkbox />
                                </TableCell>
                                <TableCell>
                                  <Box>
                                    <Typography variant="body2" fontWeight={500}>
                                      {prospect.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {prospect.email}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">{prospect.company || 'N/A'}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip
                                    label={prospect.status}
                                    size="small"
                                    color={getStatusColor(prospect.status)}
                                    sx={{ textTransform: 'capitalize' }}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Chip label="Demo Form" size="small" variant="outlined" />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {prospect.createdAt
                                      ? new Date(prospect.createdAt).toLocaleDateString()
                                      : 'N/A'}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => handleMenuOpen(e, prospect, 'client')}
                                  >
                                    <MoreVertIcon />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                      <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={filteredData.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(e) => {
                          setRowsPerPage(parseInt(e.target.value, 10));
                          setPage(0);
                        }}
                      />
                    </TableContainer>
                  )}
                </TabPanel>

                <TabPanel value={activeTab} index={3}>
                  {/* Shopify Data Tab */}
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : shopifyCustomers.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                      <ShoppingCartIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                      <Typography variant="h6" color="text.secondary" gutterBottom>
                        No Shopify Data
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Shopify integration is not configured or no customers found.
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={fetchShopifyCustomers}
                        sx={{ textTransform: 'none' }}
                      >
                        Refresh
                      </Button>
                    </Box>
                  ) : (
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell padding="checkbox">
                              <Checkbox />
                            </TableCell>
                            <TableCell>Customer</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Total Spent</TableCell>
                            <TableCell>Orders</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell align="right">Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {paginatedData.map((item) => {
                            const customer = item as ShopifyCustomer;
                            return (
                              <TableRow key={customer.id} hover>
                                <TableCell padding="checkbox">
                                  <Checkbox />
                                </TableCell>
                                <TableCell>
                                  <Box>
                                    <Typography variant="body2" fontWeight={500}>
                                      {customer.firstName} {customer.lastName}
                                    </Typography>
                                  </Box>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">{customer.email}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">{customer.phone || 'N/A'}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" fontWeight={600}>
                                    ${customer.totalSpent.toFixed(2)}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip label={customer.ordersCount} size="small" />
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {customer.createdAt
                                      ? new Date(customer.createdAt).toLocaleDateString()
                                      : 'N/A'}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <IconButton size="small">
                                    <MoreVertIcon />
                                  </IconButton>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                      <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={filteredData.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={(e, newPage) => setPage(newPage)}
                        onRowsPerPageChange={(e) => {
                          setRowsPerPage(parseInt(e.target.value, 10));
                          setPage(0);
                        }}
                      />
                    </TableContainer>
                  )}
                </TabPanel>
              </Box>
            </Paper>

            {/* Action Menu */}
            <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
              <MenuItem onClick={handleEditClick}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Edit</ListItemText>
              </MenuItem>
              {menuType === 'client' && selectedClient && (
                <>
                  <MenuItem onClick={() => handleStatusChange(selectedClient, 'active')}>
                    <ListItemIcon>
                      <Checkbox checked={selectedClient.status === 'active'} />
                    </ListItemIcon>
                    <ListItemText>Mark as Active</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={() => handleStatusChange(selectedClient, 'prospect')}>
                    <ListItemIcon>
                      <Checkbox checked={selectedClient.status === 'prospect'} />
                    </ListItemIcon>
                    <ListItemText>Mark as Prospect</ListItemText>
                  </MenuItem>
                  <Divider />
                </>
              )}
              <MenuItem onClick={handleDeleteClick}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" color="error" />
                </ListItemIcon>
                <ListItemText>Delete</ListItemText>
              </MenuItem>
            </Menu>

            {/* Dialogs */}
            <AddClientDialog
              open={addClientOpen}
              onClose={() => {
                setAddClientOpen(false);
                fetchClients();
              }}
            />

            <EditUserDialog
              open={editUserDialogOpen}
              user={selectedUser}
              onClose={() => {
                setEditUserDialogOpen(false);
                setSelectedUser(null);
                fetchUsers();
              }}
              onSuccess={setSuccess}
              onError={setError}
              availableClients={clients}
            />
          </Container>
        </AppShell>
      </ProtectedRoute>
    </>
  );
}

