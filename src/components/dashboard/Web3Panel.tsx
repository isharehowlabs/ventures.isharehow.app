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
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ContentCopy,
  OpenInNew,
  CheckCircle,
} from '@mui/icons-material';
import { useAuth } from '../../hooks/useAuth';
import { getBackendUrl } from '../../utils/backendUrl';

export default function Web3Panel() {
  const { user } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

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
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 720, mb: 3 }}>
            Welcome to your centralized dashboard for managing your decentralized life. Here you can track your crypto balances, review transactions, and access training resources to help you thrive in the Web3 ecosystem.
          </Typography>
          
          {/* ENS Identity Card */}
          {(user?.ensName || user?.cryptoAddress) && (
            <Paper elevation={2} sx={{ p: 3, mb: 3, bgcolor: 'primary.light', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'white' }}>
                Your Web3 Identity
              </Typography>
              <Stack spacing={2}>
                {user.ensName && (
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                        ENS Domain:
                      </Typography>
                      <Tooltip title={copied === 'ens' ? 'Copied!' : 'Copy to clipboard'}>
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard(user.ensName, 'ens')}
                          sx={{ color: 'white', p: 0.5 }}
                        >
                          {copied === 'ens' ? <CheckCircle fontSize="small" /> : <ContentCopy fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </Stack>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: 'monospace',
                        fontWeight: 600,
                        color: 'white',
                        wordBreak: 'break-all',
                      }}
                    >
                      {user.ensName}
                    </Typography>
                    <Chip
                      label=".isharehow.eth"
                      size="small"
                      sx={{
                        mt: 1,
                        bgcolor: 'rgba(255,255,255,0.2)',
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                  </Box>
                )}
                {user.cryptoAddress && (
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                        Ethereum Address:
                      </Typography>
                      <Tooltip title={copied === 'address' ? 'Copied!' : 'Copy to clipboard'}>
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard(user.cryptoAddress, 'address')}
                          sx={{ color: 'white', p: 0.5 }}
                        >
                          {copied === 'address' ? <CheckCircle fontSize="small" /> : <ContentCopy fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View on Etherscan">
                        <IconButton
                          size="small"
                          onClick={() => window.open(`https://etherscan.io/address/${user.cryptoAddress}`, '_blank')}
                          sx={{ color: 'white', p: 0.5 }}
                        >
                          <OpenInNew fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'monospace',
                        color: 'rgba(255,255,255,0.9)',
                        wordBreak: 'break-all',
                      }}
                    >
                      {user.cryptoAddress}
                    </Typography>
                  </Box>
                )}
                {user.contentHash && (
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                        IPFS Content Hash:
                      </Typography>
                      <Tooltip title={copied === 'hash' ? 'Copied!' : 'Copy to clipboard'}>
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard(user.contentHash, 'hash')}
                          sx={{ color: 'white', p: 0.5 }}
                        >
                          {copied === 'hash' ? <CheckCircle fontSize="small" /> : <ContentCopy fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </Stack>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'monospace',
                        color: 'rgba(255,255,255,0.9)',
                        wordBreak: 'break-all',
                        fontSize: '0.75rem',
                      }}
                    >
                      {user.contentHash}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Paper>
          )}
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

        {/* Training videos removed - ENS info now in profile page */}

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

