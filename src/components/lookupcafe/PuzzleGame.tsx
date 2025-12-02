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
  Card,
  CardContent,
} from '@mui/material';
import {
  Send as SendIcon,
  Timer as TimerIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useGameSocket } from '../../hooks/useGameSocket';

const ROUND_DURATION = 120; // 2 minutes per round

export default function PuzzleGame() {
  const { gameRoom, players, submitAnswer } = useGameSocket();
  const [answer, setAnswer] = useState('');
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);
  const [hasSubmitted, setHasSubmitted] = useState(false);

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
      setHasSubmitted(false);
      setAnswer('');
    }
  }, [gameRoom?.currentRound]);

  if (!gameRoom) return null;

  const handleSubmitAnswer = () => {
    if (!answer.trim()) return;
    
    submitAnswer({
      roomCode: gameRoom.roomCode,
      answer: answer.trim(),
    });
    
    setHasSubmitted(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !hasSubmitted) {
      handleSubmitAnswer();
    }
  };

  const progress = (timeLeft / ROUND_DURATION) * 100;
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  // Example puzzles - in production, these would come from the backend
  const puzzles = [
    {
      question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
      hint: "Think about sound...",
    },
    {
      question: "What has keys, but no locks; space, but no room; and you can enter, but can't go inside?",
      hint: "You use it every day...",
    },
    {
      question: "The more you take, the more you leave behind. What am I?",
      hint: "Think about walking...",
    },
  ];

  const currentPuzzle = puzzles[(gameRoom.currentRound - 1) % puzzles.length];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={3}>
        {/* Main Game Area */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="h5" fontWeight="bold">
                Puzzle {gameRoom.currentRound} of {gameRoom.maxRounds}
              </Typography>
              <Chip
                icon={<TimerIcon />}
                label={`${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, '0')}`}
                color={timeLeft < 30 ? 'error' : 'primary'}
                sx={{ fontSize: '1.2rem', px: 1 }}
              />
            </Box>

            {/* Timer Bar */}
            <LinearProgress
              variant="determinate"
              value={progress}
              color={timeLeft < 30 ? 'error' : 'primary'}
              sx={{ height: 8, borderRadius: 1, mb: 3 }}
            />

            {/* Puzzle Display */}
            <Card sx={{ mb: 3, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  🧩 Riddle Time!
                </Typography>
                <Typography variant="h5" sx={{ my: 3 }}>
                  {currentPuzzle.question}
                </Typography>
                <Alert severity="info" sx={{ mt: 2 }}>
                  <strong>Hint:</strong> {currentPuzzle.hint}
                </Alert>
              </CardContent>
            </Card>

            {/* Collaborative Notes Area */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3, bgcolor: 'background.default' }}>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                💡 Team Discussion Area
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Work together with your team to solve the puzzle!
              </Typography>
            </Paper>

            {/* Answer Input */}
            {!hasSubmitted && timeLeft > 0 ? (
              <Box>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Type your answer..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  multiline
                  rows={2}
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  endIcon={<SendIcon />}
                  onClick={handleSubmitAnswer}
                  disabled={!answer.trim()}
                >
                  Submit Answer
                </Button>
              </Box>
            ) : hasSubmitted ? (
              <Alert severity="success" icon={<CheckIcon />}>
                <strong>Answer submitted!</strong> Waiting for other players...
              </Alert>
            ) : (
              <Alert severity="info">
                Time's up! Revealing answer...
              </Alert>
            )}
          </Paper>
        </Grid>

        {/* Team Scoreboard */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              Team Scores
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
                  {hasSubmitted && player.id === players[0]?.id && (
                    <CheckIcon color="success" />
                  )}
                </ListItem>
              ))}
            </List>
          </Paper>

          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight="bold">
              How to Play
            </Typography>
            <Typography variant="body2" paragraph>
              🤔 Read the puzzle carefully
            </Typography>
            <Typography variant="body2" paragraph>
              💬 Discuss with your team
            </Typography>
            <Typography variant="body2" paragraph>
              💡 Use the hint if you're stuck
            </Typography>
            <Typography variant="body2">
              ✅ Submit your answer before time runs out!
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
