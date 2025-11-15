// src/components/dashboard/Web3Panel.tsx
import type { FC } from 'react';

import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import {
  ArticleOutlined,
  Diversity3Outlined,
  EmojiObjectsOutlined,
  HubOutlined,
  RocketLaunchOutlined,
  SchoolOutlined,
  VerifiedOutlined,
} from '@mui/icons-material';
import type { SvgIconComponent } from '@mui/icons-material';

interface ExperienceHighlight {
  title: string;
  description: string;
  icon: SvgIconComponent;
}

interface LearningTrack {
  title: string;
  description: string;
  duration: string;
  level: 'Foundational' | 'Intermediate' | 'Advanced';
  focus: string;
  ctaLabel: string;
  ctaLink: string;
}

interface ResourceItem {
  title: string;
  description: string;
  category: string;
  href: string;
  external?: boolean;
}

const experienceHighlights: ExperienceHighlight[] = [
  {
    title: 'Community-First Strategy',
    description:
      'Playbooks for aligning community incentives, onboarding rituals, and retention loops with your product roadmap.',
    icon: Diversity3Outlined,
  },
  {
    title: 'Protocol Partnerships',
    description:
      'Curated relationships with L1 and L2 ecosystems so you can fast-track grants, hackathons, and co-marketing.',
    icon: HubOutlined,
  },
  {
    title: 'Regenerative Education',
    description:
      'Learning sprints, office hours, and IRL salons designed for fast-moving operators and emerging venture teams.',
    icon: SchoolOutlined,
  },
];

const learningTracks: LearningTrack[] = [
  {
    title: 'Web3 Women Foundations',
    description:
      'A six-week cohort covering wallets, governance, DAOs, and safety. Built for product managers and community leads.',
    duration: '6 weeks · Live & async',
    level: 'Foundational',
    focus: 'Community Operations',
    ctaLabel: 'Join next cohort',
    ctaLink: 'https://isharehow.notion.site/web3-women-foundations',
  },
  {
    title: 'Token Utility Studio',
    description:
      'Rapid prototyping exercises to design token-enabled experiences with real user feedback from partner communities.',
    duration: '3 weeks · Studio format',
    level: 'Intermediate',
    focus: 'Product Experimentation',
    ctaLabel: 'Book a studio slot',
    ctaLink: 'mailto:ventures@isharehowlabs.com?subject=Token%20Utility%20Studio',
  },
  {
    title: 'Community Treasury Residency',
    description:
      'Hands-on residency for treasury stewards exploring revenue share models, on-chain analytics, and sustainability.',
    duration: '4 weeks · Residency',
    level: 'Advanced',
    focus: 'Treasury Stewardship',
    ctaLabel: 'Request invite',
    ctaLink: 'https://isharehowlabs.com/web3-treasury',
  },
];

const resourceItems: ResourceItem[] = [
  {
    title: 'Playbook: Designing Onboarding Rituals',
    description:
      'Step-by-step guide to craft onboarding arcs that convert newcomers into active contributors within 14 days.',
    category: 'Playbook',
    href: 'https://isharehow.notion.site/web3-onboarding-playbook',
    external: true,
  },
  {
    title: 'Template: Partner Ecosystem Brief',
    description:
      'A Notion template to align BD, community, and product teams before you pitch protocol partnerships.',
    category: 'Template',
    href: 'https://isharehow.notion.site/partner-ecosystem-brief',
    external: true,
  },
  {
    title: 'Report: State of Regenerative Economies',
    description:
      'Quarterly trend report summarizing funding, regenerative initiatives, and emerging experiments across the space.',
    category: 'Report',
    href: 'https://isharehow.app/regenerative-economies-report.pdf',
    external: true,
  },
];

const ExperienceCard: FC<ExperienceHighlight> = ({ title, description, icon: Icon }) => (
  <Card
    variant="outlined"
    sx={{
      borderRadius: 3,
      height: '100%',
      borderColor: 'divider',
      p: 3,
      display: 'flex',
    }}
  >
    <Stack spacing={2} sx={{ flexGrow: 1 }}>
      <Avatar
        variant="rounded"
        sx={{
          bgcolor: 'primary.light',
          color: 'primary.main',
          width: 48,
          height: 48,
        }}
      >
        <Icon fontSize="small" />
      </Avatar>
      <Box>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Box>
    </Stack>
  </Card>
);

const LearningTrackCard: FC<{ track: LearningTrack }> = ({ track }) => (
  <Card
    variant="outlined"
    sx={{
      borderRadius: 3,
      height: '100%',
      p: 3,
      borderColor: 'divider',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
    }}
  >
    <Stack direction="row" spacing={1} alignItems="center">
      <Avatar
        variant="rounded"
        sx={{
          bgcolor: 'secondary.light',
          color: 'secondary.main',
          width: 40,
          height: 40,
        }}
      >
        <RocketLaunchOutlined fontSize="small" />
      </Avatar>
      <Stack spacing={0.5}>
        <Chip
          label={track.level}
          size="small"
          color={track.level === 'Advanced' ? 'secondary' : 'default'}
          sx={{ fontWeight: 600 }}
        />
        <Typography variant="body2" color="text.secondary">
          {track.duration}
        </Typography>
      </Stack>
    </Stack>
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        {track.title}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {track.description}
      </Typography>
    </Box>
    <Divider />
    <Stack direction="row" spacing={1} alignItems="center">
      <EmojiObjectsOutlined color="primary" fontSize="small" />
      <Typography variant="body2" color="text.secondary">
        Spotlight: {track.focus}
      </Typography>
    </Stack>
    <Button
      variant="contained"
      color="primary"
      href={track.ctaLink}
      target={track.ctaLink.startsWith('http') ? '_blank' : undefined}
      rel={track.ctaLink.startsWith('http') ? 'noopener noreferrer' : undefined}
      sx={{ textTransform: 'none', fontWeight: 700, mt: 'auto' }}
    >
      {track.ctaLabel}
    </Button>
  </Card>
);

const ResourceCard: FC<{ resource: ResourceItem }> = ({ resource }) => (
  <Card
    variant="outlined"
    sx={{
      borderRadius: 3,
      p: 3,
      borderColor: 'divider',
      display: 'flex',
      gap: 2,
      flexDirection: { xs: 'column', sm: 'row' },
      alignItems: { xs: 'flex-start', sm: 'center' },
      justifyContent: 'space-between',
    }}
  >
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Chip
          label={resource.category}
          size="small"
          color="primary"
          sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.6 }}
        />
        {resource.external && (
          <VerifiedOutlined fontSize="small" sx={{ color: 'primary.main', opacity: 0.8 }} />
        )}
      </Stack>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {resource.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 640 }}>
        {resource.description}
      </Typography>
    </Stack>
    <Button
      href={resource.href}
      target={resource.external ? '_blank' : undefined}
      rel={resource.external ? 'noopener noreferrer' : undefined}
      variant="outlined"
      color="primary"
      sx={{ textTransform: 'none', fontWeight: 700, minWidth: 180 }}
    >
      Open resource
    </Button>
  </Card>
);

export default function Web3Panel() {
  return (
    <Box sx={{ height: '100%', overflow: 'auto', p: { xs: 2, sm: 3 } }}>
      <Stack spacing={5}>
        <Box>
          <Chip
            label="Web3 Women"
            color="primary"
            icon={<ArticleOutlined fontSize="small" />}
            sx={{ fontWeight: 700, mb: 2, alignSelf: 'flex-start' }}
          />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              mb: 2,
              background: 'linear-gradient(90deg, #22D3EE, #6366F1)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Web3 Strategy & Community Hub
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 720 }}>
            A centralized dashboard for the Web3 Women initiative—bringing education, community programs, and
            downloadable resources into the same workspace that powers the rest of the iShareHow Labs ventures.
          </Typography>
        </Box>
        <Grid container spacing={3}>
          {experienceHighlights.map((item) => (
            <Grid item xs={12} md={4} key={item.title}>
              <ExperienceCard {...item} />
            </Grid>
          ))}
        </Grid>
        <Box id="foundations">
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Guided Learning Tracks
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Assign a pathway to a teammate or bookmark for your own professional development plan.
              </Typography>
            </Box>
            <Button
              variant="text"
              href="mailto:ventures@isharehowlabs.com?subject=Workshop%20Request"
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Request a private workshop
            </Button>
          </Stack>
          <Grid container spacing={3}>
            {learningTracks.map((track) => (
              <Grid item xs={12} md={4} key={track.title}>
                <LearningTrackCard track={track} />
              </Grid>
            ))}
          </Grid>
        </Box>
        <Stack spacing={2}>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Resource Library
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 720 }}>
            These assets plug directly into the broader ventures dashboard—each link is aligned with existing
            Notion documentation, Discord channels, or internal storage that your team already uses.
          </Typography>
          <Stack spacing={2}>
            {resourceItems.map((resource) => (
              <ResourceCard key={resource.title} resource={resource} />
            ))}
          </Stack>
        </Stack>
        <Card
          variant="outlined"
          sx={{
            borderRadius: 3,
            p: { xs: 3, md: 4 },
            borderColor: 'divider',
            background: 'linear-gradient(120deg, rgba(34,211,238,0.12), rgba(99,102,241,0.12))',
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={3}
            alignItems={{ xs: 'flex-start', md: 'center' }}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                Bring Web3 Into Your Roadmap
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Drop a note in #venture-labs inside Discord or email the product council to queue up the next
                experiment. We coordinate playbooks, speakers, and workshop facilitation for you.
              </Typography>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Button
                variant="contained"
                color="primary"
                href="https://isharehow.app/discord"
                target="_blank"
                rel="noopener noreferrer"
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                Join the Discord
              </Button>
              <Button
                variant="outlined"
                color="primary"
                href="mailto:ventures@isharehowlabs.com?subject=Program%20Inquiry"
                sx={{ textTransform: 'none', fontWeight: 700 }}
              >
                Email Program Team
              </Button>
            </Stack>
          </Stack>
        </Card>
      </Stack>
    </Box>
  );
}

