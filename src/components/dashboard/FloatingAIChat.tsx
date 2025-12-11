// src/components/dashboard/FloatingAIChat.tsx
import { useState, FormEvent, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  Paper,
  TextField,
  Fab,
  IconButton,
  Tooltip,
  Collapse,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Send as SendIcon,
  Psychology as PsychologyIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import { getBackendUrl } from '../../utils/backendUrl';

interface Message {
  role: 'user' | 'model';
  text: string;
}

type GeminiModel = 'gemini-3-pro-preview' | 'gemini-2.5-pro';

export default function FloatingAIChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<GeminiModel>('gemini-3-pro-preview');

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom of the chat container when new messages are added
    if (chatContainerRef.current && isOpen) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleRefresh = () => {
    // Clear all messages and reset the chat
    setMessages([]);
    setError(null);
    setInput('');
    setIsLoading(false);
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
          model: selectedModel
        }),
      });

      if (!response.ok) {
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
    <>
      {/* Floating Chat Button */}
      <Fab
        color="primary"
        aria-label="AI Chat"
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1300,
          boxShadow: 3,
        }}
      >
        {isOpen ? <CloseIcon /> : <ChatIcon />}
      </Fab>

      {/* Floating Chat Window */}
      <Collapse in={isOpen} orientation="vertical">
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            bottom: 100,
            right: 24,
            width: { xs: 'calc(100vw - 48px)', sm: 400, md: 450 },
            height: { xs: 'calc(100vh - 150px)', sm: 600 },
            maxHeight: { sm: 600 },
            zIndex: 1300,
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 3,
            overflow: 'hidden',
            border: 1,
            borderColor: 'divider',
          }}
        >
          {/* Header */}
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
                  AI Journal
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.7rem' }}>
                  Gemini-powered digital consciousness
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
                    '&:hover fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'rgba(255, 255, 255, 0.7)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'rgba(255, 255, 255, 0.9)',
                  },
                  '& .MuiSvgIcon-root': {
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
                  sx={{ 
                    fontSize: '0.75rem',
                    '& .MuiSelect-select': {
                      py: 0.5,
                    },
                  }}
                >
                  <MenuItem value="gemini-3-pro-preview" sx={{ fontSize: '0.75rem' }}>
                    Gemini 3 Pro Preview
                  </MenuItem>
                  <MenuItem value="gemini-2.5-pro" sx={{ fontSize: '0.75rem' }}>
                    Gemini 2.5 Pro
                  </MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Tooltip title="Refresh chat">
                <IconButton
                  onClick={handleRefresh}
                  disabled={isLoading}
                  size="small"
                  sx={{ color: 'inherit' }}
                >
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Tooltip title="Close">
                <IconButton
                  onClick={() => setIsOpen(false)}
                  size="small"
                  sx={{ color: 'inherit' }}
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
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
                  Welcome to your AI Journal
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Start a conversation with your digital consciousness. Ask questions, explore thoughts, or simply reflect.
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
                    p: 1.5,
                    maxWidth: '80%',
                    bgcolor: msg.role === 'user' ? 'primary.main' : 'rgba(0, 0, 0, 0.02)',
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
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1 }}>
                <Paper
                  elevation={1}
                  sx={{
                    p: 1.5,
                    bgcolor: 'rgba(0, 0, 0, 0.02)',
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
              bgcolor: 'transparent',
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
                  placeholder="Share your thoughts..."
                  variant="outlined"
                  disabled={isLoading}
                  size="small"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
                <Fab
                  type="submit"
                  color="primary"
                  disabled={isLoading || !input.trim()}
                  size="small"
                  sx={{ minWidth: 40, height: 40 }}
                >
                  <SendIcon sx={{ fontSize: 18 }} />
                </Fab>
              </Stack>
            </form>
            {error && (
              <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                {error}
              </Typography>
            )}
          </Box>
        </Paper>
      </Collapse>
    </>
  );
}

