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
    id: 'pact-foundation',
    title: 'PACT Foundation',
    description: 'Learn about what the PACT Foundation has for you.',
    channelName: 'PACT Foundation',
    channelIcon: 'PF',
    timestamp: '2 weeks ago',
      category: ['Business', 'Community'],
      color: '#00d4ff',
      mediaType: 'iframe' as const,
    mediaUrl: 'https://www.youtube.com/embed/videoseries?list=PLQ5BVpGud4m-xCRd_um_Vpq-_duzhBi77',
    externalUrl: 'https://www.youtube.com/playlist?list=PLQ5BVpGud4m-xCRd_um_Vpq-_duzhBi77',
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
      color: '#ff6b6b',
      mediaType: 'iframe' as const,
    mediaUrl: 'https://p16-common-sign.tiktokcdn-us.com/tos-useast5-avt-0068-tx/bc638622a44629cb303c05cdb4bbd6b3~tplv-tiktokx-cropcenter:1080:1080.jpeg?dr=9640&refresh_token=f1f4bf1c&x-expires=1763852400&x-signature=xbu5y1%2FGPr682UEzdG6bmeZR1lM%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=useast5',
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
    id: 'web3',
    title: 'Web3 Development',
    description: 'iShareHow Labs Web3 Development & Women in web3 Venture.',
    channelName: 'Web3 Development',
    channelIcon: 'WD',
    timestamp: '1 week ago',
      category: ['Web3'],
      color: '#5865F2',
      isVenturePartnership: true,
      mediaType: 'image' as const,
    mediaUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop',
    externalUrl: '/labs',
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
  {
    id: 'pact',
    title: 'PACT Foundation',
    description: 'Learn about what the PACT Foundation has for you.',
    channelName: 'PACT Foundation',
    channelIcon: 'PF',
    timestamp: '1 week ago',
      category: ['Action', 'Community'],
      color: '#00d4ff',
      mediaType: 'image' as const,
    mediaUrl: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=650&fit=crop',
    externalUrl: '/PACT',
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
  'Entertainment',
  'Venture Partnerships',
  'Discord',
  'Web3',
  'Amusement',
];

interface ContentLibraryViewProps {
  showHero?: boolean;
}

const ContentLibraryView = ({ showHero = true }: ContentLibraryViewProps) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showVenturePartnershipsOnly, setShowVenturePartnershipsOnly] = useState(false);

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

    const matchesPartnership = !showVenturePartnershipsOnly || content.isVenturePartnership;

    return matchesCategory && matchesSearch && matchesPartnership;
  });

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
            Explore our Content
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Discover our curated collection of articles, guides, and resources. Click any card to explore the full
            content.
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
        <Chip
          key="venture-partnerships"
          label="Venture Partnerships"
          color={showVenturePartnershipsOnly ? 'primary' : 'default'}
          variant={showVenturePartnershipsOnly ? 'filled' : 'outlined'}
          onClick={() => setShowVenturePartnershipsOnly((prev) => !prev)}
          sx={{ textTransform: 'none' }}
        />
      </Stack>

      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
        Showing {filteredContent.length} {filteredContent.length === 1 ? 'item' : 'items'}
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
        {filteredContent.length > 0 ? (
          filteredContent.map((content) => <ContentCard key={content.id} content={content} />)
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
    </Box>
  );
};

export default ContentLibraryView;

