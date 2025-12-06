import React, { useState, useEffect } from 'react';
import { Lock, Play, CheckCircle, ShoppingBag, ArrowRight, ArrowLeft, RefreshCw } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  Box, 
  Typography, 
  Chip, 
  Grid, 
  Button,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import RiseJourneyQuiz from './RiseJourneyQuiz';
import RiseJourneyLevelSubpanel from './RiseJourneyLevelSubpanel';

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

const levelColors: Record<string, { bg: string; border: string; text: string; muiColor: string }> = {
  wellness: { bg: 'bg-green-500', border: 'border-green-500', text: 'text-green-500', muiColor: '#10b981' },
  mobility: { bg: 'bg-blue-500', border: 'border-blue-500', text: 'text-blue-500', muiColor: '#3b82f6' },
  accountability: { bg: 'bg-indigo-500', border: 'border-indigo-500', text: 'text-indigo-500', muiColor: '#6366f1' },
  creativity: { bg: 'bg-purple-500', border: 'border-purple-500', text: 'text-purple-500', muiColor: '#a855f7' },
  alignment: { bg: 'bg-pink-500', border: 'border-pink-500', text: 'text-pink-500', muiColor: '#ec4899' },
  mindfulness: { bg: 'bg-yellow-500', border: 'border-yellow-500', text: 'text-yellow-500', muiColor: '#eab308' },
  destiny: { bg: 'bg-orange-500', border: 'border-orange-500', text: 'text-orange-500', muiColor: '#f97316' },
};

const RiseJourney: React.FC = () => {
  const [levels, setLevels] = useState<JourneyLevel[]>([]);
  const [trial, setTrial] = useState<Trial | null>(null);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [recommendedLevel, setRecommendedLevel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<JourneyLevel | null>(null);
  const [showRetakeQuiz, setShowRetakeQuiz] = useState(false);
  const [hasFullAccess, setHasFullAccess] = useState(false);
  const [accessLoading, setAccessLoading] = useState(true);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.ventures.isharehow.app';

  useEffect(() => {
    loadData();
    checkAccess();
  }, []);

  const checkAccess = async () => {
    setAccessLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/rise-journey/access`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setHasFullAccess(data.hasFullAccess || false);
      }
    } catch (err) {
      console.error('Failed to check access:', err);
    } finally {
      setAccessLoading(false);
    }
  };

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
        } else {
          setQuizCompleted(false);
        }
      } else if (quizResponse.status === 401) {
        // Don't show error - user might be logged in but token expired
        // Just continue without quiz data
        console.warn('Authentication issue loading quiz, continuing without quiz data');
        setQuizCompleted(false);
      }

      // Get trial status
      const trialResponse = await fetch(`${backendUrl}/api/rise-journey/trial`, {
        credentials: 'include',
      });
      if (trialResponse.ok) {
        const trialData = await trialResponse.json();
        if (trialData.trial) {
          const expiresAt = new Date(trialData.trial.expiresAt);
          const now = new Date();
          const daysRemaining = Math.max(0, Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
          setTrial({
            id: trialData.trial.id,
            isActive: trialData.trial.isActive && daysRemaining > 0,
            daysRemaining,
            expiresAt: trialData.trial.expiresAt,
          });
        }
      } else if (trialResponse.status === 401) {
        // Don't show error - just continue without trial data
        console.warn('Authentication issue loading trial, continuing without trial data');
      }

      // Get levels
      const levelsResponse = await fetch(`${backendUrl}/api/rise-journey/levels`, {
        credentials: 'include',
      });
      if (levelsResponse.ok) {
        const levelsData = await levelsResponse.json();
        setLevels(levelsData.levels || []);
      } else if (levelsResponse.status === 401) {
        // Don't show error - just continue with empty levels
        console.warn('Authentication issue loading levels, continuing with empty levels');
        setLevels([]);
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
    setShowRetakeQuiz(false);
    await loadData();
  };

  const handleLevelClick = async (level: JourneyLevel) => {
    // Allow access to all levels regardless of lock status
    // If locked, start it automatically, then show the level
    if (level.progress.state === 'locked') {
      try {
        const response = await fetch(`${backendUrl}/api/rise-journey/levels/${level.id}/start`, {
          method: 'POST',
          credentials: 'include',
        });
        if (response.ok) {
          await loadData();
          // After starting, show the level
          const updatedLevel = { ...level, progress: { ...level.progress, state: 'in-progress' as const } };
          setSelectedLevel(updatedLevel);
        } else {
          // Even if start fails, allow access to view content
          setSelectedLevel(level);
        }
      } catch (err) {
        console.error('Failed to start level:', err);
        // Even if start fails, allow access to view content
        setSelectedLevel(level);
      }
    } else {
      setSelectedLevel(level);
    }
  };

  const handleBackToJourney = () => {
    setSelectedLevel(null);
    loadData(); // Refresh data when returning
  };

  // Show quiz if not completed or if user wants to retake
  if (!quizCompleted || showRetakeQuiz) {
    return (
      <Box sx={{ p: 3, minHeight: '100vh' }}>
        <Box sx={{ maxWidth: '900px', mx: 'auto' }}>
          {showRetakeQuiz && (
            <Button
              onClick={() => {
                setShowRetakeQuiz(false);
                setShowQuiz(false);
              }}
              startIcon={<ArrowLeft className="h-5 w-5" />}
              sx={{ mb: 2, textTransform: 'none' }}
              variant="text"
            >
              Back to Journey
            </Button>
          )}
          <RiseJourneyQuiz onComplete={handleQuizComplete} />
        </Box>
      </Box>
    );
  }

  // Show level subpanel if one is selected
  if (selectedLevel) {
    return (
      <RiseJourneyLevelSubpanel
        level={selectedLevel}
        onBack={handleBackToJourney}
        backendUrl={backendUrl}
      />
    );
  }

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ p: 6, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={48} sx={{ mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Loading your journey...
          </Typography>
        </Box>
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Box sx={{ p: 6, minHeight: '100vh' }}>
        <Box sx={{ maxWidth: '800px', mx: 'auto' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button
            onClick={loadData}
            variant="contained"
            color="primary"
            sx={{ textTransform: 'none' }}
          >
            Retry
          </Button>
        </Box>
      </Box>
    );
  }

  // Main journey view with cards
  return (
    <Box sx={{ p: 3, minHeight: '100vh' }}>
      {/* Header & Trial Status */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' }, 
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', md: 'center' }, 
        mb: 4, 
        gap: 2 
      }}>
        <Box>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Your Rise Journey
          </Typography>
          <Typography variant="h6" color="text.secondary">
            The path to higher consciousness.
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {trial && trial.isActive && (
            <Paper 
              elevation={2}
              sx={{ 
                px: 3, 
                py: 1.5, 
                bgcolor: 'warning.light',
                border: 2,
                borderColor: 'warning.main'
              }}
            >
              <Typography variant="h6" component="span" sx={{ fontWeight: 700, color: 'warning.dark' }}>
                {trial.daysRemaining} Days Remaining
              </Typography>
              <Typography variant="body2" component="span" sx={{ ml: 1, color: 'warning.dark' }}>
                in Free Trial
              </Typography>
            </Paper>
          )}
          <Button
            onClick={() => setShowRetakeQuiz(true)}
            variant="outlined"
            size="small"
            sx={{ textTransform: 'none' }}
          >
            Retake Assessment
          </Button>
        </Box>
      </Box>

      {recommendedLevel && (
        <Box sx={{ maxWidth: '1200px', mx: 'auto', mb: 3 }}>
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            <Typography>
              <strong>Recommended Starting Point:</strong>{' '}
              {levels.find(l => l.levelKey === recommendedLevel)?.title || recommendedLevel}
            </Typography>
          </Alert>
        </Box>
      )}

      {/* Journey Cards Grid - Similar to Learning Hub */}
      {levels.length > 0 && (
        <Box sx={{ maxWidth: '1400px', mx: 'auto', mb: 4 }}>
          <Grid container spacing={3}>
            {levels.map((level) => {
            const colors = levelColors[level.levelKey] || levelColors.wellness;
            const isRecommended = level.levelKey === recommendedLevel;
            const isLocked = level.progress.state === 'locked';
            const isCompleted = level.progress.state === 'completed';
            const isInProgress = level.progress.state === 'in-progress';

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={level.id}>
                <Card
                  variant="outlined"
                  onClick={() => handleLevelClick(level)}
                  sx={{
                    borderRadius: 3,
                    height: '100%',
                    p: 0,
                    borderColor: isRecommended ? 'primary.main' : 'divider',
                    borderWidth: isRecommended ? 2 : 1,
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    },
                  }}
                >
                  {/* Color accent bar */}
                  <Box
                    sx={{
                      width: '100%',
                      height: 6,
                      bgcolor: colors.muiColor,
                      background: `linear-gradient(90deg, ${colors.muiColor} 0%, ${colors.muiColor}dd 100%)`,
                    }}
                  />
                  
                  <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                    {/* Status badges */}
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      {isRecommended && (
                        <Chip
                          label="✨ Recommended"
                          size="small"
                          color="primary"
                          sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                        />
                      )}
                      {isCompleted && (
                        <Chip
                          label="✓ Complete"
                          size="small"
                          color="success"
                          sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                        />
                      )}
                      {isInProgress && (
                        <Chip
                          label="In Progress"
                          size="small"
                          color="warning"
                          sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                        />
                      )}
                      {isLocked && (
                        <Chip
                          label="Locked"
                          size="small"
                          color="default"
                          sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>

                    {/* Title */}
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        mb: 1,
                        color: isLocked ? 'text.secondary' : 'text.primary',
                      }}
                    >
                      {level.title}
                    </Typography>

                    {/* Description */}
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        mb: 2,
                        flexGrow: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {level.focus || level.description}
                    </Typography>

                    {/* Progress indicator */}
                    {!isLocked && (
                      <Box sx={{ mb: 2 }}>
                        <Box
                          sx={{
                            width: '100%',
                            height: 4,
                            bgcolor: 'grey.200',
                            borderRadius: 2,
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              width: `${isCompleted ? 100 : isInProgress ? 50 : 0}%`,
                              height: '100%',
                              bgcolor: isCompleted ? 'success.main' : 'primary.main',
                              transition: 'width 0.3s ease',
                            }}
                          />
                        </Box>
                      </Box>
                    )}

                    {/* Action button area */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        mt: 'auto',
                        pt: 2,
                        borderTop: 1,
                        borderColor: 'divider',
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {isCompleted ? 'Review' : isLocked ? 'Explore' : 'Enter'} Path
                      </Typography>
                      <ArrowRight
                        className={`h-5 w-5 ${isLocked ? 'text-gray-400' : 'text-gray-600'}`}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>
      )}

      {/* Footer CTA */}
      {!hasFullAccess && (
        <Box sx={{ mt: 6, textAlign: 'center', maxWidth: '900px', mx: 'auto' }}>
          <Paper 
            elevation={4}
            sx={{ 
              p: 4, 
              background: 'linear-gradient(135deg, #f3e5f5 0%, #fce4ec 100%)',
              border: 2,
              borderColor: 'secondary.light'
            }}
          >
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              Ready to Transform Your Life?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Unlock all 7 levels and gain lifetime access to your personal growth journey.
            </Typography>
            <Button
              onClick={() => {
                // Redirect to Patreon VIP/Vanity Tier2 ($43.21/month)
                window.open('https://www.patreon.com/isharehow', '_blank');
              }}
              variant="contained"
              size="large"
              sx={{ 
                textTransform: 'none', 
                fontWeight: 700,
                px: 4,
                py: 1.5,
                background: 'linear-gradient(135deg, #9c27b0 0%, #e91e63 100%)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #7b1fa2 0%, #c2185b 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: 6,
                },
                transition: 'all 0.2s ease',
              }}
            >
              Upgrade to Full Access
            </Button>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default RiseJourney;
