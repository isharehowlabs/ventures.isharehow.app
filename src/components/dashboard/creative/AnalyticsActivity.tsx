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
import { useDarkMode } from '../../../hooks/useDarkMode';
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
  Save as SaveIcon,
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
  // Traffic by First User Source/Medium (for Active Users)
  activeUsersByFirstUserSourceMedium?: Array<{ 
    firstUserSourceMedium: string; 
    activeUsers: number; 
  }>;
  // Sessions by Session Source/Medium
  sessionsBySessionSourceMedium?: Array<{ 
    sessionSourceMedium: string; 
    sessions: number; 
    pageViews: number;
    bounceRate?: number;
  }>;
  // Traffic Acquisition URLs
  trafficAcquisitionUrls?: Array<{ 
    url: string; 
    activeUsers: number; 
    sessions: number; 
    pageViews: number;
  }>;
  userAcquisitionByPlatform?: Array<{ 
    platform: string; 
    newUsers: number; 
    returningUsers: number; 
    totalUsers: number;
    conversionRate?: number;
  }>;
}

const COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];

// Venn Diagram Component
interface VennDiagramProps {
  data: Array<{ 
    platform: string; 
    newUsers: number; 
    returningUsers: number; 
    totalUsers: number;
    conversionRate?: number;
  }>;
  theme: any;
  isDark: boolean;
}

function VennDiagram({ data, theme, isDark }: VennDiagramProps) {
  if (!data || data.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <Typography variant="body2" color="text.secondary">
          No platform data available
        </Typography>
      </Box>
    );
  }

  // Calculate total sessions (using totalUsers as proxy for sessions)
  const totalSessions = data.reduce((sum, item) => sum + item.totalUsers, 0);
  
  // Sort platforms by totalUsers and take top 3 for Venn diagram
  const topPlatforms = [...data]
    .sort((a, b) => b.totalUsers - a.totalUsers)
    .slice(0, 3);

  // Calculate circle sizes based on totalUsers (sessions)
  const maxSessions = Math.max(...topPlatforms.map(p => p.totalUsers), 1);
  const minRadius = 80;
  const maxRadius = 150;
  
  const getRadius = (sessions: number) => {
    const ratio = sessions / maxSessions;
    return minRadius + (maxRadius - minRadius) * ratio;
  };

  // Calculate positions for 2-3 circles in a Venn diagram layout
  const getCirclePositions = (count: number) => {
    const centerX = 300;
    const centerY = 300;
    const baseDistance = 120;
    
    if (count === 1) {
      return [{ cx: centerX, cy: centerY }];
    } else if (count === 2) {
      return [
        { cx: centerX - baseDistance / 2, cy: centerY },
        { cx: centerX + baseDistance / 2, cy: centerY }
      ];
    } else {
      // Equilateral triangle layout for 3 circles
      return [
        { cx: centerX, cy: centerY - baseDistance * 0.6 },
        { cx: centerX - baseDistance * 0.866, cy: centerY + baseDistance * 0.3 },
        { cx: centerX + baseDistance * 0.866, cy: centerY + baseDistance * 0.3 }
      ];
    }
  };

  const positions = getCirclePositions(topPlatforms.length);
  const svgWidth = 600;
  const svgHeight = 600;

  // Calculate overlap areas (simplified - using intersection of circles)
  const getOverlapPath = (circle1: { cx: number; cy: number; r: number }, circle2: { cx: number; cy: number; r: number }) => {
    const d = Math.sqrt(Math.pow(circle2.cx - circle1.cx, 2) + Math.pow(circle2.cy - circle1.cy, 2));
    if (d >= circle1.r + circle2.r) return null; // No overlap
    
    const r1 = circle1.r;
    const r2 = circle2.r;
    const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
    const h = Math.sqrt(r1 * r1 - a * a);
    const x0 = circle1.cx + a * (circle2.cx - circle1.cx) / d;
    const y0 = circle1.cy + a * (circle2.cy - circle1.cy) / d;
    const rx = circle2.cx - x0;
    const ry = circle2.cy - y0;
    
    const x1 = x0 + h * ry / d;
    const y1 = y0 - h * rx / d;
    const x2 = x0 - h * ry / d;
    const y2 = y0 + h * rx / d;
    
    return `M ${x1} ${y1} A ${r1} ${r1} 0 0 1 ${x2} ${y2} A ${r2} ${r2} 0 0 1 ${x1} ${y1} Z`;
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <svg width={svgWidth} height={svgHeight} style={{ overflow: 'visible' }}>
          <defs>
            {topPlatforms.map((platform, index) => (
              <linearGradient key={`gradient-${index}`} id={`vennGradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.6} />
                <stop offset="100%" stopColor={COLORS[index % COLORS.length]} stopOpacity={0.3} />
              </linearGradient>
            ))}
          </defs>
          
          {/* Draw overlap areas first (so they appear behind) */}
          {topPlatforms.length >= 2 && (
            <>
              {getOverlapPath(
                { cx: positions[0].cx, cy: positions[0].cy, r: getRadius(topPlatforms[0].totalUsers) },
                { cx: positions[1].cx, cy: positions[1].cy, r: getRadius(topPlatforms[1].totalUsers) }
              ) && (
                <path
                  d={getOverlapPath(
                    { cx: positions[0].cx, cy: positions[0].cy, r: getRadius(topPlatforms[0].totalUsers) },
                    { cx: positions[1].cx, cy: positions[1].cy, r: getRadius(topPlatforms[1].totalUsers) }
                  )!}
                  fill={isDark ? 'rgba(99, 102, 241, 0.4)' : 'rgba(99, 102, 241, 0.3)'}
                  stroke={theme.palette.divider}
                  strokeWidth={2}
                />
              )}
              {topPlatforms.length === 3 && (
                <>
                  {getOverlapPath(
                    { cx: positions[0].cx, cy: positions[0].cy, r: getRadius(topPlatforms[0].totalUsers) },
                    { cx: positions[2].cx, cy: positions[2].cy, r: getRadius(topPlatforms[2].totalUsers) }
                  ) && (
                    <path
                      d={getOverlapPath(
                        { cx: positions[0].cx, cy: positions[0].cy, r: getRadius(topPlatforms[0].totalUsers) },
                        { cx: positions[2].cx, cy: positions[2].cy, r: getRadius(topPlatforms[2].totalUsers) }
                      )!}
                      fill={isDark ? 'rgba(139, 92, 246, 0.4)' : 'rgba(139, 92, 246, 0.3)'}
                      stroke={theme.palette.divider}
                      strokeWidth={2}
                    />
                  )}
                  {getOverlapPath(
                    { cx: positions[1].cx, cy: positions[1].cy, r: getRadius(topPlatforms[1].totalUsers) },
                    { cx: positions[2].cx, cy: positions[2].cy, r: getRadius(topPlatforms[2].totalUsers) }
                  ) && (
                    <path
                      d={getOverlapPath(
                        { cx: positions[1].cx, cy: positions[1].cy, r: getRadius(topPlatforms[1].totalUsers) },
                        { cx: positions[2].cx, cy: positions[2].cy, r: getRadius(topPlatforms[2].totalUsers) }
                      )!}
                      fill={isDark ? 'rgba(16, 185, 129, 0.4)' : 'rgba(16, 185, 129, 0.3)'}
                      stroke={theme.palette.divider}
                      strokeWidth={2}
                    />
                  )}
                </>
              )}
            </>
          )}
          
          {/* Draw circles */}
          {topPlatforms.map((platform, index) => {
            const radius = getRadius(platform.totalUsers);
            const pos = positions[index];
            const sessions = platform.totalUsers;
            const percentage = totalSessions > 0 ? (sessions / totalSessions * 100).toFixed(1) : '0';
            
            return (
              <g key={platform.platform}>
                <circle
                  cx={pos.cx}
                  cy={pos.cy}
                  r={radius}
                  fill={`url(#vennGradient-${index})`}
                  stroke={COLORS[index % COLORS.length]}
                  strokeWidth={3}
                  opacity={0.7}
                />
                <text
                  x={pos.cx}
                  y={pos.cy - radius - 20}
                  textAnchor="middle"
                  fill={theme.palette.text.primary}
                  fontSize={16}
                  fontWeight={700}
                >
                  {platform.platform}
                </text>
                <text
                  x={pos.cx}
                  y={pos.cy}
                  textAnchor="middle"
                  fill={theme.palette.text.primary}
                  fontSize={24}
                  fontWeight={700}
                >
                  {sessions.toLocaleString()}
                </text>
                <text
                  x={pos.cx}
                  y={pos.cy + 20}
                  textAnchor="middle"
                  fill={theme.palette.text.secondary}
                  fontSize={14}
                >
                  {percentage}%
                </text>
              </g>
            );
          })}
        </svg>
      </Box>
      
      {/* Legend */}
      <Box sx={{ mt: 2, display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center' }}>
        {topPlatforms.map((platform, index) => (
          <Box key={platform.platform} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box 
              sx={{ 
                width: 16, 
                height: 16, 
                bgcolor: COLORS[index % COLORS.length], 
                borderRadius: '50%',
                opacity: 0.7
              }} 
            />
            <Typography variant="body2" color="text.secondary">
              {platform.platform}: {platform.totalUsers.toLocaleString()} sessions
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default function AnalyticsActivity() {
  const theme = useTheme();
  const isDark = useDarkMode();
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
          activeUsersByFirstUserSourceMedium: data.activeUsersByFirstUserSourceMedium || [],
          sessionsBySessionSourceMedium: data.sessionsBySessionSourceMedium || [],
          trafficAcquisitionUrls: data.trafficAcquisitionUrls || [],
          userAcquisitionByPlatform: data.userAcquisitionByPlatform || [],
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
      'today': 'Today',
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
          background: isDark 
            ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)'
            : 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Our CRM GA
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track performance metrics and insights for your CRM clients
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
                <MenuItem value="today">Today</MenuItem>
                <MenuItem value="24h">Last 24 Hours</MenuItem>
                <MenuItem value="7d">Last 7 Days</MenuItem>
                <MenuItem value="30d">Last 30 Days</MenuItem>
                <MenuItem value="90d">Last 90 Days</MenuItem>
              </Select>
            </FormControl>
            <Tooltip title="Refresh data">
              <IconButton 
                onClick={handleRefresh} 
                disabled={loading || !gaPropertyId}
                sx={{ 
                  bgcolor: 'transparent',
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
            <Button
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleRefresh}
              disabled={loading || !gaPropertyId}
              sx={{ 
                bgcolor: 'primary.main',
                '&:hover': { bgcolor: 'primary.dark' }
              }}
            >
              Save
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
                <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
                  See <a href="https://developers.google.com/analytics/devguides/reporting/data/v1/rest/v1beta/properties/runReport" target="_blank" rel="noopener noreferrer">Google Analytics API documentation</a> for detailed setup instructions.
                </Typography>
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

      {/* Active Users by First User Source/Medium */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={8}>
          <ChartCard
            title="Active Users by First User Source/Medium"
            subtitle={`${formatTimeRange(timeRange)} - Active users breakdown by first user source/medium`}
            action={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 12, height: 12, bgcolor: '#6366f1', borderRadius: '2px' }} />
                <Typography variant="caption" color="text.secondary">Active Users</Typography>
              </Box>
            }
          >
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={analyticsData?.activeUsersByFirstUserSourceMedium || []}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis 
                  dataKey="firstUserSourceMedium" 
                  stroke={theme.palette.text.secondary} 
                  fontSize={11}
                  tick={{ fill: theme.palette.text.secondary }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke={theme.palette.text.secondary} 
                  fontSize={12}
                  tick={{ fill: theme.palette.text.secondary }}
                />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: '8px',
                    color: theme.palette.text.primary,
                  }} 
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="square"
                />
                <Bar 
                  dataKey="activeUsers" 
                  fill="#6366f1" 
                  radius={[4, 4, 0, 0]}
                  name="Active Users"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid item xs={12} lg={4}>
          <ChartCard
            title="Sessions by Platform"
            subtitle={`${formatTimeRange(timeRange)} - Platform distribution and overlap`}
          >
            <Box sx={{ width: '100%', height: 400, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <VennDiagram 
                data={analyticsData?.userAcquisitionByPlatform || []}
                theme={theme}
                isDark={isDark}
              />
            </Box>
          </ChartCard>
        </Grid>
      </Grid>

      {/* Sessions by Session Source/Medium */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={8}>
          <ChartCard
            title="Sessions by Session Source/Medium"
            subtitle={`${formatTimeRange(timeRange)} - Sessions and page views breakdown by session source/medium`}
            action={
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: '#10b981', borderRadius: '2px' }} />
                  <Typography variant="caption" color="text.secondary">Sessions</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: '#f59e0b', borderRadius: '2px' }} />
                  <Typography variant="caption" color="text.secondary">Page Views</Typography>
                </Box>
              </Stack>
            }
          >
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={analyticsData?.sessionsBySessionSourceMedium || []}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis 
                  dataKey="sessionSourceMedium" 
                  stroke={theme.palette.text.secondary} 
                  fontSize={11}
                  tick={{ fill: theme.palette.text.secondary }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke={theme.palette.text.secondary} 
                  fontSize={12}
                  tick={{ fill: theme.palette.text.secondary }}
                />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: '8px',
                    color: theme.palette.text.primary,
                  }} 
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="square"
                />
                <Bar 
                  dataKey="sessions" 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]}
                  name="Sessions"
                />
                <Bar 
                  dataKey="pageViews" 
                  fill="#f59e0b" 
                  radius={[4, 4, 0, 0]}
                  name="Page Views"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid item xs={12} lg={4}>
          <ChartCard
            title="Session Source/Medium Distribution"
            subtitle="Sessions share by session source/medium"
          >
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={analyticsData?.sessionsBySessionSourceMedium || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => {
                    const data = entry as { sessionSourceMedium?: string; percent?: number };
                    return `${data.sessionSourceMedium || 'Unknown'}: ${((data.percent || 0) * 100).toFixed(0)}%`;
                  }}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="sessions"
                  nameKey="sessionSourceMedium"
                >
                  {(analyticsData?.sessionsBySessionSourceMedium || []).map((entry, index) => (
                    <Cell key={`cell-session-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: '8px',
                    color: theme.palette.text.primary,
                  }}
                  formatter={(value: number, name: string) => [
                    value.toLocaleString(),
                    name === 'sessions' ? 'Sessions' : name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>

      {/* Traffic Acquisition URLs */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <ChartCard
            title="Traffic Acquisition URLs"
            subtitle={`${formatTimeRange(timeRange)} - Top URLs driving traffic`}
            action={
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: '#6366f1', borderRadius: '2px' }} />
                  <Typography variant="caption" color="text.secondary">Active Users</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: '#10b981', borderRadius: '2px' }} />
                  <Typography variant="caption" color="text.secondary">Sessions</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: '#f59e0b', borderRadius: '2px' }} />
                  <Typography variant="caption" color="text.secondary">Page Views</Typography>
                </Box>
              </Stack>
            }
          >
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={analyticsData?.trafficAcquisitionUrls || []}
                margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis 
                  dataKey="url" 
                  stroke={theme.palette.text.secondary} 
                  fontSize={10}
                  tick={{ fill: theme.palette.text.secondary }}
                  angle={-45}
                  textAnchor="end"
                  height={120}
                />
                <YAxis 
                  stroke={theme.palette.text.secondary} 
                  fontSize={12}
                  tick={{ fill: theme.palette.text.secondary }}
                />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: '8px',
                    color: theme.palette.text.primary,
                  }} 
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="square"
                />
                <Bar 
                  dataKey="activeUsers" 
                  fill="#6366f1" 
                  radius={[4, 4, 0, 0]}
                  name="Active Users"
                />
                <Bar 
                  dataKey="sessions" 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]}
                  name="Sessions"
                />
                <Bar 
                  dataKey="pageViews" 
                  fill="#f59e0b" 
                  radius={[4, 4, 0, 0]}
                  name="Page Views"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>

      {/* User Acquisition by Platform Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <ChartCard
            title="User Acquisition by Source Platform"
            subtitle={`${formatTimeRange(timeRange)} - New vs Returning users by platform`}
            action={
              <Stack direction="row" spacing={2} alignItems="center">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: '#6366f1', borderRadius: '2px' }} />
                  <Typography variant="caption" color="text.secondary">New Users</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: '#8b5cf6', borderRadius: '2px' }} />
                  <Typography variant="caption" color="text.secondary">Returning Users</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: '#10b981', borderRadius: '2px' }} />
                  <Typography variant="caption" color="text.secondary">Total Users</Typography>
                </Box>
              </Stack>
            }
          >
            <ResponsiveContainer width="100%" height={400}>
              <BarChart 
                data={analyticsData?.userAcquisitionByPlatform || []}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis 
                  dataKey="platform" 
                  stroke={theme.palette.text.secondary} 
                  fontSize={11}
                  tick={{ fill: theme.palette.text.secondary }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis 
                  stroke={theme.palette.text.secondary} 
                  fontSize={12}
                  tick={{ fill: theme.palette.text.secondary }}
                />
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: '8px',
                    color: theme.palette.text.primary,
                  }} 
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType="square"
                />
                <Bar 
                  dataKey="newUsers" 
                  fill="#6366f1" 
                  radius={[4, 4, 0, 0]}
                  name="New Users"
                />
                <Bar 
                  dataKey="returningUsers" 
                  fill="#8b5cf6" 
                  radius={[4, 4, 0, 0]}
                  name="Returning Users"
                />
                <Bar 
                  dataKey="totalUsers" 
                  fill="#10b981" 
                  radius={[4, 4, 0, 0]}
                  name="Total Users"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        <Grid item xs={12} lg={4}>
          <ChartCard
            title="Platform Distribution"
            subtitle="User acquisition share by platform"
          >
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={analyticsData?.userAcquisitionByPlatform || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => {
                    const data = entry as { platform?: string; percent?: number };
                    return `${data.platform || 'Unknown'}: ${((data.percent || 0) * 100).toFixed(0)}%`;
                  }}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="totalUsers"
                  nameKey="platform"
                >
                  {(analyticsData?.userAcquisitionByPlatform || []).map((entry, index) => (
                    <Cell key={`cell-platform-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ 
                    backgroundColor: theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: '8px',
                    color: theme.palette.text.primary,
                  }}
                  formatter={(value: number, name: string) => [
                    value.toLocaleString(),
                    name === 'totalUsers' ? 'Total Users' : name
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  );
}
