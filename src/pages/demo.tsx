import React, { useState, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Divider,
} from '@mui/material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AppShell from '../components/AppShell';
import BookDemoForm from '../components/demo/BookDemoForm';
import { ServiceFinderQuiz } from '../components/landing/ServiceFinderQuiz';
import { creativeQuizData } from '../data/creativeQuizData';
import { useStickyState } from '../hooks/useStickyState';
import { ServiceScore } from '../types/landing';

// Pricing tier info for quiz recommendations
const pricingTierInfo = [
  { id: 'essential', name: 'Essential', price: 2500 },
  { id: 'growth', name: 'Growth', price: 5000 },
  { id: 'premium', name: 'Premium', price: 8000 },
  { id: 'enterprise', name: 'Enterprise', price: 12000 },
];

export default function BookDemoPage() {
  const router = useRouter();
  const [quizStep, setQuizStep] = useStickyState<number>("creativeQuizStep", 0);
  const [answers, setAnswers] = useStickyState<Record<string, number>>(
    "creativeQuizAnswers",
    {}
  );

  // Calculate recommended tiers based on quiz answers
  const getRecommendedTiers = useMemo((): ServiceScore[] => {
    const scores: Record<string, number> = {
      essential: 0,
      growth: 0,
      premium: 0,
      enterprise: 0,
    };

    Object.keys(answers).forEach((qid) => {
      const question = creativeQuizData.find((q) => q.id === qid);
      if (!question) return;
      const answer = question.options[answers[qid]];
      if (answer && answer.scores) {
        Object.entries(answer.scores).forEach(([key, value]) => {
          scores[key] = (scores[key] || 0) + (value ?? 0);
        });
      }
    });

    return Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .filter(([, score]) => score > 0)
      .slice(0, 3)
      .map(([key]) => {
        const tier = pricingTierInfo.find(t => t.id === key);
        return {
          key: key as any,
          name: tier?.name || key,
          description: `Recommended tier based on your needs - $${tier?.price.toLocaleString()}/mo`,
          score: scores[key],
          icon: '✨',
          includes: [],
        };
      });
  }, [answers]);

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

            {/* Creative as a Service Quiz */}
            <Box sx={{ mb: 8 }} id="quiz">
              <ServiceFinderQuiz
                quizStep={quizStep}
                answers={answers}
                onAnswer={(qid, opt) => setAnswers((prev) => ({ ...prev, [qid]: opt }))}
                onNext={() => {
                  if (quizStep < creativeQuizData.length - 1) {
                    setQuizStep(quizStep + 1);
                  } else {
                    const resultsElement = document.getElementById('results');
                    if (resultsElement) {
                      resultsElement.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                }}
                onPrev={() => {
                  if (quizStep > 0) {
                    setQuizStep(quizStep - 1);
                  }
                }}
                onReset={() => {
                  setQuizStep(0);
                  setAnswers({});
                  const quizElement = document.getElementById('quiz');
                  if (quizElement) {
                    quizElement.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                quizData={creativeQuizData}
                topServices={getRecommendedTiers}
                onNav={(view) => {
                  const element = document.getElementById(view);
                  if (element) element.scrollIntoView({ behavior: 'smooth' });
                }}
              />
            </Box>

            <Divider sx={{ my: 8 }} />

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
