import { useState, useEffect } from 'react';
import { trackFocusSession } from '../../utils/analytics';
import {
  Box,
  Button,
  Typography,
  Paper,
  LinearProgress,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Refresh as ResetIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';

export default function PomodoroTimer() {
  const [duration, setDuration] = useState(25); // minutes
  const [timeLeft, setTimeLeft] = useState(duration * 60); // seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);

  useEffect(() => {
    setTimeLeft(duration * 60);
  }, [duration]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      
      // Track focus session completion
      if (!isBreak) {
        trackFocusSession(duration, 'pomodoro', 'cowork');
      }
      
      // Auto-switch to break or work
      if (isBreak) {
        setIsBreak(false);
        setDuration(25);
      } else {
        setIsBreak(true);
        setDuration(5);
      }
      // Play sound notification (optional)
      if (typeof Audio !== 'undefined') {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTcIGWi77eWfTRALUKbk77ZiHAU7k9jy0X4yBSl+zPLaizsKGGS57OihUBELTKXh8bllHgU2jdXx0oU2Byp7yvLajDkJF2O37OihUhEJS6Xh8bdlHgU2jdXx0oU2Byp7yvLajDkJGGO37OihUhEJS6Th8bdlHgU1jdXx0oU3Byp7yvLajDkJF2O37OihUhEJS6Th8bdlHgU1jdXx0oU3Byp7yvLajDkJF2K37eihUREJS6Th8bdlHgU1jdXy0oU3Byp7yvLajDkJF2K37eihUREJS6Th8bdlHgU1jdXy0oU3Byp7yvLajDkJF2K37eihUREJS6Th8bdlHgU1jdXy0oU3Byp7yvLajDkJF2K37eihUREJS6Th8bdlHgU1jdXy0oU3Byp7yvLajDkJF2K37eihUREJS6Th8bdlHgU1jdXy0oU3Byp7yvLajDkJF2K37eihUREJS6Th8bdlHgU1jdXy0oU3Byp7yvLajDkJF2K37eihURH=');
        audio.play().catch(() => {});
      }
    }

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak]);

  const handlePlayPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(duration * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TimerIcon sx={{ mr: 1 }} />
        <Typography variant="h6">Pomodoro Timer</Typography>
      </Box>

      {!isRunning && (
        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Duration</InputLabel>
          <Select
            value={duration}
            label="Duration"
            onChange={(e) => setDuration(e.target.value as number)}
            disabled={isRunning}
          >
            <MenuItem value={5}>5 minutes (Break)</MenuItem>
            <MenuItem value={15}>15 minutes (Short)</MenuItem>
            <MenuItem value={25}>25 minutes (Standard)</MenuItem>
            <MenuItem value={45}>45 minutes (Deep Work)</MenuItem>
            <MenuItem value={60}>60 minutes (Extended)</MenuItem>
          </Select>
        </FormControl>
      )}

      <Box sx={{ textAlign: 'center', my: 3 }}>
        <Typography variant="h2" fontWeight="bold" color={isBreak ? 'success.main' : 'primary.main'}>
          {formatTime(timeLeft)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isBreak ? 'Break Time' : 'Focus Time'}
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ mb: 2, height: 8, borderRadius: 1 }}
        color={isBreak ? 'success' : 'primary'}
      />

      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
        <Button
          variant="contained"
          startIcon={isRunning ? <PauseIcon /> : <PlayIcon />}
          onClick={handlePlayPause}
        >
          {isRunning ? 'Pause' : 'Start'}
        </Button>
        <IconButton onClick={handleReset} disabled={isRunning}>
          <ResetIcon />
        </IconButton>
      </Box>
    </Paper>
  );
}
