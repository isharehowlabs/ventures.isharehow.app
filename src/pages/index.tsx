// UNIQUE_BUILD_TEST_2025_OCT_24_V3
import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  Grid,
  Paper,
  Stack,
  Avatar,
  Divider,
  Container,
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
  Shield as ShieldIcon,
  Speed as SpeedIcon,
} from '@mui/icons-material';
import Head from 'next/head';
import AppShell from '../components/AppShell';

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

const HomePage = () => (
  <>
    <Head>
      <title>iShareHow Labs - Empowering Your Vision with Managed Solutions</title>
      <meta
        name="description"
        content="iShareHow Labs: Your Dedicated Infrastructure Provider for Next-Level Success. Integrated ecosystem of Managed Services, Creative-as-a-Service, and Strategic Intelligence."
      />
      <meta
        name="keywords"
        content="iShareHow Labs, managed services, MSP, creative services, SaaS, MBBaaS, infrastructure provider, business intelligence, UX/UI design, content creation"
      />
    </Head>

    <AppShell active="about">
      <Box>
        <Paper
          elevation={0}
          sx={{
            background: 'linear-gradient(135deg, #22D3EE 0%, #6366F1 100%)',
            borderRadius: 3,
            p: { xs: 4, md: 8 },
            mb: 6,
            textAlign: 'center',
            color: 'white',
          }}
        >
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
            href="/demo"
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
        </Paper>

        <Box id="saas" sx={{ mb: 8 }}>
          <Container maxWidth="lg">
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 2,
                textAlign: 'center',
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                background: 'linear-gradient(90deg, #22D3EE, #6366F1)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
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

            <Paper
              elevation={2}
              sx={{
                p: 4,
                borderRadius: 3,
                background: 'linear-gradient(135deg, rgba(34,211,238,0.1), rgba(99,102,241,0.1))',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                MBBaaS Investment
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Total Estimated Value
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="primary.main">
                      $4,997
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Tier 1 Access
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Premium Upgrade
                    </Typography>
                    <Typography variant="h5" fontWeight={700} color="secondary.main">
                      +$2,500
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      1-on-1 Coaching
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Payment Terms
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      50% upfront, 50% upon 45-day milestone review.
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Container>
      </Box>

        <Divider sx={{ my: 8 }} />

        <Box id="creative" sx={{ mb: 8 }}>
          <Container maxWidth="lg">
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 2,
                textAlign: 'center',
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                background: 'linear-gradient(90deg, #22D3EE, #6366F1)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
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

        <Box id="isharehow" sx={{ mb: 8 }}>
          <Container maxWidth="lg">
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 2,
                textAlign: 'center',
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                background: 'linear-gradient(90deg, #22D3EE, #6366F1)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
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

        <Box id="features" sx={{ mb: 8 }}>
          <Container maxWidth="lg">
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 2,
                textAlign: 'center',
                fontSize: { xs: '1.75rem', md: '2.5rem' },
                background: 'linear-gradient(90deg, #22D3EE, #6366F1)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Key Features of Our Integrated Ecosystem
            </Typography>

            <Grid container spacing={4}>
              {keyFeatures.map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card
                    elevation={2}
                    sx={{
                      height: '100%',
                      p: 3,
                      textAlign: 'center',
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: 6,
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: feature.color,
                        width: 64,
                        height: 64,
                        mx: 'auto',
                        mb: 2,
                      }}
                    >
                      {feature.icon}
                    </Avatar>
                    <Typography variant="h6" fontWeight={700} gutterBottom>
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

        <Box id="contact" sx={{ mb: 4 }}>
          <Container maxWidth="lg">
            <Paper
              elevation={3}
              sx={{
                p: { xs: 4, md: 8 },
                borderRadius: 3,
                background: 'linear-gradient(135deg, #22D3EE 0%, #6366F1 100%)',
                color: 'white',
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
                  component="a"
                  href="/demo"
                  variant="contained"
                  size="large"
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
                  component="a"
                  href="https://isharehow.app"
                  target="_blank"
                  variant="outlined"
                  size="large"
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
                  Learn More About iShareHow
                </Button>
              </Stack>
            </Paper>
          </Container>
          </Box>
      </Box>
    </AppShell>
  </>
  );

export default HomePage;
