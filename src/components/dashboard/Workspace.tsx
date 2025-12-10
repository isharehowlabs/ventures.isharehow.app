'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import BoardShell from '../board/BoardShell';
import TasksPanel from './shared/TasksPanel';
import { getBackendUrl } from '../../utils/backendUrl';
import { useAuth } from '../../hooks/useAuth';

export default function Workspace() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [iframeError, setIframeError] = useState<string | null>(null);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [hyperbeamUrl, setHyperbeamUrl] = useState<string | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  
  // Generate a default board ID for the co-work space
  const defaultBoardId = `cowork_${user?.id || 'shared'}`;
  
  // Only create Hyperbeam session when browser tab is active
  useEffect(() => {
    if (activeTab !== 1) return; // Only load when browser tab is selected
    
    const createHyperbeamSession = async () => {
      try {
        setSessionLoading(true);
        const backendUrl = getBackendUrl();
        const parent = typeof window !== 'undefined' ? window.location.hostname : '';
        
        const response = await fetch(`${backendUrl}/api/hyperbeam/create-session`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ parent }),
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success && data.embedUrl) {
          setHyperbeamUrl(data.embedUrl);
          setIframeError(null);
        } else {
          throw new Error(data.error || 'Failed to get Hyperbeam session URL');
        }
      } catch (error: any) {
        console.error('Error creating Hyperbeam session:', error);
        setIframeError(error.message || 'Failed to create Hyperbeam session. Please try refreshing the page.');
      } finally {
        setSessionLoading(false);
      }
    };
    
    createHyperbeamSession();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 1) return; // Only set timeout when browser tab is active
    
    // Set a timeout to detect if iframe fails to load
    const timeout = setTimeout(() => {
      if (iframeLoading) {
        setIframeError('Hyperbeam session is taking longer than expected to load. Please check your connection or try refreshing the page.');
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [iframeLoading, activeTab]);

  return (
    <Box sx={{ width: '100%' }}>
      {/* Tabs to separate Board and Browser */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Collaboration Board" />
          <Tab label="Browser Session" />
        </Tabs>
      </Box>

      {/* Tasks Section - Always visible */}
      <Box sx={{ mb: 3 }}>
        <TasksPanel height={400} />
      </Box>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Paper 
          elevation={2} 
          sx={{ 
            p: 0, 
            minHeight: 700, 
            height: 'calc(100vh - 400px)', 
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
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
      )}

      {activeTab === 1 && (
        <Paper elevation={2} sx={{ p: 3, minHeight: 700, height: 'calc(100vh - 400px)', display: 'flex', flexDirection: 'column' }}>
          <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>
            Hyperbeam Session
          </Typography>
          <Box
            sx={{
              flex: 1,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2,
              overflow: 'hidden',
              bgcolor: 'background.paper',
              minHeight: 650,
              position: 'relative',
            }}
          >
            {iframeError && (
              <Alert severity="warning" sx={{ m: 2 }}>
                {iframeError}
              </Alert>
            )}
            {(sessionLoading || iframeLoading) && !iframeError && (
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <CircularProgress />
                <Typography variant="body2" color="text.secondary">
                  {sessionLoading ? 'Creating Hyperbeam session...' : 'Loading session...'}
                </Typography>
              </Box>
            )}
            {hyperbeamUrl && !sessionLoading && (
              <iframe
                title="Hyperbeam Session"
                src={hyperbeamUrl}
                width="100%"
                height="100%"
                style={{ 
                  border: 'none', 
                  minHeight: 650,
                  display: 'block',
                  opacity: iframeLoading ? 0 : 1,
                  transition: 'opacity 0.3s',
                }}
                allowFullScreen
                allow="clipboard-read; clipboard-write; display-capture; microphone; camera; autoplay; fullscreen; geolocation; payment; usb; vr"
                referrerPolicy="no-referrer-when-downgrade"
                loading="lazy"
                onLoad={() => {
                  setIframeLoading(false);
                  setIframeError(null);
                }}
                onError={() => {
                  setIframeLoading(false);
                  setIframeError('Failed to load Hyperbeam session. The session may have expired or the URL is invalid.');
                }}
              />
            )}
          </Box>
        </Paper>
      )}
    </Box>
  );
}
