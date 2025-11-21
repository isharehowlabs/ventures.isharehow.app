import React from 'react';
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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Snackbar,
  Alert,
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
  CloudDone as CloudDoneIcon,
  CloudSync as CloudSyncIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useAuth } from '../hooks/useAuth';
import AuraBar from '../components/wellness/AuraBar';
import { fetchAuras, updateAuras, debounce, logActivity, Aura } from '../components/wellness/api';
import {
  Hotel as SleepIcon,
  Restaurant as NutritionIcon,
  Bolt as EnergyIcon,
  Spa as StressIcon,
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
  { name: 'Physical', value: 50, max: 100, color: '#ff6b6b', icon: <FitnessCenterIcon /> },
  { name: 'Mental', value: 50, max: 100, color: '#4ecdc4', icon: <PsychologyIcon /> },
  { name: 'Spiritual', value: 50, max: 100, color: '#a29bfe', icon: <SelfImprovementIcon /> },
  { name: 'Nutrition', value: 50, max: 100, color: '#55efc4', icon: <NutritionIcon /> },
  { name: 'Sleep', value: 50, max: 100, color: '#74b9ff', icon: <SleepIcon /> },
  { name: 'Stress', value: 50, max: 100, color: '#fd79a8', icon: <StressIcon /> },
  { name: 'Energy', value: 50, max: 100, color: '#fdcb6e', icon: <EnergyIcon /> },
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
  const { user, isAuthenticated } = useAuth();
  const [isLoadingAuras, setIsLoadingAuras] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [stats, setStats] = useState<Stat[]>(initialStats);
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements);
  const [goals, setGoals] = useState<TrainingGoal[]>(initialGoals);
  // Activity logging state
  const [activityDialogOpen, setActivityDialogOpen] = useState(false);
  const [activityType, setActivityType] = useState('');
  const [activityForm, setActivityForm] = useState({
    name: '',
    duration: '',
    intensity: '',
    notes: ''
  });
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Handle activity logging to database
  const handleLogActivity = async (
    type: string,
    name: string,
    metadata: Record<string, any> = {},
    auraType: string,
    auraBoost: number
  ) => {
    if (!isAuthenticated || !user) {
      setSnackbar({
        open: true,
        message: 'Activity tracked locally. Sign in to sync across devices!',
        severity: 'success'
      });
      // Update local aura
      updateLocalAura(auraType, auraBoost);
      return;
    }

    try {
      // Log activity to database
      await logActivity(type, name, JSON.stringify(metadata));
      
      // Update aura value locally
      updateLocalAura(auraType, auraBoost);
      
      setSnackbar({
        open: true,
        message: `Activity logged! +${auraBoost} ${auraType} aura`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Failed to log activity:', error);
      setSnackbar({
        open: true,
        message: 'Failed to log activity. Try again.',
        severity: 'error'
      });
    }
  };

  // Update local aura value
  const updateLocalAura = (auraType: string, boost: number) => {
    setStats(prevStats => prevStats.map(stat => {
      if (stat.name === auraType) {
        return { ...stat, value: Math.min(stat.max, stat.value + boost) };
      }
      return stat;
    }));
  };


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

  // Fetch auras from API for authenticated users
  useEffect(() => {
    const loadAuras = async () => {
      if (!isAuthenticated || !user) {
        return; // Use localStorage for unauthenticated users
      }
      
      setIsLoadingAuras(true);
      try {
        const auras = await fetchAuras();
        
        // Map API auras to stats format
        const updatedStats = stats.map(stat => {
          const aura = auras.find(a => a.auraType === stat.name);
          return aura ? { ...stat, value: aura.value } : stat;
        });
        
        setStats(updatedStats);
        console.log('✓ Loaded auras from API:', auras);
      } catch (error) {
        console.error('Failed to load auras:', error);
        // Fallback to localStorage on error
      } finally {
        setIsLoadingAuras(false);
      }
    };
    
    loadAuras();
  }, [isAuthenticated, user]);

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

  // Debounced sync to API for authenticated users
  const syncAurasToAPI = React.useMemo(
    () =>
      debounce(async (statsToSync: Stat[]) => {
        if (!isAuthenticated || !user) return;
        

        setIsSyncing(true);
        setSyncError(null);
        try {
          const updates = statsToSync.map(stat => ({
            auraType: stat.name,
            value: stat.value,
          }));
          
          await updateAuras(updates);
          setLastSyncTime(new Date());
          console.log('✓ Synced auras to API');
        } catch (error) {
          console.error('Failed to sync auras:', error);
          setSyncError(error instanceof Error ? error.message : 'Sync failed');
        } finally {
          setIsSyncing(false);
        }
      }, 1000),
    [isAuthenticated, user]
  );

  // Sync stats changes to API
  useEffect(() => {
    if (isAuthenticated && !isLoadingAuras) {
      syncAurasToAPI(stats);
    }
  }, [stats, isAuthenticated, isLoadingAuras, syncAurasToAPI]);

  const overallLevel = Math.floor(
    stats.reduce((sum, stat) => sum + stat.value, 0) / stats.length / 10
  );

  return (
    <>
      <AppShell active="rise">
        <Box sx={{ mb: 4 }}>
        {/* Header */}
        {/* Sync Status Indicator */}
        {isAuthenticated && (
          <Box sx={{ 
            position: 'fixed', 
            top: 80, 
            right: 20, 
            zIndex: 1000,
            background: syncError ? 'rgba(244, 67, 54, 0.9)' : isSyncing ? 'rgba(255, 152, 0, 0.9)' : 'rgba(76, 175, 80, 0.9)',
            color: 'white',
            px: 2,
            py: 1,
            borderRadius: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            boxShadow: 3
          }}>
            {syncError ? (
              <>
                <ErrorIcon fontSize="small" />
                <Typography variant="caption">Sync Error</Typography>
              </>
            ) : isSyncing ? (
              <>
                <CloudSyncIcon fontSize="small" className="rotating-icon" />
                <Typography variant="caption">Syncing...</Typography>
              </>
            ) : (
              <>
                <CloudDoneIcon fontSize="small" />
                <Typography variant="caption">
                  Saved {lastSyncTime && `at ${lastSyncTime.toLocaleTimeString()}`}
                </Typography>
              </>
            )}
          </Box>
        )}
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

              {/* Fitness Activity Logging */}
              <Box sx={{ mb: 4 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FitnessCenterIcon color="primary" />
                    Log Wellness Activity
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => {
                      setActivityType('wellness');
                      setActivityDialogOpen(true);
                    }}
                  >
                    Log Activity
                  </Button>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Track your fitness activities, workouts, and wellness practices. Each activity boosts your Mental aura.
                </Typography>
              </Box>

              {/* Product Recommendations */}
              <Box sx={{ mb: 4 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Typography variant="h6" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <ShoppingCartIcon color="primary" />
                    Wellness Products & Quiz
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    href="/products"
                    endIcon={<OpenInNewIcon />}
                  >
                    Browse Products & Take Quiz
                  </Button>
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Take our wellness quiz to get personalized product recommendations based on your body systems.
                </Typography>
              {/* Educational Resources */}
              <Box sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <VideoLibraryIcon color="primary" />
                  Educational Resources
                </Typography>
              </Box>
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
              </Stack>

              {/* Rider Statistics */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Rider Statistics
                </Typography>
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
                        Cycling for Health: Body Fluid Circulation
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        Cycling is more than exercise - it's a practice that circulates your body's fluids (lymphatic, blood, digestive systems), promoting detoxification, cardiovascular health, and overall wellness.
                      </Typography>
                    </Box>
                  </Stack>
                  <Button
                    variant="contained"
                    sx={{ mt: 2, bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' } }}
                    onClick={() => {
                      setActivityType('cycling');
                      setActivityDialogOpen(true);
                    }}
                  >
                    Log Cycling Session
                  </Button>
                </Paper>
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

        {/* Consciousness Journey Section */}
        <Box sx={{ mb: 4 }}>
          <Card>
            <CardContent>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SelfImprovementIcon color="primary" />
                  Consciousness Journey
                </Typography>
              </Stack>

              {/* Learning Path Overview */}
              <Paper
                elevation={2}
                sx={{
                  p: 3,
                  mb: 4,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                }}
              >
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                  Expand Your Consciousness Through Learning
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, mb: 2 }}>
                  Track your spiritual growth journey through curated video content. Watch videos on meditation, philosophy, spiritual practices, and consciousness exploration. Each video you complete boosts your Spiritual aura.
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  📚 Videos watched contribute to your learning path milestones
                </Typography>
              </Paper>

              {/* Featured YouTube Videos */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Featured Content
                </Typography>
                <Grid container spacing={2}>
                  {[
                    { title: 'Introduction to Consciousness', duration: '15:00', category: 'Philosophy' },
                    { title: 'Meditation for Beginners', duration: '20:00', category: 'Practice' },
                    { title: 'Understanding Spiritual Growth', duration: '18:00', category: 'Growth' },
                    { title: 'Daily Mindfulness Practices', duration: '12:00', category: 'Practice' },
                  ].map((video, index) => (
                    <Grid item xs={12} sm={6} md={3} key={index}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                            {video.title}
                          </Typography>
                          <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                            <Chip label={video.category} size="small" color="primary" />
                            <Chip label={video.duration} size="small" variant="outlined" />
                          </Stack>
                          <Button
                            variant="contained"
                            size="small"
                            fullWidth
                            onClick={() => handleLogActivity(
                              'consciousness',
                              video.title,
                              { duration: video.duration, category: video.category },
                              'Spiritual',
                              5
                            )}
                          >
                            Mark as Watched
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>

              {/* YouTube Channel Link */}
              <Box sx={{ pt: 3, borderTop: 1, borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <VideoLibraryIcon color="primary" />
                  Full Video Library
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
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Box>
    </AppShell>

      {/* Snackbar for notifications */}

      {/* Activity Logging Dialog */}
      <Dialog
        open={activityDialogOpen}
        onClose={() => setActivityDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {activityType === 'wellness' && 'Log Wellness Activity'}
          {activityType === 'cycling' && 'Log Cycling Session'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              label="Activity Name"
              fullWidth
              value={activityForm.name}
              onChange={(e) => setActivityForm({...activityForm, name: e.target.value})}
              sx={{ mb: 2 }}
              placeholder={activityType === 'cycling' ? 'e.g., Morning Ride' : 'e.g., Yoga Session'}
            />
            
            {activityType === 'cycling' && (
              <>
                <TextField
                  label="Duration (minutes)"
                  type="number"
                  fullWidth
                  value={activityForm.duration}
                  onChange={(e) => setActivityForm({...activityForm, duration: e.target.value})}
                  sx={{ mb: 2 }}
                />
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Intensity</InputLabel>
                  <Select
                    value={activityForm.intensity}
                    label="Intensity"
                    onChange={(e) => setActivityForm({...activityForm, intensity: e.target.value})}
                  >
                    <MenuItem value="Easy">Easy</MenuItem>
                    <MenuItem value="Moderate">Moderate</MenuItem>
                    <MenuItem value="Hard">Hard</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
            
            {activityType === 'wellness' && (
              <TextField
                label="Duration (minutes)"
                type="number"
                fullWidth
                value={activityForm.duration}
                onChange={(e) => setActivityForm({...activityForm, duration: e.target.value})}
                sx={{ mb: 2 }}
              />
            )}
            
            <TextField
              label="Notes (optional)"
              fullWidth
              multiline
              rows={3}
              value={activityForm.notes}
              onChange={(e) => setActivityForm({...activityForm, notes: e.target.value})}
              placeholder="How did you feel? Any observations?"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActivityDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => {
              const auraBoost = activityType === 'cycling'
                ? (activityForm.intensity === 'Hard' ? 10 : activityForm.intensity === 'Moderate' ? 7 : 5)
                : 5;
              const auraType = activityType === 'cycling' ? 'Physical' : 'Mental';
              
              handleLogActivity(
                activityType,
                activityForm.name,
                { duration: activityForm.duration, intensity: activityForm.intensity, notes: activityForm.notes },
                auraType,
                auraBoost
              );
              
              setActivityDialogOpen(false);
              setActivityForm({ name: '', duration: '', intensity: '', notes: '' });
            }}
            disabled={!activityForm.name}
          >
            Log Activity
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({...snackbar, open: false})}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({...snackbar, open: false})} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

export default RiseDashboard;

