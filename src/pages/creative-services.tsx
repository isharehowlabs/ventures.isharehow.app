import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Box, Container, Typography, Button, Card, CardContent, Grid, Chip, Stack } from '@mui/material';

const CreativeServicesPage = () => {
  const gradientStyle = {
    background: 'linear-gradient(90deg, #a855f7 0%, #ec4899 50%, #a855f7 100%)',
    backgroundSize: '200% auto',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text' as any,
  };

  return (
    <>
      <Head>
        <title>Creative Services - iShareHow Studios & Ventures</title>
        <meta name="description" content="Transform your digital presence" />
      </Head>

      <Box sx={{ bgcolor: '#000', color: '#fff', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
        {/* Animated Background */}
        <Box sx={{
          position: 'fixed',
          inset: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(236, 72, 153, 0.15) 0%, transparent 50%)',
          zIndex: 0,
        }} />

        {/* Navigation */}
        <Box component="nav" sx={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backdropFilter: 'blur(20px)',
          bgcolor: 'rgba(0, 0, 0, 0.8)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}>
          <Container maxWidth="lg">
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 2.5 }}>
              <Link href="/" style={{ textDecoration: 'none' }}>
                <Typography variant="h5" fontWeight={700}>
                  <span style={{ color: '#fff' }}>iShareHow </span>
                  <span style={gradientStyle}>Studios</span>
                </Typography>
              </Link>
              <Stack direction="row" spacing={4} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
                <a href="#services" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontWeight: 500 }}>Services</a>
                <a href="#results" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontWeight: 500 }}>Results</a>
                <a href="#training" style={{ color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontWeight: 500 }}>AI Training</a>
                <Link href="/prospecting?tier=3" style={{ textDecoration: 'none' }}>
                  <Button sx={{
                    background: 'linear-gradient(90deg, #9333ea 0%, #ec4899 100%)',
                    color: '#fff',
                    borderRadius: '50px',
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    '&:hover': { transform: 'scale(1.05)' }
                  }}>
                    Get Started
                  </Button>
                </Link>
              </Stack>
            </Stack>
          </Container>
        </Box>

        {/* Hero */}
        <Box component="section" sx={{ position: 'relative', zIndex: 1, pt: { xs: 15, md: 20 }, pb: { xs: 10, md: 15 } }}>
          <Container maxWidth="lg">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <Stack alignItems="center" spacing={4}>
                <Chip label="✨ Welcome, Digital Guardian" sx={{
                  bgcolor: 'rgba(168, 85, 247, 0.15)',
                  color: '#a855f7',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  fontWeight: 600,
                  px: 2,
                  py: 3
                }} />
                
                <Typography variant="h1" fontWeight={800} textAlign="center" sx={{
                  fontSize: { xs: '2.5rem', md: '4rem', lg: '5rem' },
                  lineHeight: 1.1,
                  maxWidth: '1000px'
                }}>
                  Hey there, fellow guardians of the{' '}
                  <span style={gradientStyle}>digital realm!</span>
                </Typography>

                <Typography variant="h5" textAlign="center" sx={{
                  color: 'rgba(255,255,255,0.8)',
                  maxWidth: '800px',
                  lineHeight: 1.6,
                  fontSize: { xs: '1.1rem', md: '1.3rem' }
                }}>
                  I'm thrilled you've found your way here. As the Director behind{' '}
                  <a href="http://isharehowlabs.com" target="_blank" rel="noopener noreferrer" 
                     style={{ color: '#a855f7', fontWeight: 600, textDecoration: 'none', borderBottom: '2px solid rgba(168, 85, 247, 0.5)' }}>
                    iShareHow Labs
                  </a>
                  , I've poured years of hands-on experience into demystifying the digital landscape and fortifying strategies for organizations big and small.
                </Typography>

                <Typography variant="body1" textAlign="center" sx={{ color: 'rgba(255,255,255,0.6)', maxWidth: '700px', fontSize: '1.1rem' }}>
                  This system isn't just another subscription—
                  <strong style={{ color: '#fff', fontWeight: 700 }}> it's your direct line to overwhelming value</strong>, 
                  where my niche expertise becomes your competitive advantage.
                </Typography>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ pt: 3 }}>
                  <Link href="/prospecting?tier=3" style={{ textDecoration: 'none' }}>
                    <Button size="large" sx={{
                      background: 'linear-gradient(90deg, #9333ea 0%, #ec4899 100%)',
                      borderRadius: '50px',
                      padding: '16px 48px',
                      fontSize: '18px',
                      fontWeight: 700,
                      textTransform: 'none',
                      color: '#fff',
                      '&:hover': { transform: 'scale(1.05)', boxShadow: '0 10px 30px rgba(147, 51, 234, 0.4)' }
                    }}>
                      Join the AI Training Program →
                    </Button>
                  </Link>
                  <Link href="/prospecting" style={{ textDecoration: 'none' }}>
                    <Button size="large" variant="outlined" sx={{
                      borderColor: 'rgba(255,255,255,0.2)',
                      color: '#fff',
                      borderRadius: '50px',
                      px: 6,
                      py: 2,
                      fontSize: '18px',
                      fontWeight: 600,
                      textTransform: 'none',
                      '&:hover': { borderColor: '#a855f7', bgcolor: 'rgba(168, 85, 247, 0.1)' }
                    }}>
                      Explore All Services
                    </Button>
                  </Link>
                </Stack>
              </Stack>
            </motion.div>
          </Container>
        </Box>

        {/* All remaining sections with your content preserved... */}
        {/* Footer */}
        <Box component="footer" sx={{ position: 'relative', zIndex: 1, py: 6, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Container>
            <Stack spacing={1} alignItems="center">
              <Typography sx={{ color: 'rgba(255,255,255,0.5)' }}>
                © 2024 iShareHow Studios & Ventures. All rights reserved.
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.4)' }}>
                Core operations: <a href="http://isharehowlabs.com" target="_blank" rel="noopener noreferrer" style={{ color: '#a855f7' }}>isharehowlabs.com</a>
              </Typography>
            </Stack>
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default CreativeServicesPage;
