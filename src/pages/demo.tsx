import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Paper,
  TextField,
  Alert,
  Divider,
  Chip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
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
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Speed as SpeedIcon,
  Shield as ShieldIcon,
  Schedule as ScheduleIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import Head from 'next/head';
import AppShell from '../components/AppShell';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
  benefits: string[];
}

const mbbaaSFeatures: Feature[] = [
  {
    icon: <CloudIcon sx={{ fontSize: 40 }} />,
    title: 'Infrastructure Management',
    description: 'Complete server provisioning, network configuration, and security management.',
    benefits: [
      'Optimal performance and scalability',
      'Enterprise-grade security',
      '24/7 monitoring and support',
      'Automated backups and disaster recovery',
    ],
  },
  {
    icon: <AnalyticsIcon sx={{ fontSize: 40 }} />,
    title: 'Data Analysis & Business Intelligence',
    description: 'Transform raw data into actionable insights with custom dashboards and predictive analytics.',
    benefits: [
      'Real-time data visualization',
      'Predictive analytics',
      'Custom reporting tools',
      'Trend identification and forecasting',
    ],
  },
  {
    icon: <SecurityIcon sx={{ fontSize: 40 }} />,
    title: 'Essential Services',
    description: 'Database administration, API management, and cloud service integration.',
    benefits: [
      'Database optimization',
      'API gateway management',
      'Cloud service integration',
      'Continuous monitoring',
    ],
  },
];

const creativeFeatures: Feature[] = [
  {
    icon: <BrushIcon sx={{ fontSize: 40 }} />,
    title: 'Brand Experience & UX/UI',
    description: 'Comprehensive branding, web design, and mobile app development services.',
    benefits: [
      'Brand identity development',
      'User experience optimization',
      'Mobile app design',
      'Content creation and strategy',
    ],
  },
  {
    icon: <AutoAwesomeIcon sx={{ fontSize: 40 }} />,
    title: 'Experience Strategy',
    description: 'Long-term planning to align digital experience with business objectives.',
    benefits: [
      'Strategic roadmapping',
      'User journey mapping',
      'Conversion optimization',
      'Brand alignment',
    ],
  },
  {
    icon: <TrendingUpIcon sx={{ fontSize: 40 }} />,
    title: 'UX/UI Audits & Optimization',
    description: 'Continuous analysis and data-driven recommendations to improve user experience.',
    benefits: [
      'Comprehensive UX audits',
      'User testing and research',
      'Data-driven recommendations',
      'Performance optimization',
    ],
  },
];

const whyChooseUs = [
  {
    icon: <SpeedIcon />,
    title: 'Fast Implementation',
    description: 'Get up and running quickly with our streamlined processes.',
  },
  {
    icon: <ShieldIcon />,
    title: 'Enterprise Security',
    description: 'Bank-level security and compliance standards.',
  },
  {
    icon: <CheckCircleIcon />,
    title: 'Proven Track Record',
    description: 'Successfully delivered projects for diverse industries.',
  },
  {
    icon: <RocketLaunchIcon />,
    title: 'Scalable Solutions',
    description: 'Built to grow with your business needs.',
  },
];

export default function DemoPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    if (!formData.name || !formData.email || !formData.company) {
      setError('Please fill in all required fields.');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    try {
      // TODO: Integrate with backend API or email service
      // For now, we'll just show success message
      console.log('Demo request submitted:', formData);
      setSubmitted(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          company: '',
          phone: '',
          message: '',
        });
        setSubmitted(false);
      }, 5000);
    } catch (err) {
      setError('Failed to submit request. Please try again or contact us directly.');
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <>
      <Head>
        <title>Book Your Demo - iShareHow Ventures</title>
        <meta
          name="description"
          content="Schedule a demo to see how iShareHow Ventures can transform your business with our mBaaS and creative services."
        />
      </Head>
      <AppShell active="demo">
        <Box
          sx={{
            minHeight: '100vh',
            background: isMobile
              ? 'linear-gradient(180deg, rgba(99, 102, 241, 0.05) 0%, rgba(255, 255, 255, 0) 100%)'
              : 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 50%, rgba(236, 72, 153, 0.05) 100%)',
          }}
        >
          {/* Hero Section */}
          <Container maxWidth="lg" sx={{ pt: 8, pb: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Chip
                label="Schedule Your Demo"
                color="primary"
                sx={{ mb: 3, fontSize: '0.875rem', fontWeight: 600, py: 2.5, px: 1 }}
                icon={<ScheduleIcon />}
              />
              <Typography
                variant={isMobile ? 'h3' : 'h2'}
                component="h1"
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                See iShareHow in Action
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ maxWidth: 800, mx: 'auto', mb: 4 }}
              >
                Discover how our mBaaS platform and creative services can transform your business.
                Book a personalized demo to explore features, benefits, and see real results.
              </Typography>
            </Box>

            {/* Quick Stats */}
            <Grid container spacing={3} sx={{ mb: 8 }}>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                  <Typography variant="h3" color="primary" fontWeight={700}>
                    100+
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Projects Delivered
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                  <Typography variant="h3" color="primary" fontWeight={700}>
                    24/7
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Support Available
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                  <Typography variant="h3" color="primary" fontWeight={700}>
                    99.9%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Uptime Guarantee
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Container>

          {/* Features Section */}
          <Container maxWidth="lg" sx={{ py: 6 }}>
            <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 1, textAlign: 'center' }}>
              Mobile Backend as a Service (mBaaS)
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 6, textAlign: 'center', maxWidth: 700, mx: 'auto' }}
            >
              Complete infrastructure and data management solutions for modern applications
            </Typography>

            <Grid container spacing={4} sx={{ mb: 8 }}>
              {mbbaaSFeatures.map((feature, index) => (
                <Grid item xs={12} md={4} key={index}>
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
                      <Box sx={{ color: 'primary.main', mb: 2 }}>{feature.icon}</Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {feature.description}
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <Stack spacing={1}>
                        {feature.benefits.map((benefit, i) => (
                          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                            <Typography variant="body2" fontSize="0.875rem">
                              {benefit}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 1, textAlign: 'center', mt: 8 }}>
              Creative Services
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mb: 6, textAlign: 'center', maxWidth: 700, mx: 'auto' }}
            >
              Brand experience, UX/UI design, and digital strategy services
            </Typography>

            <Grid container spacing={4} sx={{ mb: 8 }}>
              {creativeFeatures.map((feature, index) => (
                <Grid item xs={12} md={4} key={index}>
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
                      <Box sx={{ color: 'primary.main', mb: 2 }}>{feature.icon}</Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {feature.description}
                      </Typography>
                      <Divider sx={{ my: 2 }} />
                      <Stack spacing={1}>
                        {feature.benefits.map((benefit, i) => (
                          <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                            <Typography variant="body2" fontSize="0.875rem">
                              {benefit}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Container>

          {/* Why Choose Us */}
          <Box
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              py: 8,
            }}
          >
            <Container maxWidth="lg">
              <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 6, textAlign: 'center' }}>
                Why Choose iShareHow Ventures?
              </Typography>
              <Grid container spacing={4}>
                {whyChooseUs.map((item, index) => (
                  <Grid item xs={12} sm={6} md={3} key={index}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center', color: 'white' }}>
                        <Box sx={{ fontSize: 48, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {item.icon}
                        </Box>
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {item.description}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Container>
          </Box>

          {/* Booking Form */}
          <Container maxWidth="md" sx={{ py: 8 }}>
            <Paper
              elevation={4}
              sx={{
                p: 4,
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
              }}
            >
              <Typography variant="h4" component="h2" sx={{ fontWeight: 700, mb: 1, textAlign: 'center' }}>
                Book Your Demo
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
                Fill out the form below and we'll contact you to schedule a personalized demo
              </Typography>

              {submitted && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  Thank you! We've received your request. Our team will contact you within 24 hours to schedule your
                  demo.
                </Alert>
              )}

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <form onSubmit={handleSubmit}>
                <Stack spacing={3}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    required
                    value={formData.name}
                    onChange={handleChange('name')}
                    placeholder="John Doe"
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange('email')}
                    placeholder="john@company.com"
                    InputProps={{
                      startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Company Name"
                    required
                    value={formData.company}
                    onChange={handleChange('company')}
                    placeholder="Your Company Inc."
                    InputProps={{
                      startAdornment: <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Phone Number"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange('phone')}
                    placeholder="+1 (555) 123-4567"
                    InputProps={{
                      startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                  <TextField
                    fullWidth
                    label="Message (Optional)"
                    multiline
                    rows={4}
                    value={formData.message}
                    onChange={handleChange('message')}
                    placeholder="Tell us about your project or any specific features you'd like to see..."
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    sx={{ py: 1.5, fontSize: '1.1rem', fontWeight: 600 }}
                    startIcon={<ScheduleIcon />}
                    disabled={submitted}
                  >
                    {submitted ? 'Request Submitted!' : 'Schedule Demo'}
                  </Button>
                </Stack>
              </form>
            </Paper>
          </Container>
        </Box>
      </AppShell>
    </>
  );
}

