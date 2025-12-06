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
  Autocomplete
} from '@mui/material';
import {
  Add as AddIcon,
  Code as CodeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as PendingIcon,
  PlayCircle as InProgressIcon,
  Link as LinkIcon,
  Favorite as FavoriteIcon,
  Bookmark as BookmarkIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
  PersonOutline as PersonOutlineIcon,
} from '@mui/icons-material';
import { useTasks, Task } from '../../hooks/useTasks';
import { useWorkspaceUsers } from '../../hooks/useWorkspaceUsers';
import { trackTaskCompleted } from '../../utils/analytics';
import { useAuth } from '../../hooks/useAuth';
import { getBackendUrl } from '../../utils/backendUrl';

// Optional imports for Figma/MCP features
let useFigmaHook: any = null;
let useMCPHook: any = null;
try {
  const figmaModule = require('../../hooks/useFigma');
  useFigmaHook = figmaModule.useFigma || figmaModule.default?.useFigma;
} catch (err) {
  console.warn('Figma hook not available:', err);
}
try {
  const mcpModule = require('../../hooks/useMCP');
  useMCPHook = mcpModule.useMCP || mcpModule.default?.useMCP;
} catch (err) {
  console.warn('MCP hook not available:', err);
}

interface SupportRequest {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  client?: string;
}

export default function Workspace() {
  const { user } = useAuth();
  const { users: workspaceUsers } = useWorkspaceUsers();
  const { tasks, createTask, updateTask, deleteTask, updateTaskNotes, isLoading: tasksLoading, error: tasksErrorMsg, authRequired, refresh, isStale } = useTasks();
  
  // Figma hooks (optional - try to load)
  let figmaHook: any = null;
  let mcpHook: any = null;
  
  try {
    if (useFigmaHook) {
      figmaHook = useFigmaHook();
    }
  } catch (err) {
    console.warn('Figma hook not available:', err);
  }
  
  try {
    if (useMCPHook) {
      mcpHook = useMCPHook();
    }
  } catch (err) {
    console.warn('MCP hook not available:', err);
  }
  
  const files = figmaHook?.files || [];
  const components = figmaHook?.components || [];
  const figmaTokens = figmaHook?.tokens || [];
  const componentStatuses = figmaHook?.componentStatuses || {};
  const figmaLoading = figmaHook?.isLoading || false;
  const figmaErrorMsg = figmaHook?.error || null;
  const fetchFiles = figmaHook?.fetchFiles || (() => Promise.resolve());
  const fetchComponents = figmaHook?.fetchComponents || (() => Promise.resolve());
  const likeComponent = figmaHook?.likeComponent || (() => Promise.resolve());
  const saveComponent = figmaHook?.saveComponent || (() => Promise.resolve());
  const fetchLikedComponents = figmaHook?.fetchLikedComponents || (() => Promise.resolve());
  const fetchSavedComponents = figmaHook?.fetchSavedComponents || (() => Promise.resolve());
  const fetchDraftedComponents = figmaHook?.fetchDraftedComponents || (() => Promise.resolve());
  const fetchComponentStatus = figmaHook?.fetchComponentStatus || (() => Promise.resolve());
  
  const links = mcpHook?.links || [];
  const mcpTokens = mcpHook?.tokens || [];
  const linkComponentToCode = mcpHook?.linkComponentToCode || (() => Promise.resolve());
  const fetchCodeLinks = mcpHook?.fetchCodeLinks || (() => Promise.resolve());
  const fetchMcpTokens = mcpHook?.fetchTokens || (() => Promise.resolve());
  
  // State
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create');
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskNotes, setTaskNotes] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState<{id: string, name: string} | null>(null);
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const notesTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [taskHyperlinks, setTaskHyperlinks] = useState('');
  const [taskStatus, setTaskStatus] = useState<'pending' | 'in-progress' | 'completed'>('pending');
  const [taskSupportRequestId, setTaskSupportRequestId] = useState<string>('');
  const [taskFilter, setTaskFilter] = useState<'all' | 'my-tasks' | 'created-by-me'>(
    (localStorage.getItem('taskFilter') as any) || 'all'
  );
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [loadingSupportRequests, setLoadingSupportRequests] = useState(false);
  
  // Figma state
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [figmaComponentId, setFigmaComponentId] = useState('');
  const [codeFilePath, setCodeFilePath] = useState('');
  const [codeComponentName, setCodeComponentName] = useState('');
  const [loadingComponents, setLoadingComponents] = useState(false);
  
  const markdownRef = useRef<HTMLTextAreaElement>(null);

  // Load markdown from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('workspace_markdown');
    if (saved) {
      setMarkdownContent(saved);
    }
  }, []);

  // Save markdown to localStorage
  useEffect(() => {
    if (markdownContent !== '') {
      localStorage.setItem('workspace_markdown', markdownContent);
    }
  }, [markdownContent]);

  // Fetch support requests for task linking
  useEffect(() => {
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

  // Load Figma data (only if hooks are available)
  useEffect(() => {
    if (!useFigmaHook || !useMCPHook) return;
    
    const loadFigmaData = async () => {
      try {
        await Promise.all([
          fetchFiles(),
          fetchCodeLinks(),
          fetchMcpTokens(),
          fetchLikedComponents(),
          fetchSavedComponents(),
          fetchDraftedComponents(),
        ]);
      } catch (err) {
        console.error('Error loading Figma data:', err);
      }
    };
    loadFigmaData();
  }, []);

  useEffect(() => {
    if (!selectedFile || !useFigmaHook) return;
    
    setLoadingComponents(true);
    fetchComponents(selectedFile)
      .then(() => {
        if (components.length > 0) {
          Promise.all(components.map((comp: any) => fetchComponentStatus(comp.key, selectedFile)));
        }
      })
      .catch((err: any) => console.error('Error fetching components:', err))
      .finally(() => setLoadingComponents(false));
  }, [selectedFile]);

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

  // Task handlers

  // Handle filter change
  const handleFilterChange = (event: React.MouseEvent<HTMLElement>, newFilter: 'all' | 'my-tasks' | 'created-by-me' | null) => {
    if (newFilter !== null) {
      setTaskFilter(newFilter);
      localStorage.setItem('taskFilter', newFilter);
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
          selectedAssignee?.name
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

  const handleCopyMarkdown = () => {
    if (markdownRef.current) {
      markdownRef.current.select();
      document.execCommand('copy');
    } else {
      navigator.clipboard.writeText(markdownContent);
    }
  };

  const handleClearMarkdown = () => {
    setMarkdownContent('');
    localStorage.removeItem('workspace_markdown');
  };

  // Figma handlers
  const handleRefreshFigma = () => {
    if (selectedFile) {
      fetchComponents(selectedFile);
    } else {
      fetchFiles();
    }
  };

  const handleLike = async (componentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentStatus = componentStatuses[componentId]?.liked || false;
    try {
      await likeComponent(componentId, !currentStatus, selectedFile || undefined);
    } catch (err) {
      console.error('Error liking component:', err);
    }
  };

  const handleSaveComponent = async (componentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentStatus = componentStatuses[componentId]?.saved || false;
    try {
      await saveComponent(componentId, !currentStatus, selectedFile || undefined);
    } catch (err) {
      console.error('Error saving component:', err);
    }
  };

  const handleLinkComponent = async () => {
    if (!figmaComponentId || !codeFilePath) return;
    
    try {
      await linkComponentToCode(figmaComponentId, codeFilePath, codeComponentName, selectedFile || '');
      setLinkDialogOpen(false);
      fetchCodeLinks();
    } catch (err) {
      console.error('Error linking component:', err);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={3}>
        
        {/* Notes Section */}
        <Grid item xs={12} lg={6}>
          <Paper elevation={2} sx={{ p: 3, height: 500 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" fontWeight={700}>Collaborative Notes</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Copy all">
                  <IconButton onClick={handleCopyMarkdown} size="small">
                    <CodeIcon />
                  </IconButton>
                </Tooltip>
                <Button variant="outlined" size="small" onClick={handleClearMarkdown}>
                  Clear
                </Button>
              </Box>
            </Box>
            <TextField
              fullWidth
              multiline
              rows={15}
              variant="outlined"
              placeholder="Write your collaborative notes here..."
              value={markdownContent}
              onChange={(e) => setMarkdownContent(e.target.value)}
              inputRef={markdownRef}
              sx={{ 
                '& .MuiInputBase-root': { 
                  height: '100%', 
                  alignItems: 'flex-start' 
                }
              }}
            />
          </Paper>
        </Grid>

        {/* Tasks Section */}
        <Grid item xs={12} lg={6}>
          <Paper elevation={2} sx={{ p: 3, height: 500, display: 'flex', flexDirection: 'column' }}>
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
        </Grid>

        {/* Figma/Design Section */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, height: 500, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" fontWeight={700}>Design & Figma</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Refresh">
                  <IconButton onClick={handleRefreshFigma} size="small">
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setLinkDialogOpen(true)}
                  disabled={!selectedFile || components.length === 0}
                >
                  Link to Code
                </Button>
              </Box>
            </Box>
            
            {!useFigmaHook || !useMCPHook ? (
              <Alert severity="info">
                Figma integration not available. Check your configuration.
              </Alert>
            ) : (
              <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {figmaErrorMsg && <Alert severity="error" sx={{ mb: 2 }}>{figmaErrorMsg}</Alert>}
                
                <Box sx={{ mb: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Select Figma File</InputLabel>
                    <Select
                      value={selectedFile || ''}
                      label="Select Figma File"
                      onChange={(e) => setSelectedFile(e.target.value)}
                    >
                      <MenuItem value="">-- Select a file --</MenuItem>
                      {files.map((file: any) => (
                        <MenuItem key={file.key} value={file.key}>{file.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {selectedFile && (
                  <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                    {loadingComponents ? (
                      <Box sx={{ textAlign: 'center', py: 4 }}>
                        <CircularProgress size={24} />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          Loading components...
                        </Typography>
                      </Box>
                    ) : (
                      <Grid container spacing={2}>
                        {components.map((comp: any) => (
                          <Grid item xs={12} sm={6} md={4} lg={3} key={comp.key}>
                            <Card elevation={1}>
                              <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                                <Typography variant="subtitle2" noWrap fontWeight={500}>
                                  {comp.name}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                                  <IconButton 
                                    size="small" 
                                    onClick={(e) => handleLike(comp.key, e)}
                                    color={componentStatuses[comp.key]?.liked ? 'error' : 'default'}
                                  >
                                    <FavoriteIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton 
                                    size="small" 
                                    onClick={(e) => handleSaveComponent(comp.key, e)}
                                    color={componentStatuses[comp.key]?.saved ? 'primary' : 'default'}
                                  >
                                    <BookmarkIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                        
                        {components.length === 0 && (
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                              No components found in this file.
                            </Typography>
                          </Grid>
                        )}
                      </Grid>
                    )}
                  </Box>
                )}
                
                {!selectedFile && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      Select a Figma file to view components
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </Paper>
        </Grid>

      </Grid>

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
          {editMode === 'edit' && (
            <>
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
                helperText="Changes auto-save. Shared with assigned user in real-time."
              />
            </>
          )}
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

      {/* Link Component Dialog */}
      <Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Link Figma Component to Code</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense" sx={{ mb: 2, mt: 1 }}>
            <InputLabel>Figma Component</InputLabel>
            <Select
              value={figmaComponentId}
              label="Figma Component"
              onChange={(e) => setFigmaComponentId(e.target.value)}
            >
              {components.map((comp: any) => (
                <MenuItem key={comp.key} value={comp.key}>
                  {comp.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Code File Path"
            fullWidth
            variant="outlined"
            value={codeFilePath}
            onChange={(e) => setCodeFilePath(e.target.value)}
            placeholder="/src/components/Button.tsx"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Component Name (Optional)"
            fullWidth
            variant="outlined"
            value={codeComponentName}
            onChange={(e) => setCodeComponentName(e.target.value)}
            placeholder="Button"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLinkDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleLinkComponent}
            variant="contained"
            disabled={!figmaComponentId || !codeFilePath}
          >
            Link
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
