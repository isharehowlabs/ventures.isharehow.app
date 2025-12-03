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
  LinearProgress,
} from '@mui/material';
import {
  FitnessCenter,
  Favorite,
  TrendingUp,
  Sync,
  CalendarToday,
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

  // Load data on mount and when daysBack changes
  useEffect(() => {
    loadData();
  }, [daysBack]);

  // Prepare chart data for RPE and Feel
  const rpeFeelData = activities
    .filter(a => a.rpe || a.feel)
    .map(a => ({
      date: a.activityDate,
      name: a.activityName?.substring(0, 20) || 'Activity',
      rpe: a.rpe,
      feel: a.feel,
    }))
    .reverse();

  // Prepare heart rate data
  const hrData = activities
    .filter(a => a.hrData?.avgHr)
    .map(a => ({
      date: a.activityDate,
      avgHr: a.hrData?.avgHr,
      maxHr: a.hrData?.maxHr,
    }))
    .reverse();

  // Prepare power data
  const powerData = activities
    .filter(a => a.powerData?.avgPower)
    .map(a => ({
      date: a.activityDate,
      avgPower: a.powerData?.avgPower,
      maxPower: a.powerData?.maxPower,
      normalizedPower: a.powerData?.normalizedPower,
    }))
    .reverse();

  // Prepare wellness metrics data
  const hrvData = wellnessMetrics
    .filter(m => m.hrv)
    .map(m => ({
      date: m.metricDate,
      hrv: m.hrv,
    }))
    .reverse();

  const sleepData = wellnessMetrics
    .filter(m => m.sleepSeconds)
    .map(m => ({
      date: m.metricDate,
      hours: m.sleepSeconds ? m.sleepSeconds / 3600 : 0,
      quality: m.sleepQuality,
    }))
    .reverse();


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
          <InputLabel>Time Range</InputLabel>
          <Select
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
                <FitnessCenter color="primary" />
                <Typography variant="body2" color="text.secondary">
                  Total Activities
                </Typography>
              </Box>
              <Typography variant="h4">{activities.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <Favorite color="error" />
                <Typography variant="body2" color="text.secondary">
                  Avg RPE
                </Typography>
              </Box>
              <Typography variant="h4">
                {activities.length
                  ? (
                      activities.reduce((sum, a) => sum + (a.rpe || 0), 0) /
                      activities.filter(a => a.rpe).length
                    ).toFixed(1)
                  : '-'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <TrendingUp color="success" />
                <Typography variant="body2" color="text.secondary">
                  Avg Feel
                </Typography>
              </Box>
              <Typography variant="h4">
                {activities.length
                  ? (
                      activities.reduce((sum, a) => sum + (a.feel || 0), 0) /
                      activities.filter(a => a.feel).length
                    ).toFixed(1)
                  : '-'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <CalendarToday color="info" />
                <Typography variant="body2" color="text.secondary">
                  Wellness Entries
                </Typography>
              </Box>
              <Typography variant="h4">{wellnessMetrics.length}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* RPE and Feel Chart */}
      {rpeFeelData.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Activity RPE & Feel
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
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
      )}

      {/* Heart Rate Chart */}
      {hrData.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Heart Rate Data
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hrData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="avgHr" stroke="#ff7300" name="Avg HR" />
                <Line type="monotone" dataKey="maxHr" stroke="#ff0000" name="Max HR" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Power Data Chart */}
      {powerData.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Power Data
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={powerData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgPower" fill="#8884d8" name="Avg Power (W)" />
                <Bar dataKey="normalizedPower" fill="#82ca9d" name="Normalized Power (W)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* HRV Chart */}
      {hrvData.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Heart Rate Variability (HRV)
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hrvData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="hrv" stroke="#9c27b0" name="HRV (RMSSD)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Sleep Data Chart */}
      {sleepData.length > 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Sleep Tracking
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sleepData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="hours" fill="#2196f3" name="Sleep (hours)" />
                <Bar yAxisId="right" dataKey="quality" fill="#4caf50" name="Quality (1-10)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* No Data Message */}
      {activities.length === 0 && wellnessMetrics.length === 0 && !loading && (
        <Card>
          <CardContent>
            <Typography variant="body1" color="text.secondary" align="center">
              No data available. Click "Sync Data" to import your Intervals.icu data.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
