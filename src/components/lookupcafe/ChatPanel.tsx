import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { getSocket } from '../../utils/socket';

interface ChatMessage {
  playerId: string;
  playerName: string;
  message: string;
  timestamp: number;
}

interface ChatPanelProps {
  roomCode: string;
  playerName: string;
}

export default function ChatPanel({ roomCode, playerName }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef(getSocket());

  useEffect(() => {
    const socket = socketRef.current;

    const handleChatMessage = (data: ChatMessage) => {
      setMessages(prev => [...prev, data]);
    };

    socket.on('game:chat-message', handleChatMessage);

    return () => {
      socket.off('game:chat-message', handleChatMessage);
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    socketRef.current.emit('game:chat', {
      roomCode,
      message: inputMessage.trim(),
      playerName,
    });

    setInputMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Paper elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" fontWeight="bold">
          Chat
        </Typography>
      </Box>
      <Divider />
      
      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        <List dense>
          {messages.map((msg, index) => (
            <ListItem key={index} alignItems="flex-start" sx={{ py: 0.5 }}>
              <ListItemText
                primary={
                  <Typography variant="body2" component="span" fontWeight="bold">
                    {msg.playerName}
                  </Typography>
                }
                secondary={
                  <Typography variant="body2" component="span">
                    {msg.message}
                  </Typography>
                }
              />
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Box>

      <Divider />
      <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Type a message..."
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          variant="outlined"
        />
        <IconButton
          color="primary"
          onClick={handleSendMessage}
          disabled={!inputMessage.trim()}
        >
          <SendIcon />
        </IconButton>
      </Box>
    </Paper>
  );
}
