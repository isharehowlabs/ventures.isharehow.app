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

// Task List Feature (placeholder - chat feature not yet implemented)
function TaskListPlaceholder() {
  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Task List & Chat
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Real-time chat and task management features coming soon!
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

      <DashboardLayout
        taskList={<TaskListPlaceholder />}
        liveUpdates={<LiveUpdates />}
        communityQA={
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
          </Paper>
        }
      >
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
