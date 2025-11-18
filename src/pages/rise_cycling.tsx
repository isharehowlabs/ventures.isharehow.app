import React, { useState, useEffect } from 'react';
import { Box, Typography, Container, Button, Card, CardContent, Grid, Link as MuiLink } from '@mui/material';
import Head from 'next/head';

const RiseCycling = () => {
  const [activeTab, setActiveTab] = useState('youtube');
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const ac = {
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
    boxShadow: `0 0 24px ${ac.accent2}aa, 0 2px 4px -1px ${ac.pink}44`,
    border: `1px solid ${ac.accent2}`,
    transition: 'transform 0.3s, box-shadow 0.3s, border-color 0.3s',
    color: ac.accent,
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
      transform: 'scale(1.04) translateY(-8px)',
      boxShadow: `0 0 48px ${ac.pink}aa, 0 0 24px ${ac.accent2}cc`,
      borderColor: ac.pink,
    },
    '&::before': {
      content: '""',
      position: 'absolute',
      top: '-40%',
      left: '-40%',
      width: '180%',
      height: '180%',
      background: `radial-gradient(circle, ${ac.pink}44 0%, ${ac.accent2}44 100%)`,
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
    background: `linear-gradient(90deg, ${ac.accent} 0%, ${ac.accent2} 100%)`,
    color: '#181a20',
    padding: '0.8rem 2rem',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 900,
    fontSize: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    boxShadow: `0 0 16px ${ac.accent2}`,
    border: 'none',
    transition: 'background 0.3s, color 0.3s',
    '&:hover': {
      background: `linear-gradient(90deg, ${ac.accent2} 0%, ${ac.accent} 100%)`,
      color: ac.accent,
    },
  };

  return (
    <>
      <Head>
        <title>RISE Cycling - Start 4-Week Power-Ride Program - First Week Free</title>
        <meta name="description" content="Start your 4-Week Power-Ride Program with RISE Cycling. First week completely free - structured training, performance tracking, and community support." />
        <meta name="keywords" content="rise cycling, jamel, cyberpunk cycling, zwift, spiritual growth, self-reliance, health optimization, consciousness expansion, iShareHow Labs, cycling community" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Orbitron&display=swap" rel="stylesheet" />
      </Head>
      <Box sx={{
        background: 'linear-gradient(135deg, #181a20 0%, #23263a 100%)',
        color: ac.accent,
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
          boxShadow: `0 2px 24px ${ac.accent2}44`,
          borderBottom: '1px solid #23263a',
        }}>
          <Container maxWidth="lg">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
              <MuiLink href="/" sx={{
                fontSize: '2.2rem',
                fontWeight: 900,
                color: ac.accent2,
                textShadow: `0 0 12px ${ac.accent}, 0 0 24px ${ac.accent2}`,
                textDecoration: 'none',
                letterSpacing: '2px',
                fontFamily: "'Orbitron', sans-serif",
              }}>
                RISE CYCLING
              </MuiLink>
              <Box component="ul" sx={{ display: 'flex', listStyle: 'none', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {['About', 'Mission', 'Protocol', 'Resources'].map((item) => (
                  <li key={item}>
                    <MuiLink href={`#${item.toLowerCase()}`} sx={{ color: ac.accent, textDecoration: 'none', fontSize: '1rem', fontWeight: 600, transition: 'color 0.3s, text-shadow 0.3s', textShadow: `0 0 8px ${ac.accent2}`, '&:hover': { color: ac.accent2, textShadow: `0 0 16px ${ac.accent}` } }}>
                      {item}
                    </MuiLink>
                  </li>
                ))}
                <li>
                  <MuiLink href="https://www.youtube.com/@RisewithJamel?sub_confirmation=1" target="_blank" sx={{ ...ctaBtnStyle, padding: '0.7rem 1.5rem', color: '#181a20' }}>
                    Join YouTube
                  </MuiLink>
                </li>
              </Box>
            </Box>
          </Container>
        </Box>

        {/* Hero Section */}
        <Box sx={{ background: `linear-gradient(120deg, ${ac.accent2} 0%, ${ac.pink} 100%)`, padding: '6rem 0', textAlign: 'center', boxShadow: `0 0 40px ${ac.accent2}aa` }}>
          <Container>
            <Typography variant="h1" sx={{ fontFamily: "'Orbitron', sans-serif", fontSize: '3.5rem', fontWeight: 900, mb: 1, color: '#181a20', textShadow: `0 0 24px ${ac.pink}, 0 0 48px ${ac.accent2}`, letterSpacing: '2px' }}>
              Your 4-Week Power-Ride Program
            </Typography>
            <Typography sx={{ fontSize: '1.25rem', color: '#181a20', maxWidth: '800px', margin: '0 auto 2rem', textShadow: `0 0 8px ${ac.accent2}` }}>
              Transform your cycling performance with our structured 4-week program. Get professional training plans, performance tracking, and community support. Try your first week completely free.
            </Typography>
          </Container>
        </Box>

        {/* Sections */}
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {/* About */}
          <Box id="about" component="section" sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="h2" sx={{ fontFamily: "'Orbitron', sans-serif", color: ac.primary, fontWeight: 700, mb: 3 }}>RISE::OVERVIEW</Typography>
            <Typography sx={{ maxWidth: '800px', margin: '0 auto 2rem', fontSize: '1.1rem', color: ac.secondary }}>
              RISE::CYCLING::MINISTRY, administered by <Box component="span" sx={{ color: ac.accent, fontWeight: 'bold' }}>iShareHow Labs LLC</Box>, integrates cybernetic enhancement with spiritual ascension through advanced cycling methodologies, wellness optimization, and consciousness expansion. Our <Box component="span" sx={{ fontWeight: 'bold' }}>Rise Cycling Team</Box> operates across digital and physical realms, competing on Zwift and in real-world race matrices.
            </Typography>
            <Typography sx={{ maxWidth: '800px', margin: '0 auto', color: ac.secondary }}>
              Core modules include: <Box component="span" sx={{ fontWeight: 'bold' }}>Qum (Rise) Above All</Box>, Bushcraft Adventures, Gut Health Optimization, Energy & Healing Frequencies, and Consciousness Rising above all.
            </Typography>
          </Box>

          {/* Mission */}
          <Box id="mission" component="section" sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="h2" sx={{ fontFamily: "'Orbitron', sans-serif", color: ac.primary, fontWeight: 700, mb: 3 }}>MISSION::RISE</Typography>
            <Box sx={{ maxWidth: '900px', margin: '0 auto' }}>
              <Typography component="blockquote" sx={{ fontStyle: 'italic', fontWeight: 500, background: ac.gray, borderLeft: `4px solid ${ac.accent}`, padding: '2rem', margin: '2rem 0', color: ac.secondary, fontSize: '1.1rem' }}>
                "The Rise Mission is a living path of ancestral wisdom, natural psychology, and spiritual autonomy to self-correct. We honor our race, creed, and genetic memory by walking in harmony with Universal Nature, cultivating self-reliance, and embodying the sacred energy of the Earth and Spirit."
              </Typography>
            </Box>
          </Box>

          {/* Protocol */}
          <Box id="protocol" component="section" sx={{ py: 4 }}>
            <Typography variant="h2" sx={{ fontFamily: "'Orbitron', sans-serif", color: ac.primary, fontWeight: 700, mb: 3, textAlign: 'center' }}>CORE::RISE::PRINCIPLES</Typography>
            <Grid container spacing={4}>
              <Grid xs={12} md={4}>
                <Box sx={cardStyle}>
                  <Typography variant="h3" sx={{ fontSize: '1.5rem', mb: 1, color: ac.primary }}>Nature Grounding</Typography>
                  <Typography sx={{ color: ac.secondary, fontSize: '1rem' }}>We believe and love the Earth, connecting with its rhythms and energies to foster holistic well-being.</Typography>
                </Box>
              </Grid>
              <Grid xs={12} md={4}>
                <Box sx={cardStyle}>
                  <Typography variant="h3" sx={{ fontSize: '1.5rem', mb: 1, color: ac.primary }}>Protect Your Gut</Typography>
                  <Typography sx={{ color: ac.secondary, fontSize: '1rem' }}>Independent food production and eating for energy generation. Focus on gut health through fermented foods, prebiotics, and nutrient-dense meals.</Typography>
                </Box>
              </Grid>
              <Grid xs={12} md={4}>
                <Box sx={cardStyle}>
                  <Typography variant="h3" sx={{ fontSize: '1.5rem', mb: 1, color: ac.primary }}>Self-Correction Algorithm</Typography>
                  <Typography sx={{ color: ac.secondary, fontSize: '1rem' }}>Inner alchemy processing, shadow work subroutines, and conscious evolution protocols, Intuition enhancement, and transcendental awareness.</Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Stats */}
          <Box id="stats" component="section" sx={{ py: 4 }}>
            <Typography variant="h2" sx={{ fontFamily: "'Orbitron', sans-serif", color: ac.primary, fontWeight: 700, mb: 3, textAlign: 'center' }}>RIDER::STATISTICS</Typography>
            <Grid container spacing={2} justifyContent="center">
              {[{ label: 'FTP (Xert)', value: '284' }, { label: 'Weight (kg)', value: '69.5' }, { label: 'W/kg Ratio', value: '4.05' }].map(stat => (
                <Grid xs={12} sm={4} md={3} key={stat.label}>
                  <Box sx={{ background: ac.light, padding: '1.5rem', textAlign: 'center', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.2)', border: '1px solid #e2e8f0' }}>
                    <Typography sx={{ fontSize: '2rem', fontWeight: 700, color: ac.accent }}>{stat.value}</Typography>
                    <Typography sx={{ fontSize: '0.9rem', color: ac.secondary, textTransform: 'uppercase', fontWeight: 500 }}>{stat.label}</Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Equipment */}
          <Box id="equipment" component="section" sx={{ py: 4 }}>
            <Typography variant="h2" sx={{ fontFamily: "'Orbitron', sans-serif", color: ac.primary, fontWeight: 700, mb: 3, textAlign: 'center' }}>EQUIPMENT::MATRIX</Typography>
            <Grid container spacing={4}>
              <Grid xs={12} md={4}>
                <Box sx={cardStyle}>
                  <Typography variant="h3" sx={{ fontSize: '1.5rem', mb: 1, color: ac.primary }}>Primary Cycling Rig</Typography>
                  <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left' }}>
                    <li>→ <strong>2021 Checkpoint SL7</strong> (Zwift, MyWhoosh, TPV)</li>
                    <li>→ SRAM Apex eXPLR 12-speed rear mech</li>
                    <li>→ SRAM eAXIS Levers</li>
                    <li>→ 1x setup configuration</li>
                    <li>→ Tacx Neo2T trainer interface</li>
                    <li>→ DIY welded fork mount system</li>
                    <li>→ Wahoo Power Pedals</li>
                    <li>→ 40t crankset with 11-44 cassette</li>
                    <li>→ <strong>Backup Systems:</strong> 2x 2024 Crux DSW</li>
                  </ul>
                </Box>
              </Grid>
              <Grid xs={12} md={4}>
                <Box sx={cardStyle}>
                  <Typography variant="h3" sx={{ fontSize: '1.5rem', mb: 1, color: ac.primary }}>Computing Matrix</Typography>
                  <ul style={{ listStyle: 'none', padding: 0, textAlign: 'left' }}>
                    <li>→ Mac Mini M4 (base model)</li>
                    <li>→ Bot Webcam 4K</li>
                    <li>→ Logi Wireless keyboard</li>
                    <li>→ DELL 2K Screen</li>
                    <li>→ LG 4K Screen</li>
                    <li>→ Legacy backup screen</li>
                  </ul>
                </Box>
              </Grid>
              <Grid xs={12} md={4}>
                <Box sx={cardStyle}>
                  <Typography variant="h3" sx={{ fontSize: '1.5rem', mb: 1, color: ac.primary }}>Physical Setup</Typography>
                  <Typography sx={{ color: ac.secondary, fontSize: '1rem', textAlign: 'left' }}>
                    Custom welded infrastructure with scrap metal and prebuild stands. Includes side table for hydration/nutrition, front table for keyboard/device management, screen mount for computer integration, dock, and charging port distribution.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Content */}
          <Box id="resources" component="section" sx={{ py: 4 }}>
            <Typography variant="h2" sx={{ fontFamily: "'Orbitron', sans-serif", color: ac.primary, fontWeight: 700, mb: 2, textAlign: 'center' }}>FREE ADVANCED TRAINING & RESOURCE FOOTAGE</Typography>
            <Typography sx={{ textAlign: 'center', mb: 2, fontSize: '1.1rem', color: ac.secondary }}>
              Access cycling content, health optimization workouts, and power rise enhancement modules.
            </Typography>
            <Grid container spacing={4}>
              <Grid xs={12} md={6}>
                <Box sx={cardStyle}>
                  <Typography variant="h3" sx={{ fontSize: '1.5rem', mb: 2, color: ac.primary }}>Content Networks</Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    {['youtube', 'twitch', 'patreon', 'facebook'].map(tab => (
                      <Button key={tab} onClick={() => setActiveTab(tab)} sx={{ background: activeTab === tab ? '#2b6cb0' : ac.accent, color: 'white', '&:hover': { background: '#2b6cb0' } }}>{tab}</Button>
                    ))}
                  </Box>
                  <Box>
                    {activeTab === 'youtube' && (
                      <Box>
                        <iframe src="https://www.youtube.com/embed/videoseries?list=PLwz42x-QsWjMK-xXIIwpWh15mLcXLWRnP" title="Rise playlist" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen style={{ width: '100%', height: '315px', borderRadius: '8px' }}></iframe>
                        <MuiLink href="https://www.youtube.com/@RisewithJamel" target="_blank" sx={{ color: ac.accent, mt: 1, display: 'block' }}>@RisewithJamel</MuiLink>
                      </Box>
                    )}
                    {activeTab === 'twitch' && (
                      <Box>
                        <iframe src="https://player.twitch.tv/?channel=jameleliyah&parent=ventures.isharehow.app" title="Twitch Stream" frameBorder="0" allowFullScreen style={{ width: '100%', height: '315px', borderRadius: '8px' }}></iframe>
                        <MuiLink href="https://www.twitch.tv/jameleliyah" target="_blank" sx={{ color: ac.accent, mt: 1, display: 'block' }}>Twitch: jameleliyah</MuiLink>
                      </Box>
                    )}
                    {activeTab === 'patreon' && <MuiLink href="https://www.patreon.com/cw/JamelEliYah" target="_blank" sx={{ ...ctaBtnStyle, mt: 2 }}>Join Our Patreon</MuiLink>}
                    {activeTab === 'facebook' && <MuiLink href="https://www.facebook.com/JamelEliYah" target="_blank" sx={{ ...ctaBtnStyle, mt: 2 }}>Facebook: Jamel EliYah</MuiLink>}
                  </Box>
                </Box>
              </Grid>
              <Grid xs={12} md={6}>
                <Box sx={cardStyle}>
                  <Typography variant="h3" sx={{ fontSize: '1.5rem', mb: 2, color: ac.primary }}>DISCORD::ACCESS</Typography>
                  <Typography sx={{ fontSize: '1.1rem', mb: 2, color: ac.secondary }}>
                    Connect to our distributed network on X (<MuiLink href="https://x.com/Dir3ct0r_3L" target="_blank" sx={{ color: ac.accent, fontWeight: 'bold' }}>@Dir3ct0r_3L</MuiLink>) for the most up-to-date information on cycling, self-reliance, health optimization, and spiritual growth protocols.
                  </Typography>
                  <Typography sx={{ color: 'white', mb: 1 }}>Channels: <strong>Zwift</strong>, <strong>Just Chatting</strong>, <strong>IRL</strong></Typography>
                  <MuiLink href="https://isharehow.app/discord" target="_blank" sx={{ ...ctaBtnStyle, color: 'white' }}>Join Our Discord Community</MuiLink>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Container>

        {/* Footer */}
        <Box component="footer" sx={{ background: 'linear-gradient(90deg, #181a20 60%, #23263a 100%)', color: ac.accent, padding: '4rem 0', boxShadow: `0 0 32px ${ac.accent2}aa` }}>
          <Container maxWidth="lg">
            <Box sx={{ borderTop: '1px solid #495057', paddingTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: '#adb5bd' }}>
              <Typography>RISE CYCLING © {currentYear} | iShareHow Labs LLC | All rights reserved | <MuiLink href="https://www.twitch.tv/jameleliyah" target="_blank" sx={{ color: '#adb5bd' }}>https://www.twitch.tv/jameleliyah</MuiLink></Typography>
              <Typography sx={{ color: ac.secondary, fontSize: '0.8rem', mt: 1 }}>
                #CyclingLife #BikeLife #RoadCycling #CyclingCommunity #CyclingMotivation #RideOn #Zwift #Twitch #SpiritualGrowth #SelfReliance #HealthOptimization
              </Typography>
            </Box>
          </Container>
        </Box>
      </Box>
    </>
  );
};

export default RiseCycling;
