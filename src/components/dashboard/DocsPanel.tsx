import { useState, useEffect } from 'react';
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
import { Add as AddIcon, Description as DescriptionIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useGoogleDocs } from '../../hooks/useGoogleDocs';

export default function DocsPanel() {
  const { docs, isLoading, error, createDoc, getDoc, fetchDocs } = useGoogleDocs();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<any>(null);

  const handleRefresh = () => {
    fetchDocs();
  };

  const handleCreate = async () => {
    try {
      await createDoc(title, content);
      setOpen(false);
      setTitle('');
      setContent('');
    } catch (err) {
      console.error('Error creating doc:', err);
    }
  };

  const handleSelectDoc = async (docId: string) => {
    try {
      const doc = await getDoc(docId);
      setSelectedDoc(doc);
    } catch (err) {
      console.error('Error fetching doc:', err);
    }
  };

  return (
    <Box sx={{ p: 2, height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Google Docs</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} disabled={isLoading} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
            size="small"
          >
            New Doc
          </Button>
        </Box>
      </Box>

      {error && (
        <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2">{error}</Typography>
            <IconButton onClick={handleRefresh} disabled={isLoading} size="small" sx={{ color: 'inherit', ml: 1 }}>
              <RefreshIcon fontSize="small" />
            </IconButton>
          </Box>
        </Paper>
      )}

      {isLoading && !docs.length ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <List>
          {docs.map((doc) => (
            <ListItem
              key={doc.id}
              button
              onClick={() => handleSelectDoc(doc.id)}
              sx={{
                border: 1,
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
                '&:hover': { bgcolor: 'action.hover' },
              }}
            >
              <DescriptionIcon sx={{ mr: 2, color: 'text.secondary' }} />
              <ListItemText
                primary={doc.name}
                secondary={doc.modifiedTime ? new Date(doc.modifiedTime).toLocaleDateString() : ''}
              />
            </ListItem>
          ))}
        </List>
      )}

      {selectedDoc && (
        <Paper sx={{ p: 2, mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">{selectedDoc.title}</Typography>
            <IconButton size="small" onClick={() => setSelectedDoc(null)}>
              ✕
            </IconButton>
          </Box>
          <Box
            sx={{
              maxHeight: 400,
              overflow: 'auto',
              p: 2,
              bgcolor: 'background.default',
              borderRadius: 1,
            }}
          >
            {selectedDoc.body?.content?.map((item: any, index: number) => (
              <Typography key={index} variant="body2">
                {item.paragraph?.elements?.map((el: any, i: number) => el.textRun?.content || '').join('')}
              </Typography>
            ))}
          </Box>
        </Paper>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Document</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Document Title"
            fullWidth
            variant="outlined"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Content (optional)"
            fullWidth
            multiline
            rows={6}
            variant="outlined"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleCreate} variant="contained" disabled={!title.trim() || isLoading}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
