import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Link as LinkIcon, Code as CodeIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useMCP } from '../../hooks/useMCP';

export default function CodeHandoffPanel() {
  const { links, tokens, isLoading, error, linkComponentToCode, fetchCodeLinks, fetchTokens, generateCode } = useMCP();
  const [open, setOpen] = useState(false);
  const [figmaComponentId, setFigmaComponentId] = useState('');
  const [codeFilePath, setCodeFilePath] = useState('');
  const [codeComponentName, setCodeComponentName] = useState('');
  const [selectedLink, setSelectedLink] = useState<any>(null);

  useEffect(() => {
    fetchCodeLinks();
    fetchTokens();
  }, []);

  const handleLink = async () => {
    try {
      await linkComponentToCode(figmaComponentId, codeFilePath, codeComponentName);
      setOpen(false);
      setFigmaComponentId('');
      setCodeFilePath('');
      setCodeComponentName('');
    } catch (err) {
      console.error('Error linking:', err);
    }
  };

  const handleGenerateCode = async (componentId: string) => {
    try {
      const snippet = await generateCode(componentId);
      setSelectedLink(snippet);
    } catch (err) {
      console.error('Error generating code:', err);
    }
  };

  const handleRefresh = () => {
    fetchCodeLinks();
    fetchTokens();
  };

  return (
    <Box sx={{ p: 2, height: '100%', overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Code Handoff</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} disabled={isLoading} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<LinkIcon />}
            onClick={() => setOpen(true)}
            size="small"
          >
            Link Component
          </Button>
        </Box>
      </Box>

      {error && (
        <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography variant="body2">{error}</Typography>
        </Paper>
      )}

      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle2" gutterBottom>
          Design Tokens
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
          {tokens.map((token) => (
            <Chip
              key={token.name}
              label={`${token.name}: ${token.value}`}
              variant="outlined"
              size="small"
            />
          ))}
        </Box>
      </Paper>

      <Paper sx={{ p: 2, flexGrow: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Component Links
        </Typography>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List>
            {links.map((link) => (
              <ListItem
                key={link.componentId}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                }}
                secondaryAction={
                  <Button
                    size="small"
                    startIcon={<CodeIcon />}
                    onClick={() => handleGenerateCode(link.componentId)}
                  >
                    Generate Code
                  </Button>
                }
              >
                <ListItemText
                  primary={link.componentName}
                  secondary={`${link.filePath} → Component: ${link.componentId}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>

      {selectedLink && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Generated Code
          </Typography>
          <Box
            component="pre"
            sx={{
              p: 2,
              bgcolor: 'background.default',
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem',
            }}
          >
            {selectedLink.code}
          </Box>
        </Paper>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Link Figma Component to Code</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Figma Component ID"
            fullWidth
            variant="outlined"
            value={figmaComponentId}
            onChange={(e) => setFigmaComponentId(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Code File Path"
            fullWidth
            variant="outlined"
            value={codeFilePath}
            onChange={(e) => setCodeFilePath(e.target.value)}
            placeholder="src/components/Button.tsx"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Component Name"
            fullWidth
            variant="outlined"
            value={codeComponentName}
            onChange={(e) => setCodeComponentName(e.target.value)}
            placeholder="Button"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleLink}
            variant="contained"
            disabled={!figmaComponentId || !codeFilePath || !codeComponentName || isLoading}
          >
            Link
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
