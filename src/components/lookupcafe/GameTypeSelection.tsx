import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Alert,
  IconButton,
} from '@mui/material';
import {
  SportsEsports as GuessingIcon,
  Brush as DrawingIcon,
  Extension as PuzzleIcon,
  ContentCopy as CopyIcon,
} from '@mui/icons-material';
import { GameType } from '../../types/game';

interface GameTypeSelectionProps {
  roomCode: string;
  onSelectGame: (gameType: GameType) => void;
}

export default function GameTypeSelection({ roomCode, onSelectGame }: GameTypeSelectionProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const gameTypes = [
    {
      type: 'guessing' as GameType,
      icon: <GuessingIcon sx={{ fontSize: 80, color: 'primary.main' }} />,
      title: 'Guessing Game',
      description: 'Give clues and guess words',
      duration: '60 seconds per round',
      players: '2-16 players',
      color: '#4B5DBD',
    },
    {
      type: 'drawing' as GameType,
      icon: <DrawingIcon sx={{ fontSize: 80, color: 'secondary.main' }} />,
      title: 'Drawing Game',
      description: 'Draw and guess in real-time',
      duration: '90 seconds per round',
      players: '2-16 players',
      color: '#6c757d',
    },
    {
      type: 'puzzle' as GameType,
      icon: <PuzzleIcon sx={{ fontSize: 80, color: 'success.main' }} />,
      title: 'Puzzle Game',
      description: 'Solve riddles together as a team',
      duration: '120 seconds per round',
      players: '2-16 players',
      color: '#28a745',
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Room Code Display */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 4,
          textAlign: 'center',
          bgcolor: 'primary.main',
          color: 'white',
        }}
      >
        <Typography variant="h5" gutterBottom>
          Your Room Code
        </Typography>
        <Box display="flex" alignItems="center" justifyContent="center" gap={2}>
          <Typography
            variant="h3"
            fontWeight="bold"
            sx={{
              letterSpacing: 4,
              fontFamily: 'monospace',
            }}
          >
            {roomCode}
          </Typography>
          <IconButton
            onClick={handleCopyCode}
            sx={{
              color: 'white',
              bgcolor: 'rgba(255,255,255,0.2)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' },
            }}
          >
            <CopyIcon />
          </IconButton>
        </Box>
        {copied && (
          <Typography variant="body2" sx={{ mt: 1 }}>
            ✓ Code copied to clipboard!
          </Typography>
        )}
        <Typography variant="body1" sx={{ mt: 2, opacity: 0.9 }}>
          Share this code with your friends to join
        </Typography>
      </Paper>

      {/* Game Selection */}
      <Box textAlign="center" mb={4}>
        <Typography variant="h3" gutterBottom fontWeight="bold">
          What game are you going to play?
        </Typography>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Choose a game type for your room
        </Typography>
      </Box>

      <Grid container spacing={3} justifyContent="center">
        {gameTypes.map((game) => (
          <Grid item xs={12} sm={6} md={4} key={game.type}>
            <Card
              elevation={3}
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: 6,
                },
              }}
            >
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                <Box mb={2}>{game.icon}</Box>
                <Typography variant="h5" gutterBottom fontWeight="bold">
                  {game.title}
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  {game.description}
                </Typography>
                <Box mt={2}>
                  <Typography variant="body2" color="text.secondary">
                    ⏱️ {game.duration}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    👥 {game.players}
                  </Typography>
                </Box>
              </CardContent>
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={() => onSelectGame(game.type)}
                  sx={{
                    bgcolor: game.color,
                    '&:hover': {
                      bgcolor: game.color,
                      filter: 'brightness(0.9)',
                    },
                  }}
                >
                  Select {game.title}
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Alert severity="info" sx={{ mt: 4 }}>
        <strong>Note:</strong> Once you select a game type, all players joining with your room code will enter that game.
        You can start the game once at least 2 players have joined.
      </Alert>
    </Container>
  );
}
