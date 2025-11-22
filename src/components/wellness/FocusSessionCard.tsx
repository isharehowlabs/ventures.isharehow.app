import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { Timer as TimerIcon, LocalFireDepartment as FireIcon } from '@mui/icons-material';
import { Activity } from './api';

interface FocusSessionCardProps {
  session: Activity;
  streak?: number;
}

const formatDuration = (notes: string) => {
  const match = notes.match(/(\d+)\s*min/i);
  if (match) {
    return `${match[1]} min`;
  }
  return notes;
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();
  
  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';
  return date.toLocaleDateString();
};

export default function FocusSessionCard({ session, streak }: FocusSessionCardProps) {
  const duration = formatDuration(session.notes || '');
  const time = formatTime(session.completionDate || session.createdAt);
  const date = formatDate(session.completionDate || session.createdAt);

  return (
    <Card sx={{ mb: 2, '&:hover': { boxShadow: 4 } }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box 
            sx={{ 
              bgcolor: 'primary.main', 
              color: 'white', 
              p: 1.5, 
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <TimerIcon />
          </Box>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">
              {session.activityName}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
              <Chip 
                label={duration} 
                size="small" 
                color="primary" 
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {date} at {time}
              </Typography>
            </Box>
          </Box>
          
          {streak && streak > 1 && (
            <Box sx={{ textAlign: 'center' }}>
              <FireIcon sx={{ color: 'warning.main', fontSize: 32 }} />
              <Typography variant="caption" fontWeight="bold" color="warning.main">
                {streak} day streak
              </Typography>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
