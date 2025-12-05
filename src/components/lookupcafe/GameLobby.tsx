import React, { useState, useEffect, useCallback } from 'react';
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
  Alert,
  Card,
  CardContent,
  CardActions,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  SportsEsports as GuessingIcon,
  Brush as DrawingIcon,
  Extension as PuzzleIcon,
  Add as CreateIcon,
  Login as JoinIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { useGameSocket } from '../../hooks/useGameSocket';
import { useAuth } from '../../hooks/useAuth';
import { GameType } from '../../types/game';
import GameRoom from './GameRoom';

export default function GameLobby() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { gameRoom, players, isConnected, error, createRoom, joinRoom } = useGameSocket();
  
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [view, setView] = useState<'menu' | 'create' | 'join'>('menu');
  const [isCreating, setIsCreating] = useState(false);

  // Auto-fill player name from authenticated user - check multiple fields
  useEffect(() => {
    if (isAuthenticated && user && !playerName) {
      // Try multiple fields for the display name (name is the primary field from backend)
      const displayName = user.name || user.email?.split('@')[0] || '';
      if (displayName) {
        setPlayerName(displayName);
        console.log('[GameLobby] Auto-filled player name from user profile:', displayName);
      }
    }
  }, [isAuthenticated, user, playerName]);

  // Debug: Log auth state changes
  useEffect(() => {
    console.log('[GameLobby] Auth state:', { 
      isAuthenticated, 
      authLoading,
      userName: user?.name,
      userEmail: user?.email,
      playerName 
    });
  }, [isAuthenticated, authLoading, user, playerName]);

  // If already in a game room, show the game room component
  if (gameRoom) {
    return <GameRoom />;
  }

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }

    createRoom({
      playerName: playerName.trim(),
      userId: user?.id,
      avatar: user?.avatar,
      roomCode: user?.id || undefined,
    });
  };

  const handleJoinRoom = () => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }

    if (!roomCode.trim() || roomCode.length !== 9) {
      alert('Please enter a valid 9-character room code');
      return;
    }

    joinRoom({
      roomCode: roomCode.trim().toUpperCase(),
      playerName: playerName.trim(),
      userId: user?.id,
      avatar: user?.avatar,
    });
  };

  const handleCopyRoomCode = () => {
    if (gameRoom?.roomCode) {
      navigator.clipboard.writeText(gameRoom.roomCode);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box textAlign="center" mb={4}>
        <Typography variant="h2" component="h1" gutterBottom fontWeight="bold">
          🎮 LookUp.Cafe
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          Play Realtime Mini-Games with Family & Friends
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Up to 16 players • Guessing Games • Drawing Games • Puzzles
        </Typography>
        
        {!isConnected && (
          <Alert severity="warning" sx={{ mt: 2, maxWidth: 600, mx: 'auto' }}>
            <Box display="flex" alignItems="center" gap={1}>
              <CircularProgress size={16} />
              <span>Connecting to game server...</span>
            </Box>
          </Alert>
        )}
        
        {isAuthenticated && user?.name && (
          <Alert severity="info" sx={{ mt: 2, maxWidth: 600, mx: 'auto' }}>
            Welcome, <strong>{user.name}</strong>! Your display name will be used automatically.
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mt: 2, maxWidth: 600, mx: 'auto' }}>
            {error}
          </Alert>
        )}
      </Box>

      {/* Main Menu */}
      {view === 'menu' && (
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={5}>
            <Card elevation={3}>
              <CardContent>
                <Box textAlign="center" mb={2}>
                  <CreateIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    Create Room
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Start a new game and invite friends
                  </Typography>
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={() => setView('create')}
                  sx={{ maxWidth: 300 }}
                >
                  {!isConnected ? 'Create Room...' : 'Create Room'}
                </Button>
              </CardActions>
            </Card>
          </Grid>

          <Grid item xs={12} md={5}>
            <Card elevation={3}>
              <CardContent>
                <Box textAlign="center" mb={2}>
                  <JoinIcon sx={{ fontSize: 60, color: 'secondary.main' }} />
                  <Typography variant="h5" gutterBottom fontWeight="bold">
                    Join Room
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Enter a room code to join friends
                  </Typography>
                </Box>
              </CardContent>
              <CardActions sx={{ justifyContent: 'center', pb: 3 }}>
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  onClick={() => setView('join')}
                  sx={{ maxWidth: 300 }}
                >
                  {!isConnected ? 'Join Room...' : 'Join Room'}
                </Button>
              </CardActions>
            </Card>
          </Grid>

          {/* Game Types Info */}
          <Grid item xs={12}>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" textAlign="center" gutterBottom>
              Available Games
            </Typography>
            <Grid container spacing={2} justifyContent="center" sx={{ mt: 1 }}>
              <Grid item xs={12} sm={4} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <GuessingIcon color="primary" sx={{ fontSize: 40 }} />
                  <Typography variant="subtitle1" fontWeight="bold">
                    Guessing Games
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Give clues, guess answers
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <DrawingIcon color="secondary" sx={{ fontSize: 40 }} />
                  <Typography variant="subtitle1" fontWeight="bold">
                    Drawing Games
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Draw and guess in realtime
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4} md={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <PuzzleIcon color="success" sx={{ fontSize: 40 }} />
                  <Typography variant="subtitle1" fontWeight="bold">
                    Puzzle Games
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Solve together as a team
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      )}

      {/* Create Room View */}
      {view === 'create' && (
        <Box maxWidth={600} mx="auto">
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Create New Room
            </Typography>
            
            {!isConnected && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CircularProgress size={16} />
                  <span>Waiting for game server connection...</span>
                </Box>
              </Alert>
            )}
            
            <TextField
              fullWidth
              label="Your Name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              margin="normal"
              helperText={isAuthenticated ? 'Using your account name' : 'Enter a display name'}
              disabled={isAuthenticated && !!playerName}
            />

            <Box mt={3} display="flex" gap={2}>
              <Button
                variant="outlined"
                onClick={() => setView('menu')}
                fullWidth
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleCreateRoom}
                fullWidth
                disabled={!playerName.trim() || !isConnected}
                startIcon={!isConnected ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {!isConnected ? 'Connecting...' : 'Create Room'}
              </Button>
            </Box>
          </Paper>
        </Box>
      )}

      {/* Join Room View */}
      {view === 'join' && (
        <Box maxWidth={600} mx="auto">
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h5" gutterBottom fontWeight="bold">
              Join Room
            </Typography>
            
            {!isConnected && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <CircularProgress size={16} />
                  <span>Waiting for game server connection...</span>
                </Box>
              </Alert>
            )}
            
            <TextField
              fullWidth
              label="Your Name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              margin="normal"
              helperText={isAuthenticated ? 'Using your account name' : 'Enter a display name'}
              disabled={isAuthenticated && !!playerName}
            />

            <TextField
              fullWidth
              label="Room Code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              margin="normal"
              helperText="Enter the 9-character room code"
              inputProps={{ maxLength: 9, style: { textTransform: 'uppercase' } }}
            />

            <Box mt={3} display="flex" gap={2}>
              <Button
                variant="outlined"
                onClick={() => setView('menu')}
                fullWidth
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleJoinRoom}
                fullWidth
                disabled={!playerName.trim() || roomCode.length !== 9 || !isConnected}
                startIcon={!isConnected ? <CircularProgress size={20} color="inherit" /> : null}
              >
                {!isConnected ? 'Connecting...' : 'Join Room'}
              </Button>
            </Box>
          </Paper>
        </Box>
      )}
    </Container>
  );
}
