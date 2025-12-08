'use client';

import React, { useState } from 'react';
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
  MenuItem,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  ToggleButtonGroup,
  ToggleButton,
  Checkbox,
  Autocomplete,
  Snackbar
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

export default function TasksPanel({ height = 500 }: TasksPanelProps) {
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

  // Count tasks for each filter
  const myTasksCount = tasks.filter(t => t.assignedTo === user?.id).length;
  const createdByMeCount = tasks.filter(t => t.createdBy === user?.id).length;

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
    setTaskDialogOpen(true);
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
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleCloseToast = () => {
    setToastOpen(false);
  };

  return (
    <>
      <Paper elevation={2} sx={{ p: 3, height, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight={700}>Tasks</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Refresh">
              <IconButton onClick={refresh} size="small">
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreateTask}
              size="small"
            >
              Add Task
            </Button>
          </Box>
        </Box>
        
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

        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
            <ToggleButtonGroup
              value={taskFilter}
              exclusive
              onChange={handleFilterChange}
              size="small"
              aria-label="task filter"
            >
              <ToggleButton value="all" aria-label="all tasks">
                All Tasks ({tasks.length})
              </ToggleButton>
              <ToggleButton value="my-tasks" aria-label="my tasks">
                My Tasks ({myTasksCount})
              </ToggleButton>
              <ToggleButton value="created-by-me" aria-label="created by me">
                Created by Me ({createdByMeCount})
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          {filteredTasks.map((task) => (
            <Card key={task.id} sx={{ mb: 2 }} elevation={1}>
              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <Checkbox
                    checked={task.status === 'completed'}
                    onChange={() => handleTaskToggle(task.id)}
                    disabled={tasksLoading}
                    size="small"
                  />
                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography 
                      variant="subtitle1" 
                      fontWeight={500}
                      sx={{ textDecoration: task.status === 'completed' ? 'line-through' : 'none' }}
                    >
                      {task.title}
                    </Typography>
                    {task.description && (
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {task.description}
                      </Typography>
                    )}
                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
                      <Chip label={task.status} size="small" color={getStatusColor(task.status) as any} />
                      {task.hyperlinks && task.hyperlinks.length > 0 && (
                        <Chip icon={<LinkIcon />} label={`${task.hyperlinks.length}`} size="small" variant="outlined" />
                      )}
                      {task.createdByName && (
                        <Chip 
                          icon={<PersonOutlineIcon />} 
                          label={`By: ${task.createdByName}`} 
                          size="small" 
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      )}
                      {task.assignedToName ? (
                        <Chip 
                          icon={<PersonIcon />} 
                          label={`→ ${task.assignedToName}`} 
                          size="small" 
                          color="primary"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem' }}
                        />
                      ) : task.assignedTo === undefined && (
                        <Chip 
                          label="Unassigned" 
                          size="small" 
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', opacity: 0.6 }}
                        />
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton size="small" onClick={() => handleOpenEditTask(task)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleDeleteTask(task.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
          
          {tasks.length === 0 && !tasksLoading && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No tasks yet. Add your first task to get started!
              </Typography>
            </Box>
          )}
          
          {tasksLoading && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress size={24} />
            </Box>
          )}
        </Box>
      </Paper>

      {/* Task Dialog */}
      <Dialog open={taskDialogOpen} onClose={() => setTaskDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode === 'create' ? 'Add Task' : 'Edit Task'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            variant="outlined"
            value={taskTitle}
            onChange={(e) => setTaskTitle(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Autocomplete
            options={workspaceUsers}
            getOptionLabel={(option) => option.name}
            value={selectedAssignee}
            onChange={(_, newValue) => setSelectedAssignee(newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                margin="dense"
                label="Assign To (Optional)"
                variant="outlined"
              />
            )}
            sx={{ mb: 2 }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
            Collaborative Notes {isSavingNotes && '(Saving...)'}
          </Typography>
          <TextField
            margin="dense"
            label="Notes (Shared Workspace)"
            fullWidth
            variant="outlined"
            multiline
            rows={6}
            value={taskNotes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Start typing to collaborate with your team..."
            sx={{ mb: 2 }}
            helperText={editMode === 'edit' ? "Changes auto-save. Shared with assigned user in real-time." : "Add notes that will be shared with your team."}
          />
          <TextField
            margin="dense"
            label="Hyperlinks (comma-separated)"
            fullWidth
            variant="outlined"
            value={taskHyperlinks}
            onChange={(e) => setTaskHyperlinks(e.target.value)}
            placeholder="https://example.com, https://another.com"
            sx={{ mb: 2 }}
          />
          {loadingSupportRequests ? (
            <CircularProgress size={24} />
          ) : supportRequests.length > 0 && (
            <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
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
          <FormControl fullWidth margin="dense">
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
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTaskDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveTask}
            variant="contained"
            disabled={!taskTitle.trim() || tasksLoading || authRequired}
          >
            {editMode === 'create' ? 'Add' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

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

