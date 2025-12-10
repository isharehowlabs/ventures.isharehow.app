'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Stack,
  TextField,
  IconButton,
  Link,
  Chip,
  Avatar,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  TrendingUp as TrendingUpIcon,
  Search as SearchIcon,
  Speed as SpeedIcon,
  Analytics as AnalyticsIcon,
  RocketLaunch as RocketLaunchIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
  Email as EmailIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function AIHelpPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [email, setEmail] = useState('');

  const handleGetStarted = () => {
    router.push('/demo');
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription
    console.log('Subscribe:', email);
    setEmail('');
  };

  const features = [
    {
      icon: <AutoAwesomeIcon sx={{ fontSize: 40 }} />,
      title: 'AI-Powered Assistance',
      description: 'Get instant help with AI that understands your business needs and provides intelligent solutions.',
    },
    {
      icon: <SearchIcon sx={{ fontSize: 40 }} />,
      title: 'SEO Optimization',
      description: 'Boost your search rankings with advanced SEO tools and real-time optimization recommendations.',
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40 }} />,
      title: 'Performance Analytics',
      description: 'Track your website performance and get actionable insights to improve your online presence.',
    },
    {
      icon: <RocketLaunchIcon sx={{ fontSize: 40 }} />,
      title: 'Growth Acceleration',
      description: 'Accelerate your business growth with data-driven strategies and automated optimization.',
    },
  ];

  const benefits = [
    'Increase organic traffic by up to 300%',
    'Get AI-powered content recommendations',
    'Real-time SEO monitoring and alerts',
    'Automated keyword research and optimization',
    'Competitor analysis and insights',
    'Custom AI training for your industry',
  ];

  return (
    <>
      <Head>
        <title>AI Help & SEO Booster | iShareHow Ventures</title>
        <meta name="description" content="Boost your online presence with AI-powered assistance and advanced SEO optimization tools. Get started for free today." />
      </Head>

      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Navigation */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'background.paper',
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Container maxWidth="xl">
            <Toolbar sx={{ justifyContent: 'space-between', py: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  onClick={() => setMobileMenuOpen(true)}
                  sx={{ display: { md: 'none' } }}
                >
                  <MenuIcon />
                </IconButton>
                <Link
                  href="/"
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    textDecoration: 'none',
                    color: 'primary.main',
                    fontWeight: 700,
                    fontSize: '1.25rem',
                  }}
                >
                  iShareHow Ventures
                </Link>
              </Box>

              <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, alignItems: 'center' }}>
                <Link href="/creative" sx={{ textDecoration: 'none', color: 'text.primary', fontWeight: 500 }}>
                  Dashboard
                </Link>
                <Link href="/products" sx={{ textDecoration: 'none', color: 'text.primary', fontWeight: 500 }}>
                  Products
                </Link>
                <Link href="/blog" sx={{ textDecoration: 'none', color: 'text.primary', fontWeight: 500 }}>
                  Blog
                </Link>
                <Button variant="outlined" onClick={handleGetStarted} sx={{ mr: 1 }}>
                  Try Free
                </Button>
                <Button variant="contained" onClick={handleGetStarted}>
                  Get Started
                </Button>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>

        {/* Mobile Menu */}
        <Drawer
          anchor="left"
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        >
          <Box sx={{ width: 250, p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={700} color="primary.main">
                iShareHow Ventures
              </Typography>
              <IconButton onClick={() => setMobileMenuOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <List>
              <ListItem disablePadding>
                <ListItemButton onClick={() => { router.push('/creative'); setMobileMenuOpen(false); }}>
                  <ListItemText primary="Dashboard" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => { router.push('/products'); setMobileMenuOpen(false); }}>
                  <ListItemText primary="Products" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => { router.push('/blog'); setMobileMenuOpen(false); }}>
                  <ListItemText primary="Blog" />
                </ListItemButton>
              </ListItem>
            </List>
            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Button variant="outlined" fullWidth onClick={handleGetStarted}>
                Try Free
              </Button>
              <Button variant="contained" fullWidth onClick={handleGetStarted}>
                Get Started
              </Button>
            </Box>
          </Box>
        </Drawer>

        {/* Hero Section */}
        <Box
          sx={{
            position: 'relative',
            pt: { xs: 8, md: 12 },
            pb: { xs: 8, md: 12 },
            background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.secondary.main}15 100%)`,
            overflow: 'hidden',
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={6}>
                <Chip
                  label="New: Enhanced AI Features"
                  color="primary"
                  sx={{ mb: 2 }}
                  icon={<AutoAwesomeIcon />}
                />
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                    fontWeight: 700,
                    mb: 3,
                    lineHeight: 1.2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  AI Help ❖ SEO Booster for Smarter Growth
                </Typography>
                <Typography
                  variant="h6"
                  color="text.secondary"
                  sx={{ mb: 4, fontSize: { xs: '1rem', md: '1.25rem' }, lineHeight: 1.6 }}
                >
                  Navigate effortlessly with AI-powered assistance, comprehensive SEO optimization, and automated growth strategies.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleGetStarted}
                    endIcon={<ArrowForwardIcon />}
                    sx={{ px: 4, py: 1.5 }}
                  >
                    Get Started - It's Free Now
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => router.push('/demo')}
                    sx={{ px: 4, py: 1.5 }}
                  >
                    Book a Demo
                  </Button>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    position: 'relative',
                    height: { xs: 300, md: 500 },
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      height: '100%',
                      bgcolor: 'primary.main',
                      borderRadius: 4,
                      opacity: 0.1,
                      position: 'absolute',
                      transform: 'rotate(-5deg)',
                    }}
                  />
                  <Box
                    sx={{
                      width: '90%',
                      height: '90%',
                      bgcolor: 'secondary.main',
                      borderRadius: 4,
                      opacity: 0.1,
                      position: 'absolute',
                      transform: 'rotate(5deg)',
                    }}
                  />
                  <AutoAwesomeIcon
                    sx={{
                      fontSize: { xs: 200, md: 300 },
                      color: 'primary.main',
                      opacity: 0.3,
                      position: 'relative',
                      zIndex: 1,
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Companies Section */}
        <Box sx={{ py: 4, bgcolor: 'background.paper' }}>
          <Container maxWidth="lg">
            <Typography
              variant="h6"
              color="text.secondary"
              textAlign="center"
              sx={{ mb: 3 }}
            >
              4,000+ companies already growing
            </Typography>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 4,
                flexWrap: 'wrap',
                opacity: 0.6,
              }}
            >
              {['Company 1', 'Company 2', 'Company 3', 'Company 4', 'Company 5'].map((company, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  fontWeight={600}
                  color="text.secondary"
                >
                  {company}
                </Typography>
              ))}
            </Box>
          </Container>
        </Box>

        {/* Features Section */}
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.default' }}>
          <Container maxWidth="lg">
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Typography
                variant="h2"
                sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 700, mb: 2 }}
              >
                Made to fit your workflow
              </Typography>
              <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                Seamlessly integrate AI assistance, optimize SEO performance, and automate your growth strategies.
              </Typography>
            </Box>

            <Grid container spacing={4}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card
                    sx={{
                      height: '100%',
                      p: 3,
                      textAlign: 'center',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: 6,
                      },
                    }}
                  >
                    <CardContent>
                      <Avatar
                        sx={{
                          width: 80,
                          height: 80,
                          mx: 'auto',
                          mb: 2,
                          bgcolor: 'primary.main',
                          color: 'white',
                        }}
                      >
                        {feature.icon}
                      </Avatar>
                      <Typography variant="h5" fontWeight={600} gutterBottom>
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
          </Container>
        </Box>

        {/* CTA Section */}
        <Box
          sx={{
            py: { xs: 8, md: 12 },
            bgcolor: 'primary.main',
            color: 'white',
            textAlign: 'center',
          }}
        >
          <Container maxWidth="md">
            <Typography
              variant="h2"
              sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 700, mb: 3 }}
            >
              Maximize efficiency and productivity with our comprehensive AI & SEO solution
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleGetStarted}
              endIcon={<ArrowForwardIcon />}
              sx={{
                bgcolor: 'white',
                color: 'primary.main',
                px: 4,
                py: 1.5,
                '&:hover': {
                  bgcolor: 'grey.100',
                },
              }}
            >
              Get Started - It's Free Now
            </Button>
          </Container>
        </Box>

        {/* Benefits Section */}
        <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.default' }}>
          <Container maxWidth="lg">
            <Grid container spacing={6} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography
                  variant="h2"
                  sx={{ fontSize: { xs: '2rem', md: '3rem' }, fontWeight: 700, mb: 3 }}
                >
                  Empowering businesses to succeed
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
                  Learn how our AI platform and SEO tools empower businesses of all sizes to achieve their goals and reach new heights.
                </Typography>
                <Stack spacing={2}>
                  {benefits.map((benefit, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CheckCircleIcon color="primary" />
                      <Typography variant="body1">{benefit}</Typography>
                    </Box>
                  ))}
                </Stack>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleGetStarted}
                  sx={{ mt: 4, px: 4, py: 1.5 }}
                  endIcon={<ArrowForwardIcon />}
                >
                  Get Started Today
                </Button>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box
                  sx={{
                    height: 400,
                    bgcolor: 'primary.main',
                    borderRadius: 4,
                    opacity: 0.1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AnalyticsIcon sx={{ fontSize: 200, color: 'primary.main', opacity: 0.3 }} />
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>

        {/* Footer */}
        <Box sx={{ bgcolor: 'background.paper', borderTop: `1px solid ${theme.palette.divider}` }}>
          <Container maxWidth="lg" sx={{ py: 8 }}>
            {/* Newsletter Section */}
            <Box
              sx={{
                bgcolor: 'primary.main',
                borderRadius: 4,
                p: 4,
                mb: 6,
                color: 'white',
                textAlign: 'center',
              }}
            >
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Join our newsletter
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                Discover the features that will transform your business growth.
              </Typography>
              <Box
                component="form"
                onSubmit={handleSubscribe}
                sx={{ display: 'flex', gap: 2, maxWidth: 500, mx: 'auto' }}
              >
                <TextField
                  fullWidth
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  sx={{
                    bgcolor: 'white',
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: 'transparent',
                      },
                    },
                  }}
                />
                <IconButton
                  type="submit"
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    '&:hover': {
                      bgcolor: 'grey.100',
                    },
                  }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </Box>

            {/* Footer Links */}
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  iShareHow Ventures
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Empower your business with our comprehensive AI and SEO platform for seamless growth management.
                </Typography>
              </Grid>
              <Grid item xs={12} md={2}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Resources
                </Typography>
                <Stack spacing={1}>
                  <Link href="/blog" sx={{ textDecoration: 'none', color: 'text.secondary', fontSize: '0.875rem' }}>
                    Blog
                  </Link>
                  <Link href="/products" sx={{ textDecoration: 'none', color: 'text.secondary', fontSize: '0.875rem' }}>
                    Products
                  </Link>
                  <Link href="/demo" sx={{ textDecoration: 'none', color: 'text.secondary', fontSize: '0.875rem' }}>
                    Demo
                  </Link>
                </Stack>
              </Grid>
              <Grid item xs={12} md={2}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Support
                </Typography>
                <Stack spacing={1}>
                  <Link href="/creative" sx={{ textDecoration: 'none', color: 'text.secondary', fontSize: '0.875rem' }}>
                    Dashboard
                  </Link>
                  <Link href="/settings" sx={{ textDecoration: 'none', color: 'text.secondary', fontSize: '0.875rem' }}>
                    Settings
                  </Link>
                </Stack>
              </Grid>
              <Grid item xs={12} md={2}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Company
                </Typography>
                <Stack spacing={1}>
                  <Link href="/" sx={{ textDecoration: 'none', color: 'text.secondary', fontSize: '0.875rem' }}>
                    About
                  </Link>
                  <Link href="/privacy" sx={{ textDecoration: 'none', color: 'text.secondary', fontSize: '0.875rem' }}>
                    Privacy Policy
                  </Link>
                  <Link href="/terms" sx={{ textDecoration: 'none', color: 'text.secondary', fontSize: '0.875rem' }}>
                    Terms & Conditions
                  </Link>
                </Stack>
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Copyright © {new Date().getFullYear()} iShareHow Ventures. All rights reserved.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Link href="/privacy" sx={{ textDecoration: 'none', color: 'text.secondary', fontSize: '0.875rem' }}>
                  Privacy Policy
                </Link>
                <Divider orientation="vertical" flexItem />
                <Link href="/terms" sx={{ textDecoration: 'none', color: 'text.secondary', fontSize: '0.875rem' }}>
                  Terms & Conditions
                </Link>
              </Box>
            </Box>
          </Container>
        </Box>
      </Box>
    </>
  );
}

