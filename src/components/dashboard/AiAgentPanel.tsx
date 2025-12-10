import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  Button,
  Alert,
  Divider,
  Card,
  CardContent,
  IconButton,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from '@mui/material';
import {
  SmartToy as AiAgentIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  PlayArrow as PlayIcon,
  Schedule as ScheduleIcon,
  Refresh as RefreshIcon,
  Favorite as FavoriteIcon,
  Bookmark as BookmarkIcon,
} from '@mui/icons-material';
import { useSettings } from '../../hooks/useSettings';
import TasksPanel from './shared/TasksPanel';
import SEOProspectingBuilder from './creative/SEOProspectingBuilder';

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

interface ContentItem {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  lastUsed?: string;
  status: 'active' | 'archived';
}

export default function AiAgentPanel() {
  const { settings, updateApiKeys } = useSettings();
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [revidApiKey, setRevidApiKey] = useState<string>('');

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
  const componentStatuses = figmaHook?.componentStatuses || {};
  const figmaLoading = figmaHook?.isLoading || false;
  const figmaErrorMsg = figmaHook?.error || null;
  const fetchFiles = figmaHook?.fetchFiles || (() => Promise.resolve());
  const fetchComponents = figmaHook?.fetchComponents || (() => Promise.resolve());
  const likeComponent = figmaHook?.likeComponent || (() => Promise.resolve());
  const saveComponent = figmaHook?.saveComponent || (() => Promise.resolve());
  const fetchComponentStatus = figmaHook?.fetchComponentStatus || (() => Promise.resolve());
  
  const linkComponentToCode = mcpHook?.linkComponentToCode || (() => Promise.resolve());
  const fetchCodeLinks = mcpHook?.fetchCodeLinks || (() => Promise.resolve());

  // Figma state
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [figmaComponentId, setFigmaComponentId] = useState('');
  const [codeFilePath, setCodeFilePath] = useState('');
  const [codeComponentName, setCodeComponentName] = useState('');
  const [loadingComponents, setLoadingComponents] = useState(false);

  // Load API key from settings
  useEffect(() => {
    const apiKey = settings.apiKeys?.revidApiKey || '';
    setRevidApiKey(apiKey);
  }, [settings.apiKeys]);

  // Load content items from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('ai_agent_content');
    if (stored) {
      try {
        setContentItems(JSON.parse(stored));
      } catch (e) {
        console.error('Error loading content items:', e);
      }
    }
  }, []);

  // Load Figma data (only if hooks are available)
  useEffect(() => {
    if (!useFigmaHook || !useMCPHook) return;
    
    const loadFigmaData = async () => {
      try {
        await Promise.all([
          fetchFiles(),
          fetchCodeLinks(),
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

  // Save content items to localStorage
  const saveContentItems = (items: ContentItem[]) => {
    localStorage.setItem('ai_agent_content', JSON.stringify(items));
    setContentItems(items);
  };

  const handleAdd = () => {
    setEditingItem(null);
    setTitle('');
    setContent('');
    setShowForm(true);
    setError(null);
  };

  const handleEdit = (item: ContentItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setContent(item.content);
    setShowForm(true);
    setError(null);
  };

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    if (!revidApiKey) {
      setError('Revid.ai API key is required. Please add your API key above.');
      return;
    }

    const newItem: ContentItem = editingItem
      ? { ...editingItem, title, content }
      : {
          id: Date.now().toString(),
          title,
          content,
          createdAt: new Date().toISOString(),
          status: 'active',
        };

    const updated = editingItem
      ? contentItems.map((item) => (item.id === editingItem.id ? newItem : item))
      : [...contentItems, newItem];

    saveContentItems(updated);
    setShowForm(false);
    setTitle('');
    setContent('');
    setEditingItem(null);
    setSuccess(editingItem ? 'Content updated successfully' : 'Content added successfully');
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this content?')) {
      const updated = contentItems.filter((item) => item.id !== id);
      saveContentItems(updated);
      setSuccess('Content deleted successfully');
      setTimeout(() => setSuccess(null), 3000);
    }
  };

  const handleGenerateVideo = async (item: ContentItem) => {
    if (!revidApiKey) {
      setError('Revid.ai API key is required. Please add your API key above.');
      return;
    }

    setError(null);
    setSuccess('Generating video... This may take a few minutes.');

    try {
      // TODO: Implement Revid.ai API call
      // This is a placeholder for the actual API integration
      const response = await fetch('https://api.revid.ai/v1/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${revidApiKey}`,
        },
        body: JSON.stringify({
          script: item.content,
          title: item.title,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate video');
      }

      const data = await response.json();
      
      // Update last used timestamp
      const updated = contentItems.map((i) =>
        i.id === item.id ? { ...i, lastUsed: new Date().toISOString() } : i
      );
      saveContentItems(updated);

      setSuccess('Video generated successfully! Check your Revid.ai dashboard.');
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.message || 'Failed to generate video. Please check your API key and try again.');
      setSuccess(null);
    }
  };

  const handleSchedule = (item: ContentItem) => {
    // TODO: Implement scheduling functionality
    setSuccess('Scheduling feature coming soon!');
    setTimeout(() => setSuccess(null), 3000);
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
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <Grid container spacing={3}>
        {/* Tasks Section */}
        <Grid item xs={12} md={4}>
          <TasksPanel height={600} />
        </Grid>

        {/* Design & Figma Section - Large Card */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, minHeight: 600, display: 'flex', flexDirection: 'column' }}>
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
                          <Grid item xs={12} sm={6} key={comp.key}>
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

        {/* AI Agent Content Manager Section - Large Card */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, minHeight: 600, display: 'flex', flexDirection: 'column' }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <AiAgentIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                AI Agent Content Manager
              </Typography>
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create and manage content for your AI agent to automatically generate and post videos daily.
            </Typography>

            {/* Revid.ai API Key Input */}
            <Box sx={{ mb: 3 }}>
              <TextField
                fullWidth
                label="Revid.ai API Key"
                type="password"
                value={revidApiKey}
                onChange={(e) => {
                  const newKey = e.target.value;
                  setRevidApiKey(newKey);
                  // Save to settings immediately
                  updateApiKeys({ revidApiKey: newKey });
                }}
                placeholder="Enter your Revid.ai API key"
                helperText="Required for AI Agent panel to generate and auto-post videos"
                size="small"
              />
            </Box>

            {success && (
              <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
                {success}
              </Alert>
            )}

            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
              {!showForm ? (
                <>
                  <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6">Content Library</Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleAdd}
                      disabled={!revidApiKey}
                      size="small"
                    >
                      Add Content
                    </Button>
                  </Box>

                  {contentItems.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        No content items yet. Create your first content item to get started.
                      </Typography>
                      <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={handleAdd}
                        disabled={!revidApiKey}
                        size="small"
                      >
                        Add Your First Content
                      </Button>
                    </Box>
                  ) : (
                    <Stack spacing={2}>
                      {contentItems
                        .filter((item) => item.status === 'active')
                        .map((item) => (
                          <Card key={item.id} elevation={1}>
                            <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                              <Stack direction="row" justifyContent="space-between" alignItems="start">
                                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                  <Typography variant="subtitle1" fontWeight={500} sx={{ mb: 0.5 }}>
                                    {item.title}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    {item.content.substring(0, 150)}
                                    {item.content.length > 150 ? '...' : ''}
                                  </Typography>
                                  <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                                    <Chip
                                      label={`Created: ${new Date(item.createdAt).toLocaleDateString()}`}
                                      size="small"
                                      variant="outlined"
                                    />
                                    {item.lastUsed && (
                                      <Chip
                                        label={`Last used: ${new Date(item.lastUsed).toLocaleDateString()}`}
                                        size="small"
                                        variant="outlined"
                                      />
                                    )}
                                  </Stack>
                                </Box>
                                <Stack direction="row" spacing={0.5}>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleGenerateVideo(item)}
                                    title="Generate Video"
                                    disabled={!revidApiKey}
                                  >
                                    <PlayIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleSchedule(item)}
                                    title="Schedule"
                                    disabled={!revidApiKey}
                                  >
                                    <ScheduleIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleEdit(item)}
                                    title="Edit"
                                  >
                                    <EditIcon fontSize="small" />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDelete(item.id)}
                                    title="Delete"
                                    color="error"
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Stack>
                              </Stack>
                            </CardContent>
                          </Card>
                        ))}
                    </Stack>
                  )}
                </>
              ) : (
                <Box>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    {editingItem ? 'Edit Content' : 'Add New Content'}
                  </Typography>
                  <Stack spacing={2}>
                    <TextField
                      fullWidth
                      label="Title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter content title"
                      required
                      size="small"
                    />
                    <TextField
                      fullWidth
                      label="Content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Enter the content/script for your AI agent to use"
                      multiline
                      rows={6}
                      required
                      size="small"
                    />
                    <Stack direction="row" spacing={2}>
                      <Button variant="contained" onClick={handleSave} size="small">
                        {editingItem ? 'Update' : 'Save'}
                      </Button>
                      <Button variant="outlined" onClick={() => {
                        setShowForm(false);
                        setTitle('');
                        setContent('');
                        setEditingItem(null);
                        setError(null);
                      }} size="small">
                        Cancel
                      </Button>
                    </Stack>
                  </Stack>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Instructions Card - Right side of AI Agent Content Manager */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, minHeight: 600, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              How to Format Video Scripts
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Format this into a video script that follows these tips:
            </Typography>
            
            <Stack spacing={2}>
              <Box>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  1. Use short and punctuated sentences
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Correct punctuation helps the generated voice to be much better.
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  2. Use brackets for media guidance
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  When generating voice, [text between brackets] will be ignored but can be used to guide the AI with the media generation.
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  3. Add pauses with break tags
                </Typography>
                <Typography variant="body2" color="text.secondary" component="div">
                  Use <code style={{ backgroundColor: '#f5f5f5', padding: '2px 4px', borderRadius: '3px' }}>&lt;break time="1.0s" /&gt;</code> to mark a pause in the generated voice.
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
                  4. Use line breaks for slide separation
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Use breaking lines to force slide separation and media change.
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box>
                <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                  Script Example:
                </Typography>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    bgcolor: '#f9f9f9', 
                    borderRadius: 1,
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    whiteSpace: 'pre-wrap',
                    overflow: 'auto',
                    maxHeight: 300
                  }}
                >
{`[close-up of a cat]
Did you know how to make viral videos?

[cat playing with a ball]
First, you need to grab the viewer's attention.

<break time="1.0s" />

[cat chasing a laser pointer]
Then, you need to keep them engaged.

[cat sleeping]
Finally, you need to make them share it.`}
                </Paper>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Tools Section - Large Card */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, minHeight: 600, display: 'flex', flexDirection: 'column' }}>
            <SEOProspectingBuilder />
          </Paper>
        </Grid>
      </Grid>

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

