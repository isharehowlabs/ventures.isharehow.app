// UNIQUE_BUILD_TEST_2025_OCT_24_V3
import { useState } from 'react';
import { Box, Typography, InputBase, Paper } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import VentureCard from '../components/VentureCard';
import AppShell from '../components/AppShell';

// Your actual ventures data
const ventures = [
  {
    id: 'msp',
    title: 'Managed Security Provider',
    subtitle: '24/7 SOC Monitoring & Threat Hunting',
    description: 'Complete managed security service provider offering enterprise-grade cybersecurity consulting, SOC monitoring, and threat intelligence.',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=600&fit=crop',
    category: 'Cybersecurity',
    color: '#1e3a8a',
    stats: { likes: 247, views: '12K', saves: 89 },
    url: 'https://isharehowlabs.com',
    tags: ['Security', 'Enterprise', 'SOC'],
  },
  {
    id: 'wellness',
    title: 'Wellness Lab',
    subtitle: '7-Day Personalized Health Plans',
    description: 'AI-powered wellness tracker with personalized micro-habits plans, free habit tracker, and biometric insights for optimal health.',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=900&fit=crop',
    category: 'Health',
    color: '#15803d',
    stats: { likes: 423, views: '28K', saves: 156 },
    url: '/wellness',
    tags: ['Wellness', 'AI', 'Health'],
  },
  {
    id: 'rise-cycling',
    title: 'RISE Cycling',
    subtitle: '4-Week Power-Ride Program',
    description: 'Transform your cycling performance with structured training, performance tracking, and community support. First week completely free.',
    image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=700&fit=crop',
    category: 'Fitness',
    color: '#c2410c',
    stats: { likes: 312, views: '19K', saves: 78 },
    url: '/rise_cycling',
    tags: ['Cycling', 'Fitness', 'Training'],
  },
  {
    id: 'spiritual-festivals',
    title: 'Spiritual Festivals 2024',
    subtitle: 'Complete Festival Guidebook',
    description: 'Download the complete 2024 Festival Guidebook with 50+ spiritual events, rituals, traditions, and bonus ritual pack.',
    image: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&h=800&fit=crop',
    category: 'Culture',
    color: '#be185d',
    stats: { likes: 345, views: '22K', saves: 123 },
    url: '/spiritual_festivals',
    tags: ['Festivals', 'Spirituality', 'Events'],
  },
  {
    id: 'pact',
    title: 'PACT',
    subtitle: 'Patience Action Community Teamwork',
    description: 'Community platform for creators and collaborators wanting to build projects together efficiently.',
    image: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=650&fit=crop',
    category: 'Ventures',
    color: '#0891b2',
    stats: { likes: 198, views: '11K', saves: 41 },
    url: '/PACT',
    tags: ['Patience', 'Community', 'Teamwork'],
  },
  {
    id: 'content',
    title: 'Content Library',
    subtitle: 'Creator Resources & Templates',
    description: 'Curated content library of the work from iShareHow Labs ventures and studios.',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&h=700&fit=crop',
    category: 'Studios',
    color: '#ea580c',
    stats: { likes: 156, views: '9K', saves: 34 },
    url: '/content',
    tags: ['Content', 'Media', 'Videos'],
  },
  {
    id: 'journey-through-consciousness',
    title: 'Journey Through Consciousness',
    subtitle: 'Journey Through Consciousness TikTok',
    description: 'Are you ready to explore the depths of your mind and unlock your true potential? Follow Journey Through Consciousness on TikTok for daily doses of inspiration, mindfulness, and self-discovery.',
    image: 'https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=800&h=700&fit=crop',
    category: 'Journey',
    color: '#4a044e',
    stats: { likes: 156, views: '9K', saves: 34 },
    url: 'https://www.tiktok.com/@journeythroughconscious',
    tags: ['TikTok', 'Media', 'Videos'],
  },
  {
    id: 'kabloom',
    title: 'Kabloom',
    subtitle: 'kabloom - Plant Pots App',
    description: 'An app to help you care for your house plants, identify them, and find the perfect pots.',
    image: 'https://kabloomplants.com/public/kabloom-logo-png.png',
    category: 'Ventures',
    color: '#16a34a',
    stats: { likes: 156, views: '9K', saves: 34 },
    url: 'https://kabloomplants.com',
    tags: ['Kabloom', 'Plants', 'App'],
  },
  {
    id: 'discord-chat',
    title: 'Join our Discord',
    subtitle: 'Community & Support',
    description: 'Join our community on Discord to chat, collaborate, and get support for our ventures.',
    image: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=800&h=700&fit=crop',
    category: 'Community',
    color: '#5865F2',
    stats: { likes: 187, views: '10K', saves: 52 },
    url: 'https://isharehow.app/discord',
    tags: ['Discord', 'Community', 'Chat'],
  },
  {
    id: 'manager',
    title: 'Managed Services Provider',
    subtitle: 'Manager Toolkit',
    description: 'iShareHow Labs Managed Services Provider Toolkit for Project Managers and Venture Teams.',
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
    category: 'Community',
    color: '#5865F2',
    stats: { likes: 187, views: '10K', saves: 52 },
    url: '/msp',
    tags: ['Manager', 'Toolkit', 'Project'],
  },
  {
    id: 'web3',
    title: 'Web3 Development',
    subtitle: 'Web3 Development',
    description: 'iShareHow Labs Web3 Development & Women in web3 Venture.',
    image: '/web3/Gemini_Generated_Image_6y4dkw6y4dkw6y4d.png',
    category: 'Web3',
    color: '#5865F2',
    stats: { likes: 187, views: '10K', saves: 52 },
    url: '/web3',
    tags: ['Web3', 'Development', 'Women in web3'],
  },
];

function App() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Filter ventures based on filters
  const getFilteredVentures = () => {
    let filtered = [...ventures];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(venture =>
        venture.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venture.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        venture.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered;
  };

  const filteredVentures = getFilteredVentures();

  return (
    <AppShell active="ventures">
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography
          variant="h3"
          sx={{
            fontWeight: 900,
            mb: 2,
            background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Explore Our Ventures
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
          Discover innovative solutions across cybersecurity, wellness, fitness, and more.
          Click any card to explore the full application.
        </Typography>
      </Box>

      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: 'background.default',
            px: 3,
            py: 1,
            borderRadius: 3,
            minWidth: { xs: '100%', sm: 400, md: 500, lg: 600 },
            maxWidth: '100%',
            border: 1,
            borderColor: 'divider',
          }}
        >
          <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />
          <InputBase
            placeholder="Search ventures..."
            value={searchQuery}
            onChange={handleSearchChange}
            sx={{
              flex: 1,
              '& input': {
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              },
            }}
          />
        </Paper>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 3,
          mb: 6,
        }}
      >
        {filteredVentures.length > 0 ? (
          filteredVentures.map((venture) => (
            <VentureCard key={venture.id} venture={venture} />
          ))
        ) : (
          <Box
            sx={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              py: 8,
              color: 'text.secondary',
            }}
          >
            <Typography variant="h6" sx={{ mb: 1 }}>
              No ventures found
            </Typography>
            <Typography variant="body2">Try adjusting your search or filters</Typography>
          </Box>
        )}
      </Box>
    </AppShell>
  );
}

export default App;
