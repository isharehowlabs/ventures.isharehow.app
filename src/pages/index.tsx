// UNIQUE_BUILD_TEST_2025_OCT_24_V3
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Container,
  Grid,
  Paper,
  Stack,
  Divider,
  Card,
  CardContent,
  Avatar,
  Fade,
  Grow,
  Slide,
  Chip,
  IconButton,
  Fab,
  Zoom,
  useScrollTrigger,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
  CloudQueue as CloudIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  Dashboard as DashboardIcon,
  Brush as BrushIcon,
  Web as WebIcon,
  VideoLibrary as VideoIcon,
  School as SchoolIcon,
  AutoAwesome as AutoAwesomeIcon,
  RocketLaunch as RocketLaunchIcon,
  TrendingUp as TrendingUpIcon,
  Shield as ShieldIcon,
  Speed as SpeedIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  PlayArrow as PlayArrowIcon,
  ContactSupport as ContactSupportIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Launch as LaunchIcon,
  DesignServices as DesignIcon,
  Code as CodeIcon,
  Palette as PaletteIcon,
} from '@mui/icons-material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AppShell from '../components/AppShell';
import PricingTierCard, { PricingTier } from '../components/pricing/PricingTierCard';
import PricingToggle from '../components/pricing/PricingToggle';
import FeatureComparisonTable, { Feature } from '../components/pricing/FeatureComparisonTable';
import BeforeAfterMockup from '../components/landing/BeforeAfterMockup';
import { useStickyState } from '../hooks/useStickyState';
import styles from '../styles/landing/LandingPage.module.css';

const pricingTiers: PricingTier[] = [
  {
    id: 'diy-plus',
    name: 'Freelancers DIY Plus',
    price: 299,
    priceAnnual: 2870, // ~20% discount
    description: 'Seed Stage Companies DIY',
    color: '#10b981',
    features: [
      'Pay Per Request',
      'Avg. 2-3 biz-day turnarounds',
      '2 revision rounds per deliverable',
      'Brand & UX/UI production (landing pages, components, UX copy)',
    ],
    ctaText: 'Get Started',
  },
  {
    id: 'essential',
    name: 'Essential',
    price: 2500,
    priceAnnual: 24000, // ~20% discount
    description: 'Early-stage teams needing steady output',
    color: '#22D3EE',
    features: [
      '1 active workstream',
      'Avg. 2-3 biz-day turnarounds',
      '2 revision rounds per deliverable',
      'Brand & UX/UI production (landing pages, components, UX copy)',
      'Content creation (2-4 assets/mo)',
      'Front-end tweaks (up to 10 hrs/mo)',
      'Light SEO (2 focus pages/mo)',
    ],
    ctaText: 'Get Started',
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 5000,
    priceAnnual: 48000, // ~20% discount
    description: 'Scaling teams; multi-channel execution',
    color: '#8b5cf6',
    popular: true,
    features: [
      '2 concurrent workstreams',
      '48-72 hr turns',
      '2-3 revisions',
      'Everything in Essential plus:',
      'UX audits quarterly',
      'CRO experiments',
      'Component libraries/design systems',
      'Front-end implementation (up to 25 hrs/mo)',
      'SEO plan + content briefs (4-6 pages/mo)',
    ],
    ctaText: 'Get Started',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 8000,
    priceAnnual: 76800, // ~20% discount
    description: 'High-velocity product & brand teams',
    color: '#f59e0b',
    features: [
      '3 concurrent workstreams',
      'Priority queuing',
      '24-48 hr turns',
      'Unlimited minor revisions',
      'Everything in Growth plus:',
      'Product UX strategy hours (8-12 hrs/mo)',
      'Advanced UX research (lightweight)',
      'Accessibility reviews (WCAG spot checks)',
      'Front-end sprints (up to 40 hrs/mo)',
      'Technical SEO (schema, CWV fixes)',
    ],
    ctaText: 'Get Started',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 12000,
    priceAnnual: 115200, // ~20% discount
    description: 'Multi-brand portfolios & complex pipelines',
    color: '#ef4444',
    features: [
      'Dedicated pod',
      'Weekly standups',
      'Custom SLAs',
      'Everything in Premium plus:',
      'Dedicated design lead',
      'Quarterly roadmap',
      'Full accessibility audits',
      'Design system stewardship',
      'SEO content Ops at scale',
      'Analytics dashboards',
    ],
    ctaText: 'Contact Sales',
  },
];

const comparisonFeatures: Feature[] = [
  {
    name: 'Pricing Model',
    'diy-plus': 'Pay Per Request',
    essential: 'Monthly Subscription',
    growth: 'Monthly Subscription',
    premium: 'Monthly Subscription',
    enterprise: 'Monthly Subscription',
  },
  {
    name: 'Active Workstreams',
    'diy-plus': 'Pay Per Request',
    essential: '1',
    growth: '2 concurrent',
    premium: '3 concurrent',
    enterprise: 'Dedicated pod',
  },
  {
    name: 'Turnaround Time',
    'diy-plus': 'Avg. 2-3 biz-day',
    essential: 'Avg. 2-3 biz-day',
    growth: '48-72 hr',
    premium: '24-48 hr',
    enterprise: 'Custom SLAs',
  },
  {
    name: 'Revisions',
    'diy-plus': '2 rounds',
    essential: '2 rounds',
    growth: '2-3 rounds',
    premium: 'Unlimited minor',
    enterprise: 'Unlimited',
  },
  {
    name: 'Brand & UX/UI Production',
    'diy-plus': true,
    essential: true,
    growth: true,
    premium: true,
    enterprise: true,
  },
  {
    name: 'Content Creation',
    'diy-plus': false,
    essential: '2-4 assets/mo',
    growth: '4-6 assets/mo',
    premium: 'Unlimited',
    enterprise: 'Unlimited',
  },
  {
    name: 'Front-End Coding',
    'diy-plus': false,
    essential: 'Up to 10 hrs/mo',
    growth: 'Up to 25 hrs/mo',
    premium: 'Up to 40 hrs/mo',
    enterprise: 'Custom',
  },
  {
    name: 'SEO Services',
    'diy-plus': false,
    essential: 'Light (2 pages/mo)',
    growth: 'Plan + briefs (4-6 pages/mo)',
    premium: 'Technical SEO',
    enterprise: 'Content Ops at scale',
  },
  {
    name: 'UX Audits',
    'diy-plus': false,
    essential: false,
    growth: 'Quarterly',
    premium: 'Advanced research',
    enterprise: 'Full accessibility audits',
  },
  {
    name: 'Design Systems',
    'diy-plus': false,
    essential: false,
    growth: true,
    premium: true,
    enterprise: 'Stewardship',
  },
  {
    name: 'Analytics',
    'diy-plus': false,
    essential: false,
    growth: false,
    premium: false,
    enterprise: true,
  },
];


const mbbaaSFeatures = [
  {
    icon: <CloudIcon />,
    title: 'Infrastructure Management',
    description: 'Server provisioning, network configuration, security, optimal performance, scalability, and reliability.',
  },
  {
    icon: <AnalyticsIcon />,
    title: 'Data Analysis',
    description: 'Transform raw data into actionable insights to identify trends and opportunities.',
  },
  {
    icon: <DashboardIcon />,
    title: 'Business Intelligence (BI)',
    description: 'Custom dashboards, reporting tools, and predictive analytics for a clear view of project health and potential.',
  },
  {
    icon: <SecurityIcon />,
    title: 'Essential Services',
    description: 'Database administration, API management, cloud service integration, and continuous monitoring.',
  },
];

const creativeServices = [
  {
    icon: <BrushIcon />,
    title: 'Brand Experience & UX/UI',
    description: 'Branding, Web Design & Development, UI/UX Analysis & Improvement, Mobile App Design, and Content Creation.',
  },
  {
    icon: <AutoAwesomeIcon />,
    title: 'Experience Strategy',
    description: 'Long-term planning to align digital experience with business and brand objectives.',
  },
  {
    icon: <TrendingUpIcon />,
    title: 'UX/UI Audits & Optimization',
    description: 'Continuous analysis, user testing, and data-driven recommendations to resolve user pain points.',
  },
  {
    icon: <WebIcon />,
    title: 'Website Design, Development & Optimization',
    description: 'High-performing websites that inform, inspire, and incite action (SEO, UX, Brand Identity).',
  },
];


const keyFeatures = [
  {
    icon: <ShieldIcon />,
    title: 'The iShare Guarantee',
    description: 'Unwavering support to help you bring your projects, dreams, and visions to fruition.',
    color: '#10b981',
  },
  {
    icon: <RocketLaunchIcon />,
    title: 'Full Digital Lifecycle Coverage',
    description: 'From secure studio setups and post-production to immersive XR/AR/VR experiences and asset management.',
    color: '#3b82f6',
  },
  {
    icon: <SpeedIcon />,
    title: 'Battle-Tested Infrastructure',
    description: 'Global, compliant infrastructure to neutralize technical and security risks in real-time.',
    color: '#f59e0b',
  },
  {
    icon: <TrendingUpIcon />,
    title: 'Seamless Scalability',
    description: 'Effortlessly scale from daily secure communications to enterprise-wide live events and AI-driven immersive projects.',
    color: '#ef4444',
  },
];

const HomePage = () => {
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Ensure theme is properly applied on mount, especially after auth redirects
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Force theme sync on mount
      const html = document.documentElement;
      const currentTheme = html.getAttribute('data-theme');
      
      // If no theme is set, get it from localStorage or system preference
      if (!currentTheme) {
        try {
          const savedMode = localStorage.getItem('themeMode');
          const systemPref = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
          const theme = savedMode === 'light' || savedMode === 'dark' ? savedMode : systemPref;
          html.setAttribute('data-theme', theme);
        } catch (e) {
          html.setAttribute('data-theme', 'light');
        }
      }
    }
  }, []);

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTier = (tierId: string) => {
    // Navigate to signup page with selected tier
    router.push(`/demo?tier=${tierId}&annual=${isAnnual}`);
  };

  return (
    <>
      <Head>
        <title>iShareHow Labs - Transform Your Business with Managed Services & Creative Solutions</title>
        <link rel="canonical" href="https://ventures.isharehow.app/" />
        <meta
          name="description"
          content="Stop juggling complex IT back-ends and unpredictable creative hiring. iShareHow Labs delivers integrated Managed Services, Creative-as-a-Service, and Strategic Intelligence. Join 100+ organizations achieving 30% efficiency gains. Start your transformation today."
        />
        <meta
          name="keywords"
          content="managed services, creative as a service, SaaS, infrastructure, pricing, subscription, plans, starter, professional, enterprise, iShareHow Labs, managed IT services, creative services, digital transformation"
        />
        <meta property="og:title" content="iShareHow Labs - Transform Your Business with Managed Solutions" />
        <meta property="og:description" content="Integrated Managed Services, Creative-as-a-Service, and Strategic Intelligence. Join 100+ organizations achieving 30% efficiency gains." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://ventures.isharehow.app/" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="iShareHow Labs - Transform Your Business" />
        <meta name="twitter:description" content="Integrated Managed Services, Creative-as-a-Service, and Strategic Intelligence." />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "iShareHow Labs",
              "url": "https://ventures.isharehow.app",
              "description": "Integrated Managed Services, Creative-as-a-Service, and Strategic Intelligence",
              "offers": {
                "@type": "AggregateOffer",
                "offerCount": "3",
                "lowPrice": "399",
                "highPrice": "9000",
                "priceCurrency": "USD"
              }
            }),
          }}
        />
      </Head>

      <AppShell active="home">
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
          {/* Hero Section - Premium Sales Funnel Style */}
          <Box className={styles.heroSection}>
            {/* Floating Visual Elements */}
            <Box
              sx={{
                position: 'absolute',
                top: '10%',
                right: '5%',
                width: { xs: 100, md: 200 },
                height: { xs: 100, md: 200 },
                opacity: 0.2,
                animation: 'float 6s ease-in-out infinite',
                zIndex: 0,
              }}
            >
              <DesignIcon sx={{ fontSize: 'inherit', width: '100%', height: '100%', color: 'white' }} />
            </Box>
            <Box
              sx={{
                position: 'absolute',
                bottom: '15%',
                left: '5%',
                width: { xs: 80, md: 150 },
                height: { xs: 80, md: 150 },
                opacity: 0.15,
                animation: 'float 8s ease-in-out infinite',
                animationDelay: '1s',
                zIndex: 0,
              }}
            >
              <CodeIcon sx={{ fontSize: 'inherit', width: '100%', height: '100%', color: 'white' }} />
            </Box>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                right: '15%',
                width: { xs: 60, md: 120 },
                height: { xs: 60, md: 120 },
                opacity: 0.1,
                animation: 'float 7s ease-in-out infinite',
                animationDelay: '2s',
                zIndex: 0,
              }}
            >
              <PaletteIcon sx={{ fontSize: 'inherit', width: '100%', height: '100%', color: 'white' }} />
            </Box>

            <Container maxWidth="lg" className={styles.heroContent}>
              <Grid container spacing={4} alignItems="center">
                <Grid item xs={12} md={7}>
                  <Typography
                    variant="h1"
                    className={styles.heroTitle}
                    sx={{
                      fontSize: { xs: '2rem', sm: '2.75rem', md: '3.5rem', lg: '4rem' },
                      mb: 3,
                      lineHeight: 1.2,
                    }}
                  >
                    Transform Your Business with Managed Solutions That Scale
                  </Typography>
                  <Typography
                    variant="h2"
                    className={styles.heroSubtitle}
                    sx={{
                      fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                      mb: 2,
                    }}
                  >
                    Stop Juggling Complex IT. Start Scaling with Confidence.
                  </Typography>
                  <Typography
                    variant="h5"
                    className={styles.heroDescription}
                    sx={{
                      fontSize: { xs: '1.1rem', md: '1.3rem' },
                    }}
                  >
                    Join 100+ organizations achieving <strong>30% efficiency gains</strong> with our integrated ecosystem of Managed Services, Creative-as-a-Service, and Strategic Intelligence.
                  </Typography>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      height: { xs: 300, md: 400 },
                      borderRadius: 4,
                      overflow: 'hidden',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                      border: '2px solid rgba(255,255,255,0.2)',
                    }}
                  >
                    <Box
                      sx={{
                        width: '100%',
                        height: '100%',
                        background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.9) 0%, rgba(37, 99, 235, 0.9) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        gap: 2,
                        p: 4,
                      }}
                    >
                      <RocketLaunchIcon sx={{ fontSize: 80, color: 'white', animation: 'pulse 2s ease-in-out infinite' }} />
                      <Typography variant="h5" sx={{ color: 'white', fontWeight: 700, textAlign: 'center' }}>
                        Fearless Creativity
                      </Typography>
                      <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)', textAlign: 'center' }}>
                        Bold Innovation. Visionary Ideas.
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent="center"
                sx={{ mt: 4, mb: 2 }}
              >
                <Button
                  className={styles.ctaButton}
                  size="large"
                  onClick={() => router.push('/demo')}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    '& .MuiButton-endIcon': {
                      transition: 'transform 0.3s',
                    },
                    '&:hover .MuiButton-endIcon': {
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  Start Your Transformation Today
                </Button>
                <Button
                  className={styles.ctaButtonSecondary}
                  size="large"
                  onClick={() => {
                    const element = document.getElementById('pricing');
                    if (element) element.scrollIntoView({ behavior: 'smooth' });
                  }}
                  startIcon={<ArrowDownwardIcon />}
                >
                  View Pricing Plans
                </Button>
              </Stack>
              <Typography
                variant="body2"
                sx={{
                  color: 'rgba(255, 255, 255, 0.8)',
                  mt: 2,
                  fontSize: '0.9rem',
                }}
              >
                ✓ No contracts required  ✓ Cancel anytime  ✓ 7-day trial available
              </Typography>
            </Container>
          </Box>

          {/* Stats Bar - Social Proof */}
          <Fade in timeout={1000}>
            <Box className={styles.statsBar}>
              <Container maxWidth="lg">
                <Grid container spacing={4}>
                  {[
                    { number: '100+', label: 'Organizations', icon: <TrendingUpIcon /> },
                    { number: '30%', label: 'Efficiency Gain', icon: <SpeedIcon /> },
                    { number: '24/7', label: 'Support', icon: <SecurityIcon /> },
                    { number: '98%', label: 'Satisfaction', icon: <StarIcon /> },
                  ].map((stat, index) => (
                    <Grid item xs={6} sm={3} key={index}>
                      <Grow in timeout={800 + index * 200}>
                        <Box className={styles.statCard}>
                          <Avatar
                            sx={{
                              bgcolor: 'primary.main',
                              width: 48,
                              height: 48,
                              mb: 2,
                              mx: 'auto',
                            }}
                          >
                            {stat.icon}
                          </Avatar>
                          <Typography className={styles.statNumber}>{stat.number}</Typography>
                          <Typography className={styles.statLabel}>{stat.label}</Typography>
                        </Box>
                      </Grow>
                    </Grid>
                  ))}
                </Grid>
              </Container>
            </Box>
          </Fade>

          {/* SaaS Section */}
          <Box id="saas" sx={{ py: 10, mb: 8 }}>
            <Container maxWidth="lg">
              <Box className={styles.sectionHeader}>
                <Typography variant="h2" className={styles.sectionTitle}>
                  Your Dedicated Infrastructure Provider
                </Typography>
                <Typography variant="h5" className={styles.sectionSubtitle}>
                  We meticulously manage all critical aspects of your project's back-end, ensuring a robust and efficient foundation for your success.
                </Typography>
              </Box>

              <Grid container spacing={4} sx={{ mb: 5 }}>
                {mbbaaSFeatures.map((feature, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Grow in timeout={600 + index * 150}>
                      <Card className={styles.featureCard}>
                        <CardContent sx={{ p: 0, height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                          {/* Visual Background Pattern */}
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: '30%',
                              background: `linear-gradient(135deg, ${
                                index === 0 ? '#6366f1' : index === 1 ? '#a78bfa' : index === 2 ? '#3b82f6' : '#10b981'
                              } 0%, ${
                                index === 0 ? '#4f46e5' : index === 1 ? '#f43f5e' : index === 2 ? '#22d3ee' : '#34d399'
                              } 100%)`,
                              opacity: 0.08,
                              zIndex: 0,
                            }}
                          />
                          <Box sx={{ p: 4, position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column' }}>
                            <Avatar 
                              className={styles.featureIcon}
                              sx={{
                                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                animation: index === 0 ? 'pulse 2s ease-in-out infinite' : 'none',
                              }}
                            >
                              {feature.icon}
                            </Avatar>
                            <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mt: 2 }}>
                              {feature.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, mb: 2 }}>
                              {feature.description}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grow>
                  </Grid>
                ))}
              </Grid>
            </Container>
          </Box>

          <Divider sx={{ my: 8 }} />

          {/* Before/After UX Mockup Section */}
          <Box id="ux-transformation" sx={{ py: 10, mb: 8, bgcolor: 'background.default' }}>
            <Container maxWidth="lg">
              <BeforeAfterMockup
                beforeImage="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=675&fit=crop"
                afterImage="https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1200&h=675&fit=crop"
                beforeLabel="Before: Cluttered & Confusing"
                afterLabel="After: Clean & Intuitive"
                title="See the Transformation"
                description="Experience the power of fearless creativity with our before/after UX transformations"
                autoAnimate={true}
                animationSpeed={4000}
              />
            </Container>
          </Box>

          <Divider sx={{ my: 8 }} />

          {/* Creative Services Section */}
          <Box id="creative" sx={{ py: 10, mb: 8, bgcolor: 'background.default' }}>
            <Container maxWidth="lg">
              <Box className={styles.sectionHeader}>
                <Typography variant="h2" className={styles.sectionTitle}>
                  Creative-as-a-Service
                </Typography>
                <Typography variant="h5" className={styles.sectionSubtitle}>
                  Visionary Ideas. Fearless Creativity. Bold Innovation.
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    textAlign: 'center',
                    mt: 3,
                    color: 'text.secondary',
                    maxWidth: 800,
                    mx: 'auto',
                    fontSize: '1.1rem',
                    lineHeight: 1.7,
                  }}
                >
                  Designed for ongoing brand experience, UX/UI, content, front-end coding, and SEO. Get the strategic creative leadership of an agency combined with the predictable, scalable structure of a Managed Service Provider (MSP).
                </Typography>
              </Box>

              <Grid container spacing={4} sx={{ mb: 6 }}>
                {creativeServices.map((service, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Slide direction="up" in timeout={600 + index * 150}>
                      <Card className={styles.featureCard}>
                        <CardContent sx={{ p: 0, position: 'relative', overflow: 'hidden' }}>
                          {/* Visual Background */}
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              right: 0,
                              height: '40%',
                              background: `linear-gradient(135deg, ${
                                index === 0 ? '#6366f1' : index === 1 ? '#a78bfa' : index === 2 ? '#3b82f6' : '#10b981'
                              } 0%, ${
                                index === 0 ? '#4f46e5' : index === 1 ? '#f43f5e' : index === 2 ? '#22d3ee' : '#34d399'
                              } 100%)`,
                              opacity: 0.1,
                              zIndex: 0,
                            }}
                          />
                          <Box sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                            <Stack direction="row" spacing={3}>
                              <Avatar
                                className={styles.featureIcon}
                                sx={{
                                  bgcolor: 'secondary.main',
                                  width: 64,
                                  height: 64,
                                  boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                                }}
                              >
                                {service.icon}
                              </Avatar>
                              <Box sx={{ flexGrow: 1 }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={1}>
                                  <Typography variant="h6" fontWeight={700}>
                                    {service.title}
                                  </Typography>
                                  <Chip
                                    label="Popular"
                                    size="small"
                                    color="primary"
                                    sx={{ display: index === 0 ? 'flex' : 'none' }}
                                  />
                                </Stack>
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 2 }}>
                                  {service.description}
                                </Typography>
                                <Button
                                  variant="text"
                                  size="small"
                                  endIcon={<LaunchIcon />}
                                  sx={{
                                    color: 'primary.main',
                                    '&:hover': {
                                      bgcolor: 'primary.main',
                                      color: 'white',
                                    },
                                  }}
                                  onClick={() => router.push('/creative-services')}
                                >
                                  Explore Service
                                </Button>
                              </Box>
                            </Stack>
                          </Box>
                        </CardContent>
                      </Card>
                    </Slide>
                  </Grid>
                ))}
              </Grid>

              <Fade in timeout={1000}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 4,
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: 4,
                      background: 'linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)',
                    },
                  }}
                >
                <Grid container spacing={4}>
                  <Grid item xs={12} md={4}>
                    <Box>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        Core Focus
                      </Typography>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CheckCircleIcon sx={{ color: 'primary.main', mr: 1, fontSize: 20 }} />
                          <Typography variant="body2">Brand Experience & UX/UI</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CheckCircleIcon sx={{ color: 'primary.main', mr: 1, fontSize: 20 }} />
                          <Typography variant="body2">Managed Model</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CheckCircleIcon sx={{ color: 'primary.main', mr: 1, fontSize: 20 }} />
                          <Typography variant="body2">Scalability</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CheckCircleIcon sx={{ color: 'primary.main', mr: 1, fontSize: 20 }} />
                          <Typography variant="body2">Technology Integration</Typography>
                        </Box>
                      </Stack>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        Key Services
                      </Typography>
                      <Stack spacing={1}>
                        <Typography variant="body2" color="text.secondary">
                          • Branding, Web Design & Development
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          • UI/UX Analysis & Improvement
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          • Mobile App Design
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          • Content Creation
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          • Front-End Coding & SEO
                        </Typography>
                      </Stack>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Box>
                      <Typography variant="h6" fontWeight={700} gutterBottom>
                        Managed Model
                      </Typography>
                      <Stack spacing={1}>
                        <Typography variant="body2" color="text.secondary">
                          • Flat-rate, monthly subscription
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          • Unlimited requests and revisions (within plan scope)
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          • Month-to-month flexibility
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          • Scale up or down by changing your plan
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          • No overhead of hiring
                        </Typography>
                      </Stack>
                    </Box>
                  </Grid>
                </Grid>
                <Box sx={{ mt: 4, textAlign: 'center' }}>
                  <Button
                    variant="contained"
                    size="large"
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => router.push('/demo')}
                    sx={{
                      bgcolor: 'primary.main',
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        bgcolor: 'primary.dark',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.3s',
                    }}
                  >
                    Get Started with Creative Services
                  </Button>
                </Box>
              </Paper>
              </Fade>
            </Container>
          </Box>

          <Divider sx={{ my: 8 }} />

          {/* Video Demo Section */}
          <Box id="demo-video" sx={{ py: 10, mb: 8, bgcolor: 'background.default' }}>
            <Container maxWidth="lg">
              <Box className={styles.sectionHeader}>
                <Typography variant="h2" className={styles.sectionTitle}>
                  See It In Action
                </Typography>
                <Typography variant="h5" className={styles.sectionSubtitle}>
                  Watch how we transform businesses with fearless creativity
                </Typography>
              </Box>
              <Grid container spacing={4}>
                <Grid item xs={12} md={8}>
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      paddingTop: '56.25%', // 16:9 aspect ratio
                      borderRadius: 4,
                      overflow: 'hidden',
                      boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
                      bgcolor: 'grey.900',
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                        cursor: 'pointer',
                        transition: 'transform 0.3s ease',
                        '&:hover': {
                          transform: 'scale(1.02)',
                        },
                      }}
                      onClick={() => {
                        const element = document.getElementById('demo');
                        if (element) element.scrollIntoView({ behavior: 'smooth' });
                        else router.push('/demo');
                      }}
                    >
                      <Box
                        sx={{
                          width: 100,
                          height: 100,
                          borderRadius: '50%',
                          bgcolor: 'rgba(255,255,255,0.9)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                          transition: 'transform 0.3s ease',
                          '&:hover': {
                            transform: 'scale(1.1)',
                          },
                        }}
                      >
                        <PlayArrowIcon sx={{ fontSize: 48, color: 'primary.main', ml: 1 }} />
                      </Box>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Stack spacing={3}>
                    <Card sx={{ p: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                        <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                          <RocketLaunchIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight={700}>
                            Fast Results
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            See improvements in days, not months
                          </Typography>
                        </Box>
                      </Stack>
                    </Card>
                    <Card sx={{ p: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                        <Avatar sx={{ bgcolor: 'secondary.main', width: 48, height: 48 }}>
                          <TrendingUpIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight={700}>
                            Proven Impact
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            30% efficiency gains on average
                          </Typography>
                        </Box>
                      </Stack>
                    </Card>
                    <Card sx={{ p: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
                      <Stack direction="row" spacing={2} alignItems="center" mb={2}>
                        <Avatar sx={{ bgcolor: 'success.main', width: 48, height: 48 }}>
                          <StarIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="h6" fontWeight={700}>
                            Trusted Partner
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            100+ organizations trust us
                          </Typography>
                        </Box>
                      </Stack>
                    </Card>
                  </Stack>
                </Grid>
              </Grid>
            </Container>
          </Box>

          <Divider sx={{ my: 8 }} />


          {/* Pricing Section */}
          <Box id="pricing" className={styles.pricingSection}>
            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
              <Box className={styles.sectionHeader}>
                <Typography variant="h2" className={styles.sectionTitle}>
                  Pricing That Scales With Your Business
                </Typography>
                <Typography variant="h5" className={styles.sectionSubtitle}>
                  Choose the plan that works best for your creative goals
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    mt: 3,
                    textAlign: 'center',
                    fontSize: { xs: '0.95rem', md: '1rem' },
                    color: 'text.secondary',
                    maxWidth: 900,
                    mx: 'auto',
                    lineHeight: 1.7,
                  }}
                >
                  <strong>Scope guardrails:</strong> Complex back-end features, enterprise CMS re-platforms, or net-new mobile apps are projects, not subscription tasks (we include "front-end coding" within defined hours and tech stacks).
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mt: 2,
                    textAlign: 'center',
                    fontSize: { xs: '1rem', md: '1.25rem' },
                    color: 'text.secondary',
                  }}
                >
                  NO HIDDEN FEES. NO SURPRISES.
                </Typography>
              </Box>

              {/* Pricing Toggle */}
              <PricingToggle isAnnual={isAnnual} onChange={setIsAnnual} />

              {/* Pricing Tiers */}
              <Grid container spacing={4} sx={{ mb: 8 }}>
                {pricingTiers.map((tier) => (
                  <Grid item xs={12} md={4} key={tier.id}>
                    <PricingTierCard
                      tier={tier}
                      isAnnual={isAnnual}
                      onSelect={handleSelectTier}
                    />
                  </Grid>
                ))}
              </Grid>

              {/* Feature Comparison Table */}
              <Box sx={{ mb: 8 }}>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    mb: 4,
                    textAlign: 'center',
                    fontSize: { xs: '1.5rem', md: '2rem' },
                  }}
                >
                  Compare Plans
                </Typography>
                <FeatureComparisonTable
                  features={comparisonFeatures}
                  tiers={pricingTiers}
                />
              </Box>

            </Container>
          </Box>


          {/* Final CTA Section */}
          <Box id="contact" className={styles.finalCTASection}>
            <Container maxWidth="lg" className={styles.finalCTAContent}>
              <Fade in timeout={1000}>
                <Box>
                  <Typography
                    variant="h2"
                    className={styles.finalCTATitle}
                    sx={{
                      fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                    }}
                  >
                    Ready to Transform Your Business?
                  </Typography>
                  <Typography
                    variant="h5"
                    className={styles.finalCTADescription}
                    sx={{
                      fontSize: { xs: '1.1rem', md: '1.25rem' },
                    }}
                  >
                    Trust iShareHow Labs and our advanced AI app ecosystem to provide the technical backbone and strategic insights that will ensure your competitive edge in today's dynamic market.
                  </Typography>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={3}
                    justifyContent="center"
                    sx={{ mt: 4 }}
                  >
                    <Button
                      className={styles.ctaButton}
                      size="large"
                      onClick={() => router.push('/demo')}
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        minWidth: { xs: '100%', sm: 'auto' },
                        '& .MuiButton-endIcon': {
                          transition: 'transform 0.3s',
                        },
                        '&:hover .MuiButton-endIcon': {
                          transform: 'translateX(4px)',
                        },
                      }}
                    >
                      Start Your Transformation Today
                    </Button>
                    <Button
                      className={styles.ctaButtonSecondary}
                      size="large"
                      onClick={() => router.push('/demo?tier=enterprise')}
                      startIcon={<ContactSupportIcon />}
                      sx={{
                        minWidth: { xs: '100%', sm: 'auto' },
                      }}
                    >
                      Contact Sales
                    </Button>
                  </Stack>
                </Box>
              </Fade>
            </Container>
          </Box>

          {/* Scroll to Top Button */}
          <Zoom in={showScrollTop}>
            <Fab
              color="primary"
              size="medium"
              aria-label="scroll back to top"
              onClick={scrollToTop}
              sx={{
                position: 'fixed',
                bottom: 32,
                right: 32,
                zIndex: 1000,
                boxShadow: 4,
                '&:hover': {
                  transform: 'scale(1.1)',
                },
                transition: 'transform 0.3s',
              }}
            >
              <KeyboardArrowUpIcon />
            </Fab>
          </Zoom>
        </Box>
      </AppShell>
    </>
  );
};

export default HomePage;
