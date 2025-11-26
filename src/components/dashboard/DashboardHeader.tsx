import { Box, Typography, Avatar, Chip, useTheme } from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import { useTimer } from '../../contexts/TimerContext';

interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
}

export default function DashboardHeader({ title, subtitle }: DashboardHeaderProps) {
  const { user } = useAuth();
  const { timerState } = useTimer();
  const theme = useTheme();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerLabel = () => {
    if (!timerState?.isRunning) return null;
    const typeLabel = timerState.isBreak ? 'Break' : 'Focus';
    return `${typeLabel}: ${formatTime(timerState.timeLeft)}`;
  };

  return (
    <Box
      sx={{
        mb: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {user && (
          <Avatar
            src={user.avatar}
            alt={user.name || 'User'}
            sx={{
              width: 56,
              height: 56,
              border: `2px solid ${theme.palette.primary.main}`,
            }}
          >
            {user.name?.charAt(0) || 'U'}
          </Avatar>
        )}
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            {title || `${getGreeting()}, ${user?.name || 'User'}`}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {subtitle || 'Collaborate and Build Today'}
          </Typography>
        </Box>
      </Box>

      {timerState?.isRunning && getTimerLabel() && (
        <Chip
          label={getTimerLabel()}
          color="primary"
          sx={{
            fontWeight: 600,
            fontSize: '0.875rem',
            height: 36,
          }}
        />
      )}
    </Box>
  );
}

