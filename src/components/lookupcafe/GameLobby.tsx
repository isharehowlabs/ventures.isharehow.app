import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
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
  const [customRoomCode, setCustomRoomCode] = useState('');
  const [view, setView] = useState<'menu' | 'create' | 'join'>('menu');
  const [isCreating, setIsCreating] = useState(false);
  const [activeRooms, setActiveRooms] = useState<any[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(false);

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


  // Fetch active rooms
  const fetchActiveRooms = async () => {
    try {
      setLoadingRooms(true);
      const response = await fetch('https://api.ventures.isharehow.app/api/game/active-rooms');
      const data = await response.json();
      setActiveRooms(data.rooms || []);
    } catch (error) {
      console.error('Error fetching active rooms:', error);
    } finally {
      setLoadingRooms(false);
    }
  };

  // Fetch on mount and when returning to menu
  useEffect(() => {
    if (view === 'menu') {
      fetchActiveRooms();
    }
  }, [view]);

  // Listen for room updates
  useEffect(() => {
    const socket = (window as any).socket;
    if (socket) {
      socket.on('game:rooms-updated', fetchActiveRooms);
      return () => socket.off('game:rooms-updated', fetchActiveRooms);
    }
  }, []);
  // If already in a game room, show the game room component
  if (gameRoom) {
    return <GameRoom />;
  }

  const handleCreateRoom = () => {
    if (!playerName.trim()) {
      alert('Please enter your name');
      return;
    }

    // Validate custom room code if provided
    if (customRoomCode.trim()) {
      const code = customRoomCode.trim().toUpperCase();
      if (code.length !== 9) {
        alert('Room code must be exactly 9 characters');
        return;
      }
      if (!/^[A-Z0-9]+$/.test(code)) {
        alert('Room code can only contain letters and numbers');
        return;
      }
    }

    createRoom({
      playerName: playerName.trim(),
      userId: user?.id,
      avatar: user?.avatar,
      roomCode: customRoomCode.trim().toUpperCase() || undefined,
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

  useEffect(() => {
    // Initialize AdSense ads after component mounts
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <>
      <Head>
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-0501888641420535"
          crossOrigin="anonymous"
        />
      </Head>
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

          {/* Current Running Games */}
          <Grid item xs={12}>
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" textAlign="center" gutterBottom>
              🎮 Current Running Games
            </Typography>
            {loadingRooms ? (
              <Box textAlign="center" py={2}>
                <CircularProgress size={24} />
              </Box>
            ) : activeRooms.length === 0 ? (
              <Alert severity="info" sx={{ maxWidth: 600, mx: 'auto' }}>
                No active games right now. Create a room to start playing!
              </Alert>
            ) : (
              <Grid container spacing={2} justifyContent="center" sx={{ mt: 1 }}>
                {activeRooms.map((room) => (
                  <Grid item xs={12} sm={6} md={4} key={room.roomCode}>
                    <Card elevation={2}>
                      <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                          <Chip label={room.roomCode} color="primary" sx={{ fontFamily: 'monospace' }} />
                          <Chip 
                            label={room.state === 'lobby' ? 'Lobby' : `Round ${room.currentRound}/${room.maxRounds}`}
                            size="small"
                            color={room.state === 'lobby' ? 'default' : 'success'}
                          />
                        </Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {room.gameType === 'guessing' && '🤔 Guessing Game'}
                          {room.gameType === 'drawing' && '🎨 Drawing Game'}
                          {room.gameType === 'puzzle' && '🧩 Puzzle Game'}
                          {!room.gameType && '⏳ Setting up...'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Host: {room.hostName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Players: {room.playerCount}/{room.maxPlayers}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          variant="contained"
                          fullWidth
                          onClick={() => {
                            setRoomCode(room.roomCode);
                            setView('join');
                          }}
                          disabled={room.playerCount >= room.maxPlayers}
                        >
                          {room.playerCount >= room.maxPlayers ? 'Full' : room.state === 'lobby' ? 'Join' : 'Join (In Progress)'}
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
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

            <TextField
              fullWidth
              label="Custom Room Code (Optional)"
              value={customRoomCode}
              onChange={(e) => setCustomRoomCode(e.target.value.toUpperCase())}
              margin="normal"
              placeholder="Enter 9-digit code or leave blank for auto-generate"
              helperText="Create your own 9-character code, or leave blank to auto-generate"
              inputProps={{ 
                maxLength: 9, 
                style: { textTransform: 'uppercase', fontFamily: 'monospace', fontSize: '1.2rem', letterSpacing: '0.1em' } 
              }}
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
      
      {/* Google AdSense Ad Block at bottom */}
      <Box sx={{ mt: 6, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <Paper sx={{ p: 3, maxWidth: 728, width: '100%' }}>
          <ins 
            className="adsbygoogle"
            style={{ display: 'block', width: '100%', height: '90px' }}
            data-ad-format="auto"
            data-full-width-responsive="true"
            data-ad-client="ca-pub-0501888641420535"
            data-ad-slot="8218985343"
          />
        </Paper>
      </Box>
    </Container>
    </>
  );
}
