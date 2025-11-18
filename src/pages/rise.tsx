import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Stack,
  Avatar,
  Divider,
  IconButton,
  Button,
  Paper,
  useTheme,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  School as SchoolIcon,
  EmojiEvents as EmojiEventsIcon,
  FitnessCenter as FitnessCenterIcon,
  Psychology as PsychologyIcon,
  Business as BusinessIcon,
  Lightbulb as LightbulbIcon,
  Group as GroupIcon,
  Edit as EditIcon,
  LocalFlorist as LocalFloristIcon,
  DirectionsBike as DirectionsBikeIcon,
  Quiz as QuizIcon,
  ShoppingCart as ShoppingCartIcon,
  VideoLibrary as VideoLibraryIcon,
  Spa as SpaIcon,
  Park as ParkIcon,
  Restaurant as RestaurantIcon,
  SelfImprovement as SelfImprovementIcon,
  OpenInNew as OpenInNewIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import AppShell from '../components/AppShell';

// Types for character sheet data
interface Stat {
  name: string;
  value: number;
  max: number;
  color: string;
  icon: React.ReactNode;
}

interface Skill {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  category: string;
  experience: number;
  experienceToNext: number;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  unlockedDate?: string;
  icon: string;
}

interface TrainingGoal {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  category: string;
  deadline?: string;
}

interface WellnessProduct {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface CyclingStat {
  label: string;
  value: string | number;
  unit: string;
}

interface RISEPrinciple {
  title: string;
  description: string;
  icon: React.ReactNode;
}

// Sample data - in production, this would come from an API
const initialStats: Stat[] = [
  { name: 'Physical', value: 65, max: 100, color: '#ff6b6b', icon: <FitnessCenterIcon /> },
  { name: 'Mental', value: 80, max: 100, color: '#4ecdc4', icon: <PsychologyIcon /> },
  { name: 'Professional', value: 72, max: 100, color: '#45b7d1', icon: <BusinessIcon /> },
  { name: 'Creative', value: 58, max: 100, color: '#f9ca24', icon: <LightbulbIcon /> },
  { name: 'Social', value: 70, max: 100, color: '#6c5ce7', icon: <GroupIcon /> },
];

const initialSkills: Skill[] = [
  { id: '1', name: 'Leadership', level: 7, maxLevel: 10, category: 'Professional', experience: 750, experienceToNext: 250 },
  { id: '2', name: 'Communication', level: 8, maxLevel: 10, category: 'Social', experience: 1200, experienceToNext: 300 },
  { id: '3', name: 'Problem Solving', level: 9, maxLevel: 10, category: 'Mental', experience: 1800, experienceToNext: 200 },
  { id: '4', name: 'Time Management', level: 6, maxLevel: 10, category: 'Professional', experience: 450, experienceToNext: 550 },
  { id: '5', name: 'Public Speaking', level: 5, maxLevel: 10, category: 'Social', experience: 300, experienceToNext: 700 },
  { id: '6', name: 'Strategic Thinking', level: 8, maxLevel: 10, category: 'Mental', experience: 1100, experienceToNext: 400 },
];

const initialAchievements: Achievement[] = [
  { id: '1', title: 'First Steps', description: 'Completed your first training module', unlocked: true, unlockedDate: '2024-01-15', icon: '🎯' },
  { id: '2', title: 'Rising Star', description: 'Reached level 5 in any skill', unlocked: true, unlockedDate: '2024-02-20', icon: '⭐' },
  { id: '3', title: 'Mentor', description: 'Helped 5 people reach their goals', unlocked: false, icon: '👥' },
  { id: '4', title: 'Master', description: 'Reached level 10 in any skill', unlocked: false, icon: '👑' },
  { id: '5', title: 'Well-Rounded', description: 'All stats above 60', unlocked: false, icon: '🌟' },
];

const initialGoals: TrainingGoal[] = [
  { id: '1', title: 'Complete Leadership Course', description: 'Finish the 12-week leadership program', progress: 60, target: 100, category: 'Professional', deadline: '2024-12-31' },
  { id: '2', title: 'Improve Physical Fitness', description: 'Reach 75 in Physical stat', progress: 65, target: 75, category: 'Physical' },
  { id: '3', title: 'Build Network', description: 'Connect with 50 professionals', progress: 32, target: 50, category: 'Social' },
  { id: '4', title: 'Learn New Skill', description: 'Master a new technical skill', progress: 40, target: 100, category: 'Professional' },
];

// Wellness Lab Data
const wellnessProducts: WellnessProduct[] = [
  { id: '1', icon: '🌿', title: 'Detox Herbal Blend', description: 'Cleanse your body with our powerful blend of herbs designed to support lymphatic and digestive health.' },
  { id: '2', icon: '⚡', title: 'Energizing Tonic', description: 'Boost vitality and balance with our advanced herbal tonic, crafted to enhance energy flow.' },
  { id: '3', icon: '💧', title: 'Nervous System Support', description: 'Calm and restore your nervous system with our soothing herbal formula, inspired by holistic traditions.' },
  { id: '4', icon: '👁️', title: 'Immune Defense Capsules', description: 'Strengthen your body\'s natural defenses with our advanced herbal capsules for holistic immunity.' },
];

const microHabitsFeatures = [
  { icon: '📋', title: 'Personalized Plan', description: 'Custom micro-habits based on your goals, schedule, and lifestyle preferences' },
  { icon: '📱', title: 'Free Digital Tracker', description: 'Beautiful habit tracking app with reminders, progress charts, and streak counters' },
  { icon: '🎓', title: 'Daily Guidance', description: 'Step-by-step instructions, tips, and science-backed insights for each day' },
  { icon: '🌟', title: 'Lifetime Access', description: 'Keep your plan forever, plus access to our growing library of bonus habits' },
];

// RISE Cycling Data
const cyclingStats: CyclingStat[] = [
  { label: 'FTP (Xert)', value: 284, unit: 'W' },
  { label: 'Weight', value: 69.5, unit: 'kg' },
  { label: 'W/kg Ratio', value: 4.05, unit: 'W/kg' },
];

const risePrinciples: RISEPrinciple[] = [
  {
    title: 'Nature Grounding',
    description: 'We believe and love the Earth, connecting with its rhythms and energies to foster holistic well-being.',
    icon: <ParkIcon />,
  },
  {
    title: 'Protect Your Gut',
    description: 'Independent food production and eating for energy generation. Focus on gut health through fermented foods, prebiotics, and nutrient-dense meals.',
    icon: <RestaurantIcon />,
  },
  {
    title: 'Self-Correction Algorithm',
    description: 'Inner alchemy processing, shadow work subroutines, and conscious evolution protocols, Intuition enhancement, and transcendental awareness.',
    icon: <SelfImprovementIcon />,
  },
];

function StatCard({ stat }: { stat: Stat }) {
  const percentage = (stat.value / stat.max) * 100;
  
  return (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'visible' }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Avatar sx={{ bgcolor: stat.color, width: 48, height: 48 }}>
            {stat.icon}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" fontWeight={600}>
              {stat.name}
            </Typography>
            <Typography variant="h4" fontWeight={700} color={stat.color}>
              {stat.value}
              <Box component="span" sx={{ ml: 0.5, fontSize: '0.875rem', color: 'text.secondary' }}>
                / {stat.max}
              </Box>
            </Typography>
          </Box>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{
            height: 10,
            borderRadius: 5,
            bgcolor: 'grey.200',
            '& .MuiLinearProgress-bar': {
              bgcolor: stat.color,
              borderRadius: 5,
            },
          }}
        />
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          {stat.max - stat.value} points to max
        </Typography>
      </CardContent>
    </Card>
  );
}

function SkillCard({ skill }: { skill: Skill }) {
  const percentage = (skill.experience / (skill.experience + skill.experienceToNext)) * 100;
  
  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {skill.name}
            </Typography>
            <Chip
              label={skill.category}
              size="small"
              sx={{ mt: 0.5, height: 20, fontSize: '0.7rem' }}
            />
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h6" fontWeight={700} color="primary">
              Lv. {skill.level}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              / {skill.maxLevel}
            </Typography>
          </Box>
        </Stack>
        <Box sx={{ mt: 2 }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Experience
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {skill.experience} / {skill.experience + skill.experienceToNext} XP
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={percentage}
            sx={{
              height: 8,
              borderRadius: 4,
            }}
          />
        </Box>
      </CardContent>
    </Card>
  );
}

function AchievementCard({ achievement }: { achievement: Achievement }) {
  return (
    <Card
      variant="outlined"
      sx={{
        mb: 2,
        opacity: achievement.unlocked ? 1 : 0.5,
        border: achievement.unlocked ? 2 : 1,
        borderColor: achievement.unlocked ? 'primary.main' : 'divider',
        position: 'relative',
      }}
    >
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="center">
          <Box
            sx={{
              fontSize: '2.5rem',
              width: 64,
              height: 64,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: achievement.unlocked ? 'primary.light' : 'grey.100',
              borderRadius: 2,
            }}
          >
            {achievement.icon}
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              {achievement.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {achievement.description}
            </Typography>
            {achievement.unlocked && achievement.unlockedDate && (
              <Typography variant="caption" color="primary" sx={{ mt: 0.5, display: 'block' }}>
                Unlocked: {new Date(achievement.unlockedDate).toLocaleDateString()}
              </Typography>
            )}
          </Box>
          {achievement.unlocked && (
            <Chip label="Unlocked" color="primary" size="small" />
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function GoalCard({ goal }: { goal: TrainingGoal }) {
  const percentage = (goal.progress / goal.target) * 100;
  
  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" fontWeight={600}>
              {goal.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {goal.description}
            </Typography>
          </Box>
          <Chip label={goal.category} size="small" color="primary" variant="outlined" />
        </Stack>
        <Box sx={{ mt: 2 }}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              Progress
            </Typography>
            <Typography variant="caption" fontWeight={600}>
              {goal.progress} / {goal.target}
            </Typography>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={percentage}
            sx={{
              height: 10,
              borderRadius: 5,
            }}
          />
          {goal.deadline && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Deadline: {new Date(goal.deadline).toLocaleDateString()}
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

function WellnessProductCard({ product }: { product: WellnessProduct }) {
  return (
    <Card variant="outlined" sx={{ height: '100%', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-4px)' } }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Box sx={{ fontSize: '2.5rem' }}>{product.icon}</Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              {product.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {product.description}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function CyclingStatCard({ stat }: { stat: CyclingStat }) {
  return (
    <Card sx={{ textAlign: 'center', height: '100%' }}>
      <CardContent>
        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
          {stat.label}
        </Typography>
        <Typography variant="h4" fontWeight={700} color="primary">
          {stat.value}
          <Box component="span" sx={{ ml: 0.5, fontSize: '1.25rem', color: 'text.secondary' }}>
            {stat.unit}
          </Box>
        </Typography>
      </CardContent>
    </Card>
  );
}

function RISEPrincipleCard({ principle }: { principle: RISEPrinciple }) {
  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" spacing={2} alignItems="flex-start">
          <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
            {principle.icon}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              {principle.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {principle.description}
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}

function RiseDashboard() {
  const theme = useTheme();
  const [stats, setStats] = useState<Stat[]>(initialStats);
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements);
  const [goals, setGoals] = useState<TrainingGoal[]>(initialGoals);

  // Load from localStorage if available
  useEffect(() => {
    const savedStats = localStorage.getItem('rise_stats');
    const savedSkills = localStorage.getItem('rise_skills');
    const savedAchievements = localStorage.getItem('rise_achievements');
    const savedGoals = localStorage.getItem('rise_goals');

    if (savedStats) setStats(JSON.parse(savedStats));
    if (savedSkills) setSkills(JSON.parse(savedSkills));
    if (savedAchievements) setAchievements(JSON.parse(savedAchievements));
    if (savedGoals) setGoals(JSON.parse(savedGoals));
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('rise_stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('rise_skills', JSON.stringify(skills));
  }, [skills]);

  useEffect(() => {
    localStorage.setItem('rise_achievements', JSON.stringify(achievements));
  }, [achievements]);

  useEffect(() => {
    localStorage.setItem('rise_goals', JSON.stringify(goals));
  }, [goals]);

  const overallLevel = Math.floor(
    stats.reduce((sum, stat) => sum + stat.value, 0) / stats.length / 10
  );

  return (
    <AppShell active="rise">
      <Box sx={{ mb: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 900,
              mb: 1,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              background: 'linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            RISE Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Your personal development character sheet - track your growth across all aspects
          </Typography>
          
          {/* Overall Level Badge */}
          <Paper
            elevation={3}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
              px: 3,
              py: 1.5,
              borderRadius: 3,
              bgcolor: 'primary.main',
              color: 'white',
            }}
          >
            <TrendingUpIcon sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Overall Level
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {overallLevel}
              </Typography>
            </Box>
          </Paper>
        </Box>

        {/* Stats Grid */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
            <FitnessCenterIcon color="primary" />
            Core Attributes
          </Typography>
          <Grid container spacing={3}>
            {stats.map((stat) => (
              <Grid item xs={12} sm={6} md={4} lg={2.4} key={stat.name}>
                <StatCard stat={stat} />
              </Grid>
            ))}
          </Grid>
        </Box>

        <Grid container spacing={3}>
          {/* Skills Panel */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                  <Typography variant="h5" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SchoolIcon color="primary" />
                    Skills & Competencies
                  </Typography>
                  <IconButton size="small">
                    <EditIcon fontSize="small" />
                  </IconButton>
                </Stack>
                <Box sx={{ maxHeight: 600, overflowY: 'auto', pr: 1 }}>
                  {skills.map((skill) => (
                    <SkillCard key={skill.id} skill={skill} />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Training Goals Panel */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                  <Typography variant="h5" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TrendingUpIcon color="primary" />
                    Training Goals
                  </Typography>
                  <Button size="small" startIcon={<EditIcon />}>
                    Add Goal
                  </Button>
                </Stack>
                <Box sx={{ maxHeight: 600, overflowY: 'auto', pr: 1 }}>
                  {goals.map((goal) => (
                    <GoalCard key={goal.id} goal={goal} />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Achievements Panel */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                  <Typography variant="h5" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <EmojiEventsIcon color="primary" />
                    Achievements & Milestones
                  </Typography>
                </Stack>
                <Grid container spacing={2}>
                  {achievements.map((achievement) => (
                    <Grid item xs={12} sm={6} md={4} key={achievement.id}>
                      <AchievementCard achievement={achievement} />
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Wellness Lab Panel */}
        <Box sx={{ mt: 4, mb: 4 }}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SpaIcon color="primary" />
                  Wellness Lab
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  href="https://ventures.isharehow.app/wellness/"
                  target="_blank"
                  endIcon={<OpenInNewIcon />}
                >
                  Visit Wellness Lab
                </Button>
              </Stack>

              {/* 7-Day Micro-Habits Plan */}
              <Box sx={{ mb: 4 }}>
                <Paper
                  elevation={2}
                  sx={{
                    p: 3,
                    mb: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                  }}
                >
                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <CheckCircleIcon sx={{ fontSize: 40 }} />
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        7-Day Micro-Habits Plan + Free Digital Tracker
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Science-proven small changes that create massive results
                      </Typography>
                    </Box>
                  </Stack>
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    {microHabitsFeatures.map((feature, index) => (
                      <Grid item xs={12} sm={6} md={3} key={index}>
                        <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', p: 2, borderRadius: 2, height: '100%' }}>
                          <Box sx={{ fontSize: '2.5rem', mb: 1, display: 'flex', justifyContent: 'center' }}>
                            {feature.icon}
                          </Box>
                          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
                            {feature.title}
                          </Typography>
                          <Typography variant="caption" sx={{ opacity: 0.9 }}>
                            {feature.description}
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{ mt: 3, bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
                    href="https://www.patreon.com/cw/JamelEliYah"
                    target="_blank"
                    endIcon={<OpenInNewIcon />}
                  >
                    Join Patreon for Free Ebook
                  </Button>
                </Paper>
              </Box>

              {/* Body System Cleanse Quiz */}
              <Box sx={{ mb: 4 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <QuizIcon color="primary" />
                    Body System Cleanse Quiz
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    href="https://ventures.isharehow.app/wellness/#quiz"
                    target="_blank"
                    endIcon={<OpenInNewIcon />}
                  >
                    Take Quiz
                  </Button>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Answer questions to identify which body system may need cleansing: Digestive, Urinary, Lymphatic, Respiratory, or Integumentary.
                </Typography>
              </Box>

              {/* Healing Products */}
              <Box>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <ShoppingCartIcon color="primary" />
                  Our Healing Products
                </Typography>
                <Grid container spacing={2}>
                  {wellnessProducts.map((product) => (
                    <Grid item xs={12} sm={6} md={3} key={product.id}>
                      <WellnessProductCard product={product} />
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Educational Resources */}
              <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <VideoLibraryIcon color="primary" />
                  Educational Resources
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap">
                  <Button
                    variant="outlined"
                    size="small"
                    href="https://www.youtube.com/@RisewithJamel"
                    target="_blank"
                    endIcon={<OpenInNewIcon />}
                  >
                    YouTube - Rise with Jamel
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    href="https://www.patreon.com/cw/JamelEliYah"
                    target="_blank"
                    endIcon={<OpenInNewIcon />}
                  >
                    Patreon - Jamel EliYah
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    href="https://www.facebook.com/JamelEliYah"
                    target="_blank"
                    endIcon={<OpenInNewIcon />}
                  >
                    Facebook - Jamel EliYah
                  </Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* RISE Cycling Panel */}
        <Box sx={{ mb: 4 }}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DirectionsBikeIcon color="primary" />
                  RISE Cycling
                </Typography>
                <Button
                  variant="outlined"
                  size="small"
                  href="https://ventures.isharehow.app/rise_cycling/"
                  target="_blank"
                  endIcon={<OpenInNewIcon />}
                >
                  Visit RISE Cycling
                </Button>
              </Stack>

              {/* 4-Week Power-Ride Program */}
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  mb: 4,
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: 'white',
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                  <DirectionsBikeIcon sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      4-Week Power-Ride Program
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Transform your cycling performance with structured training plans, performance tracking, and community support. Try your first week completely free.
                    </Typography>
                  </Box>
                </Stack>
                <Button
                  variant="contained"
                  sx={{ mt: 2, bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
                  href="https://ventures.isharehow.app/rise_cycling/"
                  target="_blank"
                  endIcon={<OpenInNewIcon />}
                >
                  Get Started
                </Button>
              </Paper>

              {/* Rider Statistics */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Rider Statistics
                </Typography>
                <Grid container spacing={2}>
                  {cyclingStats.map((stat, index) => (
                    <Grid item xs={12} sm={4} key={index}>
                      <CyclingStatCard stat={stat} />
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Core RISE Principles */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Core RISE Principles
                </Typography>
                <Grid container spacing={2}>
                  {risePrinciples.map((principle, index) => (
                    <Grid item xs={12} md={4} key={index}>
                      <RISEPrincipleCard principle={principle} />
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* Training & Resources */}
              <Box sx={{ pt: 3, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <VideoLibraryIcon color="primary" />
                  Training & Resource Footage
                </Typography>
                <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    href="https://www.youtube.com/@RisewithJamel"
                    target="_blank"
                    endIcon={<OpenInNewIcon />}
                  >
                    YouTube
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    href="https://www.twitch.tv/jameleliyah"
                    target="_blank"
                    endIcon={<OpenInNewIcon />}
                  >
                    Twitch
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    href="https://www.patreon.com/cw/JamelEliYah"
                    target="_blank"
                    endIcon={<OpenInNewIcon />}
                  >
                    Patreon
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    href="https://www.facebook.com/JamelEliYah"
                    target="_blank"
                    endIcon={<OpenInNewIcon />}
                  >
                    Facebook
                  </Button>
                </Stack>
                <Button
                  variant="contained"
                  color="primary"
                  href="https://isharehow.app/discord"
                  target="_blank"
                  endIcon={<OpenInNewIcon />}
                >
                  Join Our Discord Community
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </AppShell>
  );
}

export default RiseDashboard;

