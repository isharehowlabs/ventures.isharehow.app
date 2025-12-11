import { useState, useEffect, useCallback } from 'react';
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
  Snackbar,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  MenuBook as JournalIcon,
  EmojiEvents as SkillsIcon,
  FitnessCenter as WellnessIcon,
  Spa as SpiritualIcon,
  SelfImprovement as JourneyIcon,
} from '@mui/icons-material';
import AppShell from '../components/AppShell';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import MentalSpiritualJournal from '../components/spiritual/MentalSpiritualJournal';
import ActivityCard from '../components/wellness/ActivityCard';
import GoalCard from '../components/wellness/GoalCard';
import AchievementCard from '../components/wellness/AchievementCard';
import GoalDialog from '../components/wellness/GoalDialog';
import WellnessDataPage from '../components/wellness/WellnessDataPage';
import IntervalsSettings from '../components/wellness/IntervalsSettings';
import SpiritualFestivals from '../components/spiritual/SpiritualFestivals';
import RiseJourney from '../components/rise/RiseJourney';
import { useAuth } from '../hooks/useAuth';
import {
  fetchAuras,
  updateAuras,
  fetchActivities,
  fetchGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  fetchAchievements,
  debounce,
  type Aura,
  type Activity,
  type Goal,
  type Achievement,
} from '../components/wellness/api';

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

export default function RiseDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated } = useAuth();
  
  // Tab state
  const [currentTab, setCurrentTab] = useState(0);
  
  // Aura/Stats state
  const [stats, setStats] = useState<Record<string, number>>({
    Physical: 50,
    Mental: 50,
    Spiritual: 50,
    Nutrition: 50,
    Sleep: 50,
    Stress: 50,
    Energy: 50,
  });
  
  // Data state
  const [activities, setActivities] = useState<Activity[]>([]);
  const [focusSessions, setFocusSessions] = useState<Activity[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  
  // UI state
  const [goalDialogOpen, setGoalDialogOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });

  // Load auras from backend
  useEffect(() => {
    if (isAuthenticated) {
      fetchAuras()
        .then((auras) => {
          const auraMap: Record<string, number> = {};
          auras.forEach((aura: Aura) => {
            auraMap[aura.auraType] = aura.value;
          });
          setStats((prev) => ({ ...prev, ...auraMap }));
        })
        .catch((err) => console.error('Failed to fetch auras:', err));
    }
  }, [isAuthenticated]);

  // Load activities
  useEffect(() => {
    if (isAuthenticated) {
      fetchActivities()
        .then((acts) => {
          setActivities(acts.slice(0, 10));
          const focusActs = acts.filter((a: Activity) => a.activityType === 'focus');
          setFocusSessions(focusActs.slice(0, 10));
        })
        .catch((err) => console.error('Failed to fetch activities:', err));
    }
  }, [isAuthenticated]);

  // Load goals
  useEffect(() => {
    if (isAuthenticated) {
      fetchGoals()
        .then(setGoals)
        .catch((err) => console.error('Failed to fetch goals:', err));
    }
  }, [isAuthenticated]);

  // Load achievements
  useEffect(() => {
    if (isAuthenticated) {
      fetchAchievements()
        .then(setAchievements)
        .catch((err) => console.error('Failed to fetch achievements:', err));
    }
  }, [isAuthenticated]);

  // Debounced aura update
  const debouncedUpdateAuras = useCallback(
    debounce((auraUpdates: Aura[]) => {
      if (isAuthenticated) {
        updateAuras(auraUpdates).catch((err) => console.error('Failed to update auras:', err));
      }
    }, 1000),
    [isAuthenticated]
  );
  const handleGoalSave = async (goalData: Partial<Goal>) => {
    try {
      if (goalData.id) {
        const updated = await updateGoal(goalData.id, goalData);
        setGoals((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
        showSnackbar("Goal updated successfully", "success");
      } else {
        const created = await createGoal({
          title: goalData.title!,
          description: goalData.description || "",
          category: goalData.category || "Fitness",
          targetValue: goalData.targetValue || 10,
          deadline: goalData.deadline,
        });
        setGoals((prev) => [created, ...prev]);
        showSnackbar("Goal created successfully", "success");
      }
    } catch (error) {
      showSnackbar("Failed to save goal", "error");
    }
  };

  const handleGoalDelete = async (goalId: string) => {
    try {
      await deleteGoal(goalId);
      setGoals((prev) => prev.filter((g) => g.id !== goalId));
      showSnackbar('Goal deleted', 'info');
    } catch (error) {
      showSnackbar('Failed to delete goal', 'error');
    }
  };

  const handleGoalProgressUpdate = async (goalId: string, newProgress: number) => {
    try {
      const updated = await updateGoal(goalId, { currentProgress: newProgress });
      setGoals((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
      showSnackbar('Progress updated', 'success');
    } catch (error) {
      showSnackbar('Failed to update progress', 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const overallLevel = Math.floor(Object.values(stats).reduce((sum, val) => sum + val, 0) / Object.keys(stats).length);

  return (
    <ProtectedRoute>
    <AppShell active="rise">
      <Container maxWidth="xl" sx={{ mt: 4, mb: 8 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            RISE Dashboard
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Overall Level: {overallLevel}
          </Typography>
        </Box>

        {/* Tabs */}
        <Paper 
          sx={{ 
            mb: 3,
            boxShadow: isMobile ? 2 : 1,
          }}
        >
          <Tabs
            value={currentTab}
            onChange={handleTabChange}
            variant={isMobile ? 'scrollable' : 'fullWidth'}
            scrollButtons="auto"
            sx={{
              '& .MuiTabs-indicator': {
                height: isMobile ? 4 : 2,
                backgroundColor: 'primary.main',
              },
              '& .MuiTab-root': {
                minHeight: isMobile ? 72 : 64,
                fontSize: isMobile ? '0.875rem' : '0.875rem',
                fontWeight: 600,
                textTransform: 'none',
                color: 'text.secondary',
                padding: isMobile ? '12px 16px' : '12px 16px',
                '&.Mui-selected': {
                  color: 'primary.main',
                  fontWeight: 700,
                },
                '& .MuiTab-iconWrapper': {
                  fontSize: isMobile ? '1.75rem' : '1.5rem',
                  marginBottom: isMobile ? '8px' : '4px',
                },
              },
            }}
          >
            <Tab icon={<DashboardIcon />} label="Overview" />
            <Tab icon={<JournalIcon />} label="Mental Spiritual Journal" />
            <Tab icon={<SkillsIcon />} label="Goals & Achievements" />
            <Tab icon={<WellnessIcon />} label="Wellness" />
            <Tab icon={<SpiritualIcon />} label="Festivals" />
            <Tab icon={<JourneyIcon />} label="Rise Journey" />
          </Tabs>
        </Paper>

        {/* Tab 1: Overview */}
        <TabPanel value={currentTab} index={0}>
          <Grid container spacing={3}>
            {/* Quick Stats */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Focus Time</Typography>
                  <Typography variant="h4">{focusSessions.length}</Typography>
                  <Typography variant="body2" color="text.secondary">Sessions completed</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Active Goals</Typography>
                  <Typography variant="h4">{goals.length}</Typography>
                  <Typography variant="body2" color="text.secondary">In progress</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>Achievements</Typography>
                  <Typography variant="h4">{achievements.length}</Typography>
                  <Typography variant="body2" color="text.secondary">Unlocked</Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Core Attributes */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>Core Attributes</Typography>
                <Grid container spacing={2}>
                  {Object.entries(stats).map(([key, value]) => (
                    <Grid item xs={6} md={3} key={key}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="body2" color="text.secondary">{key}</Typography>
                          <Typography variant="h5">{value}</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            </Grid>

            {/* Recent Activities */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>Recent Activities</Typography>
                {activities.length === 0 ? (
                  <Typography color="text.secondary">No activities yet. Start tracking your progress!</Typography>
                ) : (
                  activities.slice(0, 5).map((activity) => (
                    <ActivityCard key={activity.id} activity={activity} />
                  ))
                )}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 2: Mental Spiritual Journal */}
        <TabPanel value={currentTab} index={1}>
          <MentalSpiritualJournal />
        </TabPanel>

        {/* Tab 3: Goals & Achievements */}
        <TabPanel value={currentTab} index={2}>
          <Grid container spacing={3}>
            {/* Goals Section */}
            <Grid item xs={12} lg={7}>
              <Paper sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h5" gutterBottom>
                    Your Goals
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => {
                      setEditingGoal(null);
                      setGoalDialogOpen(true);
                    }}
                  >
                    Add New Goal
                  </Button>
                </Box>
                
                {goals.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">
                      No goals yet. Create your first goal to start tracking progress!
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {goals.map((goal) => (
                      <Grid item xs={12} key={goal.id}>
                        <GoalCard
                          goal={goal}
                          onEdit={(g) => {
                            setEditingGoal(g);
                            setGoalDialogOpen(true);
                          }}
                          onDelete={handleGoalDelete}
                          onUpdateProgress={handleGoalProgressUpdate}
                        />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Paper>
            </Grid>

            {/* Achievements Section */}
            <Grid item xs={12} lg={5}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                  Achievements
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Unlock achievements as you progress on your goals and journey.
                </Typography>
                {achievements.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography color="text.secondary">
                      No achievements unlocked yet. Keep working on your goals!
                    </Typography>
                  </Box>
                ) : (
                  <Grid container spacing={2}>
                    {achievements.map((achievement) => (
                      <Grid item xs={12} key={achievement.id}>
                        <AchievementCard achievement={achievement} />
                      </Grid>
                    ))}
                  </Grid>
                )}
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>


        {/* Tab 4: Wellness & Cycling */}
        <TabPanel value={currentTab} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <IntervalsSettings />
            </Grid>
            <Grid item xs={12}>
              <WellnessDataPage />
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 5: Spiritual Festivals */}
        <TabPanel value={currentTab} index={4}>
          <SpiritualFestivals />
        </TabPanel>

        {/* Tab 6: Rise Journey */}
        <TabPanel value={currentTab} index={5}>
          <RiseJourney />
        </TabPanel>

        {/* Goal Dialog */}
        <GoalDialog
          open={goalDialogOpen}
          onClose={() => {
            setGoalDialogOpen(false);
            setEditingGoal(null);
          }}
          onSave={handleGoalSave}
          goal={editingGoal}
        />

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </AppShell>
    </ProtectedRoute>
  );
}
