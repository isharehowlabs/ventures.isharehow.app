import Head from 'next/head';
import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Grid,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Paper,
  useTheme,
  alpha,
  Fade,
  Zoom,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  ExpandMore as ExpandMoreIcon,
  ArrowForward as ArrowForwardIcon,
  ShoppingCart as ShoppingCartIcon,
  Build as BuildIcon,
  Speed as SpeedIcon,
  Palette as PaletteIcon,
  Devices as DevicesIcon,
  Code as CodeIcon,
  Support as SupportIcon,
  Security as SecurityIcon,
  CloudUpload as CloudUploadIcon,
  Analytics as AnalyticsIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import AppShell from '../components/AppShell';
import { useRouter } from 'next/router';
import { useDarkMode } from '../hooks/useDarkMode';

const STORE_DOMAIN = 'isharehow.myshopify.com';
const PRODUCT_HANDLE = 'website-apps'; // Update with actual Shopify product handle
const PRODUCT_PRICE = 699;

const features = [
  { icon: <SpeedIcon />, title: 'Lightning Fast', description: 'Optimized for performance and speed' },
  { icon: <PaletteIcon />, title: 'Fully Customizable', description: 'Easy to customize and brand' },
  { icon: <DevicesIcon />, title: 'Fully Responsive', description: 'Works perfectly on all devices' },
  { icon: <CodeIcon />, title: 'Clean Code', description: 'Well-structured and documented code' },
  { icon: <SupportIcon />, title: 'Fast Support', description: 'Get help when you need it' },
  { icon: <SecurityIcon />, title: 'Secure', description: 'Built with security best practices' },
  { icon: <CloudUploadIcon />, title: 'Easy Deployment', description: 'Deploy in minutes, not hours' },
  { icon: <AnalyticsIcon />, title: 'Analytics Ready', description: 'Built-in analytics integration' },
  { icon: <AutoAwesomeIcon />, title: 'AI Powered', description: 'Leverage AI for enhanced features' },
];

const faqs = [
  {
    question: 'What is included in the Website Apps package?',
    answer: 'You get a fully functional, production-ready website application with modern UI components, responsive design, authentication system, and all the features needed to launch your business online.',
  },
  {
    question: 'Can I customize the design?',
    answer: 'Absolutely! The code is fully customizable. You can modify colors, layouts, components, and functionality to match your brand perfectly.',
  },
  {
    question: 'Do I need technical knowledge to use this?',
    answer: 'While some technical knowledge helps, our AI builder can handle most of the setup for you. Just provide your requirements and we\'ll take care of the rest.',
  },
  {
    question: 'What happens after I purchase?',
    answer: 'After purchase, you\'ll receive access to the code repository and can either use our AI builder to customize it automatically, or work with our team to get it set up exactly how you need it.',
  },
  {
    question: 'Is there ongoing support?',
    answer: 'Yes! You get 3 months of included support, and we offer extended support plans if you need ongoing assistance.',
  },
  {
    question: 'Can I use this for multiple projects?',
    answer: 'The standard license covers one project. For multiple projects, please contact us for extended licensing options.',
  },
];

export default function WebsiteAppsPage() {
  const theme = useTheme();
  const router = useRouter();
  const isDark = useDarkMode();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [aiFormData, setAiFormData] = useState({
    businessName: '',
    industry: '',
    features: '',
    timeline: '',
    email: '',
  });
  const [aiFormSubmitted, setAiFormSubmitted] = useState(false);

  // Handle scroll to top
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      setShowScrollTop(window.scrollY > 400);
    });
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShopifyCheckout = () => {
    window.open(`https://${STORE_DOMAIN}/products/${PRODUCT_HANDLE}`, '_blank');
  };

  const handleAiFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would integrate with your AI builder backend
    // For now, just show success message
    setAiFormSubmitted(true);
    setTimeout(() => {
      setAiFormSubmitted(false);
      setAiFormData({
        businessName: '',
        industry: '',
        features: '',
        timeline: '',
        email: '',
      });
    }, 3000);
  };

  return (
    <>
      <Head>
        <title>Website Apps - Professional Website Applications | iShareHow Ventures</title>
        <meta
          name="description"
          content="Get a professional, fully customizable website application for $699. AI-powered setup and deployment. Perfect for businesses ready to launch online."
        />
      </Head>
      <AppShell active="products">
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
          {/* Hero Section */}
          <Box
            sx={{
              pt: { xs: 8, md: 12 },
              pb: { xs: 8, md: 12 },
              background: isDark
                ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`
                : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Container maxWidth="lg">
              <Fade in timeout={1000}>
                <Box sx={{ textAlign: 'center', maxWidth: 800, mx: 'auto' }}>
                  <Typography
                    variant="h1"
                    sx={{
                      fontSize: { xs: '2.5rem', md: '4rem' },
                      fontWeight: 800,
                      mb: 3,
                      background: isDark
                        ? `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.secondary.light} 100%)`
                        : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    Create your website today
                  </Typography>
                  <Typography
                    variant="h5"
                    color="text.secondary"
                    sx={{ mb: 4, fontSize: { xs: '1.1rem', md: '1.25rem' } }}
                  >
                    Professional website applications built with modern technologies. 
                    Fully customizable, responsive, and ready to launch in days, not months.
                  </Typography>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    justifyContent="center"
                    sx={{ mt: 4 }}
                  >
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleShopifyCheckout}
                      endIcon={<ShoppingCartIcon />}
                      sx={{
                        minWidth: { xs: '100%', sm: 200 },
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                      }}
                    >
                      Purchase Now - ${PRODUCT_PRICE}
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => {
                        document.getElementById('ai-builder')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      endIcon={<BuildIcon />}
                      sx={{
                        minWidth: { xs: '100%', sm: 200 },
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                      }}
                    >
                      Use AI Builder
                    </Button>
                  </Stack>
                </Box>
              </Fade>
            </Container>
          </Box>

          {/* Features Section */}
          <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}>
            <Container maxWidth="lg">
              <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography
                  variant="overline"
                  sx={{ color: 'primary.main', fontWeight: 600, letterSpacing: 2 }}
                >
                  Feature highlights
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 700, mt: 2, mb: 2 }}>
                  Have everything you need
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                  Let's see what makes our website apps super powerful and user-friendly!
                </Typography>
              </Box>
              <Grid container spacing={3}>
                {features.map((feature, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Fade in timeout={500} style={{ transitionDelay: `${index * 100}ms` }}>
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
                        <Box
                          sx={{
                            display: 'inline-flex',
                            p: 2,
                            borderRadius: 2,
                            bgcolor: 'primary.main',
                            color: 'white',
                            mb: 2,
                          }}
                        >
                          {feature.icon}
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {feature.description}
                        </Typography>
                      </Card>
                    </Fade>
                  </Grid>
                ))}
              </Grid>
            </Container>
          </Box>

          {/* AI Builder Section */}
          <Box
            id="ai-builder"
            sx={{
              py: { xs: 8, md: 12 },
              bgcolor: 'background.default',
            }}
          >
            <Container maxWidth="md">
              <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography
                  variant="overline"
                  sx={{ color: 'primary.main', fontWeight: 600, letterSpacing: 2 }}
                >
                  AI Builder
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 700, mt: 2, mb: 2 }}>
                  Let iShareHow handle the rest
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Tell us about your business and we'll customize your website app automatically using AI.
                  No technical knowledge required!
                </Typography>
              </Box>
              <Paper
                elevation={4}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 3,
                }}
              >
                {aiFormSubmitted ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                      Request Submitted!
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      We've received your information. Our AI will start building your custom website app.
                      You'll receive an email with next steps shortly.
                    </Typography>
                  </Box>
                ) : (
                  <form onSubmit={handleAiFormSubmit}>
                    <Stack spacing={3}>
                      <TextField
                        fullWidth
                        label="Business Name"
                        value={aiFormData.businessName}
                        onChange={(e) =>
                          setAiFormData({ ...aiFormData, businessName: e.target.value })
                        }
                        required
                        placeholder="Acme Inc."
                      />
                      <TextField
                        fullWidth
                        label="Industry"
                        value={aiFormData.industry}
                        onChange={(e) =>
                          setAiFormData({ ...aiFormData, industry: e.target.value })
                        }
                        required
                        placeholder="E-commerce, SaaS, Healthcare, etc."
                      />
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Desired Features"
                        value={aiFormData.features}
                        onChange={(e) =>
                          setAiFormData({ ...aiFormData, features: e.target.value })
                        }
                        required
                        placeholder="Describe the features you need: user authentication, payment processing, dashboard, etc."
                        helperText="Be as specific as possible to help our AI build exactly what you need"
                      />
                      <TextField
                        fullWidth
                        label="Timeline"
                        value={aiFormData.timeline}
                        onChange={(e) =>
                          setAiFormData({ ...aiFormData, timeline: e.target.value })
                        }
                        required
                        placeholder="1 week, 2 weeks, 1 month, etc."
                      />
                      <TextField
                        fullWidth
                        type="email"
                        label="Email Address"
                        value={aiFormData.email}
                        onChange={(e) =>
                          setAiFormData({ ...aiFormData, email: e.target.value })
                        }
                        required
                        placeholder="your@email.com"
                      />
                      <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        fullWidth
                        endIcon={<AutoAwesomeIcon />}
                        sx={{
                          py: 1.5,
                          fontSize: '1.1rem',
                          fontWeight: 600,
                        }}
                      >
                        Let AI Build My Website App
                      </Button>
                      <Typography variant="caption" color="text.secondary" textAlign="center">
                        By submitting this form, you agree to purchase the Website Apps package for ${PRODUCT_PRICE}.
                        You'll be redirected to checkout after submission.
                      </Typography>
                    </Stack>
                  </form>
                )}
              </Paper>
            </Container>
          </Box>

          {/* Pricing Section */}
          <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.paper' }}>
            <Container maxWidth="lg">
              <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography
                  variant="overline"
                  sx={{ color: 'primary.main', fontWeight: 600, letterSpacing: 2 }}
                >
                  pricing plans
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 700, mt: 2, mb: 2 }}>
                  Transparent pricing
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
                  One simple price. Everything included. No hidden fees.
                </Typography>
              </Box>
              <Grid container justifyContent="center">
                <Grid item xs={12} md={6} lg={4}>
                  <Card
                    elevation={4}
                    sx={{
                      p: 4,
                      textAlign: 'center',
                      position: 'relative',
                      border: `2px solid ${theme.palette.primary.main}`,
                    }}
                  >
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 16,
                        right: 16,
                        bgcolor: 'primary.main',
                        color: 'white',
                        px: 2,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      BEST VALUE
                    </Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                      Website Apps
                    </Typography>
                    <Box sx={{ my: 3 }}>
                      <Typography
                        component="span"
                        variant="h2"
                        sx={{ fontWeight: 800, color: 'primary.main' }}
                      >
                        ${PRODUCT_PRICE}
                      </Typography>
                    </Box>
                    <Stack spacing={2} sx={{ mb: 4, textAlign: 'left' }}>
                      {[
                        'Fully functional website application',
                        'Responsive design (mobile, tablet, desktop)',
                        'Modern UI components',
                        'User authentication system',
                        'Admin dashboard',
                        '3 months of support',
                        'Source code included',
                        'Commercial license',
                        'Free updates for 6 months',
                        'AI-powered customization available',
                      ].map((feature, index) => (
                        <Stack direction="row" spacing={2} key={index}>
                          <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                          <Typography variant="body2">{feature}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                    <Button
                      variant="contained"
                      size="large"
                      fullWidth
                      onClick={handleShopifyCheckout}
                      endIcon={<ShoppingCartIcon />}
                      sx={{
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 600,
                      }}
                    >
                      Purchase Now
                    </Button>
                  </Card>
                </Grid>
              </Grid>
            </Container>
          </Box>

          {/* FAQ Section */}
          <Box sx={{ py: { xs: 8, md: 12 }, bgcolor: 'background.default' }}>
            <Container maxWidth="md">
              <Box sx={{ textAlign: 'center', mb: 6 }}>
                <Typography variant="h2" sx={{ fontWeight: 700, mb: 2 }}>
                  Frequently asked questions
                </Typography>
              </Box>
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
              <Box sx={{ textAlign: 'center', mt: 6 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  Still have questions?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Please describe your case to receive the most accurate advice.
                </Typography>
                <Button
                  variant="outlined"
                  href="mailto:support@isharehow.app?subject=Website Apps Question"
                  component="a"
                  endIcon={<ArrowForwardIcon />}
                >
                  Contact us
                </Button>
              </Box>
            </Container>
          </Box>

          {/* CTA Section */}
          <Box
            sx={{
              py: { xs: 8, md: 12 },
              bgcolor: 'background.paper',
              background: isDark
                ? `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`
                : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
            }}
          >
            <Container maxWidth="md">
              <Box sx={{ textAlign: 'center' }}>
                <Typography
                  variant="h2"
                  sx={{
                    fontWeight: 700,
                    mb: 3,
                    fontSize: { xs: '2rem', md: '3rem' },
                  }}
                >
                  Start now, create your website today
                </Typography>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  justifyContent="center"
                  sx={{ mt: 4 }}
                >
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleShopifyCheckout}
                    endIcon={<ShoppingCartIcon />}
                    sx={{
                      minWidth: { xs: '100%', sm: 200 },
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                    }}
                  >
                    Purchase Now
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={() => {
                      document.getElementById('ai-builder')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    endIcon={<BuildIcon />}
                    sx={{
                      minWidth: { xs: '100%', sm: 200 },
                      py: 1.5,
                      fontSize: '1.1rem',
                      fontWeight: 600,
                    }}
                  >
                    Try AI Builder
                  </Button>
                </Stack>
              </Box>
            </Container>
          </Box>

          {/* Scroll to Top Button */}
          <Zoom in={showScrollTop}>
            <Box
              onClick={scrollToTop}
              sx={{
                position: 'fixed',
                bottom: 32,
                right: 32,
                zIndex: 1000,
                cursor: 'pointer',
              }}
            >
              <Button
                variant="contained"
                color="primary"
                sx={{
                  minWidth: 48,
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                }}
              >
                <ArrowForwardIcon sx={{ transform: 'rotate(-90deg)' }} />
              </Button>
            </Box>
          </Zoom>
        </Box>
      </AppShell>
    </>
  );
}

