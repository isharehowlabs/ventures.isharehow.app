import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Stack,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  PlayArrow as PlayArrowIcon,
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  Launch as LaunchIcon,
} from '@mui/icons-material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AppShell from '../components/AppShell';

export default function BookDemoPage() {
  const router = useRouter();

  const features = [
    {
      title: 'Co-Work Dashboard',
      description: 'Collaborative workspace for teams to manage projects and tasks together.',
      icon: <CheckCircleIcon />,
    },
    {
      title: 'RISE Dashboard',
      description: 'Wellness and personal development tracking with mentor support.',
      icon: <CheckCircleIcon />,
    },
    {
      title: 'Creative Dashboard',
      description: 'Client management and project tracking for creative professionals.',
      icon: <CheckCircleIcon />,
    },
    {
      title: 'AI-Powered Tools',
      description: 'Leverage AI agents and automation to streamline your workflow.',
      icon: <CheckCircleIcon />,
    },
  ];

  const benefits = [
    'See all features in action',
    'Get personalized recommendations',
    'Ask questions to our team',
    'No commitment required',
  ];

  return (
    <>
      <Head>
        <title>Book a Demo - iShareHow Ventures</title>
        <meta
          name="description"
          content="Schedule a demo to see how iShareHow Ventures can transform your business. Explore our dashboards and AI-powered tools."
        />
      </Head>
      <AppShell active="demo">
        <Box
          sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
            py: { xs: 4, md: 8 },
          }}
        >
          <Container maxWidth="lg">
            {/* Hero Section */}
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography
                variant="h2"
                component="h1"
                fontWeight={900}
                sx={{
                  mb: 2,
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                See iShareHow Ventures in Action
              </Typography>
              <Typography
                variant="h5"
                color="text.secondary"
                sx={{ mb: 4, maxWidth: 700, mx: 'auto' }}
              >
                Book a personalized demo to explore our dashboards, AI tools, and see how we can help transform your business.
              </Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent="center"
                sx={{ mb: 6 }}
              >
                <Button
                  variant="contained"
                  size="large"
                  href="https://demo.isharehow.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  startIcon={<PlayArrowIcon />}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    },
                  }}
                >
                  View Live Demo
                  <LaunchIcon sx={{ ml: 1, fontSize: '1rem' }} />
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => router.push('/')}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                  }}
                >
                  View Pricing
                </Button>
              </Stack>
            </Box>

            {/* Features Grid */}
            <Grid container spacing={3} sx={{ mb: 8 }}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card
                    sx={{
                      height: '100%',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4,
                      },
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box
                        sx={{
                          color: 'primary.main',
                          mb: 2,
                          fontSize: '2rem',
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            {/* Benefits Section */}
            <Paper
              elevation={4}
              sx={{
                p: { xs: 4, md: 6 },
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
              }}
            >
              <Box sx={{ textAlign: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  What You'll Get
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  A personalized walkthrough of our platform
                </Typography>
              </Box>
              <Grid container spacing={3}>
                {benefits.map((benefit, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <StarIcon sx={{ color: 'primary.main' }} />
                      <Typography variant="body1">{benefit}</Typography>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            {/* CTA Section */}
            <Box sx={{ textAlign: 'center', mt: 8 }}>
              <Typography variant="h5" fontWeight={600} gutterBottom>
                Ready to See It Live?
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Click the button below to explore our interactive demo
              </Typography>
              <Button
                variant="contained"
                size="large"
                href="https://demo.isharehow.app"
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<PlayArrowIcon />}
                endIcon={<LaunchIcon />}
                sx={{
                  px: 6,
                  py: 2,
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                  },
                }}
              >
                Launch Demo
              </Button>
            </Box>
          </Container>
        </Box>
      </AppShell>
    </>
  );
}
