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
      <AppBar position="static" elevation={1} sx={{ bgcolor: 'transparent', color: 'text.primary', backdropFilter: 'blur(10px)' }}>
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
          {/* Left Toolbar */}
          <Box 
            sx={{ 
              p: 2, 
              bgcolor: 'transparent', 
              borderRight: 1, 
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              overflow: 'auto',
              width: 280,
              minWidth: 280,
              maxWidth: 280,
            }}
          >
            <Box sx={{ flexShrink: 0 }}>
              <Toolbar
                currentTool={currentTool}
                onToolChange={setCurrentTool}
                currentColor={currentColor}
                onColorChange={setCurrentColor}
                strokeWidth={strokeWidth}
                onStrokeWidthChange={setStrokeWidth}
              />
            </Box>
            
            {/* Presence Sidebar at bottom */}
            <Box sx={{ flexShrink: 0, mt: 'auto' }}>
              <PresenceSidebar />
            </Box>
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
      <BoardShellWrapper boardId={boardId} userId={userId} userName={userName} onClose={onClose} />
    </BoardProvider>
  );
}

// Wrapper to set boardId after provider is ready
function BoardShellWrapper({ boardId, userId, userName, onClose }: { boardId: string; userId: string; userName: string; onClose?: () => void }) {
  const { actions, presence } = useBoardContext();
  const hasJoinedRef = React.useRef(false);
  const boardIdRef = React.useRef<string | null>(null);

  useEffect(() => {
    // Only set boardId if it changed
    if (boardIdRef.current !== boardId) {
      boardIdRef.current = boardId;
      actions.setBoardId(boardId);
      hasJoinedRef.current = false; // Reset join flag when board changes
    }
  }, [boardId, actions]);

  useEffect(() => {
    // Only update presence, no join/leave notifications
    if (!boardId || hasJoinedRef.current) return;

    // Check if user is already in presence (avoid duplicate updates on re-renders)
    const isAlreadyPresent = presence.has(userId);
    if (isAlreadyPresent) {
      hasJoinedRef.current = true;
      return;
    }

    // Mark that we're joining
    hasJoinedRef.current = true;

    // Update presence only, no notifications
    actions.updatePresence('active');

    // Cleanup on unmount - update presence only, no notifications
    return () => {
      if (hasJoinedRef.current) {
        actions.updatePresence('offline');
        hasJoinedRef.current = false;
      }
    };
  }, [boardId, userId, userName, presence, actions]);

  return <BoardShellContent onClose={onClose} />;
}
