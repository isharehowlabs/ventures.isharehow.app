import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import AppShell from '../components/AppShell';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import DashboardLayout from '../components/dashboard/DashboardLayout';
import StreamingPanel from '../components/dashboard/StreamingPanel';
import LiveUpdates from '../components/mcp/LiveUpdates';
import { getBackendUrl } from '../utils/backendUrl';

declare global {
  interface Window {
    Twitch: any;
  }
}

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

function LiveDashboard() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(true);
  const [currentFollowers, setCurrentFollowers] = useState<number | null>(null);
  const [followerGoal, setFollowerGoal] = useState<number>(2500);
  const [currentViewers, setCurrentViewers] = useState<number | null>(null);
  const [viewerGoal, setViewerGoal] = useState<number>(5000);
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(true);
  const twitchPlayerRef = useRef<any | null>(null);
  const twitchPlayer = useRef<any | null>(null);

  const handleToggleLibrary = useCallback(() => {
    const nextState = !libraryOpen;
    setLibraryOpen(nextState);
    if (nextState) {
      setVideoOpen(false);
      twitchPlayer.current?.pause();
    } else {
      setVideoOpen(true);
      twitchPlayer.current?.play();
    }
  }, [libraryOpen]);

  const handleToggleVideo = useCallback(() => {
    const nextState = !videoOpen;
    setVideoOpen(nextState);
    if (nextState) {
      setLibraryOpen(false);
      twitchPlayer.current?.play();
    } else {
      setLibraryOpen(true);
      twitchPlayer.current?.pause();
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
          }
        } catch (err) {
          console.log('Backend endpoint not available, trying direct Twitch API');
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

  // Effect to initialize Twitch Player
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://player.twitch.tv/js/embed/v1.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.Twitch && twitchPlayerRef.current) {
        const player = new window.Twitch.Player(twitchPlayerRef.current, {
          channel: 'jameleliyah',
          width: '100%',
          height: '100%',
          parent: ['ventures.isharehow.app', 'localhost'],
          autoplay: false,
        });
        twitchPlayer.current = player;
      }
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <AppShell active="live">
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
        
        {/* Live Updates under the title */}
        <Box sx={{ maxWidth: 1200, mx: 'auto', mb: { xs: 2, sm: 4 }, px: { xs: 1, sm: 0 } }}>
          <LiveUpdates />
        </Box>
      </Box>

      <DashboardLayout taskList={<TaskList />}>
      </DashboardLayout>
    </AppShell>
  );
}

function App() {
  return (
    <ProtectedRoute>
      <LiveDashboard />
    </ProtectedRoute>
  );
}

export default App;
