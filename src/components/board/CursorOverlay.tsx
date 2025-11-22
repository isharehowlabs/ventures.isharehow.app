import React from 'react';
import { Box, Typography } from '@mui/material';
import { useBoardContext } from '../../hooks/useBoardContext';

export default function CursorOverlay() {
  const { presence } = useBoardContext();

  // Filter out current user and offline users
  const otherActiveCursors = Array.from(presence.values()).filter(
    (p) => p.status === 'active' && p.cursor
  );

  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      {otherActiveCursors.map((user) => (
        <Box
          key={user.userId}
          sx={{
            position: 'absolute',
            left: user.cursor?.x || 0,
            top: user.cursor?.y || 0,
            transform: 'translate(-50%, -50%)',
            transition: 'all 0.1s ease-out',
          }}
        >
          {/* Cursor Icon */}
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
            }}
          >
            <path
              d="M5.5 3.21V20.8L9.5 16.8L12.5 24L14.5 23L11.5 15.8L16.5 15.3L5.5 3.21Z"
              fill={`hsl(${(user.userId.charCodeAt(0) * 137.5) % 360}, 70%, 50%)`}
              stroke="white"
              strokeWidth="1"
            />
          </svg>

          {/* User Name Label */}
          <Box
            sx={{
              position: 'absolute',
              top: 20,
              left: 10,
              bgcolor: `hsl(${(user.userId.charCodeAt(0) * 137.5) % 360}, 70%, 50%)`,
              color: 'white',
              px: 1,
              py: 0.5,
              borderRadius: 1,
              fontSize: '0.75rem',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              boxShadow: 1,
            }}
          >
            {user.name}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
