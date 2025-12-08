'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import CollaborativeDrawingPad from './CollaborativeDrawingPad';
import TasksPanel from './shared/TasksPanel';

export default function Workspace() {
  // Hyperbeam embed configuration
  const baseUrl = "https://5e3drln9et7g5dz9zi8h2nkly.hyperbeam.com/Z_1SrobgS76pKHX6GaLkTw";
  const token = "jASHNMS1E1pYOup41Jv4ntGDMXZCot_r94XOGkTPD0Q";
  const HYPERBEAM_SESSION_ID = "67fd52ae-86e0-4bbe-a928-75fa19a2e44f";
  const HYPERBEAM_ADMIN_TOKEN = "PYVxXA9Uiee8teWDEhZ_I2X3z6Tht7HHrxC6zec7tqM";
  
  const [iframeError, setIframeError] = useState<string | null>(null);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [hyperbeamUrl, setHyperbeamUrl] = useState<string>(`${baseUrl}?token=${token}`);
  
  // Update URL with parent domain once component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const parent = window.location.hostname;
      setHyperbeamUrl(`${baseUrl}?token=${token}&parent=${parent}`);
    }
  }, []);

  useEffect(() => {
    // Set a timeout to detect if iframe fails to load
    const timeout = setTimeout(() => {
      if (iframeLoading) {
        setIframeError('Hyperbeam session is taking longer than expected to load. Please check your connection or try refreshing the page.');
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timeout);
  }, [iframeLoading]);

  return (
    <Box sx={{ width: '100%' }}>
      <Grid container spacing={3}>
        
        {/* Collaborative Drawing Pad */}
        <Grid item xs={12} lg={6}>
          <CollaborativeDrawingPad height={500} />
        </Grid>
        
        {/* Tasks Section */}
        <Grid item xs={12} lg={6}>
          <TasksPanel height={500} />
        </Grid>

        {/* Hyperbeam Embed */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3, minHeight: 800, height: 'calc(100vh - 300px)', display: 'flex', flexDirection: 'column' }}>
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
                minHeight: 750,
                position: 'relative',
              }}
            >
              {iframeError && (
                <Alert severity="warning" sx={{ m: 2 }}>
                  {iframeError}
                </Alert>
              )}
              {iframeLoading && !iframeError && (
                <Box
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1,
                  }}
                >
                  <CircularProgress />
                </Box>
              )}
              <iframe
                title="Hyperbeam Session"
                src={hyperbeamUrl}
                width="100%"
                height="100%"
                style={{ 
                  border: 'none', 
                  minHeight: 750,
                  display: 'block',
                  opacity: iframeLoading ? 0 : 1,
                  transition: 'opacity 0.3s',
                }}
                allowFullScreen
                allow="clipboard-read; clipboard-write; display-capture; microphone; camera; autoplay; fullscreen; geolocation; payment; usb; vr"
                referrerPolicy="no-referrer-when-downgrade"
                loading="eager"
                onLoad={() => {
                  setIframeLoading(false);
                  setIframeError(null);
                }}
                onError={() => {
                  setIframeLoading(false);
                  setIframeError('Failed to load Hyperbeam session. The session may have expired or the URL is invalid.');
                }}
              />
            </Box>
          </Paper>
        </Grid>

      </Grid>
    </Box>
  );
}
