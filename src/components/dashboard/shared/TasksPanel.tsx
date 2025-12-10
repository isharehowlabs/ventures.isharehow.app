'use client';

import React, { useState, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Button,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  ToggleButtonGroup,
  ToggleButton,
  Checkbox,
  Autocomplete,
  Snackbar,
  Stack,
  Grid,
  Avatar,
  Divider,
  useTheme,
  alpha,
  LinearProgress,
  Badge,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as PendingIcon,
  PlayCircle as InProgressIcon,
  Link as LinkIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  PersonOutline as PersonOutlineIcon,
  Task as TaskIcon,
  Assignment as AssignmentIcon,
  Today as TodayIcon,
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  DragIndicator as DragIndicatorIcon,
} from '@mui/icons-material';
import { useTasks, Task } from '../../../hooks/useTasks';
import { useWorkspaceUsers } from '../../../hooks/useWorkspaceUsers';
import { trackTaskCompleted } from '../../../utils/analytics';
import { useAuth } from '../../../hooks/useAuth';
import { getBackendUrl } from '../../../utils/backendUrl';

interface SupportRequest {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  client?: string;
}

interface TasksPanelProps {
  height?: number | string;
}

interface Employee {
  id: number;
  name: string;
  email: string;
}

interface KanbanColumn {
  id: 'pending' | 'in-progress' | 'completed';
  title: string;
  color: string;
  icon: React.ReactNode;
}

const KANBAN_COLUMNS: KanbanColumn[] = [
  {
    id: 'pending',
    title: 'To Do',
    color: '#9e9e9e',
    icon: <PendingIcon />,
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    color: '#ff9800',
    icon: <InProgressIcon />,
  },
  {
    id: 'completed',
    title: 'Done',
    color: '#4caf50',
    icon: <CheckCircleIcon />,
  },
];

export default function TasksPanel({ height = 500 }: TasksPanelProps) {
  const theme = useTheme();
  const { user } = useAuth();
  const { users: workspaceUsers } = useWorkspaceUsers();
  const { tasks, createTask, updateTask, deleteTask, updateTaskNotes, isLoading: tasksLoading, error: tasksErrorMsg, authRequired, refresh, isStale } = useTasks();
  
  // State
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create');
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskNotes, setTaskNotes] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState<{id: string, name: string} | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'info' | 'warning' | 'error'>('info');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const notesTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const [taskHyperlinks, setTaskHyperlinks] = useState('');
  const [taskStatus, setTaskStatus] = useState<'pending' | 'in-progress' | 'completed'>('pending');
  const [taskSupportRequestId, setTaskSupportRequestId] = useState<string>('');
  const [taskFilter, setTaskFilter] = useState<'all' | 'my-tasks' | 'created-by-me'>(
    (typeof window !== 'undefined' && localStorage.getItem('taskFilter')) as any || 'all'
  );
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [loadingSupportRequests, setLoadingSupportRequests] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState<string | null>(null);
  const [taskMenuAnchor, setTaskMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedTaskForMenu, setSelectedTaskForMenu] = useState<Task | null>(null);
  
  // Combine workspace users and employees for assignment options
  const assigneeOptions = React.useMemo(() => {
    const workspaceUserOptions = workspaceUsers.map(u => ({ id: String(u.id), name: u.name || u.email || 'Unknown' }));
    const employeeOptions = employees.map(e => ({ id: String(e.id), name: `${e.name} (${e.email})` }));
    
    // Merge and deduplicate by id
    const allOptions = [...workspaceUserOptions, ...employeeOptions];
    const uniqueOptions = allOptions.filter((option, index, self) => 
      index === self.findIndex(o => o.id === option.id)
    );
    return uniqueOptions;
  }, [workspaceUsers, employees]);
  
  // Fetch employees from database
  React.useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/creative/employees`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setEmployees(data.employees || []);
        }
      } catch (err) {
        console.error('Error fetching employees:', err);
      }
    };
    
    fetchEmployees();
  }, []);

  // Fetch support requests for task linking
  React.useEffect(() => {
    const fetchSupportRequests = async () => {
      if (!user || (!user.isEmployee && !user.isAdmin)) return;
      
      setLoadingSupportRequests(true);
      try {
        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/creative/support-requests`, {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setSupportRequests(data.requests || []);
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Failed to fetch support requests' }));
          console.error('Error fetching support requests:', errorData);
        }
      } catch (err) {
        console.error('Error fetching support requests:', err);
      } finally {
        setLoadingSupportRequests(false);
      }
    };
    
    fetchSupportRequests();
  }, [user]);

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'in-progress': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon color="success" />;
      case 'in-progress':
        return <InProgressIcon color="warning" />;
      default:
        return <PendingIcon color="disabled" />;
    }
  };

  // Handle filter change
  const handleFilterChange = (event: React.MouseEvent<HTMLElement>, newFilter: 'all' | 'my-tasks' | 'created-by-me' | null) => {
    if (newFilter !== null) {
      setTaskFilter(newFilter);
      if (typeof window !== 'undefined') {
        localStorage.setItem('taskFilter', newFilter);
      }
    }
  };

  // Filter tasks based on selected view
  const filteredTasks = tasks.filter(task => {
    if (taskFilter === 'my-tasks') {
      return task.assignedTo === user?.id;
    } else if (taskFilter === 'created-by-me') {
      return task.createdBy === user?.id;
    }
    return true; // 'all'
  });

  // Group tasks by status for kanban columns
  const tasksByStatus = React.useMemo(() => {
    const grouped: Record<string, Task[]> = {
      'pending': [],
      'in-progress': [],
      'completed': [],
    };
    
    filteredTasks.forEach(task => {
      if (grouped[task.status]) {
        grouped[task.status].push(task);
      }
    });
    
    return grouped;
  }, [filteredTasks]);

  // Count tasks for stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const myTasksCount = tasks.filter(t => t.assignedTo === user?.id).length;
  const createdByMeCount = tasks.filter(t => t.createdBy === user?.id).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', task.id);
  };

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDraggedOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDraggedOverColumn(null);
  };

  const handleDrop = async (e: React.DragEvent, targetStatus: 'pending' | 'in-progress' | 'completed') => {
    e.preventDefault();
    setDraggedOverColumn(null);
    
    if (!draggedTask) return;
    
    // Don't update if status hasn't changed
    if (draggedTask.status === targetStatus) {
      setDraggedTask(null);
      return;
    }
    
    try {
      await updateTask(draggedTask.id, { status: targetStatus });
      if (targetStatus === 'completed') {
        trackTaskCompleted(draggedTask.id, (user as any)?.userRole || 'user', 'cowork');
      }
    } catch (err) {
      console.error('Error updating task status:', err);
    } finally {
      setDraggedTask(null);
    }
  };

  const handleTaskToggle = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    const newStatus = task.status === 'completed' ? 'pending' : 'completed';
    try {
      await updateTask(id, { status: newStatus });
      if (newStatus === 'completed') {
        trackTaskCompleted(id, (user as any)?.userRole || 'user', 'cowork');
      }
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  const handleOpenCreateTask = () => {
    setEditMode('create');
    setCurrentTaskId(null);
    setTaskTitle('');
    setTaskDescription('');
    setTaskHyperlinks('');
    setTaskStatus('pending');
    setTaskSupportRequestId('');
    setSelectedAssignee(null);
    setTaskNotes('');
    setTaskDialogOpen(true);
  };

  const handleOpenEditTask = (task: Task) => {
    setEditMode('edit');
    setCurrentTaskId(task.id);
    setTaskTitle(task.title);
    setTaskDescription(task.description || '');
    setTaskHyperlinks(task.hyperlinks.join(', '));
    setTaskStatus(task.status);
    setTaskSupportRequestId(task.supportRequestId || '');
    setTaskNotes(task.notes || '');
    
    // Set assignee if task is assigned
    if (task.assignedTo && task.assignedToName) {
      setSelectedAssignee({ id: task.assignedTo, name: task.assignedToName });
    } else {
      setSelectedAssignee(null);
    }
    
    setTaskDialogOpen(true);
    setTaskMenuAnchor(null);
  };

  const handleTaskMenuOpen = (event: React.MouseEvent<HTMLElement>, task: Task) => {
    event.stopPropagation();
    setTaskMenuAnchor(event.currentTarget);
    setSelectedTaskForMenu(task);
  };

  const handleTaskMenuClose = () => {
    setTaskMenuAnchor(null);
    setSelectedTaskForMenu(null);
  };

  const handleNotesChange = (newNotes: string) => {
    setTaskNotes(newNotes);
    setIsSavingNotes(true);
    
    // Clear existing timeout
    if (notesTimeoutRef.current) {
      clearTimeout(notesTimeoutRef.current);
    }
    
    // Debounce: save 500ms after user stops typing
    notesTimeoutRef.current = setTimeout(() => {
      if (currentTaskId) {
        updateTaskNotes(currentTaskId, newNotes);
        setIsSavingNotes(false);
      }
    }, 500);
  };

  const handleSaveTask = async () => {
    if (!taskTitle.trim()) return;
    
    try {
      const hyperlinksArray = taskHyperlinks.split(',').map(h => h.trim()).filter(h => h);
      
      if (editMode === 'create') {
        const newTask = await createTask(
          taskTitle.trim(), 
          taskDescription.trim(), 
          hyperlinksArray, 
          taskStatus,
          selectedAssignee?.id,
          selectedAssignee?.name,
          taskNotes.trim()
        );
        if (taskSupportRequestId && newTask?.id) {
          await updateTask(newTask.id, { supportRequestId: taskSupportRequestId });
        }
      } else if (currentTaskId) {
        await updateTask(currentTaskId, {
          title: taskTitle.trim(),
          description: taskDescription.trim(),
          hyperlinks: hyperlinksArray,
          status: taskStatus,
          supportRequestId: taskSupportRequestId || undefined,
          assignedTo: selectedAssignee?.id || undefined,
          assignedToName: selectedAssignee?.name || undefined,
        });
        
        if (taskStatus === 'completed') {
          trackTaskCompleted(currentTaskId, (user as any)?.userRole || 'user', 'cowork');
        }
      }
      
      setTaskDialogOpen(false);
    } catch (err) {
      console.error('Error saving task:', err);
    }
  };

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id);
      handleTaskMenuClose();
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleCloseToast = () => {
    setToastOpen(false);
  };

  return (
    <>
      <Box sx={{ height, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Header Section */}
        <Box>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight={800} gutterBottom>
                Kanban Board
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Drag and drop tasks to update their status
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateTask}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 600,
                px: 3,
              }}
            >
              Add Task
            </Button>
          </Stack>

          {/* Stats Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={3}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar sx={{ bgcolor: 'primary.main', width: 40, height: 40 }}>
                    <TaskIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={700}>
                      {totalTasks}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar sx={{ bgcolor: 'success.main', width: 40, height: 40 }}>
                    <CheckCircleIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={700}>
                      {completedTasks}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Completed
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.warning.main, 0.1)} 0%, ${alpha(theme.palette.warning.main, 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar sx={{ bgcolor: 'warning.main', width: 40, height: 40 }}>
                    <InProgressIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={700}>
                      {inProgressTasks}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      In Progress
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Paper
                elevation={2}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
                  border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar sx={{ bgcolor: 'info.main', width: 40, height: 40 }}>
                    <PendingIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h5" fontWeight={700}>
                      {pendingTasks}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Pending
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          {/* Progress Bar */}
          <Paper
            elevation={2}
            sx={{
              p: 2.5,
              borderRadius: 2,
              mb: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
              <Typography variant="body2" fontWeight={600} color="text.secondary">
                Completion Rate
              </Typography>
              <Typography variant="body2" fontWeight={700} color="primary.main">
                {completionRate}%
              </Typography>
            </Stack>
            <LinearProgress
              variant="determinate"
              value={completionRate}
              sx={{
                height: 8,
                borderRadius: 4,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                },
              }}
            />
          </Paper>
        </Box>

        {/* Error Messages */}
        {tasksErrorMsg && (
          <Alert severity="error" sx={{ mb: 2 }}>{tasksErrorMsg}</Alert>
        )}
        
        {isStale && (
          <Alert severity="info" sx={{ mb: 2 }} action={
            <Button size="small" onClick={refresh}>Refresh</Button>
          }>
            Tasks may be out of date
          </Alert>
        )}

        {/* Filter Tabs */}
        <Paper elevation={2} sx={{ borderRadius: 2, p: 1 }}>
          <ToggleButtonGroup
            value={taskFilter}
            exclusive
            onChange={handleFilterChange}
            fullWidth
            size="small"
            aria-label="task filter"
            sx={{
              '& .MuiToggleButton-root': {
                textTransform: 'none',
                fontWeight: 600,
                borderRadius: 1.5,
                py: 1,
              },
            }}
          >
            <ToggleButton value="all" aria-label="all tasks">
              All ({totalTasks})
            </ToggleButton>
            <ToggleButton value="my-tasks" aria-label="my tasks">
              My Tasks ({myTasksCount})
            </ToggleButton>
            <ToggleButton value="created-by-me" aria-label="created by me">
              Created by Me ({createdByMeCount})
            </ToggleButton>
          </ToggleButtonGroup>
        </Paper>

        {/* Kanban Board */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          {tasksLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Grid container spacing={2} sx={{ height: '100%', alignItems: 'flex-start' }}>
              {KANBAN_COLUMNS.map((column) => {
                const columnTasks = tasksByStatus[column.id] || [];
                const isDraggedOver = draggedOverColumn === column.id;
                
                return (
                  <Grid item xs={12} md={4} key={column.id} sx={{ height: '100%' }}>
                    <Paper
                      elevation={2}
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 2,
                        border: `2px solid ${isDraggedOver ? column.color : 'transparent'}`,
                        bgcolor: isDraggedOver ? alpha(column.color, 0.05) : 'background.paper',
                        transition: 'all 0.2s',
                      }}
                      onDragOver={(e) => handleDragOver(e, column.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, column.id)}
                    >
                      {/* Column Header */}
                      <Box
                        sx={{
                          p: 2,
                          borderBottom: `2px solid ${alpha(column.color, 0.2)}`,
                          bgcolor: alpha(column.color, 0.05),
                        }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Box sx={{ color: column.color }}>
                              {column.icon}
                            </Box>
                            <Typography variant="h6" fontWeight={700}>
                              {column.title}
                            </Typography>
                            <Badge
                              badgeContent={columnTasks.length}
                              color={column.id === 'completed' ? 'success' : column.id === 'in-progress' ? 'warning' : 'default'}
                              sx={{
                                '& .MuiBadge-badge': {
                                  bgcolor: column.color,
                                },
                              }}
                            />
                          </Stack>
                        </Stack>
                      </Box>

                      {/* Column Tasks */}
                      <Box
                        sx={{
                          flexGrow: 1,
                          overflowY: 'auto',
                          p: 2,
                          minHeight: 200,
                        }}
                      >
                        {columnTasks.length === 0 ? (
                          <Box
                            sx={{
                              textAlign: 'center',
                              py: 4,
                              color: 'text.secondary',
                              border: `2px dashed ${alpha(theme.palette.divider, 0.5)}`,
                              borderRadius: 2,
                            }}
                          >
                            <Typography variant="body2">No tasks</Typography>
                          </Box>
                        ) : (
                          <Stack spacing={2}>
                            {columnTasks.map((task) => (
                              <Card
                                key={task.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, task)}
                                elevation={draggedTask?.id === task.id ? 8 : 2}
                                sx={{
                                  borderRadius: 2,
                                  cursor: 'grab',
                                  transition: 'all 0.2s',
                                  border: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                                  opacity: draggedTask?.id === task.id ? 0.5 : 1,
                                  '&:hover': {
                                    boxShadow: 4,
                                    transform: 'translateY(-2px)',
                                  },
                                  '&:active': {
                                    cursor: 'grabbing',
                                  },
                                }}
                              >
                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                  <Stack spacing={1.5}>
                                    {/* Task Header */}
                                    <Stack direction="row" spacing={1} alignItems="flex-start">
                                      <DragIndicatorIcon
                                        sx={{
                                          color: 'text.secondary',
                                          fontSize: 20,
                                          mt: 0.5,
                                          cursor: 'grab',
                                        }}
                                      />
                                      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                        <Typography
                                          variant="subtitle2"
                                          fontWeight={600}
                                          onClick={() => handleOpenEditTask(task)}
                                          sx={{
                                            textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                                            color: task.status === 'completed' ? 'text.secondary' : 'text.primary',
                                            mb: 0.5,
                                            wordBreak: 'break-word',
                                            cursor: 'pointer',
                                          }}
                                        >
                                          {task.title}
                                        </Typography>
                                        {task.description && (
                                          <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{
                                              mb: 1,
                                              textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                                              wordBreak: 'break-word',
                                            }}
                                          >
                                            {task.description}
                                          </Typography>
                                        )}
                                      </Box>
                                      <IconButton
                                        size="small"
                                        onClick={(e) => handleTaskMenuOpen(e, task)}
                                        sx={{ mt: -1, mr: -1 }}
                                      >
                                        <MoreVertIcon fontSize="small" />
                                      </IconButton>
                                    </Stack>

                                    {/* Task Meta */}
                                    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                                      {task.hyperlinks && task.hyperlinks.length > 0 && (
                                        <Chip
                                          icon={<LinkIcon />}
                                          label={`${task.hyperlinks.length} link${task.hyperlinks.length > 1 ? 's' : ''}`}
                                          size="small"
                                          variant="outlined"
                                          sx={{ fontSize: '0.7rem' }}
                                        />
                                      )}
                                    </Stack>

                                    {/* Task Footer */}
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                        {task.assignedToName ? (
                                          <Tooltip title={task.assignedToName}>
                                            <Avatar
                                              sx={{
                                                width: 24,
                                                height: 24,
                                                bgcolor: 'primary.main',
                                                fontSize: '0.7rem',
                                              }}
                                            >
                                              {task.assignedToName.charAt(0).toUpperCase()}
                                            </Avatar>
                                          </Tooltip>
                                        ) : task.assignedTo === undefined && (
                                          <Chip
                                            label="Unassigned"
                                            size="small"
                                            variant="outlined"
                                            sx={{ fontSize: '0.65rem', height: 20 }}
                                          />
                                        )}
                                        {task.createdByName && (
                                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                            by {task.createdByName}
                                          </Typography>
                                        )}
                                      </Stack>
                                      {task.createdAt && (
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                                          {new Date(task.createdAt).toLocaleDateString()}
                                        </Typography>
                                      )}
                                    </Stack>
                                  </Stack>
                                </CardContent>
                              </Card>
                            ))}
                          </Stack>
                        )}
                      </Box>
                    </Paper>
                  </Grid>
                );
              })}
            </Grid>
          )}
        </Box>
      </Box>

      {/* Task Dialog */}
      <Dialog
        open={taskDialogOpen}
        onClose={() => setTaskDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 3 },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={700}>
            {editMode === 'create' ? 'Add New Task' : 'Edit Task'}
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              autoFocus
              label="Title"
              fullWidth
              variant="outlined"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              required
            />
            <TextField
              label="Description"
              fullWidth
              variant="outlined"
              multiline
              rows={3}
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
            />
            <Autocomplete
              options={assigneeOptions}
              getOptionLabel={(option) => option.name}
              value={selectedAssignee}
              onChange={(_, newValue) => setSelectedAssignee(newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Assign To (Optional)"
                  variant="outlined"
                  helperText="Select from active workspace users or all employees"
                />
              )}
            />
            <TextField
              label="Notes (Shared Workspace)"
              fullWidth
              variant="outlined"
              multiline
              rows={4}
              value={taskNotes}
              onChange={(e) => handleNotesChange(e.target.value)}
              placeholder="Start typing to collaborate with your team..."
              helperText={editMode === 'edit' ? "Changes auto-save. Shared with assigned user in real-time." : "Add notes that will be shared with your team."}
            />
            <TextField
              label="Hyperlinks (comma-separated)"
              fullWidth
              variant="outlined"
              value={taskHyperlinks}
              onChange={(e) => setTaskHyperlinks(e.target.value)}
              placeholder="https://example.com, https://another.com"
            />
            {loadingSupportRequests ? (
              <CircularProgress size={24} />
            ) : supportRequests.length > 0 && (
              <FormControl fullWidth>
                <InputLabel>Link to Support Request (Optional)</InputLabel>
                <Select
                  value={taskSupportRequestId}
                  label="Link to Support Request (Optional)"
                  onChange={(e) => setTaskSupportRequestId(e.target.value)}
                >
                  <MenuItem value="">None</MenuItem>
                  {supportRequests.map((req) => (
                    <MenuItem key={req.id} value={req.id}>
                      {req.subject} ({req.status})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={taskStatus}
                label="Status"
                onChange={(e) => setTaskStatus(e.target.value as 'pending' | 'in-progress' | 'completed')}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, pt: 1 }}>
          <Button onClick={() => setTaskDialogOpen(false)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveTask}
            variant="contained"
            disabled={!taskTitle.trim() || tasksLoading || authRequired}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {editMode === 'create' ? 'Add Task' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Task Menu */}
      <Menu
        anchorEl={taskMenuAnchor}
        open={Boolean(taskMenuAnchor)}
        onClose={handleTaskMenuClose}
      >
        <MenuItem onClick={() => {
          if (selectedTaskForMenu) {
            handleOpenEditTask(selectedTaskForMenu);
          }
        }}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => {
          if (selectedTaskForMenu) {
            handleDeleteTask(selectedTaskForMenu.id);
          }
        }}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Toast notification */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={6000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseToast} severity={toastSeverity} sx={{ width: '100%' }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </>
  );
}
