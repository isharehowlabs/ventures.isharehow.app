import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
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
} from '@mui/material';
import { Refresh as RefreshIcon } from '@mui/icons-material';
import { useFigma } from '../../hooks/useFigma';

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
  const { files, components, tokens, isLoading, error, fetchFiles, fetchComponents, fetchTokens } = useFigma();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleFileSelect = async (fileId: string) => {
    // Validate file ID before making requests
    if (!fileId || fileId.trim() === '' || fileId === 'undefined' || fileId === 'null') {
      console.error('Invalid file ID provided:', fileId);
      return;
    }
    
    setSelectedFile(fileId);
    try {
      await Promise.all([fetchComponents(fileId), fetchTokens(fileId)]);
    } catch (err) {
      // Error is already handled by the hook and will be displayed
      console.error('Error fetching file data:', err);
    }
  };

  const handleRefresh = () => {
    setSelectedFile(null);
    fetchFiles();
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">Figma Designs</Typography>
        <Tooltip title="Refresh">
          <IconButton onClick={handleRefresh} disabled={isLoading} size="small">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Box sx={{ flexGrow: 1, display: 'flex', overflow: 'hidden' }}>
        <Box sx={{ width: 250, borderRight: 1, borderColor: 'divider', overflow: 'auto' }}>
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Files
            </Typography>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : error ? (
              <Paper sx={{ p: 2, bgcolor: 'warning.light', color: 'warning.contrastText' }}>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {error.includes('401') || error.includes('Authentication') 
                    ? 'Authentication required. Click refresh to retry.'
                    : error}
                </Typography>
                {error.includes('401') || error.includes('Authentication') && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    The Figma integration requires authentication. Make sure you're logged in.
                  </Typography>
                )}
                <Box sx={{ mt: 1 }}>
                  <IconButton onClick={handleRefresh} disabled={isLoading} size="small" sx={{ color: 'inherit' }}>
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Paper>
            ) : (
              <List dense>
                {files.map((file) => (
                  <ListItem
                    key={file.id}
                    button
                    selected={selectedFile === file.id}
                    onClick={() => handleFileSelect(file.id)}
                  >
                    <ListItemText primary={file.name} />
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </Box>

        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {selectedFile ? (
            <>
              <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
                <Tab label="Components" />
                <Tab label="Design Tokens" />
              </Tabs>
              <TabPanel value={tabValue} index={0}>
                <List>
                  {components.map((component) => (
                    <ListItem key={component.key}>
                      <ListItemText
                        primary={component.name}
                        secondary={component.description}
                      />
                    </ListItem>
                  ))}
                </List>
              </TabPanel>
              <TabPanel value={tabValue} index={1}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {tokens.map((token) => (
                    <Chip
                      key={token.id}
                      label={token.name}
                      variant="outlined"
                      sx={{ mb: 1 }}
                    />
                  ))}
                </Box>
              </TabPanel>
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
    </Box>
  );
}
