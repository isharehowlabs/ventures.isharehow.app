import React, { useState } from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Grid, 
  Chip, 
  Stack, 
  useTheme,
  TextField,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  AutoAwesome as AutoAwesomeIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { getBackendUrl } from '../utils/backendUrl';
import { useDarkMode } from '../hooks/useDarkMode';

const FractionalDigitalAgencyPage = () => {
  const theme = useTheme();
  const isDark = useDarkMode();
  
  // Client Prospect Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
    package: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState(false);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (formError) setFormError(null);
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setFormError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setFormError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setFormError('Please enter a valid email address');
      return false;
    }
    if (!formData.phone.trim()) {
      setFormError('Phone number is required');
      return false;
    }
    return true;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setFormLoading(true);
    setFormError(null);

    try {
      const backendUrl = getBackendUrl();
      
      const response = await fetch(`${backendUrl}/api/creative/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          company: formData.company.trim() || undefined,
          phone: formData.phone.trim(),
          message: formData.message.trim() || undefined,
          marketingBudget: formData.package.trim() || undefined,
          source: 'fractional_digital_agency',
          status: 'prospect',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to submit prospect form' }));
        throw new Error(errorData.error || 'Failed to submit form. Please try again.');
      }

      setFormSuccess(true);
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        message: '',
        package: '',
      });
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit form. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };

  const packages = [
    {
      name: 'Audit & Fix',
      subtitle: 'The Essential',
      price: '$150 - $300',
      priceNote: 'One-time',
      description: 'Perfect for testing the waters. I will provide a comprehensive audit or one high-quality creative asset to improve your immediate conversion.',
      features: [
        '1 Creative Asset: High-fidelity social ad, banner, or email graphic',
        'OR 1 UX/UI Audit: A video review of one landing page with actionable improvements for CRO',
        'Deliverable: Source files (Figma/Adobe), PNG/JPG, or PDF Report',
        'Delivery Time: 3 Days',
        'Revisions: 2',
      ],
      target: 'Freelancers or solopreneurs needing quick, affordable fixes',
      guarantee: '7-day satisfaction guarantee',
      color: 'primary',
    },
    {
      name: 'Essential Core',
      subtitle: 'Landing Page or Brand Sprint',
      price: '$950 - $2,500',
      priceNote: 'or custom quote',
      description: 'A complete creative sprint for your business. We will design and develop a high-converting landing page or a brand identity kit.',
      features: [
        'Design & Dev: One responsive Landing Page (up to 5 sections) OR',
        'Branding Kit: Logo, Color Palette, Typography, and Brand Guidelines',
        'Bonus: Basic SEO Setup (Meta tags, speed optimization) & Front-end implementation',
        'Deliverable: Live website link or Full Brand Kit',
        'Delivery Time: 10-14 Days',
        'Revisions: 3',
      ],
      target: 'Small businesses seeking integrated growth',
      guarantee: '7-day trial period + 98% satisfaction promise',
      color: 'secondary',
      popular: true,
    },
    {
      name: 'AI & Enterprise',
      subtitle: 'Custom Offers',
      price: 'Custom Quote',
      priceNote: 'Contact for pricing',
      description: 'Your AI Help and Enterprise services are complex. For larger organizations, we offer fully tailored solutions. Message me for a custom quote.',
      features: [
        'Fully custom integrations and white-label options',
        'GDPR-compliant security and dedicated resources',
        'Advanced features like full accessibility audits',
        'Design system stewardship',
        'Scalable solutions for enterprise needs',
        'Dedicated support team',
      ],
      target: 'Enterprises or high-growth clients wanting comprehensive, scalable solutions',
      guarantee: 'No-risk trial + cancel anytime; full money-back if not satisfied',
      color: 'success',
    },
  ];

  const comparisonData = [
    {
      feature: 'Customization & Extras',
      essential: 'Limited to off-the-shelf solutions; no custom integrations',
      core: 'Moderate customization (e.g., tailored AI prompts or basic API management); includes ethical AI guidance',
      enterprise: 'Fully custom (e.g., white-label options, GDPR-compliant security, dedicated resources); includes advanced features like full accessibility audits and design system stewardship',
    },
    {
      feature: 'Target Client',
      essential: 'Freelancers or solopreneurs needing quick, affordable fixes',
      core: 'Small businesses seeking integrated growth (e.g., combining creative and AI for efficiency gains)',
      enterprise: 'Enterprises or high-growth clients wanting comprehensive, scalable solutions',
    },
    {
      feature: 'Trial/Guarantee',
      essential: '7-day satisfaction guarantee',
      core: '7-day trial period + 98% satisfaction promise',
      enterprise: 'No-risk trial + cancel anytime; full money-back if not satisfied',
    },
  ];

  const faqs = [
    {
      question: 'What if I need revisions?',
      answer: 'All packages include a set number of revisions (see details above). Additional revisions are available at $50/hour.',
    },
    {
      question: 'How does AI power these services?',
      answer: 'AI enhances efficiency in design, audits, and content creation – e.g., generating tailored prompts for 30% faster iterations.',
    },
    {
      question: 'What if my needs are more complex?',
      answer: 'For custom enterprise solutions, message me for a tailored quote.',
    },
    {
      question: 'Do you offer niches like affiliate marketing?',
      answer: 'Yes! Highlighted for targeted clients – e.g., AI-driven content for affiliate empires.',
    },
    {
      question: 'Delivery format?',
      answer: 'All deliverables include source files and are optimized for quick implementation.',
    },
  ];

  return (
    <>
      <Head>
        <title>Fractional Digital Agency - AI-Powered Creative Services | iShareHow</title>
        <meta name="description" content="Your AI-Powered Creative Partner. Project-based managed creative, UI/UX design, and growth services. 24/7 availability, no long-term contracts." />
      </Head>

      <Box sx={{ bgcolor: 'background.default', color: 'text.primary', minHeight: '100vh', position: 'relative' }}>
        {/* Hero Section */}
        <Box
          sx={{
            pt: { xs: 8, md: 12 },
            pb: { xs: 6, md: 8 },
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Container maxWidth="lg">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Typography
                variant="h3"
                component="h1"
                align="center"
                sx={{
                  fontWeight: 800,
                  mb: 2,
                  fontSize: { xs: '2rem', md: '3rem' },
                }}
              >
                Fractional Digital Agency
              </Typography>
              <Typography
                variant="h6"
                align="center"
                color="text.secondary"
                sx={{ mb: 4, fontStyle: 'italic' }}
              >
                Gig: Business Transformation and Creative Services Powered by AI
              </Typography>

              <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography
                  variant="h4"
                  component="h2"
                  sx={{
                    fontWeight: 700,
                    mb: 3,
                    fontSize: { xs: '1.5rem', md: '2rem' },
                  }}
                >
                  Your AI-Powered Creative Partner
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ mb: 3, maxWidth: 800, mx: 'auto' }}
                >
                  I will provide <strong>Project-Based managed creative, UI/UX design, and growth services</strong>.
                </Typography>
                <Typography
                  variant="body1"
                  color="text.secondary"
                  sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}
                >
                  Positioned as a <strong>one-stop solution for solopreneurs, small businesses, or enterprises needing tailored support</strong>.
                </Typography>

                <Grid container spacing={3} sx={{ mt: 4, maxWidth: 900, mx: 'auto' }}>
                  <Grid item xs={12} md={4}>
                    <Card elevation={3} sx={{ height: '100%', bgcolor: 'transparent' }}>
                      <CardContent>
                        <SpeedIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                          Efficiency Gains
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          30% improvements in conversions and operations
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card elevation={3} sx={{ height: '100%', bgcolor: 'transparent' }}>
                      <CardContent>
                        <AutoAwesomeIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                          24/7 Availability
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Powered by AI for round-the-clock support
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Card elevation={3} sx={{ height: '100%', bgcolor: 'transparent' }}>
                      <CardContent>
                        <SecurityIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                        <Typography variant="h6" gutterBottom>
                          No Long-Term Contracts
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Flexible, project-based delivery
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            </motion.div>
          </Container>
        </Box>

        {/* Packages Section */}
        <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: 'transparent' }}>
          <Container maxWidth="lg">
            <Typography
              variant="h4"
              align="center"
              sx={{ fontWeight: 700, mb: 6 }}
            >
              Choose Your Package
            </Typography>

            <Grid container spacing={4}>
              {packages.map((pkg, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                  >
                    <Card
                      elevation={pkg.popular ? 8 : 3}
                      sx={{
                        height: '100%',
                        position: 'relative',
                        border: pkg.popular ? `2px solid ${theme.palette.primary.main}` : 'none',
                        bgcolor: 'background.default',
                      }}
                    >
                      {pkg.popular && (
                        <Chip
                          label="Most Popular"
                          color="primary"
                          sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            fontWeight: 600,
                          }}
                        />
                      )}
                      <CardContent sx={{ p: 4 }}>
                        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                          {pkg.name}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2 }}>
                          {pkg.subtitle}
                        </Typography>
                        <Box sx={{ mb: 3 }}>
                          <Typography variant="h4" sx={{ fontWeight: 800, color: `${pkg.color}.main` }}>
                            {pkg.price}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {pkg.priceNote}
                          </Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                          {pkg.description}
                        </Typography>
                        <Divider sx={{ my: 3 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                          Includes:
                        </Typography>
                        <Stack spacing={1.5} sx={{ mb: 3 }}>
                          {pkg.features.map((feature, idx) => (
                            <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start' }}>
                              <CheckCircleIcon
                                sx={{ fontSize: 20, color: `${pkg.color}.main`, mr: 1, mt: 0.25 }}
                              />
                              <Typography variant="body2">{feature}</Typography>
                            </Box>
                          ))}
                        </Stack>
                        <Divider sx={{ my: 3 }} />
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Target:</strong> {pkg.target}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          <strong>Guarantee:</strong> {pkg.guarantee}
                        </Typography>
                        <Button
                          variant={pkg.popular ? 'contained' : 'outlined'}
                          color={pkg.color as any}
                          fullWidth
                          sx={{ mt: 3 }}
                          onClick={() => {
                            if (pkg.name === 'Essential Core') {
                              // Link to Shopify product for Essential Core
                              window.open('https://shop.isharehow.app/products/custom-webapp-built-by-ishare?utm_source=copyToPasteBoard&utm_medium=product-links&utm_content=web', '_blank', 'noopener,noreferrer');
                            } else if (pkg.name === 'Audit & Fix') {
                              // Link to Shopify product for Audit & Fix
                              window.open('https://shop.isharehow.app/products/untitled-dec11_10-41?utm_source=copyToPasteBoard&utm_medium=product-links&utm_content=web', '_blank', 'noopener,noreferrer');
                            } else {
                              setFormData(prev => ({ ...prev, package: pkg.name }));
                              document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
                            }
                          }}
                        >
                          Get Started
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Grid>
              ))}
            </Grid>
          </Container>
        </Box>

        {/* Comparison Table */}
        <Box sx={{ py: { xs: 6, md: 8 } }}>
          <Container maxWidth="lg">
            <Typography
              variant="h4"
              align="center"
              sx={{ fontWeight: 700, mb: 6 }}
            >
              Package Comparison
            </Typography>
            <TableContainer component={Paper} elevation={3}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Feature</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Audit & Fix (The Essential)</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Essential Core</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>AI & Enterprise (Custom)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {comparisonData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell sx={{ fontWeight: 600 }}>{row.feature}</TableCell>
                      <TableCell>{row.essential}</TableCell>
                      <TableCell>{row.core}</TableCell>
                      <TableCell>{row.enterprise}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Container>
        </Box>

        {/* FAQs Section */}
        <Box sx={{ py: { xs: 6, md: 8 }, bgcolor: 'transparent' }}>
          <Container maxWidth="md">
            <Typography
              variant="h4"
              align="center"
              sx={{ fontWeight: 700, mb: 6 }}
            >
              Frequently Asked Questions
            </Typography>
            <Stack spacing={2}>
              {faqs.map((faq, index) => (
                <Accordion key={index} elevation={2}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      {faq.question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body1" color="text.secondary">
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          </Container>
        </Box>

        {/* Contact Form */}
        <Box id="contact-form" sx={{ py: { xs: 6, md: 8 } }}>
          <Container maxWidth="md">
            <Typography
              variant="h4"
              align="center"
              sx={{ fontWeight: 700, mb: 6 }}
            >
              Get Started Today
            </Typography>
            <Card elevation={3} sx={{ bgcolor: 'transparent' }}>
              <CardContent sx={{ p: 4 }}>
                {formSuccess ? (
                  <Alert severity="success" sx={{ mb: 3 }}>
                    Thank you! We've received your request and will contact you soon.
                  </Alert>
                ) : (
                  <form onSubmit={handleFormSubmit}>
                    <Grid container spacing={3}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Name *"
                          name="name"
                          value={formData.name}
                          onChange={handleFormChange}
                          required
                          InputProps={{
                            startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Email *"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleFormChange}
                          required
                          InputProps={{
                            startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Company"
                          name="company"
                          value={formData.company}
                          onChange={handleFormChange}
                          InputProps={{
                            startAdornment: <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Phone *"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleFormChange}
                          required
                          InputProps={{
                            startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                          }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Package Interest"
                          name="package"
                          value={formData.package}
                          onChange={handleFormChange}
                          placeholder="e.g., Audit & Fix, Essential Core, AI & Enterprise"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Message"
                          name="message"
                          value={formData.message}
                          onChange={handleFormChange}
                          multiline
                          rows={4}
                          placeholder="Tell us about your project..."
                        />
                      </Grid>
                      {formError && (
                        <Grid item xs={12}>
                          <Alert severity="error">{formError}</Alert>
                        </Grid>
                      )}
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          size="large"
                          fullWidth
                          disabled={formLoading}
                          startIcon={formLoading ? <CircularProgress size={20} /> : <SendIcon />}
                          sx={{ py: 1.5 }}
                        >
                          {formLoading ? 'Submitting...' : 'Submit Request'}
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                )}
              </CardContent>
            </Card>
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default FractionalDigitalAgencyPage;

