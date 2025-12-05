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
  CardActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  Stack,
  Divider,
} from '@mui/material';
import {
  Send as SendIcon,
  Timer as TimerIcon,
  EmojiEvents as TrophyIcon,
  ThumbUp as ThumbUpIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useGameSocket } from '../../hooks/useGameSocket';

const ROUND_DURATION = 60; // 60 seconds per round
const VOTING_DURATION = 30; // 30 seconds for voting

export default function GuessingGame() {
  const {
    gameRoom,
    players,
    socketId,
    setSecretWords,
    submitGuess,
    voteForGuess,
    nextGuessingRound,
  } = useGameSocket();

  // Host word setup state
  const [words, setWords] = useState(['', '', '', '', '']);
  const [wordErrors, setWordErrors] = useState<string[]>([]);

  // Guessing phase state
  const [guess, setGuess] = useState('');
  const [hasGuessed, setHasGuessed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(ROUND_DURATION);

  // Voting phase state
  const [selectedGuess, setSelectedGuess] = useState<string>('');
  const [hasVoted, setHasVoted] = useState(false);

  // Results state
  const [results, setResults] = useState<any>(null);

  // Timer countdown
  useEffect(() => {
    const phase = (gameRoom as any)?.roundPhase;
    if (phase === 'guessing' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    } else if (phase === 'voting' && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [(gameRoom as any)?.roundPhase, timeLeft]);

  // Reset states on phase change
  useEffect(() => {
    const phase = (gameRoom as any)?.roundPhase;
    if (phase === 'guessing') {
      setGuess('');
      setHasGuessed(false);
      setHasVoted(false);
      setSelectedGuess('');
      setTimeLeft(ROUND_DURATION);
      setResults(null);
    } else if (phase === 'voting') {
      setTimeLeft(VOTING_DURATION);
    }
  }, [(gameRoom as any)?.roundPhase, gameRoom?.currentRound]);

  // Listen for voting complete event
  useEffect(() => {
    const socket = (window as any).socket;
    if (socket) {
      const handleVotingComplete = (data: any) => {
        setResults(data);
      };
      socket.on('guessing:voting-complete', handleVotingComplete);
      return () => {
        socket.off('guessing:voting-complete', handleVotingComplete);
      };
    }
  }, []);

  if (!gameRoom) return null;

  const isHost = players.find(p => p.id === socketId)?.isHost || false;
  const currentPlayer = players.find(p => p.id === socketId);
  const phase = (gameRoom as any)?.roundPhase;

  // Phase 1: Host Word Setup (before game starts)
  if (!phase || gameRoom.state === 'lobby') {
    if (!isHost) {
      return (
        <Container maxWidth="md" sx={{ py: 4 }}>
          <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              Waiting for host to set up the words...
            </Typography>
            <Typography color="text.secondary">
              The host is choosing 5 secret words for the game.
            </Typography>
          </Paper>
        </Container>
      );
    }

    const handleWordChange = (index: number, value: string) => {
      const newWords = [...words];
      newWords[index] = value;
      setWords(newWords);
      setWordErrors([]);
    };

    const handleSubmitWords = () => {
      // Validate
      const errors: string[] = [];
      const cleaned = words.map(w => w.trim().toLowerCase()).filter(w => w);
      
      if (cleaned.length !== 5) {
        errors.push('Please enter all 5 words');
      }
      
      if (new Set(cleaned).size !== cleaned.length) {
        errors.push('All words must be unique');
      }

      if (errors.length > 0) {
        setWordErrors(errors);
        return;
      }

      setSecretWords(gameRoom.roomCode, cleaned);
    };

    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom textAlign="center">
            🤔 Set Up Your Guessing Game
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center" mb={2}>
            Enter 5 words that players will try to guess. Each word will be used for one round.
          </Typography>
          <Alert severity="info" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
            <strong>How it works:</strong> Players will try to guess your secret word. After everyone guesses,
            they vote on which guess is closest. The player with the most votes wins points!
          </Alert>

          {wordErrors.length > 0 && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {wordErrors.map((err, i) => <div key={i}>{err}</div>)}
            </Alert>
          )}

          <Stack spacing={2} mb={4}>
            {words.map((word, index) => (
              <TextField
                key={index}
                label={`Word ${index + 1}`}
                value={word}
                onChange={(e) => handleWordChange(index, e.target.value)}
                fullWidth
                variant="outlined"
                placeholder={`Enter word ${index + 1}`}
              />
            ))}
          </Stack>

          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={handleSubmitWords}
            disabled={words.filter(w => w.trim()).length !== 5}
          >
            Start Game
          </Button>
        </Paper>
      </Container>
    );
  }

  // Phase 2: Guessing Phase
  if (phase === 'guessing') {
    const handleSubmitGuess = () => {
      if (!guess.trim()) return;
      submitGuess(gameRoom.roomCode, guess.trim());
      setHasGuessed(true);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !hasGuessed) {
        handleSubmitGuess();
      }
    };

    const progress = (timeLeft / ROUND_DURATION) * 100;
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    const guessData = (gameRoom as any).guesses || {};
    const totalGuesses = typeof guessData === 'object' && guessData.totalGuesses ? guessData.totalGuesses : 0;
    const totalPlayers = typeof guessData === 'object' && guessData.totalPlayers ? guessData.totalPlayers : players.filter(p => p.isActive).length;

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
                  🤔 Guess the Secret Word!
                </Typography>
                <Typography variant="body1" color="text.secondary">
                The host has chosen a secret word. Think of what word they might have picked!
                </Typography>
                <Chip 
                  label={`${totalGuesses} / ${totalPlayers} players have guessed`} 
                  sx={{ mt: 2 }}
                  color={totalGuesses === totalPlayers ? 'success' : 'default'}
                />
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
                <Alert severity="success" icon={<CheckIcon />}>
                  Your guess has been submitted! Waiting for other players...
                </Alert>
              ) : (
                <Alert severity="info">
                  Time's up! Waiting for all players to finish...
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

  // Phase 3: Voting Phase
  if (phase === 'voting') {
    const guesses = (gameRoom as any).guesses || [];
    const guessArray = Array.isArray(guesses) ? guesses : [];

    const handleVoteSubmit = () => {
      if (!selectedGuess) return;
      voteForGuess(gameRoom.roomCode, selectedGuess);
      setHasVoted(true);
    };

    const voteData = (gameRoom as any).votes || {};
    const totalVotes = typeof voteData === 'object' && voteData.totalVotes ? voteData.totalVotes : 0;
    const totalPlayers = typeof voteData === 'object' && voteData.totalPlayers ? voteData.totalPlayers : guessArray.length;

    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom textAlign="center">
            👍 Vote for the Best Guess!
          </Typography>
          <Typography variant="body1" color="text.secondary" textAlign="center" mb={2}>
            Vote for the guess you think is CLOSEST to what the host chose. You cannot vote for your own guess.
          </Typography>
          <Alert severity="warning" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
            <strong>Remember:</strong> You're voting for the guess that is most similar or related to the host's word,
            NOT necessarily the "best" word. The player with the most votes wins this round!
          </Alert>

          <Chip 
            label={`${totalVotes} / ${totalPlayers} players have voted`} 
            sx={{ mb: 3 }}
            color={totalVotes === totalPlayers ? 'success' : 'default'}
          />

          {!hasVoted ? (
            <>
              <RadioGroup value={selectedGuess} onChange={(e) => setSelectedGuess(e.target.value)}>
                <Stack spacing={2} mb={3}>
                  {guessArray.map((g: any) => {
                    const canVote = g.id !== socketId;
                    return (
                      <Card key={g.id} variant="outlined" sx={{ opacity: canVote ? 1 : 0.5 }}>
                        <CardContent>
                          <FormControlLabel
                            value={g.id}
                            control={<Radio />}
                            label={
                              <Typography variant="h6">
                                {g.guess}
                                {!canVote && <Chip label="Your guess" size="small" sx={{ ml: 2 }} />}
                              </Typography>
                            }
                            disabled={!canVote}
                          />
                        </CardContent>
                      </Card>
                    );
                  })}
                </Stack>
              </RadioGroup>

              <Button
                variant="contained"
                size="large"
                fullWidth
                endIcon={<ThumbUpIcon />}
                onClick={handleVoteSubmit}
                disabled={!selectedGuess}
              >
                Submit Vote
              </Button>
            </>
          ) : (
            <Alert severity="success" icon={<CheckIcon />}>
              Your vote has been recorded! Waiting for other players...
            </Alert>
          )}
        </Paper>
      </Container>
    );
  }

  // Phase 4: Results Phase
  if (phase === 'results' && results) {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box textAlign="center" mb={4}>
            <TrophyIcon sx={{ fontSize: 64, color: 'gold', mb: 2 }} />
            <Typography variant="h3" gutterBottom fontWeight="bold">
              Round {gameRoom.currentRound} Results
            </Typography>
            <Typography variant="h5" color="primary" gutterBottom>
              Winner: {results.winnerName}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Guess: "{results.winnerGuess}" ({results.voteCount} votes)
            </Typography>
            <Divider sx={{ my: 3 }} />
            <Typography variant="body1">
              The secret word was: <strong>"{results.secretWord}"</strong>
            </Typography>
          </Box>

          <Typography variant="h6" gutterBottom>
            All Guesses:
          </Typography>
          <List>
            {results.allGuesses?.map((g: any) => (
              <ListItem key={g.playerId}>
                <ListItemText
                  primary={`${g.playerName}: "${g.guess}"`}
                  secondary={`${g.votes} vote${g.votes !== 1 ? 's' : ''}`}
                />
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom>
            Current Standings:
          </Typography>
          <List>
            {sortedPlayers.map((player, index) => (
              <ListItem key={player.id}>
                <ListItemAvatar>
                  <Chip
                    label={index + 1}
                    size="small"
                    color={index === 0 ? 'primary' : 'default'}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={player.name}
                  secondary={`${player.score} points`}
                />
              </ListItem>
            ))}
          </List>

          {isHost && (
            <Button
              variant="contained"
              size="large"
              fullWidth
              sx={{ mt: 3 }}
              onClick={() => nextGuessingRound(gameRoom.roomCode)}
            >
              {gameRoom.currentRound >= gameRoom.maxRounds ? 'End Game' : 'Next Round'}
            </Button>
          )}
        </Paper>
      </Container>
    );
  }

  return null;
}
