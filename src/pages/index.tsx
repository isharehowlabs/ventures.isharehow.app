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
} from '@mui/icons-material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AppShell from '../components/AppShell';
import PricingTierCard, { PricingTier } from '../components/pricing/PricingTierCard';
import PricingToggle from '../components/pricing/PricingToggle';
import FeatureComparisonTable, { Feature } from '../components/pricing/FeatureComparisonTable';
import FAQAccordion, { FAQItem } from '../components/pricing/FAQAccordion';
import TrustBadges from '../components/pricing/TrustBadges';
import { ServiceFinderQuiz } from '../components/landing/ServiceFinderQuiz';
import { ServiceCard } from '../components/landing/ServiceCard';
import { quizData } from '../data/quizData';
import { serviceDefinitions } from '../data/serviceDefinitions';
import { useStickyState } from '../hooks/useStickyState';
import { ServiceKey, ServiceScore } from '../types/landing';
import styles from '../styles/landing/LandingPage.module.css';

const pricingTiers: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 399,
    priceAnnual: 3830, // ~20% discount
    description: 'Perfect for small businesses, startups, and individual creators',
    color: '#22D3EE',
    features: [
      '10-20 requests per month',
      'Standard turnaround (48-72 hours)',
      'Email support',
      'Basic design services',
      'Access to Co-Work Dashboard',
      'Access to Rise Dashboard',
      'Basic CaaS features',
    ],
    ctaText: 'Get Started',
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 1499,
    priceAnnual: 14390, // ~20% discount
    description: 'Ideal for growing businesses, agencies, and projects',
    color: '#8b5cf6',
    popular: true,
    features: [
      'Unlimited requests',
      'Priority turnaround (24-48 hours)',
      'Dedicated project manager',
      'Advanced design services',
      'Full CaaS access',
      'API integrations',
      'Analytics dashboard',
      'Priority support',
    ],
    ctaText: 'Get Started',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 9000,
    priceAnnual: 86400, // ~20% discount
    description: 'For large enterprises and agencies with high volume needs',
    color: '#f59e0b',
    features: [
      'Unlimited requests and revisions',
      'Same-day turnaround',
      'Dedicated team',
      'Custom integrations',
      'White-label options',
      'Advanced security features',
      'SLA guarantees',
      'Custom contract terms',
      'Platform/service fee included',
    ],
    ctaText: 'Contact Sales',
  },
];

const comparisonFeatures: Feature[] = [
  {
    name: 'Request Limits',
    starter: '10-20/month',
    professional: 'Unlimited',
    enterprise: 'Unlimited',
  },
  {
    name: 'Turnaround Time',
    starter: '48-72 hours',
    professional: '24-48 hours',
    enterprise: 'Same-day',
  },
  {
    name: 'Support Level',
    starter: 'Email support',
    professional: 'Priority support',
    enterprise: 'Dedicated team',
  },
  {
    name: 'Design Services',
    starter: 'Basic',
    professional: 'Advanced',
    enterprise: 'Premium + White-label',
  },
  {
    name: 'CaaS Features',
    starter: 'Basic',
    professional: 'Full access',
    enterprise: 'Full access + Custom',
  },
  {
    name: 'MSP Features',
    starter: true,
    professional: true,
    enterprise: true,
  },
  {
    name: 'API Integrations',
    starter: false,
    professional: true,
    enterprise: 'Custom integrations',
  },
  {
    name: 'Team Collaboration',
    starter: 'Co-Work & Rise Dashboards',
    professional: 'Full collaboration',
    enterprise: 'Dedicated team workspace',
  },
  {
    name: 'Analytics & Reporting',
    starter: false,
    professional: true,
    enterprise: true,
  },
  {
    name: 'Security Features',
    starter: 'Standard',
    professional: 'Enhanced',
    enterprise: 'Advanced + SLA',
  },
  {
    name: 'Customization Options',
    starter: false,
    professional: 'Limited',
    enterprise: 'Full customization',
  },
];

const faqs: FAQItem[] = [
  {
    question: "What's included in each plan?",
    answer: 'See the feature comparison table above - check marks note what each plan section has. Contact us for custom packages.',
  },
  {
    question: 'Can I change plans later?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.',
  },
  {
    question: "What's the difference between Starter and Professional?",
    answer: 'Professional offers more creative power with unlimited requests, priority turnaround, dedicated project manager, and full CaaS access.',
  },
  {
    question: 'Do you offer annual discounts?',
    answer: 'Yes, we offer up to 20% discount for annual billing. Discounts are also available per project based on custom packages and deals.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept Wire transfers, PayPal, Contract payments, and our payment integrations.',
  },
  {
    question: 'Is there a contract or can I cancel anytime?',
    answer: 'It depends on the package and terms. Starter and Professional plans offer month-to-month flexibility. Enterprise plans typically include custom contract terms.',
  },
  {
    question: 'What happens if I exceed my request limit?',
    answer: 'Your API and agents will pause until you purchase more rate or wait until your renewal date. You can also upgrade your plan for unlimited requests.',
  },
];

const testimonials = [
  {
    quote: 'iShareHow Labs transformed our digital infrastructure. The team is responsive and the results speak for themselves.',
    author: 'Sarah Johnson',
    role: 'CEO, TechStart Inc.',
  },
  {
    quote: 'The Creative-as-a-Service model has been a game-changer. We get agency-quality work without the overhead.',
    author: 'Michael Chen',
    role: 'Founder, DesignCo',
  },
  {
    quote: 'Enterprise support is outstanding. The dedicated team understands our needs and delivers consistently.',
    author: 'Emily Rodriguez',
    role: 'CTO, Enterprise Solutions',
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

const iShareHowDivisions = [
  {
    icon: <VideoIcon />,
    title: 'Productions/Studios',
    description: 'Independent Production & editor-in-chief. Develop Tech Solutions, DIY Maker Projects, Applied Labs, Product Reviews, and EV projects. Includes ELI Productions (Writers/Direction/Casting).',
    color: '#6366f1',
  },
  {
    icon: <SchoolIcon />,
    title: 'Publishing',
    description: 'Develop Websites, Courses, and ebooks. Ownership of digital copyright for video, academic journals, blogs. Responsible for video storyline and concept creation.',
    color: '#8b5cf6',
  },
  {
    icon: <VideoIcon />,
    title: 'iShareHow YouTube Channel',
    description: 'A resource for learning about technology, science, building, and more with informative and engaging videos.',
    color: '#ec4899',
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
  const [quizStep, setQuizStep] = useStickyState<number>("quizStep", 0);
  const [answers, setAnswers] = useStickyState<Record<string, number>>(
    "quizAnswers",
    {}
  );
  const [showScrollTop, setShowScrollTop] = useState(false);

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

  const handleQuizAnswer = (qid: string, opt: number) => {
    setAnswers((prev) => ({ ...prev, [qid]: opt }));
  };

  const nextQuiz = () => {
    if (quizStep < quizData.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      // Navigate to results section
      const resultsElement = document.getElementById('results');
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const prevQuiz = () => {
    if (quizStep > 0) {
      setQuizStep(quizStep - 1);
    }
  };

  const resetQuiz = () => {
    setQuizStep(0);
    setAnswers({});
    const quizElement = document.getElementById('quiz');
    if (quizElement) {
      quizElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getQuizScores = (): Record<ServiceKey, number> => {
    const scores: Record<ServiceKey, number> = {
      security: 0,
      infrastructure: 0,
      production: 0,
      applications: 0,
      support: 0,
      platform: 0,
    };
    Object.keys(answers).forEach((qid) => {
      const question = quizData.find((q) => q.id === qid);
      if (!question) return;
      const answer = question.options[answers[qid]];
      if (answer && answer.scores) {
        Object.entries(answer.scores).forEach(([key, value]) => {
          scores[key as ServiceKey] += value ?? 0;
        });
      }
    });
    return scores;
  };

  const getTopScores = (n: number = 3): ServiceScore[] => {
    const scores = getQuizScores();
    return Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .filter(([, score]) => score > 0)
      .slice(0, n)
      .map(([key]) => ({
        key: key as ServiceKey,
        ...serviceDefinitions[key as ServiceKey],
        score: scores[key as ServiceKey],
      }));
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
            <Container maxWidth="lg" className={styles.heroContent}>
              <Typography
                variant="h1"
                className={styles.heroTitle}
                sx={{
                  fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem', lg: '5.5rem' },
                  mb: 3,
                }}
              >
                Transform Your Business with
                <br />
                <span style={{ background: 'linear-gradient(135deg, #f0f0f0 0%, #ffffff 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Managed Solutions That Scale
                </span>
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
                <Button
                  variant="text"
                  size="large"
                  onClick={() => {
                    const element = document.getElementById('services');
                    if (element) element.scrollIntoView({ behavior: 'smooth' });
                  }}
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.1)',
                    },
                  }}
                  startIcon={<PlayArrowIcon />}
                >
                  Watch Demo
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
                        <CardContent sx={{ p: 4, height: '100%', display: 'flex', flexDirection: 'column' }}>
                          <Avatar className={styles.featureIcon}>
                            {feature.icon}
                          </Avatar>
                          <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mt: 2 }}>
                            {feature.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ flexGrow: 1, mb: 2 }}>
                            {feature.description}
                          </Typography>
                          <Button
                            variant="outlined"
                            size="small"
                            endIcon={<ArrowForwardIcon />}
                            sx={{
                              mt: 'auto',
                              borderColor: 'primary.main',
                              color: 'primary.main',
                              '&:hover': {
                                borderColor: 'primary.dark',
                                bgcolor: 'primary.main',
                                color: 'white',
                                '& .MuiButton-endIcon': {
                                  transform: 'translateX(4px)',
                                },
                              },
                              '& .MuiButton-endIcon': {
                                transition: 'transform 0.3s',
                              },
                            }}
                            onClick={() => router.push('/demo')}
                          >
                            Learn More
                          </Button>
                        </CardContent>
                      </Card>
                    </Grow>
                  </Grid>
                ))}
              </Grid>
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
                  Get the strategic creative leadership of an agency combined with the predictable, scalable structure of a Managed Service Provider (MSP). We focus on digital brand experience to drive next-level results.
                </Typography>
              </Box>

              <Grid container spacing={4} sx={{ mb: 6 }}>
                {creativeServices.map((service, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Slide direction="up" in timeout={600 + index * 150}>
                      <Card className={styles.featureCard}>
                        <CardContent sx={{ p: 4 }}>
                          <Stack direction="row" spacing={3}>
                            <Avatar
                              className={styles.featureIcon}
                              sx={{
                                bgcolor: 'secondary.main',
                                width: 64,
                                height: 64,
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
                      background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
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

          {/* iShareHow Divisions Section */}
          <Box id="isharehow" sx={{ py: 10, mb: 8, bgcolor: 'background.default' }}>
            <Container maxWidth="lg">
              <Box className={styles.sectionHeader}>
                <Typography variant="h2" className={styles.sectionTitle}>
                  iShareHow Divisions
                </Typography>
                <Typography variant="h5" className={styles.sectionSubtitle}>
                  We develop and distribute compelling content through our iShareHow YT Channel and publishing division.
                </Typography>
              </Box>

              <Grid container spacing={4}>
                {iShareHowDivisions.map((division, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Grow in timeout={600 + index * 150}>
                      <Card
                        elevation={3}
                        sx={{
                          height: '100%',
                          p: 4,
                          background: `linear-gradient(135deg, ${division.color}15, ${division.color}05)`,
                          border: '1px solid',
                          borderColor: `${division.color}30`,
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          position: 'relative',
                          overflow: 'hidden',
                          '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 4,
                            background: division.color,
                            transform: 'scaleX(0)',
                            transition: 'transform 0.3s',
                          },
                          '&:hover': {
                            transform: 'translateY(-8px)',
                            boxShadow: 8,
                            '&::before': {
                              transform: 'scaleX(1)',
                            },
                          },
                        }}
                      >
                        <Avatar
                          sx={{
                            bgcolor: division.color,
                            width: 64,
                            height: 64,
                            mb: 3,
                            transition: 'transform 0.3s',
                            '&:hover': {
                              transform: 'scale(1.1) rotate(5deg)',
                            },
                          }}
                        >
                          {division.icon}
                        </Avatar>
                        <Typography variant="h5" fontWeight={700} gutterBottom>
                          {division.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.7 }}>
                          {division.description}
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          endIcon={<LaunchIcon />}
                          sx={{
                            borderColor: division.color,
                            color: division.color,
                            '&:hover': {
                              borderColor: division.color,
                              bgcolor: division.color,
                              color: 'white',
                              transform: 'translateX(4px)',
                            },
                            '& .MuiButton-endIcon': {
                              transition: 'transform 0.3s',
                            },
                            '&:hover .MuiButton-endIcon': {
                              transform: 'translateX(4px)',
                            },
                            transition: 'all 0.3s',
                          }}
                        >
                          Learn More
                        </Button>
                      </Card>
                    </Grow>
                  </Grid>
                ))}
              </Grid>
            </Container>
          </Box>

          <Divider sx={{ my: 8 }} />

          {/* Services Section */}
          <Box sx={{ py: 10, bgcolor: "background.default" }} id="services">
            <Container maxWidth="lg">
              <Box className={styles.sectionHeader}>
                <Typography variant="h2" className={styles.sectionTitle}>
                  Comprehensive Managed Services
                </Typography>
                <Typography variant="h5" className={styles.sectionSubtitle}>
                  We deliver enterprise-grade managed services with security operations at the core. From SOC monitoring to studio production, all services are backed by guaranteed availability and unified platform management.
                </Typography>
              </Box>
              <Grid container spacing={4}>
                {Object.entries(serviceDefinitions).map(([key, service], index) => (
                  <Grid item xs={12} sm={6} md={4} key={key}>
                    <Fade in timeout={600 + index * 100}>
                      <Box>
                        <ServiceCard service={{ ...service, key }} />
                      </Box>
                    </Fade>
                  </Grid>
                ))}
              </Grid>
              <Box sx={{ mt: 6, textAlign: 'center' }}>
                <Button
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => router.push('/demo')}
                  sx={{
                    bgcolor: 'primary.main',
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    '&:hover': {
                      bgcolor: 'primary.dark',
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.3s',
                  }}
                >
                  Explore All Services
                </Button>
              </Box>
            </Container>
          </Box>

          <Divider sx={{ my: 8 }} />

          {/* Unified Service Finder Quiz & Results */}
          <Box sx={{ py: 8 }} id="quiz">
            <Container maxWidth="lg">
              <ServiceFinderQuiz
                quizStep={quizStep}
                answers={answers}
                onAnswer={handleQuizAnswer}
                onNext={nextQuiz}
                onPrev={prevQuiz}
                onReset={resetQuiz}
                quizData={quizData}
                topServices={getTopScores()}
                onNav={(view) => {
                  const element = document.getElementById(view);
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            </Container>
          </Box>


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

              {/* Trust Badges */}
              <TrustBadges />

              {/* FAQ Section */}
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
                  Frequently Asked Questions
                </Typography>
                <Container maxWidth="md">
                  <FAQAccordion faqs={faqs} />
                </Container>
              </Box>
            </Container>
          </Box>

          <Divider sx={{ my: 8 }} />

          {/* Social Proof Section */}
          <Box sx={{ py: 10, mb: 8 }}>
            <Container maxWidth="lg">
              <Box className={styles.sectionHeader}>
                <Typography variant="h2" className={styles.sectionTitle}>
                  Trusted by Businesses Worldwide
                </Typography>
                <Typography variant="h5" className={styles.sectionSubtitle}>
                  Join hundreds of organizations transforming their digital infrastructure
                </Typography>
              </Box>

              {/* Testimonials */}
              <Grid container spacing={4} sx={{ mb: 8 }}>
                {testimonials.map((testimonial, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Grow in timeout={800 + index * 200}>
                      <Card className={styles.testimonialCard}>
                        <CardContent>
                          <Stack direction="row" spacing={1} mb={2}>
                            {[...Array(5)].map((_, i) => (
                              <StarIcon
                                key={i}
                                sx={{
                                  color: '#ffc107',
                                  fontSize: 20,
                                }}
                              />
                            ))}
                          </Stack>
                          <Typography
                            variant="body1"
                            sx={{ mb: 3, fontStyle: 'italic', flexGrow: 1, fontSize: '1.1rem', lineHeight: 1.7, position: 'relative', zIndex: 1 }}
                            color="text.secondary"
                          >
                            {testimonial.quote}
                          </Typography>
                          <Divider sx={{ my: 2 }} />
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar
                              sx={{
                                bgcolor: 'primary.main',
                                width: 48,
                                height: 48,
                              }}
                            >
                              {testimonial.author.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>
                                {testimonial.author}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {testimonial.role}
                              </Typography>
                            </Box>
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grow>
                  </Grid>
                ))}
              </Grid>
              <Box sx={{ textAlign: 'center', mt: 4 }}>
                <Button
                  variant="outlined"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => router.push('/demo')}
                  sx={{
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    px: 4,
                    '&:hover': {
                      borderColor: 'primary.dark',
                      bgcolor: 'primary.main',
                      color: 'white',
                    },
                  }}
                >
                  Read More Testimonials
                </Button>
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
                    <Button
                      variant="text"
                      size="large"
                      onClick={() => router.push('/about')}
                      sx={{
                        color: 'rgba(255, 255, 255, 0.9)',
                        minWidth: { xs: '100%', sm: 'auto' },
                        '&:hover': {
                          bgcolor: 'rgba(255, 255, 255, 0.1)',
                        },
                      }}
                    >
                      Learn More
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
