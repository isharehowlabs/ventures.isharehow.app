'use client';

import React from 'react';
import Head from 'next/head';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Avatar,
  Card,
  CardContent,
  Stack,
  Divider,
  Chip,
  Button,
  IconButton,
  useTheme,
  alpha,
} from '@mui/material';
import {
  RocketLaunch as RocketIcon,
  People as PeopleIcon,
  Lightbulb as LightbulbIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  AutoAwesome as AutoAwesomeIcon,
  CheckCircle as CheckCircleIcon,
  Email as EmailIcon,
  LinkedIn as LinkedInIcon,
  Twitter as TwitterIcon,
  GitHub as GitHubIcon,
} from '@mui/icons-material';
import AppShell from '../components/AppShell';
import { useDarkMode } from '../hooks/useDarkMode';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image?: string;
  linkedin?: string;
  twitter?: string;
  github?: string;
}

const teamMembers: TeamMember[] = [
  {
    name: 'Jamel EL EliYah',
    role: 'Founder & Director',
    bio: 'Visionary leader with 16+ years in offensive security and digital transformation. Passionate about empowering businesses through innovative technology solutions.',
    linkedin: 'https://linkedin.com',
    twitter: 'https://twitter.com',
  },
  {
    name: 'AI Creative Team',
    role: 'Creative Specialists',
    bio: 'Our talented team of designers, developers, and strategists work together to deliver exceptional creative solutions that drive business growth.',
  },
  {
    name: 'Technical Team',
    role: 'Engineering & Infrastructure',
    bio: 'Expert engineers and DevOps specialists ensuring scalable, secure, and high-performance solutions for our clients.',
  },
];

const values = [
  {
    icon: <LightbulbIcon />,
    title: 'Innovation First',
    description: 'We stay ahead of the curve, constantly exploring new technologies and methodologies to deliver cutting-edge solutions.',
  },
  {
    icon: <SecurityIcon />,
    title: 'Security & Trust',
    description: 'Security is built into everything we do. We protect your data and ensure compliance with industry standards.',
  },
  {
    icon: <PeopleIcon />,
    title: 'Client-Centric',
    description: 'Your success is our success. We work closely with you to understand your needs and deliver solutions that exceed expectations.',
  },
  {
    icon: <AutoAwesomeIcon />,
    title: 'Excellence',
    description: 'We strive for excellence in every project, maintaining high standards and delivering quality results on time.',
  },
];

const stats = [
  { label: 'Clients Served', value: '50+', icon: <PeopleIcon /> },
  { label: 'Projects Completed', value: '500+', icon: <RocketIcon /> },
  { label: 'Team Members', value: '50+', icon: <PeopleIcon /> },
  { label: 'Years Experience', value: '16+', icon: <TrendingUpIcon /> },
];

export default function AboutPage() {
  const theme = useTheme();
  const isDark = useDarkMode();

  return (
    <>
      <Head>
        <title>About Us - iShareHow Labs | Our Story, Team & Mission</title>
        <link rel="canonical" href="https://ventures.isharehow.app/about" />
        <meta
          name="description"
          content="Learn about iShareHow Labs - our mission, team, values, and commitment to transforming businesses through innovative technology and creative solutions."
        />
        <meta property="og:title" content="About Us - iShareHow Labs" />
        <meta property="og:description" content="Our story, team, and mission to empower businesses through technology." />
        <meta property="og:type" content="website" />
      </Head>

      <AppShell active={undefined}>
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
          {/* Hero Section */}
          <Box
            sx={{
              position: 'relative',
              pt: { xs: 8, md: 12 },
              pb: { xs: 6, md: 10 },
              background: isDark
                ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`
                : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
              overflow: 'hidden',
            }}
          >
            <Container maxWidth="lg">
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Chip
                    label="About iShareHow Labs"
                    color="primary"
                    sx={{ mb: 3 }}
                  />
                  <Typography
                    variant="h2"
                    fontWeight={700}
                    gutterBottom
                    sx={{
                      fontSize: { xs: '2.5rem', md: '3.5rem' },
                      lineHeight: 1.2,
                    }}
                  >
                    Transforming Businesses Through Innovation
                  </Typography>
                  <Typography
                    variant="h6"
                    color="text.secondary"
                    sx={{ mt: 2, mb: 4, lineHeight: 1.8 }}
                  >
                    We're a team of passionate technologists, designers, and strategists
                    dedicated to helping businesses unlock their full potential through
                    cutting-edge solutions and creative excellence.
                  </Typography>
                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<EmailIcon />}
                      href="/demo"
                    >
                      Get in Touch
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      href="/products"
                    >
                      Our Services
                    </Button>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper
                    elevation={8}
                    sx={{
                      p: 0,
                      borderRadius: 3,
                      overflow: 'hidden',
                      position: 'relative',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
                        zIndex: 1,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: '100%',
                        height: { xs: 300, md: 400 },
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        zIndex: 2,
                      }}
                    >
                      <RocketIcon sx={{ fontSize: 120, color: 'white', opacity: 0.9 }} />
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Container>
          </Box>

          {/* Stats Section */}
          <Container maxWidth="lg" sx={{ py: 6 }}>
            <Grid container spacing={3}>
              {stats.map((stat, index) => (
                <Grid item xs={6} md={3} key={index}>
                  <Paper
                    elevation={2}
                    sx={{
                      p: 3,
                      textAlign: 'center',
                      borderRadius: 2,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        mb: 2,
                        color: 'primary.main',
                        '& svg': {
                          fontSize: 40,
                        },
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Typography variant="h3" fontWeight={700} gutterBottom>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Container>

          {/* Our Story Section */}
          <Box sx={{ py: 8, bgcolor: 'transparent' }}>
            <Container maxWidth="lg">
              <Paper
                elevation={3}
                sx={{
                  p: { xs: 4, md: 6 },
                  borderRadius: 3,
                }}
              >
                <Grid container spacing={4}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h3" fontWeight={700} gutterBottom>
                      Our Story
                    </Typography>
                    <Divider sx={{ my: 3, width: 60, height: 4, bgcolor: 'primary.main', borderRadius: 2 }} />
                    <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                      Founded in 2024, iShareHow Labs emerged from a vision to bridge the gap between
                      complex technology and accessible business solutions. With over 16 years of experience
                      in offensive security and digital transformation, our founder recognized the need for
                      integrated services that combine managed IT infrastructure, creative excellence, and
                      strategic intelligence.
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph sx={{ lineHeight: 1.8 }}>
                      Today, we serve 100+ organizations, helping them achieve 30% efficiency gains through
                      our innovative approach to managed services and creative-as-a-service solutions. We
                      believe that every business, regardless of size, deserves access to enterprise-grade
                      technology and world-class creative services.
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                      <CheckCircleIcon color="primary" />
                      <Typography variant="body2" color="text.secondary">
                        Trusted by 100+ organizations
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={2}>
                      <CheckCircleIcon color="primary" />
                      <Typography variant="body2" color="text.secondary">
                        30% average efficiency gains
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={2}>
                      <CheckCircleIcon color="primary" />
                      <Typography variant="body2" color="text.secondary">
                        16+ years of combined experience
                      </Typography>
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper
                      elevation={4}
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
                          <LightbulbIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
                          <Typography variant="h5" fontWeight={600} gutterBottom>
                            Innovation Driven
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Building the future of business technology
                          </Typography>
                        </Box>
                      </Box>
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>
            </Container>
          </Box>

          {/* Values Section */}
          <Container maxWidth="lg" sx={{ py: 8 }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography variant="h3" fontWeight={700} gutterBottom>
                Our Values
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                The principles that guide everything we do
              </Typography>
            </Box>
            <Grid container spacing={4}>
              {values.map((value, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card
                    elevation={3}
                    sx={{
                      height: '100%',
                      p: 3,
                      textAlign: 'center',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: 8,
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        mb: 2,
                        color: 'primary.main',
                        '& svg': {
                          fontSize: 48,
                        },
                      }}
                    >
                      {value.icon}
                    </Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {value.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                      {value.description}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>

          {/* Team Section */}
          <Box sx={{ py: 8, bgcolor: 'transparent' }}>
            <Container maxWidth="lg">
              <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography variant="h3" fontWeight={700} gutterBottom>
                  Meet Our Team
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                  The talented individuals driving innovation and excellence
                </Typography>
              </Box>
              <Grid container spacing={4}>
                {teamMembers.map((member, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Card
                      elevation={4}
                      sx={{
                        height: '100%',
                        borderRadius: 3,
                        overflow: 'hidden',
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: 12,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          width: '100%',
                          height: 200,
                          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 120,
                            height: 120,
                            bgcolor: 'white',
                            color: 'primary.main',
                            fontSize: 48,
                            fontWeight: 700,
                          }}
                        >
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                      </Box>
                      <CardContent sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          {member.name}
                        </Typography>
                        <Chip
                          label={member.role}
                          size="small"
                          color="primary"
                          sx={{ mb: 2 }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 2 }}>
                          {member.bio}
                        </Typography>
                        {(member.linkedin || member.twitter || member.github) && (
                          <Stack direction="row" spacing={1}>
                            {member.linkedin && (
                              <IconButton
                                size="small"
                                href={member.linkedin}
                                target="_blank"
                                sx={{ color: 'primary.main' }}
                              >
                                <LinkedInIcon fontSize="small" />
                              </IconButton>
                            )}
                            {member.twitter && (
                              <IconButton
                                size="small"
                                href={member.twitter}
                                target="_blank"
                                sx={{ color: 'primary.main' }}
                              >
                                <TwitterIcon fontSize="small" />
                              </IconButton>
                            )}
                            {member.github && (
                              <IconButton
                                size="small"
                                href={member.github}
                                target="_blank"
                                sx={{ color: 'primary.main' }}
                              >
                                <GitHubIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Stack>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Container>
          </Box>

          {/* CTA Section */}
          <Box
            sx={{
              py: 10,
              background: isDark
                ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.secondary.main, 0.15)} 100%)`
                : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
            }}
          >
            <Container maxWidth="md">
              <Paper
                elevation={6}
                sx={{
                  p: { xs: 4, md: 6 },
                  borderRadius: 3,
                  textAlign: 'center',
                }}
              >
                <RocketIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h4" fontWeight={700} gutterBottom>
                  Ready to Transform Your Business?
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto' }}>
                  Join 100+ organizations that trust iShareHow Labs for their technology and creative needs.
                  Let's build something amazing together.
                </Typography>
                <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
                  <Button
                    variant="contained"
                    size="large"
                    href="/demo"
                    startIcon={<EmailIcon />}
                  >
                    Schedule a Demo
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    href="/products"
                  >
                    View Our Services
                  </Button>
                </Stack>
              </Paper>
            </Container>
          </Box>
        </Box>
      </AppShell>
    </>
  );
}

