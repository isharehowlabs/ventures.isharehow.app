import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { Box, CircularProgress, Typography } from '@mui/material';

export default function LiveRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to /labs
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
        Redirecting to Labs...
      </Typography>
    </Box>
  );
}

