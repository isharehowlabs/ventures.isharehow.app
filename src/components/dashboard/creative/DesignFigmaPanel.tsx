import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Alert,
  Card,
  CardContent,
  IconButton,
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
  Button,
  TextField,
  Tooltip,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Favorite as FavoriteIcon,
  Bookmark as BookmarkIcon,
  Palette as DesignIcon,
  Gesture as BoardIcon,
} from '@mui/icons-material';
import BoardShell from '../../board/BoardShell';
import { useAuth } from '../../../hooks/useAuth';

// Optional imports for Figma/MCP features
let useFigmaHook: any = null;
let useMCPHook: any = null;
try {
  const figmaModule = require('../../../hooks/useFigma');
  useFigmaHook = figmaModule.useFigma || figmaModule.default?.useFigma;
} catch (err) {
  console.warn('Figma hook not available:', err);
}
try {
  const mcpModule = require('../../../hooks/useMCP');
  useMCPHook = mcpModule.useMCP || mcpModule.default?.useMCP;
} catch (err) {
  console.warn('MCP hook not available:', err);
}

export default function DesignFigmaPanel() {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState(0);
  
  // Generate a default board ID for the design space
  const defaultBoardId = `design_${user?.id || 'shared'}`;
  
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
    <Box>
      <Paper elevation={2} sx={{ p: 3, minHeight: 600, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight={700}>Design & Figma</Typography>
        </Box>
        
        {/* Sub-tabs for Figma and Collaboration Board */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeSubTab} onChange={(e, newValue) => setActiveSubTab(newValue)}>
            <Tab icon={<DesignIcon />} iconPosition="start" label="Figma Components" />
            <Tab icon={<BoardIcon />} iconPosition="start" label="Collaboration Board" />
          </Tabs>
        </Box>

        {/* Figma Components Tab */}
        {activeSubTab === 0 && (
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Figma Integration</Typography>
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
          </Box>
        )}

        {/* Collaboration Board Tab */}
        {activeSubTab === 1 && (
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Collaboration Board - {defaultBoardId}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Collaborate, design, and create together with your team in real-time
              </Typography>
            </Box>
            <Paper 
              elevation={0} 
              sx={{ 
                flexGrow: 1,
                p: 0, 
                minHeight: 600, 
                height: 'calc(100vh - 300px)', 
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                bgcolor: 'background.default',
              }}
            >
              <Box 
                sx={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: '100%',
                  width: '100%',
                }}
              >
                <Box
                  sx={{
                    height: '100%',
                    width: '100%',
                    '& > div': {
                      height: '100% !important',
                    },
                  }}
                >
                  <BoardShell
                    boardId={defaultBoardId}
                    userId={user?.id?.toString() || 'anonymous'}
                    userName={user?.name || user?.email || 'Anonymous User'}
                  />
                </Box>
              </Box>
            </Paper>
          </Box>
        )}
      </Paper>

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

