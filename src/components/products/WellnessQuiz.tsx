import React, { useState, FormEvent } from 'react';
import {
  Box,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Paper,
  Alert,
} from '@mui/material';

interface QuizScores {
  digestive: number;
  urinary: number;
  lymphatic: number;
  respiratory: number;
  integumentary: number;
}

const quizQuestions = {
  digestive: [
    { value: "bloating", label: "Bloating or abdominal discomfort" },
    { value: "constipation", label: "Constipation or irregular bowel movements" },
    { value: "fatigue", label: "Fatigue after eating" },
    { value: "weight_struggles", label: "Difficulty losing weight" },
  ],
  urinary: [
    { value: "dark_urine", label: "Dark or cloudy urine" },
    { value: "frequent_urination", label: "Frequent urination or urgency" },
    { value: "low_hydration", label: "Inadequate hydration (less than 8 glasses/day)" },
  ],
  lymphatic: [
    { value: "fatigue", label: "Persistent fatigue" },
    { value: "low_mobility", label: "Low physical activity (sedentary lifestyle)" },
    { value: "aches_pains", label: "Frequent aches and pains" },
  ],
  respiratory: [
    { value: "cough", label: "Chronic cough or mucus production" },
    { value: "allergies", label: "Frequent allergies or sinus issues" },
    { value: "moderate_stress", label: "Moderate to high stress levels" },
  ],
  integumentary: [
    { value: "acne", label: "Acne or skin breakouts" },
    { value: "dry_skin", label: "Dry or itchy skin" },
    { value: "dull_skin", label: "Dull or uneven skin tone" },
  ],
};

const WellnessQuiz: React.FC<{ onResult?: (system: string) => void }> = ({ onResult }) => {
  const [quizScores, setQuizScores] = useState<QuizScores>({
    digestive: 0,
    urinary: 0,
    lymphatic: 0,
    respiratory: 0,
    integumentary: 0,
  });
  const [quizResult, setQuizResult] = useState('');

  const handleQuizChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    const system = event.target.getAttribute('data-system') as keyof QuizScores;
    if (system) {
      setQuizScores(prevScores => ({
        ...prevScores,
        [system]: checked ? prevScores[system] + 1 : prevScores[system] - 1,
      }));
    }
  };

  const handleQuizSubmit = (event: FormEvent) => {
    event.preventDefault();
    const maxScore = Math.max(...Object.values(quizScores));
    const systems = (Object.keys(quizScores) as Array<keyof QuizScores>).filter(
      key => quizScores[key] === maxScore
    );

    let resultMessage = '';
    if (maxScore === 0) {
      resultMessage = 'No symptoms selected. Your body systems appear healthy!';
    } else {
      resultMessage = `Based on your symptoms, consider supporting your ${systems.join(', ')} system(s).`;
      if (onResult && systems.length > 0) {
        onResult(systems[0]);
      }
    }
    setQuizResult(resultMessage);
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 700, mx: 'auto' }}>
      <Typography variant="h4" component="h2" gutterBottom align="center">
        Body System Wellness Quiz
      </Typography>
      <Typography variant="body1" paragraph align="center">
        Identify which body system may benefit from wellness support
      </Typography>
      
      <Box component="form" onSubmit={handleQuizSubmit}>
        {Object.entries(quizQuestions).map(([system, questions]) => (
          <Box key={system} sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1, textTransform: 'capitalize' }}>
              {system} System
            </Typography>
            <FormGroup>
              {questions.map((q) => (
                <FormControlLabel
                  key={q.value}
                  control={
                    <Checkbox
                      onChange={handleQuizChange}
                      name={q.value}
                      data-system={system}
                    />
                  }
                  label={q.label}
                />
              ))}
            </FormGroup>
          </Box>
        ))}
        <Button type="submit" variant="contained" color="primary" fullWidth size="large">
          Get Recommendations
        </Button>
      </Box>

      {quizResult && (
        <Alert severity="info" sx={{ mt: 3 }}>
          <Typography variant="h6">Results</Typography>
          <Typography>{quizResult}</Typography>
          <Typography variant="caption" sx={{ mt: 1, display: 'block' }}>
            Note: Always consult a healthcare professional before starting any wellness regimen.
          </Typography>
        </Alert>
      )}
    </Paper>
  );
};

export default WellnessQuiz;
