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
} from '@mui/material';
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
    setSelectedFile(fileId);
    await Promise.all([fetchComponents(fileId), fetchTokens(fileId)]);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">Figma Designs</Typography>
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
              <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
                <Typography variant="body2">{error}</Typography>
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
