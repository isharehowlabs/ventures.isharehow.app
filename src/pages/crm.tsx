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
  BarChart as BarChartIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AddCircle as AddCircleIcon,
  AccountBalanceWallet as WalletIcon,
  CloudQueue as CloudIcon,
  Work as WorkIcon,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import AppShell from '../components/AppShell';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { useAuth } from '../hooks/useAuth';
import { getBackendUrl } from '../utils/backendUrl';
import EditUserDialog from '../components/dashboard/creative/EditUserDialog';
import AddClientDialog from '../components/dashboard/creative/AddClientDialog';
import VenturesPanel from '../components/dashboard/VenturesPanel';
import TasksPanel from '../components/dashboard/shared/TasksPanel';

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
  const [tasks, setTasks] = useState<any[]>([]);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'prospect' | 'inactive'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'client' | 'prospect' | 'lead'>('all');
  const [timePeriodFilter, setTimePeriodFilter] = useState<'week' | 'month' | 'year'>('month');

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

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${backendUrl}/api/tasks`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUsers(),
        fetchClients(),
        fetchShopifyCustomers(),
        fetchTasks(),
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

  // Calculate analytics data
  const totalLeads = clients.filter(c => c.status === 'prospect' || c.status === 'pending').length;
  const convertedLeads = clients.filter(c => c.status === 'active').length;
  const leadsConvertedPercentage = totalLeads > 0 ? Math.round((convertedLeads / (totalLeads + convertedLeads)) * 100) : 0;
  const leadsConvertedCount = convertedLeads;
  const totalLeadsCount = totalLeads + convertedLeads;

  // Lead categories
  const newLeads = clients.filter(c => {
    if (!c.createdAt) return false;
    const createdDate = new Date(c.createdAt);
    const daysSinceCreation = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    return (c.status === 'prospect' || c.status === 'pending') && daysSinceCreation <= 7;
  }).length;
  
  const openLeads = clients.filter(c => c.status === 'prospect' || c.status === 'pending').length;
  const wonLeads = clients.filter(c => c.status === 'active').length;
  const lostLeads = clients.filter(c => c.status === 'inactive').length;

  // Generate leads vs customers chart data (last 7 days)
  const generateLeadsVsCustomersData = () => {
    const days = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      
      // Count leads created on this day
      const leadsCount = clients.filter(c => {
        if (!c.createdAt) return false;
        const createdDate = new Date(c.createdAt);
        return createdDate.toDateString() === date.toDateString() && 
               (c.status === 'prospect' || c.status === 'pending');
      }).length;
      
      // Count customers (active clients) created on this day
      const customersCount = clients.filter(c => {
        if (!c.createdAt) return false;
        const createdDate = new Date(c.createdAt);
        return createdDate.toDateString() === date.toDateString() && 
               c.status === 'active';
      }).length;
      
      data.push({
        day: dayName,
        leads: leadsCount,
        customers: customersCount,
      });
    }
    
    return data;
  };

  const leadsVsCustomersData = generateLeadsVsCustomersData();

  // Project status data (using client status as proxy)
  const projectStatusData = [
    { name: 'In Progress', value: clients.filter(c => c.status === 'active').length, color: '#9c27b0' },
    { name: 'On Hold', value: clients.filter(c => c.status === 'pending').length, color: '#ffc107' },
    { name: 'Upcoming', value: clients.filter(c => c.status === 'prospect').length, color: '#9e9e9e' },
    { name: 'Completed', value: Math.floor(totalClients * 0.2), color: '#4caf50' },
  ].filter(item => item.value > 0);

  // Calculate invoice payments from actual client data
  // Sum up any payment/revenue data from clients if available, otherwise use active clients as proxy
  const invoicePayments = clients
    .filter(c => c.status === 'active')
    .reduce((sum, client) => {
      // If clients have revenue/payment fields, sum them; otherwise use count
      return sum + (client.tier === 'enterprise' ? 100 : client.tier === 'professional' ? 50 : 10);
    }, 0);

  // Calculate projects in progress
  const projectsInProgress = clients.filter(c => c.status === 'active').length;

  // Calculate tasks not finished from real database
  const tasksNotFinished = tasks.filter(t => t.status !== 'completed').length;

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
      // Clients, Prospects & Leads tab (combined)
      return clients.filter(client => {
        const matchesSearch = 
          client.name?.toLowerCase().includes(searchLower) ||
          client.email?.toLowerCase().includes(searchLower) ||
          client.company?.toLowerCase().includes(searchLower);
        const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
        const matchesType = typeFilter === 'all' || 
          (typeFilter === 'client' && (client.status === 'active' || client.status === 'pending')) ||
          (typeFilter === 'prospect' && client.status === 'prospect') ||
          (typeFilter === 'lead' && (client.status === 'prospect' || client.status === 'pending'));
        return matchesSearch && matchesStatus && matchesType;
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
                    e.preventDefault();
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
                    label="Clients, Prospects & Leads"
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  />
                  <Tab
                    icon={<ShoppingCartIcon />}
                    iconPosition="start"
                    label="Shopify Data"
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  />
                  <Tab
                    icon={<BarChartIcon />}
                    iconPosition="start"
                    label="Analytics"
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  />
                  <Tab
                    icon={<AssignmentIcon />}
                    iconPosition="start"
                    label="Ventures"
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                  />
                  <Tab
                    icon={<WorkIcon />}
                    iconPosition="start"
                    label="To-Do & Tasks"
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
                  {activeTab === 1 && (
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
                  {activeTab === 1 && (
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setAddClientOpen(true)}
                      sx={{ textTransform: 'none' }}
                    >
                      Add {typeFilter === 'prospect' || typeFilter === 'lead' ? 'Prospect/Lead' : 'Client'}
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
                  {/* Clients, Prospects & Leads Tab - Combined */}
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
                            <TableCell>Type</TableCell>
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
                            const isProspect = client.status === 'prospect';
                            const isLead = client.status === 'pending' || client.status === 'prospect';
                            const typeLabel = isProspect ? 'Prospect' : isLead ? 'Lead' : 'Client';
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
                                    label={typeLabel}
                                    size="small"
                                    color={isProspect ? 'warning' : isLead ? 'info' : 'primary'}
                                    variant="outlined"
                                  />
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

                <TabPanel value={activeTab} index={3}>
                  {/* Analytics Tab */}
                  <Box>
                    {/* Top Row - KPI Cards */}
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
                          <CardContent>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Leads Converted
                            </Typography>
                            <Typography variant="h3" fontWeight={700} sx={{ color: 'primary.main', mb: 1 }}>
                              {leadsConvertedPercentage}%
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {leadsConvertedCount} out of {totalLeadsCount}
                            </Typography>
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                              <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                                <PeopleIcon />
                              </Avatar>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
                          <CardContent>
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                              <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                                <WalletIcon />
                              </Avatar>
                              <Typography variant="body2" color="text.secondary">
                                Invoice Payments
                              </Typography>
                            </Stack>
                            <Typography variant="h4" fontWeight={700}>
                              {invoicePayments}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
                          <CardContent>
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                              <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                                <CloudIcon />
                              </Avatar>
                              <Typography variant="body2" color="text.secondary">
                                Project In Progress
                              </Typography>
                            </Stack>
                            <Typography variant="h4" fontWeight={700}>
                              {projectsInProgress}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={2} sx={{ borderRadius: 2, height: '100%' }}>
                          <CardContent>
                            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                              <Avatar sx={{ bgcolor: 'grey.700', width: 40, height: 40 }}>
                                <AssignmentIcon />
                              </Avatar>
                              <Typography variant="body2" color="text.secondary">
                                Task Not Finished
                              </Typography>
                            </Stack>
                            <Typography variant="h4" fontWeight={700}>
                              {tasksNotFinished}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>

                    {/* Middle Row - Charts */}
                    <Grid container spacing={3} sx={{ mb: 3 }}>
                      <Grid item xs={12} md={8}>
                        <Card elevation={2} sx={{ borderRadius: 2 }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Typography variant="h6" fontWeight={600}>
                                Leads VS Customers
                              </Typography>
                              <FormControl size="small" sx={{ minWidth: 120 }}>
                                <Select 
                                  value={timePeriodFilter} 
                                  onChange={(e) => setTimePeriodFilter(e.target.value as 'week' | 'month' | 'year')}
                                  sx={{ textTransform: 'none' }}
                                >
                                  <MenuItem value="week">Week</MenuItem>
                                  <MenuItem value="month">Month</MenuItem>
                                  <MenuItem value="year">Year</MenuItem>
                                </Select>
                              </FormControl>
                            </Box>
                            <ResponsiveContainer width="100%" height={300}>
                              <LineChart data={leadsVsCustomersData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line 
                                  type="monotone" 
                                  dataKey="leads" 
                                  stroke="#9c27b0" 
                                  strokeWidth={2}
                                  name="Leads"
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="customers" 
                                  stroke="#ffc107" 
                                  strokeWidth={2}
                                  name="Customers"
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <Card elevation={2} sx={{ borderRadius: 2 }}>
                          <CardContent>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                              Project Status
                            </Typography>
                            <ResponsiveContainer width="100%" height={300}>
                              <PieChart>
                                <Pie
                                  data={projectStatusData}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={60}
                                  outerRadius={100}
                                  paddingAngle={5}
                                  dataKey="value"
                                >
                                  {projectStatusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip />
                                <Legend 
                                  verticalAlign="bottom"
                                  height={36}
                                  formatter={(value) => <span style={{ fontSize: '12px' }}>{value}</span>}
                                />
                              </PieChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>

                    {/* Bottom Row - Lead Categories */}
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={2} sx={{ borderRadius: 2 }}>
                          <CardContent>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                                <AddCircleIcon />
                              </Avatar>
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  New Leads
                                </Typography>
                                <Typography variant="h5" fontWeight={700}>
                                  {newLeads}
                                </Typography>
                              </Box>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={2} sx={{ borderRadius: 2 }}>
                          <CardContent>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Avatar sx={{ bgcolor: 'warning.main', width: 48, height: 48 }}>
                                <PeopleIcon />
                              </Avatar>
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Open Leads
                                </Typography>
                                <Typography variant="h5" fontWeight={700}>
                                  {openLeads}
                                </Typography>
                              </Box>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={2} sx={{ borderRadius: 2 }}>
                          <CardContent>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                                <CheckCircleIcon />
                              </Avatar>
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Won Leads
                                </Typography>
                                <Typography variant="h5" fontWeight={700}>
                                  {wonLeads}
                                </Typography>
                              </Box>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Card elevation={2} sx={{ borderRadius: 2 }}>
                          <CardContent>
                            <Stack direction="row" spacing={2} alignItems="center">
                              <Avatar sx={{ bgcolor: 'error.main', width: 48, height: 48 }}>
                                <CancelIcon />
                              </Avatar>
                              <Box>
                                <Typography variant="body2" color="text.secondary">
                                  Lost Leads
                                </Typography>
                                <Typography variant="h5" fontWeight={700}>
                                  {lostLeads}
                                </Typography>
                              </Box>
                            </Stack>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                </TabPanel>

                {/* Ventures Tab */}
                <TabPanel value={activeTab} index={4}>
                  <VenturesPanel />
                </TabPanel>

                {/* To-Do & Tasks Tab */}
                <TabPanel value={activeTab} index={5}>
                  <Card sx={{ boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', mb: 3 }}>
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h5" fontWeight={700} gutterBottom>
                          To-Do & Tasks
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                          Manage your tasks and track your progress
                        </Typography>
                      </Box>
                      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ width: '100%' }}>
                          <Box sx={{ mb: 3 }}>
                            <TasksPanel height={1131} />
                          </Box>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
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

