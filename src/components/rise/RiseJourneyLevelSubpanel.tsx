import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, CheckCircle, Play, Lock, FileText, PenTool, CheckSquare, Plus, X, GraduationCap, ExternalLink } from 'lucide-react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
  TextField,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  IconButton,
  Checkbox,
  Chip,
  Grid,
} from '@mui/material';
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

interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string | null;
  pdfUrl: string | null;
  order: number;
  progress: {
    completed: boolean;
    completedAt: string | null;
  };
}

interface Task {
  id: string;
  text: string;
  completed: boolean;
  category?: string;
}

interface RiseJourneyLevelSubpanelProps {
  level: JourneyLevel;
  onBack: () => void;
  backendUrl: string;
}

const RiseJourneyLevelSubpanel: React.FC<RiseJourneyLevelSubpanelProps> = ({
  level,
  onBack,
  backendUrl,
}) => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [journalEntries, setJournalEntries] = useState<{
    physical: string;
    mental: string;
    spiritual: string;
    wellness: string;
  }>({
    physical: '',
    mental: '',
    spiritual: '',
    wellness: '',
  });
  const [newTaskText, setNewTaskText] = useState('');

  useEffect(() => {
    loadLevelData();
  }, [level.id]);

  const loadLevelData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load lessons
      const lessonsResponse = await fetch(
        `${backendUrl}/api/rise-journey/levels/${level.id}/lessons`,
        { credentials: 'include' }
      );
      if (lessonsResponse.ok) {
        const lessonsData = await lessonsResponse.json();
        setLessons(lessonsData.lessons || []);
      } else if (lessonsResponse.status === 401) {
        // On protected route but got 401 - redirect to login silently
        window.location.href = '/?login=true';
        return;
      }

      // Load tasks for this level
      const tasksResponse = await fetch(
        `${backendUrl}/api/tasks?category=Rise Journey&levelId=${level.id}`,
        { credentials: 'include' }
      );
      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        if (Array.isArray(tasksData.tasks)) {
          setTasks(tasksData.tasks);
        } else if (Array.isArray(tasksData)) {
          setTasks(tasksData);
        }
      } else if (tasksResponse.status === 401) {
        // On protected route but got 401 - redirect to login silently
        window.location.href = '/?login=true';
        return;
      }

      // Load journal entries for this level (if any lessons have journal entries)
      // Note: Journal entries are typically per-lesson, but we can show level-wide reflection
      // For now, we'll initialize empty and let users save per-level reflections
    } catch (err: any) {
      // Only set error for non-auth issues
      if (!err.message?.includes('Authentication') && !err.message?.includes('401')) {
        setError(err.message || 'Failed to load level data');
      } else {
        // On protected route but got auth error - redirect to login silently
        window.location.href = '/?login=true';
        return;
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLessonClick = (lesson: Lesson) => {
    setSelectedLesson(lesson);
  };

  const handleLessonComplete = async () => {
    if (selectedLesson) {
      try {
        await fetch(`${backendUrl}/api/rise-journey/lessons/${selectedLesson.id}/complete`, {
          method: 'POST',
          credentials: 'include',
        });
        await loadLevelData(); // Refresh lessons
        setSelectedLesson(null);
      } catch (err) {
        console.error('Failed to mark lesson complete:', err);
      }
    }
  };

  const addTask = async (text: string) => {
    if (!text.trim()) return;

    try {
      const response = await fetch(`${backendUrl}/api/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          text,
          category: 'Rise Journey',
          levelId: level.id,
        }),
      });

      if (response.ok) {
        const newTask = await response.json();
        setTasks([...tasks, newTask]);
      }
    } catch (err) {
      console.error('Failed to add task:', err);
    }
  };

  const toggleTask = async (taskId: string, completed: boolean) => {
    try {
      await fetch(`${backendUrl}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ completed: !completed }),
      });

      setTasks(tasks.map(task => (task.id === taskId ? { ...task, completed: !completed } : task)));
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      await fetch(`${backendUrl}/api/tasks/${taskId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      setTasks(tasks.filter(task => task.id !== taskId));
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  const saveJournalEntry = async (pillar: 'physical' | 'mental' | 'spiritual' | 'wellness', content: string) => {
    const updated = { ...journalEntries, [pillar]: content };
    setJournalEntries(updated);
    
    try {
      // Save journal entry for the level (we'll use the first lesson ID or create a level-wide entry)
      // For now, we'll save to a special endpoint or use the first lesson
      if (lessons.length > 0) {
        const response = await fetch(`${backendUrl}/api/rise-journey/lessons/${lessons[0].id}/journal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ 
            pillar,
            content,
            levelId: level.id, // Include level ID for level-wide reflections
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to save journal entry');
        }
      }
    } catch (err) {
      console.error('Failed to save journal entry:', err);
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={48} sx={{ mb: 2 }} />
          <Typography variant="body1" color="text.secondary">
            Loading level content...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, minHeight: '100vh' }}>
        <Box sx={{ maxWidth: '900px', mx: 'auto' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button
            onClick={onBack}
            variant="contained"
            color="primary"
            sx={{ textTransform: 'none' }}
          >
            Back to Journey
          </Button>
        </Box>
      </Box>
    );
  }

  const completedLessons = lessons.filter(l => l.progress.completed).length;
  const totalLessons = lessons.length;
  const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <Dialog open fullWidth maxWidth="lg" onClose={onBack}>
      <DialogTitle>
        {level.title}
      </DialogTitle>
      <DialogContent dividers>
      <Box sx={{ maxWidth: '1200px', mx: 'auto' }}>
        {/* Header */}
        <Box sx={{ mb: 3 }}>
          <Button
            onClick={onBack}
            startIcon={<ArrowLeft className="h-5 w-5" />}
            sx={{ mb: 2, textTransform: 'none' }}
            variant="text"
          >
            Back to Journey
          </Button>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            {level.title}
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            {level.focus || level.description}
          </Typography>
          <Paper elevation={2} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" fontWeight="medium">
                Level Progress
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {completedLessons} of {totalLessons} lessons completed
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={progressPercentage} 
              sx={{ height: 8, borderRadius: 1 }}
            />
          </Paper>
        </Box>


        {/* Three-card layout */}
        <Grid container spacing={3}>
          {/* Lessons Card */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="h6" fontWeight={700}>Video Lessons</Typography>
                  <Typography variant="body2" color="text.secondary">{completedLessons} / {totalLessons} done</Typography>
                </Box>
                {lessons.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">No lessons yet.</Typography>
                  </Box>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    {lessons.map((lesson, index) => (
                      <Paper key={lesson.id} variant="outlined" sx={{ p: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" color="text.secondary">Lesson {index + 1}</Typography>
                            <Typography variant="subtitle1" fontWeight={700}>{lesson.title}</Typography>
                            {lesson.description && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{lesson.description}</Typography>
                            )}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                              {lesson.videoUrl && (
                                <Button size="small" variant="outlined" onClick={() => window.open(lesson.videoUrl!, '_blank')}>Watch</Button>
                              )}
                              {lesson.pdfUrl && (
                                <Button size="small" variant="text" onClick={() => window.open(lesson.pdfUrl!, '_blank')}>Attachment</Button>
                              )}
                            </Box>
                          </Box>
                          <Box>
                            {lesson.progress.completed ? (
                              <Chip color="success" size="small" label="Completed" />
                            ) : (
                              <Button size="small" variant="contained" onClick={async () => {
                                await fetch(`${backendUrl}/api/rise-journey/lessons/${lesson.id}/complete`, { method: 'POST', credentials: 'include' });
                                await loadLevelData();
                              }}>Mark Done</Button>
                            )}
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Tasks Card */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>Assigned Tasks</Typography>
                <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    placeholder="Add a new task..."
                    variant="outlined"
                    size="small"
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && newTaskText.trim()) { addTask(newTaskText); setNewTaskText(''); }
                    }}
                  />
                  <Button variant="contained" onClick={() => { if (newTaskText.trim()) { addTask(newTaskText); setNewTaskText(''); } }}>Add</Button>
                </Box>
                {tasks.length === 0 ? (
                  <Typography color="text.secondary">No tasks yet.</Typography>
                ) : (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {tasks.map(task => (
                      <Paper key={task.id} variant="outlined" sx={{ p: 1.25, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Checkbox checked={task.completed} onChange={() => toggleTask(task.id, task.completed)} />
                        <Typography sx={{ flex: 1, textDecoration: task.completed ? 'line-through' : 'none' }}>{task.text}</Typography>
                        <IconButton size="small" color="error" onClick={() => deleteTask(task.id)}><X className="h-5 w-5" /></IconButton>
                      </Paper>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Journal Card */}
          <Grid item xs={12}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" fontWeight={700} gutterBottom>Journey Journal</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="success.main" sx={{ textTransform: 'uppercase' }}>Physical</Typography>
                    <TextField fullWidth multiline rows={4} value={journalEntries.physical} onChange={(e) => saveJournalEntry('physical', e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="primary.main" sx={{ textTransform: 'uppercase' }}>Mental</Typography>
                    <TextField fullWidth multiline rows={4} value={journalEntries.mental} onChange={(e) => saveJournalEntry('mental', e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="secondary.main" sx={{ textTransform: 'uppercase' }}>Spiritual</Typography>
                    <TextField fullWidth multiline rows={4} value={journalEntries.spiritual} onChange={(e) => saveJournalEntry('spiritual', e.target.value)} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="caption" color="warning.main" sx={{ textTransform: 'uppercase' }}>Wellness</Typography>
                    <TextField fullWidth multiline rows={4} value={journalEntries.wellness} onChange={(e) => saveJournalEntry('wellness', e.target.value)} />
                  </Grid>
                </Grid>
                <Alert severity="success" sx={{ mt: 2 }}>Autosaving as you type.</Alert>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        </Box>

      </DialogContent>
      <DialogActions>
        <Button onClick={onBack} variant="outlined">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default RiseJourneyLevelSubpanel;

