import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tabs,
  Tab,
  Box,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Card,
  CardContent,
  useTheme,
  alpha,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  HourglassEmpty as InProgressIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Person as PersonIcon,
  Timeline as TimelineIcon,
  SupportAgent as SupportIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { Venture, VentureStatus } from '../../../types/venture';
import { getBackendUrl } from '../../../utils/backendUrl';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`venture-tabpanel-${index}`}
      aria-labelledby={`venture-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

interface VentureDetailsDialogProps {
  open: boolean;
  venture: Venture | null;
  onClose: () => void;
}

interface DatabaseTask {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignedTo?: string;
  assignedToName?: string;
  priority?: 'low' | 'medium' | 'high';
  createdAt?: string;
  updatedAt?: string;
}

interface ClientEmployee {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  assignedAt?: string;
}

const VentureDetailsDialog: React.FC<VentureDetailsDialogProps> = ({ open, venture, onClose }) => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [clientTasks, setClientTasks] = useState<DatabaseTask[]>([]);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [clientEmployees, setClientEmployees] = useState<ClientEmployee[]>([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [clientData, setClientData] = useState<{ budget?: number; deadline?: string } | null>(null);
  const backendUrl = getBackendUrl();

  const fetchClientTasks = useCallback(async () => {
    if (!venture?.clientId) return;
    
    setTasksLoading(true);
    try {
      // Convert clientId to string (it may be number or string)
      const clientIdStr = String(venture.clientId);
      const response = await fetch(`${backendUrl}/api/tasks?client_id=${clientIdStr}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setClientTasks(data.tasks || []);
      } else {
        setClientTasks([]);
      }
    } catch (err) {
      console.error('Error fetching client tasks:', err);
      setClientTasks([]);
    } finally {
      setTasksLoading(false);
    }
  }, [venture?.clientId, backendUrl]);

  const fetchClientEmployees = useCallback(async () => {
    if (!venture?.clientId) return;
    
    setEmployeesLoading(true);
    try {
      // Convert clientId to string (it may be number or string)
      const clientIdStr = String(venture.clientId);
      const response = await fetch(`${backendUrl}/api/creative/clients/${clientIdStr}/employees`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setClientEmployees(data.employees || []);
      } else {
        setClientEmployees([]);
      }
    } catch (err) {
      console.error('Error fetching client employees:', err);
      setClientEmployees([]);
    } finally {
      setEmployeesLoading(false);
    }
  }, [venture?.clientId, backendUrl]);

  const fetchClientData = useCallback(async () => {
    if (!venture?.clientId) return;
    
    try {
      // Convert clientId to string (it may be number or string)
      const clientIdStr = String(venture.clientId);
      const response = await fetch(`${backendUrl}/api/creative/clients/${clientIdStr}`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setClientData({
          budget: data.budget || 0,
          deadline: data.deadline || null,
        });
      }
    } catch (err) {
      console.error('Error fetching client data:', err);
    }
  }, [venture?.clientId, backendUrl]);

  // Fetch tasks, employees, and client data when dialog opens
  useEffect(() => {
    if (open && venture?.clientId) {
      fetchClientTasks();
      fetchClientEmployees();
      fetchClientData();
    } else {
      setClientTasks([]);
      setClientEmployees([]);
      setClientData(null);
    }
  }, [open, venture?.clientId, fetchClientTasks, fetchClientEmployees, fetchClientData]);

  // Convert database task status to VentureTask status
  const convertTaskStatus = (status: string): 'todo' | 'in_progress' | 'completed' => {
    if (status === 'completed') return 'completed';
    if (status === 'in-progress') return 'in_progress';
    return 'todo';
  };

  // Convert database task priority to VentureTask priority
  const convertTaskPriority = (priority?: string): 'low' | 'medium' | 'high' => {
    if (priority === 'high') return 'high';
    if (priority === 'medium') return 'medium';
    return 'low';
  };

  // Merge venture.tasks (static) with clientTasks (from database)
  // Use a Map to avoid duplicates based on task ID
  const taskMap = new Map<string, any>();
  
  // First add database tasks (these are the source of truth for client tasks)
  clientTasks.forEach(task => {
    const taskId = task.id;
    // Try to parse as number for compatibility, but keep string if it fails
    const numericId = parseInt(task.id) || task.id;
    taskMap.set(taskId, {
      id: numericId,
      title: task.title,
      description: task.description,
      status: convertTaskStatus(task.status),
      assignedTo: task.assignedTo ? parseInt(task.assignedTo) : undefined,
      priority: convertTaskPriority(task.priority),
      dueDate: task.updatedAt,
    });
  });
  
  // Then add venture.tasks that aren't already in the map (by comparing IDs)
  venture.tasks.forEach(task => {
    const taskId = String(task.id);
    // Check if we already have this task from database
    const exists = Array.from(taskMap.keys()).some(key => 
      String(key) === taskId || String(task.id) === taskId
    );
    if (!exists) {
      taskMap.set(taskId, {
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        assignedTo: task.assignedTo,
        priority: task.priority,
        dueDate: task.dueDate,
      });
    }
  });
  
  const allTasks = Array.from(taskMap.values());

  if (!venture) return null;

  const getStatusColor = (status: VentureStatus): string => {
    switch (status) {
      case VentureStatus.ACTIVE:
        return theme.palette.primary.main;
      case VentureStatus.COMPLETED:
        return theme.palette.success.main;
      case VentureStatus.ON_HOLD:
        return theme.palette.warning.main;
      case VentureStatus.PLANNING:
        return theme.palette.info.main;
      case VentureStatus.CANCELLED:
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getTaskIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'in_progress':
        return <InProgressIcon color="primary" />;
      default:
        return <UncheckedIcon color="disabled" />;
    }
  };

  const getPriorityColor = (priority: string): 'error' | 'warning' | 'default' => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Use client budget and deadline if available, otherwise use venture data
  const effectiveBudget = clientData?.budget || venture.budget;
  const effectiveDeadline = clientData?.deadline || venture.deadline;
  const budgetUsage = effectiveBudget > 0 ? (venture.spent / effectiveBudget) * 100 : 0;
  const daysUntilDeadline = effectiveDeadline 
    ? Math.ceil((new Date(effectiveDeadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : venture.deadline 
      ? Math.ceil((new Date(venture.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box>
          <Typography variant="h5" component="div" gutterBottom>
            {venture.name}
          </Typography>
          <Chip
            label={venture.status.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            sx={{
              bgcolor: alpha(getStatusColor(venture.status), 0.1),
              color: getStatusColor(venture.status),
              fontWeight: 600,
            }}
            size="small"
          />
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab label="Overview" />
          <Tab label={`Tasks (${allTasks.length})`} />
          <Tab label={`Team (${clientEmployees.length > 0 ? clientEmployees.length : venture.team.length})`} />
          <Tab label="Timeline & Analytics" />
          {venture.supportRequest && <Tab label="Support Request" />}
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="body1" color="text.secondary" paragraph>
                {venture.description}
              </Typography>
            </Grid>

            {venture.clientName && (
              <Grid item xs={12}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Client
                    </Typography>
                    <Typography variant="h6">{venture.clientName}</Typography>
                  </CardContent>
                </Card>
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CalendarIcon color="action" />
                    <Typography variant="subtitle2" color="text.secondary">
                      Timeline
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    Start: {new Date(venture.startDate).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2">
                    Deadline: {effectiveDeadline ? new Date(effectiveDeadline).toLocaleDateString() : venture.deadline ? new Date(venture.deadline).toLocaleDateString() : 'Not set'}
                  </Typography>
                  {effectiveDeadline && (
                    <Typography
                      variant="body2"
                      color={daysUntilDeadline < 7 ? 'error' : daysUntilDeadline < 30 ? 'warning.main' : 'success.main'}
                      sx={{ mt: 1, fontWeight: 600 }}
                    >
                      {daysUntilDeadline > 0 ? `${daysUntilDeadline} days remaining` : 'Overdue'}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <MoneyIcon color="action" />
                    <Typography variant="subtitle2" color="text.secondary">
                      Budget
                    </Typography>
                  </Box>
                  <Typography variant="h6">
                    ${effectiveBudget.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Spent: ${venture.spent.toLocaleString()} ({budgetUsage.toFixed(1)}%)
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(budgetUsage, 100)}
                    color={budgetUsage > 100 ? 'error' : budgetUsage > 80 ? 'warning' : 'success'}
                    sx={{ mt: 1, height: 6, borderRadius: 3 }}
                  />
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Progress
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={venture.progress}
                      sx={{
                        flex: 1,
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      }}
                    />
                    <Typography variant="h6" sx={{ minWidth: 60, textAlign: 'right' }}>
                      {venture.progress}%
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Tags
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {venture.tags.map((tag, index) => (
                  <Chip key={index} label={tag} size="small" />
                ))}
              </Box>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {tasksLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : allTasks.length === 0 ? (
            <Typography color="text.secondary" align="center">
              No tasks yet
            </Typography>
          ) : (
            <List>
              {allTasks.map((task, index) => {
                const assignedTeamMember = task.assignedTo 
                  ? venture.team.find(m => m.id === task.assignedTo)
                  : null;
                // Find the database task to get assignedToName
                const dbTask = clientTasks.find(t => 
                  String(t.id) === String(task.id) || t.id === task.id
                );
                const assignedName = assignedTeamMember?.name || 
                  dbTask?.assignedToName || 
                  'Unassigned';
                
                return (
                  <React.Fragment key={task.id}>
                    {index > 0 && <Divider />}
                    <ListItem alignItems="flex-start">
                      <ListItemAvatar>{getTaskIcon(task.status)}</ListItemAvatar>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="body1">{task.title}</Typography>
                            <Chip label={task.priority} size="small" color={getPriorityColor(task.priority)} />
                            <Chip 
                              label={task.status === 'completed' ? 'Completed' : task.status === 'in_progress' ? 'In Progress' : 'To Do'} 
                              size="small" 
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <>
                            {task.description && (
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {task.description}
                              </Typography>
                            )}
                            <Box sx={{ mt: 0.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                              <Typography variant="caption" color="text.secondary">
                                Assigned to: {assignedName}
                              </Typography>
                              {task.dueDate && (
                                <Typography variant="caption" color="text.secondary">
                                  • Updated: {new Date(task.dueDate).toLocaleDateString()}
                                </Typography>
                              )}
                            </Box>
                          </>
                        }
                      />
                    </ListItem>
                  </React.Fragment>
                );
              })}
            </List>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {employeesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {(clientEmployees.length > 0 ? clientEmployees : venture.team).map((member, index) => {
                // Type guard to check if member has assignedAt (ClientEmployee)
                const hasAssignedAt = 'assignedAt' in member && member.assignedAt;
                return (
                  <React.Fragment key={member.id || index}>
                    {index > 0 && <Divider />}
                    <ListItem>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                          {member.avatar ? <img src={member.avatar} alt={member.name} /> : member.name.charAt(0)}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={member.name}
                        secondary={
                          <>
                            <Typography variant="body2" color="text.secondary">
                              {member.role}
                            </Typography>
                            {member.email && (
                              <Typography variant="caption" color="text.secondary">
                                {member.email}
                              </Typography>
                            )}
                            {hasAssignedAt && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                Assigned: {new Date((member as ClientEmployee).assignedAt!).toLocaleDateString()}
                              </Typography>
                            )}
                          </>
                        }
                      />
                    </ListItem>
                  </React.Fragment>
                );
              })}
              {clientEmployees.length === 0 && venture.team.length === 0 && (
                <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
                  No team members assigned
                </Typography>
              )}
            </List>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          {/* Timeline & Analytics */}
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TimelineIcon /> Progress Timeline
                  </Typography>
                  <Box sx={{ mt: 2, mb: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={venture.progress}
                      sx={{
                        height: 12,
                        borderRadius: 6,
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                      {venture.progress}% Complete
                    </Typography>
                  </Box>
                  
                  {/* Timeline visualization */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Project Timeline
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Start Date
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {new Date(venture.startDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1, textAlign: 'center' }}>
                        <Typography variant="caption" color="text.secondary">
                          Current
                        </Typography>
                        <Typography variant="body2" fontWeight={500}>
                          {new Date().toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box sx={{ flex: 1, textAlign: 'right' }}>
                        <Typography variant="caption" color="text.secondary">
                          Deadline
                        </Typography>
                        <Typography 
                          variant="body2" 
                          fontWeight={500}
                          color={daysUntilDeadline < 7 ? 'error' : daysUntilDeadline < 30 ? 'warning.main' : 'success.main'}
                        >
                          {effectiveDeadline ? new Date(effectiveDeadline).toLocaleDateString() : venture.deadline ? new Date(venture.deadline).toLocaleDateString() : 'Not set'}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Task Completion
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {allTasks.filter(t => t.status === 'completed').length} / {allTasks.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Tasks completed
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Budget Usage
                  </Typography>
                  <Typography variant="h4" fontWeight={700}>
                    {budgetUsage.toFixed(1)}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ${venture.spent.toLocaleString()} / ${effectiveBudget.toLocaleString()}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Team Activity
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {venture.team.length} team member{venture.team.length !== 1 ? 's' : ''} assigned
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                    {venture.team.map((member) => (
                      <Chip
                        key={member.id}
                        label={member.name}
                        size="small"
                        avatar={<Avatar>{member.name.charAt(0)}</Avatar>}
                      />
                    ))}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {venture.supportRequest && (
          <TabPanel value={tabValue} index={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <SupportIcon /> Support Request Details
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Subject
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {venture.supportRequest.subject}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Description
                    </Typography>
                    <Typography variant="body2">
                      {venture.supportRequest.description}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={venture.supportRequest.status}
                      size="small"
                      color={venture.supportRequest.status === 'resolved' ? 'success' : 'primary'}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Priority
                    </Typography>
                    <Chip
                      label={venture.supportRequest.priority}
                      size="small"
                      color={venture.supportRequest.priority === 'high' ? 'error' : venture.supportRequest.priority === 'medium' ? 'warning' : 'default'}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Created
                    </Typography>
                    <Typography variant="body2">
                      {new Date(venture.supportRequest.createdAt).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Last Updated
                    </Typography>
                    <Typography variant="body2">
                      {new Date(venture.supportRequest.updatedAt).toLocaleDateString()}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </TabPanel>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default VentureDetailsDialog;
