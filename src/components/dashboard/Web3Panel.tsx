// src/components/dashboard/Web3Panel.tsx
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  Divider,
  Grid,
  Stack,
  Typography,
  Paper,
} from '@mui/material';

export default function Web3Panel() {
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Fetch crypto balance, transactions, and current price from backend
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

    fetch('/api/web3/price', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        setCurrentPrice(data.price);
      })
      .catch(() => setError('Failed to load price'));
  }, []);

  return (
    <Box sx={{ height: '100%', overflow: 'auto', p: { xs: 2, sm: 3 } }}>
      <Stack spacing={5}>
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              mb: 2,
              background: 'linear-gradient(90deg, #22D3EE, #6366F1)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Web3 Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 720 }}>
            Welcome to your centralized dashboard for managing your decentralized life. Here you can track your crypto balances, review transactions, and access training resources to help you thrive in the Web3 ecosystem.
          </Typography>
        </Box>

        {/* Trackers Section */}
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
            Web3 Token Trackers
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Current Price
                </Typography>
                {currentPrice !== null ? (
                  <Typography variant="h4" color="primary">${currentPrice.toFixed(2)}</Typography>
                ) : (
                  <Typography variant="body2">Loading...</Typography>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Crypto Balance
                </Typography>
                {balance !== null ? (
                  <Typography variant="h4" color="primary">{balance} ETH</Typography>
                ) : (
                  <Typography variant="body2">Loading...</Typography>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Recent Transactions
                </Typography>
                <Typography variant="h4" color="primary">{transactions.length}</Typography>
                <Typography variant="body2">Total</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Training Section with YouTube Embeds */}
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
            Web3 Training Videos
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Introduction to Web3
                </Typography>
                <Box sx={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                  <iframe
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                    title="Introduction to Web3"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </Box>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                  Crypto Trading Basics
                </Typography>
                <Box sx={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
                  <iframe
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                    title="Crypto Trading Basics"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Recent Transactions List */}
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, mb: 3 }}>
            Recent Transactions
          </Typography>
          {loading ? (
            <Typography variant="body2">Loading transactions...</Typography>
          ) : transactions.length === 0 ? (
            <Typography variant="body2">No transactions found.</Typography>
          ) : (
            <Stack spacing={2}>
              {transactions.slice(0, 5).map((tx, idx) => (
                <Paper key={idx} variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="body2">Hash: {tx.hash}</Typography>
                  <Typography variant="body2">Amount: {tx.amount} ETH</Typography>
                  <Typography variant="body2">To: {tx.to}</Typography>
                  <Typography variant="body2">Date: {tx.date}</Typography>
                </Paper>
              ))}
            </Stack>
          )}
        </Box>
      </Stack>
    </Box>
  );
}

