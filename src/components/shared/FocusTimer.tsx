import { useState } from 'react';
import {
  Box,
  IconButton,
  Popover,
  Chip,
} from '@mui/material';
import {
  Timer as TimerIcon,
} from '@mui/icons-material';
import { useTimer } from '../../contexts/TimerContext';
import PomodoroTimer from './PomodoroTimer';

interface FocusTimerProps {
  location?: 'rise' | 'cowork';
}

export default function FocusTimer({ location = 'cowork' }: FocusTimerProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const { timerState } = useTimer();

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <IconButton
        onClick={handleClick}
        color={timerState?.isRunning ? (timerState.isBreak ? 'secondary' : 'primary') : 'default'}
        sx={{
          position: 'relative',
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
        aria-label="focus timer"
      >
        <TimerIcon />
        {timerState?.isRunning && (
          <Chip
            label={formatTime(timerState.timeLeft)}
            size="small"
            color={timerState.isBreak ? 'secondary' : 'primary'}
            sx={{
              position: 'absolute',
              top: -8,
              right: -8,
              height: 18,
              fontSize: '0.65rem',
              minWidth: 40,
            }}
          />
        )}
      </IconButton>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 350,
            maxWidth: '90vw',
            mt: 1,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <PomodoroTimer location={location} />
        </Box>
      </Popover>
    </>
  );
}

