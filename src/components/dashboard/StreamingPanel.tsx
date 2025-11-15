import { useEffect, useRef } from 'react';
import { Box, Typography, Paper, Stack } from '@mui/material';

declare global {
  interface Window {
    Twitch: any;
  }
}

export default function StreamingPanel() {
  const twitchPlayerRef = useRef<any | null>(null);
  const twitchChatRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://player.twitch.tv/js/embed/v1.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.Twitch && twitchPlayerRef.current) {
        const player = new window.Twitch.Player(twitchPlayerRef.current, {
          channel: 'jameleliyah',
          width: '100%',
          height: '100%',
          parent: ['ventures.isharehow.app', 'localhost'],
          autoplay: false,
        });
      }
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <Box 
      sx={{ 
        p: { xs: 1, sm: 2 }, 
        height: '100%', 
        overflow: 'auto', 
        display: 'flex', 
        flexDirection: 'column', 
        gap: { xs: 1, sm: 2 },
        minHeight: 0,
      }}
    >
      <Paper sx={{ p: { xs: 1, sm: 2 }, flexShrink: 0 }}>
        <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          Live Stream
        </Typography>
        <Box 
          sx={{ 
            aspectRatio: '16/9', 
            position: 'relative', 
            bgcolor: '#000', 
            borderRadius: 2, 
            overflow: 'hidden',
            width: '100%',
          }}
        >
          <Box id="twitch-player-streaming" ref={twitchPlayerRef} sx={{ width: '100%', height: '100%' }} />
        </Box>
      </Paper>
    </Box>
  );
}
