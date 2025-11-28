'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Grid,
  Typography,
  TextField,
  IconButton,
  Button,
  List,
  ListItem,
  ListItemText,
  Tabs,
  Tab,
  Tooltip,
  Divider,
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
  AlertTitle,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Code as CodeIcon,
  Description as DescriptionIcon,
  DesignServices as FigmaIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  OpenInNew as OpenInNewIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as PendingIcon,
  PlayCircle as InProgressIcon,
  Login as LoginIcon,
  Warning as WarningIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import { useTasks, Task } from '../../hooks/useTasks';
import { trackTaskCompleted } from '../../utils/analytics';
import Web3MQChat from '../chat/Web3MQChat';
import { useAuth } from '../../hooks/useAuth';

// Figma file embed URL (replace with real document or make dynamic as needed)
const FIGMA_EMBED_URL =
  "https://www.figma.com/embed?embed_host=share&url=https://www.figma.com/file/xxxxxxxxxxxxxxxxxxxxxxx";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

export default function Markdown() {
  const { user } = useAuth();
  const { tasks, createTask, updateTask, deleteTask, isLoading: tasksLoading, error: tasksError, authRequired, refresh, isStale, lastUpdated } = useTasks();
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [activeTab, setActiveTab] = useState(0); // 0: Markdown, 1: Tasks, 2: Figma, 3: Chat
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create');
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskHyperlinks, setTaskHyperlinks] = useState('');
  const [taskStatus, setTaskStatus] = useState<'pending' | 'in-progress' | 'completed'>('pending');
  const markdownRef = useRef<HTMLTextAreaElement>(null);

  // Load markdown from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('cowork_markdown');
    if (saved) {
      setMarkdownContent(saved);
    }
  }, []);

  // Save markdown to localStorage on change
  useEffect(() => {
    if (markdownContent !== '') {
      localStorage.setItem('cowork_markdown', markdownContent);
    }
  }, [markdownContent]);

  const handleTaskToggle = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      const newStatus = task.status === 'completed' ? 'pending' : 'completed';
      await updateTask(id, { status: newStatus });
      if (newStatus === 'completed') {
        trackTaskCompleted(id, 'mentee', 'cowork');
      }
    }
  };

  const handleTaskAdd = async (text: string) => {
    await createTask(text, '', [], 'pending');
  };

  const handleOpenCreateTask = () => {
    setEditMode('create');
    setCurrentTaskId(null);
    setTaskTitle('');
    setTaskDescription('');
    setTaskHyperlinks('');
    setTaskStatus('pending');
    setTaskDialogOpen(true);
  };

  const handleOpenEditTask = (task: Task) => {
    setEditMode('edit');
    setCurrentTaskId(task.id);
    setTaskTitle(task.title);
    setTaskDescription(task.description);
    setTaskHyperlinks(task.hyperlinks.join(', '));
    setTaskStatus(task.status);
    setTaskDialogOpen(true);
  };

  const handleSaveTask = async () => {
    try {
      if (!taskTitle.trim()) return;

      const hyperlinksArray = taskHyperlinks.split(',').map(h => h.trim()).filter(h => h);

      if (editMode === 'create') {
        await createTask(taskTitle.trim(), taskDescription.trim(), hyperlinksArray, taskStatus);
      } else if (currentTaskId) {
        await updateTask(currentTaskId, {
          title: taskTitle.trim(),
          description: taskDescription.trim(),
          hyperlinks: hyperlinksArray,
          status: taskStatus,
        });
        
        if (taskStatus === 'completed') {
          trackTaskCompleted(currentTaskId, 'mentee', 'cowork');
        }
      }

      setTaskDialogOpen(false);
      setCurrentTaskId(null);
      setTaskTitle('');
      setTaskDescription('');
      setTaskHyperlinks('');
      setTaskStatus('pending');
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

  const handleCopyMarkdown = () => {
    if (markdownRef.current) {
      markdownRef.current.select();
      document.execCommand('copy');
    }
  };

  return (
    <Box sx={{ width: "100%", minHeight: "100vh", bgcolor: "background.default", p: { xs: 1, md: 3 } }}>
      <Paper elevation={2} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        {/* Header with Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab icon={<DescriptionIcon />} label="Markdown Notes" iconPosition="start" />
            <Tab icon={<CheckIcon />} label="Tasks" iconPosition="start" />
            <Tab icon={<FigmaIcon />} label="Figma/Design" iconPosition="start" />
            <Tab icon={<ChatIcon />} label="Chat" iconPosition="start" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          {/* Markdown Editor Tab */}
          <TabPanel value={activeTab} index={0}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6">Collaborative Markdown Notes</Typography>
                  {user && (user.isEmployee || user.isAdmin) && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      Planning workspace for employees and clients
                    </Typography>
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Copy all">
                    <IconButton onClick={handleCopyMarkdown} size="small">
                      <CodeIcon />
                    </IconButton>
                  </Tooltip>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setMarkdownContent('')}
                  >
                    Clear
                  </Button>
                </Box>
              </Box>
              <TextField
                inputRef={markdownRef}
                fullWidth
                multiline
                rows={20}
                value={markdownContent}
                onChange={(e) => setMarkdownContent(e.target.value)}
                placeholder="Start typing your markdown notes here...&#10;&#10;You can use:&#10;- Lists&#10;- **Bold** and *italic* text&#10;- Code blocks with ```&#10;- Links and more&#10;&#10;Perfect for live coding sessions and collaborative note-taking!"
                sx={{
                  '& .MuiInputBase-root': {
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                  },
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Notes are automatically saved to your browser. Share this workspace during Live Share sessions!
              </Typography>
            </Box>
          </TabPanel>

          {/* Tasks Tab */}
          <TabPanel value={activeTab} index={1}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Task Management</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title={isStale ? "Data may be outdated - Click to refresh" : "Refresh"}>
                    <IconButton 
                      onClick={refresh} 
                      disabled={tasksLoading || authRequired} 
                      size="small"
                      color={isStale ? "warning" : "default"}
                    >
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenCreateTask}
                    disabled={tasksLoading || authRequired}
                    size="small"
                  >
                    Add Task
                  </Button>
                </Box>
              </Box>

              {authRequired && (
                <Alert severity="warning" icon={<LoginIcon />} sx={{ mb: 2 }}>
                  <AlertTitle>Authentication Required</AlertTitle>
                  Please log in to access team tasks and collaborate with your team.
                  <Button
                    size="small"
                    startIcon={<RefreshIcon />}
                    onClick={refresh}
                    disabled={tasksLoading}
                    sx={{ mt: 1 }}
                  >
                    Retry
                  </Button>
                </Alert>
              )}

              {isStale && !authRequired && (
                <Alert severity="info" icon={<WarningIcon />} sx={{ mb: 2 }}>
                  Task data may be outdated. Click refresh to get the latest updates.
                  {lastUpdated && (
                    <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                      Last updated: {lastUpdated.toLocaleTimeString()}
                    </Typography>
                  )}
                </Alert>
              )}

              {tasksLoading && !tasks.length ? (
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
                          <Tooltip title="Toggle Complete">
                            <IconButton
                              size="small"
                              onClick={() => handleTaskToggle(task.id)}
                              disabled={authRequired}
                            >
                              {task.status === 'completed' ? (
                                <CheckIcon color="success" fontSize="small" />
                              ) : (
                                <CloseIcon fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton edge="end" size="small" onClick={() => handleOpenEditTask(task)} disabled={authRequired}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton edge="end" size="small" onClick={() => handleDeleteTask(task.id)} disabled={authRequired}>
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
                  {!tasks.length && !tasksLoading && !tasksError && !authRequired && (
                    <Box sx={{ p: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        No tasks yet. Add tasks and hyperlinks for the team to work on.
                      </Typography>
                    </Box>
                  )}
                </List>
              )}
            </Box>
          </TabPanel>

          {/* Figma/Design Embed Tab */}
          <TabPanel value={activeTab} index={2}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Figma Design & Code Document</Typography>
                <Tooltip title="Open in new tab">
                  <IconButton
                    size="small"
                    onClick={() => window.open(FIGMA_EMBED_URL.replace('/embed?embed_host=share&url=', ''), '_blank')}
                  >
                    <OpenInNewIcon />
                  </IconButton>
                </Tooltip>
              </Box>
              <Box
                sx={{
                  flex: 1,
                  minHeight: 500,
                  border: "1px solid #e0e0e0",
                  borderRadius: 2,
                  overflow: "hidden",
                  bgcolor: 'background.paper',
                }}
              >
                <iframe
                  title="Figma Design Doc"
                  width="100%"
                  height="100%"
                  style={{ minHeight: 500, border: "none" }}
                  src={FIGMA_EMBED_URL}
                  allowFullScreen
                />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Embed Figma designs for collaborative viewing and code generation during live sessions.
              </Typography>
            </Box>
          </TabPanel>

          {/* Web3MQ Chat Tab */}
          <TabPanel value={activeTab} index={3}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Web3MQChat
                channelId="cowork-general"
                channelName="Collaborative Chat"
                compact={true}
              />
            </Box>
          </TabPanel>
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
    </Box>
  );
}
