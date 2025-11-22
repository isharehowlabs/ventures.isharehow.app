import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  IconButton,
  Chip,
  Button,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { Goal } from './api';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
  onUpdateProgress: (goalId: string, newProgress: number) => void;
}

const getCategoryColor = (category: string): 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' => {
  switch (category?.toLowerCase()) {
    case 'fitness':
      return 'error';
    case 'mental':
      return 'info';
    case 'spiritual':
      return 'secondary';
    case 'nutrition':
      return 'success';
    default:
      return 'primary';
  }
};

const getDeadlineUrgency = (deadline?: string) => {
  if (!deadline) return null;
  
  const deadlineDate = new Date(deadline);
  const now = new Date();
  const daysUntil = Math.floor((deadlineDate.getTime() - now.getTime()) / 86400000);
  
  if (daysUntil < 0) {
    return { color: 'error' as const, text: 'Overdue' };
  } else if (daysUntil <= 3) {
    return { color: 'error' as const, text: `${daysUntil}d left` };
  } else if (daysUntil <= 7) {
    return { color: 'warning' as const, text: `${daysUntil}d left` };
  } else {
    return { color: 'info' as const, text: deadlineDate.toLocaleDateString() };
  }
};

export default function GoalCard({ goal, onEdit, onDelete, onUpdateProgress }: GoalCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  
  const progress = goal.targetValue > 0 
    ? Math.min(100, (goal.currentProgress / goal.targetValue) * 100)
    : 0;
  
  const urgency = getDeadlineUrgency(goal.deadline);

  const handleIncrementProgress = async () => {
    setIsUpdating(true);
    const newProgress = Math.min(goal.targetValue, goal.currentProgress + 1);
    await onUpdateProgress(goal.id, newProgress);
    setIsUpdating(false);
  };

  return (
    <Card sx={{ mb: 2, '&:hover': { boxShadow: 4 } }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" gutterBottom>
              {goal.title}
            </Typography>
            {goal.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {goal.description}
              </Typography>
            )}
            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              {goal.category && (
                <Chip
                  label={goal.category}
                  size="small"
                  color={getCategoryColor(goal.category)}
                />
              )}
              {urgency && (
                <Chip
                  label={urgency.text}
                  size="small"
                  color={urgency.color}
                  variant="outlined"
                />
              )}
            </Box>
          </Box>
          <Box>
            <IconButton size="small" onClick={() => onEdit(goal)}>
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton size="small" onClick={() => onDelete(goal.id)} color="error">
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        
        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="body2" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="body2" fontWeight="bold">
              {goal.currentProgress} / {goal.targetValue}
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ height: 8, borderRadius: 1 }}
          />
        </Box>
        
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={handleIncrementProgress}
          disabled={isUpdating || goal.currentProgress >= goal.targetValue}
          fullWidth
          variant="outlined"
        >
          Update Progress
        </Button>
      </CardContent>
    </Card>
  );
}
