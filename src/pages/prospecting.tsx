import { useState, useEffect } from 'react';
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
  useTheme,
  Paper,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  ArrowForward as ArrowForwardIcon,
  VideoLibrary as VideoIcon,
  AutoAwesome as AutoAwesomeIcon,
  RocketLaunch as RocketLaunchIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Email as EmailIcon,
  LinkedIn as LinkedInIcon,
  PlayCircle as PlayCircleIcon,
  FlashOn as FlashIcon,
  Speed as SpeedIcon,
  CompareArrows as CompareArrowsIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import BeforeAfterMockup from '../components/landing/BeforeAfterMockup';
import { Fade, Grow, Zoom } from '@mui/material';

import { useDarkMode } from '../hooks/useDarkMode';

export default function ProspectingPage() {
  const theme = useTheme();
  const isDark = useDarkMode();
  const [timeLeft, setTimeLeft] = useState({ hours: 48, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Calculate 48 hours from now
    const endTime = Date.now() + 48 * 60 * 60 * 1000;

    const updateTimer = () => {
      const now = Date.now();
      const distance = endTime - now;

      if (distance < 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (time: number) => time.toString().padStart(2, '0');
  const timerString = `${formatTime(timeLeft.hours)}:${formatTime(timeLeft.minutes)}:${formatTime(timeLeft.seconds)}`;

  const claimSpot = () => {
    // Redirect to Shopify flash sale product page
    window.location.href = 'https://shop.isharehow.app/products/flash-sale-10x-your-seo-prospecting?utm_source=copyToPasteBoard&utm_medium=product-links&utm_content=web';
  };

  return (
    <>
      <Head>
        <title>🔥 48-Hour Flash: 10X Your SEO Leads for Just $97 (Save $400!) | iShareHow Labs</title>
        <link rel="canonical" href="https://ventures.isharehow.app/prospecting" />
        <meta
          name="description"
          content="Struggling with ghosted SEO prospects? Join our live 10X SEO Prospecting Workshop—proven scripts, templates, and AI tools to land 5x more clients. Flash sale ends in 48 hours. Limited to 50 spots."
        />
        <style>{`
          @keyframes pulse {
            0%, 100% {
              transform: scale(1);
              opacity: 1;
            }
            50% {
              transform: scale(1.05);
              opacity: 0.8;
            }
          }
          @keyframes shimmer {
            0% {
              left: -100%;
            }
            100% {
              left: 100%;
            }
          }
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }
        `}</style>
      </Head>

      <Box sx={{ bgcolor: 'background.default', color: 'text.primary', minHeight: '100vh' }}>
        {/* Navigation */}
        <Box component="nav" sx={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backdropFilter: 'blur(20px)',
          bgcolor: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}>
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

        <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
          {/* Hero Section */}
          <Card
            elevation={3}
            sx={{
              mb: 6,
              background: isDark
                ? 'linear-gradient(135deg, rgba(75, 93, 189, 0.15) 0%, rgba(107, 125, 215, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(75, 93, 189, 0.08) 0%, rgba(107, 125, 215, 0.05) 100%)',
              border: `1px solid ${theme.palette.primary.main}40`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Animated Background Elements */}
            <Box
              sx={{
                position: 'absolute',
                top: -50,
                right: -50,
                width: 200,
                height: 200,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${theme.palette.primary.main}20, transparent)`,
                animation: 'pulse 3s ease-in-out infinite',
                zIndex: 0,
              }}
            />
            <Box
              sx={{
                position: 'absolute',
                bottom: -30,
                left: -30,
                width: 150,
                height: 150,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${theme.palette.secondary.main}20, transparent)`,
                animation: 'pulse 4s ease-in-out infinite',
                animationDelay: '1s',
                zIndex: 0,
              }}
            />
            <CardContent sx={{ p: { xs: 4, md: 6 }, textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <Zoom in timeout={500}>
                <Chip
                  label="🚨 FLASH SALE"
                  color="error"
                  icon={<FlashIcon />}
                  sx={{
                    mb: 3,
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    py: 2.5,
                    animation: 'pulse 2s ease-in-out infinite',
                  }}
                />
              </Zoom>
              <Typography
                variant="h3"
                fontWeight={800}
                gutterBottom
                sx={{
                  fontSize: { xs: '1.75rem', md: '2.5rem' },
                  mb: 3,
                  color: 'text.primary',
                }}
              >
                10X Your SEO Prospecting in 90 Minutes—Live Workshop
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'text.secondary',
                  mb: 4,
                  fontSize: { xs: '1rem', md: '1.25rem' },
                  lineHeight: 1.7,
                }}
              >
                Agency owners: Tired of cold emails vanishing into the void? Get Grant Cardone-inspired scripts + AI-powered SEO tools to close 5x more clients. Normally $497... Today only:{' '}
                <Typography component="span" fontWeight={800} color="primary.main">
                  $97
                </Typography>{' '}
                (86% OFF!)
              </Typography>

              <Zoom in timeout={800}>
                <Paper
                  elevation={2}
                  sx={{
                    bgcolor: 'error.main',
                    color: 'white',
                    p: 3,
                    mb: 4,
                    borderRadius: 2,
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                      animation: 'shimmer 3s infinite',
                    },
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ mb: 1, position: 'relative', zIndex: 1 }}>
                    <AccessTimeIcon sx={{ animation: 'pulse 2s ease-in-out infinite' }} />
                    <Typography variant="h6" fontWeight={700}>
                      Flash Sale Ends In: {timerString}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ opacity: 0.95, position: 'relative', zIndex: 1 }}>
                    Only 50 Spots Left
                  </Typography>
                </Paper>
              </Zoom>

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={claimSpot}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: 'primary.main',
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  mb: 2,
                  '&:hover': {
                    bgcolor: 'primary.dark',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s',
                }}
              >
                Claim Your Spot Now – $97
              </Button>
              <Typography variant="body2" color="text.secondary">
                100% Secure Checkout | Instant Access | Money-Back Guarantee
              </Typography>
            </CardContent>
          </Card>

          {/* Pain/Agitate Section */}
          <Box sx={{ mb: 6 }}>
            <Fade in timeout={600}>
              <Box>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      bgcolor: 'error.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      animation: 'pulse 2s ease-in-out infinite',
                    }}
                  >
                    <CloseIcon sx={{ color: 'white', fontSize: 32 }} />
                  </Box>
                  <Typography variant="h4" fontWeight={700}>
                    Why Your SEO Outreach Feels Like Shouting Into the Wind
                  </Typography>
                </Stack>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.8 }}>
                  As an agency founder building co-work dashboards and client wins, you know the drill: You pour hours into SEO audits, but prospects ghost you. Rankings stall, leads dry up, and your Analytics dashboard shows more frustration than growth.
                </Typography>
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  {[
                    { icon: <EmailIcon />, text: '80% of cold pitches ignored (even with "personalized" tweaks)' },
                    { icon: <TrendingDownIcon />, text: 'Wasted ad spend on unqualified tire-kickers' },
                    { icon: <SpeedIcon />, text: 'No scalable system to prospect high-ticket clients who value your AI-driven expertise' },
                  ].map((item, index) => (
                    <Grid item xs={12} key={index}>
                      <Grow in timeout={800 + index * 200}>
                        <Card
                          elevation={1}
                          sx={{
                            p: 2,
                            bgcolor: 'transparent',
                            border: `1px solid ${theme.palette.error.main}30`,
                            '&:hover': {
                              transform: 'translateX(8px)',
                              borderColor: theme.palette.error.main,
                            },
                            transition: 'all 0.3s',
                          }}
                        >
                          <Stack direction="row" spacing={2} alignItems="flex-start">
                            <Box
                              sx={{
                                color: 'error.main',
                                mt: 0.5,
                                '& svg': { fontSize: 28 },
                              }}
                            >
                              {item.icon}
                            </Box>
                            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7, flex: 1 }}>
                              {item.text}
                            </Typography>
                          </Stack>
                        </Card>
                      </Grow>
                    </Grid>
                  ))}
                </Grid>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    bgcolor: 'primary.main',
                    color: 'white',
                    textAlign: 'center',
                    mt: 3,
                  }}
                >
                  <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                    Sound familiar? It&apos;s not you—it&apos;s your process.
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.95 }}>
                    Time to 10X it. <strong>Begin now.</strong>
                  </Typography>
                </Box>
              </Box>
            </Fade>
          </Box>

          <Divider sx={{ my: 6 }} />

          {/* Before/After AI Video Mockup Section */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 2, textAlign: 'center' }}>
              See the Transformation: From Blank Screen to Viral Videos
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, textAlign: 'center', lineHeight: 1.8 }}>
              Watch how AI Content Manager transforms your ideas into scroll-stopping content in minutes—not hours.
            </Typography>
            <BeforeAfterMockup
              beforeImage="/images/before.jpg"
              afterImage="/images/after.jpg"
              beforeLabel="Before: Hours of Work, Low Engagement"
              afterLabel="After: Minutes to Create, Viral Results"
              title="The AI Video Revolution"
              description="Experience the power of fearless creativity with AI Content Manager"
              autoAnimate={true}
              animationSpeed={4000}
            />
          </Box>

          <Divider sx={{ my: 6 }} />

          {/* Solution & Value Stack */}
          <Card elevation={2} sx={{ mb: 6, bgcolor: 'transparent' }}>
            <CardContent sx={{ p: { xs: 4, md: 6 } }}>
              <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                What&apos;s Inside the 10X SEO Prospecting Workshop
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, lineHeight: 1.8 }}>
                Join me live (or get the replay) for a 90-min deep dive: From Cardone&apos;s &quot;add value first&quot; mindset to Hormozi&apos;s grand-slam offers, tailored for SEO agencies. Walk away with a plug-and-play system that feeds your dashboard&apos;s Ministry & Wellness modules for sustained client relationships.
              </Typography>

              <Stack spacing={2} sx={{ mb: 4 }}>
                {[
                  { icon: <EmailIcon />, label: 'Live Training: 10X Prospecting Scripts (Cold Email + LinkedIn DMs)', value: '$997', color: 'primary.main' },
                  { icon: <AutoAwesomeIcon />, label: 'Bonus: AI SEO Audit Template (Integrates with Your Analytics Dashboard)', value: '$497', color: 'secondary.main' },
                  { icon: <TrendingUpIcon />, label: 'Bonus: 50 High-Ticket Client Personas + Outreach Tracker', value: '$297', color: 'success.main' },
                  { icon: <RocketLaunchIcon />, label: 'Bonus: Private Co-Work Community Access (1 Month – Build Together!)', value: '$197', color: 'warning.main' },
                ].map((item, index) => (
                  <Grow in timeout={600 + index * 150} key={index}>
                    <Card
                      elevation={1}
                      sx={{
                        p: 2,
                        bgcolor: 'transparent',
                        border: `1px solid ${theme.palette.divider}`,
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 4,
                          borderColor: item.color,
                        },
                        transition: 'all 0.3s',
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
                        <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: '50%',
                              bgcolor: `${item.color}20`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: item.color,
                            }}
                          >
                            {item.icon}
                          </Box>
                          <Typography variant="body1" sx={{ color: 'text.primary', flex: 1 }}>
                            {item.label}
                          </Typography>
                        </Stack>
                        <Typography variant="h6" fontWeight={700} sx={{ color: item.color, ml: 2 }}>
                          {item.value}
                        </Typography>
                      </Stack>
                    </Card>
                  </Grow>
                ))}
              </Stack>

              <Divider sx={{ my: 3 }} />

              {/* AI Content Manager - The Complete Package */}
              <Box
                sx={{
                  p: 4,
                  borderRadius: 3,
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 130, 246, 0.15) 100%)'
                    : 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)',
                  border: `2px solid ${theme.palette.primary.main}40`,
                  mb: 3,
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <AutoAwesomeIcon sx={{ fontSize: 32, color: 'primary.main' }} />
                  <Typography variant="h5" fontWeight={800} sx={{ color: 'primary.main' }}>
                    🎯 What Completes the Package
                  </Typography>
                </Stack>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                  AI Content Manager: Your 24/7 Creative Engine for Viral Videos
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.8 }}>
                  Tired of Staring at a Blank Screen? Imagine churning out scroll-stopping videos for TikTok, Instagram Reels, and YouTube Shorts—without scripting, shooting, or editing for hours. That&apos;s the magic of AI Content Manager, the SaaS powerhouse that turns your wild ideas into polished, engagement-exploding content in minutes. Like Revid AI on steroids, but built for creators who demand total control and infinite scale.
                </Typography>

                <Grid container spacing={3} sx={{ mb: 3 }}>
                  {[
                    {
                      icon: <RocketLaunchIcon sx={{ fontSize: 28 }} />,
                      title: 'Instant Video Magic',
                      description: 'Drop a text prompt, blog link, tweet, or podcast URL—boom. Our AI analyzes 5M+ viral trends, auto-generates killer scripts, hooks, and visuals. No more "writer\'s block" or clunky editors.',
                      color: 'primary.main',
                    },
                    {
                      icon: <VideoIcon sx={{ fontSize: 28 }} />,
                      title: 'Voice & Avatar Wizards',
                      description: 'Choose from 100+ hyper-realistic voices (male, female, accents galore) and AI influencers that look and sound like you. Record once, remix forever—perfect for faceless videos or branded avatars.',
                      color: 'secondary.main',
                    },
                    {
                      icon: <TrendingUpIcon sx={{ fontSize: 28 }} />,
                      title: 'One-Click Publishing Power',
                      description: 'Optimized for every platform. Export watermark-free, SEO-boosted shorts ready to post. Plus, auto-scheduling and A/B testing to skyrocket your reach.',
                      color: 'success.main',
                    },
                    {
                      icon: <AutoAwesomeIcon sx={{ fontSize: 28 }} />,
                      title: 'Autopilot Mode',
                      description: 'Set it and forget it. 5 smart "workers" crank out 10+ videos weekly while you sip coffee. Wake up to a content calendar full of fire.',
                      color: 'warning.main',
                    },
                  ].map((feature, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Grow in timeout={800 + index * 150}>
                        <Card
                          elevation={2}
                          sx={{
                            height: '100%',
                            bgcolor: 'transparent',
                            border: `2px solid ${theme.palette[feature.color.split('.')[0] as 'primary' | 'secondary' | 'success' | 'warning'].main}30`,
                            position: 'relative',
                            overflow: 'hidden',
                            '&:hover': {
                              transform: 'translateY(-8px)',
                              boxShadow: 8,
                              borderColor: theme.palette[feature.color.split('.')[0] as 'primary' | 'secondary' | 'success' | 'warning'].main,
                            },
                            transition: 'all 0.3s',
                          }}
                        >
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: 4,
                              background: `linear-gradient(90deg, ${theme.palette[feature.color.split('.')[0] as 'primary' | 'secondary' | 'success' | 'warning'].main}, transparent)`,
                            }}
                          />
                          <CardContent sx={{ p: 3 }}>
                            <Box
                              sx={{
                                color: feature.color,
                                mb: 1.5,
                                display: 'inline-flex',
                                p: 1.5,
                                borderRadius: '50%',
                                bgcolor: `${feature.color}15`,
                                animation: 'pulse 2s ease-in-out infinite',
                                animationDelay: `${index * 0.2}s`,
                              }}
                            >
                              {feature.icon}
                            </Box>
                            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 1 }}>
                              {feature.title}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                              {feature.description}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grow>
                    </Grid>
                  ))}
                </Grid>

                <Card
                  elevation={2}
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    p: 3,
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      fontStyle: 'italic',
                      mb: 1,
                      lineHeight: 1.7,
                    }}
                  >
                    &quot;I went from 1 video a week to 20—and my follower count exploded. AI Content Manager isn&apos;t a tool; it&apos;s my unfair advantage.&quot;
                  </Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ opacity: 0.95 }}>
                    – Journey Through Consciousness, TikTok Influencer with 50K+ followers
                  </Typography>
                </Card>
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 2,
                  borderTop: `2px solid ${theme.palette.primary.main}`,
                }}
              >
                <Typography variant="h6" fontWeight={700} sx={{ color: 'text.primary' }}>
                  Total Value
                </Typography>
                <Typography variant="h5" fontWeight={800} sx={{ color: 'primary.main' }}>
                  $1,988
                </Typography>
              </Box>

              <Box sx={{ textAlign: 'center', mt: 4, p: 3, bgcolor: 'primary.main', borderRadius: 2 }}>
                <Typography variant="h5" fontWeight={800} sx={{ color: 'white', mb: 1 }}>
                  Flash Price: Just $97
                </Typography>
                <Typography variant="body1" sx={{ color: 'rgba(255, 255, 255, 0.9)' }}>
                  You Save $400 + Get $1,491 in Bonuses + AI Content Manager Access
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Social Proof */}
          <Box sx={{ mb: 6 }}>
            <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ mb: 4 }}>
              <StarIcon sx={{ fontSize: 40, color: 'warning.main', animation: 'pulse 2s ease-in-out infinite' }} />
              <Typography variant="h4" fontWeight={700}>
                Agencies Just Like Yours Are 10Xing...
              </Typography>
              <StarIcon sx={{ fontSize: 40, color: 'warning.main', animation: 'pulse 2s ease-in-out infinite', animationDelay: '1s' }} />
            </Stack>
            <Grid container spacing={3}>
              {[
                {
                  quote: 'This workshop turned my SEO cold outreach from 2% response to 18% closes. Integrated the templates into my dashboard—clients now co-work on real-time wins. Revenue up 3x in Q4!',
                  author: 'Sarah J., Digital Agency Founder',
                  icon: <TrendingUpIcon />,
                },
                {
                  quote: 'Hormozi + Cardone in one session? Game-changer for prospecting. The AI bonus alone saved me 20 hours/week.',
                  author: 'Mark T., SEO Consultant',
                  icon: <RocketLaunchIcon />,
                },
              ].map((testimonial, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Grow in timeout={800 + index * 200}>
                    <Card
                      elevation={3}
                      sx={{
                        height: '100%',
                        bgcolor: 'transparent',
                        border: `2px solid ${theme.palette.primary.main}30`,
                        position: 'relative',
                        overflow: 'hidden',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: 8,
                          borderColor: theme.palette.primary.main,
                        },
                        transition: 'all 0.3s',
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          width: 100,
                          height: 100,
                          borderRadius: '0 0 0 100%',
                          bgcolor: `${theme.palette.primary.main}10`,
                        }}
                      />
                      <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <StarIcon key={star} sx={{ fontSize: 20, color: 'warning.main' }} />
                          ))}
                        </Stack>
                        <Typography
                          variant="body1"
                          sx={{
                            color: 'text.secondary',
                            fontStyle: 'italic',
                            mb: 3,
                            lineHeight: 1.7,
                            fontSize: '1.05rem',
                          }}
                        >
                          &quot;{testimonial.quote}&quot;
                        </Typography>
                        <Divider sx={{ my: 2 }} />
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Box
                            sx={{
                              width: 48,
                              height: 48,
                              borderRadius: '50%',
                              bgcolor: 'primary.main',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                            }}
                          >
                            {testimonial.icon}
                          </Box>
                          <Typography variant="body2" fontWeight={600} sx={{ color: 'text.primary' }}>
                            – {testimonial.author}
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grow>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Divider sx={{ my: 6 }} />

          {/* Objection Handling / FAQ */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 4 }}>
              Still On the Fence? Here&apos;s the Real Talk
            </Typography>
            <Stack spacing={3}>
              {[
                {
                  q: 'Is this beginner-friendly?',
                  a: 'Yes—perfect for agencies scaling from solopreneur to team leads. No fluff, just actionable 10X tactics.',
                },
                {
                  q: 'What if I miss the live session?',
                  a: 'Full replay + resources dropped instantly. Plus, lifetime access to updates via your dashboard.',
                },
                {
                  q: 'Guarantee?',
                  a: '30-Day Money-Back. If you don\'t land your first qualified prospect, full refund—no questions.',
                },
              ].map((faq, index) => (
                <Card key={index} elevation={1} sx={{ bgcolor: 'transparent' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Typography variant="h6" fontWeight={700} gutterBottom sx={{ color: 'primary.main', mb: 1 }}>
                      Q: {faq.q}
                    </Typography>
                    <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                      A: {faq.a}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          </Box>

          {/* Final CTA */}
          <Zoom in timeout={1000}>
            <Card
              elevation={3}
              sx={{
                mb: 6,
                background: isDark
                  ? 'linear-gradient(135deg, rgba(75, 93, 189, 0.15) 0%, rgba(107, 125, 215, 0.1) 100%)'
                  : 'linear-gradient(135deg, rgba(75, 93, 189, 0.08) 0%, rgba(107, 125, 215, 0.05) 100%)',
                border: `2px solid ${theme.palette.primary.main}60`,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Animated urgency elements */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 20,
                  right: 20,
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: 'error.main',
                  opacity: 0.2,
                  animation: 'pulse 2s ease-in-out infinite',
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 20,
                  left: 20,
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  bgcolor: 'warning.main',
                  opacity: 0.2,
                  animation: 'pulse 2.5s ease-in-out infinite',
                  animationDelay: '0.5s',
                }}
              />
              <CardContent sx={{ p: { xs: 4, md: 6 }, textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" sx={{ mb: 2 }}>
                  <FlashIcon sx={{ fontSize: 40, color: 'error.main', animation: 'pulse 1.5s ease-in-out infinite' }} />
                  <Typography variant="h4" fontWeight={700} sx={{ mb: 0 }}>
                    Don&apos;t Let This Slip – Your Next Client is Waiting
                  </Typography>
                  <FlashIcon sx={{ fontSize: 40, color: 'error.main', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: '0.75s' }} />
                </Stack>
                <Box
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 1,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: 'error.main',
                    color: 'white',
                    mb: 4,
                  }}
                >
                  <AccessTimeIcon />
                  <Typography variant="h6" fontWeight={700}>
                    Flash ends in {timerString}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, lineHeight: 1.7 }}>
                  Join the 10X movement and build client wins together. <strong>Begin now.</strong>
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  fullWidth
                  onClick={claimSpot}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    bgcolor: 'primary.main',
                    py: 2.5,
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                      transform: 'translateY(-4px) scale(1.02)',
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                      animation: 'shimmer 2s infinite',
                    },
                    transition: 'all 0.3s',
                  }}
                >
                  Secure My $97 Spot Before It&apos;s Gone
                </Button>
              </CardContent>
            </Card>
          </Zoom>

          {/* Footer */}
          <Box component="footer" sx={{ textAlign: 'center', py: 4, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              © 2025 iShareHow Labs LLC | Helping Agencies Build Community-Driven Growth
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Link href="/privacy" style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>
                Privacy
              </Link>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>|</Typography>
              <Link href="/terms" style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>
                Terms
              </Link>
            </Stack>
          </Box>
        </Container>
      </Box>
    </>
  );
}

