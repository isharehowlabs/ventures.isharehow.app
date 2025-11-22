import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Lock as LockedIcon,
  PlayArrow as InProgressIcon,
  CheckCircle as CompletedIcon,
  Timer as TimerIcon,
} from '@mui/icons-material';
import { getBackendUrl, fetchWithErrorHandling } from '../../utils/backendUrl';
import { trackModuleCompleted } from '../../utils/analytics';

interface WellnessModule {
  id: string;
  title: string;
  description: string;
  duration: number;
  category: 'mental' | 'physical' | 'spiritual';
  prerequisites: string[];
  progress?: {
    state: 'locked' | 'in-progress' | 'completed';
    startedAt?: string;
    completedAt?: string;
  };
}

export default function ModuleCatalog() {
  const [modules, setModules] = useState<WellnessModule[]>([]);
  const [loading, setLoading] = useState(true);
  const [activationOpen, setActivationOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<WellnessModule | null>(null);
  const [activationKey, setActivationKey] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    try {
      setLoading(true);
      const backendUrl = getBackendUrl();
      const response = await fetchWithErrorHandling(`${backendUrl}/api/wellness/modules`, {
        method: 'GET',
      });

      if (response.ok) {
        const data = await response.json();
        setModules(data.modules || []);
      }
    } catch (err: any) {
      console.error('Error fetching modules:', err);
      // Use sample data if API not available
      setModules([
        {
          id: '1',
          title: 'Mental Reset',
          description: 'Clear your mind and reduce stress through guided meditation and mindfulness practices',
          duration: 30,
          category: 'mental',
          prerequisites: [],
          progress: { state: 'locked' },
        },
        {
          id: '2',
          title: 'Physical Momentum',
          description: 'Build strength and endurance with targeted exercises and movement routines',
          duration: 45,
          category: 'physical',
          prerequisites: [],
          progress: { state: 'locked' },
        },
        {
          id: '3',
          title: 'Spiritual Clarity',
          description: 'Connect with your inner self through contemplation and spiritual practices',
          duration: 40,
          category: 'spiritual',
          prerequisites: [],
          progress: { state: 'locked' },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async () => {
    if (!selectedModule || !activationKey.trim()) return;

    try {
      setError(null);
      const backendUrl = getBackendUrl();
      const response = await fetchWithErrorHandling(`${backendUrl}/api/wellness/activate`, {
        method: 'POST',
        body: JSON.stringify({
          moduleId: selectedModule.id,
          activationKey: activationKey,
        }),
      });

      if (response.ok) {
        // Track module completion
        if (selectedModule.progress?.state === 'in-progress') {
          trackModuleCompleted(selectedModule.id, selectedModule.category);
        }
        
        await fetchModules();
        setActivationOpen(false);
        setActivationKey('');
        setSelectedModule(null);
      } else {
        const data = await response.json();
        setError(data.error || 'Invalid activation key');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to activate module');
    }
  };

  const getStatusIcon = (state: string) => {
    switch (state) {
      case 'completed':
        return <CompletedIcon color="success" />;
      case 'in-progress':
        return <InProgressIcon color="warning" />;
      default:
        return <LockedIcon color="disabled" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'mental':
        return 'info';
      case 'physical':
        return 'success';
      case 'spiritual':
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Growth Modules
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Complete modules to track your mental, physical, and spiritual progress
      </Typography>

      <Grid container spacing={3}>
        {modules.map((module) => (
          <Grid item xs={12} md={6} lg={4} key={module.id}>
            <Card elevation={2}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ mr: 1 }}>
                    {getStatusIcon(module.progress?.state || 'locked')}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="div">
                      {module.title}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                      <Chip
                        label={module.category}
                        size="small"
                        color={getCategoryColor(module.category) as any}
                      />
                      <Chip
                        icon={<TimerIcon />}
                        label={`${module.duration} min`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary">
                  {module.description}
                </Typography>

                {module.progress?.state === 'completed' && module.progress.completedAt && (
                  <Alert severity="success" sx={{ mt: 2 }}>
                    Completed on {new Date(module.progress.completedAt).toLocaleDateString()}
                  </Alert>
                )}
              </CardContent>

              <CardActions>
                {module.progress?.state === 'locked' && (
                  <Button
                    size="small"
                    onClick={() => {
                      setSelectedModule(module);
                      setActivationOpen(true);
                    }}
                  >
                    Start Module
                  </Button>
                )}
                {module.progress?.state === 'in-progress' && (
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => {
                      setSelectedModule(module);
                      setActivationOpen(true);
                    }}
                  >
                    Complete Module
                  </Button>
                )}
                <Button size="small">Learn More</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Activation Key Dialog */}
      <Dialog open={activationOpen} onClose={() => setActivationOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedModule?.progress?.state === 'locked' ? 'Start Module' : 'Complete Module'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Typography variant="body2" color="text.secondary" paragraph>
            Enter the activation key provided in your module materials to{' '}
            {selectedModule?.progress?.state === 'locked' ? 'unlock' : 'complete'} this module.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label="Activation Key"
            variant="outlined"
            value={activationKey}
            onChange={(e) => setActivationKey(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleActivate();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActivationOpen(false)}>Cancel</Button>
          <Button
            onClick={handleActivate}
            variant="contained"
            disabled={!activationKey.trim()}
          >
            Activate
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
