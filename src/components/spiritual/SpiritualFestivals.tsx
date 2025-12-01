import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Download as DownloadIcon,
  CalendarMonth as CalendarIcon,
  LocationOn as LocationIcon,
  ExpandMore as ExpandMoreIcon,
  Spa as SpaIcon,
  MusicNote as MusicIcon,
  Restaurant as RestaurantIcon,
  FamilyRestroom as FamilyIcon,
  AutoAwesome as WorkshopIcon,
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface Festival {
  name: string;
  location: string;
  focus: string;
  dates: string;
  atmosphere: string;
  website: string;
  priceRange: string;
  familyFriendly: boolean;
}

interface Workshop {
  name: string;
  festival: string;
  location: string;
  category: string;
  description: string;
}

const festivals: Festival[] = [
  {
    name: 'Spirit Fest',
    location: 'Virginia Beach, VA & FL',
    focus: 'Metaphysical Marketplace',
    dates: 'Sep. 19-21, 2026 (VA), Nov. 7-8, 2026 (Orlando, FL)',
    atmosphere: 'Commercial, High-energy, Diverse',
    website: 'https://spiritfestusa.com',
    priceRange: '$10-$25/day',
    familyFriendly: true,
  },
  {
    name: 'Holistic Health & Healing Expo',
    location: 'Cherry Hill, NJ; Raleigh, NC; Deerfield Beach, FL',
    focus: 'Holistic Health & Wellness',
    dates: 'Oct. 18, 2025 (NJ); Mar. 15, 2026 (NC); Feb. 8, 2026 (FL)',
    atmosphere: 'Educational, Integrative, Community-focused',
    website: 'https://holistichealthandhealingexpo.com',
    priceRange: 'Free-$15',
    familyFriendly: true,
  },
  {
    name: 'Mind Body Soul Expo',
    location: 'Saratoga Springs, NY',
    focus: 'Mind-Body-Soul Expo',
    dates: 'Apr. 25, 2026',
    atmosphere: 'Large, Regional, Multi-vendor',
    website: 'https://mindbodysoulexpo.com',
    priceRange: '$15-$30',
    familyFriendly: true,
  },
  {
    name: 'Transcend Fest',
    location: 'Middlefield, CT',
    focus: 'Transformational / Yoga',
    dates: 'Sep. 11-13, 2026',
    atmosphere: 'Immersive, Community-building, Ecstatic',
    website: 'https://transcendfest.com',
    priceRange: '$99-$249',
    familyFriendly: true,
  },
  {
    name: 'Penn State AstroFest',
    location: 'University Park, PA',
    focus: 'Scientific Astronomy',
    dates: 'July 8-11, 2026',
    atmosphere: 'Educational, Family-friendly, Scientific',
    website: 'https://astro.psu.edu/astrofest',
    priceRange: 'Free',
    familyFriendly: true,
  },
  {
    name: 'Boston Yoga & Wellness Festival',
    location: 'Boston, MA',
    focus: 'Yoga, Wellness, Community',
    dates: 'June 14-15, 2026',
    atmosphere: 'Urban, Vibrant, Inclusive',
    website: 'https://bostonyogafestival.com',
    priceRange: '$35-$99',
    familyFriendly: true,
  },
  {
    name: 'LoveLight Festival',
    location: 'Darlington, MD',
    focus: 'Music, Yoga, Art, Healing',
    dates: 'Aug. 21-24, 2026',
    atmosphere: 'Transformational, Artistic, Family-friendly',
    website: 'https://lovelightfestival.com',
    priceRange: '$99-$299',
    familyFriendly: true,
  },
  {
    name: 'SoulFest',
    location: 'Lincoln, NH',
    focus: 'Music, Spirituality, Workshops',
    dates: 'July 17-19, 2026',
    atmosphere: 'Uplifting, Community, Multi-genre',
    website: 'https://soulfest.com',
    priceRange: '$49-$179',
    familyFriendly: true,
  },
  {
    name: 'Asheville Yoga Festival',
    location: 'Asheville, NC',
    focus: 'Yoga, Mindfulness, Nature',
    dates: 'July 23-26, 2026',
    atmosphere: 'Scenic, Immersive, Wellness-focused',
    website: 'https://ashevilleyogafestival.com',
    priceRange: '$99-$299',
    familyFriendly: true,
  },
  {
    name: 'Omega Spirit Festival',
    location: 'Rhinebeck, NY',
    focus: 'Spirituality, Workshops, Healing',
    dates: 'Sept. 4-7, 2026',
    atmosphere: 'Holistic, Educational, Retreat-style',
    website: 'https://eomega.org',
    priceRange: '$150-$400',
    familyFriendly: true,
  },
];

const workshops: Workshop[] = [
  {
    name: 'Sound Healing Journey',
    festival: 'HHH Expo',
    location: 'Cherry Hill, NJ, Deerfield Beach, FL',
    category: 'Healing, Music',
    description: 'An immersive experience using sound for therapeutic and spiritual purposes.',
  },
  {
    name: 'Crystal Healing Made Easy',
    festival: 'HHH Expo',
    location: 'Cherry Hill, NJ, Deerfield Beach, FL',
    category: 'Mysticism, Healing',
    description: 'A class teaching the basics of using crystals for healing and energy work.',
  },
  {
    name: 'Paranormal 101 class',
    festival: 'HHH Expo',
    location: 'Cherry Hill, NJ, Deerfield Beach, FL',
    category: 'Mysticism, Education',
    description: 'An introductory course exploring paranormal phenomena and investigation.',
  },
  {
    name: 'The Anchor Method - Astrology Event',
    festival: 'Various local events on Eventbrite',
    location: 'Florida',
    category: 'Astrology, Education',
    description: 'A class focused on teaching participants how to read natal charts.',
  },
  {
    name: 'Around The Zodiac',
    festival: 'Paradox Astrology',
    location: 'Lily Dale, NY',
    category: 'Astrology, Education',
    description: 'An evening presentation on the art and science of astrology and the 12 signs of the zodiac.',
  },
];

export default function SpiritualFestivals() {
  const [tabValue, setTabValue] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({
    interest: '',
    atmosphere: '',
    duration: '',
    budget: '',
    familyFriendly: '',
  });

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDownload = () => {
    // Handle download logic here
    window.open('#', '_blank');
  };

  const handleQuizChange = (question: string, value: string) => {
    setQuizAnswers((prev) => ({ ...prev, [question]: value }));
  };

  return (
    <Container maxWidth="lg">
      {/* Hero Section */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mb: 4,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          🌟 Download Your 2026 Festival Guidebook + Bonus Ritual Pack
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 3, opacity: 0.9 }}>
          Everything You Need for 2026 Spiritual Events
        </Typography>
        <Typography variant="body1" sx={{ mb: 3, maxWidth: '600px', mx: 'auto' }}>
          Complete guide to 50+ festivals, expos, and retreats across the East Coast
        </Typography>
        <Button
          variant="contained"
          size="large"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
          sx={{
            bgcolor: 'white',
            color: 'primary.main',
            '&:hover': {
              bgcolor: 'grey.100',
            },
          }}
        >
          Download Free Guidebook + Ritual Pack
        </Button>
      </Paper>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Festivals" />
          <Tab label="Workshops" />
          <Tab label="Festival Finder" />
          <Tab label="Highlights" />
          <Tab label="Guide" />
        </Tabs>
      </Paper>

      {/* Tab 1: Festivals */}
      <TabPanel value={tabValue} index={0}>
        <Typography variant="h4" gutterBottom>
          East Coast Spiritual & Cosmic Gatherings
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          A comprehensive guide to spiritual festivals, expos, and retreats across the East Coast.
        </Typography>

        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell><strong>Event Name</strong></TableCell>
                <TableCell><strong>Location</strong></TableCell>
                <TableCell><strong>Primary Focus</strong></TableCell>
                <TableCell><strong>Dates</strong></TableCell>
                <TableCell><strong>Price Range</strong></TableCell>
                <TableCell><strong>Family Friendly</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {festivals.map((festival, index) => (
                <TableRow key={index} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {festival.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <LocationIcon fontSize="small" />
                      {festival.location}
                    </Typography>
                  </TableCell>
                  <TableCell>{festival.focus}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CalendarIcon fontSize="small" />
                      {festival.dates}
                    </Typography>
                  </TableCell>
                  <TableCell>{festival.priceRange}</TableCell>
                  <TableCell>
                    {festival.familyFriendly ? (
                      <Chip icon={<FamilyIcon />} label="Yes" color="success" size="small" />
                    ) : (
                      <Chip label="No" size="small" />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </TabPanel>

      {/* Tab 2: Workshops */}
      <TabPanel value={tabValue} index={1}>
        <Typography variant="h4" gutterBottom>
          Workshops & Activities
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Explore specialized workshops and activities offered at various festivals.
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          {workshops.map((workshop, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {workshop.name}
                  </Typography>
                  <Chip label={workshop.category} size="small" sx={{ mb: 2 }} />
                  <Typography variant="body2" color="text.secondary" paragraph>
                    <strong>Festival:</strong> {workshop.festival}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    <strong>Location:</strong> {workshop.location}
                  </Typography>
                  <Typography variant="body2">{workshop.description}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Tab 3: Festival Finder Quiz */}
      <TabPanel value={tabValue} index={2}>
        <Typography variant="h4" gutterBottom>
          Find Your Ideal Festival
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Answer a few quick questions to discover which type of spiritual, cosmic, or wellness event best matches your interests and journey.
        </Typography>

        <Paper sx={{ p: 4, mt: 3 }}>
          <Stack spacing={4}>
            <FormControl fullWidth>
              <InputLabel>What are you most interested in?</InputLabel>
              <Select
                value={quizAnswers.interest}
                label="What are you most interested in?"
                onChange={(e) => handleQuizChange('interest', e.target.value)}
              >
                <MenuItem value="metaphysical">Metaphysical Marketplace</MenuItem>
                <MenuItem value="wellness">Wellness & Healing</MenuItem>
                <MenuItem value="transformational">Transformational Festival</MenuItem>
                <MenuItem value="retreat">Spiritual Retreat</MenuItem>
                <MenuItem value="astronomy">Scientific Astronomy</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>What kind of atmosphere do you prefer?</InputLabel>
              <Select
                value={quizAnswers.atmosphere}
                label="What kind of atmosphere do you prefer?"
                onChange={(e) => handleQuizChange('atmosphere', e.target.value)}
              >
                <MenuItem value="commercial">Commercial & High-energy</MenuItem>
                <MenuItem value="educational">Educational & Community-focused</MenuItem>
                <MenuItem value="immersive">Immersive & Transformational</MenuItem>
                <MenuItem value="peaceful">Peaceful & Reflective</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>How long do you want your experience to be?</InputLabel>
              <Select
                value={quizAnswers.duration}
                label="How long do you want your experience to be?"
                onChange={(e) => handleQuizChange('duration', e.target.value)}
              >
                <MenuItem value="day">One Day</MenuItem>
                <MenuItem value="weekend">Weekend (2-3 days)</MenuItem>
                <MenuItem value="week">Week (4-7 days)</MenuItem>
                <MenuItem value="longer">Longer Retreat</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>What is your budget?</InputLabel>
              <Select
                value={quizAnswers.budget}
                label="What is your budget?"
                onChange={(e) => handleQuizChange('budget', e.target.value)}
              >
                <MenuItem value="free">Free - $25</MenuItem>
                <MenuItem value="low">$25 - $100</MenuItem>
                <MenuItem value="medium">$100 - $300</MenuItem>
                <MenuItem value="high">$300+</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Are you looking for a family-friendly event?</InputLabel>
              <Select
                value={quizAnswers.familyFriendly}
                label="Are you looking for a family-friendly event?"
                onChange={(e) => handleQuizChange('familyFriendly', e.target.value)}
              >
                <MenuItem value="yes">Yes</MenuItem>
                <MenuItem value="no">No</MenuItem>
                <MenuItem value="either">Either</MenuItem>
              </Select>
            </FormControl>

            <Button variant="contained" size="large" fullWidth>
              See My Match
            </Button>
          </Stack>
        </Paper>
      </TabPanel>

      {/* Tab 4: Festival Highlights */}
      <TabPanel value={tabValue} index={3}>
        <Typography variant="h4" gutterBottom>
          Festival Highlights
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Discover what makes these festivals special.
        </Typography>

        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <MusicIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                  <Typography variant="h6">Top-Tier Musical Performances & Art</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Experience world-class live music, visionary art installations, and creative performances that inspire and uplift. These festivals are a feast for the senses, blending sound, color, and movement in unforgettable ways.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <SpaIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                  <Typography variant="h6">Yoga & Meditation Workshops</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Join expert-led yoga flows, guided meditations, and wellness workshops designed to nurture your body, mind, and spirit. All levels are welcome, from beginners to seasoned practitioners.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <FamilyIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                  <Typography variant="h6">Family-Friendly Activities & Art Lounges</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Enjoy a welcoming environment for all ages, with creative art lounges, interactive workshops, and fun activities for children and families to explore together.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <WorkshopIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                  <Typography variant="h6">Mini-Sessions with Vetted Practitioners</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Book mini-sessions with experienced healers, coaches, and holistic practitioners. Sample a variety of modalities in a safe, supportive setting.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <RestaurantIcon color="primary" sx={{ mr: 2, fontSize: 40 }} />
                  <Typography variant="h6">Holistic Products & Metaphysical Items</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Browse a curated marketplace of crystals, essential oils, handmade crafts, and metaphysical tools to support your journey and well-being.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </TabPanel>

      {/* Tab 5: Guide Content */}
      <TabPanel value={tabValue} index={4}>
        <Typography variant="h4" gutterBottom>
          Festival Guide
        </Typography>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">The Spiritual & Metaphysical Experience</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              The terminology used to describe spiritual gatherings on the East Coast is expansive and often overlaps. Terms such as "spirituality," "New Age," "holistic," and "metaphysical" are often used interchangeably to categorize a wide range of offerings.
            </Typography>
            <Typography variant="body2">
              The market provides a full spectrum of experiences, from large-scale commercial fairs providing a broad spiritual marketplace to curated transformational festivals offering an immersive, community-driven experience.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">The Transformational Festival Paradigm</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              Transformational festivals are distinguished from conventional music festivals by their emphasis on personal growth, social responsibility, healthy living, and creative expression. They are often characterized by communal activities such as seminars, classes, drum circles, and ceremonies.
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Navigating the Celestial: From Astrology to Astronomy</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              Standalone astrology festivals are not a widespread phenomenon on the East Coast. Instead, astrology is most commonly found as a specialized service or workshop integrated into larger spiritual or holistic events. When addressing "cosmic" events, it's crucial to distinguish between astrology (a divinatory practice) and astronomy (a scientific discipline).
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Curating Your Journey: Recommendations</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              <strong>For First-Time Explorers:</strong> A multi-faceted expo like Spirit Fest or the Holistic Health & Healing Expo offers an accessible, one-day experience with a wide variety of vendors and services.
            </Typography>
            <Typography variant="body2" paragraph>
              <strong>For Dedicated Seekers:</strong> A focused, ethos-driven event such as Transcend Fest provides deeper personal work and community connection.
            </Typography>
            <Typography variant="body2">
              <strong>For the Intellectually Curious:</strong> Penn State AstroFest offers a unique opportunity to explore the "cosmic" from a purely scientific perspective.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </TabPanel>
    </Container>
  );
}

