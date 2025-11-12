import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Button, Card, CardContent, Grid, Link as MuiLink } from '@mui/material';
import Head from 'next/head';

const MspPage = () => {
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const colors = {
    primary: '#e0e0e0',
    secondary: '#a0a0a0',
    accent: '#3498db',
    accent2: '#00fff7',
    light: '#121212',
    gray: '#1e1e1e',
    pink: '#ff00cc',
  };

  const cardStyle = {
    background: 'linear-gradient(120deg, #23263a 60%, #181a20 100%)',
    padding: '2rem',
    textAlign: 'center',
    borderRadius: '8px',
    boxShadow: `0 0 24px ${colors.accent2}aa, 0 2px 4px -1px ${colors.pink}44`,
    border: `1px solid ${colors.accent2}`,
    transition: 'transform 0.3s, box-shadow 0.3s, border-color 0.3s',
    color: colors.accent,
    position: 'relative',
    overflow: 'hidden',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    '&:hover': {
      transform: 'scale(1.04) translateY(-8px)',
      boxShadow: `0 0 48px ${colors.pink}aa, 0 0 24px ${colors.accent2}cc`,
      borderColor: colors.pink,
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '-40%',
      left: '-40%',
      width: '180%',
      height: '180%',
      background: `radial-gradient(circle, ${colors.pink}44 0%, ${colors.accent2}44 100%)`,
      opacity: 0.12,
      zIndex: 0,
    },
    '& > *': {
      position: 'relative',
      zIndex: 1,
    }
  };

  const ctaBtnStyle = {
    display: 'inline-block',
    background: `linear-gradient(90deg, ${colors.accent} 0%, ${colors.accent2} 100%)`,
    color: '#181a20',
    padding: '0.8rem 2rem',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 900,
    fontSize: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    boxShadow: `0 0 16px ${colors.accent2}`,
    border: 'none',
    transition: 'background 0.3s, color 0.3s',
    '&:hover': {
      background: `linear-gradient(90deg, ${colors.accent2} 0%, ${colors.accent} 100%)`,
      color: colors.accent,
    },
  };

  return (
    <>
      <Head>
        <title>Managed IT Services | iShareHow Labs LLC</title>
        <meta name="description" content="Comprehensive Managed IT Services by iShareHow Labs LLC. We provide proactive monitoring, robust security, and 24/7 support to keep your business running smoothly." />
        <meta name="keywords" content="managed services, MSP, IT support, cybersecurity, cloud services, iShareHow Labs, network management, IT consulting" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron&display=swap" rel="stylesheet" />
      </Head>
      <Box sx={{
        background: 'linear-gradient(135deg, #181a20 0%, #23263a 100%)',
        color: colors.accent,
        fontFamily: "'Inter', sans-serif",
        lineHeight: 1.6,
        overflowX: 'hidden',
      }}>
        {/* Nav */}
        <Box component="nav" sx={{
          background: 'rgba(24,26,32,0.95)',
          padding: '1rem 0',
          position: 'sticky',
          top: 0,
          zIndex: 1000,
          boxShadow: `0 2px 24px ${colors.accent2}44`,
          borderBottom: '1px solid #23263a',
        }}>
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
              <MuiLink href="/" sx={{
                fontSize: '2.2rem',
                fontWeight: 900,
                color: colors.accent2,
                textShadow: `0 0 12px ${colors.accent}, 0 0 24px ${colors.accent2}`,
                textDecoration: 'none',
                letterSpacing: '2px',
                fontFamily: "'Orbitron', sans-serif",
              }}>
                iShareHow Labs MSP
              </MuiLink>
              <Box component="ul" sx={{ display: 'flex', listStyle: 'none', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {['Services', 'Why Us', 'Technology', 'Contact'].map((item) => (
                  <li key={item}>
                    <MuiLink href={`#${item.toLowerCase()}`} sx={{ color: colors.accent, textDecoration: 'none', fontSize: '1rem', fontWeight: 600, transition: 'color 0.3s, text-shadow 0.3s', textShadow: `0 0 8px ${colors.accent2}`, '&:hover': { color: colors.accent2, textShadow: `0 0 16px ${colors.accent}` } }}>
                      {item}
                    </MuiLink>
                  </li>
                ))}
                <li>
                  <MuiLink href="#contact" sx={{ ...ctaBtnStyle, padding: '0.7rem 1.5rem', color: '#181a20' }}>
                    Get a Quote
                  </MuiLink>
                </li>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* Hero Section */}
        <Box sx={{ background: `linear-gradient(120deg, ${colors.accent2} 0%, ${colors.pink} 100%)`, padding: '6rem 0', textAlign: 'center', boxShadow: `0 0 40px ${colors.accent2}aa` }}>
          <Container>
            <Typography variant="h1" sx={{ fontFamily: "'Orbitron', sans-serif", fontSize: '3.5rem', fontWeight: 900, mb: 1, color: '#181a20', textShadow: `0 0 24px ${colors.pink}, 0 0 48px ${colors.accent2}`, letterSpacing: '2px' }}>
              Comprehensive IT & Managed Services
            </Typography>
            <Typography sx={{ fontSize: '1.25rem', color: '#181a20', maxWidth: '800px', margin: '0 auto 2rem', textShadow: `0 0 8px ${colors.accent2}` }}>
              Empower your business with our proactive, secure, and scalable Managed IT Services. We handle your technology so you can focus on growth.
            </Typography>
          </Container>
        </Box>

        {/* Sections */}
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* About */}
          <Box id="about" component="section" sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="h2" sx={{ fontFamily: "'Orbitron', sans-serif", color: colors.primary, fontWeight: 700, mb: 3 }}>MSP::OVERVIEW</Typography>
            <Typography sx={{ maxWidth: '800px', margin: '0 auto 2rem', fontSize: '1.1rem', color: colors.secondary }}>
              <Typography component="span" sx={{ color: colors.accent, fontWeight: 'bold' }}>iShareHow Labs LLC</Typography> provides forward-thinking Managed Service Provider (MSP) solutions designed for modern businesses. We specialize in integrating robust IT infrastructure, cybersecurity, and cloud services to create a seamless and secure operational environment. Our mission is to optimize your technology, mitigate risks, and provide a platform for sustainable growth.
            </Typography>
          </Box>

          {/* Why Us */}
          <Box id="why-us" component="section" sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="h2" sx={{ fontFamily: "'Orbitron', sans-serif", color: colors.primary, fontWeight: 700, mb: 3 }}>WHY::iShareHow Labs</Typography>
            <Box sx={{ maxWidth: '900px', margin: '0 auto' }}>
              <Typography component="blockquote" sx={{ fontStyle: 'italic', fontWeight: 500, background: colors.gray, borderLeft: `4px solid ${colors.accent}`, padding: '2rem', margin: '2rem 0', color: colors.secondary, fontSize: '1.1rem' }}>
                "Our philosophy is built on a foundation of proactive partnership. We don't just fix problems; we anticipate them. By aligning our technology strategy with your business goals, we become an extension of your team, dedicated to your success and security in the digital landscape."
              </Typography>
            </Box>
          </Box>

          {/* Services */}
          <Box id="services" component="section" sx={{ py: 4 }}>
            <Typography variant="h2" sx={{ fontFamily: "'Orbitron', sans-serif", color: colors.primary, fontWeight: 700, mb: 3, textAlign: 'center' }}>CORE::SERVICES</Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Box sx={cardStyle}>
                  <Typography variant="h3" sx={{ fontSize: '1.5rem', mb: 1, color: colors.primary }}>Proactive Monitoring</Typography>
                  <Typography sx={{ color: colors.secondary, fontSize: '1rem' }}>24/7/365 network and device monitoring to identify and resolve issues before they impact your business. We ensure maximum uptime and performance.</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={cardStyle}>
                  <Typography variant="h3" sx={{ fontSize: '1.5rem', mb: 1, color: colors.primary }}>Robust Cybersecurity</Typography>
                  <Typography sx={{ color: colors.secondary, fontSize: '1rem' }}>Multi-layered security protocols, including endpoint protection, firewall management, and threat intelligence to protect your data and infrastructure.</Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={cardStyle}>
                  <Typography variant="h3" sx={{ fontSize: '1.5rem', mb: 1, color: colors.primary }}>Cloud & Backup Solutions</Typography>
                  <Typography sx={{ color: colors.secondary, fontSize: '1rem' }}>Secure cloud migration, management, and data backup/recovery services. Ensure business continuity and data integrity with our resilient solutions.</Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Technology */}
          <Box id="technology" component="section" sx={{ py: 4 }}>
            <Typography variant="h2" sx={{ fontFamily: "'Orbitron', sans-serif", color: colors.primary, fontWeight: 700, mb: 3, textAlign: 'center' }}>TECHNOLOGY::STACK</Typography>
            <Grid container spacing={4}>
              <Grid item xs={12} md={4}>
                <Box sx={cardStyle}>
                  <Typography variant="h3" sx={{ fontSize: '1.5rem', mb: 1, color: colors.primary }}>Cloud Platforms</Typography>
                  <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', color: colors.secondary }}>
                    <li>→ Microsoft Azure</li>
                    <li>→ Amazon Web Services (AWS)</li>
                    <li>→ Google Cloud Platform (GCP)</li>
                    <li>→ Microsoft 365 & Google Workspace</li>
                  </ul>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={cardStyle}>
                  <Typography variant="h3" sx={{ fontSize: '1.5rem', mb: 1, color: colors.primary }}>Security & Networking</Typography>
                  <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', color: colors.secondary }}>
                    <li>→ Palo Alto, Fortinet, Cisco</li>
                    <li>→ CrowdStrike, SentinelOne</li>
                    <li>→ SIEM & SOAR Platforms</li>
                    <li>→ Zero Trust Architecture</li>
                  </ul>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box sx={cardStyle}>
                  <Typography variant="h3" sx={{ fontSize: '1.5rem', mb: 1, color: colors.primary }}>Support & Operations</Typography>
                  <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left', color: colors.secondary }}>
                    <li>→ Datadog, New Relic</li>
                    <li>→ ServiceNow, Jira Service Desk</li>
                    <li>→ PowerShell, Python, Ansible</li>
                    <li>→ ITIL-based Frameworks</li>
                  </ul>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Contact */}
          <Box id="contact" component="section" sx={{ py: 4 }}>
            <Typography variant="h2" sx={{ fontFamily: "'Orbitron', sans-serif", color: colors.primary, fontWeight: 700, mb: 2, textAlign: 'center' }}>GET A CUSTOMIZED QUOTE</Typography>
            <Typography sx={{ textAlign: 'center', mb: 4, fontSize: '1.1rem', color: colors.secondary }}>
              Ready to optimize your IT infrastructure? Contact us for a free consultation and a quote tailored to your business needs.
            </Typography>
            <Grid container spacing={4} justifyContent="center">
              <Grid item xs={12} md={8}>
                <Box sx={cardStyle}>
                  <Typography variant="h3" sx={{ fontSize: '1.5rem', mb: 2, color: colors.primary }}>CONTACT::PROTOCOLS</Typography>
                  <Typography sx={{ fontSize: '1.1rem', mb: 3, color: colors.secondary }}>
                    Connect with our team to discuss your IT challenges and goals. We're available via Discord for real-time chat or through our official contact channels for formal inquiries.
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                    <MuiLink href="https://isharehow.app/discord" target="_blank" sx={{ ...ctaBtnStyle, color: '#181a20' }}>Join Our Discord</MuiLink>
                    <MuiLink href="mailto:support@isharehow.app" sx={{ ...ctaBtnStyle, color: '#181a20' }}>Email for a Quote</MuiLink>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Container>

        {/* Footer */}
        <Box component="footer" sx={{ background: 'linear-gradient(90deg, #181a20 60%, #23263a 100%)', color: colors.accent, padding: '4rem 0', boxShadow: `0 0 32px ${colors.accent2}aa` }}>
          <Container maxWidth="lg">
            <Box sx={{ borderTop: '1px solid #495057', paddingTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: '#adb5bd' }}>
              <Typography>iShareHow Labs LLC © {currentYear} | Managed Service Provider | All rights reserved</Typography>
              <Typography sx={{ color: colors.secondary, fontSize: '0.8rem', mt: 1 }}>
                #ManagedServices #ITSupport #Cybersecurity #CloudSolutions #MSP #TechSupport #BusinessIT
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default MspPage;
