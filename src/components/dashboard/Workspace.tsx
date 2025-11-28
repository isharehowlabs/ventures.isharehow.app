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
  Card,
  CardContent,
  CardActions,
  Stack,
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
  TrendingUp as TrendingIcon,
  Business as BusinessIcon,
  AttachMoney as MoneyIcon,
  Dashboard as BoardIcon,
  Link as LinkIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
} from '@mui/icons-material';
import { useTasks, Task } from '../../hooks/useTasks';
import { trackTaskCompleted } from '../../utils/analytics';
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
import Web3MQChat from '../chat/Web3MQChat';
import { useAuth } from '../../hooks/useAuth';
import { useRouter } from 'next/router';
import { getBackendUrl } from '../../utils/backendUrl';

// Figma file embed URL
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

interface Opportunity {
  id: string;
  title: string;
  description: string;
  type: 'mssp' | 'soc' | 'venture' | 'client';
  status: 'lead' | 'negotiation' | 'active' | 'closed';
  value?: number;
  priority: 'low' | 'medium' | 'high';
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
  const router = useRouter();
  const { user } = useAuth();
  const { tasks, createTask, updateTask, deleteTask, isLoading: tasksLoading, error: tasksErrorMsg, authRequired, refresh, isStale, lastUpdated } = useTasks();
  
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
  const fetchTokens = figmaHook?.fetchTokens || (() => Promise.resolve());
  const likeComponent = figmaHook?.likeComponent || (() => Promise.resolve());
  const saveComponent = figmaHook?.saveComponent || (() => Promise.resolve());
  const draftComponent = figmaHook?.draftComponent || (() => Promise.resolve());
  const fetchLikedComponents = figmaHook?.fetchLikedComponents || (() => Promise.resolve());
  const fetchSavedComponents = figmaHook?.fetchSavedComponents || (() => Promise.resolve());
  const fetchDraftedComponents = figmaHook?.fetchDraftedComponents || (() => Promise.resolve());
  const fetchComponentStatus = figmaHook?.fetchComponentStatus || (() => Promise.resolve());
  
  const links = mcpHook?.links || [];
  const mcpTokens = mcpHook?.tokens || [];
  const mcpLoading = mcpHook?.isLoading || false;
  const mcpError = mcpHook?.error || null;
  const linkComponentToCode = mcpHook?.linkComponentToCode || (() => Promise.resolve());
  const fetchCodeLinks = mcpHook?.fetchCodeLinks || (() => Promise.resolve());
  const fetchMcpTokens = mcpHook?.fetchTokens || (() => Promise.resolve());
  const generateCode = mcpHook?.generateCode || (() => Promise.resolve());
  
  // State
  const [markdownContent, setMarkdownContent] = useState<string>('');
  const [activeTab, setActiveTab] = useState(0); // 0: Notes, 1: Tasks, 2: Figma, 3: Opportunities, 4: Chat
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create');
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskHyperlinks, setTaskHyperlinks] = useState('');
  const [taskStatus, setTaskStatus] = useState<'pending' | 'in-progress' | 'completed'>('pending');
  const [taskSupportRequestId, setTaskSupportRequestId] = useState<string>('');
  const [supportRequests, setSupportRequests] = useState<SupportRequest[]>([]);
  const [loadingSupportRequests, setLoadingSupportRequests] = useState(false);
  
  // Figma state
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [figmaTabValue, setFigmaTabValue] = useState(0);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string>('');
  const [figmaComponentId, setFigmaComponentId] = useState('');
  const [selectedComponent, setSelectedComponent] = useState<any>(null);
  const [codeFilePath, setCodeFilePath] = useState('');
  const [codeComponentName, setCodeComponentName] = useState('');
  const [loadingComponents, setLoadingComponents] = useState(false);
  
  // Opportunities state
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [opportunityDialogOpen, setOpportunityDialogOpen] = useState(false);
  const [opportunityFormData, setOpportunityFormData] = useState({
    title: '',
    description: '',
    type: 'venture' as Opportunity['type'],
    status: 'lead' as Opportunity['status'],
    value: '',
    priority: 'medium' as Opportunity['priority'],
  });
  
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
  }, [useFigmaHook, useMCPHook]);

  useEffect(() => {
    if (!selectedFile || !useFigmaHook) return;
    
    setLoadingComponents(true);
    fetchComponents(selectedFile)
      .then(() => {
        // Fetch status for all components
        if (components.length > 0) {
          Promise.all(components.map(comp => fetchComponentStatus(comp.key, selectedFile)));
        }
      })
      .catch(err => console.error('Error fetching components:', err))
      .finally(() => setLoadingComponents(false));
  }, [selectedFile, useFigmaHook]);

  // Task handlers
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
    setTaskDialogOpen(true);
  };

  const handleSaveTask = async () => {
    if (!taskTitle.trim()) return;
    
    try {
      const hyperlinksArray = taskHyperlinks.split(',').map(h => h.trim()).filter(h => h);
      
      if (editMode === 'create') {
        // Note: createTask doesn't support supportRequestId directly, we'll need to update it after creation
        const newTask = await createTask(taskTitle.trim(), taskDescription.trim(), hyperlinksArray, taskStatus);
        // If support request ID is provided, update the task to link it
        if (taskSupportRequestId && newTask?.id) {
          await updateTask(newTask.id, {
            supportRequestId: taskSupportRequestId,
          });
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

  // Figma handlers
  const handleFileSelect = (fileId: string) => {
    setSelectedFile(fileId);
    setFigmaTabValue(0);
  };

  const handleRefresh = () => {
    if (selectedFile) {
      fetchComponents(selectedFile);
    } else {
      fetchFiles();
    }
  };

  const handleOpenLinkDialog = () => {
    setLinkDialogOpen(true);
    setSelectedFileId(selectedFile || '');
    setFigmaComponentId('');
    setCodeFilePath('');
    setCodeComponentName('');
  };

  const handleLinkComponent = async () => {
    if (!figmaComponentId || !codeFilePath) return;
    
    try {
      await linkComponentToCode(figmaComponentId, codeFilePath, codeComponentName, selectedFileId);
      setLinkDialogOpen(false);
      fetchCodeLinks();
    } catch (err) {
      console.error('Error linking component:', err);
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

  const handleSave = async (componentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentStatus = componentStatuses[componentId]?.saved || false;
    try {
      await saveComponent(componentId, !currentStatus, selectedFile || undefined);
    } catch (err) {
      console.error('Error saving component:', err);
    }
  };

  const handleDraft = async (componentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentStatus = componentStatuses[componentId]?.drafted || false;
    try {
      await draftComponent(componentId, !currentStatus);
    } catch (err) {
      console.error('Error drafting component:', err);
    }
  };

  const getFilteredComponents = (filterType: 'all' | 'liked' | 'saved' | 'drafted') => {
    if (filterType === 'all') {
      return components;
    } else if (filterType === 'liked') {
      return components.filter((comp) => componentStatuses[comp.key]?.liked);
    } else if (filterType === 'saved') {
      return components.filter((comp) => componentStatuses[comp.key]?.saved);
    } else if (filterType === 'drafted') {
      return components.filter((comp) => componentStatuses[comp.key]?.drafted);
    }
    return components;
  };

  // Opportunity handlers
  const handleOpenOpportunityDialog = () => {
    setOpportunityFormData({
      title: '',
      description: '',
      type: 'venture',
      status: 'lead',
      value: '',
      priority: 'medium',
    });
    setOpportunityDialogOpen(true);
  };

  const handleSaveOpportunity = () => {
    const newOpportunity: Opportunity = {
      id: Date.now().toString(),
      title: opportunityFormData.title,
      description: opportunityFormData.description,
      type: opportunityFormData.type,
      status: opportunityFormData.status,
      value: opportunityFormData.value ? parseFloat(opportunityFormData.value) : undefined,
      priority: opportunityFormData.priority,
    };
    setOpportunities([...opportunities, newOpportunity]);
    setOpportunityDialogOpen(false);
  };

  const handleOpenBoard = (id: string, type: 'task' | 'opportunity') => {
    router.push(`/board?boardId=${type}_${id}`);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'mssp':
      case 'soc':
        return <BusinessIcon />;
      default:
        return <TrendingIcon />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'lead':
        return 'info';
      case 'negotiation':
        return 'warning';
      case 'active':
        return 'success';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  const figmaIsLoading = figmaLoading || mcpLoading || loadingComponents;
  const figmaError = figmaErrorMsg || mcpError;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab icon={<DescriptionIcon />} label="Notes" iconPosition="start" />
            <Tab icon={<CheckIcon />} label="Tasks" iconPosition="start" />
            <Tab icon={<FigmaIcon />} label="Design" iconPosition="start" />
            <Tab icon={<TrendingIcon />} label="Opportunities" iconPosition="start" />
            <Tab icon={<ChatIcon />} label="Chat" iconPosition="start" />
          </Tabs>
        </Box>

        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          {/* Notes Tab */}
          <TabPanel value={activeTab} index={0}>
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box>
                  <Typography variant="h6">Collaborative Notes</Typography>
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
                placeholder="Start typing your markdown notes here..."
                sx={{
                  '& .MuiInputBase-root': {
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                  },
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Notes are automatically saved to your browser.
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
                  Please log in to access team tasks.
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
                                <PendingIcon fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Open Board">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenBoard(task.id, 'task')}
                              color="primary"
                            >
                              <BoardIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenEditTask(task)}
                              disabled={authRequired}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteTask(task.id)}
                              disabled={authRequired}
                            >
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
                            {task.supportRequestId && (
                              <Chip
                                label={`Request: ${supportRequests.find(r => r.id === task.supportRequestId)?.subject || task.supportRequestId}`}
                                size="small"
                                variant="outlined"
                                sx={{ mt: 0.5 }}
                                onClick={() => {
                                  // Could navigate to support request details
                                  console.log('Support request:', task.supportRequestId);
                                }}
                              />
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                  {!tasks.length && !tasksLoading && !authRequired && (
                    <Box sx={{ p: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        No tasks yet. Add tasks to get started.
                      </Typography>
                    </Box>
                  )}
                </List>
              )}
            </Box>
          </TabPanel>

          {/* Figma/Design Tab */}
          <TabPanel value={activeTab} index={2}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Figma Designs & Code Handoff</Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Refresh">
                    <IconButton onClick={handleRefresh} disabled={figmaIsLoading} size="small">
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                  <Button
                    variant="contained"
                    startIcon={<LinkIcon />}
                    onClick={handleOpenLinkDialog}
                    size="small"
                    disabled={figmaIsLoading}
                  >
                    Link Component
                  </Button>
                </Box>
              </Box>

              {figmaError && (
                <Alert severity="error" sx={{ m: 2 }}>
                  {figmaError}
                </Alert>
              )}

              <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
                {/* Files Sidebar */}
                <Box sx={{ width: 250, borderRight: 1, borderColor: 'divider', overflow: 'auto' }}>
                  <Box sx={{ p: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Files
                    </Typography>
                    {figmaIsLoading && !selectedFile ? (
                      <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                        <CircularProgress size={24} />
                      </Box>
                    ) : (
                      <List dense>
                        {files
                          .filter((file) => file?.id && typeof file.id === 'string' && file.id.trim() !== '')
                          .map((file) => (
                            <ListItem
                              key={file.id}
                              button
                              selected={selectedFile === file.id}
                              onClick={() => handleFileSelect(file.id)}
                            >
                              <ListItemText primary={file.name || 'Unnamed file'} />
                            </ListItem>
                          ))}
                      </List>
                    )}
                  </Box>
                </Box>

                {/* Main Content */}
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                  {selectedFile ? (
                    <>
                      <Tabs value={figmaTabValue} onChange={(_, v) => setFigmaTabValue(v)}>
                        <Tab label="Components" />
                        <Tab label="Liked" />
                        <Tab label="Saved" />
                        <Tab label="Drafts" />
                        <Tab label="Design Tokens" />
                        <Tab label="Code Links" />
                      </Tabs>
                      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                        <TabPanel value={figmaTabValue} index={0}>
                          {loadingComponents ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                              <CircularProgress />
                            </Box>
                          ) : (
                            <List>
                              {components.map((component) => {
                                const isLinked = links.some((link) => link.componentId === component.key);
                                const isLiked = componentStatuses[component.key]?.liked || false;
                                const isSaved = componentStatuses[component.key]?.saved || false;
                                const isDrafted = componentStatuses[component.key]?.drafted || false;
                                return (
                                  <ListItem
                                    key={component.key}
                                    sx={{
                                      border: 1,
                                      borderColor: 'divider',
                                      borderRadius: 1,
                                      mb: 1,
                                    }}
                                    secondaryAction={
                                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                        <Tooltip title={isLiked ? 'Unlike' : 'Like'}>
                                          <IconButton
                                            size="small"
                                            onClick={(e) => handleLike(component.key, e)}
                                          >
                                            {isLiked ? <FavoriteIcon color="error" /> : <FavoriteBorderIcon />}
                                          </IconButton>
                                        </Tooltip>
                                        <Tooltip title={isSaved ? 'Unsave' : 'Save'}>
                                          <IconButton
                                            size="small"
                                            onClick={(e) => handleSave(component.key, e)}
                                          >
                                            {isSaved ? <BookmarkIcon color="primary" /> : <BookmarkBorderIcon />}
                                          </IconButton>
                                        </Tooltip>
                                        {isLinked && (
                                          <Chip label="Linked" size="small" color="success" />
                                        )}
                                      </Box>
                                    }
                                  >
                                    <ListItemText
                                      primary={component.name}
                                      secondary={component.description}
                                    />
                                  </ListItem>
                                );
                              })}
                            </List>
                          )}
                        </TabPanel>
                        <TabPanel value={figmaTabValue} index={1}>
                          <List>
                            {getFilteredComponents('liked').map((comp) => (
                              <ListItem key={comp.key}>
                                <ListItemText primary={comp.name} />
                              </ListItem>
                            ))}
                          </List>
                        </TabPanel>
                        <TabPanel value={figmaTabValue} index={2}>
                          <List>
                            {getFilteredComponents('saved').map((comp) => (
                              <ListItem key={comp.key}>
                                <ListItemText primary={comp.name} />
                              </ListItem>
                            ))}
                          </List>
                        </TabPanel>
                        <TabPanel value={figmaTabValue} index={3}>
                          <List>
                            {getFilteredComponents('drafted').map((comp) => (
                              <ListItem key={comp.key}>
                                <ListItemText primary={comp.name} />
                              </ListItem>
                            ))}
                          </List>
                        </TabPanel>
                        <TabPanel value={figmaTabValue} index={4}>
                          <Typography variant="body2">Design Tokens: {figmaTokens.length}</Typography>
                        </TabPanel>
                        <TabPanel value={figmaTabValue} index={5}>
                          <List>
                            {links.map((link) => (
                              <ListItem key={link.id}>
                                <ListItemText
                                  primary={link.componentName}
                                  secondary={link.codeFilePath}
                                />
                              </ListItem>
                            ))}
                          </List>
                        </TabPanel>
                      </Box>
                    </>
                  ) : (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Select a Figma file to view components
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </TabPanel>

          {/* Opportunities Tab */}
          <TabPanel value={activeTab} index={3}>
            <Box sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6">Venture Opportunities</Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleOpenOpportunityDialog}
                  size="small"
                >
                  Add Opportunity
                </Button>
              </Box>

              <Grid container spacing={2}>
                {opportunities.map((opp) => (
                  <Grid item xs={12} md={6} key={opp.id}>
                    <Card elevation={2}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                          <Box sx={{ mr: 1, color: 'primary.main' }}>
                            {getTypeIcon(opp.type)}
                          </Box>
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="h6" component="div">
                              {opp.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                              {opp.description}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                          <Chip
                            label={opp.type.toUpperCase()}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={opp.status}
                            size="small"
                            color={getStatusColor(opp.status) as any}
                          />
                          <Chip
                            label={opp.priority}
                            size="small"
                            color={getPriorityColor(opp.priority) as any}
                          />
                          {opp.value && (
                            <Chip
                              icon={<MoneyIcon />}
                              label={`$${opp.value.toLocaleString()}`}
                              size="small"
                              color="success"
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </CardContent>
                      <CardActions>
                        <Tooltip title="Open Collaboration Board">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenBoard(opp.id, 'opportunity')}
                            color="primary"
                          >
                            <BoardIcon />
                          </IconButton>
                        </Tooltip>
                        <Button size="small">View Details</Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {opportunities.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No opportunities yet. Add your first venture opportunity!
                  </Typography>
                </Box>
              )}
            </Box>
          </TabPanel>

          {/* Chat Tab */}
          <TabPanel value={activeTab} index={4}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Web3MQChat
                channelId="workspace-general"
                channelName="Workspace Chat"
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

      {/* Opportunity Dialog */}
      <Dialog open={opportunityDialogOpen} onClose={() => setOpportunityDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Opportunity</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            variant="outlined"
            value={opportunityFormData.title}
            onChange={(e) => setOpportunityFormData({ ...opportunityFormData, title: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={opportunityFormData.description}
            onChange={(e) => setOpportunityFormData({ ...opportunityFormData, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={opportunityFormData.type}
              label="Type"
              onChange={(e) => setOpportunityFormData({ ...opportunityFormData, type: e.target.value as Opportunity['type'] })}
            >
              <MenuItem value="mssp">MSSP</MenuItem>
              <MenuItem value="soc">SOC</MenuItem>
              <MenuItem value="venture">Venture</MenuItem>
              <MenuItem value="client">Client</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={opportunityFormData.status}
              label="Status"
              onChange={(e) => setOpportunityFormData({ ...opportunityFormData, status: e.target.value as Opportunity['status'] })}
            >
              <MenuItem value="lead">Lead</MenuItem>
              <MenuItem value="negotiation">Negotiation</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="dense" sx={{ mb: 2 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={opportunityFormData.priority}
              label="Priority"
              onChange={(e) => setOpportunityFormData({ ...opportunityFormData, priority: e.target.value as Opportunity['priority'] })}
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Estimated Value ($)"
            fullWidth
            variant="outlined"
            type="number"
            value={opportunityFormData.value}
            onChange={(e) => setOpportunityFormData({ ...opportunityFormData, value: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpportunityDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSaveOpportunity}
            variant="contained"
            disabled={!opportunityFormData.title.trim()}
          >
            Add
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
              {components.map((comp) => (
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
