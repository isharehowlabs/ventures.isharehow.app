import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import {
  EmojiEvents as TrophyIcon,
  Lock as LockIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { Achievement } from './api';

interface AchievementCardProps {
  achievement: Achievement;
  isLocked?: boolean;
}

const getAchievementIcon = (key: string) => {
  if (key.includes('streak')) return '🔥';
  if (key.includes('first')) return '🌟';
  if (key.includes('master')) return '👑';
  if (key.includes('focus')) return '🎯';
  if (key.includes('journal')) return '📝';
  if (key.includes('wellness')) return '💪';
  return '🏆';
};

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};

export default function AchievementCard({ achievement, isLocked = false }: AchievementCardProps) {
  return (
    <Card 
      sx={{ 
        height: '100%',
        opacity: isLocked ? 0.6 : 1,
        position: 'relative',
        '&:hover': { 
          boxShadow: isLocked ? 2 : 6,
          transform: isLocked ? 'none' : 'translateY(-4px)',
          transition: 'all 0.3s ease'
        }
      }}
    >
      <CardContent sx={{ textAlign: 'center', pb: 2 }}>
        {isLocked && (
          <Box 
            sx={{ 
              position: 'absolute', 
              top: 8, 
              right: 8,
              color: 'text.secondary'
            }}
          >
            <LockIcon fontSize="small" />
          </Box>
        )}
        
        <Box 
          sx={{ 
            fontSize: '3rem', 
            mb: 1,
            filter: isLocked ? 'grayscale(100%)' : 'none'
          }}
        >
          {isLocked ? '❓' : getAchievementIcon(achievement.achievementKey)}
        </Box>
        
        <Typography 
          variant="h6" 
          gutterBottom
          sx={{ 
            color: isLocked ? 'text.secondary' : 'text.primary',
            fontWeight: isLocked ? 'normal' : 'bold'
          }}
        >
          {isLocked ? 'Locked Achievement' : achievement.achievementKey.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
        </Typography>
        
        {!isLocked && achievement.unlockedAt && (
          <Chip
            icon={<StarIcon />}
            label={`Unlocked ${formatDate(achievement.unlockedAt)}`}
            size="small"
            color="success"
            sx={{ mt: 1 }}
          />
        )}
        
        {isLocked && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Complete more activities to unlock
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
