import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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

// Safe wrapper hooks that can be called unconditionally
function useSafeFigma() {
  try {
    const figmaModule = require('../../../hooks/useFigma');
    const useFigma = figmaModule.useFigma || figmaModule.default?.useFigma;
    if (useFigma) {
      return useFigma();
    }
  } catch (err) {
    // Hook not available or failed - return safe defaults
  }
  // Return safe defaults when hook is not available
  return {
    files: [],
    components: [],
    tokens: [],
    componentStatuses: {},
    isLoading: false,
    error: null,
    fetchFiles: () => Promise.resolve(),
    fetchComponents: () => Promise.resolve(),
    likeComponent: () => Promise.resolve(),
    saveComponent: () => Promise.resolve(),
  };
}

function useSafeMCP() {
  try {
    const mcpModule = require('../../../hooks/useMCP');
    const useMCP = mcpModule.useMCP || mcpModule.default?.useMCP;
    if (useMCP) {
      return useMCP();
    }
  } catch (err) {
    // Hook not available or failed - return safe defaults
  }
  // Return safe defaults when hook is not available
  return {
    links: [],
    tokens: [],
    isLoading: false,
    error: null,
    fetchCodeLinks: () => Promise.resolve(),
    linkComponentToCode: () => Promise.resolve(),
  };
}

export default function DesignFigmaPanel() {
  const { user } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState(0);
  
  // Generate a default board ID for the design space - memoized
  const defaultBoardId = useMemo(() => `design_${user?.id || 'shared'}`, [user?.id]);
  
  // Always call hooks at top level - they return safe defaults if not available
  const figmaHook = useSafeFigma();
  const mcpHook = useSafeMCP();
  
  // Memoize hook values to prevent unnecessary re-renders
  const files = useMemo(() => figmaHook?.files || [], [figmaHook?.files]);
  const components = useMemo(() => figmaHook?.components || [], [figmaHook?.components]);
  const componentStatuses = useMemo(() => figmaHook?.componentStatuses || {}, [figmaHook?.componentStatuses]);
  const figmaLoading = figmaHook?.isLoading || false;
  const figmaErrorMsg = figmaHook?.error || null;
  
  // Memoize functions to prevent dependency issues
  const fetchFiles = useCallback(() => {
    return figmaHook?.fetchFiles ? figmaHook.fetchFiles() : Promise.resolve();
  }, [figmaHook?.fetchFiles]);
  
  const fetchComponents = useCallback((fileKey: string) => {
    return figmaHook?.fetchComponents ? figmaHook.fetchComponents(fileKey) : Promise.resolve();
  }, [figmaHook?.fetchComponents]);
  
  const likeComponent = useCallback((componentId: string, liked: boolean, fileKey?: string) => {
    return figmaHook?.likeComponent ? figmaHook.likeComponent(componentId, liked, fileKey) : Promise.resolve();
  }, [figmaHook?.likeComponent]);
  
  const saveComponent = useCallback((componentId: string, saved: boolean, fileKey?: string) => {
    return figmaHook?.saveComponent ? figmaHook.saveComponent(componentId, saved, fileKey) : Promise.resolve();
  }, [figmaHook?.saveComponent]);
  
  const fetchCodeLinks = useCallback(() => {
    return mcpHook?.fetchCodeLinks ? mcpHook.fetchCodeLinks() : Promise.resolve();
  }, [mcpHook?.fetchCodeLinks]);
  
  const linkComponentToCode = useCallback((componentId: string, filePath: string, componentName: string, fileKey: string) => {
    return mcpHook?.linkComponentToCode ? mcpHook.linkComponentToCode(componentId, filePath, componentName, fileKey) : Promise.resolve();
  }, [mcpHook?.linkComponentToCode]);

  // Figma state
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [figmaComponentId, setFigmaComponentId] = useState('');
  const [codeFilePath, setCodeFilePath] = useState('');
  const [codeComponentName, setCodeComponentName] = useState('');
  const [loadingComponents, setLoadingComponents] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load Figma data (only if hooks are available) - with proper cleanup
  useEffect(() => {
    // Check if hooks are available by checking if they have the expected methods
    const hooksAvailable = figmaHook?.fetchFiles && mcpHook?.fetchCodeLinks;
    if (!hooksAvailable || isInitialized) return;
    
    let isMounted = true;
    const loadFigmaData = async () => {
      try {
        await Promise.all([
          fetchFiles(),
          fetchCodeLinks(),
        ]);
        if (isMounted) {
          setIsInitialized(true);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error loading Figma data:', err);
        }
      }
    };
    
    loadFigmaData();
    
    return () => {
      isMounted = false;
    };
  }, [fetchFiles, fetchCodeLinks, isInitialized]);

  // Load components when file is selected - with proper cleanup
  useEffect(() => {
    if (!selectedFile || !figmaHook?.fetchComponents) return;
    
    let isMounted = true;
    setLoadingComponents(true);
    
    fetchComponents(selectedFile)
      .then(() => {
        if (!isMounted) return;
        // Components will be updated via hook state
      })
      .catch((err: any) => {
        if (isMounted) {
          console.error('Error fetching components:', err);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoadingComponents(false);
        }
      });
    
    return () => {
      isMounted = false;
    };
  }, [selectedFile, fetchComponents, figmaHook]);

  // Figma handlers - memoized
  const handleRefreshFigma = useCallback(() => {
    if (selectedFile) {
      fetchComponents(selectedFile);
    } else {
      fetchFiles();
    }
  }, [selectedFile, fetchComponents, fetchFiles]);

  const handleLike = useCallback(async (componentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentStatus = componentStatuses[componentId]?.liked || false;
    try {
      await likeComponent(componentId, !currentStatus, selectedFile || undefined);
    } catch (err) {
      console.error('Error liking component:', err);
    }
  }, [componentStatuses, likeComponent, selectedFile]);

  const handleSaveComponent = useCallback(async (componentId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentStatus = componentStatuses[componentId]?.saved || false;
    try {
      await saveComponent(componentId, !currentStatus, selectedFile || undefined);
    } catch (err) {
      console.error('Error saving component:', err);
    }
  }, [componentStatuses, saveComponent, selectedFile]);

  const handleLinkComponent = useCallback(async () => {
    if (!figmaComponentId || !codeFilePath) return;
    
    try {
      await linkComponentToCode(figmaComponentId, codeFilePath, codeComponentName, selectedFile || '');
      setLinkDialogOpen(false);
      fetchCodeLinks();
      // Reset form
      setFigmaComponentId('');
      setCodeFilePath('');
      setCodeComponentName('');
    } catch (err) {
      console.error('Error linking component:', err);
    }
  }, [figmaComponentId, codeFilePath, codeComponentName, selectedFile, linkComponentToCode, fetchCodeLinks]);

  // Memoize component list to prevent unnecessary re-renders
  const componentList = useMemo(() => {
    return components.map((comp: any) => (
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
    ));
  }, [components, componentStatuses, handleLike, handleSaveComponent]);

  // Prevent BoardShell from rendering when not active to improve performance
  const shouldRenderBoard = activeSubTab === 1;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Paper elevation={2} sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" fontWeight={700}>Design & Figma</Typography>
        </Box>
        
        {/* Sub-tabs for Figma and Collaboration Board */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, flexShrink: 0 }}>
          <Tabs value={activeSubTab} onChange={(e, newValue) => setActiveSubTab(newValue)}>
            <Tab icon={<DesignIcon />} iconPosition="start" label="Figma Components" />
            <Tab icon={<BoardIcon />} iconPosition="start" label="Collaboration Board" />
          </Tabs>
        </Box>

        {/* Figma Components Tab */}
        {activeSubTab === 0 && (
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
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
            
            {!figmaHook?.fetchFiles || !mcpHook?.fetchCodeLinks ? (
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
                        {componentList}
                        
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

        {/* Collaboration Board Tab - Only render when active */}
        {shouldRenderBoard && (
          <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 0 }}>
            <Box sx={{ mb: 2, flexShrink: 0 }}>
              <Typography variant="h6" gutterBottom>
                Collaboration Board - {defaultBoardId}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Collaborate, design, and create together with your team in real-time
              </Typography>
            </Box>
            <Box 
              sx={{ 
                flexGrow: 1,
                minHeight: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                bgcolor: 'background.default',
                borderRadius: 1,
              }}
            >
              <Box
                sx={{
                  height: '100%',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '& > div': {
                    height: '100% !important',
                    minHeight: '100% !important',
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
