import * as React from 'react';
import Head from 'next/head';
import { Box, Container, Typography, Grid, Button, Stack, Chip, Card, CardContent, Divider, List, ListItem, ListItemIcon, ListItemText, Avatar, TextField, Alert, useTheme, Theme } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SecurityIcon from '@mui/icons-material/Security';
import SpeedIcon from '@mui/icons-material/Speed';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InsightsIcon from '@mui/icons-material/Insights';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import BusinessIcon from '@mui/icons-material/Business';
import { motion } from 'framer-motion';
import { getBackendUrl } from '../utils/backendUrl';

const Section = ({ children, background = 'transparent', py = { xs: 10, md: 14 } }: { children: React.ReactNode; background?: string | ((theme: Theme) => string); py?: any }) => {
  const theme = useTheme();
  const bgcolor = typeof background === 'function' ? background(theme) : background;
  return <Box sx={{ py, bgcolor }}>{children}</Box>;
};

const Feature = ({ overline, title, body, bullets, image, reverse = false }: { overline: string; title: string; body: string; bullets: string[]; image: string; reverse?: boolean }) => (
  <Section>
    <Container maxWidth="lg">
      <Grid container spacing={{ xs: 6, md: 10 }} alignItems="center" direction={reverse ? 'row-reverse' : 'row'}>
        <Grid item xs={12} md={6}>
          <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 2, fontSize: '0.875rem', fontWeight: 600 }}>
            {overline}
          </Typography>
          <Typography variant="h3" component="h3" sx={{ fontWeight: 800, mt: 2, mb: 3, fontSize: { xs: '2rem', md: '2.5rem' }, lineHeight: 1.2 }}>
            {title}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, fontSize: '1.125rem', lineHeight: 1.7 }}>
            {body}
          </Typography>
          <List sx={{ '& .MuiListItem-root': { py: 1.5 } }}>
            {bullets.map((b, i) => (
              <ListItem key={i} disableGutters>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <CheckCircleIcon color="primary" sx={{ fontSize: 28 }} />
                </ListItemIcon>
                <ListItemText
                  primaryTypographyProps={{
                    variant: 'body1',
                    sx: { fontSize: '1.0625rem', fontWeight: 500 }
                  }}
                  primary={b}
                />
              </ListItem>
            ))}
          </List>
        </Grid>
        <Grid item xs={12} md={6}>
          <Box
            component="img"
            src={image}
            alt={title}
            sx={{
              width: '100%',
              height: { xs: 300, md: 500 },
              objectFit: 'cover',
              borderRadius: 4,
              boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease',
              '&:hover': {
                transform: 'translateY(-8px)',
                boxShadow: '0 30px 80px rgba(0,0,0,0.25)',
              }
            }}
          />
        </Grid>
      </Grid>
    </Container>
  </Section>
);

const packages = [
  {
    name: 'Audit & Fix',
    price: '$150–$300',
    blurb: 'One-time. Perfect to test the waters and unlock quick wins.',
    cta: 'Buy now',
    href: 'https://shop.isharehow.app/products/untitled-dec11_10-41?utm_source=copyToPasteBoard&utm_medium=product-links&utm_content=web',
    features: [
      '1 pro creative asset OR 1 UX/UI video audit',
      'Actionable CRO improvements',
      'Delivery in 3 days, 2 revisions',
    ],
  },
  {
    name: 'Essential Core',
    price: '$950–$2,500',
    blurb: 'Landing page (up to 5 sections) OR Brand sprint with guidelines.',
    popular: true,
    cta: 'Start project',
    href: 'https://shop.isharehow.app/products/custom-webapp-built-by-ishare?utm_source=copyToPasteBoard&utm_medium=product-links&utm_content=web',
    features: [
      'Responsive build + basic SEO',
      'Design system: color, type, components',
      '10–14 day delivery, 3 revisions',
    ],
  },
  {
    name: 'AI & Enterprise',
    price: 'Custom',
    blurb: 'Workflows, automation, design systems, and enablement for teams.',
    cta: 'Request proposal',
    href: '#contact-form',
    features: [
      'AI-assisted ops & content',
      'Design system + tokens',
      'Team onboarding and docs',
    ],
  },
];

const faqs = [
  { q: 'What if I need revisions?', a: 'Every package includes revisions. We iterate fast and keep scope tight for speed and quality.' },
  { q: 'Do you sign NDAs?', a: 'Yes. We can work with your standard NDA or provide ours.' },
  { q: 'What tools do you use?', a: 'Figma, Next.js, MUI, and modern analytics/CRO tooling. We plug into your stack as needed.' },
  { q: 'How do we start?', a: 'Pick a package or send a request. We will reply with a short plan and timeline the same day.' },
];

const FractionalDigitalAgencyPage = () => {
  const [formData, setFormData] = React.useState({ name: '', email: '', company: '', phone: '', message: '', package: '' });
  const [formLoading, setFormLoading] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [formSuccess, setFormSuccess] = React.useState(false);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (!formData.name) return 'Name is required';
    if (!formData.email) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'Please enter a valid email address';
    if (!formData.phone) return 'Phone number is required';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const v = validate();
    if (v) { setFormError(v); return; }
    setFormLoading(true); setFormError(null); setFormSuccess(false);
    try {
      const resp = await fetch(`${getBackendUrl()}/api/creative/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          company: formData.company || undefined,
          phone: formData.phone,
          message: formData.message || undefined,
          marketingBudget: formData.package || undefined,
          source: 'fractional_digital_agency',
          status: 'prospect',
        }),
      });
      if (!resp.ok) {
        let msg = 'Failed to submit form. Please try again.';
        try { const e = await resp.json(); if (e?.error) msg = e.error; } catch {}
        throw new Error(msg);
      }
      setFormSuccess(true);
      setFormData({ name: '', email: '', company: '', phone: '', message: '', package: '' });
    } catch (err: any) {
      setFormError(err?.message || 'Something went wrong.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Fractional Digital Agency – Modern, AI‑Powered Creative</title>
        <link rel="canonical" href="https://ventures.isharehow.app/fractional-digital-agency" />
        <meta name="description" content="Project-based creative, UI/UX, and growth. Fast iterations, real results, no long-term contracts." />
      </Head>

      {/* HERO */}
      <Box sx={{ position: 'relative', bgcolor: 'background.default', overflow: 'hidden' }}>
        <Box
          sx={{
            position: 'relative',
            py: { xs: 16, md: 24 },
            color: 'common.white',
            backgroundImage: `linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(30, 41, 59, 0.75)), url(https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed',
          }}
        >
          <Container maxWidth="lg">
            <Grid container spacing={6} alignItems="center">
              <Grid item xs={12} md={7}>
                <Typography variant="overline" sx={{ opacity: 0.9, letterSpacing: 2, fontSize: '0.875rem' }}>AI‑Powered Creative Services</Typography>
                <Typography variant="h1" component="h1" sx={{ fontWeight: 900, lineHeight: 1.2, mt: 2, mb: 3, fontSize: { xs: '2.5rem', md: '3.75rem' } }}>
                  Fractional Digital Agency for modern brands
                </Typography>
                <Typography variant="h5" sx={{ mt: 2, mb: 4, opacity: 0.95, fontWeight: 400, lineHeight: 1.6 }}>
                  Design, development, and growth—delivered fast, without the retainer bloat.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 4 }}>
                  <Button variant="contained" size="large" color="primary" href="#contact-form" endIcon={<ArrowForwardIcon/>} sx={{ px: 4, py: 1.5, fontSize: '1rem', fontWeight: 600 }}>
                    Get a proposal
                  </Button>
                  <Button variant="outlined" size="large" color="inherit" href="#packages" sx={{ px: 4, py: 1.5, fontSize: '1rem', fontWeight: 600, borderWidth: 2, '&:hover': { borderWidth: 2 } }}>
                    View packages
                  </Button>
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 5 }}>
                  <Chip icon={<SpeedIcon/>} label="Fast sprints" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 500, py: 2.5, '& .MuiChip-icon': { color: 'white' } }}/>
                  <Chip icon={<InsightsIcon/>} label="CRO‑driven" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 500, py: 2.5, '& .MuiChip-icon': { color: 'white' } }}/>
                  <Chip icon={<SecurityIcon/>} label="No long contracts" sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: 'white', fontWeight: 500, py: 2.5, '& .MuiChip-icon': { color: 'white' } }}/>
                </Stack>
              </Grid>
              <Grid item xs={12} md={5}>
                <Box
                  component="img"
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                  alt="Modern workspace"
                  sx={{
                    width: '100%',
                    height: { xs: 300, md: 500 },
                    objectFit: 'cover',
                    borderRadius: 4,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                  }}
                />
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>

      {/* FEATURES */}
      <Feature
        overline="Creative"
        title="Brand, web, and campaign assets that convert"
        body="We ship clean systems—typography, color, components—then apply them across landing pages and campaigns so everything feels deliberate and drives action."
        bullets={["Design system + tokens","Responsive landing pages","Ads, email, and social creative"]}
        image="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2071&q=80"
      />
      <Feature
        overline="Product"
        title="Ship UX/UI improvements weekly"
        body="Low-friction iterations on flows that matter—pricing, onboarding, dashboards—measured against real KPIs."
        bullets={["User‑tested flows","Faster path to value","Deep analytics & heatmaps"]}
        image="https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=2015&q=80"
        reverse
      />

      {/* RESULTS */}
      <Section background="background.default">
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={5}>
              <Typography variant="overline" color="text.secondary">Results</Typography>
              <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, mb: 2 }}>Before → After</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Recent engagements showing visual polish and measurable lift.
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip label="CRO"/>
                <Chip label="UX Upgrade"/>
                <Chip label="Brand Refresh"/>
              </Stack>
            </Grid>
            <Grid item xs={12} md={7}>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box
                    component="img"
                    src="https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2069&q=80"
                    alt="Before"
                    sx={{
                      width: '100%',
                      height: { xs: 200, sm: 280, md: 320 },
                      objectFit: 'cover',
                      borderRadius: 3,
                      boxShadow: 8,
                      transition: 'transform 0.3s ease',
                      '&:hover': { transform: 'scale(1.02)' }
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box
                    component="img"
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                    alt="After"
                    sx={{
                      width: '100%',
                      height: { xs: 200, sm: 280, md: 320 },
                      objectFit: 'cover',
                      borderRadius: 3,
                      boxShadow: 12,
                      transition: 'transform 0.3s ease',
                      '&:hover': { transform: 'scale(1.02)' }
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Section>

      {/* PACKAGES */}
      <Section background={(theme: any) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)'}>
        <Container maxWidth="lg" id="packages">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 2, fontSize: '0.875rem', fontWeight: 600 }}>
              Pricing
            </Typography>
            <Typography variant="h3" align="center" sx={{ fontWeight: 800, mt: 1, mb: 2, fontSize: { xs: '2rem', md: '2.75rem' } }}>
              Choose Your Package
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', fontSize: '1.125rem' }}>
              Select the plan that best fits your needs. You can change it anytime.
            </Typography>
          </Box>
          <Grid container spacing={4}>
            {packages.map((p) => (
              <Grid key={p.name} item xs={12} md={4}>
                <Card
                  elevation={p.popular ? 12 : 4}
                  sx={{
                    height: '100%',
                    position: 'relative',
                    border: p.popular ? (theme) => `2px solid ${theme.palette.primary.main}` : '1px solid',
                    borderColor: p.popular ? 'primary.main' : 'divider',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: p.popular ? 16 : 8,
                    }
                  }}
                >
                  {p.popular && (
                    <Chip
                      color="primary"
                      label="Most Popular"
                      sx={{
                        position: 'absolute',
                        top: 20,
                        right: 20,
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        height: 28,
                      }}
                    />
                  )}
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 1.5, fontSize: '0.75rem', fontWeight: 600 }}>
                      {p.name}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, mt: 1, mb: 2, color: 'primary.main' }}>
                      {p.price}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 1, mb: 3, lineHeight: 1.6 }}>
                      {p.blurb}
                    </Typography>
                    <Divider sx={{ my: 3 }}/>
                    <List sx={{ mb: 3, '& .MuiListItem-root': { py: 1 } }}>
                      {p.features.map((f: string) => (
                        <ListItem key={f} disableGutters>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <CheckCircleIcon color="success" sx={{ fontSize: 24 }} />
                          </ListItemIcon>
                          <ListItemText
                            primary={f}
                            primaryTypographyProps={{
                              variant: 'body1',
                              sx: { fontSize: '0.9375rem', fontWeight: 500 }
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>
                    <Button
                      fullWidth
                      variant={p.popular ? 'contained' : 'outlined'}
                      color={p.popular ? 'primary' : 'inherit'}
                      href={p.href}
                      size="large"
                      sx={{
                        mt: 2,
                        py: 1.5,
                        fontSize: '1rem',
                        fontWeight: 600,
                        ...(p.popular ? {} : { borderWidth: 2, '&:hover': { borderWidth: 2 } })
                      }}
                      endIcon={p.popular ? <ArrowForwardIcon /> : undefined}
                    >
                      {p.cta}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Section>

      {/* TESTIMONIAL */}
      <Section background={(theme: any) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={5}>
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                alt="Happy client"
                sx={{
                  width: '100%',
                  height: { xs: 300, md: 400 },
                  objectFit: 'cover',
                  borderRadius: 4,
                  boxShadow: 8,
                }}
              />
            </Grid>
            <Grid item xs={12} md={7}>
              <Card elevation={0} sx={{ p: { xs: 3, md: 5 }, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="flex-start">
                  <Avatar
                    src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
                    sx={{ width: 80, height: 80, border: '3px solid', borderColor: 'primary.main' }}
                  />
                  <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>“Polished, conversion‑focused, and fast.”</Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
                      We asked for a modern landing and clear value props. Delivered ahead of schedule with measurable lift in signups.
                    </Typography>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Janice Mora</Typography>
                    <Typography variant="caption" color="text.secondary">CEO, TechStart Inc.</Typography>
                  </Box>
                </Stack>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Section>

      {/* FAQ */}
      <Section>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 2, fontSize: '0.875rem', fontWeight: 600 }}>
              Support
            </Typography>
            <Typography variant="h3" align="center" sx={{ fontWeight: 800, mt: 1, mb: 2, fontSize: { xs: '2rem', md: '2.75rem' } }}>
              Frequently Asked Questions
            </Typography>
          </Box>
          <Stack spacing={3}>
            {faqs.map((f) => (
              <Card
                key={f.q}
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    boxShadow: 4,
                    transform: 'translateX(4px)',
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
                    {f.q}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {f.a}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Container>
      </Section>

      {/* CTA BAND */}
      <Box
        sx={{
          position: 'relative',
          py: { xs: 12, md: 16 },
          color: 'common.white',
          backgroundImage: `linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.9)), url(https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2084&q=80)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, fontSize: { xs: '2rem', md: '2.75rem' } }}>
                Ready to move fast?
              </Typography>
              <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 400, lineHeight: 1.6 }}>
                Send a brief and get a same‑day plan and timeline.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                <Button
                  size="large"
                  variant="contained"
                  color="primary"
                  href="#contact-form"
                  sx={{ px: 4, py: 1.5, fontSize: '1rem', fontWeight: 600 }}
                  endIcon={<ArrowForwardIcon/>}
                >
                  Get a proposal
                </Button>
                <Button
                  size="large"
                  variant="outlined"
                  color="inherit"
                  href="#packages"
                  sx={{ px: 4, py: 1.5, fontSize: '1rem', fontWeight: 600, borderWidth: 2, '&:hover': { borderWidth: 2, bgcolor: 'rgba(255,255,255,0.1)' } }}
                >
                  Explore packages
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CONTACT */}
      <Section background="transparent">
        <Container maxWidth="md" id="contact-form">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="overline" color="text.secondary" sx={{ letterSpacing: 2, fontSize: '0.875rem', fontWeight: 600 }}>
              Get Started
            </Typography>
            <Typography variant="h3" align="center" sx={{ fontWeight: 800, mt: 1, mb: 2, fontSize: { xs: '2rem', md: '2.75rem' } }}>
              Tell us about your project
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', fontSize: '1.125rem' }}>
              Fill out the form below and we'll get back to you within 24 hours with a custom proposal.
            </Typography>
          </Box>
          {formSuccess ? (
            <Card elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'success.main', bgcolor: 'success.light', textAlign: 'center' }}>
              <Alert severity="success" sx={{ fontSize: '1.125rem' }}>
                Thank you! We've received your request and will contact you within 24 hours.
              </Alert>
            </Card>
          ) : (
            <Card elevation={4} sx={{ p: { xs: 3, md: 5 }, border: '1px solid', borderColor: 'divider' }}>
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Name"
                      name="name"
                      value={formData.name}
                      onChange={handleFormChange}
                      required
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleFormChange}
                      required
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Company"
                      name="company"
                      value={formData.company}
                      onChange={handleFormChange}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleFormChange}
                      required
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Package Interest (optional)"
                      name="package"
                      value={formData.package}
                      onChange={handleFormChange}
                      placeholder="e.g., Audit & Fix, Essential Core, AI & Enterprise"
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
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
                      rows={5}
                      placeholder="What are you trying to achieve? Tell us about your project goals..."
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </Grid>
                  {formError && (
                    <Grid item xs={12}>
                      <Alert severity="error" sx={{ borderRadius: 2 }}>{formError}</Alert>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={formLoading}
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        py: 1.75,
                        fontSize: '1.0625rem',
                        fontWeight: 600,
                        borderRadius: 2,
                        textTransform: 'none',
                      }}
                    >
                      {formLoading ? 'Submitting…' : 'Submit request'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Card>
          )}
        </Container>
      </Section>
    </>
  );
};

export default FractionalDigitalAgencyPage;
