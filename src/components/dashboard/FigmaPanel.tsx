import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
} from '@mui/material';
import { Refresh as RefreshIcon, Link as LinkIcon, Code as CodeIcon, Favorite as FavoriteIcon, FavoriteBorder as FavoriteBorderIcon, Bookmark as BookmarkIcon, BookmarkBorder as BookmarkBorderIcon, Edit as EditIcon, EditOutlined as EditOutlinedIcon } from '@mui/icons-material';
import { useFigma, FigmaComponent } from '../../hooks/useFigma';
import { useMCP } from '../../hooks/useMCP';

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

export default function FigmaPanel() {
  const { 
    files, 
    components, 
    tokens: figmaTokens, 
    likedComponents,
    savedComponents,
    draftedComponents,
    componentStatuses,
    isLoading: figmaLoading, 
    error: figmaError, 
    fetchFiles, 
    fetchComponents, 
    fetchTokens,
    likeComponent,
    saveComponent,
    draftComponent,
    fetchLikedComponents,
    fetchSavedComponents,
    fetchDraftedComponents,
    fetchComponentStatus,
    fetchComponentPreferences,
  } = useFigma();
  const { links, tokens: mcpTokens, isLoading: mcpLoading, error: mcpError, linkComponentToCode, fetchCodeLinks, fetchTokens: fetchMcpTokens, generateCode } = useMCP();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState<string>('');
  const [figmaComponentId, setFigmaComponentId] = useState('');
  const [selectedComponent, setSelectedComponent] = useState<any>(null);
  const [codeFilePath, setCodeFilePath] = useState('');
  const [codeComponentName, setCodeComponentName] = useState('');
  const [selectedLink, setSelectedLink] = useState<any>(null);
  const [loadingComponents, setLoadingComponents] = useState(false);

  useEffect(() => {
    const loadData = async () => {
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
        console.error('Error loading data:', err);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (selectedFile) {
      setLoadingComponents(true);
      Promise.all([
        fetchComponents(selectedFile).then(async (comps) => {
          // Fetch status for each component
          if (comps && comps.length > 0) {
            await Promise.all(comps.map((comp: FigmaComponent) => fetchComponentStatus(comp.key)));
          }
        }).catch((err) => {
          console.error('Error fetching components:', err);
        }),
        fetchTokens(selectedFile).catch((err) => {
          console.error('Error fetching tokens:', err);
        })
      ]).finally(() => {
        setLoadingComponents(false);
      });
    }
  }, [selectedFile]);

  useEffect(() => {
    if (selectedFileId && linkDialogOpen) {
      setLoadingComponents(true);
      fetchComponents(selectedFileId)
        .catch((err) => {
          console.error('Error fetching components:', err);
        })
        .finally(() => {
          setLoadingComponents(false);
        });
    }
  }, [selectedFileId, linkDialogOpen]);

  const handleFileSelect = async (fileId: string) => {
    if (!fileId || typeof fileId !== 'string' || fileId.trim() === '' || fileId === 'undefined' || fileId === 'null') {
      console.error('Invalid file ID provided:', fileId);
      return;
    }
    
    const validFileId = fileId.trim();
    setSelectedFile(validFileId);
  };

  const handleRefresh = async () => {
    setSelectedFile(null);
    try {
      await Promise.all([
        fetchFiles(),
        fetchCodeLinks(),
        fetchMcpTokens(),
      ]);
    } catch (err) {
      console.error('Error refreshing:', err);
    }
  };

  const handleLink = async () => {
    try {
      await linkComponentToCode(figmaComponentId, codeFilePath, codeComponentName, selectedFileId || selectedFile || undefined);
      setLinkDialogOpen(false);
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
    if (!codeComponentName) {
      setCodeComponentName(component.name || '');
    }
  };

  const handleOpenLinkDialog = () => {
    setLinkDialogOpen(true);
    setSelectedFileId(selectedFile || '');
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

  const isLoading = figmaLoading || mcpLoading || loadingComponents;
  const error = figmaError || mcpError;

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Figma Designs & Code Handoff</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} disabled={isLoading} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<LinkIcon />}
            onClick={handleOpenLinkDialog}
            size="small"
            disabled={isLoading}
          >
            Link Component
          </Button>
        </Box>
      </Box>

      {error && (
        <Paper sx={{ p: 2, m: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography variant="body2">
            {error.includes('401') || error.includes('Authentication') 
              ? 'Authentication required. Click refresh to retry.'
              : error}
          </Typography>
        </Paper>
      )}

      <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Files Sidebar */}
        <Box sx={{ width: 250, borderRight: 1, borderColor: 'divider', overflow: 'auto' }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Files
            </Typography>
            {isLoading && !selectedFile ? (
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
                      onClick={() => {
                        if (file?.id) {
                          handleFileSelect(file.id);
                        }
                      }}
                    >
                      <ListItemText primary={file.name || 'Unnamed file'} />
                    </ListItem>
                  ))}
              </List>
            )}
          </Box>
        </Box>

        {/* Main Content Area */}
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {selectedFile ? (
            <>
              <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
                <Tab label="Components" />
                <Tab label="Liked" />
                <Tab label="Saved" />
                <Tab label="Drafts" />
                <Tab label="Design Tokens" />
                <Tab label="Code Links" />
              </Tabs>
              <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                {/* Components Tab */}
                <TabPanel value={tabValue} index={0}>
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
                                    sx={{ color: isLiked ? 'error.main' : 'text.secondary' }}
                                  >
                                    {isLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title={isSaved ? 'Remove from saved' : 'Save'}>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => handleSave(component.key, e)}
                                    sx={{ color: isSaved ? 'primary.main' : 'text.secondary' }}
                                  >
                                    {isSaved ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title={isDrafted ? 'Remove from drafts' : 'Add to drafts'}>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => handleDraft(component.key, e)}
                                    sx={{ color: isDrafted ? 'warning.main' : 'text.secondary' }}
                                  >
                                    {isDrafted ? <EditIcon fontSize="small" /> : <EditOutlinedIcon fontSize="small" />}
                                  </IconButton>
                                </Tooltip>
                                {isLinked ? (
                                  <Button
                                    size="small"
                                    startIcon={<CodeIcon />}
                                    onClick={() => handleGenerateCode(component.key)}
                                  >
                                    Generate Code
                                  </Button>
                                ) : (
                                  <Chip label="Not Linked" size="small" variant="outlined" />
                                )}
                              </Box>
                            }
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
                      {components.length === 0 && (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            No components found in this file
                          </Typography>
                        </Box>
                      )}
                    </List>
                  )}
                </TabPanel>

                {/* Liked Components Tab */}
                <TabPanel value={tabValue} index={1}>
                  {loadingComponents ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <List>
                      {getFilteredComponents('liked').map((component) => {
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
                                    sx={{ color: isLiked ? 'error.main' : 'text.secondary' }}
                                  >
                                    {isLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title={isSaved ? 'Remove from saved' : 'Save'}>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => handleSave(component.key, e)}
                                    sx={{ color: isSaved ? 'primary.main' : 'text.secondary' }}
                                  >
                                    {isSaved ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title={isDrafted ? 'Remove from drafts' : 'Add to drafts'}>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => handleDraft(component.key, e)}
                                    sx={{ color: isDrafted ? 'warning.main' : 'text.secondary' }}
                                  >
                                    {isDrafted ? <EditIcon fontSize="small" /> : <EditOutlinedIcon fontSize="small" />}
                                  </IconButton>
                                </Tooltip>
                                {isLinked && (
                                  <Button
                                    size="small"
                                    startIcon={<CodeIcon />}
                                    onClick={() => handleGenerateCode(component.key)}
                                  >
                                    Generate Code
                                  </Button>
                                )}
                              </Box>
                            }
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
                      {getFilteredComponents('liked').length === 0 && (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            No liked components yet. Like components from the Components tab.
                          </Typography>
                        </Box>
                      )}
                    </List>
                  )}
                </TabPanel>

                {/* Saved Components Tab */}
                <TabPanel value={tabValue} index={2}>
                  {loadingComponents ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <List>
                      {getFilteredComponents('saved').map((component) => {
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
                                    sx={{ color: isLiked ? 'error.main' : 'text.secondary' }}
                                  >
                                    {isLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title={isSaved ? 'Remove from saved' : 'Save'}>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => handleSave(component.key, e)}
                                    sx={{ color: isSaved ? 'primary.main' : 'text.secondary' }}
                                  >
                                    {isSaved ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title={isDrafted ? 'Remove from drafts' : 'Add to drafts'}>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => handleDraft(component.key, e)}
                                    sx={{ color: isDrafted ? 'warning.main' : 'text.secondary' }}
                                  >
                                    {isDrafted ? <EditIcon fontSize="small" /> : <EditOutlinedIcon fontSize="small" />}
                                  </IconButton>
                                </Tooltip>
                                {isLinked && (
                                  <Button
                                    size="small"
                                    startIcon={<CodeIcon />}
                                    onClick={() => handleGenerateCode(component.key)}
                                  >
                                    Generate Code
                                  </Button>
                                )}
                              </Box>
                            }
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
                      {getFilteredComponents('saved').length === 0 && (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            No saved components yet. Save components from the Components tab.
                          </Typography>
                        </Box>
                      )}
                    </List>
                  )}
                </TabPanel>

                {/* Drafted Components Tab */}
                <TabPanel value={tabValue} index={3}>
                  {loadingComponents ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <List>
                      {getFilteredComponents('drafted').map((component) => {
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
                                    sx={{ color: isLiked ? 'error.main' : 'text.secondary' }}
                                  >
                                    {isLiked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title={isSaved ? 'Remove from saved' : 'Save'}>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => handleSave(component.key, e)}
                                    sx={{ color: isSaved ? 'primary.main' : 'text.secondary' }}
                                  >
                                    {isSaved ? <BookmarkIcon fontSize="small" /> : <BookmarkBorderIcon fontSize="small" />}
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title={isDrafted ? 'Remove from drafts' : 'Add to drafts'}>
                                  <IconButton
                                    size="small"
                                    onClick={(e) => handleDraft(component.key, e)}
                                    sx={{ color: isDrafted ? 'warning.main' : 'text.secondary' }}
                                  >
                                    {isDrafted ? <EditIcon fontSize="small" /> : <EditOutlinedIcon fontSize="small" />}
                                  </IconButton>
                                </Tooltip>
                                {isLinked && (
                                  <Button
                                    size="small"
                                    startIcon={<CodeIcon />}
                                    onClick={() => handleGenerateCode(component.key)}
                                  >
                                    Generate Code
                                  </Button>
                                )}
                              </Box>
                            }
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
                      {getFilteredComponents('drafted').length === 0 && (
                        <Box sx={{ p: 4, textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            No drafted components yet. Add components to drafts from the Components tab.
                          </Typography>
                        </Box>
                      )}
                    </List>
                  )}
                </TabPanel>

                {/* Design Tokens Tab */}
                <TabPanel value={tabValue} index={4}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {figmaTokens.map((token) => (
                      <Chip
                        key={token.id}
                        label={token.name}
                        variant="outlined"
                        sx={{ mb: 1 }}
                      />
                    ))}
                  </Box>
                </TabPanel>

                {/* Code Links Tab */}
                <TabPanel value={tabValue} index={5}>
                  {links.length === 0 ? (
                    <Box sx={{ p: 4, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        No component links yet. Click "Link Component" to create one.
                      </Typography>
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
                </TabPanel>
              </Box>
            </>
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Select a file to view components and tokens
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Generated Code Display */}
      {selectedLink && (
        <Paper sx={{ p: 2, m: 2, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle2">Generated Code</Typography>
            <Button size="small" onClick={() => setSelectedLink(null)}>Close</Button>
          </Box>
          <Box
            component="pre"
            sx={{
              p: 2,
              bgcolor: 'background.default',
              borderRadius: 1,
              overflow: 'auto',
              fontSize: '0.875rem',
              maxHeight: 300,
            }}
          >
            {selectedLink.code}
          </Box>
        </Paper>
      )}

      {/* Link Component Dialog */}
      <Dialog open={linkDialogOpen} onClose={() => setLinkDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Link Figma Component to Code</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
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
                  <Paper variant="outlined" sx={{ maxHeight: 200, overflow: 'auto', p: 1 }}>
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
                              <Chip label="Linked" size="small" color="success" sx={{ ml: 1 }} />
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
          <Button onClick={() => setLinkDialogOpen(false)}>Cancel</Button>
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
