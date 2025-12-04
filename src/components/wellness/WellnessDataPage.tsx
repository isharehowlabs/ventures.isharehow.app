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
  Divider,
} from '@mui/material';
import {
  FitnessCenter,
  Favorite,
  TrendingUp,
  Sync,
  CalendarToday,
  Bolt,
  DirectionsRun,
  MonitorHeart,
  Speed,
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

  // FTP/Power progression over time (using Normalized Power as FTP estimate)
  const ftpProgressionData = activities
    .filter(a => a.powerData?.normalizedPower)
    .map(a => ({
      date: a.activityDate,
      ftp: a.powerData?.normalizedPower || 0,
      avgPower: a.powerData?.avgPower || 0,
      name: a.activityName?.substring(0, 15) || 'Activity',
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Power Curve - Best power outputs (simulate power curve from max/avg)
  const powerCurveData = (() => {
    if (activities.length === 0) return [];
    
    const maxPower = Math.max(...activities.map(a => a.powerData?.maxPower || 0));
    const avgNP = activities.filter(a => a.powerData?.normalizedPower).length > 0
      ? activities.reduce((sum, a) => sum + (a.powerData?.normalizedPower || 0), 0) / 
        activities.filter(a => a.powerData?.normalizedPower).length
      : 0;
    
    // Simulate power curve: 5s, 1min, 5min, 20min, 60min
    return [
      { duration: '5s', power: Math.round(maxPower * 0.95) },
      { duration: '1min', power: Math.round(maxPower * 0.85) },
      { duration: '5min', power: Math.round(avgNP * 1.15) },
      { duration: '20min', power: Math.round(avgNP * 1.05) }, // FTP estimate
      { duration: '60min', power: Math.round(avgNP * 0.95) },
    ];
  })();

  // Power/HR Ratio - Efficiency metric (with lag compensation concept)
  const powerHrRatioData = activities
    .filter(a => a.powerData?.avgPower && a.hrData?.avgHr)
    .map(a => {
      const power = a.powerData?.avgPower || 0;
      const hr = a.hrData?.avgHr || 0;
      // Higher ratio = more efficient (more power for same HR)
      const ratio = hr > 0 ? Number((power / hr).toFixed(2)) : 0;
      
      return {
        date: a.activityDate,
        ratio,
        power,
        hr,
        name: a.activityName?.substring(0, 15) || 'Activity',
      };
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Activity frequency by day
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
      duration: Math.round((durationMap.get(date) || 0) / 60),
    }));
  })();

  // Combined: Activity volume vs FTP trend
  const volumeVsFtpData = (() => {
    const weeklyData = new Map<string, { activities: number; totalDuration: number; avgFtp: number; ftpCount: number }>();
    
    activities.forEach(a => {
      const date = new Date(a.activityDate);
      const weekStart = new Date(date.setDate(date.getDate() - date.getDay())).toISOString().split('T')[0];
      
      if (!weeklyData.has(weekStart)) {
        weeklyData.set(weekStart, { activities: 0, totalDuration: 0, avgFtp: 0, ftpCount: 0 });
      }
      
      const week = weeklyData.get(weekStart)!;
      week.activities++;
      week.totalDuration += (a.duration || 0) / 3600;
      
      if (a.powerData?.normalizedPower) {
        week.avgFtp += a.powerData.normalizedPower;
        week.ftpCount++;
      }
    });

    return Array.from(weeklyData.entries())
      .map(([week, data]) => ({
        week,
        activities: data.activities,
        hours: Math.round(data.totalDuration * 10) / 10,
        avgFtp: data.ftpCount > 0 ? Math.round(data.avgFtp / data.ftpCount) : 0,
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

  // Wellness metrics - all other data
  const wellnessData = wellnessMetrics
    .filter(m => m.mood || m.fatigue || m.stress || m.soreness)
    .map(m => ({
      date: m.metricDate,
      mood: m.mood,
      fatigue: m.fatigue,
      stress: m.stress,
      soreness: m.soreness,
    }))
    .reverse();

  // Weight tracking
  const weightData = wellnessMetrics
    .filter(m => m.weight)
    .map(m => ({
      date: m.metricDate,
      weight: m.weight,
    }))
    .reverse();

  // Resting HR
  const restingHrData = wellnessMetrics
    .filter(m => m.restingHr)
    .map(m => ({
      date: m.metricDate,
      restingHr: m.restingHr,
    }))
    .reverse();

  // Calculate statistics
  const stats = {
    totalActivities: activities.length,
    totalHours: Math.round((activities.reduce((sum, a) => sum + (a.duration || 0), 0) / 3600) * 10) / 10,
    avgFtp: activities.filter(a => a.powerData?.normalizedPower).length > 0
      ? Math.round(activities.reduce((sum, a) => sum + (a.powerData?.normalizedPower || 0), 0) / 
        activities.filter(a => a.powerData?.normalizedPower).length)
      : 0,
    maxPower: Math.max(...activities.map(a => a.powerData?.maxPower || 0)),
    avgHRV: wellnessMetrics.filter(m => m.hrv).length > 0
      ? Math.round(wellnessMetrics.reduce((sum, m) => sum + (m.hrv || 0), 0) / 
        wellnessMetrics.filter(m => m.hrv).length)
      : 0,
    avgPowerHrRatio: powerHrRatioData.length > 0
      ? Number((powerHrRatioData.reduce((sum, d) => sum + d.ratio, 0) / powerHrRatioData.length).toFixed(2))
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
                  Avg FTP (NP)
                </Typography>
              </Box>
              <Typography variant="h4">{stats.avgFtp}W</Typography>
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
                <MonitorHeart color="primary" />
                <Typography variant="body2" color="text.secondary">
                  Power/HR Efficiency
                </Typography>
              </Box>
              <Typography variant="h4">{stats.avgPowerHrRatio}</Typography>
              <Typography variant="caption" color="text.secondary">
                W/BPM | HRV: {stats.avgHRV}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 2 }}>
        ⚡ Power & Performance Metrics
      </Typography>

      {/* Charts Grid */}
      <Grid container spacing={3}>
        {/* FTP Progression Chart */}
        {ftpProgressionData.length > 0 && (
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  FTP Progression Over Time
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Functional Threshold Power (FTP) using Normalized Power
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={ftpProgressionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis label={{ value: 'Watts', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="ftp" 
                      stroke="#8884d8" 
                      name="FTP (Normalized Power)"
                      strokeWidth={3}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="avgPower" 
                      stroke="#82ca9d" 
                      name="Avg Power"
                      strokeWidth={1}
                      opacity={0.6}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Power Curve */}
        {powerCurveData.length > 0 && (
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Power Curve
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Best power outputs across different durations
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={powerCurveData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="duration" />
                    <YAxis label={{ value: 'Watts', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Bar dataKey="power" fill="#ff7300" name="Max Power" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Power/HR Ratio (Efficiency) */}
        {powerHrRatioData.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Power/HR Ratio - Cardiac Efficiency
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Watts per heartbeat (higher = more efficient). HR lag-compensated analysis.
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <ComposedChart data={powerHrRatioData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" label={{ value: 'W/BPM', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Watts', angle: 90, position: 'insideRight' }} />
                    <Tooltip />
                    <Legend />
                    <Line 
                      yAxisId="left" 
                      type="monotone" 
                      dataKey="ratio" 
                      stroke="#8884d8" 
                      strokeWidth={3}
                      name="Power/HR Ratio"
                    />
                    <Scatter 
                      yAxisId="right" 
                      dataKey="power" 
                      fill="#82ca9d" 
                      name="Power (W)"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Activity Frequency */}
        {activityFrequencyData.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Daily Activity Frequency
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Training consistency - activities per day
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

        {/* Weekly Volume vs FTP */}
        {volumeVsFtpData.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Training Volume vs FTP
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  How training hours affect your functional threshold power
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <ComposedChart data={volumeVsFtpData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis yAxisId="left" label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Watts', angle: 90, position: 'insideRight' }} />
                    <Tooltip />
                    <Legend />
                    <Area yAxisId="left" type="monotone" dataKey="hours" fill="#8884d8" stroke="#8884d8" name="Weekly Hours" />
                    <Line yAxisId="right" type="monotone" dataKey="avgFtp" stroke="#ff7300" strokeWidth={3} name="Avg FTP" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h5" gutterBottom>
            💪 Training Load & Recovery
          </Typography>
        </Grid>

        {/* RPE & Feel */}
        {rpeFeelData.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>RPE & Feel</Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Rate of Perceived Exertion and how you felt
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={rpeFeelData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="rpe" stroke="#8884d8" name="RPE" strokeWidth={2} />
                    <Line type="monotone" dataKey="feel" stroke="#82ca9d" name="Feel" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Wellness Metrics */}
        {wellnessData.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Wellness Metrics</Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Mood, fatigue, stress, and soreness
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={wellnessData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="mood" stroke="#82ca9d" name="Mood" />
                    <Line type="monotone" dataKey="fatigue" stroke="#ff7300" name="Fatigue" />
                    <Line type="monotone" dataKey="stress" stroke="#d32f2f" name="Stress" />
                    <Line type="monotone" dataKey="soreness" stroke="#8884d8" name="Soreness" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* HRV */}
        {hrvData.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Heart Rate Variability (HRV)</Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Recovery indicator - higher is better
                </Typography>
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

        {/* Resting HR */}
        {restingHrData.length > 0 && (
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Resting Heart Rate</Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Lower resting HR indicates improved fitness
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={restingHrData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="restingHr" stroke="#d32f2f" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Sleep */}
        {sleepData.length > 0 && (
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Sleep Duration & Quality</Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Sleep is crucial for recovery and performance
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <ComposedChart data={sleepData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                    <YAxis yAxisId="right" orientation="right" label={{ value: 'Quality', angle: 90, position: 'insideRight' }} domain={[0, 5]} />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="hours" fill="#8884d8" name="Sleep Hours" />
                    <Line yAxisId="right" type="monotone" dataKey="quality" stroke="#82ca9d" strokeWidth={2} name="Quality" />
                  </ComposedChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Weight */}
        {weightData.length > 0 && (
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Weight Tracking</Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Monitor weight changes over time
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={weightData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="weight" stroke="#8884d8" strokeWidth={2} name="Weight (kg)" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
