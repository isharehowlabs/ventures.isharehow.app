import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
} from '@mui/material';
import {
  FitnessCenter,
  Favorite,
  TrendingUp,
  Sync,
  CalendarToday,
  Bolt,
  DirectionsRun,
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
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  ComposedChart,
  Area,
} from 'recharts';
import {
  getActivities,
  getWellnessMetrics,
  syncData,
  type IntervalsActivityData,
  type IntervalsWellnessMetrics,
} from '../../services/intervalsIcu';

export default function WellnessDataPage() {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [activities, setActivities] = useState<IntervalsActivityData[]>([]);
  const [wellnessMetrics, setWellnessMetrics] = useState<IntervalsWellnessMetrics[]>([]);
  const [daysBack, setDaysBack] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [activitiesData, metricsData] = await Promise.all([
        getActivities(daysBack),
        getWellnessMetrics(daysBack),
      ]);
      setActivities(activitiesData);
      setWellnessMetrics(metricsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [daysBack]);

  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    setSyncMessage(null);
    try {
      const result = await syncData(daysBack);
      setSyncMessage(
        `Synced ${result.activitiesSynced} activities and ${result.wellnessMetricsSynced} wellness metrics`
      );
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync data');
    } finally {
      setSyncing(false);
    }
  };

  // FTP/Power progression over time
  const powerProgressionData = activities
    .filter(a => a.powerData?.avgPower || a.powerData?.normalizedPower)
    .map(a => ({
      date: a.activityDate,
      avgPower: a.powerData?.avgPower || 0,
      normalizedPower: a.powerData?.normalizedPower || 0,
      name: a.activityName?.substring(0, 15) || 'Activity',
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Activity frequency by day (for 30-day period)
  const activityFrequencyData = (() => {
    const dayMap = new Map<string, number>();
    const durationMap = new Map<string, number>();
    
    activities.forEach(a => {
      const date = a.activityDate;
      dayMap.set(date, (dayMap.get(date) || 0) + 1);
      durationMap.set(date, (durationMap.get(date) || 0) + (a.duration || 0));
    });

    const dates = Array.from(dayMap.keys()).sort();
    return dates.map(date => ({
      date,
      count: dayMap.get(date) || 0,
      duration: Math.round((durationMap.get(date) || 0) / 60), // Convert to minutes
    }));
  })();

  // Combined: Activity volume vs Power trend
  const volumeVsPowerData = (() => {
    // Group by week to show correlation
    const weeklyData = new Map<string, { activities: number; totalDuration: number; avgPower: number; powerCount: number }>();
    
    activities.forEach(a => {
      const date = new Date(a.activityDate);
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay())).toISOString().split('T')[0];
      
      if (!weeklyData.has(weekStart)) {
        weeklyData.set(weekStart, { activities: 0, totalDuration: 0, avgPower: 0, powerCount: 0 });
      }
      
      const week = weeklyData.get(weekStart)!;
      week.activities++;
      week.totalDuration += (a.duration || 0) / 3600; // Convert to hours
      
      if (a.powerData?.normalizedPower) {
        week.avgPower += a.powerData.normalizedPower;
        week.powerCount++;
      }
    });

    return Array.from(weeklyData.entries())
      .map(([week, data]) => ({
        week,
        activities: data.activities,
        hours: Math.round(data.totalDuration * 10) / 10,
        avgPower: data.powerCount > 0 ? Math.round(data.avgPower / data.powerCount) : 0,
      }))
      .sort((a, b) => a.week.localeCompare(b.week));
  })();

  // RPE and Feel data
  const rpeFeelData = activities
    .filter(a => a.rpe || a.feel)
    .map(a => ({
      date: a.activityDate,
      name: a.activityName?.substring(0, 20) || 'Activity',
      rpe: a.rpe,
      feel: a.feel,
    }))
    .reverse();

  // HRV data
  const hrvData = wellnessMetrics
    .filter(m => m.hrv)
    .map(m => ({
      date: m.metricDate,
      hrv: m.hrv,
    }))
    .reverse();

  // Sleep data
  const sleepData = wellnessMetrics
    .filter(m => m.sleepSeconds)
    .map(m => ({
      date: m.metricDate,
      hours: m.sleepSeconds ? m.sleepSeconds / 3600 : 0,
      quality: m.sleepQuality,
    }))
    .reverse();

  // Calculate statistics
  const stats = {
    totalActivities: activities.length,
    totalHours: Math.round((activities.reduce((sum, a) => sum + (a.duration || 0), 0) / 3600) * 10) / 10,
    avgPower: activities.filter(a => a.powerData?.normalizedPower).length > 0
      ? Math.round(activities.reduce((sum, a) => sum + (a.powerData?.normalizedPower || 0), 0) / 
        activities.filter(a => a.powerData?.normalizedPower).length)
      : 0,
    maxPower: Math.max(...activities.map(a => a.powerData?.maxPower || 0)),
    avgHRV: wellnessMetrics.filter(m => m.hrv).length > 0
      ? Math.round(wellnessMetrics.reduce((sum, m) => sum + (m.hrv || 0), 0) / 
        wellnessMetrics.filter(m => m.hrv).length)
      : 0,
  };

  if (loading && !activities.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Header Controls */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel htmlFor="wellness-time-range">Time Range</InputLabel>
          <Select
            id="wellness-time-range"
            value={daysBack}
            label="Time Range"
            onChange={(e) => setDaysBack(Number(e.target.value))}
          >
            <MenuItem value={7}>Last 7 days</MenuItem>
            <MenuItem value={14}>Last 2 weeks</MenuItem>
            <MenuItem value={30}>Last 30 days</MenuItem>
            <MenuItem value={90}>Last 3 months</MenuItem>
            <MenuItem value={180}>Last 6 months</MenuItem>
          </Select>
        </FormControl>
        
        <Button
          variant="contained"
          startIcon={syncing ? <CircularProgress size={20} color="inherit" /> : <Sync />}
          onClick={handleSync}
          disabled={syncing}
        >
          {syncing ? 'Syncing...' : 'Sync Data'}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {syncMessage && (
        <Alert severity="success" sx={{ mb: 2}} onClose={() => setSyncMessage(null)}>
          {syncMessage}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <DirectionsRun color="primary" />
                <Typography variant="body2" color="text.secondary">
                  Total Activities
                </Typography>
              </Box>
              <Typography variant="h4">{stats.totalActivities}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <CalendarToday color="primary" />
                <Typography variant="body2" color="text.secondary">
                  Total Hours
                </Typography>
              </Box>
              <Typography variant="h4">{stats.totalHours}h</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <Bolt color="primary" />
                <Typography variant="body2" color="text.secondary">
                  Avg Power (NP)
                </Typography>
              </Box>
              <Typography variant="h4">{stats.avgPower}W</Typography>
              <Typography variant="caption" color="text.secondary">
                Max: {stats.maxPower}W
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <Favorite color="primary" />
                <Typography variant="body2" color="text.secondary">
                  Avg HRV
                </Typography>
              </Box>
              <Typography variant="h4">{stats.avgHRV}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* FTP/Power Progression Chart */}
        {powerProgressionData.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Power Progression Over Time
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Track your FTP and normalized power improvements
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={powerProgressionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis label={{ value: 'Watts', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="normalizedPower" 
                      stroke="#8884d8" 
                      name="Normalized Power (FTP estimate)"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avgPower" 
                      stroke="#82ca9d" 
                      name="Avg Power"
                      strokeWidth={1}
                      opacity={0.7}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Activity Frequency Chart */}
        {activityFrequencyData.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Daily Activity Frequency
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Activities completed each day
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <ComposedChart data={activityFrequencyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" label={{ value: 'Activities', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Minutes', angle: 90, position: 'insideRight' }} />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="# Activities" />
                    <Line yAxisId="right" type="monotone" dataKey="duration" stroke="#ff7300" name="Duration (min)" strokeWidth={2} />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Weekly Volume vs Power */}
        {volumeVsPowerData.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Training Volume vs Power Output
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  See how training volume affects your power
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <ComposedChart data={volumeVsPowerData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis yAxisId="left" label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Watts', angle: 90, position: 'insideRight' }} />
                    <Tooltip />
                    <Legend />
                    <Area yAxisId="left" type="monotone" dataKey="hours" fill="#8884d8" stroke="#8884d8" name="Weekly Hours" />
                    <Line yAxisId="right" type="monotone" dataKey="avgPower" stroke="#ff7300" strokeWidth={2} name="Avg Power" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Existing charts... */}
        {rpeFeelData.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>RPE & Feel</Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={rpeFeelData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="rpe" stroke="#8884d8" name="RPE" />
                    <Line type="monotone" dataKey="feel" stroke="#82ca9d" name="Feel" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {hrvData.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Heart Rate Variability</Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={hrvData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="hrv" stroke="#ff7300" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {sleepData.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Sleep Duration & Quality</Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={sleepData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Quality', angle: 90, position: 'insideRight' }} domain={[0, 5]} />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="hours" fill="#8884d8" name="Sleep Hours" />
                    <Line yAxisId="right" type="monotone" dataKey="quality" stroke="#82ca9d" strokeWidth={2} name="Quality" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
