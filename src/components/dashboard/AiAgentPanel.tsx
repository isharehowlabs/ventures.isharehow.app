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

interface ContentItem {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  lastUsed?: string;
  status: 'active' | 'archived';
}

export default function AiAgentPanel() {
  const { settings } = useSettings();
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
      setError('Revid.ai API key is required. Please add it in Settings.');
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
      setError('Revid.ai API key is required. Please add it in Settings.');
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
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <AiAgentIcon sx={{ fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          AI Agent Content Manager
        </Typography>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Create and manage content for your AI agent to automatically generate and post videos daily.
        Add your Revid.ai API key in Settings to enable video generation.
      </Typography>

      {!revidApiKey && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Revid.ai API key not configured. Please add it in Settings to enable video generation.
        </Alert>
      )}

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

      {!showForm ? (
        <>
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Content Library</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAdd}
              disabled={!revidApiKey}
            >
              Add Content
            </Button>
          </Box>

          {contentItems.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                No content items yet. Create your first content item to get started.
              </Typography>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAdd}
                disabled={!revidApiKey}
              >
                Add Your First Content
              </Button>
            </Paper>
          ) : (
            <Stack spacing={2}>
              {contentItems
                .filter((item) => item.status === 'active')
                .map((item) => (
                  <Card key={item.id} elevation={2}>
                    <CardContent>
                      <Stack direction="row" justifyContent="space-between" alignItems="start" sx={{ mb: 2 }}>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6" sx={{ mb: 1 }}>
                            {item.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {item.content.substring(0, 200)}
                            {item.content.length > 200 ? '...' : ''}
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
                        <Stack direction="row" spacing={1}>
                          <IconButton
                            size="small"
                            onClick={() => handleGenerateVideo(item)}
                            title="Generate Video"
                            disabled={!revidApiKey}
                          >
                            <PlayIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleSchedule(item)}
                            title="Schedule"
                            disabled={!revidApiKey}
                          >
                            <ScheduleIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleEdit(item)}
                            title="Edit"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(item.id)}
                            title="Delete"
                            color="error"
                          >
                            <DeleteIcon />
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
        <Paper sx={{ p: 3 }}>
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
            />
            <TextField
              fullWidth
              label="Content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter the content/script for your AI agent to use"
              multiline
              rows={8}
              required
            />
            <Stack direction="row" spacing={2}>
              <Button variant="contained" onClick={handleSave}>
                {editingItem ? 'Update' : 'Save'}
              </Button>
              <Button variant="outlined" onClick={() => {
                setShowForm(false);
                setTitle('');
                setContent('');
                setEditingItem(null);
                setError(null);
              }}>
                Cancel
              </Button>
            </Stack>
          </Stack>
        </Paper>
      )}
    </Box>
  );
}

