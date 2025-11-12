import { useCallback, useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Box,
  Typography,
  Stack,
  Paper,
  Button,
  Skeleton,
  Collapse,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import AppShell from '../components/AppShell';

declare global {
  interface Window {
    Twitch: any;
  }
}

const ContentLibraryView = dynamic(() => import('../components/ContentLibraryView'), {
  ssr: false,
  loading: () => (
    <Stack spacing={2}>
      <Skeleton variant="rounded" height={48} />
      <Skeleton variant="rounded" height={32} />
      <Skeleton variant="rounded" height={320} />
    </Stack>
  ),
});

// Your Twitch streaming content data
const twitchStreams = [
  {
    id: 'main-channel',
    title: 'Jamel EliYah Live',
    subtitle: 'Main Channel Streaming',
    description:
      'Join live streams featuring wellness coaching, spiritual discussions, fitness training, and community Q&A sessions.',
    thumbnail: 'https://static-cdn.jtvnw.net/previews-ttv/live_user_jameleliyah-440x248.jpg',
    category: 'Live Stream',
    color: '#9146FF',
    stats: { viewers: '1.2K', followers: '15K', status: 'Live' },
    url: 'https://www.twitch.tv/jameleliyah',
    tags: ['Wellness', 'Spirituality', 'Fitness'],
  },
  {
    id: 'wellness-sessions',
    title: 'Wellness Coaching',
    subtitle: 'Health & Wellness Sessions',
    description:
      'Live wellness coaching sessions with personalized health plans, meditation guidance, and holistic healing practices.',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    category: 'Wellness',
    color: '#15803d',
    stats: { viewers: '856', followers: '8.2K', status: 'Scheduled' },
    url: 'https://www.twitch.tv/jameleliyah',
    tags: ['Wellness', 'Coaching', 'Health'],
  },
  {
    id: 'spiritual-guidance',
    title: 'Spiritual Discussions',
    subtitle: 'Consciousness & Spirituality',
    description:
      'Deep spiritual discussions, consciousness exploration, and guided meditation sessions for personal growth.',
    thumbnail: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=600&fit=crop',
    category: 'Spirituality',
    color: '#be185d',
    stats: { viewers: '1.8K', followers: '12K', status: 'Live' },
    url: 'https://www.twitch.tv/jameleliyah',
    tags: ['Spirituality', 'Meditation', 'Consciousness'],
  },
  {
    id: 'fitness-training',
    title: 'RISE Cycling Training',
    subtitle: 'Live Fitness Sessions',
    description:
      'Interactive cycling training sessions with real-time coaching, performance tracking, and community motivation.',
    thumbnail: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=600&fit=crop',
    category: 'Fitness',
    color: '#c2410c',
    stats: { viewers: '2.1K', followers: '18K', status: 'Live' },
    url: 'https://www.twitch.tv/jameleliyah',
    tags: ['Fitness', 'Cycling', 'Training'],
  },
  {
    id: 'community-qa',
    title: 'Community Q&A',
    subtitle: 'Live Q&A Sessions',
    description:
      'Interactive Q&A sessions where community members can ask questions about wellness, business, and personal development.',
    thumbnail: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
    category: 'Community',
    color: '#0891b2',
    stats: { viewers: '945', followers: '9.5K', status: 'Scheduled' },
    url: 'https://www.twitch.tv/jameleliyah',
    tags: ['Q&A', 'Community', 'Support'],
  },
  {
    id: 'meditation-sessions',
    title: 'Guided Meditation',
    subtitle: 'Peace & Mindfulness',
    description:
      'Live guided meditation sessions for stress relief, mindfulness practice, and spiritual connection.',
    thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    category: 'Meditation',
    color: '#7c3aed',
    stats: { viewers: '1.5K', followers: '11K', status: 'Live' },
    url: 'https://www.twitch.tv/jameleliyah',
    tags: ['Meditation', 'Mindfulness', 'Peace'],
  },
];

function App() {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(true);
  const twitchPlayerRef = useRef<any | null>(null);
  const twitchPlayer = useRef<any | null>(null);

  const handleToggleLibrary = useCallback(() => {
    const nextState = !libraryOpen;
    setLibraryOpen(nextState);
    if (nextState) {
      setVideoOpen(false);
      twitchPlayer.current?.pause();
    } else {
      setVideoOpen(true);
      twitchPlayer.current?.play();
    }
  }, [libraryOpen]);

  const handleToggleVideo = useCallback(() => {
    const nextState = !videoOpen;
    setVideoOpen(nextState);
    if (nextState) {
      setLibraryOpen(false);
      twitchPlayer.current?.play();
    } else {
      setLibraryOpen(true);
      twitchPlayer.current?.pause();
    }
  }, [videoOpen]);

  // Effect to initialize Twitch Player
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
        twitchPlayer.current = player;
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <AppShell active="live">
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 900,
            mb: 2,
            background: 'linear-gradient(45deg, #9146FF, #ff6b6b, #4ecdc4)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Live Streaming
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Join live streams for wellness coaching, spiritual guidance, fitness training, and community interaction.
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 2fr) minmax(320px, 1fr)' },
          gap: 3,
          alignItems: 'start',
          mb: 6,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Collapse in={videoOpen} unmountOnExit>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.paper',
                borderRadius: 3,
                border: 1,
                borderColor: 'divider',
                overflow: 'hidden',
              }}
            >
              <Box sx={{ p: { xs: 2, sm: 3 }, borderBottom: 1, borderColor: 'divider' }}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: { xs: 1, sm: 0 } }}>
                      Jamel EliYah Live
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Main Channel Streaming
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        bgcolor: '#ff0000',
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
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          bgcolor: 'white',
                          borderRadius: '50%',
                          animation: 'pulse 2s infinite',
                        }}
                      />
                      Live
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      👁️ 1.2K viewers
                    </Typography>
                  </Box>
                </Stack>
              </Box>

              <Box sx={{ aspectRatio: '16/9', flexGrow: 1, position: 'relative', bgcolor: '#000' }}>
                <Box id="twitch-player" ref={twitchPlayerRef} sx={{ width: '100%', height: '100%' }} />
              </Box>
            </Box>
          </Collapse>

          <Paper
            elevation={3}
            sx={{
              borderRadius: 3,
              border: 1,
              borderColor: 'divider',
              p: { xs: 2, sm: 3 },
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {libraryOpen ? 'Content Library' : 'Browse Content'}
              </Typography>
              <Button
                variant="contained"
                size="small"
                onClick={libraryOpen ? handleToggleLibrary : handleToggleVideo}
              >
                {videoOpen ? 'Browse' : 'Watch Live'}
              </Button>
            </Stack>

            <Typography variant="body2" color="text.secondary">
              Explore the full content library or return to the live stream.
            </Typography>

            <Collapse in={libraryOpen} unmountOnExit>
              <Box
                sx={{
                  mt: 2,
                  overflowY: 'auto',
                  maxHeight: 'calc(100vh - 200px)',
                  pr: 1,
                }}
              >
                <ContentLibraryView showHero={false} />
              </Box>
            </Collapse>
          </Paper>
        </Box>

        <Box
          sx={{
            position: { md: 'sticky' },
            top: { md: 32 },
            alignSelf: { md: 'start' },
            maxHeight: { md: 'calc(100vh - 96px)' },
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              bgcolor: 'background.paper',
              borderRadius: 3,
              border: 1,
              borderColor: 'divider',
              overflow: 'hidden',
              flexGrow: 1,
            }}
          >
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Live Chat
              </Typography>
              <Typography variant="caption" color="text.secondary">
                1,247 viewers
              </Typography>
            </Box>

            <Box sx={{ flexGrow: 1, position: 'relative', minHeight: { xs: 420, md: 840 } }}>
              <iframe
                src="https://www.twitch.tv/embed/jameleliyah/chat?darkpopout&parent=ventures.isharehow.app"
                height="100%"
                width="100%"
                frameBorder="0"
                scrolling="no"
                style={{
                  border: 'none',
                  borderRadius: 0,
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
              />
            </Box>
          </Box>
        </Box>
      </Box>

      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          Featured Streams
        </Typography>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          {twitchStreams.map((stream) => (
            <Box
              key={stream.id}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.paper',
                borderRadius: 3,
                border: 1,
                borderColor: 'divider',
                overflow: 'hidden',
              }}
            >
              <Box
                component="img"
                src={stream.thumbnail}
                alt={stream.title}
                sx={{ width: '100%', height: 180, objectFit: 'cover' }}
              />
              <Box sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {stream.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stream.stats.status}
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  {stream.subtitle}
                </Typography>
                <Typography variant="body2">{stream.description}</Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', mt: 1 }}>
                  {stream.tags.map((tag) => (
                    <Box
                      key={tag}
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 2,
                        bgcolor: 'background.default',
                        fontSize: '0.75rem',
                        color: 'text.secondary',
                      }}
                    >
                      #{tag}
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </AppShell>
  );
}

export default App;