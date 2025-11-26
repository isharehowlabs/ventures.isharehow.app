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
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AppShell from '../components/AppShell';
import PricingTierCard, { PricingTier } from '../components/pricing/PricingTierCard';
import PricingToggle from '../components/pricing/PricingToggle';
import FeatureComparisonTable, { Feature } from '../components/pricing/FeatureComparisonTable';
import FAQAccordion, { FAQItem } from '../components/pricing/FAQAccordion';
import TrustBadges from '../components/pricing/TrustBadges';

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

const HomePage = () => {
  const router = useRouter();
  const [isAnnual, setIsAnnual] = useState(false);

  const handleSelectTier = (tierId: string) => {
    // Navigate to signup page with selected tier
    router.push(`/demo?tier=${tierId}&annual=${isAnnual}`);
  };

  return (
    <>
      <Head>
        <title>Pricing - iShareHow Labs</title>
        <meta
          name="description"
          content="Pricing that scales with your business. Choose the plan that works best for your creative goals. NO HIDDEN FEES. NO SURPRISES."
        />
        <meta
          name="keywords"
          content="pricing, subscription, plans, starter, professional, enterprise, iShareHow Labs"
        />
      </Head>

      <AppShell active="home">
        <Box>
          {/* Hero Section */}
          <Paper
            elevation={0}
            sx={{
              background: 'linear-gradient(135deg, #22D3EE 0%, #6366F1 100%)',
              borderRadius: 0,
              p: { xs: 4, md: 8 },
              mb: 6,
              textAlign: 'center',
              color: 'white',
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
                Pricing That Scales With Your Business
              </Typography>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 600,
                  mb: 2,
                  fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
                  opacity: 0.95,
                }}
              >
                Choose the plan that works best for your creative goals
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  mb: 4,
                  fontSize: { xs: '1rem', md: '1.25rem' },
                  opacity: 0.9,
                }}
              >
                NO HIDDEN FEES. NO SURPRISES.
              </Typography>
            </Container>
          </Paper>

          <Container maxWidth="lg" sx={{ mb: 8 }}>
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
                variant="h3"
                sx={{
                  fontWeight: 800,
                  mb: 4,
                  textAlign: 'center',
                  fontSize: { xs: '1.75rem', md: '2.5rem' },
                  background: 'linear-gradient(90deg, #22D3EE, #6366F1)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Compare Plans
              </Typography>
              <FeatureComparisonTable
                features={comparisonFeatures}
                tiers={pricingTiers}
              />
            </Box>

            {/* Social Proof Section */}
            <Box sx={{ mb: 8 }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  textAlign: 'center',
                  fontSize: { xs: '1.75rem', md: '2.5rem' },
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
              <Grid container spacing={4} sx={{ mb: 4 }}>
                {testimonials.map((testimonial, index) => (
                  <Grid item xs={12} md={4} key={index}>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 3,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      <Typography
                        variant="body1"
                        sx={{ mb: 2, fontStyle: 'italic', flexGrow: 1 }}
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
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>

            {/* Trust Badges */}
            <TrustBadges />

            {/* FAQ Section */}
            <Box sx={{ mb: 8 }}>
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 800,
                  mb: 4,
                  textAlign: 'center',
                  fontSize: { xs: '1.75rem', md: '2.5rem' },
                }}
              >
                Frequently Asked Questions
              </Typography>
              <Container maxWidth="md">
                <FAQAccordion faqs={faqs} />
              </Container>
            </Box>

            {/* CTA Section */}
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
                Ready to Get Started?
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  mb: 4,
                  opacity: 0.95,
                  fontWeight: 400,
                  maxWidth: 800,
                  mx: 'auto',
                }}
              >
                Join thousands of businesses using iShareHow Labs to scale their creative operations.
              </Typography>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                justifyContent="center"
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
                  Start Your Free Trial
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
      </AppShell>
    </>
  );
};

export default HomePage;
