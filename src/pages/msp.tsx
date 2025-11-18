import React from 'react';
import { Box, Typography, Button, Card, CardContent, Grid, Paper } from '@mui/material';
import Head from 'next/head';
import AppShell from '../components/AppShell';

const MspPage = () => {
  const colors = {
    primary: '#e0e0e0',
    secondary: '#a0a0a0',
    accent: '#3498db',
    accent2: '#00fff7',
    light: '#121212',
    gray: '#1e1e1e',
    pink: '#ff00cc',
  };


  return (
    <>
      <Head>
        <title>About | iShareHow Labs LLC - Managed IT Services</title>
        <meta name="description" content="Comprehensive Managed IT Services by iShareHow Labs LLC. We provide proactive monitoring, robust security, and 24/7 support to keep your business running smoothly." />
        <meta name="keywords" content="managed services, MSP, IT support, cybersecurity, cloud services, iShareHow Labs, network management, IT consulting" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron&display=swap" rel="stylesheet" />
      </Head>
      <AppShell active="about">
        <Box sx={{
          fontFamily: "'Inter', sans-serif",
          lineHeight: 1.6,
        }}>
          {/* Hero Section */}
          <Paper
            elevation={3}
            sx={{
              background: `linear-gradient(120deg, ${colors.accent2} 0%, ${colors.pink} 100%)`,
              padding: { xs: '3rem 1rem', md: '4rem 2rem' },
              textAlign: 'center',
              mb: 4,
              borderRadius: 2,
            }}
          >
            <Typography
              variant="h2"
              sx={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                fontWeight: 900,
                mb: 2,
                color: '#181a20',
                textShadow: `0 0 24px ${colors.pink}, 0 0 48px ${colors.accent2}`,
                letterSpacing: '2px',
              }}
            >
              Comprehensive IT & Managed Services
            </Typography>
            <Typography
              sx={{
                fontSize: { xs: '1rem', md: '1.25rem' },
                color: '#181a20',
                maxWidth: '800px',
                margin: '0 auto',
                textShadow: `0 0 8px ${colors.accent2}`,
              }}
            >
              Empower your business with our proactive, secure, and scalable Managed IT Services. We handle your technology so you can focus on growth.
            </Typography>
          </Paper>

          {/* Sections */}
          <Box sx={{ maxWidth: 'lg', mx: 'auto' }}>
          {/* About */}
          <Box id="about" component="section" sx={{ py: 4, textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h3"
              sx={{
                fontFamily: "'Orbitron', sans-serif",
                fontWeight: 700,
                mb: 3,
                fontSize: { xs: '1.75rem', md: '2.5rem' },
              }}
            >
              MSP::OVERVIEW
            </Typography>
            <Typography sx={{ maxWidth: '800px', margin: '0 auto 2rem', fontSize: '1.1rem' }}>
              <Typography component="span" sx={{ fontWeight: 'bold', color: 'primary.main' }}>iShareHow Labs LLC</Typography> provides forward-thinking Managed Service Provider (MSP) solutions designed for modern businesses. We specialize in integrating robust IT infrastructure, cybersecurity, and cloud services to create a seamless and secure operational environment. Our mission is to optimize your technology, mitigate risks, and provide a platform for sustainable growth.
            </Typography>
          </Box>

          {/* Why Us */}
          <Box id="why-us" component="section" sx={{ py: 4, textAlign: 'center', mb: 4 }}>
            <Typography
              variant="h3"
              sx={{
                fontFamily: "'Orbitron', sans-serif",
                fontWeight: 700,
                mb: 3,
                fontSize: { xs: '1.75rem', md: '2.5rem' },
              }}
            >
              WHY::iShareHow Labs
            </Typography>
            <Box sx={{ maxWidth: '900px', margin: '0 auto' }}>
              <Paper
                elevation={2}
                sx={{
                  fontStyle: 'italic',
                  fontWeight: 500,
                  borderLeft: `4px solid`,
                  borderColor: 'primary.main',
                  padding: '2rem',
                  margin: '2rem 0',
                  fontSize: '1.1rem',
                  bgcolor: 'background.paper',
                }}
              >
                "Our philosophy is built on a foundation of proactive partnership. We don't just fix problems; we anticipate them. By aligning our technology strategy with your business goals, we become an extension of your team, dedicated to your success and security in the digital landscape."
              </Paper>
            </Box>
          </Box>

          {/* Services */}
          <Box id="services" component="section" sx={{ py: 4, mb: 4 }}>
            <Typography
              variant="h3"
              sx={{
                fontFamily: "'Orbitron', sans-serif",
                fontWeight: 700,
                mb: 3,
                textAlign: 'center',
                fontSize: { xs: '1.75rem', md: '2.5rem' },
              }}
            >
              CORE::SERVICES
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    height: '100%',
                    background: 'linear-gradient(120deg, #23263a 60%, #181a20 100%)',
                    border: `1px solid ${colors.accent2}`,
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 0 24px ${colors.accent2}aa`,
                    },
                  }}
                >
                  <CardContent>
                    <Typography variant="h5" sx={{ fontSize: '1.5rem', mb: 1, color: colors.accent }}>Proactive Monitoring</Typography>
                    <Typography sx={{ fontSize: '1rem', color: colors.secondary }}>24/7/365 network and device monitoring to identify and resolve issues before they impact your business. We ensure maximum uptime and performance.</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    height: '100%',
                    background: 'linear-gradient(120deg, #23263a 60%, #181a20 100%)',
                    border: `1px solid ${colors.accent2}`,
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 0 24px ${colors.accent2}aa`,
                    },
                  }}
                >
                  <CardContent>
                    <Typography variant="h5" sx={{ fontSize: '1.5rem', mb: 1, color: colors.accent }}>Robust Cybersecurity</Typography>
                    <Typography sx={{ fontSize: '1rem', color: colors.secondary }}>Multi-layered security protocols, including endpoint protection, firewall management, and threat intelligence to protect your data and infrastructure.</Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    height: '100%',
                    background: 'linear-gradient(120deg, #23263a 60%, #181a20 100%)',
                    border: `1px solid ${colors.accent2}`,
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 0 24px ${colors.accent2}aa`,
                    },
                  }}
                >
                  <CardContent>
                    <Typography variant="h5" sx={{ fontSize: '1.5rem', mb: 1, color: colors.accent }}>Cloud & Backup Solutions</Typography>
                    <Typography sx={{ fontSize: '1rem', color: colors.secondary }}>Secure cloud migration, management, and data backup/recovery services. Ensure business continuity and data integrity with our resilient solutions.</Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* Technology */}
          <Box id="technology" component="section" sx={{ py: 4, mb: 4 }}>
            <Typography
              variant="h3"
              sx={{
                fontFamily: "'Orbitron', sans-serif",
                fontWeight: 700,
                mb: 3,
                textAlign: 'center',
                fontSize: { xs: '1.75rem', md: '2.5rem' },
              }}
            >
              TECHNOLOGY::STACK
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    height: '100%',
                    background: 'linear-gradient(120deg, #23263a 60%, #181a20 100%)',
                    border: `1px solid ${colors.accent2}`,
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 0 24px ${colors.accent2}aa`,
                    },
                  }}
                >
                  <CardContent>
                    <Typography variant="h5" sx={{ fontSize: '1.5rem', mb: 1, color: colors.accent }}>Cloud Platforms</Typography>
                    <Box component="ul" sx={{ listStyle: 'none', padding: 0, textAlign: 'left', color: colors.secondary }}>
                      <li>→ Microsoft Azure</li>
                      <li>→ Amazon Web Services (AWS)</li>
                      <li>→ Google Cloud Platform (GCP)</li>
                      <li>→ Microsoft 365 & Google Workspace</li>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    height: '100%',
                    background: 'linear-gradient(120deg, #23263a 60%, #181a20 100%)',
                    border: `1px solid ${colors.accent2}`,
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 0 24px ${colors.accent2}aa`,
                    },
                  }}
                >
                  <CardContent>
                    <Typography variant="h5" sx={{ fontSize: '1.5rem', mb: 1, color: colors.accent }}>Security & Networking</Typography>
                    <Box component="ul" sx={{ listStyle: 'none', padding: 0, textAlign: 'left', color: colors.secondary }}>
                      <li>→ Palo Alto, Fortinet, Cisco</li>
                      <li>→ CrowdStrike, SentinelOne</li>
                      <li>→ SIEM & SOAR Platforms</li>
                      <li>→ Zero Trust Architecture</li>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card
                  sx={{
                    height: '100%',
                    background: 'linear-gradient(120deg, #23263a 60%, #181a20 100%)',
                    border: `1px solid ${colors.accent2}`,
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 0 24px ${colors.accent2}aa`,
                    },
                  }}
                >
                  <CardContent>
                    <Typography variant="h5" sx={{ fontSize: '1.5rem', mb: 1, color: colors.accent }}>Support & Operations</Typography>
                    <Box component="ul" sx={{ listStyle: 'none', padding: 0, textAlign: 'left', color: colors.secondary }}>
                      <li>→ Datadog, New Relic</li>
                      <li>→ ServiceNow, Jira Service Desk</li>
                      <li>→ PowerShell, Python, Ansible</li>
                      <li>→ ITIL-based Frameworks</li>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* Contact */}
          <Box id="contact" component="section" sx={{ py: 4, mb: 4 }}>
            <Typography
              variant="h3"
              sx={{
                fontFamily: "'Orbitron', sans-serif",
                fontWeight: 700,
                mb: 2,
                textAlign: 'center',
                fontSize: { xs: '1.75rem', md: '2.5rem' },
              }}
            >
              GET A CUSTOMIZED QUOTE
            </Typography>
            <Typography sx={{ textAlign: 'center', mb: 4, fontSize: '1.1rem' }}>
              Ready to optimize your IT infrastructure? Contact us for a free consultation and a quote tailored to your business needs.
            </Typography>
            <Grid container spacing={4} justifyContent="center">
              <Grid item xs={12} md={8}>
                <Card
                  sx={{
                    background: 'linear-gradient(120deg, #23263a 60%, #181a20 100%)',
                    border: `1px solid ${colors.accent2}`,
                    boxShadow: `0 0 24px ${colors.accent2}aa`,
                  }}
                >
                  <CardContent>
                    <Typography variant="h5" sx={{ fontSize: '1.5rem', mb: 2, color: colors.accent }}>CONTACT::PROTOCOLS</Typography>
                    <Typography sx={{ fontSize: '1.1rem', mb: 3, color: colors.secondary }}>
                      Connect with our team to discuss your IT challenges and goals. We're available via Discord for real-time chat or through our official contact channels for formal inquiries.
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <Button
                        component="a"
                        href="https://isharehow.app/discord"
                        target="_blank"
                        variant="contained"
                        sx={{
                          background: `linear-gradient(90deg, ${colors.accent} 0%, ${colors.accent2} 100%)`,
                          color: '#181a20',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          '&:hover': {
                            background: `linear-gradient(90deg, ${colors.accent2} 0%, ${colors.accent} 100%)`,
                          },
                        }}
                      >
                        Join Our Discord
                      </Button>
                      <Button
                        component="a"
                        href="mailto:support@isharehow.app"
                        variant="contained"
                        sx={{
                          background: `linear-gradient(90deg, ${colors.accent} 0%, ${colors.accent2} 100%)`,
                          color: '#181a20',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          '&:hover': {
                            background: `linear-gradient(90deg, ${colors.accent2} 0%, ${colors.accent} 100%)`,
                          },
                        }}
                      >
                        Email for a Quote
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
          </Box>
        </Box>
      </AppShell>
    </>
  );
};

export default MspPage;
