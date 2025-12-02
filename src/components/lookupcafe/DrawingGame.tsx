import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  LinearProgress,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  IconButton,
} from '@mui/material';
import {
  Send as SendIcon,
  Timer as TimerIcon,
  Clear as ClearIcon,
  Brush as BrushIcon,
} from '@mui/icons-material';
import { useGameSocket } from '../../hooks/useGameSocket';
import { Socket } from 'socket.io-client';
import { getSocket } from '../../utils/socket';

const ROUND_DURATION = 90; // 90 seconds per round
const COLORS = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'];

export default function DrawingGame() {
  const { gameRoom, players, submitAnswer, sendDrawing, clearCanvas } = useGameSocket();
  const [guess, setGuess] = useState('');
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const [hasGuessed, setHasGuessed] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [isDrawing, setIsDrawing] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // Get current player ID from socket
  const currentPlayerId = socketRef.current?.id || '';
  const isDrawer = gameRoom?.currentDrawerId === currentPlayerId;

  // Initialize socket
  useEffect(() => {
    socketRef.current = getSocket();
  }, []);

  // Listen for drawing updates from other players
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleDrawingUpdate = (data: any) => {
      if (!canvasRef.current || data.playerId === currentPlayerId) return;
      
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const { stroke } = data;
      ctx.strokeStyle = stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      for (let i = 0; i < stroke.points.length - 2; i += 2) {
        ctx.moveTo(stroke.points[i], stroke.points[i + 1]);
        if (i + 2 < stroke.points.length) {
          ctx.lineTo(stroke.points[i + 2], stroke.points[i + 3]);
        }
      }
      ctx.stroke();
    };

    const handleCanvasClear = () => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    };

    socket.on('game:drawing-update', handleDrawingUpdate);
    socket.on('game:canvas-cleared', handleCanvasClear);

    return () => {
      socket.off('game:drawing-update', handleDrawingUpdate);
      socket.off('game:canvas-cleared', handleCanvasClear);
    };
  }, [currentPlayerId]);

  // Timer countdown
  useEffect(() => {
    if (gameRoom?.state === 'playing' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameRoom?.state, timeLeft]);

  // Reset on new round
  useEffect(() => {
    if (gameRoom?.state === 'playing') {
      setTimeLeft(ROUND_DURATION);
      setHasGuessed(false);
      setGuess('');
      
      // Clear canvas
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
    }
  }, [gameRoom?.currentRound]);

  // Canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawer) return;
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !isDrawer || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.strokeStyle = selectedColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);

    // Send to other players
    if (gameRoom) {
      sendDrawing({
        roomCode: gameRoom.roomCode,
        stroke: {
          points: [x, y],
          color: selectedColor,
          width: 3,
        },
        playerId: currentPlayerId,
      });
    }
  };

  const stopDrawing = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.beginPath();
    }
    setIsDrawing(false);
  };

  const handleClearCanvas = () => {
    if (!canvasRef.current || !gameRoom) return;
    const ctx = canvasRef.current.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    clearCanvas(gameRoom.roomCode);
  };

  const handleSubmitGuess = () => {
    if (!guess.trim() || !gameRoom) return;
    
    submitAnswer({
      roomCode: gameRoom.roomCode,
      answer: guess.trim(),
    });
    
    setHasGuessed(true);
    setGuess('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !hasGuessed) {
      handleSubmitGuess();
    }
  };

  if (!gameRoom) return null;

  const progress = (timeLeft / ROUND_DURATION) * 100;
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Main Game Area */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5" fontWeight="bold">
                Round {gameRoom.currentRound} of {gameRoom.maxRounds}
              </Typography>
              <Chip
                icon={<TimerIcon />}
                label={`${timeLeft}s`}
                color={timeLeft < 10 ? 'error' : 'primary'}
                sx={{ fontSize: '1.2rem', px: 1 }}
              />
            </Box>

            {/* Timer Bar */}
            <LinearProgress
              variant="determinate"
              value={progress}
              color={timeLeft < 10 ? 'error' : 'primary'}
              sx={{ height: 8, borderRadius: 1, mb: 3 }}
            />

            {/* Role Info */}
            {isDrawer ? (
              <Alert severity="info" sx={{ mb: 2 }}>
                <strong>You're drawing!</strong> Word: {gameRoom.currentWord || '...'}
              </Alert>
            ) : (
              <Alert severity="success" sx={{ mb: 2 }}>
                Watch the drawing and guess the word!
              </Alert>
            )}

            {/* Canvas */}
            <Box sx={{ mb: 2, border: '2px solid', borderColor: 'divider', borderRadius: 1, bgcolor: 'white' }}>
              <canvas
                ref={canvasRef}
                width={600}
                height={400}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                style={{
                  display: 'block',
                  width: '100%',
                  cursor: isDrawer ? 'crosshair' : 'default',
                }}
              />
            </Box>

            {/* Drawing Tools (only for drawer) */}
            {isDrawer && (
              <Box display="flex" gap={2} alignItems="center" mb={2}>
                <BrushIcon />
                <ToggleButtonGroup
                  value={selectedColor}
                  exclusive
                  onChange={(e, value) => value && setSelectedColor(value)}
                  size="small"
                >
                  {COLORS.map(color => (
                    <ToggleButton key={color} value={color}>
                      <Box sx={{ width: 24, height: 24, bgcolor: color, border: '1px solid #ccc' }} />
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
                <IconButton onClick={handleClearCanvas} color="error">
                  <ClearIcon />
                </IconButton>
              </Box>
            )}

            {/* Guess Input (only for guessers) */}
            {!isDrawer && (
              <>
                {!hasGuessed && timeLeft > 0 ? (
                  <Box display="flex" gap={2}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="Type your guess..."
                      value={guess}
                      onChange={(e) => setGuess(e.target.value)}
                      onKeyPress={handleKeyPress}
                      autoFocus
                    />
                    <Button
                      variant="contained"
                      endIcon={<SendIcon />}
                      onClick={handleSubmitGuess}
                      disabled={!guess.trim()}
                      sx={{ minWidth: 120 }}
                    >
                      Guess
                    </Button>
                  </Box>
                ) : hasGuessed ? (
                  <Alert severity="success">
                    Your guess has been submitted!
                  </Alert>
                ) : (
                  <Alert severity="info">
                    Time's up!
                  </Alert>
                )}
              </>
            )}
          </Paper>
        </Grid>

        {/* Scoreboard */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Scoreboard
            </Typography>
            <List>
              {sortedPlayers.map((player, index) => (
                <ListItem key={player.id}>
                  <ListItemAvatar>
                    <Chip
                      label={index + 1}
                      size="small"
                      color={index === 0 ? 'primary' : 'default'}
                      sx={{ mr: 1 }}
                    />
                    <Avatar src={player.avatar}>
                      {player.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={player.name}
                    secondary={`${player.score} pts`}
                  />
                  {player.id === gameRoom.currentDrawerId && (
                    <Chip label="Drawing" size="small" color="primary" />
                  )}
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
