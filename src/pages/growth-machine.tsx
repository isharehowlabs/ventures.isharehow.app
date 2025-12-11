'use client';

import Head from 'next/head';
import Link from 'next/link';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Divider,
  Chip,
  Paper,
  Avatar,
  useTheme,
  alpha,
  Fade,
  Grow,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  Groups as GroupsIcon,
  Dashboard as DashboardIcon,
  VideoLibrary as VideoLibraryIcon,
  Description as DescriptionIcon,
  LiveTv as LiveTvIcon,
  Lock as LockIcon,
  AutoAwesome as AutoAwesomeIcon,
  SelfImprovement as SelfImprovementIcon,
  Psychology as PsychologyIcon,
  TrendingUp as TrendingUpIcon,
  Spa as SpaIcon,
  Lightbulb as LightbulbIcon,
  Favorite as FavoriteIcon,
} from '@mui/icons-material';

import { useDarkMode } from '../hooks/useDarkMode';

export default function GrowthMachinePage() {
  const theme = useTheme();
  const isDark = useDarkMode();

  const joinCoOperation = () => {
    window.open('https://shop.isharehow.app/products/ebook3?utm_source=copyToPasteBoard&utm_medium=product-links&utm_content=web', '_blank');
  };

  const journeySteps = [
    {
      icon: <SelfImprovementIcon sx={{ fontSize: 48 }} />,
      title: 'Awareness',
      description: 'Begin your journey with deep self-awareness and conscious reflection.',
      color: '#6366f1',
    },
    {
      icon: <PsychologyIcon sx={{ fontSize: 48 }} />,
      title: 'Transformation',
      description: 'Transform your mindset and unlock your true potential through guided practices.',
      color: '#8b5cf6',
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 48 }} />,
      title: 'Growth',
      description: 'Experience continuous growth as you apply wisdom and build powerful systems.',
      color: '#10b981',
    },
    {
      icon: <SpaIcon sx={{ fontSize: 48 }} />,
      title: 'Mastery',
      description: 'Achieve mastery and become a sovereign creator in your domain.',
      color: '#f59e0b',
    },
  ];

  return (
    <>
      <Head>
        <title>iShareHow CoOperation: Own Your Consciousness, Shape Your Rise | iShareHow Labs</title>
        <meta
          name="description"
          content="Join the iShareHow CoOperation and be part of a movement dedicated to living, creating, and thinking with profound awareness. Transform from consumer to creator, from follower to sovereign."
        />
      </Head>

      <Box sx={{ bgcolor: 'background.default', color: 'text.primary', minHeight: '100vh', position: 'relative' }}>
        {/* Background Decorative Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '100%',
            background: isDark
              ? `radial-gradient(circle at 20% 50%, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 50%),
                 radial-gradient(circle at 80% 80%, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 50%)`
              : `radial-gradient(circle at 20% 50%, ${alpha(theme.palette.primary.main, 0.05)} 0%, transparent 50%),
                 radial-gradient(circle at 80% 80%, ${alpha(theme.palette.secondary.main, 0.05)} 0%, transparent 50%)`,
            zIndex: 0,
            pointerEvents: 'none',
          }}
        />

        {/* Navigation */}
        <Box
          component="nav"
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            backdropFilter: 'blur(20px)',
            bgcolor: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Container maxWidth="lg">
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 2.5 }}>
              <Link href="/" style={{ textDecoration: 'none' }}>
                <Typography variant="h5" fontWeight={700} color="primary.main">
                  iShareHow Labs
                </Typography>
              </Link>
              <Link href="/" style={{ textDecoration: 'none' }}>
                <Button variant="outlined" color="primary">
                  Back to Home
                </Button>
              </Link>
            </Stack>
          </Container>
        </Box>

        <Box sx={{ position: 'relative', zIndex: 1 }}>
          {/* Hero Section with Image */}
          <Box
            sx={{
              position: 'relative',
              minHeight: { xs: '60vh', md: '70vh' },
              display: 'flex',
              alignItems: 'center',
              overflow: 'hidden',
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.secondary.main, 0.2)} 100%)`,
            }}
          >
            {/* Hero Image Placeholder with Spiritual Theme */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                opacity: 0.1,
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: '400px',
                  height: '400px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.3)} 0%, transparent 70%)`,
                  filter: 'blur(60px)',
                },
              }}
            />
            
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, py: { xs: 8, md: 12 } }}>
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Fade in timeout={1000}>
                    <Box>
                      <Chip
                        label="✨ Begin Your Journey"
                        color="primary"
                        sx={{
                          mb: 3,
                          fontWeight: 700,
                          fontSize: '0.9rem',
                          py: 2.5,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                          color: 'white',
                        }}
                      />
                      <Typography
                        variant="h2"
                        fontWeight={800}
                        gutterBottom
                        sx={{
                          fontSize: { xs: '2rem', md: '3.5rem' },
                          mb: 3,
                          lineHeight: 1.2,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                          backgroundClip: 'text',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                        }}
                      >
                        Rise Journey Made Simple
                      </Typography>
                      <Typography
                        variant="h5"
                        sx={{
                          color: 'text.secondary',
                          mb: 4,
                          fontSize: { xs: '1.1rem', md: '1.5rem' },
                          lineHeight: 1.7,
                          fontWeight: 300,
                        }}
                      >
                        Transform from consumer to creator. From follower to sovereign. 
                        Join a conscious collective rising together.
                      </Typography>
                      <Stack direction="row" spacing={2} flexWrap="wrap">
                        <Button
                          variant="contained"
                          size="large"
                          onClick={joinCoOperation}
                          endIcon={<ArrowForwardIcon />}
                          sx={{
                            py: 2,
                            px: 4,
                            fontSize: '1.1rem',
                            fontWeight: 700,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: 8,
                            },
                            transition: 'all 0.3s',
                          }}
                        >
                          Start Your Journey
                        </Button>
                        <Button
                          variant="outlined"
                          size="large"
                          href="/rise"
                          sx={{
                            py: 2,
                            px: 4,
                            fontSize: '1.1rem',
                            borderWidth: 2,
                            '&:hover': {
                              borderWidth: 2,
                              transform: 'translateY(-2px)',
                            },
                            transition: 'all 0.3s',
                          }}
                        >
                          Explore Rise Dashboard
                        </Button>
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                        ✨ 1-Week Free Trial | No Commitment | Transform Your Consciousness
                      </Typography>
                    </Box>
                  </Fade>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Grow in timeout={1500}>
                    <Paper
                      elevation={12}
                      sx={{
                        p: 0,
                        borderRadius: 4,
                        overflow: 'hidden',
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.secondary.main, 0.2)} 100%)`,
                          zIndex: 1,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: '100%',
                          height: { xs: 300, md: 500 },
                          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          zIndex: 2,
                        }}
                      >
                        <Box sx={{ textAlign: 'center', color: 'white' }}>
                          <SelfImprovementIcon sx={{ fontSize: 120, mb: 2, opacity: 0.9 }} />
                          <Typography variant="h6" sx={{ opacity: 0.9 }}>
                            Your Journey Begins Here
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grow>
                </Grid>
              </Grid>
            </Container>
          </Box>

          <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
            {/* Journey Steps */}
            <Box sx={{ mb: 10, textAlign: 'center' }}>
              <Typography variant="h3" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                Your Transformation Journey
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}>
                A conscious path from awareness to mastery
              </Typography>
              <Grid container spacing={4}>
                {journeySteps.map((step, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Grow in timeout={1000 + index * 200}>
                      <Card
                        elevation={4}
                        sx={{
                          height: '100%',
                          textAlign: 'center',
                          p: 4,
                          borderRadius: 3,
                          background: `linear-gradient(135deg, ${alpha(step.color, 0.1)} 0%, ${alpha(step.color, 0.05)} 100%)`,
                          border: `2px solid ${alpha(step.color, 0.2)}`,
                          transition: 'all 0.3s',
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: 12,
                            borderColor: step.color,
                          },
                        }}
                      >
                        <Box
                          sx={{
                            color: step.color,
                            mb: 3,
                            display: 'flex',
                            justifyContent: 'center',
                          }}
                        >
                          {step.icon}
                        </Box>
                        <Typography variant="h5" fontWeight={700} gutterBottom>
                          {step.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                          {step.description}
                        </Typography>
                      </Card>
                    </Grow>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* What You'll Experience */}
            <Paper
              elevation={6}
              sx={{
                p: { xs: 4, md: 6 },
                mb: 8,
                borderRadius: 4,
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
              }}
            >
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    Beyond Motivation—Complete Transformation
                  </Typography>
                  <Divider sx={{ my: 3, width: 60, height: 4, bgcolor: 'primary.main', borderRadius: 2 }} />
                  <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
                    Every lesson, ritual, and conversation is meticulously designed to elevate you from a consumer to a creator, 
                    from a follower to a sovereign, and from a solitary individual to a powerful collective.
                  </Typography>
                  <Stack spacing={2} sx={{ mt: 4 }}>
                    {[
                      'Master your mind and build robust systems of power',
                      'Consciously shape culture through your creations',
                      'Join a community that rises together',
                      'Access exclusive workshops and live sessions',
                    ].map((item, index) => (
                      <Stack key={index} direction="row" spacing={2} alignItems="flex-start">
                        <CheckCircleIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                          {item}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={8}
                    sx={{
                      p: 0,
                      borderRadius: 3,
                      overflow: 'hidden',
                      height: '100%',
                      minHeight: 400,
                    }}
                  >
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.secondary.main, 0.2)} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 4,
                      }}
                    >
                      <Box sx={{ textAlign: 'center' }}>
                        <LightbulbIcon sx={{ fontSize: 100, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h5" fontWeight={600} gutterBottom>
                          Conscious Creation
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Building the future with awareness
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>

            {/* Builder Tier Details */}
            <Box sx={{ mb: 8 }}>
              <Typography variant="h3" fontWeight={700} gutterBottom sx={{ mb: 2, textAlign: 'center' }}>
                The Builder Tier
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 6, textAlign: 'center', maxWidth: 700, mx: 'auto' }}>
                Step into the community that journeys consciously and rises together. 
                Come create the future with us.
              </Typography>

              <Grid container spacing={4}>
                {/* Exclusive Access */}
                <Grid item xs={12} md={4}>
                  <Card
                    elevation={4}
                    sx={{
                      height: '100%',
                      p: 4,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 100%)`,
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 8,
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        <LockIcon />
                      </Avatar>
                      <Typography variant="h5" fontWeight={700}>
                        Exclusive Access
                      </Typography>
                    </Box>
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={2} alignItems="flex-start">
                        <CheckCircleIcon sx={{ color: 'primary.main', mt: 0.5, fontSize: 20 }} />
                        <Typography variant="body1" color="text.secondary">
                          iShareHow Dashboard private digital community
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={2} alignItems="flex-start">
                        <CheckCircleIcon sx={{ color: 'primary.main', mt: 0.5, fontSize: 20 }} />
                        <Typography variant="body1" color="text.secondary">
                          Private Builder group for deep collaboration
                        </Typography>
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>

                {/* Direct Engagement */}
                <Grid item xs={12} md={4}>
                  <Card
                    elevation={4}
                    sx={{
                      height: '100%',
                      p: 4,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)} 0%, transparent 100%)`,
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 8,
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                        <GroupsIcon />
                      </Avatar>
                      <Typography variant="h5" fontWeight={700}>
                        Direct Engagement
                      </Typography>
                    </Box>
                    <Stack spacing={2}>
                      <Stack direction="row" spacing={2} alignItems="flex-start">
                        <CheckCircleIcon sx={{ color: 'secondary.main', mt: 0.5, fontSize: 20 }} />
                        <Typography variant="body1" color="text.secondary">
                          Weekly live Builder Session with the Co-Work Collective
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={2} alignItems="flex-start">
                        <CheckCircleIcon sx={{ color: 'secondary.main', mt: 0.5, fontSize: 20 }} />
                        <Typography variant="body1" color="text.secondary">
                          Exclusive PDFs, notes, frameworks and dashboards
                        </Typography>
                      </Stack>
                    </Stack>
                  </Card>
                </Grid>

                {/* Content & Extras */}
                <Grid item xs={12} md={4}>
                  <Card
                    elevation={4}
                    sx={{
                      height: '100%',
                      p: 4,
                      borderRadius: 3,
                      background: `linear-gradient(135deg, ${alpha('#10b981', 0.1)} 0%, transparent 100%)`,
                      transition: 'all 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 8,
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Avatar sx={{ bgcolor: '#10b981', mr: 2 }}>
                        <VideoLibraryIcon />
                      </Avatar>
                      <Typography variant="h5" fontWeight={700}>
                        Content & Extras
                      </Typography>
                    </Box>
                    <Stack spacing={2}>
                      {[
                        'Unlock The iShareHow Ventures',
                        'Behind-the-scenes content',
                        'Exclusive content',
                        'Livestreams',
                      ].map((item, index) => (
                        <Stack key={index} direction="row" spacing={2} alignItems="flex-start">
                          <CheckCircleIcon sx={{ color: '#10b981', mt: 0.5, fontSize: 20 }} />
                          <Typography variant="body1" color="text.secondary">
                            {item}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Card>
                </Grid>
              </Grid>
            </Box>

            {/* Final CTA */}
            <Paper
              elevation={12}
              sx={{
                p: { xs: 6, md: 10 },
                borderRadius: 4,
                textAlign: 'center',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '200%',
                  height: '200%',
                  background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.1)} 0%, transparent 70%)`,
                  animation: 'pulse 4s ease-in-out infinite',
                },
                '@keyframes pulse': {
                  '0%, 100%': { transform: 'scale(1)', opacity: 0.5 },
                  '50%': { transform: 'scale(1.1)', opacity: 0.8 },
                },
              }}
            >
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <FavoriteIcon sx={{ fontSize: 60, color: 'primary.main', mb: 3 }} />
                <Typography variant="h3" fontWeight={700} gutterBottom>
                  Ready to Own Your Consciousness?
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto', lineHeight: 1.7 }}>
                  Join the iShareHow CoOperation today and start your transformation journey. 
                  Experience the power of conscious creation, collective wisdom, and sovereign thinking.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={joinCoOperation}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    py: 2.5,
                    px: 6,
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    mb: 2,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: 12,
                    },
                    transition: 'all 0.3s',
                  }}
                >
                  Start Your 1-Week Free Trial
                </Button>
                <Typography variant="body2" color="text.secondary">
                  No upfront commitment | Cancel anytime | Join the movement
                </Typography>
              </Box>
            </Paper>
          </Container>

          {/* Footer */}
          <Box
            component="footer"
            sx={{
              textAlign: 'center',
              py: 6,
              borderTop: `1px solid ${theme.palette.divider}`,
              mt: 8,
            }}
          >
            <Container maxWidth="lg">
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                © 2025 iShareHow Labs LLC | Helping Agencies Build Community-Driven Growth
              </Typography>
              <Stack direction="row" spacing={2} justifyContent="center">
                <Link href="/privacy" style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>
                  Privacy
                </Link>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  |
                </Typography>
                <Link href="/terms" style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>
                  Terms
                </Link>
              </Stack>
            </Container>
          </Box>
        </Box>
      </Box>
    </>
  );
}
