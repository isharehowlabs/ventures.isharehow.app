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
} from '@mui/material';
import {
  Add as AddIcon,
  Link as LinkIcon,
  Refresh as RefreshIcon,
  OpenInNew as OpenInNewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useExternalResources } from '../../hooks/useGoogleDocs';

export default function DocsPanel() {
  const {
    resources,
    isLoading,
    error,
    fetchResources,
    createResource,
    updateResource,
    deleteResource,
  } = useExternalResources();

  const [open, setOpen] = useState(false);
  const [editMode, setEditMode] = useState<'create' | 'edit'>('create');
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');

  const handleRefresh = () => {
    fetchResources();
  };

  const handleOpenCreate = () => {
    setEditMode('create');
    setCurrentId(null);
    setTitle('');
    setUrl('');
    setOpen(true);
  };

  const handleOpenEdit = (resource: { id: string; title: string; url: string }) => {
    setEditMode('edit');
    setCurrentId(resource.id);
    setTitle(resource.title);
    setUrl(resource.url);
    setOpen(true);
  };

  const handleSave = async () => {
    try {
      if (!title.trim() || !url.trim()) return;

      if (editMode === 'create') {
        await createResource(title.trim(), url.trim());
      } else if (currentId) {
        await updateResource(currentId, {
          title: title.trim(),
          url: url.trim(),
        });
      }

      setOpen(false);
      setCurrentId(null);
      setTitle('');
      setUrl('');
    } catch (err) {
      console.error('Error saving resource:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteResource(id);
    } catch (err) {
      console.error('Error deleting resource:', err);
    }
  };

  const isValidUrl = (value: string) => {
    try {
      const u = new URL(value);
      return !!u.protocol && !!u.host;
    } catch {
      return false;
    }
  };

  return (
    <Box sx={{ p: 2, height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">External Resources</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} disabled={isLoading} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreate}
            size="small"
          >
            Add Resource
          </Button>
        </Box>
      </Box>

      {error && (
        <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2">{error}</Typography>
            <IconButton onClick={handleRefresh} disabled={isLoading} size="small" sx={{ color: 'inherit', ml: 1 }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Box>
        </Paper>
      )}

      {isLoading && !resources.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <List>
          {resources.map((resource) => (
            <ListItem
              key={resource.id}
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
                '&:hover': { bgcolor: 'action.hover' },
              }}
              secondaryAction={
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Tooltip title="Open">
                    <IconButton
                      edge="end"
                      size="small"
                      onClick={() => window.open(resource.url, '_blank', 'noopener,noreferrer')}
                    >
                      <OpenInNewIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton edge="end" size="small" onClick={() => handleOpenEdit(resource)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete">
                    <IconButton edge="end" size="small" onClick={() => handleDelete(resource.id)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            >
              <LinkIcon sx={{ mr: 2, color: 'text.secondary' }} />
              <ListItemText
                primary={resource.title}
                secondary={resource.url}
              />
            </ListItem>
          ))}
          {!resources.length && !isLoading && !error && (
            <Box sx={{ p: 2 }}>
              <Typography variant="body2" color="text.secondary">
                No resources yet. Add links to project briefs, specs, and external docs here.
              </Typography>
            </Box>
          )}
        </List>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode === 'create' ? 'Add Resource' : 'Edit Resource'}</DialogTitle>
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
            label="URL"
            fullWidth
            variant="outlined"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/doc"
            error={!!url && !isValidUrl(url)}
            helperText={url && !isValidUrl(url) ? 'Enter a valid URL (including http/https)' : ' '}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!title.trim() || !url.trim() || !isValidUrl(url) || isLoading}
          >
            {editMode === 'create' ? 'Add' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

