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

// Realtime Chat Box Feature (scaffolded)
function RealtimeChatBox() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // TODO: Replace with real admin/user logic
  const isAdmin = false;

  // Fetch messages from backend
  useEffect(() => {
    const fetchMessages = () => {
      fetch('/api/chat/messages', { credentials: 'include' })
        .then(res => res.json())
        .then(data => {
          setMessages(data);
          setLoading(false);
        })
        .catch(err => {
          setError('Failed to load messages');
          setLoading(false);
        });
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5s
    return () => clearInterval(interval);
  }, []);

  // Send new message
  const handleSend = () => {
    if (!input.trim()) return;
    fetch('/api/chat/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ text: input }),
    })
      .then(res => res.json())
      .then(() => setInput(''));
  };

  // Pin/unpin message (admin only)
  const handlePin = (id: number) => {
    if (!isAdmin) return;
    fetch('/api/chat/pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id, pin: true }),
    }).then(() => {/* Optionally refetch messages */});
  };
  const handleUnpin = (id: number) => {
    if (!isAdmin) return;
    fetch('/api/chat/pin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id, pin: false }),
    }).then(() => {/* Optionally refetch messages */});
  };

  // Filter pinned messages (expire after 7 days)
  const now = Date.now();
  const pinnedMessages = messages.filter((m: any) => m.pinned && now - m.timestamp < 7 * 24 * 60 * 60 * 1000);
  const recentMessages = messages.filter((m: any) => !m.pinned);

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom>Realtime Chat Box</Typography>
      {loading && <Typography variant="body2">Loading messages...</Typography>}
      {error && <Typography variant="body2" color="error">{error}</Typography>}
      <Box sx={{ maxHeight: 250, overflowY: 'auto', mb: 2 }}>
        <Typography variant="subtitle2" color="primary" sx={{ mb: 1 }}>
          Pinned Messages
        </Typography>
        {pinnedMessages.length === 0 && (
          <Typography variant="body2" color="text.secondary">No pinned messages.</Typography>
        )}
        {pinnedMessages.map((m: any) => (
          <Paper key={m.id} variant="outlined" sx={{ p: 1, mb: 1, bgcolor: 'yellow.100' }}>
            <Typography variant="body2">{m.user}: {m.text}</Typography>
            {isAdmin && <Button size="small" color="warning" sx={{ ml: 1 }} onClick={() => handleUnpin(m.id)}>Unpin</Button>}
          </Paper>
        ))}
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          Recent Messages
        </Typography>
        {recentMessages.length === 0 && (
          <Typography variant="body2" color="text.secondary">No messages yet.</Typography>
        )}
        {recentMessages.map((m: any) => (
          <Paper key={m.id} variant="outlined" sx={{ p: 1, mb: 1 }}>
            <Typography variant="body2">{m.user}: {m.text}</Typography>
            {isAdmin && <Button size="small" color="warning" sx={{ ml: 1 }} onClick={() => handlePin(m.id)}>Pin</Button>}
          </Paper>
        ))}
      </Box>
      <Stack direction="row" spacing={2} alignItems="center">
        <TextField fullWidth size="small" placeholder="Type your message..." value={input} onChange={e => setInput(e.target.value)} />
        <Button variant="contained" color="primary" onClick={handleSend}>Send</Button>
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
        Messages can be pinned for 7 days. Only admins can pin/unpin.
      </Typography>
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

      <DashboardLayout taskList={<RealtimeChatBox />} liveUpdates={<LiveUpdates />}>
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
