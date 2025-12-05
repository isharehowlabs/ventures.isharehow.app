import React, { useState, useEffect } from 'react';
import DebugPanel from './DebugPanel';
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
  Fab,
  Tooltip,
} from '@mui/material';
import {
  Send as SendIcon,
  Timer as TimerIcon,
  EmojiEvents as TrophyIcon,
  ThumbUp as ThumbUpIcon,
  CheckCircle as CheckIcon,
  ExitToApp as LeaveIcon,
  Refresh as RefreshIcon,
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
    leaveRoom,
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

  
  // Real-time progress tracking
  const [guessProgress, setGuessProgress] = useState({ total: 0, submitted: 0 });
  const [voteProgress, setVoteProgress] = useState({ total: 0, submitted: 0 });
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

  // Listen for voting complete event and guess updates
  useEffect(() => {
    const socket = (window as any).socket;
    if (socket) {
      const handleVotingComplete = (data: any) => {
        setResults(data);
      };
      
      const handleGuessSubmitted = (data: any) => {
        console.log('Guess submitted confirmation:', data);
        // Update progress tracking
        if (data.totalGuesses !== undefined && data.totalPlayers !== undefined) {
          setGuessProgress({ submitted: data.totalGuesses, total: data.totalPlayers });
        }
        // Update hasGuessed if this is our guess
        if (data.playerId === socketId || data.id === socketId) {
          setHasGuessed(true);
          if (data.guess) {
            setGuess(data.guess);
          }
        }
      };
      
      const handlePhaseChanged = (data: any) => {
        console.log('Phase changed:', data);
        // Update guesses when phase changes
        if (data.guesses && Array.isArray(data.guesses)) {
          const myGuess = data.guesses.find((g: any) => g.playerId === socketId || g.id === socketId);
          if (myGuess) {
            setHasGuessed(true);
            setGuess(myGuess.guess || '');
          }
        }
      };
      
      socket.on('guessing:voting-complete', handleVotingComplete);
      socket.on('guessing:guess-submitted', handleGuessSubmitted);
      socket.on('guessing:vote-received', (data: any) => {
        console.log('Vote received:', data);
        if (data.totalVotes !== undefined && data.totalPlayers !== undefined) {
          setVoteProgress({ submitted: data.totalVotes, total: data.totalPlayers });
        }
      });
      socket.on('guessing:phase-changed', handlePhaseChanged);
      
      return () => {
        socket.off('guessing:voting-complete', handleVotingComplete);
        socket.off('guessing:guess-submitted', handleGuessSubmitted);
        socket.off('guessing:phase-changed', handlePhaseChanged);
      };
    }
  }, [socketId]);

  if (!gameRoom) return null;

  // Floating action buttons for game controls
  const renderControls = () => (
    <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Tooltip title="Refresh Game" placement="left">
          <Fab 
            color="primary" 
            size="medium"
            onClick={() => window.location.reload()}
          >
            <RefreshIcon />
          </Fab>
        </Tooltip>
        <Tooltip title="Leave Game" placement="left">
          <Fab 
            color="error" 
            size="medium"
            onClick={() => {
              if (window.confirm('Are you sure you want to leave the game?')) {
                leaveRoom();
              }
            }}
          >
            <LeaveIcon />
          </Fab>
        </Tooltip>
      </Box>
    </Box>
  );


  const isHost = players.find(p => p.id === socketId)?.isHost || false;
  const currentPlayer = players.find(p => p.id === socketId);
  const phase = (gameRoom as any)?.roundPhase;
  
  
  // Debug logging
  useEffect(() => {
    console.log("[GuessingGame] State:", { phase, state: gameRoom?.state, hasGuessed, timeLeft, isHost, round: gameRoom?.currentRound });
  }, [phase, gameRoom?.state, hasGuessed, timeLeft, isHost, gameRoom?.currentRound]);

  // Phase 1: Host Word Setup (before game starts)
  if (!phase || gameRoom.state === 'lobby') {
    if (!isHost) {
      return (
        <>
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
          {renderControls()}
        </>
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
      <>
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
        {renderControls()}
      </>
    );
  }

  // Phase 2: Guessing Phase
  if (phase === 'guessing') {
    const handleSubmitGuess = () => {
      if (!guess.trim() || hasGuessed) return;
      console.log('Submitting guess:', guess.trim());
      submitGuess(gameRoom.roomCode, guess.trim());
      setHasGuessed(true);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !hasGuessed && guess.trim()) {
        handleSubmitGuess();
      }
    };

    const progress = (timeLeft / ROUND_DURATION) * 100;
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
    
    // Get guesses - handle both object and array formats
    const guessData = (gameRoom as any).guesses || {};
    let guessesArray: any[] = [];
    let totalGuesses = 0;
    let totalPlayers = players.filter(p => p.isActive).length;
    
    if (Array.isArray(guessData)) {
      guessesArray = guessData;
      totalGuesses = guessData.length;
    } else if (typeof guessData === 'object') {
      // Check if it's a progress object
      if (guessData.totalGuesses !== undefined) {
        totalGuesses = guessData.totalGuesses || 0;
        totalPlayers = guessData.totalPlayers || totalPlayers;
      } else {
        // It might be an object with player IDs as keys
        guessesArray = Object.values(guessData);
        totalGuesses = guessesArray.length;
      }
    }
    
    // Check if current player has submitted a guess
    const currentPlayerGuess = guessesArray.find((g: any) => g.playerId === socketId || g.id === socketId);
    const playerHasGuessed = currentPlayerGuess !== undefined;
    
    // Update local state if server says we've guessed but local state doesn't match
    if (playerHasGuessed && !hasGuessed) {
      setHasGuessed(true);
      if (currentPlayerGuess.guess) {
        setGuess(currentPlayerGuess.guess);
      }
    }

    return (
      <>
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
                  label={`${guessProgress.submitted} / ${guessProgress.total} players have guessed`} 
                  sx={{ mt: 2 }}
                  color={totalGuesses === totalPlayers ? 'success' : 'default'}
                />
              </Paper>

              {/* Guess Input Section */}
              <Box sx={{ mb: 3 }}>
                {!hasGuessed && timeLeft > 0 ? (
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      Enter your guess below. Once submitted, you cannot change it.
                    </Typography>
                    <Box display="flex" gap={2}>
                      <TextField
                        fullWidth
                        variant="outlined"
                        placeholder="Type your guess..."
                        value={guess}
                        onChange={(e) => setGuess(e.target.value)}
                        onKeyPress={handleKeyPress}
                        autoFocus
                        disabled={hasGuessed}
                        sx={{ 
                          '& .MuiOutlinedInput-root': {
                            fontSize: '1.1rem',
                          }
                        }}
                      />
                      <Button
                        variant="contained"
                        size="large"
                        endIcon={<SendIcon />}
                        onClick={handleSubmitGuess}
                        disabled={!guess.trim() || hasGuessed}
                        sx={{ minWidth: 140 }}
                      >
                        Submit Guess
                      </Button>
                    </Box>
                  </Box>
                ) : hasGuessed ? (
                  <Alert severity="success" icon={<CheckIcon />} sx={{ mb: 2 }}>
                    <Typography variant="body1" fontWeight="bold">
                      Your guess has been submitted!
                    </Typography>
                    <Typography variant="body2">
                      Your guess: <strong>"{currentPlayerGuess?.guess || guess}"</strong>
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Waiting for other players to submit their guesses...
                    </Typography>
                  </Alert>
                ) : (
                  <Alert severity="info">
                    Time's up! Waiting for all players to finish...
                  </Alert>
                )}
              </Box>

              {/* Show All Submitted Guesses (for transparency) */}
              {guessesArray.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Submitted Guesses ({guessesArray.length} / {totalPlayers})
                  </Typography>
                  <List dense>
                    {guessesArray.map((g: any, index: number) => {
                      const isCurrentPlayer = g.playerId === socketId || g.id === socketId;
                      const playerName = g.playerName || players.find(p => p.id === (g.playerId || g.id))?.name || 'Unknown';
                      return (
                        <ListItem 
                          key={g.playerId || g.id || index}
                          sx={{ 
                            bgcolor: isCurrentPlayer ? 'action.selected' : 'transparent',
                            borderRadius: 1,
                            mb: 0.5
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              {playerName.charAt(0).toUpperCase()}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="body1" fontWeight={isCurrentPlayer ? 'bold' : 'normal'}>
                                  {isCurrentPlayer ? 'You' : playerName}
                                </Typography>
                                {isCurrentPlayer && (
                                  <Chip label="Your guess" size="small" color="primary" />
                                )}
                              </Box>
                            }
                            secondary={
                              <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 0.5 }}>
                                "{g.guess}"
                              </Typography>
                            }
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                </Box>
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
        {renderControls()}
      </>
    );
  }

  // Phase 3: Voting Phase
  if (phase === 'voting') {
    // Get guesses - handle both object and array formats
    const guessData = (gameRoom as any).guesses || {};
    let guessArray: any[] = [];
    
    if (Array.isArray(guessData)) {
      guessArray = guessData;
    } else if (typeof guessData === 'object') {
      // Check if it's an object with player IDs as keys
      if (guessData.totalGuesses === undefined) {
        guessArray = Object.values(guessData);
      } else {
        // It's a progress object, try to get guesses from elsewhere
        guessArray = (gameRoom as any).guessList || [];
      }
    }

    const handleVoteSubmit = () => {
      if (!selectedGuess || hasVoted) return;
      console.log('Submitting vote for:', selectedGuess);
      voteForGuess(gameRoom.roomCode, selectedGuess);
      setHasVoted(true);
    };

    const voteData = (gameRoom as any).votes || {};
    const totalVotes = typeof voteData === 'object' && voteData.totalVotes ? voteData.totalVotes : 0;
    const totalPlayers = typeof voteData === 'object' && voteData.totalPlayers ? voteData.totalPlayers : guessArray.length;
    
    // Check if current player has voted
    const currentPlayerVote = voteData[socketId] || (Array.isArray(voteData) && voteData.find((v: any) => v.playerId === socketId));
    if (currentPlayerVote && !hasVoted) {
      setHasVoted(true);
    }

    return (
      <>
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
            label={`${voteProgress.submitted} / ${voteProgress.total} players have voted`} 
            sx={{ mb: 3 }}
            color={totalVotes === totalPlayers ? 'success' : 'default'}
          />

          {guessArray.length === 0 ? (
            <Alert severity="warning">
              No guesses available to vote on. Waiting for guesses to be processed...
            </Alert>
          ) : !hasVoted ? (
            <>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select the guess you think is closest to the host's secret word. You cannot vote for your own guess.
              </Typography>
              <RadioGroup value={selectedGuess} onChange={(e) => setSelectedGuess(e.target.value)}>
                <Stack spacing={2} mb={3}>
                  {guessArray.map((g: any, index: number) => {
                    const guessId = g.id || g.playerId || `guess-${index}`;
                    const playerId = g.playerId || g.id;
                    const canVote = playerId !== socketId;
                    const playerName = g.playerName || players.find(p => p.id === playerId)?.name || 'Unknown Player';
                    
                    return (
                      <Card 
                        key={guessId} 
                        variant="outlined" 
                        sx={{ 
                          opacity: canVote ? 1 : 0.6,
                          bgcolor: canVote ? 'background.paper' : 'action.disabledBackground',
                          '&:hover': canVote ? { bgcolor: 'action.hover' } : {}
                        }}
                      >
                        <CardContent>
                          <FormControlLabel
                            value={guessId}
                            control={<Radio disabled={!canVote} />}
                            label={
                              <Box>
                                <Typography variant="h6" component="span">
                                  "{g.guess}"
                                </Typography>
                                <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                                  <Typography variant="body2" color="text.secondary">
                                    by {playerName}
                                  </Typography>
                                  {!canVote && (
                                    <Chip label="Your guess" size="small" color="primary" />
                                  )}
                                </Box>
                              </Box>
                            }
                            disabled={!canVote}
                            sx={{ width: '100%' }}
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
                disabled={!selectedGuess || hasVoted}
                sx={{ py: 1.5 }}
              >
                Submit Vote
              </Button>
            </>
          ) : (
            <Alert severity="success" icon={<CheckIcon />} sx={{ mb: 2 }}>
              <Typography variant="body1" fontWeight="bold">
                Your vote has been recorded!
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Waiting for other players to vote...
              </Typography>
            </Alert>
          )}
          
          {/* Show voting progress */}
          {guessArray.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Voting Progress: ${voteProgress.submitted} / ${voteProgress.total} players have voted
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(totalVotes / totalPlayers) * 100} 
                sx={{ mt: 1, height: 8, borderRadius: 1 }}
                color={totalVotes === totalPlayers ? 'success' : 'primary'}
              />
            </Box>
          )}
        </Paper>
      </Container>
        {renderControls()}
      </>
    );
  }

  // Phase 4: Results Phase
  if (phase === 'results' && results) {
    const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

    return (
      <>
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
        {renderControls()}
      </>
    );
  }
  return (
    <>
      <DebugPanel gameRoom={gameRoom} players={players} socketId={socketId || ''} isConnected={true} />
      {renderControls()}
    </>
  );
}
