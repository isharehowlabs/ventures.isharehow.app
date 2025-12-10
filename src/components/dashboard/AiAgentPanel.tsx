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
} from '@mui/material';
import {
  SmartToy as AiAgentIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  PlayArrow as PlayIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { useSettings } from '../../hooks/useSettings';
import TasksPanel from './shared/TasksPanel';
import SEOProspectingBuilder from './creative/SEOProspectingBuilder';

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

  return (
    <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
      <Grid container spacing={3}>
        {/* Tasks Section - Large Card */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, minHeight: 600 }}>
            <TasksPanel height={600} />
          </Paper>
        </Grid>

        {/* AI Agent Content Manager Section - Large Card */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, minHeight: 600, display: 'flex', flexDirection: 'column' }}>
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <AiAgentIcon sx={{ fontSize: 32, color: 'primary.main' }} />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Ai Content Agent
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

        {/* Instructions Card - Full Width */}
        <Grid item xs={12}>
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

    </Box>
  );
}

