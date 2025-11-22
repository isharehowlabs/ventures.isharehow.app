import { useState } from 'react';
import { useRouter } from 'next/router';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Paper,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  Add as AddIcon,
  Refresh as RefreshIcon,
  OpenInNew as OpenInNewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as PendingIcon,
  PlayCircle as InProgressIcon,
  Warning as WarningIcon,
  Login as LoginIcon,
  Dashboard as BoardIcon,
} from '@mui/icons-material';
import { useTasks, Task } from '../../hooks/useTasks';
import { trackTaskCompleted } from '../../utils/analytics';

export default function DocsPanel() {
  const {
    tasks,
    isLoading,
    error,
    authRequired,
    isStale,
    lastUpdated,
    refresh,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  } = useTasks();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create');
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hyperlinks, setHyperlinks] = useState('');
  const [status, setStatus] = useState<'pending' | 'in-progress' | 'completed'>('pending');

  const handleRefresh = () => {
    refresh();
  };

  const handleOpenCreate = () => {
    setEditMode('create');
    setCurrentId(null);
    setTitle('');
    setDescription('');
    setHyperlinks('');
    setStatus('pending');
    setOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditMode('edit');
    setCurrentId(task.id);
    setTitle(task.title);
    setDescription(task.description);
    setHyperlinks(task.hyperlinks.join(', '));
    setStatus(task.status);
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!title.trim()) return;

      const hyperlinksArray = hyperlinks.split(',').map(h => h.trim()).filter(h => h);

      if (editMode === 'create') {
        await createTask(title.trim(), description.trim(), hyperlinksArray, status);
      } else if (currentId) {
        await updateTask(currentId, {
          title: title.trim(),
          description: description.trim(),
          hyperlinks: hyperlinksArray,
          status,
        });
        
        // Track task completion
        if (status === 'completed') {
          trackTaskCompleted(currentId, 'mentee', 'cowork');
        }
      }

      setOpen(false);
      setCurrentId(null);
      setTitle('');
      setDescription('');
      setHyperlinks('');
      setStatus('pending');
    } catch (err) {
      console.error('Error saving task:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteTask(id);
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const handleOpenBoard = (taskId: string) => {
    // Navigate to board with task-specific ID
    router.push(`/board?boardId=task_${taskId}`);
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

  return (
    <Box sx={{ p: 2, height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Team Tasks</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title={isStale ? "Data may be outdated - Click to refresh" : "Refresh"}>
            <IconButton 
              onClick={handleRefresh} 
              disabled={isLoading || authRequired} 
              size="small"
              color={isStale ? "warning" : "default"}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            disabled={isLoading || authRequired}
            size="small"
          >
            Add Task
          </Button>
        </Box>
      </Box>

      {/* Authentication Required Alert */}
      {authRequired && (
        <Alert severity="warning" icon={<LoginIcon />}>
          <AlertTitle>Authentication Required</AlertTitle>
          Please log in to access team tasks and collaborate with your team.
          <Button
            size="small"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={isLoading}
            sx={{ mt: 1 }}
          >
            Retry
          </Button>
        </Alert>
      )}

      {/* Stale Data Warning */}
      {isStale && !authRequired && (
        <Alert severity="info" icon={<WarningIcon />}>
          Task data may be outdated. Click refresh to get the latest updates.
          {lastUpdated && (
            <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
              Last updated: {lastUpdated.toLocaleTimeString()}
            </Typography>
          )}
        </Alert>
      )}

      {/* General Error */}
      {error && !authRequired && (
        <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">{error}</Typography>
            <IconButton onClick={handleRefresh} disabled={isLoading} size="small" sx={{ color: 'inherit', ml: 1 }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Box>
        </Paper>
      )}

      {isLoading && !tasks.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <List>
          {tasks.map((task) => (
            <ListItem
              key={task.id}
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
                '&:hover': { bgcolor: 'action.hover' },
              }}
              secondaryAction={
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {task.hyperlinks.map((link, idx) => (
                    <Tooltip key={idx} title={`Open ${link}`}>
                      <IconButton
                        size="small"
                        onClick={() => window.open(link, '_blank', 'noopener,noreferrer')}
                      >
                        <OpenInNewIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  ))}
                  <Tooltip title="Open Collaboration Board">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenBoard(task.id)}
                      color="primary"
                    >
                      <BoardIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton edge="end" size="small" onClick={() => handleOpenEdit(task)} disabled={authRequired}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton edge="end" size="small" onClick={() => handleDelete(task.id)} disabled={authRequired}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                {getStatusIcon(task.status)}
              </Box>
              <ListItemText
                primary={task.title}
                secondary={
                  <Box>
                    {task.description && <Typography variant="body2">{task.description}</Typography>}
                    {task.hyperlinks.length > 0 && (
                      <Box sx={{ mt: 1 }}>
                        {task.hyperlinks.map((link, idx) => (
                          <Chip
                            key={idx}
                            label={link}
                            size="small"
                            variant="outlined"
                            sx={{ mr: 0.5, mb: 0.5 }}
                            onClick={() => window.open(link, '_blank', 'noopener,noreferrer')}
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                }
              />
            </ListItem>
          ))}
          {!tasks.length && !isLoading && !error && !authRequired && (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                No tasks yet. Add tasks and hyperlinks for the team to work on.
              </Typography>
            </Box>
          )}
        </List>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode === 'create' ? 'Add Task' : 'Edit Task'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            variant="outlined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Hyperlinks (comma-separated)"
            fullWidth
            variant="outlined"
            value={hyperlinks}
            onChange={(e) => setHyperlinks(e.target.value)}
            placeholder="https://example.com, https://another.com"
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Status</InputLabel>
            <Select
              value={status}
              label="Status"
              onChange={(e) => setStatus(e.target.value as 'pending' | 'in-progress' | 'completed')}
            >
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in-progress">In Progress</MenuItem>
              <MenuItem value="completed">Completed</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!title.trim() || isLoading || authRequired}
          >
            {editMode === 'create' ? 'Add' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
