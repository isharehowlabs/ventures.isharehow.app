import React from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Stack,
  Avatar,
} from '@mui/material';
import {
  Security as SecurityIcon,
  CloudQueue as CloudIcon,
  MonitorHeart as MonitorIcon,
  SupportAgent as SupportIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
  Shield as ShieldIcon,
  Speed as SpeedIcon,
  VerifiedUser as VerifiedUserIcon,
  Business as BusinessIcon,
} from '@mui/icons-material';
import Head from 'next/head';
import AppShell from '../components/AppShell';

const MspPage = () => {
  const services = [
    {
      icon: <MonitorIcon />,
      title: 'Proactive Monitoring',
      description: '24/7/365 network and device monitoring to identify and resolve issues before they impact your business. We ensure maximum uptime and performance.',
      color: '#4f46e5',
    },
    {
      icon: <SecurityIcon />,
      title: 'Robust Cybersecurity',
      description: 'Multi-layered security protocols, including endpoint protection, firewall management, and threat intelligence to protect your data and infrastructure.',
      color: '#dc2626',
    },
    {
      icon: <CloudIcon />,
      title: 'Cloud & Backup Solutions',
      description: 'Secure cloud migration, management, and data backup/recovery services. Ensure business continuity and data integrity with our resilient solutions.',
      color: '#059669',
    },
  ];

  const techStack = [
    {
      icon: <CloudIcon />,
      title: 'Cloud Platforms',
      items: ['Microsoft Azure', 'Amazon Web Services (AWS)', 'Google Cloud Platform (GCP)', 'Microsoft 365 & Google Workspace'],
      color: '#3b82f6',
    },
    {
      icon: <ShieldIcon />,
      title: 'Security & Networking',
      items: ['Palo Alto, Fortinet, Cisco', 'CrowdStrike, SentinelOne', 'SIEM & SOAR Platforms', 'Zero Trust Architecture'],
      color: '#ef4444',
    },
    {
      icon: <SupportIcon />,
      title: 'Support & Operations',
      items: ['Datadog, New Relic', 'ServiceNow, Jira Service Desk', 'PowerShell, Python, Ansible', 'ITIL-based Frameworks'],
      color: '#10b981',
    },
  ];

  const features = [
    { icon: <SpeedIcon />, title: 'High Performance', description: 'Optimized infrastructure for peak performance' },
    { icon: <VerifiedUserIcon />, title: 'Enterprise Security', description: 'Bank-level security protocols' },
    { icon: <TrendingUpIcon />, title: 'Scalable Solutions', description: 'Grow with your business needs' },
    { icon: <BusinessIcon />, title: '24/7 Support', description: 'Round-the-clock technical assistance' },
  ];

  return (
    <>
      <Head>
        <title>About | iShareHow Labs LLC - Managed IT Services</title>
        <meta name="description" content="Comprehensive Managed IT Services by iShareHow Labs LLC. We provide proactive monitoring, robust security, and 24/7 support to keep your business running smoothly." />
        <meta name="keywords" content="managed services, MSP, IT support, cybersecurity, cloud services, iShareHow Labs, network management, IT consulting" />
      </Head>
      <AppShell active="about">
        <Box>
          {/* Hero Section */}
          <Paper
            elevation={0}
            sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                fontWeight: 800,
                mb: 2,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
              }}
            >
              Most powerful & developer friendly
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
              Managed IT Services
            </Typography>
            <Typography
              variant="h6"
              sx={{
                maxWidth: 700,
                mx: 'auto',
                mb: 4,
                opacity: 0.9,
                fontWeight: 400,
                fontSize: { xs: '1rem', md: '1.25rem' },
              }}
            >
              Empower your business with our proactive, secure, and scalable Managed IT Services. We handle your technology so you can focus on growth.
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap">
              <Button
                variant="contained"
                size="large"
                href="#contact"
                sx={{
                  bgcolor: 'white',
                  color: '#667eea',
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.9)',
                  },
                }}
              >
                Get Started
              </Button>
              <Button
                variant="outlined"
                size="large"
                href="#services"
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  fontWeight: 700,
                  px: 4,
                  py: 1.5,
                  '&:hover': {
                    borderColor: 'rgba(255,255,255,0.8)',
                    bgcolor: 'rgba(255,255,255,0.1)',
                  },
                }}
              >
                Learn More
              </Button>
            </Stack>
          </Paper>

          {/* Features Grid */}
          <Box sx={{ mb: 8 }}>
            <Grid container spacing={3}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Card
                    elevation={2}
                    sx={{
                      height: '100%',
                      textAlign: 'center',
                      p: 3,
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6,
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: 64,
                        height: 64,
                        mx: 'auto',
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
          </Box>

          {/* About Section */}
          <Box id="about" sx={{ mb: 8, textAlign: 'center' }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 2,
                fontSize: { xs: '1.75rem', md: '2.5rem' },
              }}
            >
              About iShareHow Labs
            </Typography>
            <Typography
              variant="h6"
              sx={{
                maxWidth: 800,
                mx: 'auto',
                mb: 4,
                color: 'text.secondary',
                fontWeight: 400,
                fontSize: { xs: '1rem', md: '1.25rem' },
              }}
            >
              <Box component="span" sx={{ fontWeight: 700, color: 'primary.main' }}>
                iShareHow Labs LLC
              </Box>{' '}
              provides forward-thinking Managed Service Provider (MSP) solutions designed for modern businesses. We specialize in integrating robust IT infrastructure, cybersecurity, and cloud services to create a seamless and secure operational environment.
            </Typography>
            <Paper
              elevation={2}
              sx={{
                p: 4,
                maxWidth: 900,
                mx: 'auto',
                borderLeft: '4px solid',
                borderColor: 'primary.main',
                bgcolor: 'background.paper',
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  fontStyle: 'italic',
                  fontSize: '1.1rem',
                  color: 'text.primary',
                }}
              >
                "Our philosophy is built on a foundation of proactive partnership. We don't just fix problems; we anticipate them. By aligning our technology strategy with your business goals, we become an extension of your team, dedicated to your success and security in the digital landscape."
              </Typography>
            </Paper>
          </Box>

          {/* Services Section */}
          <Box id="services" sx={{ mb: 8 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 1,
                textAlign: 'center',
                fontSize: { xs: '1.75rem', md: '2.5rem' },
              }}
            >
              Core Services
            </Typography>
            <Typography
              variant="body1"
              sx={{
                textAlign: 'center',
                mb: 5,
                color: 'text.secondary',
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              Discover powerful dozens of purpose-fit solutions for your business
            </Typography>
            <Grid container spacing={4}>
              {services.map((service, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Card
                    elevation={3}
                    sx={{
                      height: '100%',
                      p: 3,
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-8px)',
                        boxShadow: 8,
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: service.color,
                        width: 64,
                        height: 64,
                        mb: 3,
                      }}
                    >
                      {service.icon}
                    </Avatar>
                    <Typography variant="h5" fontWeight={600} gutterBottom>
                      {service.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {service.description}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Technology Stack */}
          <Box id="technology" sx={{ mb: 8 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 1,
                textAlign: 'center',
                fontSize: { xs: '1.75rem', md: '2.5rem' },
              }}
            >
              Technology Stack
            </Typography>
            <Typography
              variant="body1"
              sx={{
                textAlign: 'center',
                mb: 5,
                color: 'text.secondary',
                maxWidth: 600,
                mx: 'auto',
              }}
            >
              Built with industry-leading tools and platforms
            </Typography>
            <Grid container spacing={4}>
              {techStack.map((tech, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Card
                    elevation={2}
                    sx={{
                      height: '100%',
                      p: 3,
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 6,
                      },
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: tech.color,
                          width: 48,
                          height: 48,
                        }}
                      >
                        {tech.icon}
                      </Avatar>
                      <Typography variant="h6" fontWeight={600}>
                        {tech.title}
                      </Typography>
                    </Stack>
                    <Stack spacing={1}>
                      {tech.items.map((item, idx) => (
                        <Box key={idx} sx={{ display: 'flex', alignItems: 'center' }}>
                          <CheckCircleIcon
                            sx={{
                              fontSize: 18,
                              color: tech.color,
                              mr: 1,
                            }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {item}
                          </Typography>
                        </Box>
                      ))}
                    </Stack>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Contact Section */}
          <Box id="contact" sx={{ mb: 4 }}>
            <Paper
              elevation={3}
              sx={{
                p: { xs: 4, md: 6 },
                borderRadius: 3,
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                textAlign: 'center',
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  mb: 2,
                  fontSize: { xs: '1.75rem', md: '2.5rem' },
                }}
              >
                Get a Customized Quote
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  mb: 4,
                  opacity: 0.95,
                  fontWeight: 400,
                  maxWidth: 700,
                  mx: 'auto',
                }}
              >
                Ready to optimize your IT infrastructure? Contact us for a free consultation and a quote tailored to your business needs.
              </Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent="center"
                sx={{ mt: 4 }}
              >
                <Button
                  component="a"
                  href="https://isharehow.app"
                  target="_blank"
                  variant="contained"
                  size="large"
                  sx={{
                    bgcolor: 'white',
                    color: '#f5576c',
                    fontWeight: 700,
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.9)',
                    },
                  }}
                >
                  Learn More About iShareHow Labs
                </Button>
                <Button
                  component="a"
                  href="mailto:soc@isharehowlabs.com"
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    fontWeight: 700,
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      borderColor: 'rgba(255,255,255,0.8)',
                      bgcolor: 'rgba(255,255,255,0.1)',
                    },
                  }}
                >
                  Email for a Quote
                </Button>
              </Stack>
            </Paper>
          </Box>
        </Box>
      </AppShell>
    </>
  );
};

export default MspPage;
