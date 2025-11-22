import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import {
  FitnessCenter as FitnessIcon,
  SelfImprovement as MeditationIcon,
  DirectionsRun as RunIcon,
  MenuBook as JournalIcon,
  Timer as TimerIcon,
  LocalDining as NutritionIcon,
} from '@mui/icons-material';
import { Activity } from './api';

interface ActivityCardProps {
  activity: Activity;
}

const getActivityIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'fitness':
    case 'workout':
      return <FitnessIcon />;
    case 'meditation':
    case 'mindfulness':
      return <MeditationIcon />;
    case 'running':
    case 'cardio':
      return <RunIcon />;
    case 'journal':
      return <JournalIcon />;
    case 'focus':
    case 'pomodoro':
      return <TimerIcon />;
    case 'nutrition':
    case 'meal':
      return <NutritionIcon />;
    default:
      return <FitnessIcon />;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return date.toLocaleDateString();
  }
};

export default function ActivityCard({ activity }: ActivityCardProps) {
  return (
    <Card sx={{ mb: 2, '&:hover': { boxShadow: 4 } }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Box sx={{ color: 'primary.main', mt: 0.5 }}>
            {getActivityIcon(activity.activityType)}
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" gutterBottom>
              {activity.activityName}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <Chip
                label={activity.activityType}
                size="small"
                color="primary"
                variant="outlined"
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                {formatDate(activity.completionDate || activity.createdAt)}
              </Typography>
            </Box>
            {activity.notes && (
              <Typography variant="body2" color="text.secondary">
                {activity.notes}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
