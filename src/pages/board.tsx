import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
} from '@mui/material';
import BoardShell from '../components/board/BoardShell';
import { useAuth } from '../hooks/useAuth';

export default function BoardPage() {
  const router = useRouter();
  const { boardId: urlBoardId } = router.query;
  const { user } = useAuth();
  
  const [boardId, setBoardId] = useState<string>('');
  const [showBoard, setShowBoard] = useState(false);

  // If boardId is in URL, show board directly
  const activeBoardId = (urlBoardId as string) || boardId;

  const handleJoinBoard = () => {
    if (boardId.trim()) {
      setShowBoard(true);
      // Update URL
      router.push(`/board?boardId=${boardId}`, undefined, { shallow: true });
    }
  };

  const handleCreateBoard = () => {
    const newBoardId = `board_${Date.now()}`;
    setBoardId(newBoardId);
    setShowBoard(true);
    router.push(`/board?boardId=${newBoardId}`, undefined, { shallow: true });
  };

  const handleCloseBoard = () => {
    setShowBoard(false);
    setBoardId('');
    router.push('/board', undefined, { shallow: true });
  };

  // Show board if we have a boardId
  if ((showBoard || urlBoardId) && activeBoardId) {
    return (
      <>
        <Head>
          <title>Collaboration Board - iShareHow Labs</title>
          <link rel="canonical" href="https://ventures.isharehow.app/board" />
          <meta
            name="description"
            content="Collaborate in real-time on shared boards."
          />
        </Head>
        <BoardShell
          boardId={activeBoardId}
          userId={user?.id || 'anonymous'}
          userName={user?.name || 'Anonymous User'}
          onClose={handleCloseBoard}
        />
      </>
    );
  }

  // Show board selection UI
  return (
    <>
      <Head>
        <title>Collaboration Board - iShareHow Labs</title>
        <link rel="canonical" href="https://ventures.isharehow.app/board" />
        <meta
          name="description"
          content="Collaborate in real-time on shared boards."
        />
      </Head>
      <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          Collaboration Board
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Create a new board or join an existing one to collaborate in real-time.
        </Typography>

        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleCreateBoard}
            fullWidth
          >
            Create New Board
          </Button>

          <Typography variant="body2" textAlign="center" color="text.secondary">
            - OR -
          </Typography>

          <TextField
            label="Board ID"
            variant="outlined"
            fullWidth
            value={boardId}
            onChange={(e) => setBoardId(e.target.value)}
            placeholder="Enter board ID to join"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleJoinBoard();
              }
            }}
          />

          <Button
            variant="outlined"
            size="large"
            onClick={handleJoinBoard}
            disabled={!boardId.trim()}
            fullWidth
          >
            Join Existing Board
          </Button>
        </Box>

        {!user && (
          <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="body2" color="info.contrastText">
              💡 Tip: Log in to save your boards and see your collaboration history.
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
    </>
  );
}
