'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Button,
  Autocomplete,
  TextField,
  Chip,
  Tooltip,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Clear as ClearIcon,
  Brush as BrushIcon,
  Person as PersonIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { getTasksSocket } from '../../utils/socket';
import { Socket } from 'socket.io-client';
import { useWorkspaceUsers } from '../../hooks/useWorkspaceUsers';
import { useAuth } from '../../hooks/useAuth';

interface DrawingStroke {
  points: number[];
  color: string;
  width: number;
  userId: string;
  timestamp: number;
}

interface CollaborativeDrawingPadProps {
  height?: number;
}

export default function CollaborativeDrawingPad({ height = 500 }: CollaborativeDrawingPadProps) {
  const { user } = useAuth();
  const { users: workspaceUsers } = useWorkspaceUsers();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);
  const currentStrokeRef = useRef<number[]>([]);
  
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [assignedUser, setAssignedUser] = useState<{id: string, name: string} | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeUsers, setActiveUsers] = useState<Set<string>>(new Set());
  
  const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB'];
  
  // Initialize socket connection
  useEffect(() => {
    const socket = getTasksSocket();
    socketRef.current = socket;
    
    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('drawing:join');
    });
    
    socket.on('disconnect', () => {
      setIsConnected(false);
    });
    
    // Listen for drawing updates from other users
    socket.on('drawing:stroke', (data: { stroke: DrawingStroke; userId: string; userName?: string }) => {
      drawStroke(data.stroke, false);
      if (data.userName) {
        setActiveUsers(prev => new Set([...prev, data.userName || data.userId]));
      }
    });
    
    // Listen for canvas clear
    socket.on('drawing:clear', () => {
      clearCanvas();
    });
    
    // Listen for full canvas state (when joining)
    socket.on('drawing:state', (data: { strokes: DrawingStroke[] }) => {
      clearCanvas();
      data.strokes.forEach(stroke => {
        drawStroke(stroke, false);
      });
    });
    
    // Listen for user presence updates
    socket.on('drawing:user_joined', (data: { userId: string; userName: string }) => {
      setActiveUsers(prev => new Set([...prev, data.userName || data.userId]));
    });
    
    socket.on('drawing:user_left', (data: { userId: string }) => {
      setActiveUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.userId);
        return newSet;
      });
    });
    
    return () => {
      socket.off('drawing:stroke');
      socket.off('drawing:clear');
      socket.off('drawing:state');
      socket.off('drawing:user_joined');
      socket.off('drawing:user_left');
      socket.emit('drawing:leave');
    };
  }, []);
  
  // Draw a stroke on the canvas
  const drawStroke = useCallback((stroke: DrawingStroke, isLocal: boolean = true) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    if (stroke.points.length < 4) return;
    
    ctx.beginPath();
    ctx.moveTo(stroke.points[0], stroke.points[1]);
    
    for (let i = 2; i < stroke.points.length; i += 2) {
      ctx.lineTo(stroke.points[i], stroke.points[i + 1]);
    }
    
    ctx.stroke();
    
    // Emit to other users if this is a local stroke
    if (isLocal && socketRef.current && isConnected) {
      socketRef.current.emit('drawing:stroke', {
        stroke,
        userId: user?.id || 'anonymous',
        userName: user?.name || user?.email || 'Anonymous',
      });
    }
  }, [user, isConnected]);
  
  // Clear canvas
  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, []);
  
  // Get mouse position relative to canvas
  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    // Calculate position relative to canvas display size
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    return { x, y };
  };
  
  // Drawing handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Allow drawing for all users (remove assignment restriction for now)
    isDrawingRef.current = true;
    const pos = getMousePos(e);
    lastPointRef.current = pos;
    currentStrokeRef.current = [pos.x, pos.y];
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !lastPointRef.current) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const pos = getMousePos(e);
    
    // Draw locally
    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    
    // Add point to current stroke
    currentStrokeRef.current.push(pos.x, pos.y);
    
    lastPointRef.current = pos;
  };
  
  const handleMouseUp = () => {
    if (!isDrawingRef.current) return;
    
    // Send complete stroke
    if (currentStrokeRef.current.length >= 4 && socketRef.current && isConnected) {
      const stroke: DrawingStroke = {
        points: currentStrokeRef.current,
        color: selectedColor,
        width: strokeWidth,
        userId: user?.id || 'anonymous',
        timestamp: Date.now(),
      };
      
      socketRef.current.emit('drawing:stroke', {
        stroke,
        userId: user?.id || 'anonymous',
        userName: user?.name || user?.email || 'Anonymous',
      });
    }
    
    isDrawingRef.current = false;
    lastPointRef.current = null;
    currentStrokeRef.current = [];
  };
  
  // Handle canvas clear
  const handleClear = () => {
    clearCanvas();
    if (socketRef.current && isConnected) {
      socketRef.current.emit('drawing:clear');
    }
  };
  
  // Handle save (store canvas state)
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Convert canvas to data URL
      const dataUrl = canvas.toDataURL('image/png');
      
      // Store in localStorage as backup
      localStorage.setItem('workspace_drawing', dataUrl);
      
      // Could also send to backend for persistence
      // await saveDrawingToBackend(dataUrl);
      
      setIsSaving(false);
    } catch (err) {
      console.error('Error saving drawing:', err);
      setError('Failed to save drawing');
      setIsSaving(false);
    }
  };
  
  // Load saved drawing on mount
  useEffect(() => {
    const saved = localStorage.getItem('workspace_drawing');
    if (saved && canvasRef.current) {
      const img = new Image();
      img.onload = () => {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
        }
      };
      img.src = saved;
    }
  }, []);
  
  // Set canvas size to match display size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      
      // Set canvas internal size to match display size exactly
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Redraw saved content if exists
        const saved = localStorage.getItem('workspace_drawing');
        if (saved) {
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0, rect.width, rect.height);
          };
          img.src = saved;
        }
      }
    };
    
    // Initial resize
    resizeCanvas();
    
    // Resize on window resize or container resize
    const resizeObserver = new ResizeObserver(() => {
      // Use setTimeout to ensure DOM has updated
      setTimeout(resizeCanvas, 0);
    });
    
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }
    
    // Also listen to window resize
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);
  
  return (
    <Paper elevation={2} sx={{ p: 3, height, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BrushIcon />
          <Typography variant="h5" fontWeight={700}>Collaborative Drawing Pad</Typography>
          {!isConnected && (
            <Chip label="Connecting..." size="small" color="warning" />
          )}
          {isConnected && (
            <Chip label="Connected" size="small" color="success" />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Save drawing">
            <IconButton onClick={handleSave} disabled={isSaving} size="small">
              <SaveIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Clear canvas">
            <IconButton onClick={handleClear} size="small">
              <ClearIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {/* User Assignment */}
      <Box sx={{ mb: 2 }}>
        <Autocomplete
          options={workspaceUsers}
          getOptionLabel={(option) => option.name}
          value={assignedUser}
          onChange={(_, newValue) => {
            setAssignedUser(newValue);
            if (socketRef.current && isConnected && newValue) {
              socketRef.current.emit('drawing:assign_user', {
                assignedUserId: newValue.id,
                assignedUserName: newValue.name,
              });
            }
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              label="Assign Co-Drawer (Optional)"
              variant="outlined"
              helperText="Assign another user to collaborate on this drawing"
            />
          )}
        />
      </Box>
      
      {/* Active Users */}
      {activeUsers.size > 0 && (
        <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Active:
          </Typography>
          {Array.from(activeUsers).map((userId) => (
            <Chip
              key={userId}
              icon={<PersonIcon />}
              label={userId}
              size="small"
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
      )}
      
      {/* Color Picker */}
      <Box sx={{ mb: 2, display: 'flex', gap: 1, alignItems: 'center' }}>
        <Typography variant="caption" sx={{ mr: 1 }}>Color:</Typography>
        {colors.map((color) => (
          <Box
            key={color}
            onClick={() => setSelectedColor(color)}
            sx={{
              width: 32,
              height: 32,
              bgcolor: color,
              border: selectedColor === color ? 3 : 1,
              borderColor: selectedColor === color ? 'primary.main' : 'divider',
              borderRadius: 1,
              cursor: 'pointer',
              '&:hover': { opacity: 0.8 },
            }}
          />
        ))}
      </Box>
      
      {/* Stroke Width */}
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Typography variant="caption">Width:</Typography>
        <Button
          size="small"
          variant={strokeWidth === 2 ? 'contained' : 'outlined'}
          onClick={() => setStrokeWidth(2)}
        >
          Thin
        </Button>
        <Button
          size="small"
          variant={strokeWidth === 3 ? 'contained' : 'outlined'}
          onClick={() => setStrokeWidth(3)}
        >
          Medium
        </Button>
        <Button
          size="small"
          variant={strokeWidth === 5 ? 'contained' : 'outlined'}
          onClick={() => setStrokeWidth(5)}
        >
          Thick
        </Button>
      </Box>
      
      {/* Canvas */}
      <Box
        sx={{
          flexGrow: 1,
          border: 1,
          borderColor: 'divider',
          borderRadius: 1,
          overflow: 'hidden',
          bgcolor: '#ffffff',
          position: 'relative',
        }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            width: '100%',
            height: '100%',
            cursor: 'crosshair',
            touchAction: 'none',
          }}
        />
      </Box>
    </Paper>
  );
}

