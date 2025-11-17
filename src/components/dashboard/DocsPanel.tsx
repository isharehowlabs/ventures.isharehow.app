import { useState } from 'react';
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
} from '@mui/icons-material';
import { useTasks, Task } from '../../hooks/useTasks';

export default function DocsPanel() {
  const {
    tasks,
    isLoading,
    error,
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  } = useTasks();

  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create');
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hyperlinks, setHyperlinks] = useState('');
  const [status, setStatus] = useState<'pending' | 'in-progress' | 'completed'>('pending');

  const handleRefresh = () => {
    fetchTasks();
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
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} disabled={isLoading || error?.includes('Authentication required')} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            disabled={isLoading || error?.includes('Authentication required')}
            size="small"
          >
            Add Task
          </Button>
        </Box>
      </Box>

      {error && (
        <Paper sx={{ p: 2, bgcolor: error.includes('Authentication required') ? 'warning.light' : 'error.light', color: error.includes('Authentication required') ? 'warning.contrastText' : 'error.contrastText' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">
              {error.includes('Authentication required') 
                ? 'Please log in to access team tasks and collaborate with your team.' 
                : error}
            </Typography>
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
                  <Tooltip title="Edit">
                    <IconButton edge="end" size="small" onClick={() => handleOpenEdit(task)} disabled={!!error?.includes('Authentication required')}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton edge="end" size="small" onClick={() => handleDelete(task.id)} disabled={!!error?.includes('Authentication required')}>
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
          {!tasks.length && !isLoading && !error && (
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
            disabled={!title.trim() || isLoading || error?.includes('Authentication required')}
          >
            {editMode === 'create' ? 'Add' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

