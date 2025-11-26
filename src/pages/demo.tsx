import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import Head from 'next/head';
import { useRouter } from 'next/router';
import AppShell from '../components/AppShell';
import ProgressIndicator from '../components/signup/ProgressIndicator';
import PlanSelector from '../components/signup/PlanSelector';
import AccountForm from '../components/signup/AccountForm';
import PaymentForm from '../components/signup/PaymentForm';
import { PricingTier } from '../components/pricing/PricingTierCard';

const pricingTiers: PricingTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 399,
    priceAnnual: 3830,
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
    ctaText: 'Select Plan',
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 1499,
    priceAnnual: 14390,
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
    ctaText: 'Select Plan',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 9000,
    priceAnnual: 86400,
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

const steps = ['Select Plan', 'Create Account', 'Payment', 'Confirmation'];

interface AccountFormData {
  email: string;
  password: string;
  fullName: string;
  companyName: string;
  phone: string;
  referralCode: string;
}

interface PaymentFormData {
  paymentMethod: 'card' | 'paypal' | 'bank';
  cardNumber: string;
  cardExpiry: string;
  cardCVC: string;
  cardName: string;
  billingAddress: string;
  billingCity: string;
  billingState: string;
  billingZip: string;
  billingCountry: string;
  taxId: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
}

export default function DemoPage() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [isAnnual, setIsAnnual] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [accountData, setAccountData] = useState<AccountFormData>({
    email: '',
    password: '',
    fullName: '',
    companyName: '',
    phone: '',
    referralCode: '',
  });

  const [paymentData, setPaymentData] = useState<PaymentFormData>({
    paymentMethod: 'card',
    cardNumber: '',
    cardExpiry: '',
    cardCVC: '',
    cardName: '',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingZip: '',
    billingCountry: '',
    taxId: '',
    acceptTerms: false,
    acceptPrivacy: false,
  });

  // Load tier from URL query params
  useEffect(() => {
    const { tier, annual } = router.query;
    if (tier && typeof tier === 'string') {
      setSelectedTier(tier);
    }
    if (annual === 'true') {
      setIsAnnual(true);
    }
  }, [router.query]);

  const validateAccountForm = (): boolean => {
    if (!accountData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!accountData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountData.email)) {
      setError('Valid email address is required');
      return false;
    }
    if (!accountData.password || accountData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    const selectedTierData = pricingTiers.find((t) => t.id === selectedTier);
    if (selectedTierData?.id !== 'starter' && !accountData.companyName.trim()) {
      setError('Company name is required for this plan');
      return false;
    }
    return true;
  };

  const validatePaymentForm = (): boolean => {
    if (!paymentData.acceptTerms) {
      setError('You must accept the Terms & Conditions');
      return false;
    }
    if (!paymentData.acceptPrivacy) {
      setError('You must accept the Privacy Policy');
      return false;
    }
    if (paymentData.paymentMethod === 'card') {
      if (!paymentData.cardName.trim() || !paymentData.cardNumber.trim() || 
          !paymentData.cardExpiry.trim() || !paymentData.cardCVC.trim()) {
        setError('Please fill in all card details');
        return false;
      }
    }
    if (!paymentData.billingAddress.trim() || !paymentData.billingCity.trim() || 
        !paymentData.billingState.trim() || !paymentData.billingZip.trim() || 
        !paymentData.billingCountry.trim()) {
      setError('Please fill in all billing address fields');
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    setError(null);
    
    if (activeStep === 0) {
      if (!selectedTier) {
        setError('Please select a plan');
        return;
      }
      setActiveStep(1);
    } else if (activeStep === 1) {
      if (!validateAccountForm()) {
        return;
      }
      setActiveStep(2);
    } else if (activeStep === 2) {
      if (!validatePaymentForm()) {
        return;
      }
      // Process payment and create account
      await handleSubmit();
    }
  };

  const handleBack = () => {
    setError(null);
    setActiveStep(activeStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Create subscription
      const subscriptionData = {
        tier: selectedTier,
        billingCycle: isAnnual ? 'annual' : 'monthly',
        accountData,
        paymentData,
      };

      const response = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscriptionData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create subscription');
      }

      // Store subscription ID for future use
      if (data.subscription?.id) {
        localStorage.setItem('subscription_id', data.subscription.id);
      }

      setActiveStep(3);
    } catch (err: any) {
      setError(err.message || 'Failed to create subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAccountChange = (field: keyof AccountFormData, value: string) => {
    setAccountData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePaymentChange = (field: keyof PaymentFormData, value: string | boolean) => {
    setPaymentData((prev) => ({ ...prev, [field]: value }));
  };

  const selectedTierData = pricingTiers.find((t) => t.id === selectedTier);
  const isEnterprise = selectedTier === 'enterprise';

  return (
    <>
      <Head>
        <title>Sign Up - iShareHow Ventures</title>
        <meta
          name="description"
          content="Join iShareHow Ventures and start your journey with our flexible pricing plans."
        />
      </Head>
      <AppShell active="demo">
        <Box
          sx={{
            minHeight: '100vh',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)',
            py: 8,
          }}
        >
          <Container maxWidth="lg">
            <Paper
              elevation={4}
              sx={{
                p: { xs: 3, md: 6 },
                borderRadius: 3,
              }}
            >
              <ProgressIndicator activeStep={activeStep} steps={steps} />

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {activeStep === 0 && (
                <PlanSelector
                  tiers={pricingTiers}
                  selectedTier={selectedTier}
                  isAnnual={isAnnual}
                  onTierSelect={setSelectedTier}
                  onBillingChange={setIsAnnual}
                />
              )}

              {activeStep === 1 && (
                <AccountForm
                  data={accountData}
                  onChange={handleAccountChange}
                  companyRequired={selectedTier !== 'starter'}
                />
              )}

              {activeStep === 2 && (
                <PaymentForm
                  data={paymentData}
                  onChange={handlePaymentChange}
                  isEnterprise={isEnterprise}
                />
              )}

              {activeStep === 3 && (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 3 }} />
                  <Typography variant="h4" fontWeight={700} gutterBottom>
                    Welcome to iShareHow Ventures!
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                    Your account has been created successfully. We've sent a confirmation email to{' '}
                    <strong>{accountData.email}</strong>.
                  </Typography>
                  <Stack spacing={2} sx={{ maxWidth: 400, mx: 'auto', mb: 4 }}>
                    <Typography variant="h6" fontWeight={600}>
                      Next Steps:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ✓ Check your email to verify your account
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ✓ Access your dashboard to get started
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ✓ Set up your first project
                    </Typography>
                  </Stack>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={() => router.push('/dashboard')}
                    sx={{ px: 4, py: 1.5 }}
                  >
                    Go to Dashboard
                  </Button>
                </Box>
              )}

              {activeStep < 3 && (
                <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                  <Button
                    disabled={activeStep === 0 || loading}
                    onClick={handleBack}
                    startIcon={<ArrowBackIcon />}
                  >
                    Back
                  </Button>
                  <Box sx={{ flexGrow: 1 }} />
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    disabled={loading}
                    endIcon={loading ? <CircularProgress size={20} /> : <ArrowForwardIcon />}
                  >
                    {activeStep === 2 ? (loading ? 'Processing...' : 'Complete Sign Up') : 'Next'}
                  </Button>
                </Stack>
              )}
            </Paper>
          </Container>
        </Box>
      </AppShell>
    </>
  );
}
