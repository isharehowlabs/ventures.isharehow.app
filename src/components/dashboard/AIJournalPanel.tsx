// src/components/dashboard/AIJournalPanel.tsx
import { useState, FormEvent, useRef, useEffect } from 'react';
import { Box, Typography, Stack, Paper, TextField, Fab, IconButton, Tooltip, Button } from '@mui/material';
import {
  Send as SendIcon,
  Psychology as PsychologyIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { getBackendUrl } from '../../utils/backendUrl';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function AIJournalPanel() {
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

  const handleRefresh = () => {
    // Clear all messages and reset the chat
    setMessages([]);
    setError(null);
    setInput('');
    setIsLoading(false);
  };

  const handleExport = () => {
    if (messages.length === 0) return;
    
    const exportData = messages.map((msg, index) => ({
      index: index + 1,
      role: msg.role === 'user' ? 'You' : 'AI',
      text: msg.text,
      timestamp: new Date().toISOString(),
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-journal-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
        // Send the conversation history to your backend
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) {
        // Check if response is JSON before parsing
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          // Use the 'text' field from error response if available (more user-friendly)
          const errorMsg = errorData.text || errorData.error || errorData.message || `Server error: ${response.status}`;
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
      // Only log unexpected errors to console (not configuration errors)
      const isConfigError = errorMessage.toLowerCase().includes('not configured') || 
                           errorMessage.toLowerCase().includes('api key') ||
                           errorMessage.toLowerCase().includes('configuration');
      if (!isConfigError) {
        console.error('Error sending message:', err);
      }
      setError(errorMessage);
      // Show user-friendly error message in chat
      const userFriendlyMessage = isConfigError 
        ? 'The AI chat feature is not yet configured. Please contact an administrator to set up the Gemini API key.'
        : `Sorry, I encountered an error: ${errorMessage}`;
      setMessages((prevMessages) => [...prevMessages, { role: 'model', text: userFriendlyMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        bgcolor: 'background.paper',
        borderRadius: 3,
        border: 1,
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              AI Journal
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Gemini-powered digital consciousness
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {messages.length > 0 && (
              <Tooltip title="Export conversation">
                <IconButton
                  onClick={handleExport}
                  size="small"
                  sx={{ color: 'text.secondary' }}
                >
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
            )}
            <Tooltip title="Refresh chat">
              <IconButton
                onClick={handleRefresh}
                disabled={isLoading}
                size="small"
                sx={{ color: 'text.secondary' }}
              >
                <RefreshIcon />
              </IconButton>
            </Tooltip>
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
          </Box>
        </Stack>
      </Box>

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

      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', flexShrink: 0 }}>
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
              size="small"
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
              size="small"
              sx={{ minWidth: 48, height: 48 }}
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
  );
}

