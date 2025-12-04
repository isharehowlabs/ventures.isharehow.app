import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Chip,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import {
  PlayCircleOutline,
  PictureAsPdf,
  Note,
  CheckCircle,
  RadioButtonUnchecked,
  Share,
  Task as TaskIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useTasks } from '../../hooks/useTasks';

interface Lesson {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  pdfUrl: string;
  order: number;
  progress: {
    completed: boolean;
    completedAt: string | null;
  };
}

interface Note {
  id: string;
  content: string;
  isShared: boolean;
  userId: string;
}

interface RiseJourneyLessonProps {
  levelId: string;
  lessonId?: string;
  onStartLesson?: (lessonId: string) => void;
  onClose?: () => void;
}

export default function RiseJourneyLesson({ levelId, lessonId, onStartLesson, onClose }: RiseJourneyLessonProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [userNote, setUserNote] = useState<string>('');
  const [isShared, setIsShared] = useState(false);
  const [sharedNotes, setSharedNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingNote, setSavingNote] = useState(false);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');

  const { tasks, createTask } = useTasks();
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://api.ventures.isharehow.app';

  useEffect(() => {
    loadLessons();
  }, [levelId]);

  useEffect(() => {
    if (lessonId) {
      const lesson = lessons.find(l => l.id === lessonId);
      if (lesson) {
        setSelectedLesson(lesson);
        loadNotes(lesson.id);
      }
    }
  }, [lessonId, lessons]);

  const loadLessons = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${backendUrl}/api/rise-journey/levels/${levelId}/lessons`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setLessons(data.lessons || []);
        if (data.lessons && data.lessons.length > 0 && !lessonId) {
          setSelectedLesson(data.lessons[0]);
          loadNotes(data.lessons[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load lessons:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadNotes = async (lessonId: string) => {
    try {
      const response = await fetch(`${backendUrl}/api/rise-journey/lessons/${lessonId}/notes`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setUserNote(data.userNote?.content || '');
        setIsShared(data.userNote?.isShared || false);
        setSharedNotes(data.sharedNotes || []);
      }
    } catch (err) {
      console.error('Failed to load notes:', err);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedLesson) return;

    setSavingNote(true);
    try {
      const response = await fetch(`${backendUrl}/api/rise-journey/lessons/${selectedLesson.id}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content: userNote,
          isShared: isShared,
        }),
      });

      if (response.ok) {
        await loadNotes(selectedLesson.id);
      }
    } catch (err) {
      console.error('Failed to save note:', err);
    } finally {
      setSavingNote(false);
    }
  };

  const handleCompleteLesson = async () => {
    if (!selectedLesson) return;

    try {
      const response = await fetch(`${backendUrl}/api/rise-journey/lessons/${selectedLesson.id}/complete`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        await loadLessons();
      }
    } catch (err) {
      console.error('Failed to complete lesson:', err);
    }
  };

  const handleCreateTask = async () => {
    if (!taskTitle.trim() || !selectedLesson) return;

    try {
      await createTask(
        `[Rise Journey] ${taskTitle}`,
        `${taskDescription}\n\nRelated to lesson: ${selectedLesson.title}`,
        [],
        'pending'
      );
      setShowTaskDialog(false);
      setTaskTitle('');
      setTaskDescription('');
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    loadNotes(lesson.id);
    if (onStartLesson) {
      onStartLesson(lesson.id);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (lessonId && selectedLesson) {
    // Full lesson view with video, PDF, notes, and tasks
    return (
      <>
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Grid container spacing={3} sx={{ height: 'calc(90vh - 120px)' }}>
            {/* Left Column: Video and PDF */}
            <Grid item xs={12} md={8}>
              <Box sx={{ mb: 3 }}>
                {selectedLesson.videoUrl && (
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      paddingTop: '56.25%', // 16:9 aspect ratio
                      borderRadius: 2,
                      overflow: 'hidden',
                      bgcolor: 'grey.200',
                      mb: 2,
                    }}
                  >
                    <iframe
                      src={selectedLesson.videoUrl}
                      title={selectedLesson.title}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        border: 0,
                      }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </Box>
                )}

                {selectedLesson.pdfUrl && (
                  <Card sx={{ mb: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <PictureAsPdf color="error" sx={{ fontSize: 40 }} />
                        <Box>
                          <Typography variant="h6">Lesson PDF</Typography>
                          <Typography variant="body2" color="text.secondary">
                            Download and review the lesson materials
                          </Typography>
                        </Box>
                      </Box>
                      <Button
                        variant="contained"
                        href={selectedLesson.pdfUrl}
                        target="_blank"
                        startIcon={<PictureAsPdf />}
                        fullWidth
                      >
                        View PDF
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <Box>
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    About This Lesson
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedLesson.description}
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Right Column: Notes and Tasks */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
                {/* Notes Section */}
                <Paper sx={{ p: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Note color="primary" />
                    <Typography variant="h6">My Notes</Typography>
                  </Box>

                  <TextField
                    multiline
                    fullWidth
                    rows={8}
                    placeholder="Take notes while watching..."
                    value={userNote}
                    onChange={(e) => setUserNote(e.target.value)}
                    variant="outlined"
                    sx={{ mb: 2, flexGrow: 1 }}
                  />

                  <FormControlLabel
                    control={
                      <Switch
                        checked={isShared}
                        onChange={(e) => setIsShared(e.target.checked)}
                        size="small"
                      />
                    }
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Share fontSize="small" />
                        <Typography variant="caption">Share with community</Typography>
                      </Box>
                    }
                    sx={{ mb: 2 }}
                  />

                  <Button
                    variant="contained"
                    onClick={handleSaveNote}
                    disabled={savingNote}
                    fullWidth
                  >
                    {savingNote ? <CircularProgress size={20} /> : 'Save Notes'}
                  </Button>

                  {sharedNotes.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        Community Notes
                      </Typography>
                      {sharedNotes.map((note) => (
                        <Paper key={note.id} sx={{ p: 1.5, mb: 1, bgcolor: 'grey.50' }}>
                          <Typography variant="body2">{note.content}</Typography>
                        </Paper>
                      ))}
                    </Box>
                  )}
                </Paper>

                {/* Tasks Section */}
                <Paper sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TaskIcon color="primary" />
                      <Typography variant="h6">Tasks</Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => setShowTaskDialog(true)}
                      color="primary"
                    >
                      <AddIcon />
                    </IconButton>
                  </Box>

                  <List dense>
                    {tasks
                      .filter(t => t.title.includes('[Rise Journey]'))
                      .slice(0, 5)
                      .map((task) => (
                        <ListItem key={task.id} disablePadding>
                          <ListItemButton>
                            <ListItemIcon>
                              {task.status === 'completed' ? (
                                <CheckCircle color="success" />
                              ) : (
                                <RadioButtonUnchecked />
                              )}
                            </ListItemIcon>
                            <ListItemText
                              primary={task.title.replace('[Rise Journey] ', '')}
                              secondary={task.description}
                            />
                          </ListItemButton>
                        </ListItem>
                      ))}
                  </List>

                  {tasks.filter(t => t.title.includes('[Rise Journey]')).length === 0 && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      No tasks yet. Create one to track your progress.
                    </Typography>
                  )}
                </Paper>

                {/* Complete Button */}
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  onClick={handleCompleteLesson}
                  disabled={selectedLesson.progress.completed}
                  startIcon={selectedLesson.progress.completed ? <CheckCircle /> : null}
                >
                  {selectedLesson.progress.completed ? 'Lesson Completed' : 'Mark as Complete'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Task Creation Dialog */}
        <Dialog open={showTaskDialog} onClose={() => setShowTaskDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Create Task</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="Task Title"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                fullWidth
                required
              />
              <TextField
                label="Description"
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                fullWidth
                multiline
                rows={3}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                <Button onClick={() => setShowTaskDialog(false)}>Cancel</Button>
                <Button
                  variant="contained"
                  onClick={handleCreateTask}
                  disabled={!taskTitle.trim()}
                >
                  Create Task
                </Button>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  // Lesson list view
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Lessons
      </Typography>
      <List>
        {lessons.map((lesson) => (
          <ListItem key={lesson.id} disablePadding>
            <Card
              sx={{
                width: '100%',
                mb: 1,
                cursor: 'pointer',
                '&:hover': {
                  boxShadow: 2,
                },
              }}
              onClick={() => handleLessonSelect(lesson)}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <PlayCircleOutline color="primary" />
                    <Box>
                      <Typography variant="h6">{lesson.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {lesson.description}
                      </Typography>
                    </Box>
                  </Box>
                  {lesson.progress.completed && (
                    <Chip icon={<CheckCircle />} label="Completed" color="success" size="small" />
                  )}
                </Box>
              </CardContent>
            </Card>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

