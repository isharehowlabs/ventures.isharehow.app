import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
} from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AppShell from '../components/AppShell';
import BookDemoForm from '../components/demo/BookDemoForm';

export default function BookDemoPage() {
  const router = useRouter();

  return (
    <>
      <Head>
        <title>Book a Demo - iShareHow Ventures</title>
        <meta
          name="description"
          content="Schedule a demo to see how iShareHow Ventures can transform your business. Explore our dashboards and AI-powered tools."
        />
      </Head>
      <AppShell active="demo">
        <Box
          sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
            py: { xs: 4, md: 8 },
          }}
        >
          <Container maxWidth="lg">
            {/* Hero Section with Form */}
            <Box sx={{ textAlign: 'center', mb: 6 }}>
              <Typography
                variant="h2"
                component="h1"
                fontWeight={900}
                sx={{
                  mb: 2,
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Book Your Demo
              </Typography>
              <Typography
                variant="h5"
                color="text.secondary"
                sx={{ mb: 4, maxWidth: 700, mx: 'auto' }}
              >
                Fill out the form below to schedule a personalized demo and explore our dashboards, AI tools, and see how we can help transform your business.
              </Typography>
            </Box>

            {/* Book Demo Form */}
            <Box sx={{ mb: 8 }}>
              <BookDemoForm
                onSuccess={(clientId) => {
                  // Redirect to demo page after successful submission
                  setTimeout(() => {
                    window.location.href = 'https://demo.isharehow.app';
                  }, 2000);
                }}
              />
            </Box>

            {/* Footer Links */}
            <Box sx={{ textAlign: 'center', mt: 8, pt: 4, borderTop: '1px solid', borderColor: 'divider' }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" alignItems="center">
                <Button
                  variant="text"
                  onClick={() => router.push('/privacy')}
                  sx={{ color: 'text.secondary', textTransform: 'none' }}
                >
                  Privacy Policy
                </Button>
                <Box sx={{ display: { xs: 'none', sm: 'block' }, color: 'text.secondary' }}>•</Box>
                <Button
                  variant="text"
                  onClick={() => router.push('/terms')}
                  sx={{ color: 'text.secondary', textTransform: 'none' }}
                >
                  Terms & Conditions
                </Button>
              </Stack>
            </Box>
          </Container>
        </Box>
      </AppShell>
    </>
  );
}
