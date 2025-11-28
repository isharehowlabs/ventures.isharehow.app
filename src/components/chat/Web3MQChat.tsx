'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Button,
  Divider,
} from '@mui/material';
import {
  Send as SendIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useWeb3MQ, Web3MQMessage } from '../../hooks/useWeb3MQ';

interface Web3MQChatProps {
  channelId?: string;
  channelName?: string;
  onClose?: () => void;
  compact?: boolean;
}

export default function Web3MQChat({
  channelId,
  channelName = 'General Chat',
  onClose,
  compact = false,
}: Web3MQChatProps) {
  const { client, isConnected, isInitializing, error, messages, initialize, sendMessage, disconnect, clearError } = useWeb3MQ();
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);

  // Initialize on mount
  useEffect(() => {
    if (!isConnected && !isInitializing) {
      initialize();
    }
  }, [isConnected, isInitializing, initialize]);

  const handleSend = async () => {
    if (!messageText.trim() || !isConnected || sending) {
      return;
    }

    setSending(true);
    try {
      const success = await sendMessage(messageText.trim(), channelId);
      if (success) {
        setMessageText('');
      }
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Paper
      elevation={2}
      sx={{
        height: compact ? '100%' : '600px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6">{channelName}</Typography>
          {isConnected && (
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'success.main',
              }}
            />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {isInitializing && <CircularProgress size={20} />}
          {onClose && (
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert
          severity="error"
          onClose={clearError}
          sx={{ m: 2 }}
        >
          {error}
        </Alert>
      )}

      {/* Connection Status */}
      {!isConnected && !isInitializing && (
        <Box sx={{ p: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            Web3MQ not connected. Click to initialize.
          </Alert>
          <Button
            variant="contained"
            onClick={() => initialize()}
            disabled={isInitializing}
            fullWidth
          >
            {isInitializing ? <CircularProgress size={20} /> : 'Connect Web3MQ'}
          </Button>
        </Box>
      )}

      {/* Messages List */}
      <Box
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          p: 2,
        }}
      >
        {isInitializing ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : messages.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">
              No messages yet. Start the conversation!
            </Typography>
          </Box>
        ) : (
          <List>
            {messages.map((message) => (
              <ListItem
                key={message.id}
                sx={{
                  mb: 1,
                  bgcolor: 'background.paper',
                  borderRadius: 1,
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <ListItemText
                  primary={message.content}
                  secondary={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        {message.sender}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>

      {/* Message Input */}
      {isConnected && (
        <>
          <Divider />
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={sending || !isConnected}
                multiline
                maxRows={4}
              />
              <IconButton
                color="primary"
                onClick={handleSend}
                disabled={!messageText.trim() || sending || !isConnected}
              >
                {sending ? <CircularProgress size={20} /> : <SendIcon />}
              </IconButton>
            </Box>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Press Enter to send, Shift+Enter for new line
            </Typography>
          </Box>
        </>
      )}
    </Paper>
  );
}
