'use client';

import React, { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Grid,
  Stack,
  Card,
  CardContent,
  Chip,
  Divider,
  useTheme,
  alpha,
  IconButton,
} from '@mui/material';
import {
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
  CheckCircle as CheckCircleIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  People as PeopleIcon,
  Analytics as AnalyticsIcon,
  Support as SupportIcon,
  CloudQueue as CloudIcon,
  Shield as ShieldIcon,
  ArrowForward as ArrowForwardIcon,
  Business as BusinessIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import AppShell from '../components/AppShell';

const enterpriseFeatures = [
  {
    icon: <SecurityIcon sx={{ fontSize: 48 }} />,
    title: 'Enterprise Security',
    description: 'Bank-level encryption, SOC 2 compliance, and dedicated security teams to protect your data.',
  },
  {
    icon: <SpeedIcon sx={{ fontSize: 48 }} />,
    title: 'Dedicated Infrastructure',
    description: 'Custom infrastructure designed for scale with 99.9% uptime SLA and dedicated resources.',
  },
  {
    icon: <PeopleIcon sx={{ fontSize: 48 }} />,
    title: 'Dedicated Team',
    description: 'Your own account manager and dedicated support team available 24/7 for your enterprise needs.',
  },
  {
    icon: <AnalyticsIcon sx={{ fontSize: 48 }} />,
    title: 'Advanced Analytics',
    description: 'Custom dashboards, advanced reporting, and data insights tailored to your business needs.',
  },
  {
    icon: <SupportIcon sx={{ fontSize: 48 }} />,
    title: 'Priority Support',
    description: '24/7 priority support with guaranteed response times and dedicated support channels.',
  },
  {
    icon: <CloudIcon sx={{ fontSize: 48 }} />,
    title: 'Custom Integrations',
    description: 'Seamless integration with your existing tools and custom solutions built for your workflow.',
  },
];

const benefits = [
  'Unlimited requests and revisions',
  'Same-day turnaround on critical projects',
  'Dedicated project management team',
  'Custom integrations and API access',
  'White-label options available',
  'Advanced security and compliance',
  'SLA guarantees and uptime commitments',
  'Custom contract terms and pricing',
  'Quarterly business reviews',
  'Training and onboarding for your team',
];

export default function EnterprisePage() {
  const theme = useTheme();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    // Auto-play video on mount
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.log('Video autoplay prevented:', err);
      });
    }
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <>
      <Head>
        <title>Enterprise Solutions - iShareHow Labs | Custom Enterprise Services</title>
        <meta
          name="description"
          content="Enterprise-grade solutions for large organizations. Dedicated teams, custom integrations, advanced security, and 24/7 support. Transform your business with iShareHow Labs."
        />
        <meta property="og:title" content="Enterprise Solutions - iShareHow Labs" />
        <meta property="og:description" content="Enterprise-grade solutions with dedicated teams and custom integrations." />
      </Head>

      <AppShell active={undefined}>
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
          {/* Video Hero Section */}
          <Box
            sx={{
              position: 'relative',
              width: '100%',
              height: { xs: '50vh', md: '70vh', lg: '80vh' },
              overflow: 'hidden',
              bgcolor: 'black',
            }}
          >
            {/* Video Element */}
            <Box
              component="video"
              ref={videoRef}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            >
              {/* You can replace this with your actual video URL */}
              <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </Box>

            {/* Overlay with gradient */}
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(to bottom, ${alpha('#000', 0.3)} 0%, ${alpha('#000', 0.7)} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
                <Box sx={{ textAlign: 'center', color: 'white' }}>
                  <Chip
                    label="Enterprise Solutions"
                    sx={{
                      mb: 3,
                      bgcolor: alpha(theme.palette.primary.main, 0.9),
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                      py: 2.5,
                    }}
                  />
                  <Typography
                    variant="h1"
                    fontWeight={800}
                    gutterBottom
                    sx={{
                      fontSize: { xs: '2.5rem', md: '4rem', lg: '5rem' },
                      mb: 3,
                      lineHeight: 1.1,
                    }}
                  >
                    Enterprise-Grade Solutions
                    <br />
                    Built for Scale
                  </Typography>
                  <Typography
                    variant="h5"
                    sx={{
                      mb: 4,
                      maxWidth: 700,
                      mx: 'auto',
                      opacity: 0.95,
                      fontWeight: 300,
                      lineHeight: 1.6,
                    }}
                  >
                    Transform your organization with dedicated teams, custom integrations, 
                    and enterprise-level support designed for your unique needs.
                  </Typography>
                  <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
                    <Button
                      variant="contained"
                      size="large"
                      href="/demo?tier=enterprise"
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        py: 2,
                        px: 5,
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        bgcolor: theme.palette.primary.main,
                        '&:hover': {
                          bgcolor: theme.palette.primary.dark,
                          transform: 'translateY(-2px)',
                        },
                        transition: 'all 0.3s',
                      }}
                    >
                      Contact Sales
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      href="/products"
                      sx={{
                        py: 2,
                        px: 5,
                        fontSize: '1.1rem',
                        borderWidth: 2,
                        borderColor: 'white',
                        color: 'white',
                        '&:hover': {
                          borderWidth: 2,
                          borderColor: 'white',
                          bgcolor: alpha('#fff', 0.1),
                        },
                      }}
                    >
                      View Solutions
                    </Button>
                  </Stack>
                </Box>
              </Container>
            </Box>

            {/* Video Controls */}
            <Box
              sx={{
                position: 'absolute',
                bottom: 20,
                right: 20,
                display: 'flex',
                gap: 1,
                zIndex: 3,
              }}
            >
              <IconButton
                onClick={togglePlay}
                sx={{
                  bgcolor: alpha('#000', 0.7),
                  color: 'white',
                  '&:hover': { bgcolor: alpha('#000', 0.9) },
                }}
              >
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </IconButton>
              <IconButton
                onClick={toggleMute}
                sx={{
                  bgcolor: alpha('#000', 0.7),
                  color: 'white',
                  '&:hover': { bgcolor: alpha('#000', 0.9) },
                }}
              >
                {isMuted ? <VolumeOffIcon /> : <VolumeUpIcon />}
              </IconButton>
            </Box>
          </Box>

          <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
            {/* Why Enterprise Section */}
            <Box sx={{ mb: 10, textAlign: 'center' }}>
              <Typography variant="h3" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                Why Choose Enterprise?
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 6, maxWidth: 700, mx: 'auto' }}>
                Built for organizations that need more than standard solutions. 
                Get dedicated resources, custom integrations, and enterprise-level support.
              </Typography>
              <Grid container spacing={4}>
                {enterpriseFeatures.map((feature, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Card
                      elevation={4}
                      sx={{
                        height: '100%',
                        p: 4,
                        textAlign: 'center',
                        borderRadius: 3,
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: 12,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          color: 'primary.main',
                          mb: 3,
                          display: 'flex',
                          justifyContent: 'center',
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Typography variant="h5" fontWeight={700} gutterBottom>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                        {feature.description}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Enterprise Benefits */}
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
                  <Typography variant="h3" fontWeight={700} gutterBottom>
                    Everything You Need
                  </Typography>
                  <Divider sx={{ my: 3, width: 60, height: 4, bgcolor: 'primary.main', borderRadius: 2 }} />
                  <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.8, fontSize: '1.1rem' }}>
                    Our Enterprise plan includes everything you need to scale your operations, 
                    from unlimited requests to dedicated support teams and custom integrations.
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 4 }}>
                    {benefits.map((benefit, index) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Stack direction="row" spacing={2} alignItems="flex-start">
                          <CheckCircleIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                            {benefit}
                          </Typography>
                        </Stack>
                      </Grid>
                    ))}
                  </Grid>
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
                        <BusinessIcon sx={{ fontSize: 100, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h5" fontWeight={600} gutterBottom>
                          Enterprise Ready
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Built for organizations that demand excellence
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Paper>

            {/* Security & Compliance */}
            <Box sx={{ mb: 8 }}>
              <Typography variant="h3" fontWeight={700} gutterBottom sx={{ mb: 2, textAlign: 'center' }}>
                Security & Compliance
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 6, textAlign: 'center', maxWidth: 700, mx: 'auto' }}>
                Your data security is our top priority. We maintain the highest standards of security and compliance.
              </Typography>
              <Grid container spacing={4}>
                {[
                  { title: 'SOC 2 Compliant', icon: <ShieldIcon /> },
                  { title: 'GDPR Ready', icon: <SecurityIcon /> },
                  { title: '99.9% Uptime SLA', icon: <CloudIcon /> },
                  { title: '24/7 Monitoring', icon: <AnalyticsIcon /> },
                ].map((item, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Card
                      elevation={3}
                      sx={{
                        p: 4,
                        textAlign: 'center',
                        borderRadius: 3,
                        height: '100%',
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 8,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          color: 'primary.main',
                          mb: 2,
                          display: 'flex',
                          justifyContent: 'center',
                          '& svg': {
                            fontSize: 48,
                          },
                        }}
                      >
                        {item.icon}
                      </Box>
                      <Typography variant="h6" fontWeight={600}>
                        {item.title}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* CTA Section */}
            <Paper
              elevation={12}
              sx={{
                p: { xs: 6, md: 10 },
                borderRadius: 4,
                textAlign: 'center',
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              }}
            >
              <AutoAwesomeIcon sx={{ fontSize: 60, color: 'primary.main', mb: 3 }} />
              <Typography variant="h3" fontWeight={700} gutterBottom>
                Ready to Scale Your Enterprise?
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 600, mx: 'auto', lineHeight: 1.7 }}>
                Let's discuss how iShareHow Labs can transform your organization with 
                enterprise-grade solutions tailored to your needs.
              </Typography>
              <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
                <Button
                  variant="contained"
                  size="large"
                  href="/demo?tier=enterprise"
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
                  Schedule a Demo
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  href="mailto:sales@isharehow.app"
                  sx={{
                    py: 2.5,
                    px: 6,
                    fontSize: '1.2rem',
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s',
                  }}
                >
                  Contact Sales Team
                </Button>
              </Stack>
            </Paper>
          </Container>
        </Box>
      </AppShell>
    </>
  );
}

