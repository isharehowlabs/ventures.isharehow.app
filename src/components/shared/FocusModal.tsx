import { useState, useEffect } from 'react';
import {
  Dialog,
  Box,
  Typography,
  Button,
  IconButton,
  Paper,
} from '@mui/material';
import {
  Close as CloseIcon,
  Visibility as EyeIcon,
  VisibilityOff as EyeOffIcon,
} from '@mui/icons-material';

interface FocusModalProps {
  open: boolean;
  onClose: () => void;
  duration?: number; // minutes
  message?: string;
}

export default function FocusModal({
  open,
  onClose,
  duration = 25,
  message = 'Focus Time - Minimize Distractions',
}: FocusModalProps) {
  const [timeLeft, setTimeLeft] = useState(duration * 60);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (open) {
      setTimeLeft(duration * 60);
    }
  }, [open, duration]);

  useEffect(() => {
    if (!open || timeLeft === 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [open, timeLeft, onClose]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!open) return null;

  if (isMinimized) {
    return (
      <Paper
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          p: 2,
          zIndex: 1400,
          minWidth: 200,
        }}
        elevation={8}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">{formatTime(timeLeft)}</Typography>
          <Box>
            <IconButton size="small" onClick={() => setIsMinimized(false)}>
              <EyeIcon />
            </IconButton>
            <IconButton size="small" onClick={(e) => {
              // #region agent log
              fetch('http://localhost:7242/ingest/e16e948f-78c5-4368-bec3-74cffd33f8bf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'FocusModal.tsx:81',message:'Close button clicked in minimized view',data:{eventType:e.type,currentTarget:e.currentTarget?.tagName},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
              // #endregion
              // #region agent log
              fetch('http://localhost:7242/ingest/e16e948f-78c5-4368-bec3-74cffd33f8bf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'FocusModal.tsx:84',message:'calling onClose',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
              // #endregion
              onClose();
            }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
        <Typography variant="caption" color="text.secondary">
          Focus Mode Active
        </Typography>
      </Paper>
    );
  }

  return (
    <Dialog
      open={open}
      fullScreen
      onClose={(event, reason) => {
        // #region agent log
        fetch('http://localhost:7242/ingest/e16e948f-78c5-4368-bec3-74cffd33f8bf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'FocusModal.tsx:105',message:'Dialog onClose triggered',data:{reason,eventType:event && 'type' in event ? (event as any).type : 'unknown',eventTarget:event && 'target' in event ? (event as any).target?.tagName : 'unknown'},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        // #region agent log
        fetch('http://localhost:7242/ingest/e16e948f-78c5-4368-bec3-74cffd33f8bf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'FocusModal.tsx:109',message:'Calling onClose unconditionally',data:{reason},timestamp:Date.now(),sessionId:'debug-session',runId:'run2',hypothesisId:'E'})}).catch(()=>{});
        // #endregion
        onClose();
      }}
      PaperProps={{
        sx: {
          bgcolor: 'background.default',
          backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7))',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          textAlign: 'center',
          p: 4,
        }}
      >
        <Typography variant="h2" fontWeight="bold" color="primary.main" gutterBottom>
          {formatTime(timeLeft)}
        </Typography>

        <Typography variant="h5" color="text.primary" sx={{ mb: 4, maxWidth: 600 }}>
          {message}
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 6 }}>
          Block out distractions and focus on what matters.
          <br />
          The timer will end automatically.
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<EyeOffIcon />}
            onClick={() => setIsMinimized(true)}
          >
            Minimize
          </Button>
          <Button variant="contained" color="error" onClick={(e) => {
            // #region agent log
            fetch('http://localhost:7242/ingest/e16e948f-78c5-4368-bec3-74cffd33f8bf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'FocusModal.tsx:137',message:'End Focus Session button clicked',data:{eventType:e.type,currentTarget:e.currentTarget?.tagName},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            // #region agent log
            fetch('http://localhost:7242/ingest/e16e948f-78c5-4368-bec3-74cffd33f8bf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'FocusModal.tsx:140',message:'calling onClose',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
            // #endregion
            onClose();
          }}>
            End Focus Session
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
