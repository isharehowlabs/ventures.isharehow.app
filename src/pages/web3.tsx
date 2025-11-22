import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Divider,
  Button,
  TextField,
} from '@mui/material';
import AppShell from '../components/AppShell';
import ProtectedRoute from '../components/auth/ProtectedRoute';

function Web3Panel() {
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch crypto balance and transactions from backend
    fetch('/api/web3/balance', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setBalance(data.balance);
      })
      .catch(() => setError('Failed to load balance'));

    fetch('/api/web3/transactions', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setTransactions(data.transactions || []);
        setLoading(false);
      })
      .catch(() => setError('Failed to load transactions'));
  }, []);

  return (
    <AppShell active="web3">
      <Box sx={{ maxWidth: 900, mx: 'auto', mt: 4 }}>
        <Typography variant="h3" sx={{ fontWeight: 900, mb: 2, color: 'gold' }}>
          Web3 Co-Work Panel
        </Typography>
        <Divider sx={{ mb: 3, borderColor: 'gold' }} />
        <Paper elevation={2} sx={{ p: 4, mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Crypto Balance
          </Typography>
          {error && <Typography color="error">{error}</Typography>}
          {balance !== null ? (
            <Typography variant="h6" color="primary">{balance} ETH</Typography>
          ) : (
            <Typography variant="body2">Loading balance...</Typography>
          )}
        </Paper>
        <Paper elevation={2} sx={{ p: 4 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Recent Transactions
          </Typography>
          {loading ? (
            <Typography variant="body2">Loading transactions...</Typography>
          ) : transactions.length === 0 ? (
            <Typography variant="body2">No transactions found.</Typography>
          ) : (
            <Stack spacing={2}>
              {transactions.map((tx, idx) => (
                <Paper key={idx} variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="body2">Hash: {tx.hash}</Typography>
                  <Typography variant="body2">Amount: {tx.amount} ETH</Typography>
                  <Typography variant="body2">To: {tx.to}</Typography>
                  <Typography variant="body2">Date: {tx.date}</Typography>
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>
      </Box>
    </AppShell>
  );
}

function App() {
  return (
    <ProtectedRoute>
      <Web3Panel />
    </ProtectedRoute>
  );
}

export default App;
