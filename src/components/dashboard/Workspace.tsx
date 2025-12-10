'use client';

import React from 'react';
import {
  Box,
  Paper,
} from '@mui/material';
import BoardShell from '../board/BoardShell';
import TasksPanel from './shared/TasksPanel';
import { useAuth } from '../../hooks/useAuth';

export default function Workspace() {
  const { user } = useAuth();
  
  // Generate a default board ID for the co-work space
  const defaultBoardId = `cowork_${user?.id || 'shared'}`;

  return (
    <Box sx={{ width: '100%' }}>
      {/* Tasks Section */}
      <Box sx={{ mb: 3 }}>
        <TasksPanel height={400} />
      </Box>

      {/* Collaboration Board */}
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
    </Box>
  );
}
