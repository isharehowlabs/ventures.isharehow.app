import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Chip,
  Divider,
  Card,
  CardContent,
  IconButton,
  Alert,
} from '@mui/material';
import {
  ExitToApp as LeaveIcon,
  ContentCopy as CopyIcon,
  PlayArrow as StartIcon,
  SportsEsports as GuessingIcon,
  Brush as DrawingIcon,
  Extension as PuzzleIcon,
  EmojiEvents as TrophyIcon,
} from '@mui/icons-material';
import { useGameSocket } from '../../hooks/useGameSocket';
import { GameType } from '../../types/game';
import GuessingGame from './GuessingGame';
import DrawingGame from './DrawingGame';
import PuzzleGame from './PuzzleGame';
import GameTypeSelection from './GameTypeSelection';
import ChatPanel from './ChatPanel';


export default function GameRoom() {
  const { gameRoom, players, socketId, leaveRoom, setGameType, startGame } = useGameSocket();

  if (!gameRoom) return null;

  // Find current player by socket ID
  const currentPlayer = players.find(p => p.id === socketId);
  const isHost = currentPlayer?.isHost || false;
  const isLobby = gameRoom.state === 'lobby';
  const isPlaying = gameRoom.state === 'playing';
  const isGameEnd = gameRoom.state === 'gameEnd';

  console.log('[GameRoom] State:', { isLobby, isPlaying, isGameEnd, gameType: gameRoom.gameType, state: gameRoom.state, roundPhase: (gameRoom as any)?.roundPhase });

  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(gameRoom.roomCode);
    // Could add a snackbar notification here
  };

  const handleStartGame = () => {
    if (isHost && gameRoom.gameType) {
      startGame({
        roomCode: gameRoom.roomCode,
        gameType: gameRoom.gameType!,
        maxRounds: 5,
      });
    }
  };

  const handleSelectGameType = (gameType: GameType) => {
    if (gameRoom) {
      setGameType(gameRoom.roomCode, gameType);
    }
  };

  const handleLeaveRoom = () => {
    if (confirm('Are you sure you want to leave the room?')) {
      leaveRoom();
    }
  };

  // Render active game
  if (isPlaying) {
    switch (gameRoom.gameType) {
      case 'guessing':
        return <GuessingGame />;
      case 'drawing':
        return <DrawingGame />;
      case 'puzzle':
        return <PuzzleGame />;
      default:
        return null;
    }
  }

  // Render game end / results
  if (isGameEnd) {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <TrophyIcon sx={{ fontSize: 80, color: 'gold', mb: 2 }} />
          <Typography variant="h3" gutterBottom fontWeight="bold">
            Game Over!
          </Typography>
          
          <Box my={4}>
            <Typography variant="h5" gutterBottom>
              Final Scores
            </Typography>
            <List>
              {sortedPlayers.map((player, index) => (
                <ListItem key={player.id}>
                  <ListItemAvatar>
                    <Chip
                      label={index + 1}
                      color={index === 0 ? 'primary' : 'default'}
                      sx={{ mr: 1 }}
                    />
                    <Avatar src={player.avatar}>
                      {player.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={player.name}
                    secondary={`${player.score} points`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>

          <Button
            variant="contained"
            size="large"
            onClick={handleLeaveRoom}
            sx={{ mt: 2 }}
          >
            Back to Lobby
          </Button>
        </Paper>
      </Container>
    );
  }

  // Show game type selection for host if not set
  if (isLobby && !gameRoom.gameType && isHost) {
    return (
      <GameTypeSelection
        roomCode={gameRoom.roomCode}
        onSelectGame={handleSelectGameType}
      />
    );
  }

  // Show waiting for host to select game type
  if (isLobby && !gameRoom.gameType && !isHost) {
    return (
      <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom>
            Waiting for Host
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            The host is selecting the game type...
          </Typography>
          <Typography variant="h6" fontWeight="bold" sx={{ mt: 3 }}>
            Room Code: {gameRoom.roomCode}
          </Typography>
          <Button
            variant="outlined"
            onClick={handleLeaveRoom}
            sx={{ mt: 2 }}
          >
            Leave Room
          </Button>
        </Paper>
      </Container>
    );
  }

  // Render lobby (waiting room)
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Left: Room Info & Game Selection */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Box>
                <Typography variant="h4" gutterBottom fontWeight="bold">
                  Room: {gameRoom.roomCode}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {players.length} / 16 players
                </Typography>
              </Box>
              <Box>
                <IconButton onClick={handleCopyRoomCode} color="primary">
                  <CopyIcon />
                </IconButton>
                <Button
                  variant="outlined"
                  startIcon={<LeaveIcon />}
                  onClick={handleLeaveRoom}
                  color="error"
                >
                  Leave
                </Button>
              </Box>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Alert severity="success" sx={{ mb: 3 }}>
              <strong>Game Type:</strong> {gameRoom.gameType === 'guessing' ? 'Guessing Game' : gameRoom.gameType === 'drawing' ? 'Drawing Game' : 'Puzzle Game'}
            </Alert>

            {isHost ? (
              <>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  startIcon={<StartIcon />}
                  onClick={handleStartGame}
                  disabled={players.length < 2}
                >
                  Start Game
                </Button>

                {players.length < 2 && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Need at least 2 players to start
                  </Alert>
                )}
              </>
            ) : (
              <Alert severity="info">
                Waiting for host to start the game...
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Right: Players List */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Players ({players.length}/16)
            </Typography>
            <List>
              {players.map((player) => (
                <ListItem key={player.id}>
                  <ListItemAvatar>
                    <Avatar src={player.avatar}>
                      {player.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={player.name}
                    secondary={player.isHost ? 'Host' : 'Player'}
                  />
                  {player.isHost && (
                    <Chip label="Host" size="small" color="primary" />
                  )}
                </ListItem>
              ))}
            </List>
          </Paper>
        
          
          {/* Chat Panel */}
          <Paper elevation={3} sx={{ p: 0, mt: 2, height: 300 }}>
            <ChatPanel 
              roomCode={gameRoom.roomCode}
              playerName={currentPlayer?.name || 'Guest'}
            />
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
