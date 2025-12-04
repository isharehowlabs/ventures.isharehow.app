import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  LinearProgress,
  Alert,
} from '@mui/material';
import { Quiz as QuizIcon, CheckCircle } from '@mui/icons-material';

interface QuizQuestion {
  id: string;
  question: string;
  options: { value: number; label: string }[];
  category: 'wellness' | 'mobility' | 'accountability' | 'creativity' | 'alignment' | 'mindfulness' | 'destiny';
}

const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'How would you rate your current physical health and energy levels?',
    options: [
      { value: 1, label: 'Very low - I feel tired and unhealthy' },
      { value: 2, label: 'Low - I have some health concerns' },
      { value: 3, label: 'Moderate - I feel okay but could improve' },
      { value: 4, label: 'Good - I feel healthy most of the time' },
      { value: 5, label: 'Excellent - I feel vibrant and energetic' },
    ],
    category: 'wellness',
  },
  {
    id: 'q2',
    question: 'How often do you engage in physical movement or exercise?',
    options: [
      { value: 1, label: 'Rarely or never' },
      { value: 2, label: 'Once a week or less' },
      { value: 3, label: '2-3 times per week' },
      { value: 4, label: '4-5 times per week' },
      { value: 5, label: 'Daily or almost daily' },
    ],
    category: 'mobility',
  },
  {
    id: 'q3',
    question: 'How well do you take responsibility for your life circumstances?',
    options: [
      { value: 1, label: 'I often blame others or external factors' },
      { value: 2, label: 'I sometimes blame others' },
      { value: 3, label: 'I take some responsibility but struggle' },
      { value: 4, label: 'I generally take responsibility' },
      { value: 5, label: 'I fully own my reality and choices' },
    ],
    category: 'accountability',
  },
  {
    id: 'q4',
    question: 'How would you describe your ability to express yourself creatively?',
    options: [
      { value: 1, label: 'I struggle with self-expression' },
      { value: 2, label: 'I rarely express myself creatively' },
      { value: 3, label: 'I sometimes engage in creative activities' },
      { value: 4, label: 'I regularly express myself creatively' },
      { value: 5, label: 'Creativity is a core part of my life' },
    ],
    category: 'creativity',
  },
  {
    id: 'q5',
    question: 'How aligned do you feel with your intentions and actions?',
    options: [
      { value: 1, label: 'Not aligned - I act from fear or habit' },
      { value: 2, label: 'Somewhat misaligned' },
      { value: 3, label: 'Moderately aligned' },
      { value: 4, label: 'Well aligned most of the time' },
      { value: 5, label: 'Fully aligned with love and intention' },
    ],
    category: 'alignment',
  },
  {
    id: 'q6',
    question: 'How often do you practice meditation or mindfulness?',
    options: [
      { value: 1, label: 'Never' },
      { value: 2, label: 'Rarely' },
      { value: 3, label: 'Occasionally' },
      { value: 4, label: 'Regularly' },
      { value: 5, label: 'Daily practice' },
    ],
    category: 'mindfulness',
  },
  {
    id: 'q7',
    question: 'How connected do you feel to your higher purpose or destiny?',
    options: [
      { value: 1, label: 'Not connected at all' },
      { value: 2, label: 'Slightly connected' },
      { value: 3, label: 'Somewhat connected' },
      { value: 4, label: 'Well connected' },
      { value: 5, label: 'Deeply connected to my purpose' },
    ],
    category: 'destiny',
  },
];

interface RiseJourneyQuizProps {
  onComplete: (recommendedLevel: string, scores: Record<string, number>) => void;
}

export default function RiseJourneyQuiz({ onComplete }: RiseJourneyQuizProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAnswer = (value: number) => {
    const question = quizQuestions[currentQuestion];
    setAnswers({ ...answers, [question.id]: value });
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.ventures.isharehow.app';
      const response = await fetch(`${backendUrl}/api/rise-journey/quiz`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        // Handle authentication errors specifically
        if (response.status === 401) {
          throw new Error('Please log in to submit the quiz. Your session may have expired.');
        }
        
        throw new Error(errorData.error || `Failed to submit quiz (${response.status})`);
      }

      const data = await response.json();
      onComplete(data.recommendedLevel, data.scores);
    } catch (err: any) {
      console.error('Quiz submission error:', err);
      setError(err.message || 'Failed to submit quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;
  const currentQ = quizQuestions[currentQuestion];
  const currentAnswer = answers[currentQ.id];

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
            <QuizIcon color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Rise Journey Assessment
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Help us understand where you are in your journey
              </Typography>
            </Box>
          </Box>

          <LinearProgress variant="determinate" value={progress} sx={{ mb: 3, height: 8, borderRadius: 1 }} />

          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <Box sx={{ mb: 4 }}>
            <Typography variant="h6" sx={{ mb: 3 }}>
              {currentQ.question}
            </Typography>

            <FormControl component="fieldset" fullWidth>
              <RadioGroup
                value={currentAnswer || ''}
                onChange={(e) => handleAnswer(Number(e.target.value))}
              >
                {currentQ.options.map((option) => (
                  <FormControlLabel
                    key={option.value}
                    value={option.value}
                    control={<Radio />}
                    label={option.label}
                    sx={{
                      mb: 1,
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: currentAnswer === option.value ? 'primary.main' : 'divider',
                      bgcolor: currentAnswer === option.value ? 'primary.50' : 'transparent',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={currentQuestion === 0}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!currentAnswer || loading}
              endIcon={currentQuestion === quizQuestions.length - 1 ? <CheckCircle /> : null}
            >
              {currentQuestion === quizQuestions.length - 1 ? 'Complete Quiz' : 'Next'}
            </Button>
          </Box>

          <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block', textAlign: 'center' }}>
            Question {currentQuestion + 1} of {quizQuestions.length}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
}

