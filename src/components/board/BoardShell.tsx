import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar as MuiToolbar,
  Typography,
  IconButton,
  CircularProgress,
  Alert,
  AlertTitle,
  Button,
} from '@mui/material';
import {
  Close as CloseIcon,
  CloudOff as CloudOffIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { BoardProvider, useBoardContext } from '../../contexts/BoardContext';
import CanvasLayer from './CanvasLayer';
import Toolbar from './Toolbar';
import PresenceSidebar from './PresenceSidebar';
import NotificationToast from './NotificationToast';
import CursorOverlay from './CursorOverlay';

interface BoardShellContentProps {
  onClose?: () => void;
}

function BoardShellContent({ onClose }: BoardShellContentProps) {
  const { boardId, isLoading, isConnected, error } = useBoardContext();
  const [currentTool, setCurrentTool] = useState<'pen' | 'rectangle' | 'circle' | 'line' | 'eraser'>('pen');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 700 });

  // Update canvas size based on window
  useEffect(() => {
    const updateSize = () => {
      const width = Math.min(window.innerWidth - 600, 1600);
      const height = Math.min(window.innerHeight - 200, 900);
      setCanvasSize({ width, height });
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      {/* Header */}
      <AppBar position="static" elevation={1} sx={{ bgcolor: 'background.paper', color: 'text.primary' }}>
        <MuiToolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, color: 'text.primary', fontWeight: 600 }}>
            Collaboration Board {boardId && `- ${boardId}`}
          </Typography>
          
          {/* Connection Status */}
          {!isConnected && (
            <Alert
              severity="warning"
              icon={<CloudOffIcon />}
              sx={{ mr: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}
              action={
                <Button size="small" color="inherit" onClick={() => window.location.reload()}>
                  Reconnect
                </Button>
              }
            >
              Using offline mode - changes may not sync
            </Alert>
          )}

          {onClose && (
            <IconButton edge="end" color="inherit" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          )}
        </MuiToolbar>
      </AppBar>

      {/* Error Banner */}
      {error && (
        <Alert
          severity="error"
          sx={{ m: 2 }}
          action={
            <IconButton size="small" onClick={() => window.location.reload()}>
              <RefreshIcon />
            </IconButton>
          }
        >
          <AlertTitle>Connection Error</AlertTitle>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {isLoading && !boardId && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            flexGrow: 1,
          }}
        >
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading board...</Typography>
        </Box>
      )}

      {/* Main Content */}
      {!isLoading && (
        <Box
          sx={{
            display: 'flex',
            flexGrow: 1,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Left Sidebar - Presence */}
          <Box sx={{ p: 2, bgcolor: 'background.paper', borderRight: 1, borderColor: 'divider' }}>
            <PresenceSidebar />
          </Box>

          {/* Left Toolbar */}
          <Box sx={{ p: 2, bgcolor: 'background.paper', borderRight: 1, borderColor: 'divider' }}>
            <Toolbar
              currentTool={currentTool}
              onToolChange={setCurrentTool}
              currentColor={currentColor}
              onColorChange={setCurrentColor}
              strokeWidth={strokeWidth}
              onStrokeWidthChange={setStrokeWidth}
            />
          </Box>

          {/* Canvas Area */}
          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              overflow: 'auto',
            }}
          >
            <CanvasLayer
              width={canvasSize.width}
              height={canvasSize.height}
              currentTool={currentTool}
              currentColor={currentColor}
              strokeWidth={strokeWidth}
            />
            <CursorOverlay />
          </Box>
        </Box>
      )}

      {/* Notifications */}
      <NotificationToast />
    </Box>
  );
}

interface BoardShellProps {
  boardId: string;
  userId: string;
  userName: string;
  onClose?: () => void;
}

export default function BoardShell({ boardId, userId, userName, onClose }: BoardShellProps) {
  return (
    <BoardProvider userId={userId} userName={userName}>
      <BoardShellWrapper boardId={boardId} onClose={onClose} />
    </BoardProvider>
  );
}

// Wrapper to set boardId after provider is ready
function BoardShellWrapper({ boardId, onClose }: { boardId: string; onClose?: () => void }) {
  const { actions } = useBoardContext();

  useEffect(() => {
    actions.setBoardId(boardId);

    // Broadcast join notification
    actions.broadcastNotification({
      type: 'join',
      message: 'joined the board',
      severity: 'info',
      actor: { userId: '', name: '' }, // Will be filled by context
    });

    // Cleanup on unmount
    return () => {
      actions.broadcastNotification({
        type: 'leave',
        message: 'left the board',
        severity: 'info',
        actor: { userId: '', name: '' },
      });
      actions.updatePresence('offline');
    };
  }, [boardId, actions]);

  return <BoardShellContent onClose={onClose} />;
}
