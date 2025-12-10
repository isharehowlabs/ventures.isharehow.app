import { useState, useEffect } from 'react';
import { trackFocusSession } from '../../utils/analytics';
import { logActivity } from '../wellness/api';
import { useAuth } from '../../hooks/useAuth';
import { useTimer } from '../../contexts/TimerContext';
import { useNotifications } from '../../contexts/NotificationContext';
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  LinearProgress,
  IconButton,
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';

interface PomodoroTimerProps {
  location?: string;
}

export default function PomodoroTimer({ location = 'rise' }: PomodoroTimerProps) {
  const [duration, setDuration] = useState(25);
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const { isAuthenticated } = useAuth();
  const { setTimerState } = useTimer();
  const { addNotification } = useNotifications();

  useEffect(() => {
    setTimeLeft(duration * 60);
  }, [duration]);

  // Update timer context for notification bell - update every second when running
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      setTimerState({
        isRunning: true,
        timeLeft,
        duration,
        isBreak,
        location: location as 'rise' | 'cowork',
      });
    } else if (!isRunning && timeLeft === 0) {
      // Timer completed, clear state after a brief delay
      setTimeout(() => {
        setTimerState(null);
      }, 1000);
    } else if (!isRunning) {
      setTimerState(null);
    }
  }, [isRunning, timeLeft, duration, isBreak, location, setTimerState]);

  useEffect(() => {
    if (!isRunning || timeLeft === 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          
          // Log completed session
          if (!isBreak) {
            trackFocusSession(duration, 'pomodoro', location as 'cowork' | 'rise');
            
            // Log to backend if authenticated
            if (isAuthenticated) {
              logActivity(
                'focus',
                'Pomodoro Session',
                `${duration} minutes`
              ).catch(err => console.error('Failed to log focus session:', err));
            }

            // Create notification for completed focus session
            addNotification({
              type: 'timer',
              title: 'Focus Session Complete! 🎉',
              message: `You completed a ${duration}-minute focus session. Great work!`,
              metadata: {
                timerDuration: duration,
                timerType: 'focus',
                link: location === 'rise' ? '/rise' : '/creative?tab=cowork',
              },
            }).catch(err => console.error('Failed to add notification:', err));
          } else {
            // Create notification for break completion
            addNotification({
              type: 'timer',
              title: 'Break Time Over',
              message: 'Your break is complete. Ready to focus again?',
              metadata: {
                timerDuration: duration,
                timerType: 'break',
                link: location === 'rise' ? '/rise' : '/creative?tab=cowork',
              },
            }).catch(err => console.error('Failed to add notification:', err));
          }
          
          // Send browser notification
          if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(
              !isBreak ? 'Focus Session Complete! 🎉' : 'Break Time Over',
              {
                body: !isBreak 
                  ? `You completed a ${duration}-minute focus session. Great work!`
                  : 'Your break is complete. Ready to focus again?',
                icon: '/icon-192.png',
                badge: '/icon-192.png',
                tag: `timer-${isBreak ? 'break' : 'focus'}-${Date.now()}`,
              }
            );
            setTimeout(() => notification.close(), 5000);
          }
          
          // Auto-switch between work and break
          if (isBreak) {
            setIsBreak(false);
            setDuration(25);
          } else {
            setIsBreak(true);
            setDuration(5);
          }
          
          // Play notification sound
          const audio = new Audio(
            'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuFzvLaiTcIGWi77eefTRAMUKfj8LZjHAY4ktfyzHksBSR3x/DdkEAKFF606+uoVRQKRp/g8r5sIQUrhc7y2ok3CBlou+3nn00QDFCN4/C2YxwGOJLX8sx5LAUkd8fw3ZBAC'
          );
          audio.play().catch(() => {});
          
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isBreak, duration, location, isAuthenticated, addNotification]);

  const handlePlayPause = () => {
    const newRunningState = !isRunning;
    setIsRunning(newRunningState);
    
    // Create notification when timer starts
    if (newRunningState) {
      addNotification({
        type: 'timer',
        title: isBreak ? 'Break Timer Started' : 'Focus Timer Started',
        message: isBreak 
          ? `Take a ${duration}-minute break. You've earned it!`
          : `Starting a ${duration}-minute focus session. Let's get productive!`,
        metadata: {
          timerDuration: duration,
          timerType: isBreak ? 'break' : 'focus',
          link: location === 'rise' ? '/rise' : '/labs',
        },
      }).catch(err => console.error('Failed to add notification:', err));
    }
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
    <Paper sx={{ p: 3, textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>
        Pomodoro Timer
      </Typography>
      
      <FormControl fullWidth sx={{ mb: 3 }} disabled={isRunning}>
        <InputLabel>Duration</InputLabel>
        <Select
          value={duration}
          label="Duration"
          onChange={(e) => setDuration(e.target.value as number)}
        >
          <MenuItem value={5}>5 minutes</MenuItem>
          <MenuItem value={15}>15 minutes</MenuItem>
          <MenuItem value={25}>25 minutes</MenuItem>
          <MenuItem value={45}>45 minutes</MenuItem>
          <MenuItem value={60}>60 minutes</MenuItem>
        </Select>
      </FormControl>

      <Typography variant="h2" fontWeight="bold" sx={{ my: 3 }}>
        {formatTime(timeLeft)}
      </Typography>

      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {isBreak ? 'Break Time' : 'Focus Time'}
      </Typography>

      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{ mb: 3, height: 8, borderRadius: 1 }}
        color={isBreak ? 'secondary' : 'primary'}
      />

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', alignItems: 'center' }}>
        <Button
          variant="contained"
          size="large"
          onClick={handlePlayPause}
          fullWidth
        >
          {isRunning ? 'Pause' : 'Start'}
        </Button>
        <IconButton
          onClick={handleReset}
          disabled={isRunning}
          color="primary"
        >
          <RefreshIcon />
        </IconButton>
      </Box>
    </Paper>
  );
}
