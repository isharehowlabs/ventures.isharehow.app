import { Box, Card, CardContent, Typography, CircularProgress, LinearProgress, useTheme } from '@mui/material';
import { TrendingUp, People, CheckCircle, Timer } from '@mui/icons-material';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  progress?: number;
  icon: React.ReactNode;
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
}

function MetricCard({ title, value, subtitle, progress, icon, color = 'primary' }: MetricCardProps) {
  const theme = useTheme();

  return (
    <Card className="dashboard-card metric-card" sx={{ height: '100%' }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              borderRadius: '50%',
              bgcolor: `${color}.main`,
              color: 'white',
            }}
          >
            {icon}
          </Box>
        </Box>
        {progress !== undefined && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: 'action.disabledBackground',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                },
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {progress}% complete
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

interface DashboardMetricsProps {
  metrics?: {
    clients?: number;
    projects?: number;
    tasks?: number;
    completion?: number;
  };
}

export default function DashboardMetrics({ metrics }: DashboardMetricsProps) {
  const defaultMetrics = {
    clients: 12,
    projects: 24,
    tasks: 48,
    completion: 75,
    ...metrics,
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          md: 'repeat(4, 1fr)',
        },
        gap: 2,
        mb: 3,
      }}
    >
      <MetricCard
        title="Active Clients"
        value={defaultMetrics.clients}
        subtitle="This month"
        icon={<People />}
        color="primary"
      />
      <MetricCard
        title="Projects"
        value={defaultMetrics.projects}
        subtitle="In progress"
        icon={<TrendingUp />}
        color="info"
      />
      <MetricCard
        title="Tasks"
        value={defaultMetrics.tasks}
        subtitle="Completed today"
        icon={<CheckCircle />}
        color="success"
      />
      <MetricCard
        title="Progress"
        value={`${defaultMetrics.completion}%`}
        subtitle="Overall completion"
        progress={defaultMetrics.completion}
        icon={<Timer />}
        color="warning"
      />
    </Box>
  );
}

