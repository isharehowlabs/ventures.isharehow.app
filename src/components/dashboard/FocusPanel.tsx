import { Box, Typography, Paper } from '@mui/material';
import PomodoroTimer from '../shared/PomodoroTimer';

export default function FocusPanel() {
  return (
    <Box
      sx={{
        p: { xs: 1, sm: 2 },
        height: '100%',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 1, sm: 2 },
        minHeight: 0,
      }}
    >
      <Paper sx={{ p: { xs: 2, sm: 3 }, flexShrink: 0 }}>
        <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
          Focus Timer
        </Typography>
        <PomodoroTimer location="cowork" />
      </Paper>
    </Box>
  );
}