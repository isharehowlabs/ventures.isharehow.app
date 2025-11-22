import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function CoworkRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to /labs (Co-Work Dashboard)
    router.replace('/labs');
  }, [router]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">
        Redirecting to Co-Work Dashboard...
      </Typography>
    </Box>
  );
}
