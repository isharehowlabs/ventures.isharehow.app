import { Box, Typography, Paper, Grid } from '@mui/material';
import { useEffect } from 'react';

export default function StreamingPanel() {
  useEffect(() => {
    // Initialize AdSense ads after component mounts
    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
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
      <Grid container spacing={2} sx={{ height: '100%', minHeight: 0 }}>
        <Grid item xs={12} lg={8} sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, gap: 2 }}>
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
              <iframe
                src="https://player.twitch.tv/?channel=jameleliyah&parent=ventures.isharehow.app&parent=localhost"
                frameBorder="0"
                allowFullScreen
                scrolling="no"
                allow="autoplay; fullscreen"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                }}
                title="Twitch Stream"
              />
            </Box>
          </Paper>
          
          {/* Google AdSense Ad Block */}
          <Paper sx={{ p: { xs: 1, sm: 2 }, flexShrink: 0 }}>
            <ins 
              className="adsbygoogle"
              style={{ display: 'block' }}
              data-ad-format="autorelaxed"
              data-ad-client="ca-pub-0501888641420535"
              data-ad-slot="8218985343"
            />
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4} sx={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <Paper sx={{ p: { xs: 1, sm: 2 }, flexShrink: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
              Chat
            </Typography>
            <Box 
              sx={{ 
                flexGrow: 1,
                position: 'relative', 
                bgcolor: '#000', 
                borderRadius: 2, 
                overflow: 'hidden',
                width: '100%',
                minHeight: 400,
              }}
            >
              <iframe
                src="https://www.twitch.tv/embed/jameleliyah/chat?parent=ventures.isharehow.app&parent=localhost&darkpopout"
                frameBorder="0"
                scrolling="yes"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                }}
                title="Twitch Chat"
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
