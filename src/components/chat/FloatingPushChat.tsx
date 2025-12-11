'use client';

import React, { useState } from 'react';
import {
  Box,
  Fab,
  Paper,
  Slide,
  IconButton,
  Typography,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import PushChat from './PushChat';

interface FloatingPushChatProps {
  peerAddress?: string;
  chatName?: string;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
}

export default function FloatingPushChat({
  peerAddress,
  chatName = 'Push Chat',
  position = 'bottom-right',
}: FloatingPushChatProps) {
  const [isOpen, setIsOpen] = useState(false);

  const positionStyles = {
    'bottom-right': { bottom: 24, right: 24 },
    'bottom-left': { bottom: 24, left: 24 },
    'bottom-center': { bottom: 24, left: '50%', transform: 'translateX(-50%)' },
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Fab
          color="primary"
          aria-label="Open Chat"
          onClick={() => setIsOpen(true)}
          sx={{
            position: 'fixed',
            ...positionStyles[position],
            zIndex: 1000,
            boxShadow: 3,
          }}
        >
          <ChatIcon />
        </Fab>
      )}

      {/* Chat Window */}
      <Slide direction="up" in={isOpen} mountOnEnter unmountOnExit>
        <Paper
          elevation={8}
          sx={{
            position: 'fixed',
            ...positionStyles[position],
            width: { xs: 'calc(100vw - 48px)', sm: 400 },
            height: { xs: 'calc(100vh - 120px)', sm: 600 },
            maxWidth: 500,
            maxHeight: 700,
            zIndex: 1001,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              p: 1,
              borderBottom: 1,
              borderColor: 'divider',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              bgcolor: 'transparent',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {chatName}
            </Typography>
            <IconButton
              size="small"
              onClick={() => setIsOpen(false)}
              aria-label="Close Chat"
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <PushChat
              peerAddress={peerAddress}
              chatName={chatName}
              onClose={() => setIsOpen(false)}
              compact={true}
            />
          </Box>
        </Paper>
      </Slide>
    </>
  );
}
