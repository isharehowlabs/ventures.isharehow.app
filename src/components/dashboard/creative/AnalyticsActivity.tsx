'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Select,
  MenuItem,
  FormControl,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Stack,
  Avatar,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  People,
  ShoppingCart,
  AttachMoney,
  Visibility,
  RefreshOutlined,
  CalendarToday,
} from '@mui/icons-material';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import StatCard from '../StatCard';
import ChartCard from '../ChartCard';
import { getBackendUrl } from '../../../utils/backendUrl';

interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  status: string;
  googleAnalyticsPropertyKey?: string;
}

// Sample data for charts (replace with real data from your API)
const revenueData = [
  { name: 'Jan', value: 4000, previous: 3000 },
  { name: 'Feb', value: 3000, previous: 2800 },
  { name: 'Mar', value: 5000, previous: 4200 },
  { name: 'Apr', value: 4500, previous: 3900 },
  { name: 'May', value: 6000, previous: 5000 },
  { name: 'Jun', value: 5500, previous: 4800 },
  { name: 'Jul', value: 7000, previous: 5500 },
];

const visitorData = [
  { name: 'Mon', visitors: 2400, pageViews: 4800 },
  { name: 'Tue', visitors: 1398, pageViews: 3200 },
  { name: 'Wed', visitors: 9800, pageViews: 12000 },
  { name: 'Thu', visitors: 3908, pageViews: 6500 },
  { name: 'Fri', visitors: 4800, pageViews: 8200 },
  { name: 'Sat', visitors: 3800, pageViews: 7100 },
  { name: 'Sun', visitors: 4300, pageViews: 7800 },
];

const conversionData = [
  { name: 'Week 1', rate: 2.4 },
  { name: 'Week 2', rate: 3.2 },
  { name: 'Week 3', rate: 2.8 },
  { name: 'Week 4', rate: 4.1 },
];

export default function AnalyticsActivity() {
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingClients, setLoadingClients] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [lastSync, setLastSync] = useState<Date | null>(null);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/creative/clients`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setClients(data.clients || []);
        }
      } catch (err) {
        console.error('Error fetching clients:', err);
      } finally {
        setLoadingClients(false);
      }
    };
    fetchClients();
  }, []);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with real analytics API
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setLastSync(new Date());
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      {/* Header with Filters */}
      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2} alignItems="center" justifyContent="space-between">
          <Grid item xs={12} md={6}>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Analytics Overview
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track your performance metrics and insights
              {lastSync && (
                <> · Last updated {lastSync.toLocaleTimeString()}</>
              )}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack direction="row" spacing={2} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  displayEmpty
                  startAdornment={<CalendarToday sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />}
                >
                  <MenuItem value="24h">Last 24 Hours</MenuItem>
                  <MenuItem value="7d">Last 7 Days</MenuItem>
                  <MenuItem value="30d">Last 30 Days</MenuItem>
                  <MenuItem value="90d">Last 90 Days</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <Select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  displayEmpty
                  disabled={loadingClients}
                >
                  <MenuItem value="all">All Clients</MenuItem>
                  {clients.map((client) => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Tooltip title="Refresh data">
                <IconButton 
                  onClick={handleRefresh} 
                  disabled={loading}
                  sx={{ 
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': { bgcolor: 'action.hover' }
                  }}
                >
                  {loading ? <CircularProgress size={20} /> : <RefreshOutlined />}
                </IconButton>
              </Tooltip>
            </Stack>
          </Grid>
        </Grid>
      </Box>

      {/* Stat Cards Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value="$45,231"
            icon={<AttachMoney />}
            trend={12.5}
            trendLabel="vs last period"
            color="#10b981"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value="8,282"
            icon={<People />}
            trend={8.2}
            trendLabel="vs last period"
            color="#6366f1"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Page Views"
            value="48.5K"
            icon={<Visibility />}
            trend={-2.4}
            trendLabel="vs last period"
            color="#f59e0b"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Conversion Rate"
            value="3.24%"
            icon={<ShoppingCart />}
            trend={5.1}
            trendLabel="vs last period"
            color="#8b5cf6"
          />
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Revenue Chart */}
        <Grid item xs={12} lg={8}>
          <ChartCard
            title="Revenue Overview"
            subtitle="Compare current vs previous period"
            action={
              <Button size="small" variant="outlined">
                View Report
              </Button>
            }
          >
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#6366f1" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="previous" 
                  stroke="#cbd5e1" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="none" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        {/* Conversion Rate Chart */}
        <Grid item xs={12} lg={4}>
          <ChartCard
            title="Conversion Rate"
            subtitle="Weekly trend"
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={conversionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px'
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>

      {/* Visitor Activity Chart */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <ChartCard
            title="Visitor Activity"
            subtitle="Daily visitors and page views"
            action={
              <Stack direction="row" spacing={2}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: '#6366f1', borderRadius: '2px' }} />
                  <Typography variant="caption">Visitors</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: '#8b5cf6', borderRadius: '2px' }} />
                  <Typography variant="caption">Page Views</Typography>
                </Box>
              </Stack>
            }
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={visitorData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="visitors" fill="#6366f1" radius={[8, 8, 0, 0]} />
                <Bar dataKey="pageViews" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  );
}
