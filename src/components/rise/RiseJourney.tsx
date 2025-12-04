import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  LinearProgress,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';
import {
  SelfImprovement,
  FitnessCenter,
  AccountBalance,
  Palette,
  TrendingUp,
  Psychology,
  AutoAwesome,
  Lock,
  PlayArrow,
  CheckCircle,
  Close as CloseIcon,
} from '@mui/icons-material';
import RiseJourneyQuiz from './RiseJourneyQuiz';
import RiseJourneyLesson from './RiseJourneyLesson';

interface JourneyLevel {
  id: string;
  levelKey: string;
  title: string;
  description: string;
  focus: string;
  revenueProducts: string[];
  order: number;
  progress: {
    state: 'locked' | 'in-progress' | 'completed';
    startedAt: string | null;
    completedAt: string | null;
  };
}

interface Trial {
  id: string;
  isActive: boolean;
  daysRemaining: number;
  expiresAt: string;
}

const levelIcons: Record<string, any> = {
  wellness: SelfImprovement,
  mobility: FitnessCenter,
  accountability: AccountBalance,
  creativity: Palette,
  alignment: TrendingUp,
  mindfulness: Psychology,
  destiny: AutoAwesome,
};

const levelColors: Record<string, string> = {
  wellness: '#4caf50',
  mobility: '#2196f3',
  accountability: '#ff9800',
  creativity: '#9c27b0',
  alignment: '#f44336',
  mindfulness: '#00bcd4',
  destiny: '#ffc107',
};

export default function RiseJourney() {
  const [levels, setLevels] = useState<JourneyLevel[]>([]);
  const [trial, setTrial] = useState<Trial | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [recommendedLevel, setRecommendedLevel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<JourneyLevel | null>(null);
  const [showLesson, setShowLesson] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.ventures.isharehow.app';

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if quiz is completed
      const quizResponse = await fetch(`${backendUrl}/api/rise-journey/quiz`, {
        credentials: 'include',
      });
      if (quizResponse.ok) {
        const quizData = await quizResponse.json();
        if (quizData.quiz) {
          setQuizCompleted(true);
          setRecommendedLevel(quizData.quiz.recommendedLevel);
        }
      } else if (quizResponse.status === 401) {
        setError('Please log in to access the Rise Journey. Your session may have expired.');
        setLoading(false);
        return;
      }

      // Get trial status
      const trialResponse = await fetch(`${backendUrl}/api/rise-journey/trial`, {
        credentials: 'include',
      });
      if (trialResponse.ok) {
        const trialData = await trialResponse.json();
        setTrial(trialData.trial);
      } else if (trialResponse.status === 401) {
        setError('Please log in to access the Rise Journey. Your session may have expired.');
        setLoading(false);
        return;
      }

      // Get levels
      const levelsResponse = await fetch(`${backendUrl}/api/rise-journey/levels`, {
        credentials: 'include',
      });
      if (levelsResponse.ok) {
        const levelsData = await levelsResponse.json();
        setLevels(levelsData.levels || []);
      } else if (levelsResponse.status === 401) {
        setError('Please log in to access the Rise Journey. Your session may have expired.');
      } else {
        throw new Error('Failed to load journey levels');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load journey data');
    } finally {
      setLoading(false);
    }
  };

  const handleQuizComplete = async (level: string, scores: Record<string, number>) => {
    setQuizCompleted(true);
    setRecommendedLevel(level);
    setShowQuiz(false);
    await loadData();
  };

  const handleLevelClick = async (level: JourneyLevel) => {
    if (level.progress.state === 'locked') {
      // Start the level
      try {
        const response = await fetch(`${backendUrl}/api/rise-journey/levels/${level.id}/start`, {
          method: 'POST',
          credentials: 'include',
        });
        if (response.ok) {
          await loadData();
        }
      } catch (err) {
        console.error('Failed to start level:', err);
      }
    } else {
      setSelectedLevel(level);
      setShowLesson(true);
    }
  };

  const handleStartLesson = (lessonId: string) => {
    setSelectedLessonId(lessonId);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!quizCompleted) {
    return (
      <Box>
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Welcome to Your Rise Journey
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Take our assessment to discover where to begin your journey of consciousness and personal growth.
          </Typography>
        </Box>
        <RiseJourneyQuiz onComplete={handleQuizComplete} />
      </Box>
    );
  }

  return (
    <Box>
      {trial && trial.isActive && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>7-Day Free Trial Active</strong> - {trial.daysRemaining} days remaining
          </Typography>
        </Alert>
      )}

      {recommendedLevel && (
        <Alert severity="success" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Recommended Starting Point:</strong> {levels.find(l => l.levelKey === recommendedLevel)?.title || recommendedLevel}
          </Typography>
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          Your Rise Journey
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Seven levels of consciousness and personal growth. Each level builds on the previous, but you can start wherever feels right.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {levels.map((level) => {
          const Icon = levelIcons[level.levelKey] || SelfImprovement;
          const color = levelColors[level.levelKey] || '#666';
          const isRecommended = level.levelKey === recommendedLevel;
          const isLocked = level.progress.state === 'locked';
          const isCompleted = level.progress.state === 'completed';

          return (
            <Grid item xs={12} md={6} lg={4} key={level.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  border: isRecommended ? 2 : 1,
                  borderColor: isRecommended ? 'primary.main' : 'divider',
                  position: 'relative',
                  opacity: isLocked ? 0.7 : 1,
                  cursor: isLocked ? 'default' : 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': !isLocked ? {
                    transform: 'translateY(-4px)',
                    boxShadow: 4,
                  } : {},
                }}
                onClick={() => !isLocked && handleLevelClick(level)}
              >
                {isLocked && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      zIndex: 1,
                    }}
                  >
                    <Lock color="disabled" />
                  </Box>
                )}

                {isRecommended && (
                  <Chip
                    label="Recommended"
                    color="primary"
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      zIndex: 1,
                    }}
                  />
                )}

                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Icon sx={{ fontSize: 40, color }} />
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {level.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {level.focus}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {level.description}
                  </Typography>

                  {!isLocked && (
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" color="text.secondary">
                          Progress
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {level.progress.state === 'completed' ? '100%' : level.progress.state === 'in-progress' ? 'In Progress' : '0%'}
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={level.progress.state === 'completed' ? 100 : level.progress.state === 'in-progress' ? 50 : 0}
                        sx={{ height: 8, borderRadius: 1 }}
                      />
                    </Box>
                  )}

                  {level.revenueProducts && level.revenueProducts.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                        Recommended Products:
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {level.revenueProducts.map((product, idx) => (
                          <Chip key={idx} label={product} size="small" variant="outlined" color="primary" />
                        ))}
                      </Box>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                    {isCompleted && (
                      <Chip icon={<CheckCircle />} label="Completed" color="success" size="small" />
                    )}
                    {level.progress.state === 'in-progress' && (
                      <Chip icon={<PlayArrow />} label="In Progress" color="primary" size="small" />
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Lesson Dialog */}
      <Dialog
        open={showLesson && selectedLevel !== null}
        onClose={() => {
          setShowLesson(false);
          setSelectedLevel(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{selectedLevel?.title}</Typography>
            <IconButton onClick={() => {
              setShowLesson(false);
              setSelectedLevel(null);
            }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedLevel && (
            <RiseJourneyLesson
              levelId={selectedLevel.id}
              onStartLesson={handleStartLesson}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Individual Lesson Dialog */}
      <Dialog
        open={showLesson && selectedLessonId !== null}
        onClose={() => {
          setShowLesson(false);
          setSelectedLessonId(null);
        }}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            height: '90vh',
            maxHeight: '90vh',
          },
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Lesson</Typography>
            <IconButton onClick={() => {
              setShowLesson(false);
              setSelectedLessonId(null);
            }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedLessonId && (
            <RiseJourneyLesson
              levelId={selectedLevel?.id || ''}
              lessonId={selectedLessonId}
              onClose={() => {
                setShowLesson(false);
                setSelectedLessonId(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}

