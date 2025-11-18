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
              <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                / {stat.max}
              </Typography>
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
      </Box>
    </AppShell>
  );
}

export default RiseDashboard;

