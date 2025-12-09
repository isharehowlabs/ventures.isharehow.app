'use client';

import { useState, type ChangeEvent } from 'react';
import {
  Box,
  Typography,
  Paper,
  InputBase,
  Stack,
  Chip,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import ContentCard from './ContentCard';

const contentItems = [
  {
    id: 'welcome-ishare',
    title: 'Welcome to iShare',
    description: 'Learn the fundamentals of cyber and APT intelligence in our video series.',
    channelName: 'iShareHow',
    channelIcon: 'iS',
    timestamp: '3 days ago',
      category: ['Cybersecurity', 'Resources'],
      color: '#00d4ff',
      mediaType: 'video' as const,
      mediaUrl: 'https://www.youtube.com/embed/rQ2NkeJ6yPs',
      externalUrl: 'https://www.youtube.com/watch?v=rQ2NkeJ6yPs',
  },
  {
    id: 'cosmic-consciousness',
    title: 'A Journey Through Cosmic Consciousness',
    description: "A Journey through Cosmic Consciousness provides a concept of the universe based on mystics' experiences but expressed in analogies that we can all relate to.",
    channelName: 'Consciousness Journey',
    channelIcon: 'CJ',
    timestamp: '5 days ago',
      category: ['Consciousness'],
      color: '#7c3aed',
      mediaType: 'iframe' as const,
    mediaUrl: 'https://www.youtube.com/embed/videoseries?list=PL5oPceUn7qyfn6ifad_U8ydnRMn0HXCO6',
    externalUrl: 'https://www.youtube.com/playlist?list=PL5oPceUn7qyfn6ifad_U8ydnRMn0HXCO6',
  },
  {
    id: 'sports-shorts',
    title: 'Sports Shorts',
    description: 'Watch our funny talks while cycling online eSports style.',
    channelName: 'Zwift Shorts',
    channelIcon: 'ZS',
    timestamp: '3 weeks ago',
      category: ['Fitness'],
      color: '#ff6b6b',
      mediaType: 'iframe' as const,
    mediaUrl: 'https://www.youtube.com/embed/videoseries?list=PLwz42x-QsWjNHtX07E_fuc7RslJt4_CWD',
    externalUrl: 'https://www.youtube.com/playlist?list=PLwz42x-QsWjNHtX07E_fuc7RslJt4_CWD',
  },
  {
    id: 'rise-jamel',
    title: 'Rise with Jamel',
    description: 'Explore health and wellness tips with Jamel in this inspiring video.',
    channelName: 'Rise with Jamel',
    channelIcon: 'RJ',
    timestamp: '3 weeks ago',
      category: ['Health'],
      color: '#15803d',
      mediaType: 'iframe' as const,
    mediaUrl: 'https://www.youtube.com/embed/playlist?list=PLwz42x-QsWjMK-xXIIwpWh15mLcXLWRnP',
    externalUrl: 'https://www.youtube.com/playlist?list=PLwz42x-QsWjMK-xXIIwpWh15mLcXLWRnP',
  },
  {
    id: 'ai-comedy-tea',
    title: 'AI Comedy: Tea',
    description: 'Watch and laugh at our divine AI Comedy video series with quirky humor.',
    channelName: 'AI Comedy',
    channelIcon: 'AC',
    timestamp: '1 month ago',
      category: ['Entertainment'],
      color: '#ff6b6b',
      mediaType: 'iframe' as const,
    mediaUrl: 'https://www.youtube.com/embed/videoseries?list=PLTlfw7UqgC-s1eNiMWyVq-QDFPXMFf-3Q',
    externalUrl: 'https://www.youtube.com/playlist?list=PLTlfw7UqgC-s1eNiMWyVq-QDFPXMFf-3Q',
  },
  {
    id: 'ai-comedy-aita',
    title: 'AI Comedy: AITA',
    description: 'Watch and laugh at our divine AI Comedy video series exploring AITA themes.',
    channelName: 'AI Comedy',
    channelIcon: 'AC',
    timestamp: '1 week ago',
      category: ['Entertainment'],
      color: '#ff6b6b',
      mediaType: 'iframe' as const,
    mediaUrl: 'https://www.youtube.com/embed/videoseries?list=PLTlfw7UqgC-tmXwXlMeZyf7xuGm5yD0uL',
    externalUrl: 'https://www.youtube.com/playlist?list=PLTlfw7UqgC-tmXwXlMeZyf7xuGm5yD0uL',
  },
  {
    id: 'ai-what-if',
    title: 'AI What If',
    description: 'Watch and laugh at our divine AI What If video series exploring What If themes.',
    channelName: 'AI What If',
    channelIcon: 'AI',
    timestamp: '1 week ago',
      category: ['Entertainment'],
      color: '#ff6b6b',
      mediaType: 'iframe' as const,
    mediaUrl: 'https://www.youtube.com/embed/videoseries?list=PLTlfw7UqgC-sT9IzbdJbbHnYZv-ct8r7p',
    externalUrl: 'https://www.youtube.com/playlist?list=PLTlfw7UqgC-sT9IzbdJbbHnYZv-ct8r7p',
  },
  {
    id: 'journey-through-consciousness',
    title: 'Journey Through Consciousness',
    description: 'Are you ready to explore the depths of your mind and unlock your true potential? Follow Journey Through Consciousness on TikTok for daily doses of inspiration, mindfulness, and self-discovery.',
    channelName: 'Journey Through Consciousness',
    channelIcon: 'JTC',
    timestamp: '1 week ago',
    category: ['Consciousness'],
    color: '#7c3aed',
    mediaType: 'image' as const,
    mediaUrl: '/journey-consciousness.svg',
    externalUrl: 'https://www.tiktok.com/@journeythroughconscious',
  },
  {
    id: 'kabloom',
    title: 'Kabloom',
    description: 'Kabloom is a plant pot app that helps you care for your house plants, identify them, and find the perfect pots.',
    channelName: 'Kabloom',
    channelIcon: 'KB',
    timestamp: '1 week ago',
      category: ['Plants'],
      color: '#ff6b6b',
      isVenturePartnership: true,
      mediaType: 'image' as const,
    mediaUrl: 'https://kabloomplants.com/public/kabloom-logo-png.png',
    externalUrl: 'https://kabloomplants.com',
  },
  {
    id: 'Amusement',
    title: 'DivineAmusement YouTube Channel',
    description: 'DivineAmusement YouTube Channel',
    channelName: 'DivineAmusement',
    channelIcon: 'DA',
    timestamp: '1 week ago',
      category: ['Amusement'],
      color: '#ff6b6b',
      mediaType: 'image' as const,
    mediaUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=800&h=600&fit=crop',
    externalUrl: 'https://www.youtube.com/@DivineAmusement?sub_confirmation=1',
  },
  {
    id: 'discord-chat',
    title: 'Discord Chat',
    description: 'Join our community on Discord to chat, collaborate, and get support for our ventures.',
    channelName: 'iShareHow Discord',
    channelIcon: 'WD',
    timestamp: '1 week ago',
      category: ['Discord'],
      color: '#5865F2',
      mediaType: 'image' as const,
    mediaUrl: 'https://images.unsplash.com/photo-1611605698335-8b1569810432?w=800&h=700&fit=crop',
    externalUrl: 'https://isharehow.app/discord',
  },
];

const categoryFilters = [
  'all',
  'Cybersecurity',
  'Health',
  'Fitness',
  'Consciousness',
  'Business',
  'Community',
  'Resources',
  'Entertainment',
  'Plants',
  'Discord',
  'Amusement',
];

interface ContentLibraryViewProps {
  showHero?: boolean;
}

const ContentLibraryView = ({ showHero = true }: ContentLibraryViewProps) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const filteredContent = contentItems.filter((content) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      content.category.some((cat) => cat.toLowerCase() === selectedCategory.toLowerCase());

    const matchesSearch =
      !searchQuery ||
      content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      content.channelName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

    const contentGridItems = filteredContent.filter((item) => !item.isVenturePartnership);
    const ventureGridItems = filteredContent.filter((item) => item.isVenturePartnership);

  return (
      <Box>
        {showHero && (
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
              Our Portfolio
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 640, mx: 'auto' }}>
              Explore the curated content that fuels our mission alongside the ventures and partnerships shaping the
              future of iShareHow.
            </Typography>
          </Box>
        )}

          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
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
                  placeholder="Search content..."
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

        <Stack direction="row" spacing={1} justifyContent="center" flexWrap="wrap" sx={{ mb: 4 }}>
          {categoryFilters.map((category) => (
            <Chip
              key={category}
              label={category === 'all' ? 'All Categories' : category}
              color={selectedCategory === category ? 'primary' : 'default'}
              onClick={() => handleCategoryFilter(category)}
              sx={{ textTransform: 'capitalize' }}
              variant={selectedCategory === category ? 'filled' : 'outlined'}
            />
          ))}
        </Stack>

        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
          Showing {contentGridItems.length} {contentGridItems.length === 1 ? 'item' : 'items'} in the content library
        </Typography>

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
        {contentGridItems.length > 0 ? (
          contentGridItems.map((content) => <ContentCard key={content.id} content={content} />)
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
              No content found
            </Typography>
            <Typography variant="body2">Try adjusting your search or filters</Typography>
          </Box>
        )}
      </Box>

      <Box sx={{ mt: 6 }}>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          Venture Partnerships
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 640 }}>
          Discover the ventures and collaborations that help expand the iShareHow community. These highlights are
          handpicked for their impact on learning, innovation, and wellbeing.
        </Typography>

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
          }}
        >
          {ventureGridItems.length > 0 ? (
            ventureGridItems.map((content) => <ContentCard key={content.id} content={content} />)
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
                No ventures match your filters
              </Typography>
              <Typography variant="body2">Adjust your search or filter selections to see more partnerships.</Typography>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ContentLibraryView;

