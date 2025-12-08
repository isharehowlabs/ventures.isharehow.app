import { useState, useEffect, useRef, FormEvent } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Chip,
  Stack,
  Divider,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Tooltip,
  Card,
  CardContent,
} from '@mui/material';
import {
  Send as SendIcon,
  Psychology as PsychologyIcon,
  Refresh as RefreshIcon,
  PlayArrow as PlayIcon,
} from '@mui/icons-material';
import { trackJournalEntry } from '../../utils/analytics';
import { logActivity } from '../wellness/api';
import { useAuth } from '../../hooks/useAuth';
import { getBackendUrl } from '../../utils/backendUrl';

interface JournalEntry {
  id: string;
  date: string;
  content: string;
  mood: 'great' | 'good' | 'okay' | 'challenging';
  tags: string[];
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

type GeminiModel = 'gemini-3-pro-preview' | 'gemini-2.5-pro';

export default function MentalSpiritualJournal() {
  const { isAuthenticated } = useAuth();
  // Journal state
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState('');
  const [currentMood, setCurrentMood] = useState<'great' | 'good' | 'okay' | 'challenging'>('good');

  // AI Chat state
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<GeminiModel>('gemini-3-pro-preview');

  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Load journal entries
  useEffect(() => {
    const stored = localStorage.getItem('mindset_journal');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setEntries(parsed.slice(0, 30));
      } catch (error) {
        console.error('Failed to load journal entries:', error);
      }
    }
  }, []);

  // Scroll chat to bottom
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // YouTube playlist from Consciousness Journey channel
  const CONSCIOUSNESS_PLAYLIST_ID = 'PL5oPceUn7qyfn6ifad_U8ydnRMn0HXCO6';
  const consciousnessVideoUrl = `https://www.youtube.com/embed/videoseries?list=${CONSCIOUSNESS_PLAYLIST_ID}`;

  const handleSaveJournal = async () => {
    if (!currentEntry.trim()) return;

    const newEntry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      content: currentEntry,
      mood: currentMood,
      tags: ['mental', 'spiritual', 'reflection'],
    };

    const updatedEntries = [newEntry, ...entries].slice(0, 30);
    setEntries(updatedEntries);
    localStorage.setItem('mindset_journal', JSON.stringify(updatedEntries));

    trackJournalEntry(currentMood, 'rise');

    if (isAuthenticated) {
      try {
        await logActivity('journal', 'Mental Spiritual Journal Entry', currentEntry);
      } catch (error) {
        console.error('Failed to save journal entry to backend:', error);
      }
    }

    setCurrentEntry('');
  };

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/gemini-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          messages: [...messages, userMessage],
          model: selectedModel,
        }),
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          const errorMsg = errorData.text || errorData.error || errorData.message || `Server error: ${response.status}`;
          throw new Error(errorMsg);
        } else {
          const text = await response.text();
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
      }

      const data = await response.json();
      if (!data.text || typeof data.text !== 'string') {
        throw new Error('Invalid response format from server');
      }

      const botMessage: Message = { role: 'model', text: data.text };
      setMessages((prevMessages) => [...prevMessages, botMessage]);
    } catch (err: any) {
      const errorMessage = err?.message || 'An unexpected error occurred';
      const isConfigError = errorMessage.toLowerCase().includes('not configured') ||
                           errorMessage.toLowerCase().includes('api key');
      if (!isConfigError) {
        console.error('Error sending message:', err);
      }
      setError(errorMessage);
      const userFriendlyMessage = isConfigError
        ? 'The AI chat feature is not yet configured. Please contact an administrator.'
        : `Sorry, I encountered an error: ${errorMessage}`;
      setMessages((prevMessages) => [...prevMessages, { role: 'model', text: userFriendlyMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshChat = () => {
    setMessages([]);
    setError(null);
    setInput('');
  };

  const getMoodColor = (mood: string): 'success' | 'primary' | 'warning' | 'error' => {
    switch (mood) {
      case 'great':
        return 'success';
      case 'good':
        return 'primary';
      case 'okay':
        return 'warning';
      case 'challenging':
        return 'error';
      default:
        return 'primary';
    }
  };

  return (
    <Grid container spacing={3}>
      {/* Left Column: YouTube Video & Journal */}
      <Grid item xs={12} lg={7}>
        <Stack spacing={3}>
          {/* YouTube Video Section */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Journey Through Consciousness
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Listen to consciousness exploration content while you journal and reflect. Explore the depths of your mind and unlock your true potential.
            </Typography>
            <Box
              sx={{
                position: 'relative',
                paddingBottom: '56.25%', // 16:9 aspect ratio
                height: 0,
                overflow: 'hidden',
                borderRadius: 2,
                bgcolor: 'black',
              }}
            >
              <iframe
                src={consciousnessVideoUrl}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                }}
                title="Journey Through Consciousness Playlist"
              />
            </Box>
            <Button
              variant="outlined"
              startIcon={<PlayIcon />}
              href="https://www.youtube.com/@ConsciousnessJourney"
              target="_blank"
              rel="noopener noreferrer"
              sx={{ mt: 2 }}
              fullWidth
            >
              Visit Consciousness Journey Channel on YouTube
            </Button>
          </Paper>

          {/* Journal Writing Section */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Your Journal
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Write down what's coming to you, your thoughts, insights, and reflections
            </Typography>

            <Box sx={{ my: 3 }}>
              <TextField
                fullWidth
                multiline
                rows={8}
                placeholder="What's on your mind? What insights came to you? What are you feeling or processing? Write freely..."
                value={currentEntry}
                onChange={(e) => setCurrentEntry(e.target.value)}
                sx={{ mb: 2 }}
              />

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  How are you feeling?
                </Typography>
                <Stack direction="row" spacing={1}>
                  {(['great', 'good', 'okay', 'challenging'] as const).map((mood) => (
                    <Chip
                      key={mood}
                      label={mood}
                      color={getMoodColor(mood)}
                      variant={currentMood === mood ? 'filled' : 'outlined'}
                      onClick={() => setCurrentMood(mood)}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  ))}
                </Stack>
              </Box>

              <Button
                variant="contained"
                onClick={handleSaveJournal}
                disabled={!currentEntry.trim()}
                fullWidth
                size="large"
              >
                Save Entry
              </Button>
            </Box>

            {entries.length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom>
                  Recent Entries
                </Typography>
                <Stack spacing={2}>
                  {entries.slice(0, 5).map((entry) => (
                    <Card key={entry.id} variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(entry.date).toLocaleDateString()}
                          </Typography>
                          <Chip
                            label={entry.mood}
                            size="small"
                            color={getMoodColor(entry.mood)}
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </Box>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                          {entry.content}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </>
            )}
          </Paper>
        </Stack>
      </Grid>

      {/* Right Column: AI Chat */}
      <Grid item xs={12} lg={5}>
        <Paper
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: { xs: 600, lg: 800 },
            height: { xs: 'auto', lg: 'calc(100vh - 150px)' },
            maxHeight: { lg: 'calc(100vh - 150px)' },
          }}
        >
          {/* Chat Header */}
          <Box
            sx={{
              p: 2,
              borderBottom: 1,
              borderColor: 'divider',
              bgcolor: 'primary.main',
              color: 'primary.contrastText',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
              <PsychologyIcon />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem' }}>
                  AI Spiritual Guide
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.7rem' }}>
                  Get advice and help with your thoughts and journey
                </Typography>
              </Box>
              <FormControl
                size="small"
                sx={{
                  minWidth: 140,
                  '& .MuiOutlinedInput-root': {
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'inherit',
                    '& fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.9)',
                  },
                }}
              >
                <InputLabel id="model-select-label" sx={{ fontSize: '0.7rem' }}>
                  Model
                </InputLabel>
                <Select
                  labelId="model-select-label"
                  value={selectedModel}
                  label="Model"
                  onChange={(e) => setSelectedModel(e.target.value as GeminiModel)}
                  disabled={isLoading}
                  sx={{ fontSize: '0.75rem' }}
                >
                  <MenuItem value="gemini-3-pro-preview">Gemini 3 Pro</MenuItem>
                  <MenuItem value="gemini-2.5-pro">Gemini 2.5 Pro</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <Tooltip title="Refresh chat">
              <IconButton
                onClick={handleRefreshChat}
                disabled={isLoading}
                size="small"
                sx={{ color: 'inherit', ml: 1 }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Chat Messages */}
          <Box
            ref={chatContainerRef}
            sx={{
              flexGrow: 1,
              p: 2,
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              minHeight: 0,
              bgcolor: 'background.default',
            }}
          >
            {messages.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <PsychologyIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                  Welcome to your AI Spiritual Guide
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Share your thoughts, ask questions, or seek guidance on your consciousness journey. I'm here to help you process, understand, and grow.
                </Typography>
              </Box>
            )}

            {messages.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 1.5,
                    maxWidth: '85%',
                    bgcolor: msg.role === 'user' ? 'primary.main' : 'background.paper',
                    color: msg.role === 'user' ? 'white' : 'text.primary',
                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem' }}>
                    {msg.text}
                  </Typography>
                </Paper>
              </Box>
            ))}

            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 1.5,
                    bgcolor: 'background.paper',
                    borderRadius: '18px 18px 18px 4px',
                  }}
                >
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                    Thinking...
                  </Typography>
                </Paper>
              </Box>
            )}
          </Box>

          {/* Input Area */}
          <Box
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <form onSubmit={handleSendMessage}>
              <Stack direction="row" spacing={1} alignItems="flex-end">
                <TextField
                  fullWidth
                  multiline
                  maxRows={3}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (!isLoading && input.trim()) {
                        const form = e.currentTarget.closest('form');
                        if (form) {
                          form.requestSubmit();
                        }
                      }
                    }
                  }}
                  placeholder="Share your thoughts, ask for guidance, or discuss your journey..."
                  variant="outlined"
                  disabled={isLoading}
                  size="small"
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading || !input.trim()}
                  sx={{ minWidth: 50, height: 40 }}
                >
                  <SendIcon />
                </Button>
              </Stack>
            </form>
            {error && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                {error}
              </Typography>
            )}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
}

