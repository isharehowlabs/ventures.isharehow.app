// UNIQUE_BUILD_TEST_2025_OCT_24_V3
import React, { useState } from 'react';
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
        <title>iShareHow Labs - Empowering Your Vision with Managed Solutions</title>
        <link rel="canonical" href="https://ventures.isharehow.app/" />
        <meta
          name="description"
          content="Tired of juggling complex IT back-ends, unpredictable creative hiring, and scattered digital strategies? iShareHow Labs offers an integrated ecosystem of Managed Services, Creative-as-a-Service, and Strategic Intelligence designed to be the robust foundation for your business growth."
        />
        <meta
          name="keywords"
          content="managed services, creative as a service, SaaS, infrastructure, pricing, subscription, plans, starter, professional, enterprise, iShareHow Labs"
        />
      </Head>

      <AppShell active="home">
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
          {/* Hero Section */}
          <Paper
            elevation={0}
            sx={{
              color: "primary.main",
              borderRadius: 0,
              p: { xs: 4, md: 8 },
              mb: 6,
              textAlign: 'center',
            }}
          >
            <Container maxWidth="lg">
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 900,
                  mb: 2,
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
                }}
              >
                iShareHow Labs
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                  opacity: 0.95,
                }}
              >
                Empowering Your Vision with Managed Solutions
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  mb: 4,
                  fontSize: { xs: '1rem', sm: '1.25rem', md: '1.5rem' },
                  opacity: 0.9,
                }}
              >
                Your Dedicated Infrastructure Provider for Next-Level Success
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  maxWidth: 900,
                  mx: 'auto',
                  mb: 4,
                  opacity: 0.95,
                  fontWeight: 400,
                  fontSize: { xs: '1rem', md: '1.25rem' },
                }}
              >
                Tired of juggling complex IT back-ends, unpredictable creative hiring, and scattered digital strategies? iShareHow Labs offers an integrated ecosystem of Managed Services, Creative-as-a-Service, and Strategic Intelligence designed to be the robust foundation for your business growth.
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  maxWidth: 700,
                  mx: 'auto',
                  mb: 4,
                  opacity: 0.9,
                  fontSize: { xs: '0.95rem', md: '1.1rem' },
                  fontStyle: 'italic',
                }}
              >
                We're here to support your dream with our tailored solutions.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => router.push('/demo')}
                sx={{
                  bgcolor: 'white',
                  color: '#6366F1',
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  fontSize: '1.1rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)',
                  },
                }}
              >
                Contact Us to Start Your Project Today
              </Button>
            </Container>
          </Paper>

          {/* SaaS Section */}
          <Box id="saas" sx={{ mb: 8 }}>
            <Container maxWidth="lg">
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  textAlign: 'center',
                  fontSize: { xs: '1.75rem', md: '2.5rem' },
                  color: "primary.main",
                }}
              >
                SaaS
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  textAlign: 'center',
                  color: 'text.primary',
                }}
              >
                Your Indispensable, Dedicated Infrastructure Provider
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  textAlign: 'center',
                  mb: 5,
                  color: 'text.secondary',
                  maxWidth: 800,
                  mx: 'auto',
                  fontSize: '1.1rem',
                }}
              >
                We meticulously manage all critical aspects of your project's back-end, ensuring a robust and efficient foundation for your success, allowing you to focus on client delivery and core business.
              </Typography>

              <Grid container spacing={3} sx={{ mb: 5 }}>
                {mbbaaSFeatures.map((feature, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Card
                      elevation={2}
                      sx={{
                        height: '100%',
                        p: 3,
                        transition: 'transform 0.3s, box-shadow 0.3s',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: 6,
                        },
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: 'primary.main',
                          width: 56,
                          height: 56,
                          mb: 2,
                        }}
                      >
                        {feature.icon}
                      </Avatar>
                      <Typography variant="h6" fontWeight={600} gutterBottom>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Container>
          </Box>

          <Divider sx={{ my: 8 }} />

          {/* Creative Services Section */}
          <Box id="creative" sx={{ mb: 8 }}>
            <Container maxWidth="lg">
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  textAlign: 'center',
                  fontSize: { xs: '1.75rem', md: '2.5rem' },
                  color: "primary.main",
                }}
              >
                Experience & Design Services
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  textAlign: 'center',
                  color: 'text.primary',
                  fontStyle: 'italic',
                }}
              >
                Creative-as-a-Service
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  mb: 3,
                  textAlign: 'center',
                  color: 'text.secondary',
                }}
              >
                Visionary Ideas. Fearless Creativity. Bold Innovation.
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  textAlign: 'center',
                  mb: 5,
                  color: 'text.secondary',
                  maxWidth: 800,
                  mx: 'auto',
                  fontSize: '1.1rem',
                }}
              >
                Get the strategic creative leadership of an agency combined with the predictable, scalable structure of a Managed Service Provider (MSP). We focus on digital brand experience to drive next-level results.
              </Typography>

              <Grid container spacing={3} sx={{ mb: 4 }}>
                {creativeServices.map((service, index) => (
                  <Grid item xs={12} md={6} key={index}>
                    <Card
                      elevation={2}
                      sx={{
                        height: '100%',
                        p: 3,
                        transition: 'transform 0.3s, box-shadow 0.3s',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: 6,
                        },
                      }}
                    >
                      <Stack direction="row" spacing={2}>
                        <Avatar
                          sx={{
                            bgcolor: 'secondary.main',
                            width: 56,
                            height: 56,
                          }}
                        >
                          {service.icon}
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" fontWeight={600} gutterBottom>
                            {service.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {service.description}
                          </Typography>
                        </Box>
                      </Stack>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              <Paper
                elevation={2}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
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
              </Paper>
            </Container>
          </Box>

          <Divider sx={{ my: 8 }} />

          {/* iShareHow Divisions Section */}
          <Box id="isharehow" sx={{ mb: 8 }}>
            <Container maxWidth="lg">
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  textAlign: 'center',
                  fontSize: { xs: '1.75rem', md: '2.5rem' },
                  color: "primary.main",
                }}
              >
                iShareHow
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  textAlign: 'center',
                  mb: 5,
                  color: 'text.secondary',
                  maxWidth: 800,
                  mx: 'auto',
                  fontSize: '1.1rem',
                }}
              >
                We develop and distribute compelling content through our iShareHow YT Channel and publishing division.
              </Typography>

              <Grid container spacing={4}>
                {iShareHowDivisions.map((division, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Card
                      elevation={3}
                      sx={{
                        height: '100%',
                        p: 4,
                        background: `linear-gradient(135deg, ${division.color}15, ${division.color}05)`,
                        border: '1px solid',
                        borderColor: `${division.color}30`,
                        transition: 'transform 0.3s, box-shadow 0.3s',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: 8,
                        },
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: division.color,
                          width: 64,
                          height: 64,
                          mb: 3,
                        }}
                      >
                        {division.icon}
                      </Avatar>
                      <Typography variant="h5" fontWeight={700} gutterBottom>
                        {division.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {division.description}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Container>
          </Box>

          <Divider sx={{ my: 8 }} />

          {/* Services Section */}
          <Box sx={{ py: 8, bgcolor: "background.default" }} id="services">
            <Container maxWidth="lg">
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  textAlign: 'center',
                  fontSize: { xs: '1.75rem', md: '2.5rem' },
                  color: "primary.main",
                }}
              >
                Comprehensive Managed Services
              </Typography>
              <Typography
                variant="h5"
                color="text.secondary"
                textAlign="center"
                sx={{ mb: 6, fontWeight: 500 }}
              >
                We deliver enterprise-grade managed services with security operations at the core. From SOC monitoring to studio production, all services are backed by guaranteed availability and unified platform management. We're building the future of managed services by combining Security Operations Center (SOC)
          expertise with a comprehensive SaaS platform. Our mission is to become the best SOC company
          while delivering end-to-end managed services across infrastructure, security, production,
          applications, and support.
              </Typography>
              <Grid container spacing={6}>
                {Object.entries(serviceDefinitions).map(([key, service]) => (
                  <Grid item xs={12} sm={6} md={4} key={key}>
                    <ServiceCard service={{ ...service, key }} />
                  </Grid>
                ))}
              </Grid>
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
          <Box id="pricing" sx={{ mb: 8 }}>
            <Container maxWidth="lg">
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  textAlign: 'center',
                  fontSize: { xs: '1.75rem', md: '2.5rem' },
                  color: "primary.main",
                }}
              >
                Pricing That Scales With Your Business
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  textAlign: 'center',
                  fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
                  color: 'text.primary',
                }}
              >
                Choose the plan that works best for your creative goals
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 4,
                  textAlign: 'center',
                  fontSize: { xs: '1rem', md: '1.25rem' },
                  color: 'text.secondary',
                }}
              >
                NO HIDDEN FEES. NO SURPRISES.
              </Typography>

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
          <Box sx={{ mb: 8 }}>
            <Container maxWidth="lg">
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  textAlign: 'center',
                  fontSize: { xs: '1.75rem', md: '2.5rem' },
                  color: "primary.main",
                }}
              >
                Trusted by Businesses Worldwide
              </Typography>
              <Grid container spacing={4} sx={{ mb: 6 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                    <Typography variant="h3" color="primary" fontWeight={700}>
                      100+
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Projects Delivered
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                    <Typography variant="h3" color="primary" fontWeight={700}>
                      24/7
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Support Available
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                    <Typography variant="h3" color="primary" fontWeight={700}>
                      AI
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Support Guarantee
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                    <Typography variant="h3" color="primary" fontWeight={700}>
                      2X
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average Design Output
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Testimonials */}
              <Typography
                variant="h4"
                gutterBottom
                textAlign="center"
                sx={{ mb: 6, fontWeight: 700, color: 'primary.main' }}
              >
                What Our Users Say
              </Typography>
              <Grid container spacing={4} sx={{ mb: 4 }}>
                {testimonials.map((testimonial, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Card
                      elevation={4}
                      sx={{
                        p: 4,
                        borderRadius: 3,
                        transition: 'transform 0.3s',
                        '&:hover': { transform: 'translateY(-4px)' },
                        height: '100%',
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{ mb: 2, fontStyle: 'italic', flexGrow: 1, fontSize: '1.1rem' }}
                        color="text.secondary"
                      >
                        "{testimonial.quote}"
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <Typography variant="subtitle2" fontWeight={600}>
                        {testimonial.author}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {testimonial.role}
                      </Typography>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Container>
          </Box>

          {/* Final CTA Section */}
          <Box id="contact" sx={{ mb: 4 }}>
            <Container maxWidth="lg">
              <Paper
                elevation={3}
                sx={{
                  p: { xs: 4, md: 8 },
                  borderRadius: 3,
                  color: "primary.main",
                  textAlign: 'center',
                }}
              >
                <Typography
                  variant="h3"
                  sx={{
                    fontWeight: 800,
                    mb: 2,
                    fontSize: { xs: '1.75rem', md: '2.5rem' },
                  }}
                >
                  Ready to Transform Your Aspirations into Tangible Achievements?
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    mb: 4,
                    opacity: 0.95,
                    fontWeight: 400,
                    maxWidth: 800,
                    mx: 'auto',
                    fontSize: { xs: '1rem', md: '1.25rem' },
                  }}
                >
                  Trust iShareHow Labs and our advanced AI app ecosystem to provide the technical backbone and strategic insights that will ensure your competitive edge in today's dynamic market.
                </Typography>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  justifyContent="center"
                  sx={{ mt: 4 }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => router.push('/demo')}
                    sx={{
                      bgcolor: 'white',
                      color: '#6366F1',
                      fontWeight: 700,
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.9)',
                      },
                    }}
                  >
                    Contact Us to Start Your Project Today
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => router.push('/demo?tier=enterprise')}
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      fontWeight: 700,
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      '&:hover': {
                        borderColor: 'rgba(255,255,255,0.8)',
                        bgcolor: 'rgba(255,255,255,0.1)',
                      },
                    }}
                  >
                    Contact Sales
                  </Button>
                </Stack>
              </Paper>
            </Container>
          </Box>
        </Box>
      </AppShell>
    </>
  );
};

export default HomePage;
