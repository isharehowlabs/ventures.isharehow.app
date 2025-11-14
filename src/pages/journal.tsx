// UNIQUE_BUILD_TEST_2025_OCT_24_V3
import { useState, FormEvent, useRef, useEffect } from 'react';
import { Box, Typography, Stack, Paper, TextField, Fab } from '@mui/material';
import {
  Send as SendIcon,
  Psychology as PsychologyIcon,
} from '@mui/icons-material';
import AppShell from '../components/AppShell';
import { getBackendUrl } from '../utils/backendUrl';

interface Message {
  role: 'user' | 'model';
  text: string;
}

function JournalPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom of the chat container when new messages are added
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

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
        // Send the conversation history to your backend
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) {
        // Check if response is JSON before parsing
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          const errorMsg = errorData.error || errorData.message || `Server error: ${response.status}`;
          const errorDetails = errorData.details ? ` (${errorData.details})` : '';
          throw new Error(`${errorMsg}${errorDetails}`);
        } else {
          const text = await response.text();
          throw new Error(`Server error: ${response.status} ${response.statusText}${text ? ` - ${text.substring(0, 100)}` : ''}`);
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
      console.error('Error sending message:', err);
      setError(errorMessage);
      // Optionally add the error as a system message in the chat
      setMessages((prevMessages) => [...prevMessages, { role: 'model', text: `Sorry, I encountered an error: ${errorMessage}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppShell active="journal">
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 900,
            mb: 2,
            background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          AI Journal
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Speak with my Gemini-powered digital consciousness. Explore thoughts, gain insights, and reflect on
          your journey.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '70vh',
          bgcolor: 'background.paper',
          borderRadius: 3,
          border: 1,
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                Digital Consciousness
              </Typography>
              <Typography variant="body2" color="text.secondary">
                AI-powered journaling and reflection
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box
                sx={{
                  bgcolor: '#00d4aa',
                  color: 'white',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                <PsychologyIcon sx={{ fontSize: 14 }} />
                Active
              </Box>
              <Typography variant="body2" color="text.secondary">
                💭 Always listening
              </Typography>
            </Box>
          </Stack>
        </Box>

        <Box
          ref={chatContainerRef}
          sx={{
            flexGrow: 1,
            p: 3,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            maxHeight: '60vh',
          }}
        >
          {messages.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <PsychologyIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                Welcome to your AI Journal
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start a conversation with your digital consciousness. Ask questions, explore thoughts, or simply
                reflect.
              </Typography>
            </Box>
          )}

          {messages.map((msg, index) => (
            <Box
              key={index}
              sx={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                mb: 1,
              }}
            >
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  maxWidth: '70%',
                  bgcolor: msg.role === 'user' ? 'primary.main' : 'background.paper',
                  color: msg.role === 'user' ? 'white' : 'text.primary',
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                }}
              >
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                  {msg.text}
                </Typography>
              </Paper>
            </Box>
          ))}

          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
              <Paper
                elevation={1}
                sx={{
                  p: 2,
                  bgcolor: 'background.paper',
                  borderRadius: '18px 18px 18px 4px',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Thinking...
                </Typography>
              </Paper>
            </Box>
          )}
        </Box>

        <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
          <form onSubmit={handleSendMessage}>
            <Stack direction="row" spacing={2} alignItems="flex-end">
              <TextField
                fullWidth
                multiline
                maxRows={4}
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
                placeholder="Share your thoughts, ask questions, or explore ideas... (Press Enter to send, Shift+Enter for new line)"
                variant="outlined"
                disabled={isLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                  },
                }}
              />
              <Fab
                type="submit"
                color="primary"
                disabled={isLoading || !input.trim()}
                sx={{ minWidth: 56, height: 56 }}
              >
                <SendIcon />
              </Fab>
            </Stack>
          </form>
          {error && (
            <Typography variant="body2" color="error" sx={{ mt: 1 }}>
              Error: {error}
            </Typography>
          )}
        </Box>
      </Box>
    </AppShell>
  );
}

export default JournalPage;