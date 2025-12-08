import Head from 'next/head';
import Link from 'next/link';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Stack,
  Divider,
  Chip,
  useTheme,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  Groups as GroupsIcon,
  Dashboard as DashboardIcon,
  VideoLibrary as VideoLibraryIcon,
  Description as DescriptionIcon,
  LiveTv as LiveTvIcon,
  Lock as LockIcon,
} from '@mui/icons-material';

export default function GrowthMachinePage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const joinCoOperation = () => {
    // Redirect to signup or demo page
    window.location.href = '/demo?tier=builder';
  };

  return (
    <>
      <Head>
        <title>iShareHow CoOperation: Own Your Consciousness, Shape Your Rise | iShareHow Labs</title>
        <meta
          name="description"
          content="Join the iShareHow CoOperation and be part of a movement dedicated to living, creating, and thinking with profound awareness. Transform from consumer to creator, from follower to sovereign."
        />
      </Head>

      <Box sx={{ bgcolor: 'background.default', color: 'text.primary', minHeight: '100vh' }}>
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
                <Typography variant="h5" fontWeight={700} color="primary.main">
                  iShareHow Labs
                </Typography>
              </Link>
              <Link href="/" style={{ textDecoration: 'none' }}>
                <Button variant="outlined" color="primary">
                  Back to Home
                </Button>
              </Link>
            </Stack>
          </Container>
        </Box>

        <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
          {/* Hero Section */}
          <Card
            elevation={3}
            sx={{
              mb: 6,
              background: isDark
                ? 'linear-gradient(135deg, rgba(75, 93, 189, 0.15) 0%, rgba(107, 125, 215, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(75, 93, 189, 0.08) 0%, rgba(107, 125, 215, 0.05) 100%)',
              border: `1px solid ${theme.palette.primary.main}40`,
            }}
          >
            <CardContent sx={{ p: { xs: 4, md: 6 }, textAlign: 'center' }}>
              <Chip
                label="✨ Join the Movement"
                color="primary"
                sx={{ mb: 3, fontWeight: 700, fontSize: '0.9rem', py: 2.5 }}
              />
              <Typography
                variant="h3"
                fontWeight={800}
                gutterBottom
                sx={{
                  fontSize: { xs: '1.75rem', md: '2.5rem' },
                  mb: 3,
                  color: 'text.primary',
                }}
              >
                iShareHow CoOperation: Own Your Consciousness, Shape Your Rise
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  color: 'text.secondary',
                  mb: 4,
                  fontSize: { xs: '1rem', md: '1.25rem' },
                  lineHeight: 1.7,
                }}
              >
                Join the iShareHow CoOperation and be part of a movement dedicated to living, creating, and thinking with profound awareness. Here, you will gain the tools to master your mind, build robust systems of power, and consciously shape culture.
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  mb: 4,
                  lineHeight: 1.8,
                }}
              >
                This is beyond motivation—it is a complete transformation. Every lesson, ritual, and conversation is meticulously designed to elevate you from a consumer to a creator, from a follower to a sovereign, and from a solitary individual to a powerful collective.
              </Typography>

              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={joinCoOperation}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: 'primary.main',
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  mb: 2,
                  '&:hover': {
                    bgcolor: 'primary.dark',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s',
                }}
              >
                Join the CoOperation
              </Button>
              <Typography variant="body2" color="text.secondary">
                1-Week Free Trial | No Upfront Commitment | Transform Your Consciousness
              </Typography>
            </CardContent>
          </Card>

          {/* The Builder Tier Section */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
              The Builder Tier: From Watching to Building
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.8 }}>
              Step into the community that journeys consciously who rises together. Come create the future with us. This tier is for those who are ready to apply the wisdom of others and grow in real-time alongside others doing the same.
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.8 }}>
              It provides access to the workshops, blueprints, and live sessions essential for moving the culture forward. We are so confident in our model that we offer new clients the opportunity to try our services for 1 week with no upfront commitment.
            </Typography>
            <Card
              elevation={2}
              sx={{
                bgcolor: 'success.main',
                color: 'white',
                p: 3,
                borderRadius: 2,
                mt: 3,
              }}
            >
              <Typography variant="body1" fontWeight={600} sx={{ lineHeight: 1.7 }}>
                This trial allows you to experience iShareHow&apos;s collective power in Creative-as-a-Service (CaaS) model &amp; Rise Collective Journey first-hand and evaluate both the turnaround time and the quality of our work.
              </Typography>
            </Card>
          </Box>

          <Divider sx={{ my: 6 }} />

          {/* Builder Tier Includes */}
          <Card elevation={2} sx={{ mb: 6, bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: { xs: 4, md: 6 } }}>
              <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 4 }}>
                Builder Tier Includes:
              </Typography>

              {/* Exclusive Access */}
              <Box sx={{ mb: 4 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                  <LockIcon sx={{ color: 'primary.main', fontSize: 32 }} />
                  <Typography variant="h5" fontWeight={700} sx={{ color: 'text.primary' }}>
                    Exclusive Access
                  </Typography>
                </Stack>
                <Stack spacing={2} sx={{ pl: 6 }}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <CheckCircleIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                    <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                      iShareHow Dashboard private digital community
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <CheckCircleIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                    <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                      Private Builder group for deep collaboration
                    </Typography>
                  </Stack>
                </Stack>
              </Box>

              <Divider sx={{ my: 4 }} />

              {/* Direct Engagement & Tools */}
              <Box sx={{ mb: 4 }}>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                  <GroupsIcon sx={{ color: 'primary.main', fontSize: 32 }} />
                  <Typography variant="h5" fontWeight={700} sx={{ color: 'text.primary' }}>
                    Direct Engagement &amp; Tools
                  </Typography>
                </Stack>
                <Stack spacing={2} sx={{ pl: 6 }}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <CheckCircleIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                    <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                      Weekly live Builder Session with the Co-Work Collective
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <CheckCircleIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                    <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                      Exclusive PDFs, notes, frameworks and dashboards
                    </Typography>
                  </Stack>
                </Stack>
              </Box>

              <Divider sx={{ my: 4 }} />

              {/* Content & Extras */}
              <Box>
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                  <VideoLibraryIcon sx={{ color: 'primary.main', fontSize: 32 }} />
                  <Typography variant="h5" fontWeight={700} sx={{ color: 'text.primary' }}>
                    Content &amp; Extras
                  </Typography>
                </Stack>
                <Stack spacing={2} sx={{ pl: 6 }}>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <CheckCircleIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                    <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                      Unlock The iShareHow Ventures
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <CheckCircleIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                    <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                      Behind-the-scenes content
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <CheckCircleIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                    <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                      Exclusive content
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={2} alignItems="flex-start">
                    <CheckCircleIcon sx={{ color: 'primary.main', mt: 0.5 }} />
                    <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                      Livestreams
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            </CardContent>
          </Card>

          {/* Transformation Benefits */}
          <Box sx={{ mb: 6 }}>
            <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
              Your Transformation Journey
            </Typography>
            <Grid container spacing={3}>
              {[
                {
                  icon: <DashboardIcon sx={{ fontSize: 40 }} />,
                  title: 'From Consumer to Creator',
                  description: 'Transform from passively consuming content to actively creating value and building your own systems of power.',
                },
                {
                  icon: <GroupsIcon sx={{ fontSize: 40 }} />,
                  title: 'From Follower to Sovereign',
                  description: 'Develop the consciousness and tools to lead rather than follow, becoming a sovereign individual in your domain.',
                },
                {
                  icon: <VideoLibraryIcon sx={{ fontSize: 40 }} />,
                  title: 'From Solitary to Collective',
                  description: 'Join a powerful collective of conscious creators who rise together, sharing wisdom and building the future.',
                },
              ].map((benefit, index) => (
                <Grid item xs={12} md={4} key={index}>
                  <Card elevation={2} sx={{ height: '100%', bgcolor: 'background.paper', textAlign: 'center' }}>
                    <CardContent sx={{ p: 4 }}>
                      <Box sx={{ color: 'primary.main', mb: 2 }}>
                        {benefit.icon}
                      </Box>
                      <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 2, color: 'text.primary' }}>
                        {benefit.title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                        {benefit.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>

          <Divider sx={{ my: 6 }} />

          {/* Final CTA */}
          <Card
            elevation={3}
            sx={{
              mb: 6,
              background: isDark
                ? 'linear-gradient(135deg, rgba(75, 93, 189, 0.15) 0%, rgba(107, 125, 215, 0.1) 100%)'
                : 'linear-gradient(135deg, rgba(75, 93, 189, 0.08) 0%, rgba(107, 125, 215, 0.05) 100%)',
              border: `1px solid ${theme.palette.primary.main}40`,
            }}
          >
            <CardContent sx={{ p: { xs: 4, md: 6 }, textAlign: 'center' }}>
              <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 2 }}>
                Ready to Own Your Consciousness and Shape Your Rise?
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 4, lineHeight: 1.7 }}>
                Join the iShareHow CoOperation today and start your transformation journey. Experience the power of conscious creation, collective wisdom, and sovereign thinking.
              </Typography>
              <Button
                variant="contained"
                size="large"
                fullWidth
                onClick={joinCoOperation}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: 'primary.main',
                  py: 2,
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  '&:hover': {
                    bgcolor: 'primary.dark',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s',
                }}
              >
                Start Your 1-Week Free Trial
              </Button>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                No upfront commitment | Cancel anytime | Join the movement
              </Typography>
            </CardContent>
          </Card>

          {/* Footer */}
          <Box component="footer" sx={{ textAlign: 'center', py: 4, borderTop: `1px solid ${theme.palette.divider}` }}>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
              © 2025 iShareHow Labs LLC | Helping Agencies Build Community-Driven Growth
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Link href="/privacy" style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>
                Privacy
              </Link>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>|</Typography>
              <Link href="/terms" style={{ color: theme.palette.primary.main, textDecoration: 'none' }}>
                Terms
              </Link>
            </Stack>
          </Box>
        </Container>
      </Box>
    </>
  );
}

