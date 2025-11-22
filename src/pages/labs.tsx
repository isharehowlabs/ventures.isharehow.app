import { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
  Paper,
  Stack,
  Button,
  Alert,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
} from '@mui/material';
import AppShell from '../components/AppShell';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import LiveUpdates from '../components/mcp/LiveUpdates';
import FloatingAIChat from '../components/dashboard/FloatingAIChat';
import CryptoIncentivesPanel from '../components/dashboard/CryptoIncentivesPanel';
import { getBackendUrl } from '../utils/backendUrl';


// Task List Feature
interface Task {
  id: number;
  text: string;
  completed: boolean;
}

function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('live_task_list');
    if (stored) setTasks(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem('live_task_list', JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = () => {
    if (!input.trim()) return;
    setInput('');
  };

  const handleToggle = (id: number) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    );
  };

  const handleDelete = (id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Session Tasks</Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        <input
          value={input}
          type="text"
          placeholder="Add new task..."
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') handleAddTask();
          }}
          style={{
            flex: 1,
            border: '1px solid #ccc',
            borderRadius: 4,
            padding: '6px 10px'
          }}
        />
        <Button
          variant="contained"
          size="small"
          onClick={handleAddTask}
          disabled={!input.trim()}
        >
          Add
        </Button>
      </Stack>
      <Box>
        {tasks.length === 0 && (
          <Typography variant="body2" color="text.secondary">No tasks yet. Add one!</Typography>
        )}
        <Stack spacing={1}>
          {tasks.map(task => (
            <Box
              key={task.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 1,
                py: 0.5,
                bgcolor: task.completed ? 'action.selected' : undefined,
                borderRadius: 1,
                textDecoration: task.completed ? 'line-through' : undefined,
                opacity: task.completed ? 0.6 : 1,
                transition: 'background 0.2s'
              }}
            >
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => handleToggle(task.id)}
                style={{ marginRight: 8 }}
              />
              <Typography
                variant="body1"
                sx={{
                  flex: 1,
                  fontSize: 15,
                  color: task.completed ? 'text.secondary' : 'text.primary'
                }}
              >
                {task.text}
              </Typography>
              <Button
                variant="text"
                color="error"
                size="small"
                onClick={() => handleDelete(task.id)}
                sx={{ minWidth: 0 }}
              >
                ✕
              </Button>
            </Box>
          ))}
        </Stack>
      </Box>
    </Paper>
  );
}

function LabsDashboard() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(true);
  const [currentFollowers, setCurrentFollowers] = useState<number | null>(null);
  const [followerGoal, setFollowerGoal] = useState<number>(2500);
  const [currentViewers, setCurrentViewers] = useState<number | null>(null);
  const [viewerGoal, setViewerGoal] = useState<number>(5000);
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(true);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const handleToggleLibrary = useCallback(() => {
    const nextState = !libraryOpen;
    setLibraryOpen(nextState);
    if (nextState) {
      setVideoOpen(false);
    } else {
      setVideoOpen(true);
    }
  }, [libraryOpen]);

  const handleToggleVideo = useCallback(() => {
    const nextState = !videoOpen;
    setVideoOpen(nextState);
    if (nextState) {
      setLibraryOpen(false);
    } else {
      setLibraryOpen(true);
    }
  }, [videoOpen]);

  // Fetch follower count
  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        setIsLoadingFollowers(true);
        const backendUrl = getBackendUrl();
        
        try {
          const response = await fetch(`${backendUrl}/api/twitch/goals`);
          if (response.ok) {
            const data = await response.json();
            setCurrentFollowers(data.followers || 0);
            if (data.followerGoal) setFollowerGoal(data.followerGoal);
            setCurrentViewers(data.viewers || 0);
            if (data.viewerGoal) setViewerGoal(data.viewerGoal);
            return;
          } else if (response.status === 404) {
            // Endpoint doesn't exist yet, use fallback values silently
            return;
          }
        } catch (err) {
          // Network error or other issue - silently use fallback values
          // Don't log to avoid console noise
        }

        // Fallback to default values
        setCurrentFollowers(1247);
        setCurrentViewers(1200);
      } catch (error) {
        console.error('Error fetching followers:', error);
        setCurrentFollowers(1247);
        setCurrentViewers(1200);
      } finally {
        setIsLoadingFollowers(false);
      }
    };

    fetchFollowers();
    const interval = setInterval(fetchFollowers, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Effect to check for auth success message
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const auth = urlParams.get('auth');
      
      if (auth === 'success') {
        setShowSuccessMessage(true);
        
        // Clean up URL
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
        
        // Auto-hide success message after 5 seconds
        const timer = setTimeout(() => {
          setShowSuccessMessage(false);
        }, 5000);
        
        return () => clearTimeout(timer);
      }
    }
  }, []);


  return (
    <AppShell active="labs">
      {showSuccessMessage && (
        <Box sx={{ mb: 3 }}>
          <Alert severity="success" onClose={() => setShowSuccessMessage(false)}>
            Successfully authenticated! Welcome to the Co-Work Dashboard.
          </Alert>
        </Box>
      )}
      <Box sx={{ mb: { xs: 2, sm: 4 }, textAlign: 'center', px: { xs: 1, sm: 2 } }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 900,
            mb: { xs: 1, sm: 2 },
            fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
            background: 'linear-gradient(45deg, #9146FF, #ff6b6b, #4ecdc4)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Co-Work Dashboard
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ 
            maxWidth: 600, 
            mx: 'auto', 
            mb: { xs: 2, sm: 3 },
            px: { xs: 1, sm: 0 },
            fontSize: { xs: '0.875rem', sm: '1rem' },
          }}
        >
          Your hub for streaming, design collaboration, document management, and code handoff.
        </Typography>
      </Box>

      <DashboardLayout taskList={<TaskList />} liveUpdates={<LiveUpdates />}>
        <CryptoIncentivesPanel />

        {/* Community Q&A Panel */}
        <Paper elevation={4} sx={{ p: 4, mb: 4, border: '2px solid gold', background: 'rgba(255, 255, 224, 0.15)' }}>
          <Typography variant="h4" sx={{ fontWeight: 900, color: 'gold', mb: 2 }}>
            Community Q&A
          </Typography>
          <Divider sx={{ mb: 3, borderColor: 'gold' }} />
          {/* Categories Example */}
          {['General', 'Streaming', 'Design', 'Docs'].map(category => (
            <Box key={category} sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ color: 'gold', mb: 1 }}>
                {category}
              </Typography>
              {/* FAQ-style Accordions for Questions */}
              {[1,2].map(q => (
                <Paper key={q} elevation={1} sx={{ mb: 2, border: '1px solid gold' }}>
                  <Accordion>
                    <AccordionSummary expandIcon={<span style={{ color: 'gold' }}>+</span>}>
                      <Typography sx={{ fontWeight: 700 }}>Sample Question {q} in {category}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        Sample answer for question {q}. Answers can be upvoted, marked as accepted, and users receive notifications for replies.
                      </Typography>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Button variant="outlined" color="success">Upvote</Button>
                        <Button variant="contained" color="primary">Mark as Accepted</Button>
                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                </Paper>
              ))}
            </Box>
          ))}
          {/* Add Question Button */}
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button variant="contained" color="warning" sx={{ fontWeight: 700 }}>
              + Ask a Question
            </Button>
          </Box>

          {/* Admin Controls for Moderation/Visibility (match settings) */}
          {/* Simulate admin check (replace with real auth logic) */}
          {false && (
            <Paper elevation={2} sx={{ p: 3, mt: 4, border: '2px solid gold' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'gold', mb: 2 }}>
                Admin Actions: Q&A Moderation
              </Typography>
              <Divider sx={{ mb: 2, borderColor: 'gold' }} />
              <Stack spacing={2}>
                <Button variant="contained" color="primary">Review Pending Questions</Button>
                <Button variant="contained" color="secondary">Manage Answers</Button>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Typography variant="body2" sx={{ color: 'gold', minWidth: 180 }}>
                    Set Question Visibility (hours):
                  </Typography>
                  <TextField type="number" size="small" defaultValue={48} inputProps={{ min: 1, max: 168 }} sx={{ width: 100 }} />
                  <Button variant="outlined" color="success">Update</Button>
                </Stack>
                <Button variant="outlined" color="warning">Manage Categories</Button>
              </Stack>
            </Paper>
          )}
        </Paper>
      </DashboardLayout>

      {/* Floating AI Chat */}
      <FloatingAIChat />
    </AppShell>
  );
}

function App() {
  return (
    <ProtectedRoute>
      <LabsDashboard />
    </ProtectedRoute>
  );
}

export default App;
