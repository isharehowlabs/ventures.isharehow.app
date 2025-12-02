import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { Send as SendIcon, Timer as TimerIcon } from '@mui/icons-material';
import { useGameSocket } from '../../hooks/useGameSocket';

const ROUND_DURATION = 60; // 60 seconds per round

export default function GuessingGame() {
  const { gameRoom, players, submitAnswer } = useGameSocket();
  const [guess, setGuess] = useState('');
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const [hasGuessed, setHasGuessed] = useState(false);

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
    }
  }, [gameRoom?.currentRound]);

  if (!gameRoom) return null;

  const handleSubmitGuess = () => {
    if (!guess.trim()) return;
    
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

            {/* Clue Display */}
            <Paper variant="outlined" sx={{ p: 4, mb: 3, textAlign: 'center', bgcolor: 'background.default' }}>
              <Typography variant="h4" gutterBottom fontWeight="bold">
                🤔 Guess the Word!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                The clue-giver is giving hints...
              </Typography>
            </Paper>

            {/* Guess Input */}
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
                  Submit
                </Button>
              </Box>
            ) : hasGuessed ? (
              <Alert severity="success">
                Your guess has been submitted! Waiting for round to end...
              </Alert>
            ) : (
              <Alert severity="info">
                Time's up! Waiting for results...
              </Alert>
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
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
