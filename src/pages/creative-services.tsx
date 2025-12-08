import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
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
  CircularProgress
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Business as BusinessIcon,
  Phone as PhoneIcon,
  Send as SendIcon,
  AttachMoney as AttachMoneyIcon,
} from '@mui/icons-material';
import { getBackendUrl } from '../utils/backendUrl';

const CreativeServicesPage = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  
  // Client Prospect Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    message: '',
    marketingBudget: '',
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
          marketingBudget: formData.marketingBudget.trim() || undefined,
          source: 'creative_services_landing',
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
        marketingBudget: '',
      });
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit form. Please try again.');
    } finally {
      setFormLoading(false);
    }
  };
  
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
        <meta name="description" content="Transform your digital presence with strategic creative services, custom applications, and AI-powered content training from iShareHow Studios & Ventures." />
      </Head>

      <Box sx={{ bgcolor: 'background.default', color: 'text.primary', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
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
          bgcolor: isDark ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.8)',
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}>
          <Container maxWidth="lg">
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 2.5 }}>
              <Link href="/" style={{ textDecoration: 'none' }}>
                <Typography variant="h5" fontWeight={700} color="text.primary">
                  <span>iShareHow </span>
                  <span style={gradientStyle}>Studios</span>
                </Typography>
              </Link>
              <Stack direction="row" spacing={4} alignItems="center" sx={{ display: { xs: 'none', md: 'flex' } }}>
                <a href="#services" style={{ color: theme.palette.text.secondary, textDecoration: 'none', fontWeight: 500 }}>Services</a>
                <a href="#results" style={{ color: theme.palette.text.secondary, textDecoration: 'none', fontWeight: 500 }}>Results</a>
                <a href="#training" style={{ color: theme.palette.text.secondary, textDecoration: 'none', fontWeight: 500 }}>AI Training</a>
                <a href="#contact" style={{ textDecoration: 'none' }}>
                  <Button sx={{
                    background: 'linear-gradient(90deg, #9333ea 0%, #ec4899 100%)',
                    color: 'white',
                    borderRadius: '50px',
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    '&:hover': { transform: 'scale(1.05)' }
                  }}>
                    Get Started
                  </Button>
                </a>
              </Stack>
            </Stack>
          </Container>
        </Box>

        {/* Hero Section */}
        <Box component="section" sx={{ position: 'relative', zIndex: 1, pt: { xs: 15, md: 20 }, pb: { xs: 10, md: 15 } }}>
          <Container maxWidth="lg">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <Stack alignItems="center" spacing={4}>
                <Chip label="✨ Welcome, Fellow Guardian of the Digital Realm" sx={{
                  bgcolor: 'rgba(168, 85, 247, 0.15)',
                  color: '#a855f7',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                  fontWeight: 600,
                  px: 2,
                  py: 3,
                  fontSize: '1rem'
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
                  color: 'text.secondary',
                  maxWidth: '900px',
                  lineHeight: 1.8,
                  fontSize: { xs: '1.1rem', md: '1.4rem' }
                }}>
                  I'm thrilled you've found your way here. As the Director behind{' '}
                  <a href="http://isharehowlabs.com" target="_blank" rel="noopener noreferrer" 
                     style={{ color: '#a855f7', fontWeight: 600, textDecoration: 'none', borderBottom: '2px solid rgba(168, 85, 247, 0.5)' }}>
                    iShareHow Labs
                  </a>
                  , I've poured years of hands-on experience into demystifying the digital landscape and fortifying strategies for organizations big and small.
                </Typography>

                <Typography variant="h6" textAlign="center" sx={{ 
                  color: 'text.secondary', 
                  maxWidth: '800px', 
                  fontSize: { xs: '1rem', md: '1.2rem' },
                  lineHeight: 1.7
                }}>
                  This system isn't just another subscription—
                  <strong style={{ color: theme.palette.text.primary, fontWeight: 700 }}> it's your direct line to overwhelming value</strong>, 
                  where my niche expertise becomes your competitive advantage.
                </Typography>
              </Stack>
            </motion.div>
          </Container>
        </Box>

        {/* Understanding the Digital Landscape */}
        <Box component="section" sx={{ position: 'relative', zIndex: 1, py: { xs: 12, md: 20 }, bgcolor: 'background.paper' }}>
          <Container maxWidth="lg">
            <Stack spacing={10}>
              <Box>
                <Typography variant="h2" fontWeight={800} gutterBottom textAlign="center" sx={{ 
                  fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                  mb: 6,
                  color: 'text.primary'
                }}>
                  <span style={gradientStyle}>Understanding the Digital Landscape</span>
                </Typography>
                
                <Typography variant="h5" sx={{ 
                  color: 'text.secondary', 
                  maxWidth: '1000px', 
                  mx: 'auto', 
                  lineHeight: 1.9,
                  textAlign: 'center',
                  mb: 4
                }}>
                  As organizations navigate the complexities of the digital world, the need for innovative solutions and strategic development has never been greater. At <strong style={{ color: '#a855f7' }}>iShareHow Creative Labs</strong>, we are dedicated to demystifying this landscape, offering tools that enhance operational capabilities and grow your project.
                </Typography>

                <Typography variant="h5" sx={{ 
                  color: 'text.secondary', 
                  maxWidth: '900px', 
                  mx: 'auto', 
                  lineHeight: 1.9,
                  textAlign: 'center',
                  fontSize: { xs: '1.2rem', md: '1.4rem' }
                }}>
                  Our mission is clear: to empower businesses through tailored applications and services that meet diverse needs.
                </Typography>
              </Box>

              <Typography variant="h4" fontWeight={700} textAlign="center" sx={{ color: '#a855f7', mb: 4 }}>
                Here's how we achieve that:
              </Typography>

              <Grid container spacing={6}>
                {[
                  { 
                    icon: '🚀', 
                    title: 'Innovative Solutions', 
                    desc: 'We develop cutting-edge apps that streamline operations, improve efficiency, and foster growth.' 
                  },
                  { 
                    icon: '🎯', 
                    title: 'Strategic Development', 
                    desc: 'Our team collaborates closely with partners to create solutions that align with their unique goals.' 
                  },
                  { 
                    icon: '🛡️', 
                    title: 'Ongoing Support', 
                    desc: 'We provide continuous support to help businesses adapt and thrive in an ever-changing digital environment.' 
                  }
                ].map((item, idx) => (
                  <Grid item xs={12} md={4} key={idx}>
                    <motion.div 
                      initial={{ opacity: 0, y: 30 }} 
                      whileInView={{ opacity: 1, y: 0 }} 
                      viewport={{ once: true }} 
                      transition={{ delay: idx * 0.2 }}
                      whileHover={{ y: -10, scale: 1.02 }}
                    >
                      <Card sx={{
                        height: '100%',
                        bgcolor: 'background.paper',
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: '24px',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          border: '1px solid #a855f7',
                          boxShadow: '0 20px 40px rgba(168, 85, 247, 0.2)',
                        }
                      }}>
                        <CardContent sx={{ p: 5 }}>
                          <Typography variant="h1" sx={{ mb: 3, fontSize: '4rem' }}>{item.icon}</Typography>
                          <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 3, color: 'text.primary' }}>{item.title}</Typography>
                          <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1.1rem', lineHeight: 1.7 }}>
                            {item.desc}
                          </Typography>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </Container>
        </Box>

        {/* Key Offerings */}
        <Box component="section" id="services" sx={{ position: 'relative', zIndex: 1, py: { xs: 12, md: 20 } }}>
          <Container maxWidth="lg">
            <Stack spacing={10}>
              <Box textAlign="center">
                <Typography variant="h2" fontWeight={800} gutterBottom sx={{ fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' }, mb: 4 }}>
                  <span style={gradientStyle}>Key Offerings</span>
                </Typography>
                <Typography variant="h5" sx={{ color: 'text.secondary', maxWidth: '900px', mx: 'auto', lineHeight: 1.8 }}>
                  iShareHow Studios and Ventures stands out with a variety of offerings designed to address specific business challenges
                </Typography>
              </Box>

              <Stack spacing={8}>
                {/* Service 1: Customized Applications */}
                <motion.div 
                  initial={{ opacity: 0, x: -50 }} 
                  whileInView={{ opacity: 1, x: 0 }} 
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card sx={{
                    bgcolor: 'background.paper',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: '24px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      border: '1px solid #a855f7',
                      boxShadow: '0 20px 40px rgba(168, 85, 247, 0.2)',
                    }
                  }}>
                    <CardContent sx={{ p: { xs: 5, md: 8 } }}>
                      <Stack direction={{ xs: 'column', md: 'row' }} spacing={5} alignItems="start">
                        <Typography variant="h1" sx={{ fontSize: '5rem', flexShrink: 0 }}>📱</Typography>
                        <Stack spacing={4} flex={1}>
                          <Typography variant="h3" fontWeight={700} color="text.primary">
                            1. Customized Applications
                          </Typography>
                          <Typography variant="h6" sx={{ color: 'text.secondary', lineHeight: 1.8, fontSize: '1.2rem' }}>
                            We specialize in creating applications tailored to your business needs. Whether it's a mobile app for customer engagement or an internal tool for efficiency, we've got you covered.
                          </Typography>
                          <Card sx={{ 
                            bgcolor: isDark ? 'rgba(168, 85, 247, 0.1)' : 'rgba(168, 85, 247, 0.05)', 
                            border: '1px solid rgba(168, 85, 247, 0.3)',
                            borderRadius: '16px'
                          }}>
                            <CardContent sx={{ p: 4 }}>
                              <Stack direction="row" spacing={3} alignItems="start">
                                <Box sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '12px',
                                  bgcolor: '#a855f7',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0
                                }}>
                                  <Typography fontWeight={700} fontSize="1.2rem" color="white">✓</Typography>
                                </Box>
                                <Box>
                                  <Typography variant="h6" fontWeight={700} color="#a855f7" gutterBottom>
                                    Success Story: Retail Client
                                  </Typography>
                                  <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1.1rem', lineHeight: 1.7 }}>
                                    By implementing our customized inventory management app, a retail partner <strong style={{ color: theme.palette.text.primary }}>reduced stock discrepancies by 30%</strong>, leading to improved sales and customer satisfaction.
                                  </Typography>
                                </Box>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Service 2: Consulting Services */}
                <motion.div 
                  initial={{ opacity: 0, x: 50 }} 
                  whileInView={{ opacity: 1, x: 0 }} 
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card sx={{
                    bgcolor: 'background.paper',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: '24px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      border: '1px solid #ec4899',
                      boxShadow: '0 20px 40px rgba(236, 72, 153, 0.2)',
                    }
                  }}>
                    <CardContent sx={{ p: { xs: 5, md: 8 } }}>
                      <Stack direction={{ xs: 'column', md: 'row' }} spacing={5} alignItems="start">
                        <Typography variant="h1" sx={{ fontSize: '5rem', flexShrink: 0 }}>💼</Typography>
                        <Stack spacing={4} flex={1}>
                          <Typography variant="h3" fontWeight={700} color="text.primary">
                            2. Consulting Services
                          </Typography>
                          <Typography variant="h6" sx={{ color: 'text.secondary', lineHeight: 1.8, fontSize: '1.2rem' }}>
                            With our expertise, we guide organizations in navigating digital transformations, ensuring they leverage technology effectively.
                          </Typography>
                          <Card sx={{ 
                            bgcolor: isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)', 
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            borderRadius: '16px'
                          }}>
                            <CardContent sx={{ p: 4 }}>
                              <Stack direction="row" spacing={3} alignItems="start">
                                <Box sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '12px',
                                  bgcolor: '#3b82f6',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0
                                }}>
                                  <Typography fontWeight={700} fontSize="1.2rem" color="white">✓</Typography>
                                </Box>
                                <Box>
                                  <Typography variant="h6" fontWeight={700} color="#3b82f6" gutterBottom>
                                    Success Story: Logistics Company
                                  </Typography>
                                  <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1.1rem', lineHeight: 1.7 }}>
                                    Our consulting services helped streamline their supply chain operations, resulting in a noteworthy <strong style={{ color: theme.palette.text.primary }}>25% reduction in delivery times</strong>.
                                  </Typography>
                                </Box>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Service 3: Training Programs */}
                <motion.div 
                  initial={{ opacity: 0, x: -50 }} 
                  whileInView={{ opacity: 1, x: 0 }} 
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.02 }}
                >
                  <Card sx={{
                    bgcolor: 'background.paper',
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: '24px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      border: '1px solid #22c55e',
                      boxShadow: '0 20px 40px rgba(34, 197, 94, 0.2)',
                    }
                  }}>
                    <CardContent sx={{ p: { xs: 5, md: 8 } }}>
                      <Stack direction={{ xs: 'column', md: 'row' }} spacing={5} alignItems="start">
                        <Typography variant="h1" sx={{ fontSize: '5rem', flexShrink: 0 }}>🎓</Typography>
                        <Stack spacing={4} flex={1}>
                          <Typography variant="h3" fontWeight={700} color="text.primary">
                            3. Training Programs
                          </Typography>
                          <Typography variant="h6" sx={{ color: 'text.secondary', lineHeight: 1.8, fontSize: '1.2rem' }}>
                            We offer training sessions to empower your team with the knowledge they need to make the most of our solutions.
                          </Typography>
                          <Card sx={{ 
                            bgcolor: isDark ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)', 
                            border: '1px solid rgba(34, 197, 94, 0.3)',
                            borderRadius: '16px'
                          }}>
                            <CardContent sx={{ p: 4 }}>
                              <Stack direction="row" spacing={3} alignItems="start">
                                <Box sx={{
                                  width: 40,
                                  height: 40,
                                  borderRadius: '12px',
                                  bgcolor: '#22c55e',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0
                                }}>
                                  <Typography fontWeight={700} fontSize="1.2rem" color="white">✓</Typography>
                                </Box>
                                <Box>
                                  <Typography variant="h6" fontWeight={700} color="#22c55e" gutterBottom>
                                    Success Story: Healthcare Provider
                                  </Typography>
                                  <Typography variant="body1" sx={{ color: 'text.secondary', fontSize: '1.1rem', lineHeight: 1.7 }}>
                                    Through our training programs, staff members improved their digital skillset, <strong style={{ color: theme.palette.text.primary }}>enhancing patient interactions and overall service quality</strong>.
                                  </Typography>
                                </Box>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </motion.div>
              </Stack>
            </Stack>
          </Container>
        </Box>

        {/* AI Content Training Program - THE MAIN OFFER */}
        <Box component="section" id="training" sx={{ 
          position: 'relative', 
          zIndex: 1, 
          py: { xs: 12, md: 20 }, 
          bgcolor: 'background.default',
          background: isDark 
            ? 'linear-gradient(180deg, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)'
            : 'linear-gradient(180deg, rgba(168, 85, 247, 0.05) 0%, rgba(236, 72, 153, 0.05) 100%)'
        }}>
          <Container maxWidth="lg">
            <Stack spacing={10} alignItems="center">
              <Chip label="🎤 FEATURED PROGRAM" sx={{
                bgcolor: 'rgba(168, 85, 247, 0.2)',
                color: '#a855f7',
                border: '1px solid rgba(168, 85, 247, 0.4)',
                fontWeight: 700,
                fontSize: '1rem',
                px: 4,
                py: 3
              }} />
              
              <Typography variant="h2" fontWeight={800} textAlign="center" sx={{ 
                fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4.5rem' }, 
                maxWidth: '1000px',
                lineHeight: 1.2
              }}>
                <span style={gradientStyle}>Unlock Your Voice:</span>
                <br />
                Join Our Affiliate AI Content Training Program!
              </Typography>

              <Typography variant="h4" textAlign="center" sx={{ 
                color: 'text.secondary', 
                maxWidth: '900px',
                lineHeight: 1.8,
                fontSize: { xs: '1.3rem', md: '1.6rem' }
              }}>
                Are you ready to amplify your message, build your influence, and master the new frontier of digital content creation?
              </Typography>

              <Typography variant="h5" textAlign="center" sx={{ 
                color: 'text.secondary', 
                maxWidth: '850px',
                lineHeight: 1.7,
                fontSize: { xs: '1.1rem', md: '1.3rem' }
              }}>
                The <strong style={{ color: theme.palette.text.primary }}>iShareHow Labs & Rise With Jamel</strong> are thrilled to announce our exclusive Affiliate AI Content Training Program, designed to empower you to become a true thought leader in your niche, leveraging cutting-edge AI tools.
              </Typography>

              <Card sx={{
                width: '100%',
                maxWidth: '1100px',
                bgcolor: 'background.paper',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '32px',
              }}>
                <CardContent sx={{ p: { xs: 5, md: 10 } }}>
                  <Stack spacing={6}>
                    <Typography variant="h3" fontWeight={700} sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, color: 'text.primary' }}>
                      Why This Program? It's About Influence & Impact.
                    </Typography>
                    
                    <Typography variant="h6" sx={{ 
                      color: 'text.secondary', 
                      fontSize: { xs: '1.1rem', md: '1.3rem' }, 
                      lineHeight: 1.9 
                    }}>
                      This isn't just another course on AI. This program is for the <strong style={{ color: theme.palette.text.primary }}>future content creators of the digital age</strong> – those who understand that true impact comes from clear communication, strategic influence, and a deep connection with their audience.
                    </Typography>

                    <Typography variant="h6" sx={{ 
                      color: 'text.secondary', 
                      fontSize: { xs: '1.1rem', md: '1.3rem' }, 
                      lineHeight: 1.9 
                    }}>
                      We believe AI is a powerful tool for self-reliance, allowing you to scale your voice and reach like never before.
                    </Typography>

                    <Typography variant="h4" fontWeight={700} color="#a855f7" sx={{ pt: 4, fontSize: { xs: '1.8rem', md: '2.2rem' } }}>
                      Imagine using AI to:
                    </Typography>

                    <Grid container spacing={4}>
                      {[
                        'Explain complex cybersecurity concepts with crystal clarity',
                        'Articulate the principles of decentralized living and self-sovereignty',
                        'Share the wisdom of bushcraft and nature-based resilience',
                        'Craft compelling narratives that explore consciousness, energy, and aura',
                        'Build your empire with the strategies we use ourselves'
                      ].map((item, idx) => (
                        <Grid item xs={12} key={idx}>
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: idx * 0.1 }}
                          >
                            <Card sx={{ 
                              bgcolor: isDark ? 'rgba(168, 85, 247, 0.1)' : 'rgba(168, 85, 247, 0.05)', 
                              border: '1px solid rgba(168, 85, 247, 0.2)',
                              borderRadius: '16px',
                              '&:hover': { border: '1px solid rgba(168, 85, 247, 0.4)' }
                            }}>
                              <CardContent sx={{ p: 3 }}>
                                <Stack direction="row" spacing={3} alignItems="center">
                                  <Typography color="#a855f7" fontSize="2rem" fontWeight={700}>✓</Typography>
                                  <Typography variant="h6" sx={{ fontSize: { xs: '1.1rem', md: '1.2rem' }, color: 'text.primary' }}>
                                    {item}
                                  </Typography>
                                </Stack>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </Grid>
                      ))}
                    </Grid>

                    <Typography variant="h5" fontWeight={700} sx={{ 
                      pt: 4, 
                      color: '#ec4899',
                      fontSize: { xs: '1.3rem', md: '1.5rem' }
                    }}>
                      This program embodies our collective's spirit and we will teach you what we do to build our empire.
                    </Typography>
                  </Stack>
                </CardContent>
              </Card>

              <Box sx={{ width: '100%', maxWidth: '1100px' }}>
                <Typography variant="h3" fontWeight={700} textAlign="center" sx={{ mb: 8, fontSize: { xs: '2rem', md: '2.5rem' } }}>
                  What You'll Master:
                </Typography>

                <Grid container spacing={5}>
                  {[
                    {
                      title: 'Generate High-Quality Content with AI',
                      desc: 'Learn to prompt, refine, and edit AI-generated text for articles, social media, scripts, and more.'
                    },
                    {
                      title: 'Develop Your Unique Voice',
                      desc: 'Use AI to enhance your personal brand, ensuring your content reflects your authentic self and natural psychologist inclination.'
                    },
                    {
                      title: 'Build an Affiliate Empire',
                      desc: 'Understand the strategies behind affiliate marketing and how to monetize your AI-powered content effectively.'
                    },
                    {
                      title: 'Master Content Strategy',
                      desc: 'Plan, produce, and distribute content that attracts your ideal audience and converts engagement into opportunity.'
                    },
                    {
                      title: 'Ethical AI Use',
                      desc: 'Navigate the ethical landscape of AI content creation, ensuring authenticity and integrity in all your endeavors.'
                    },
                    {
                      title: 'Amplify Your Message',
                      desc: 'Transform your passion into influence, building a platform that truly moves the collective forward.'
                    }
                  ].map((skill, idx) => (
                    <Grid item xs={12} md={6} key={idx}>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                        whileHover={{ y: -8 }}
                      >
                        <Card sx={{
                          height: '100%',
                          bgcolor: 'background.paper',
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: '20px',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            border: '1px solid #a855f7',
                            boxShadow: '0 15px 35px rgba(168, 85, 247, 0.3)',
                          }
                        }}>
                          <CardContent sx={{ p: 5 }}>
                            <Typography variant="h5" fontWeight={700} gutterBottom sx={{ 
                              color: '#a855f7',
                              fontSize: { xs: '1.3rem', md: '1.5rem' },
                              mb: 2
                            }}>
                              {skill.title}
                            </Typography>
                            <Typography variant="body1" sx={{ 
                              color: 'text.secondary', 
                              fontSize: { xs: '1rem', md: '1.1rem' },
                              lineHeight: 1.7
                            }}>
                              {skill.desc}
                            </Typography>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              <Card sx={{
                width: '100%',
                maxWidth: '1000px',
                bgcolor: 'background.paper',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '32px',
              }}>
                <CardContent sx={{ p: { xs: 5, md: 8 } }}>
                  <Typography variant="h3" fontWeight={700} gutterBottom sx={{ fontSize: { xs: '2rem', md: '2.5rem' }, mb: 5, color: 'text.primary' }}>
                    Who Is This For?
                  </Typography>
                  <Typography variant="h6" sx={{ 
                    color: 'text.secondary', 
                    mb: 6,
                    fontSize: { xs: '1.1rem', md: '1.3rem' }
                  }}>
                    This program is for any member of the Collective eager to:
                  </Typography>
                  <Grid container spacing={3}>
                    {[
                      'Become a recognized authority in their field',
                      'Monetize their insights and build new income streams',
                      'Scale their content creation without sacrificing quality',
                      'Develop a powerful online presence that reflects their deepest values',
                      'Lead and inspire through compelling digital narratives',
                      'Step into their full potential as a guiding voice in the digital world'
                    ].map((item, idx) => (
                      <Grid item xs={12} sm={6} key={idx}>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Box sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '10px',
                            bgcolor: '#ec4899',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <Typography fontWeight={700} fontSize="1.2rem" color="white">→</Typography>
                          </Box>
                          <Typography variant="h6" sx={{ fontSize: { xs: '1rem', md: '1.1rem' }, color: 'text.primary' }}>
                            {item}
                          </Typography>
                        </Stack>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>

              <Box textAlign="center" sx={{ pt: 6 }}>
                <Typography variant="h2" fontWeight={800} gutterBottom sx={{ 
                  fontSize: { xs: '2.5rem', md: '3.5rem' },
                  mb: 6
                }}>
                  <span style={gradientStyle}>Ready to Lead the Content Revolution?</span>
                </Typography>
                
                <Typography variant="h5" sx={{ 
                  color: 'text.secondary', 
                  maxWidth: '800px', 
                  mx: 'auto',
                  mb: 8,
                  lineHeight: 1.8,
                  fontSize: { xs: '1.2rem', md: '1.4rem' }
                }}>
                  Don't just consume content – <strong style={{ color: theme.palette.text.primary }}>create it, strategically and powerfully</strong>. This is your opportunity to step into your full potential and become a guiding voice in the digital world.
                </Typography>

                <a href="#contact" style={{ textDecoration: 'none' }}>
                  <Button size="large" sx={{
                    background: 'linear-gradient(90deg, #9333ea 0%, #ec4899 100%)',
                    borderRadius: '50px',
                    padding: '24px 64px',
                    fontSize: '1.3rem',
                    fontWeight: 700,
                    textTransform: 'none',
                    color: 'white',
                    boxShadow: '0 15px 40px rgba(147, 51, 234, 0.4)',
                    '&:hover': { 
                      transform: 'scale(1.05)', 
                      boxShadow: '0 20px 50px rgba(147, 51, 234, 0.6)',
                      background: 'linear-gradient(90deg, #ec4899 0%, #9333ea 100%)'
                    }
                  }}>
                    <Stack>
                      <span>Contact Us About AI Content Training</span>
                      <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.9rem' }}>
                        Let's discuss how this program fits your goals
                      </Typography>
                    </Stack>
                  </Button>
                </a>
              </Box>
            </Stack>
          </Container>
        </Box>

        {/* Join Us in this New Chapter */}
        <Box component="section" id="contact" sx={{ position: 'relative', zIndex: 1, py: { xs: 12, md: 20 } }}>
          <Container maxWidth="lg">
            <Stack spacing={10} alignItems="center">
              <Typography variant="h2" fontWeight={800} textAlign="center" sx={{ 
                fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' }
              }}>
                <span style={gradientStyle}>Join Us in this New Chapter</span>
              </Typography>

              <Typography variant="h5" textAlign="center" sx={{ 
                color: 'text.secondary', 
                maxWidth: '900px',
                lineHeight: 1.8,
                fontSize: { xs: '1.2rem', md: '1.4rem' }
              }}>
                As we transition from iShareHow Labs to <strong style={{ color: theme.palette.text.primary }}>iShareHow Studios and Ventures</strong>, we invite partners and clients to embark on this journey with us. Together, we will continue to provide the resources and support necessary to navigate the digital landscape.
              </Typography>

              <Card sx={{
                width: '100%',
                maxWidth: '900px',
                bgcolor: 'background.paper',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '32px',
              }}>
                <CardContent sx={{ p: { xs: 6, md: 10 } }}>
                  <Typography variant="h3" fontWeight={700} gutterBottom textAlign="center" sx={{ 
                    mb: 5,
                    fontSize: { xs: '2rem', md: '2.5rem' },
                    color: 'text.primary'
                  }}>
                    Our Commitment to You
                  </Typography>
                  <Typography variant="h5" textAlign="center" sx={{ 
                    color: 'text.secondary', 
                    lineHeight: 1.9,
                    fontSize: { xs: '1.2rem', md: '1.4rem' }
                  }}>
                    Staying competitive in today's market requires innovation and strategy. At iShareHow Studios and Ventures, we are committed to standing by your side, helping you <strong style={{ color: '#a855f7' }}>unlock your business's full potential</strong>. Let's work together to harness the power of technology for your success.
                  </Typography>
                </CardContent>
              </Card>

              <Box sx={{ pt: 4, width: '100%', maxWidth: '800px', mx: 'auto' }}>
                {formSuccess ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <Card sx={{
                      bgcolor: 'background.paper',
                      border: `2px solid #22c55e`,
                      borderRadius: '24px',
                      p: 4,
                      textAlign: 'center'
                    }}>
                      <Typography variant="h4" fontWeight={700} color="#22c55e" gutterBottom>
                        ✓ Thank You!
                      </Typography>
                      <Typography variant="h6" sx={{ color: 'text.secondary', mb: 3 }}>
                        We've received your information and will contact you soon.
                      </Typography>
                      <Button
                        onClick={() => setFormSuccess(false)}
                        variant="outlined"
                        sx={{
                          borderColor: theme.palette.divider,
                          color: 'text.primary',
                          '&:hover': { borderColor: '#a855f7' }
                        }}
                      >
                        Submit Another
                      </Button>
                    </Card>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <Card sx={{
                      bgcolor: 'background.paper',
                      border: `1px solid ${theme.palette.divider}`,
                      borderRadius: '24px',
                      p: { xs: 4, md: 6 },
                      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
                    }}>
                      <Box sx={{ mb: 4, textAlign: 'center' }}>
                        <Typography variant="h3" fontWeight={800} gutterBottom sx={{ 
                          fontSize: { xs: '2rem', md: '2.5rem' },
                          background: 'linear-gradient(90deg, #9333ea 0%, #ec4899 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text'
                        }}>
                          Become a Client
                        </Typography>
                        <Typography variant="h6" sx={{ color: 'text.secondary', mt: 2 }}>
                          Fill out the form below and we'll get back to you within 24 hours
                        </Typography>
                      </Box>

                      {formError && (
                        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setFormError(null)}>
                          {formError}
                        </Alert>
                      )}

                      <form onSubmit={handleFormSubmit}>
                        <Stack spacing={3}>
                          <TextField
                            fullWidth
                            required
                            label="Full Name"
                            name="name"
                            value={formData.name}
                            onChange={handleFormChange}
                            placeholder="John Doe"
                            disabled={formLoading}
                            InputProps={{
                              startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                              }
                            }}
                          />

                          <TextField
                            fullWidth
                            required
                            type="email"
                            label="Email Address"
                            name="email"
                            value={formData.email}
                            onChange={handleFormChange}
                            placeholder="john@example.com"
                            disabled={formLoading}
                            InputProps={{
                              startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                              }
                            }}
                          />

                          <TextField
                            fullWidth
                            label="Company Name (Optional)"
                            name="company"
                            value={formData.company}
                            onChange={handleFormChange}
                            placeholder="Acme Inc."
                            disabled={formLoading}
                            InputProps={{
                              startAdornment: <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                              }
                            }}
                          />

                          <TextField
                            fullWidth
                            required
                            type="tel"
                            label="Phone Number"
                            name="phone"
                            value={formData.phone}
                            onChange={handleFormChange}
                            placeholder="+1 (555) 123-4567"
                            disabled={formLoading}
                            InputProps={{
                              startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                              }
                            }}
                          />

                          <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Tell us about your project (Optional)"
                            name="message"
                            value={formData.message}
                            onChange={handleFormChange}
                            placeholder="What services are you interested in? What are your goals?"
                            disabled={formLoading}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                              }
                            }}
                          />

                          <TextField
                            fullWidth
                            label="Marketing Budget"
                            name="marketingBudget"
                            value={formData.marketingBudget}
                            onChange={handleFormChange}
                            placeholder="Do you have a marketing budget available or willing to get one?"
                            helperText="Do you have a marketing budget available or willing to get one?"
                            disabled={formLoading}
                            InputProps={{
                              startAdornment: <AttachMoneyIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                            }}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: '12px',
                              }
                            }}
                          />

                          <Button
                            type="submit"
                            size="large"
                            fullWidth
                            disabled={formLoading}
                            sx={{
                              background: 'linear-gradient(90deg, #9333ea 0%, #ec4899 100%)',
                              borderRadius: '50px',
                              padding: '16px 32px',
                              fontSize: '1.1rem',
                              fontWeight: 700,
                              textTransform: 'none',
                              color: 'white',
                              boxShadow: '0 10px 30px rgba(147, 51, 234, 0.4)',
                              mt: 2,
                              '&:hover': { 
                                transform: 'scale(1.02)', 
                                boxShadow: '0 15px 40px rgba(147, 51, 234, 0.6)',
                                background: 'linear-gradient(90deg, #ec4899 0%, #9333ea 100%)'
                              },
                              '&:disabled': {
                                background: 'linear-gradient(90deg, #9333ea 0%, #ec4899 100%)',
                                opacity: 0.7
                              }
                            }}
                            startIcon={formLoading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                          >
                            {formLoading ? 'Submitting...' : 'Submit Application'}
                          </Button>
                        </Stack>
                      </form>
                    </Card>
                  </motion.div>
                )}
              </Box>
            </Stack>
          </Container>
        </Box>

        {/* Footer */}
        <Box component="footer" sx={{ position: 'relative', zIndex: 1, py: 8, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
          <Container>
            <Stack spacing={2} alignItems="center">
              <Typography sx={{ color: 'text.secondary', fontSize: '1rem' }}>
                © 2024 iShareHow Studios & Ventures. All rights reserved.
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Core operations: <a href="http://isharehowlabs.com" target="_blank" rel="noopener noreferrer" style={{ color: '#a855f7', textDecoration: 'none' }}>isharehowlabs.com</a>
              </Typography>
            </Stack>
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default CreativeServicesPage;
