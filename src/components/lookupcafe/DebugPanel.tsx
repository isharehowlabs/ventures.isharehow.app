import React from 'react';
import { Box, Paper, Typography, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';

interface DebugPanelProps {
  gameRoom: any;
  players: any[];
  socketId: string;
  isConnected: boolean;
}

export default function DebugPanel({ gameRoom, players, socketId, isConnected }: DebugPanelProps) {
  if (process.env.NODE_ENV === 'production') return null;

  return (
    <Box sx={{ position: 'fixed', bottom: 80, left: 16, zIndex: 1000, maxWidth: 400 }}>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="caption">🐛 Debug Info</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
            <Typography variant="caption" display="block" fontWeight="bold">Socket:</Typography>
            <Typography variant="caption" display="block">Connected: {isConnected ? '✅' : '❌'}</Typography>
            <Typography variant="caption" display="block">ID: {socketId}</Typography>
            
            <Typography variant="caption" display="block" fontWeight="bold" mt={1}>Game Room:</Typography>
            <Typography variant="caption" display="block">Code: {gameRoom?.roomCode}</Typography>
            <Typography variant="caption" display="block">State: {gameRoom?.state}</Typography>
            <Typography variant="caption" display="block">Type: {gameRoom?.gameType}</Typography>
            <Typography variant="caption" display="block">Round: {gameRoom?.currentRound}/{gameRoom?.maxRounds}</Typography>
            <Typography variant="caption" display="block">Phase: {(gameRoom as any)?.roundPhase || 'undefined'}</Typography>
            
            <Typography variant="caption" display="block" fontWeight="bold" mt={1}>Players: {players.length}</Typography>
            {players.map((p, i) => (
              <Typography key={i} variant="caption" display="block">
                {p.name} ({p.isHost ? 'Host' : 'Player'}) - {p.score}pts
              </Typography>
            ))}
            
            <Typography variant="caption" display="block" fontWeight="bold" mt={1}>Game Data:</Typography>
            <Typography variant="caption" display="block" sx={{ wordBreak: 'break-all' }}>
              {JSON.stringify((gameRoom as any)?.guesses || {}).substring(0, 100)}
            </Typography>
          </Box>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
