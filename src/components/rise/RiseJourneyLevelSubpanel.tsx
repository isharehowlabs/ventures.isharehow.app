import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, CheckCircle, Play, Lock, FileText, PenTool, CheckSquare, Plus, X, GraduationCap, ExternalLink } from 'lucide-react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Card,
  CardContent,
  Tabs,
  Tab,
  TextField,
  LinearProgress,
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
  const [activeTab, setActiveTab] = useState<'lessons' | 'tasks' | 'journal' | 'learning'>('lessons');
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
        // Don't show error for auth issues - user might be logged in but token expired
        // Just log it and continue with empty data
        console.warn('Authentication issue loading lessons, continuing with empty data');
        setLessons([]);
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
        // Don't show error for auth issues
        console.warn('Authentication issue loading tasks, continuing with empty data');
        setTasks([]);
      }

      // Load journal entries for this level (if any lessons have journal entries)
      // Note: Journal entries are typically per-lesson, but we can show level-wide reflection
      // For now, we'll initialize empty and let users save per-level reflections
    } catch (err: any) {
      // Only set error for non-auth issues
      if (!err.message?.includes('Authentication') && !err.message?.includes('401')) {
        setError(err.message || 'Failed to load level data');
      } else {
        console.warn('Authentication issue, continuing with empty data:', err);
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

  // If a lesson is selected, show the lesson view
  if (selectedLesson) {
    return (
      <RiseJourneyLesson
        lessonData={{
          levelId: parseInt(level.id),
          levelName: level.title,
          lessonId: parseInt(selectedLesson.id),
          lessonTitle: selectedLesson.title,
          videoUrl: selectedLesson.videoUrl || '',
          pdfUrl: selectedLesson.pdfUrl || undefined,
          pdfTitle: selectedLesson.pdfUrl ? selectedLesson.pdfUrl.split('/').pop() : undefined,
        }}
        onBack={() => setSelectedLesson(null)}
        onComplete={handleLessonComplete}
        backendUrl={backendUrl}
      />
    );
  }

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
    <Box sx={{ p: 3, minHeight: '100vh' }}>
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

        {/* Tab Navigation */}
        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue as 'lessons' | 'tasks' | 'journal' | 'learning')}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab
              icon={<BookOpen className="h-5 w-5" />}
              iconPosition="start"
              label="Lessons"
              value="lessons"
              sx={{ textTransform: 'none', minHeight: 64 }}
            />
            <Tab
              icon={<CheckSquare className="h-5 w-5" />}
              iconPosition="start"
              label="Tasks"
              value="tasks"
              sx={{ textTransform: 'none', minHeight: 64 }}
            />
            <Tab
              icon={<PenTool className="h-5 w-5" />}
              iconPosition="start"
              label="Journal"
              value="journal"
              sx={{ textTransform: 'none', minHeight: 64 }}
            />
            <Tab
              icon={<GraduationCap className="h-5 w-5" />}
              iconPosition="start"
              label="Learning Hub"
              value="learning"
              sx={{ textTransform: 'none', minHeight: 64 }}
            />
          </Tabs>
        </Paper>

        {/* Tab Content */}
        {activeTab === 'learning' ? (
          <Box>
            {/* Learning Hub Tab - no white background wrapper */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box
                sx={{
                  p: 3,
                  background: 'linear-gradient(135deg, #e8eaf6 0%, #f3e5f5 100%)',
                  border: 2,
                  borderColor: 'secondary.light',
                  borderRadius: 2,
                  boxShadow: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <GraduationCap className="h-8 w-8" style={{ color: '#5c6bc0' }} />
                  <Typography variant="h5" fontWeight="bold">
                    Learning Hub Classes
                  </Typography>
                </Box>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Access comprehensive video classes and courses to deepen your understanding of this journey level.
                </Typography>
                
                {/* Learning Hub Content Cards */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  {/* Video Classes Card */}
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <Play className="h-6 w-6" style={{ color: '#5c6bc0' }} />
                          <Typography variant="h6" fontWeight="bold">
                            Video Classes
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          A comprehensive collection of video classes covering various topics and learning paths.
                        </Typography>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<Play className="h-5 w-5" />}
                          endIcon={<ExternalLink className="h-4 w-4" />}
                          onClick={() => {
                            window.open('https://www.youtube.com/embed/videoseries?list=PLwyVPJ9qE2K-g5CQgIYtOfnrfl7ebWRkp', '_blank');
                          }}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                            bgcolor: '#5c6bc0',
                            '&:hover': { bgcolor: '#455a64' },
                          }}
                        >
                          Watch Video Classes
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* AI Development Course Card */}
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                          <BookOpen className="h-6 w-6" style={{ color: '#9c27b0' }} />
                          <Typography variant="h6" fontWeight="bold">
                            AI Development
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Learn the fundamentals of AI development including machine learning, neural networks, and data processing.
                        </Typography>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<Play className="h-5 w-5" />}
                          endIcon={<ExternalLink className="h-4 w-4" />}
                          onClick={() => {
                            window.open('https://www.youtube.com/playlist?list=PLwyVPJ9qE2K8vj0Wfb4rxAmZntkysHPlE', '_blank');
                          }}
                          sx={{
                            textTransform: 'none',
                            fontWeight: 600,
                            bgcolor: '#9c27b0',
                            '&:hover': { bgcolor: '#7b1fa2' },
                          }}
                        >
                          Start Course
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>

                {/* Additional Resources */}
                <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
                  <Typography variant="h6" fontWeight="semibold" gutterBottom>
                    Additional Resources
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      For more learning resources, visit the full Learning Hub in the Creative Dashboard.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<GraduationCap className="h-5 w-5" />}
                      endIcon={<ExternalLink className="h-4 w-4" />}
                      onClick={() => {
                        window.location.href = '/creative?tab=learning';
                      }}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        bgcolor: 'grey.800',
                        '&:hover': { bgcolor: 'grey.900' },
                      }}
                    >
                      Open Full Learning Hub
                    </Button>
                  </Paper>
                </Box>
              </Box>
            </Box>
          </Box>
        ) : (
          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            {/* Lessons Tab */}
            {activeTab === 'lessons' && (
            <Box>
              {lessons.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <BookOpen className="h-16 w-16" style={{ color: '#9e9e9e', margin: '0 auto 16px' }} />
                  <Typography variant="body1" color="text.secondary">
                    No lessons available for this level yet.
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {lessons.map((lesson, index) => (
                    <Card
                      key={lesson.id}
                      variant="outlined"
                      onClick={() => handleLessonClick(lesson)}
                      sx={{
                        cursor: 'pointer',
                        transition: 'box-shadow 0.2s',
                        '&:hover': {
                          boxShadow: 4,
                        },
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Typography variant="body2" color="text.secondary" fontWeight="medium">
                                Lesson {index + 1}
                              </Typography>
                              {lesson.progress.completed && (
                                <Chip
                                  icon={<CheckCircle className="h-4 w-4" />}
                                  label="Completed"
                                  size="small"
                                  color="success"
                                  sx={{ fontSize: '0.7rem' }}
                                />
                              )}
                            </Box>
                            <Typography variant="h6" fontWeight="bold" gutterBottom>
                              {lesson.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                              {lesson.description}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              {lesson.videoUrl && (
                                <Chip
                                  icon={<Play className="h-4 w-4" />}
                                  label="Video"
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                              {lesson.pdfUrl && (
                                <Chip
                                  icon={<FileText className="h-4 w-4" />}
                                  label="PDF"
                                  size="small"
                                  variant="outlined"
                                />
                              )}
                            </Box>
                          </Box>
                          <Box sx={{ ml: 2 }}>
                            {lesson.progress.completed ? (
                              <CheckCircle className="h-8 w-8" style={{ color: '#4caf50' }} />
                            ) : (
                              <Play className="h-8 w-8" style={{ color: '#2196f3' }} />
                            )}
                          </Box>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              )}
            </Box>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <Box>
              <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Add a new task..."
                  variant="outlined"
                  size="small"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newTaskText.trim()) {
                      addTask(newTaskText);
                      setNewTaskText('');
                    }
                  }}
                />
                <Button
                  variant="contained"
                  color="success"
                  startIcon={<Plus className="h-5 w-5" />}
                  onClick={() => {
                    if (newTaskText.trim()) {
                      addTask(newTaskText);
                      setNewTaskText('');
                    }
                  }}
                  sx={{ textTransform: 'none', minWidth: 100 }}
                >
                  Add
                </Button>
              </Box>
              {tasks.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <CheckSquare className="h-16 w-16" style={{ color: '#9e9e9e', margin: '0 auto 16px' }} />
                  <Typography variant="body1" color="text.secondary">
                    No tasks yet. Add your first task above!
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {tasks.map(task => (
                    <Paper
                      key={task.id}
                      variant="outlined"
                      sx={{
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        opacity: task.completed ? 0.6 : 1,
                        bgcolor: task.completed ? 'grey.50' : 'background.paper',
                      }}
                    >
                      <Checkbox
                        checked={task.completed}
                        onChange={() => toggleTask(task.id, task.completed)}
                        color="success"
                      />
                      <Typography
                        variant="body1"
                        sx={{
                          flex: 1,
                          textDecoration: task.completed ? 'line-through' : 'none',
                          color: task.completed ? 'text.secondary' : 'text.primary',
                        }}
                      >
                        {task.text}
                      </Typography>
                      <IconButton
                        onClick={() => deleteTask(task.id)}
                        size="small"
                        color="error"
                      >
                        <X className="h-5 w-5" />
                      </IconButton>
                    </Paper>
                  ))}
                </Box>
              )}
            </Box>
          )}

          {/* Journal Tab */}
          {activeTab === 'journal' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 1 }}>
                Reflect on your journey through the 4 pillars:
              </Typography>
              <Box>
                <Typography variant="caption" fontWeight="bold" color="success.main" sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}>
                  💪 Physical Body
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={journalEntries.physical}
                  onChange={(e) => saveJournalEntry('physical', e.target.value)}
                  placeholder="How does this level apply to your body? Energy levels? Physical sensations?"
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { '&:hover fieldset': { borderColor: 'success.main' } } }}
                />
              </Box>
              <Box>
                <Typography variant="caption" fontWeight="bold" color="primary.main" sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}>
                  🧠 Mental State
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={journalEntries.mental}
                  onChange={(e) => saveJournalEntry('mental', e.target.value)}
                  placeholder="What mental blocks arose? New insights? Clarity gained?"
                  variant="outlined"
                />
              </Box>
              <Box>
                <Typography variant="caption" fontWeight="bold" color="secondary.main" sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}>
                  ✨ Spiritual Connection
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={journalEntries.spiritual}
                  onChange={(e) => saveJournalEntry('spiritual', e.target.value)}
                  placeholder="How does this align with your spirit? Intuitive feelings?"
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { '&:hover fieldset': { borderColor: 'secondary.main' } } }}
                />
              </Box>
              <Box>
                <Typography variant="caption" fontWeight="bold" color="warning.main" sx={{ textTransform: 'uppercase', mb: 1, display: 'block' }}>
                  🌿 Wellness & Balance
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={journalEntries.wellness}
                  onChange={(e) => saveJournalEntry('wellness', e.target.value)}
                  placeholder="Overall wellbeing? Self-care insights? Balance reflections?"
                  variant="outlined"
                  sx={{ '& .MuiOutlinedInput-root': { '&:hover fieldset': { borderColor: 'warning.main' } } }}
                />
              </Box>
              <Alert severity="success" sx={{ borderRadius: 2 }}>
                <Typography variant="body2" fontWeight="semibold">
                  ✓ Auto-saving enabled
                </Typography>
                <Typography variant="caption">
                  Your reflections are automatically saved as you type.
                </Typography>
              </Alert>
            </Box>
          )}
        </Paper>
        )}
      </Box>
    </Box>
  );
};

export default RiseJourneyLevelSubpanel;

