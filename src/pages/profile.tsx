import { Box, Typography, Paper, Avatar, Stack, Divider, Chip, Button, Alert, TextField, IconButton, Link, Grid } from '@mui/material';
import { Person, Email, AccountCircle, Logout, Settings, Edit, Check, Close, Refresh, OpenInNew, ContentCopy, CheckCircle } from '@mui/icons-material';
import AppShell from '../components/AppShell';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { getBackendUrl } from '../utils/backendUrl';

function ProfilePage() {
  const { user: authUser, logout } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingEmail, setEditingEmail] = useState(false);
  const [emailValue, setEmailValue] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);
  const [verifyingMembership, setVerifyingMembership] = useState(false);
  const [verifyingENS, setVerifyingENS] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  // Web3 data state
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [loadingWeb3, setLoadingWeb3] = useState(true);
  const [web3Error, setWeb3Error] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const backendUrl = getBackendUrl();
        console.log('[Profile] Fetching profile from:', `${backendUrl}/api/profile`);
        const response = await fetch(`${backendUrl}/api/profile`, { credentials: 'include' });
        console.log('[Profile] Response status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('[Profile] Profile data received:', data);
          setProfileData(data);
          setError(null);
          setLoading(false);
        } else {
          // Try to get error message from response
          let errorMessage = `HTTP ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
            console.error('[Profile] Failed to fetch profile:', response.status, errorData);
            
            // If it's a 404, the user might not exist in the database yet
            // But we have authUser, so we can still show the profile
            if (response.status === 404) {
              console.log('[Profile] User not found in profile endpoint, using authUser data');
              setError(null); // Don't show error, use authUser as fallback
              setProfileData(null); // Will use authUser instead
            } else {
              setError(errorMessage);
            }
          } catch (e) {
            const text = await response.text();
            console.error('[Profile] Failed to fetch profile (non-JSON response):', response.status, text.substring(0, 200));
            if (response.status === 404) {
              setError(null); // Don't show error for 404, use authUser
            } else {
              setError(`Server error: ${response.status}`);
            }
          }
          setLoading(false);
        }
      } catch (error: any) {
        console.error('[Profile] Error fetching profile:', error);
        setError(error.message || 'Failed to load profile');
        setLoading(false);
      }
    };

    if (authUser) {
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [authUser]);

  // Fetch Web3 data (balance, transactions, price)
  useEffect(() => {
    const fetchWeb3Data = async () => {
      setLoadingWeb3(true);
      setWeb3Error(null);
      const backendUrl = getBackendUrl();
      
      try {
        // Fetch crypto balance
        try {
          const balanceRes = await fetch(`${backendUrl}/api/web3/balance`, { credentials: 'include' });
          if (balanceRes.ok) {
            const balanceData = await balanceRes.json();
            setBalance(balanceData.balance);
          }
        } catch (e) {
          console.error('Failed to load balance:', e);
        }

        // Fetch transactions
        try {
          const txRes = await fetch(`${backendUrl}/api/web3/transactions`, { credentials: 'include' });
          if (txRes.ok) {
            const txData = await txRes.json();
            setTransactions(txData.transactions || []);
          }
        } catch (e) {
          console.error('Failed to load transactions:', e);
        }

        // Fetch current price
        try {
          const priceRes = await fetch(`${backendUrl}/api/web3/price`, { credentials: 'include' });
          if (priceRes.ok) {
            const priceData = await priceRes.json();
            setCurrentPrice(priceData.price);
          }
        } catch (e) {
          console.error('Failed to load price:', e);
        }
      } catch (error: any) {
        setWeb3Error(error.message || 'Failed to load Web3 data');
      } finally {
        setLoadingWeb3(false);
      }
    };

    if (authUser) {
      fetchWeb3Data();
    }
  }, [authUser]);

  useEffect(() => {
    if (profileData?.email) {
      setEmailValue(profileData.email);
    } else if (authUser?.email) {
      setEmailValue(authUser.email);
    }
  }, [profileData, authUser]);

  const handleEditEmail = () => {
    setEditingEmail(true);
  };

  const handleCancelEditEmail = () => {
    setEditingEmail(false);
    // Reset to current value
    if (profileData?.email) {
      setEmailValue(profileData.email);
    } else if (authUser?.email) {
      setEmailValue(authUser.email);
    }
  };

  const handleSaveEmail = async () => {
    if (!emailValue.trim() || !emailValue.includes('@')) {
      alert('Please enter a valid email address');
      return;
    }

    // Check if user is authenticated
    if (!authUser) {
      alert('You must be logged in to update your email');
      return;
    }

    setSavingEmail(true);
    try {
      const backendUrl = getBackendUrl();
      console.log('Updating email:', emailValue.trim());
      console.log('Backend URL:', backendUrl);
      console.log('User authenticated:', !!authUser);
      
      const response = await fetch(`${backendUrl}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email: emailValue.trim() }),
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const updatedProfile = await response.json();
        console.log('Updated profile:', updatedProfile);
        setProfileData(updatedProfile);
        setEditingEmail(false);
        // Show success message
        alert('Email updated successfully!');
      } else {
        let errorMessage = 'Unknown error';
        try {
          const error = await response.json();
          errorMessage = error.error || error.message || `HTTP ${response.status}`;
          console.error('Server error:', error);
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        alert(`Failed to update email: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Network error updating email:', error);
      alert(`Network error: ${error.message || 'Failed to connect to server. Please check your connection and try again.'}`);
    } finally {
      setSavingEmail(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleVerifyENS = async () => {
    setVerifyingENS(true);
    try {
      const backendUrl = getBackendUrl();
      // Call backend to refresh/resolve ENS data
      const response = await fetch(`${backendUrl}/api/profile/verify-ens`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Refresh profile data
        const profileResponse = await fetch(`${backendUrl}/api/profile`, { credentials: 'include' });
        if (profileResponse.ok) {
          const updatedProfile = await profileResponse.json();
          setProfileData(updatedProfile);
        }
        alert('ENS data refreshed successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to verify ENS: ${error.error || error.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Error verifying ENS:', error);
      alert(`Error: ${error.message || 'Failed to verify ENS data'}`);
    } finally {
      setVerifyingENS(false);
    }
  };

  const handleVerifyMembership = async () => {
    setVerifyingMembership(true);
    try {
      const backendUrl = getBackendUrl();
      // Use new subscription verification endpoint
      const response = await fetch(`${backendUrl}/api/subscriptions/verify`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        // Refresh profile data
        const profileResponse = await fetch(`${backendUrl}/api/profile`, {
          credentials: 'include',
        });
        if (profileResponse.ok) {
          const updatedProfile = await profileResponse.json();
          setProfileData(updatedProfile);
        }
        alert('Subscription status updated successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to verify subscription: ${error.error || error.message || 'Unknown error'}`);
      }
    } catch (error: any) {
      console.error('Error verifying subscription:', error);
      alert(`Error: ${error.message || 'Failed to verify subscription status'}`);
    } finally {
      setVerifyingMembership(false);
    }
  };

  if (!authUser) {
    return (
      <AppShell active="profile">
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="info">Please log in to view your profile.</Alert>
        </Box>
      </AppShell>
    );
  }

  if (loading) {
    return (
      <AppShell active="profile">
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography>Loading profile...</Typography>
        </Box>
      </AppShell>
    );
  }

  // Show error if there's an error and no authUser to fall back to
  if (error && !authUser) {
    return (
      <AppShell active="profile">
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
          <Button variant="contained" onClick={() => router.push('/')}>
            Go Home
          </Button>
        </Box>
      </AppShell>
    );
  }

  // Note: If there's an error but we have authUser, we'll show a warning but continue to render the profile below

  // Merge profileData and authUser to ensure all fields are available
  // If profileData fetch failed, use authUser as fallback
  const user: any = {
    ...authUser,
    ...(profileData || {}),
    // Ensure these critical fields are always available, prefer profileData
    id: profileData?.id || authUser?.id,
    createdAt: profileData?.createdAt || authUser?.createdAt,
    email: profileData?.email || authUser?.email,
    name: profileData?.name || authUser?.name,
    avatar: profileData?.avatar || profileData?.avatarUrl || authUser?.avatar,
    isPaidMember: profileData?.isPaidMember ?? authUser?.isPaidMember,
    isEmployee: profileData?.isEmployee ?? authUser?.isEmployee ?? false,
    isAdmin: profileData?.isAdmin ?? authUser?.isAdmin ?? false,
    // Shopify/Bold subscription fields
    boldSubscriptionId: profileData?.boldSubscriptionId || authUser?.boldSubscriptionId,
    shopifyCustomerId: profileData?.shopifyCustomerId || authUser?.shopifyCustomerId,
    subscriptionUpdateActive: profileData?.subscriptionUpdateActive ?? authUser?.subscriptionUpdateActive ?? false,
    membershipPaid: profileData?.membershipPaid ?? authUser?.membershipPaid ?? false,
    // ETH payment fields
    ethPaymentVerified: profileData?.ethPaymentVerified ?? authUser?.ethPaymentVerified ?? false,
    ethPaymentAmount: profileData?.ethPaymentAmount || authUser?.ethPaymentAmount,
    ethPaymentTxHash: profileData?.ethPaymentTxHash || authUser?.ethPaymentTxHash,
    ethPaymentDate: profileData?.ethPaymentDate || authUser?.ethPaymentDate,
    // Last checked timestamp
    lastChecked: profileData?.lastChecked || authUser?.lastChecked,
    // ENS/Web3 fields
    ensName: profileData?.ensName || authUser?.ensName,
    cryptoAddress: profileData?.cryptoAddress || authUser?.cryptoAddress,
    contentHash: profileData?.contentHash || authUser?.contentHash,
  };

  return (
    <AppShell active="profile">
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        {error && authUser && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            {error} - Showing limited profile information from authentication data.
          </Alert>
        )}
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            mb: 4,
            background: 'linear-gradient(45deg, #9146FF, #ff6b6b, #4ecdc4)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Profile
        </Typography>

        <Paper elevation={2} sx={{ p: 4, mb: 3 }}>
          <Stack direction="row" spacing={3} alignItems="center" sx={{ mb: 4 }}>
            <Avatar
              src={user.avatar}
              sx={{
                width: 100,
                height: 100,
                bgcolor: 'primary.main',
                fontSize: '2.5rem',
              }}
            >
              {user.name?.charAt(0).toUpperCase() || <AccountCircle />}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                {user.name || 'User'}
              </Typography>
              {editingEmail ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    size="small"
                    type="email"
                    value={emailValue}
                    onChange={(e) => setEmailValue(e.target.value)}
                    placeholder="Enter your email"
                    disabled={savingEmail}
                    sx={{ minWidth: 200 }}
                  />
                  <IconButton
                    size="small"
                    onClick={handleSaveEmail}
                    disabled={savingEmail}
                    color="primary"
                  >
                    <Check />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={handleCancelEditEmail}
                    disabled={savingEmail}
                    color="error"
                  >
                    <Close />
                  </IconButton>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    {user.email || 'Not provided'}
                  </Typography>
                  <IconButton size="small" onClick={handleEditEmail}>
                    <Edit fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Box>
            <Button
              variant="outlined"
              startIcon={<Settings />}
              onClick={() => router.push('/settings')}
            >
              Settings
            </Button>
          </Stack>

          <Divider sx={{ my: 3 }} />

          <Stack spacing={3}>
            <Box>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                <Person color="action" />
                <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                  Account Information
                </Typography>
              </Stack>
              <Box sx={{ pl: 5 }}>
                <Stack spacing={2}>
                  {/* Web3/ENS Section - Always visible */}
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: 'primary.light', 
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                    border: '1px solid',
                    borderColor: 'primary.main'
                  }}>
                    <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                        Web3 Identity
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Refresh />}
                        onClick={handleVerifyENS}
                        disabled={verifyingENS}
                        sx={{ textTransform: 'none' }}
                      >
                        {verifyingENS ? 'Verifying...' : 'Verify ENS'}
                      </Button>
                    </Stack>
                    
                    {!(user.ensName || user.cryptoAddress || user.contentHash) && (
                      <Alert severity="info" sx={{ mb: 2 }}>
                        Your Web3 identity will appear here after you verify your ENS domain. Click "Verify ENS" to resolve your domain.
                      </Alert>
                    )}
                      
                      {user.ensName && (
                        <Box sx={{ mb: 2 }}>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                              ENS Domain
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => copyToClipboard(user.ensName, 'ens')}
                              sx={{ p: 0.5 }}
                            >
                              {copiedField === 'ens' ? <CheckCircle fontSize="small" color="success" /> : <ContentCopy fontSize="small" />}
                            </IconButton>
                            <Link
                              href={`https://app.ens.domains/name/${user.ensName}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                            >
                              <OpenInNew fontSize="small" sx={{ ml: 0.5, color: 'primary.main' }} />
                            </Link>
                          </Stack>
                          <Chip 
                            label={user.ensName} 
                            color="primary" 
                            sx={{ fontFamily: 'monospace', fontWeight: 600 }}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            Your Web3 identity on the Ethereum blockchain
                          </Typography>
                        </Box>
                      )}
                      
                      {user.cryptoAddress && (
                        <Box sx={{ mb: 2 }}>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                              Ethereum Address
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => copyToClipboard(user.cryptoAddress, 'address')}
                              sx={{ p: 0.5 }}
                            >
                              {copiedField === 'address' ? <CheckCircle fontSize="small" color="success" /> : <ContentCopy fontSize="small" />}
                            </IconButton>
                            <Link
                              href={`https://etherscan.io/address/${user.cryptoAddress}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                            >
                              <OpenInNew fontSize="small" sx={{ ml: 0.5, color: 'primary.main' }} />
                            </Link>
                          </Stack>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all', bgcolor: 'background.paper', p: 1, borderRadius: 1 }}>
                            {user.cryptoAddress}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            Resolved from your ENS domain
                          </Typography>
                        </Box>
                      )}
                      
                      {user.contentHash && (
                        <Box>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                              IPFS Content Hash
                            </Typography>
                            <IconButton
                              size="small"
                              onClick={() => copyToClipboard(user.contentHash, 'hash')}
                              sx={{ p: 0.5 }}
                            >
                              {copiedField === 'hash' ? <CheckCircle fontSize="small" color="success" /> : <ContentCopy fontSize="small" />}
                            </IconButton>
                            {user.contentHash && !user.contentHash.startsWith('ipfs://') && (
                              <Link
                                href={`https://ipfs.io/ipfs/${user.contentHash.replace('0x', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
                              >
                                <OpenInNew fontSize="small" sx={{ ml: 0.5, color: 'primary.main' }} />
                              </Link>
                            )}
                          </Stack>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all', bgcolor: 'background.paper', p: 1, borderRadius: 1 }}>
                            {user.contentHash}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                            Points to decentralized storage on IPFS
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  
                  {/* Web3 Token Trackers */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                      Web3 Token Trackers
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Current Price
                          </Typography>
                          {currentPrice !== null ? (
                            <Typography variant="h5" color="primary" sx={{ fontWeight: 700 }}>
                              ${currentPrice.toFixed(2)}
                            </Typography>
                          ) : loadingWeb3 ? (
                            <Typography variant="body2" color="text.secondary">Loading...</Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">N/A</Typography>
                          )}
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Crypto Balance
                          </Typography>
                          {balance !== null ? (
                            <Typography variant="h5" color="primary" sx={{ fontWeight: 700 }}>
                              {balance} ETH
                            </Typography>
                          ) : loadingWeb3 ? (
                            <Typography variant="body2" color="text.secondary">Loading...</Typography>
                          ) : (
                            <Typography variant="body2" color="text.secondary">N/A</Typography>
                          )}
                        </Paper>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Paper elevation={2} sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            Recent Transactions
                          </Typography>
                          <Typography variant="h5" color="primary" sx={{ fontWeight: 700 }}>
                            {transactions.length}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">Total</Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>

                  {/* Recent Transactions List */}
                  {transactions.length > 0 && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                        Recent Transactions
                      </Typography>
                      <Stack spacing={2}>
                        {transactions.slice(0, 5).map((tx, idx) => (
                          <Paper key={idx} variant="outlined" sx={{ p: 2 }}>
                            <Stack spacing={1}>
                              {tx.hash && (
                                <Box>
                                  <Typography variant="caption" color="text.secondary">Hash:</Typography>
                                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all' }}>
                                    {tx.hash}
                                  </Typography>
                                </Box>
                              )}
                              {tx.amount && (
                                <Typography variant="body2">
                                  <strong>Amount:</strong> {tx.amount} ETH
                                </Typography>
                              )}
                              {tx.to && (
                                <Box>
                                  <Typography variant="caption" color="text.secondary">To:</Typography>
                                  <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all' }}>
                                    {tx.to}
                                  </Typography>
                                </Box>
                              )}
                              {tx.date && (
                                <Typography variant="body2" color="text.secondary">
                                  <strong>Date:</strong> {new Date(tx.date).toLocaleString()}
                                </Typography>
                              )}
                            </Stack>
                          </Paper>
                        ))}
                      </Stack>
                    </Box>
                  )}
                  
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Member Since
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {user.createdAt 
                        ? new Date(user.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long'
                          })
                        : 'Not available'}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Role
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" gap={1}>
                      {user.isEmployee && (
                        <Chip
                          label="Employee"
                          color="secondary"
                          variant="filled"
                          size="small"
                        />
                      )}
                      {user.isAdmin && (
                        <Chip
                          label="Admin"
                          color="error"
                          variant="filled"
                          size="small"
                        />
                      )}
                      <Chip
                        label={
                          user.isAdmin ? 'Super Admin' :
                          user.isEmployee ? 'Staff' :
                          'Community Member'
                        }
                        color={
                          user.isAdmin ? 'error' :
                          user.isEmployee ? 'warning' :
                          'primary'
                        }
                        variant={
                          user.isAdmin || user.isEmployee ? 'filled' : 'outlined'
                        }
                        size="small"
                      />
                    </Stack>
                  </Box>
                </Stack>
              </Box>
            </Box>

            <Divider />

            <Box>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Email color="action" />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Membership Information
                </Typography>
              </Stack>
              <Box sx={{ pl: 5 }}>
                <Stack spacing={2}>
                  <Box>
                    <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Membership Status
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={handleVerifyMembership}
                        disabled={verifyingMembership}
                        sx={{ textTransform: 'none' }}
                      >
                        {verifyingMembership ? 'Verifying...' : 'Refresh Subscription Status'}
                      </Button>
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      {user.isEmployee && (
                        <Chip
                          label="Employee Access"
                          color="warning"
                          variant="filled"
                          size="small"
                        />
                      )}
                      <Chip
                        label={user.isPaidMember ? 'Active Paid Member' : 'Free Member'}
                        color={user.isPaidMember ? 'success' : 'default'}
                        size="small"
                      />
                      {user.boldSubscriptionId && (
                        <Chip
                          label="Shopify Subscription"
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      )}
                      {user.ethPaymentVerified && (
                        <Chip
                          label="ETH Payment Verified"
                          color="success"
                          variant="outlined"
                          size="small"
                        />
                      )}
                    </Stack>
                    {user.lastChecked && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        Last checked: {new Date(user.lastChecked).toLocaleString()}
                      </Typography>
                    )}
                    {!user.isPaidMember && (
                      <Box sx={{ mt: 2 }}>
                        <Alert severity="info" sx={{ mb: 2 }}>
                          Subscribe to access all dashboards and features. Monthly subscription: $17.77/month via Shopify, or send $20 ETH to isharehow.eth
                        </Alert>
                        <Stack direction="row" spacing={2} flexWrap="wrap">
                          <Button
                            variant="contained"
                            onClick={() => {
                              window.location.href = 'https://shop.isharehow.app/pages/manage-subscriptions';
                            }}
                            sx={{
                              bgcolor: 'primary.main',
                              '&:hover': {
                                bgcolor: 'primary.dark',
                              },
                              textTransform: 'none',
                              fontWeight: 600,
                            }}
                          >
                            Subscribe via Shopify
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={() => {
                              router.push('/link-wallet');
                            }}
                            sx={{
                              textTransform: 'none',
                              fontWeight: 600,
                            }}
                          >
                            Pay with ETH
                          </Button>
                        </Stack>
                      </Box>
                    )}
                    {/* Shopify Subscription Status */}
                    {user.boldSubscriptionId && (
                      <Box sx={{ mt: 2 }}>
                        <Alert severity="success" sx={{ mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            Shopify Subscription Active
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Subscription ID: {user.boldSubscriptionId}
                            {user.shopifyCustomerId && ` • Customer ID: ${user.shopifyCustomerId}`}
                          </Typography>
                        </Alert>
                      </Box>
                    )}
                    {/* ETH Payment Status */}
                    {user.ethPaymentVerified && (
                      <Box sx={{ mt: 2 }}>
                        <Alert severity="success" sx={{ mb: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                            ETH Payment Verified
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.ethPaymentAmount && `Amount: ${user.ethPaymentAmount} ETH`}
                            {user.ethPaymentTxHash && (
                              <>
                                {' • '}
                                <Link
                                  href={`https://etherscan.io/tx/${user.ethPaymentTxHash}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  sx={{ color: 'inherit', textDecoration: 'underline' }}
                                >
                                  View Transaction
                                </Link>
                              </>
                            )}
                            {user.ethPaymentDate && ` • Date: ${new Date(user.ethPaymentDate).toLocaleDateString()}`}
                          </Typography>
                        </Alert>
                      </Box>
                    )}
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Membership Tier
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: user.membershipTier ? 500 : 400 }}>
                      {user.membershipTier ? user.membershipTier.charAt(0).toUpperCase() + user.membershipTier.slice(1) : 'Not set'}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>

            <Divider />

            <Box>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Logout />}
                onClick={handleLogout}
                sx={{ mt: 2 }}
              >
                Sign Out
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </AppShell>
  );
}

function App() {
  return (
    <ProtectedRoute>
      <ProfilePage />
    </ProtectedRoute>
  );
}

export default App;

