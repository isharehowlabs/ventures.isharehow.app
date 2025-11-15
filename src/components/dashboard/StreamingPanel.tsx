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
    <Box sx={{ p: 2, height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Live Stream
        </Typography>
        <Box sx={{ aspectRatio: '16/9', position: 'relative', bgcolor: '#000', borderRadius: 2, overflow: 'hidden' }}>
          <Box id="twitch-player-streaming" ref={twitchPlayerRef} sx={{ width: '100%', height: '100%' }} />
        </Box>
      </Paper>

      <Paper sx={{ p: 2, flexGrow: 1, minHeight: 400 }}>
        <Typography variant="h6" gutterBottom>
          Chat
        </Typography>
        <Box sx={{ height: '100%', minHeight: 400, position: 'relative' }}>
          <iframe
            ref={twitchChatRef}
            src="https://www.twitch.tv/embed/jameleliyah/chat?darkpopout&parent=ventures.isharehow.app"
            height="100%"
            width="100%"
            frameBorder="0"
            scrolling="no"
            style={{
              border: 'none',
              borderRadius: 8,
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
}
