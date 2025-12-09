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
} from '@mui/icons-material';

export default function ProspectingPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
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
        <meta
          name="description"
          content="Struggling with ghosted SEO prospects? Join our live 10X SEO Prospecting Workshop—proven scripts, templates, and AI tools to land 5x more clients. Flash sale ends in 48 hours. Limited to 50 spots."
        />
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
            }}
          >
            <CardContent sx={{ p: { xs: 4, md: 6 }, textAlign: 'center' }}>
              <Chip
                label="🚨 FLASH SALE"
                color="error"
                sx={{ mb: 3, fontWeight: 700, fontSize: '0.9rem', py: 2.5 }}
              />
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

              <Paper
                elevation={2}
                sx={{
                  bgcolor: 'error.main',
                  color: 'white',
                  p: 3,
                  mb: 4,
                  borderRadius: 2,
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ mb: 1 }}>
                  <AccessTimeIcon />
                  <Typography variant="h6" fontWeight={700}>
                    Flash Sale Ends In: {timerString}
                  </Typography>
                </Stack>
                <Typography variant="body2" sx={{ opacity: 0.95 }}>
                  Only 50 Spots Left
                </Typography>
              </Paper>

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
            <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
              Why Your SEO Outreach Feels Like Shouting Into the Wind
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.8 }}>
              As an agency founder building co-work dashboards and client wins, you know the drill: You pour hours into SEO audits, but prospects ghost you. Rankings stall, leads dry up, and your Analytics dashboard shows more frustration than growth.
            </Typography>
            <Stack spacing={2}>
              {[
                '80% of cold pitches ignored (even with "personalized" tweaks)',
                'Wasted ad spend on unqualified tire-kickers',
                'No scalable system to prospect high-ticket clients who value your AI-driven expertise',
              ].map((item, index) => (
                <Stack key={index} direction="row" spacing={2} alignItems="flex-start">
                  <CloseIcon sx={{ color: 'error.main', mt: 0.5 }} />
                  <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                    {item}
                  </Typography>
                </Stack>
              ))}
            </Stack>
            <Typography variant="body1" sx={{ color: 'text.primary', mt: 3, fontWeight: 600 }}>
              Sound familiar? It&apos;s not you—it&apos;s your process. Time to 10X it.
            </Typography>
          </Box>

          <Divider sx={{ my: 6 }} />

          {/* Solution & Value Stack */}
          <Card elevation={2} sx={{ mb: 6, bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: { xs: 4, md: 6 } }}>
              <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                What&apos;s Inside the 10X SEO Prospecting Workshop
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, lineHeight: 1.8 }}>
                Join me live (or get the replay) for a 90-min deep dive: From Cardone&apos;s &quot;add value first&quot; mindset to Hormozi&apos;s grand-slam offers, tailored for SEO agencies. Walk away with a plug-and-play system that feeds your dashboard&apos;s Ministry & Wellness modules for sustained client relationships.
              </Typography>

              <Stack spacing={2} sx={{ mb: 4 }}>
                {[
                  { label: 'Live Training: 10X Prospecting Scripts (Cold Email + LinkedIn DMs)', value: '$997' },
                  { label: 'Bonus: AI SEO Audit Template (Integrates with Your Analytics Dashboard)', value: '$497' },
                  { label: 'Bonus: 50 High-Ticket Client Personas + Outreach Tracker', value: '$297' },
                  { label: 'Bonus: Private Co-Work Community Access (1 Month – Build Together!)', value: '$197' },
                ].map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      py: 2,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Typography variant="body1" sx={{ color: 'text.primary', flex: 1 }}>
                      {item.label}
                    </Typography>
                    <Typography variant="h6" fontWeight={700} sx={{ color: 'text.secondary', ml: 2 }}>
                      {item.value}
                    </Typography>
                  </Box>
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
                    },
                    {
                      icon: <VideoIcon sx={{ fontSize: 28 }} />,
                      title: 'Voice & Avatar Wizards',
                      description: 'Choose from 100+ hyper-realistic voices (male, female, accents galore) and AI influencers that look and sound like you. Record once, remix forever—perfect for faceless videos or branded avatars.',
                    },
                    {
                      icon: <TrendingUpIcon sx={{ fontSize: 28 }} />,
                      title: 'One-Click Publishing Power',
                      description: 'Optimized for every platform. Export watermark-free, SEO-boosted shorts ready to post. Plus, auto-scheduling and A/B testing to skyrocket your reach.',
                    },
                    {
                      icon: <AutoAwesomeIcon sx={{ fontSize: 28 }} />,
                      title: 'Autopilot Mode',
                      description: 'Set it and forget it. 5 smart "workers" crank out 10+ videos weekly while you sip coffee. Wake up to a content calendar full of fire.',
                    },
                  ].map((feature, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Card elevation={1} sx={{ height: '100%', bgcolor: 'background.paper' }}>
                        <CardContent sx={{ p: 3 }}>
                          <Box sx={{ color: 'primary.main', mb: 1.5 }}>
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
            <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 4 }}>
              Agencies Just Like Yours Are 10Xing...
            </Typography>
            <Grid container spacing={3}>
              {[
                {
                  quote: 'This workshop turned my SEO cold outreach from 2% response to 18% closes. Integrated the templates into my dashboard—clients now co-work on real-time wins. Revenue up 3x in Q4!',
                  author: 'Sarah J., Digital Agency Founder',
                },
                {
                  quote: 'Hormozi + Cardone in one session? Game-changer for prospecting. The AI bonus alone saved me 20 hours/week.',
                  author: 'Mark T., SEO Consultant',
                },
              ].map((testimonial, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Card elevation={2} sx={{ height: '100%', bgcolor: 'background.paper' }}>
                    <CardContent sx={{ p: 4 }}>
                      <Typography
                        variant="body1"
                        sx={{
                          color: 'text.secondary',
                          fontStyle: 'italic',
                          mb: 3,
                          lineHeight: 1.7,
                        }}
                      >
                        &quot;{testimonial.quote}&quot;
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="body2" fontWeight={600} sx={{ color: 'text.primary' }}>
                        – {testimonial.author}
                      </Typography>
                    </CardContent>
                  </Card>
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
                <Card key={index} elevation={1} sx={{ bgcolor: 'background.paper' }}>
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
          <Card
            elevation={3}
            sx={{
              mb: 6,
              background: isDark
                ? 'linear-gradient(135deg, rgba(75, 93, 189, 0.15) 0%, rgba(107, 125, 215, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(75, 93, 189, 0.08) 0%, rgba(107, 125, 215, 0.05) 100%)',
              border: `1px solid ${theme.palette.primary.main}40`,
            }}
          >
            <CardContent sx={{ p: { xs: 4, md: 6 }, textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                Don&apos;t Let This Slip – Your Next Client is Waiting
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, lineHeight: 1.7 }}>
                Flash ends in <strong>{timerString}</strong>. Join the 10X movement and build client wins together.
              </Typography>
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
                  '&:hover': {
                    bgcolor: 'primary.dark',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s',
                }}
              >
                Secure My $97 Spot Before It&apos;s Gone
              </Button>
            </CardContent>
          </Card>

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

