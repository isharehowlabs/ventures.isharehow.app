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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
} from '@mui/material';
import { Link as LinkIcon, Code as CodeIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { useMCP } from '../../hooks/useMCP';
import { useFigma } from '../../hooks/useFigma';

export default function CodeHandoffPanel() {
  const { links, tokens, isLoading, error, linkComponentToCode, fetchCodeLinks, fetchTokens, generateCode } = useMCP();
  const { files, components, fetchFiles, fetchComponents } = useFigma();
  const [open, setOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string>('');
  const [figmaComponentId, setFigmaComponentId] = useState('');
  const [selectedComponent, setSelectedComponent] = useState<any>(null);
  const [codeFilePath, setCodeFilePath] = useState('');
  const [codeComponentName, setCodeComponentName] = useState('');
  const [selectedLink, setSelectedLink] = useState<any>(null);
  const [loadingComponents, setLoadingComponents] = useState(false);

  useEffect(() => {
    fetchCodeLinks();
    fetchTokens();
    fetchFiles();
  }, []);

  useEffect(() => {
    if (selectedFileId) {
      setLoadingComponents(true);
      fetchComponents(selectedFileId)
        .catch((err) => {
          console.error('Error fetching components:', err);
        })
        .finally(() => {
          setLoadingComponents(false);
        });
    }
  }, [selectedFileId]);

  const handleLink = async () => {
    try {
      await linkComponentToCode(figmaComponentId, codeFilePath, codeComponentName, selectedFileId);
      setOpen(false);
      setFigmaComponentId('');
      setSelectedFileId('');
      setSelectedComponent(null);
      setCodeFilePath('');
      setCodeComponentName('');
      await fetchCodeLinks();
    } catch (err) {
      console.error('Error linking:', err);
    }
  };

  const handleComponentSelect = (component: any) => {
    setSelectedComponent(component);
    setFigmaComponentId(component.key);
    // Auto-fill component name if not already set
    if (!codeComponentName) {
      setCodeComponentName(component.name || '');
    }
  };

  const handleOpenDialog = () => {
    setOpen(true);
    // Reset state when opening
    setSelectedFileId('');
    setFigmaComponentId('');
    setSelectedComponent(null);
    setCodeFilePath('');
    setCodeComponentName('');
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
            onClick={handleOpenDialog}
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

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Link Figma Component to Code</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            {/* File Selection */}
            <FormControl fullWidth>
              <InputLabel>Select Figma File</InputLabel>
              <Select
                value={selectedFileId}
                label="Select Figma File"
                onChange={(e) => setSelectedFileId(e.target.value)}
                disabled={isLoading || loadingComponents}
              >
                {files.map((file) => (
                  <MenuItem key={file.id} value={file.id}>
                    {file.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Component Selection */}
            {selectedFileId && (
              <>
                <Divider />
                <Typography variant="subtitle2" color="text.secondary">
                  Available Components ({components.length})
                </Typography>
                {loadingComponents ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : components.length > 0 ? (
                  <Paper
                    variant="outlined"
                    sx={{
                      maxHeight: 200,
                      overflow: 'auto',
                      p: 1,
                    }}
                  >
                    <List dense>
                      {components.map((component) => {
                        const isLinked = links.some((link) => link.componentId === component.key);
                        return (
                          <ListItem
                            key={component.key}
                            button
                            selected={selectedComponent?.key === component.key}
                            onClick={() => handleComponentSelect(component)}
                            sx={{
                              bgcolor: selectedComponent?.key === component.key ? 'action.selected' : undefined,
                              borderRadius: 1,
                              mb: 0.5,
                            }}
                          >
                            <ListItemText
                              primary={component.name}
                              secondary={component.description || `ID: ${component.key}`}
                            />
                            {isLinked && (
                              <Chip
                                label="Linked"
                                size="small"
                                color="success"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </ListItem>
                        );
                      })}
                    </List>
                  </Paper>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
                    No components found in this file
                  </Typography>
                )}
              </>
            )}

            {/* Manual Component ID (fallback) */}
            <Divider />
            <TextField
              margin="dense"
              label="Figma Component ID (or select from list above)"
              fullWidth
              variant="outlined"
              value={figmaComponentId}
              onChange={(e) => setFigmaComponentId(e.target.value)}
              placeholder="Component key from Figma"
              helperText={selectedComponent ? `Selected: ${selectedComponent.name}` : 'Select a component above or enter manually'}
            />

            {/* Code File Path */}
            <TextField
              margin="dense"
              label="Code File Path"
              fullWidth
              variant="outlined"
              value={codeFilePath}
              onChange={(e) => setCodeFilePath(e.target.value)}
              placeholder="src/components/Button.tsx"
              required
            />

            {/* Component Name */}
            <TextField
              margin="dense"
              label="Component Name"
              fullWidth
              variant="outlined"
              value={codeComponentName}
              onChange={(e) => setCodeComponentName(e.target.value)}
              placeholder="Button"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            onClick={handleLink}
            variant="contained"
            disabled={!figmaComponentId || !codeFilePath || !codeComponentName || isLoading || loadingComponents}
          >
            Link
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
