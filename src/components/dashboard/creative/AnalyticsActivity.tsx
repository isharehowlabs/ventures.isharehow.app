'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Stack,
  IconButton,
  Tooltip,
  TextField,
  Alert,
  Chip,
  Menu,
  Divider,
  Paper,
  useTheme,
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
  Download,
  MoreVert,
  FilterList,
  Assessment,
  Timeline,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
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

interface AnalyticsData {
  totalRevenue: number;
  totalUsers: number;
  pageViews: number;
  conversionRate: number;
  revenueTrend: number;
  usersTrend: number;
  pageViewsTrend: number;
  conversionTrend: number;
  revenueData: Array<{ name: string; value: number; previous: number }>;
  visitorData: Array<{ name: string; visitors: number; pageViews: number }>;
  conversionData: Array<{ name: string; rate: number }>;
}

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

export default function AnalyticsActivity() {
  const theme = useTheme();
  const [selectedClient, setSelectedClient] = useState<string>('all');
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingClients, setLoadingClients] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [gaPropertyId, setGaPropertyId] = useState<string>('');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [filterMenuAnchor, setFilterMenuAnchor] = useState<null | HTMLElement>(null);

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
          // Auto-select first client's GA property if available
          if (data.clients && data.clients.length > 0 && data.clients[0].googleAnalyticsPropertyKey) {
            setGaPropertyId(data.clients[0].googleAnalyticsPropertyKey);
          }
        }
      } catch (err) {
        console.error('Error fetching clients:', err);
      } finally {
        setLoadingClients(false);
      }
    };
    fetchClients();
  }, []);

  const fetchAnalyticsData = async (propertyId: string, range: string) => {
    if (!propertyId) {
      setAnalyticsData(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/analytics/data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          propertyId,
          timeRange: range,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch analytics data');
      }

      const data = await response.json();
      
      // Check if this is mock data or an error
      if (data.error && data.isMockData) {
        setError(data.error);
        // Still set data to show zeros/empty, but show the error message
        setAnalyticsData({
          totalRevenue: data.totalRevenue || 0,
          totalUsers: data.totalUsers || 0,
          pageViews: data.pageViews || 0,
          conversionRate: data.conversionRate || 0,
          revenueTrend: data.revenueTrend || 0,
          usersTrend: data.usersTrend || 0,
          pageViewsTrend: data.pageViewsTrend || 0,
          conversionTrend: data.conversionTrend || 0,
          revenueData: data.revenueData || [],
          visitorData: data.visitorData || [],
          conversionData: data.conversionData || [],
        });
      } else if (data.error) {
        setError(data.error);
        setAnalyticsData(null);
      } else {
        setAnalyticsData(data);
        setError(null);
      }
      setLastSync(new Date());
    } catch (err: any) {
      console.error('Error fetching analytics data:', err);
      setError(err.message || 'Failed to load analytics data');
      setAnalyticsData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    if (gaPropertyId) {
      await fetchAnalyticsData(gaPropertyId, timeRange);
    }
  };

  useEffect(() => {
    if (gaPropertyId && timeRange) {
      fetchAnalyticsData(gaPropertyId, timeRange);
    }
  }, [gaPropertyId, timeRange]);

  const handleExport = (format: 'csv' | 'pdf') => {
    // TODO: Implement export functionality
    console.log(`Exporting analytics data as ${format}`);
    setExportMenuAnchor(null);
  };

  const formatTimeRange = (range: string) => {
    const ranges: Record<string, string> = {
      '24h': 'Last 24 Hours',
      '7d': 'Last 7 Days',
      '30d': 'Last 30 Days',
      '90d': 'Last 90 Days',
    };
    return ranges[range] || range;
  };

  // Calculate additional metrics
  // Note: avgSessionDuration and bounceRate require additional GA metrics that aren't currently fetched
  // Using revenue per user as a meaningful metric instead
  const revenuePerUser = analyticsData && analyticsData.totalUsers > 0 
    ? (analyticsData.totalRevenue / analyticsData.totalUsers).toFixed(2) 
    : '0';
  // Pages per session is a more accurate metric than fake session duration
  const pagesPerSession = analyticsData && analyticsData.totalUsers > 0
    ? (analyticsData.pageViews / analyticsData.totalUsers).toFixed(1)
    : '0';

  return (
    <Box sx={{ width: '100%' }}>
      {/* Modern Header Section */}
      <Paper 
        elevation={0}
        sx={{ 
          p: 3, 
          mb: 3,
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Analytics Dashboard
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track performance metrics and insights
              {lastSync && (
                <Chip 
                  label={`Last updated ${lastSync.toLocaleTimeString()}`}
                  size="small"
                  sx={{ ml: 1, height: 20 }}
                />
              )}
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <TextField
              size="small"
              label="GA Property ID"
              placeholder="G-XXXXXXXXXX"
              value={gaPropertyId}
              onChange={(e) => setGaPropertyId(e.target.value)}
              sx={{ minWidth: 200 }}
              InputProps={{
                startAdornment: <Assessment sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />,
              }}
            />
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                label="Time Range"
              >
                <MenuItem value="24h">Last 24 Hours</MenuItem>
                <MenuItem value="7d">Last 7 Days</MenuItem>
                <MenuItem value="30d">Last 30 Days</MenuItem>
                <MenuItem value="90d">Last 90 Days</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Client</InputLabel>
              <Select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                label="Client"
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
                disabled={loading || !gaPropertyId}
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
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={(e) => setFilterMenuAnchor(e.currentTarget)}
              sx={{ borderColor: 'divider' }}
            >
              Filters
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={(e) => setExportMenuAnchor(e.currentTarget)}
              sx={{ borderColor: 'divider' }}
            >
              Export
            </Button>
          </Stack>
        </Box>
      </Paper>

      {/* Export Menu */}
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={() => setExportMenuAnchor(null)}
      >
        <MenuItem onClick={() => handleExport('csv')}>
          <Download sx={{ mr: 1, fontSize: 18 }} />
          Export as CSV
        </MenuItem>
        <MenuItem onClick={() => handleExport('pdf')}>
          <Download sx={{ mr: 1, fontSize: 18 }} />
          Export as PDF
        </MenuItem>
      </Menu>

      {/* Filter Menu */}
      <Menu
        anchorEl={filterMenuAnchor}
        open={Boolean(filterMenuAnchor)}
        onClose={() => setFilterMenuAnchor(null)}
      >
        <Box sx={{ p: 2, minWidth: 250 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            Filter Options
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Additional filters coming soon
          </Typography>
        </Box>
      </Menu>

      {error && (
        <Alert 
          severity={error.includes('not configured') || error.includes('not installed') ? 'warning' : 'error'}
          sx={{ mb: 3 }} 
          onClose={() => setError(null)}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        >
          <Typography variant="body2" fontWeight={600} gutterBottom>
            {error.includes('not configured') || error.includes('not installed') 
              ? 'Google Analytics API Not Configured' 
              : 'Error Loading Analytics Data'}
          </Typography>
          <Typography variant="body2">
            {error}
          </Typography>
          {error.includes('GOOGLE_APPLICATION_CREDENTIALS') && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" component="div">
                <strong>To fix this:</strong>
                <ol style={{ marginTop: 8, paddingLeft: 20 }}>
                  <li>Create a service account in Google Cloud Console</li>
                  <li>Enable Google Analytics Data API for your project</li>
                  <li>Download the JSON key file</li>
                  <li>Set GOOGLE_APPLICATION_CREDENTIALS environment variable to the JSON file path</li>
                </ol>
              </Typography>
            </Box>
          )}
        </Alert>
      )}

      {/* Key Metrics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Revenue"
            value={analyticsData ? `$${analyticsData.totalRevenue.toLocaleString()}` : '$0'}
            icon={<AttachMoney />}
            trend={analyticsData?.revenueTrend || 0}
            trendLabel="vs last period"
            color="#10b981"
            loading={loading && !analyticsData}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={analyticsData ? analyticsData.totalUsers.toLocaleString() : '0'}
            icon={<People />}
            trend={analyticsData?.usersTrend || 0}
            trendLabel="vs last period"
            color="#6366f1"
            loading={loading && !analyticsData}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Page Views"
            value={analyticsData ? `${(analyticsData.pageViews / 1000).toFixed(1)}K` : '0'}
            icon={<Visibility />}
            trend={analyticsData?.pageViewsTrend || 0}
            trendLabel="vs last period"
            color="#f59e0b"
            loading={loading && !analyticsData}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Conversion Rate"
            value={analyticsData ? `${analyticsData.conversionRate.toFixed(2)}%` : '0%'}
            icon={<ShoppingCart />}
            trend={analyticsData?.conversionTrend || 0}
            trendLabel="vs last period"
            color="#8b5cf6"
            loading={loading && !analyticsData}
          />
        </Grid>
      </Grid>

      {/* Additional Metrics Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Pages per User
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {pagesPerSession}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Conversion Rate
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                {analyticsData?.conversionRate?.toFixed(1) || '0'}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ boxShadow: 2 }}>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Revenue per User
              </Typography>
              <Typography variant="h5" fontWeight={700}>
                ${revenuePerUser}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Charts Row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Revenue Overview Chart */}
        <Grid item xs={12} lg={8}>
          <ChartCard
            title="Revenue Overview"
            subtitle={`${formatTimeRange(timeRange)} - Current vs Previous Period`}
            action={
              <Button size="small" variant="outlined" startIcon={<Timeline />}>
                View Details
              </Button>
            }
          >
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={analyticsData?.revenueData || []}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPrevious" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#cbd5e1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#cbd5e1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis 
                  dataKey="name" 
                  stroke={theme.palette.text.secondary} 
                  fontSize={12}
                  tick={{ fill: theme.palette.text.secondary }}
                />
                <YAxis 
                  stroke={theme.palette.text.secondary} 
                  fontSize={12}
                  tick={{ fill: theme.palette.text.secondary }}
                />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: '8px',
                    color: theme.palette.text.primary,
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorRevenue)" 
                  name="Current Period"
                />
                <Area 
                  type="monotone" 
                  dataKey="previous" 
                  stroke="#94a3b8" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  fill="url(#colorPrevious)"
                  fillOpacity={0.3}
                  name="Previous Period"
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        {/* Conversion Rate Chart */}
        <Grid item xs={12} lg={4}>
          <ChartCard
            title="Conversion Rate"
            subtitle="Weekly trend analysis"
          >
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={analyticsData?.conversionData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis 
                  dataKey="name" 
                  stroke={theme.palette.text.secondary} 
                  fontSize={12}
                  tick={{ fill: theme.palette.text.secondary }}
                />
                <YAxis 
                  stroke={theme.palette.text.secondary} 
                  fontSize={12}
                  tick={{ fill: theme.palette.text.secondary }}
                />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: '8px',
                    color: theme.palette.text.primary,
                  }} 
                />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ fill: '#10b981', r: 5 }}
                  activeDot={{ r: 7 }}
                  name="Conversion Rate (%)"
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
            subtitle={`${formatTimeRange(timeRange)} - Daily visitors and page views`}
            action={
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: '#6366f1', borderRadius: '2px' }} />
                  <Typography variant="caption" color="text.secondary">Visitors</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: '#8b5cf6', borderRadius: '2px' }} />
                  <Typography variant="caption" color="text.secondary">Page Views</Typography>
                </Box>
              </Stack>
            }
          >
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={analyticsData?.visitorData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis 
                  dataKey="name" 
                  stroke={theme.palette.text.secondary} 
                  fontSize={12}
                  tick={{ fill: theme.palette.text.secondary }}
                />
                <YAxis 
                  stroke={theme.palette.text.secondary} 
                  fontSize={12}
                  tick={{ fill: theme.palette.text.secondary }}
                />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: '8px',
                    color: theme.palette.text.primary,
                  }} 
                />
                <Bar 
                  dataKey="visitors" 
                  fill="#6366f1" 
                  radius={[8, 8, 0, 0]}
                  name="Visitors"
                />
                <Bar 
                  dataKey="pageViews" 
                  fill="#8b5cf6" 
                  radius={[8, 8, 0, 0]}
                  name="Page Views"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  );
}
