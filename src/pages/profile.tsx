'use client';

import { Box, Typography, Paper, Avatar, Stack, Divider, Chip, Button, Alert, TextField, IconButton, Link, Grid, Card, CardContent, Container, Tabs, Tab } from '@mui/material';
import { Person, Email, AccountCircle, Logout, Settings, Edit, Check, Close, Refresh, OpenInNew, ContentCopy, CheckCircle, VpnKey, Payment, Security } from '@mui/icons-material';
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
  const [editingName, setEditingName] = useState(false);
  const [emailValue, setEmailValue] = useState('');
  const [nameValue, setNameValue] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);
  const [savingName, setSavingName] = useState(false);
  const [verifyingMembership, setVerifyingMembership] = useState(false);
  const [verifyingENS, setVerifyingENS] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  
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
          let errorMessage = `HTTP ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
            console.error('[Profile] Failed to fetch profile:', response.status, errorData);
            
            if (response.status === 404) {
              console.log('[Profile] User not found in profile endpoint, using authUser data');
              setError(null);
              setProfileData(null);
            } else {
              setError(errorMessage);
            }
          } catch (e) {
            const text = await response.text();
            console.error('[Profile] Failed to fetch profile (non-JSON response):', response.status, text.substring(0, 200));
            if (response.status === 404) {
              setError(null);
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
        try {
          const balanceRes = await fetch(`${backendUrl}/api/web3/balance`, { credentials: 'include' });
          if (balanceRes.ok) {
            const balanceData = await balanceRes.json();
            setBalance(balanceData.balance);
          }
        } catch (e) {
          console.error('Failed to load balance:', e);
        }

        try {
          const txRes = await fetch(`${backendUrl}/api/web3/transactions`, { credentials: 'include' });
          if (txRes.ok) {
            const txData = await txRes.json();
            setTransactions(txData.transactions || []);
          }
        } catch (e) {
          console.error('Failed to load transactions:', e);
        }

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

  useEffect(() => {
    if (profileData?.name) {
      setNameValue(profileData.name);
    } else if (authUser?.name) {
      setNameValue(authUser.name || '');
    }
  }, [profileData, authUser]);

  const handleEditEmail = () => {
    setEditingEmail(true);
  };

  const handleCancelEditEmail = () => {
    setEditingEmail(false);
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

    if (!authUser) {
      alert('You must be logged in to update your email');
      return;
    }

    setSavingEmail(true);
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email: emailValue.trim() }),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfileData(updatedProfile);
        setEditingEmail(false);
        alert('Email updated successfully!');
      } else {
        let errorMessage = 'Unknown error';
        try {
          const error = await response.json();
          errorMessage = error.error || error.message || `HTTP ${response.status}`;
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        alert(`Failed to update email: ${errorMessage}`);
      }
    } catch (error: any) {
      console.error('Network error updating email:', error);
      alert(`Network error: ${error.message || 'Failed to connect to server. Please check your connection and try again.'}`);
    } finally {
      setSavingEmail(false);
    }
  };

  const handleEditName = () => {
    setEditingName(true);
  };

  const handleCancelEditName = () => {
    setEditingName(false);
    if (profileData?.name) {
      setNameValue(profileData.name);
    } else if (authUser?.name) {
      setNameValue(authUser.name || '');
    }
  };

  const handleSaveName = async () => {
    if (!nameValue.trim()) {
      alert('Please enter a name');
      return;
    }

    if (!authUser) {
      alert('You must be logged in to update your name');
      return;
    }

    setSavingName(true);
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ name: nameValue.trim() }),
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfileData(updatedProfile);
        setEditingName(false);
        alert('Name updated successfully!');
      } else {
        let errorMessage = 'Unknown error';
        try {
          const error = await response.json();
          errorMessage = error.error || error.message || `HTTP ${response.status}`;
        } catch (parseError) {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        alert(`Failed to update name: ${errorMessage}`);
      }
    } catch (error: any) {
      console.error('Network error updating name:', error);
      alert(`Network error: ${error.message || 'Failed to connect to server. Please check your connection and try again.'}`);
    } finally {
      setSavingName(false);
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
      const response = await fetch(`${backendUrl}/api/profile/verify-ens`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
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
      const response = await fetch(`${backendUrl}/api/subscriptions/verify`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
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
        <Container maxWidth="lg">
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Alert severity="info">Please log in to view your profile.</Alert>
          </Box>
        </Container>
      </AppShell>
    );
  }

  if (loading) {
    return (
      <AppShell active="profile">
        <Container maxWidth="lg">
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography>Loading profile...</Typography>
          </Box>
        </Container>
      </AppShell>
    );
  }

  if (error && !authUser) {
    return (
      <AppShell active="profile">
        <Container maxWidth="lg">
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Button variant="contained" onClick={() => router.push('/')}>
              Go Home
            </Button>
          </Box>
        </Container>
      </AppShell>
    );
  }

  // Merge profileData and authUser to ensure all fields are available
  const user: any = {
    ...authUser,
    ...(profileData || {}),
    id: profileData?.id || authUser?.id,
    createdAt: profileData?.createdAt || authUser?.createdAt,
    email: profileData?.email || authUser?.email,
    name: profileData?.name || authUser?.name,
    avatar: profileData?.avatar || profileData?.avatarUrl || authUser?.avatar,
    isPaidMember: profileData?.isPaidMember ?? authUser?.isPaidMember,
    isEmployee: profileData?.isEmployee ?? authUser?.isEmployee ?? false,
    isAdmin: profileData?.isAdmin ?? authUser?.isAdmin ?? false,
    boldSubscriptionId: profileData?.boldSubscriptionId || authUser?.boldSubscriptionId,
    shopifyCustomerId: profileData?.shopifyCustomerId || authUser?.shopifyCustomerId,
    subscriptionUpdateActive: profileData?.subscriptionUpdateActive ?? authUser?.subscriptionUpdateActive ?? false,
    membershipPaid: profileData?.membershipPaid ?? authUser?.membershipPaid ?? false,
    ethPaymentVerified: profileData?.ethPaymentVerified ?? authUser?.ethPaymentVerified ?? false,
    ethPaymentAmount: profileData?.ethPaymentAmount || authUser?.ethPaymentAmount,
    ethPaymentTxHash: profileData?.ethPaymentTxHash || authUser?.ethPaymentTxHash,
    ethPaymentDate: profileData?.ethPaymentDate || authUser?.ethPaymentDate,
    lastChecked: profileData?.lastChecked || authUser?.lastChecked,
    ensName: profileData?.ensName || authUser?.ensName,
    cryptoAddress: profileData?.cryptoAddress || authUser?.cryptoAddress,
    contentHash: profileData?.contentHash || authUser?.contentHash,
  };

  return (
    <ProtectedRoute>
      <AppShell active="profile">
        <Box sx={{ flexGrow: 1, bgcolor: 'background.default', minHeight: '100vh' }}>
          <Container maxWidth="lg" sx={{ py: 4 }}>
            {error && authUser && (
              <Alert severity="warning" sx={{ mb: 3 }} onClose={() => setError(null)}>
                {error} - Showing limited profile information from authentication data.
              </Alert>
            )}

            {/* Header Section */}
            <Paper elevation={0} sx={{ p: 4, mb: 3, borderRadius: 2 }}>
              <Stack direction="row" spacing={3} alignItems="center">
                <Avatar
                  src={user.avatar}
                  sx={{
                    width: 80,
                    height: 80,
                    bgcolor: 'primary.main',
                    fontSize: '2rem',
                  }}
                >
                  {user.name?.charAt(0).toUpperCase() || <AccountCircle />}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  {editingName ? (
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <TextField
                        size="small"
                        value={nameValue}
                        onChange={(e) => setNameValue(e.target.value)}
                        placeholder="Enter your name"
                        disabled={savingName}
                        sx={{ minWidth: 200 }}
                      />
                      <IconButton
                        size="small"
                        onClick={handleSaveName}
                        disabled={savingName}
                        color="primary"
                      >
                        <Check />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={handleCancelEditName}
                        disabled={savingName}
                        color="error"
                      >
                        <Close />
                      </IconButton>
                    </Stack>
                  ) : (
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="h4" fontWeight={600}>
                        {user.name || 'User'}
                      </Typography>
                      <IconButton size="small" onClick={handleEditName}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Stack>
                  )}
                  {editingEmail ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <TextField
                        size="small"
                        type="email"
                        value={emailValue}
                        onChange={(e) => setEmailValue(e.target.value)}
                        placeholder="Enter your email"
                        disabled={savingEmail}
                        sx={{ minWidth: 250 }}
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
                    </Stack>
                  ) : (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Email fontSize="small" color="action" />
                      <Typography variant="body1" color="text.secondary">
                        {user.email || 'Not provided'}
                      </Typography>
                      <IconButton size="small" onClick={handleEditEmail}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Stack>
                  )}
                  <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" gap={1}>
                    {user.isEmployee && (
                      <Chip label="Employee" color="secondary" size="small" />
                    )}
                    {user.isAdmin && (
                      <Chip label="Admin" color="error" size="small" />
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
                      variant={user.isAdmin || user.isEmployee ? 'filled' : 'outlined'}
                      size="small"
                    />
                  </Stack>
                </Box>
                <Button
                  variant="outlined"
                  startIcon={<Settings />}
                  onClick={() => router.push('/settings')}
                >
                  Settings
                </Button>
              </Stack>
            </Paper>

            {/* Tabs */}
            <Paper elevation={0} sx={{ mb: 3, borderRadius: 2 }}>
              <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
                <Tab icon={<Person />} iconPosition="start" label="Profile" />
                <Tab icon={<VpnKey />} iconPosition="start" label="Web3 Identity" />
                <Tab icon={<Payment />} iconPosition="start" label="Membership" />
                <Tab icon={<Security />} iconPosition="start" label="Account" />
              </Tabs>
            </Paper>

            {/* Tab Content */}
            {activeTab === 0 && (
              <Card elevation={0} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                    Personal Information
                  </Typography>
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Member Since
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {user.createdAt 
                          ? new Date(user.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })
                          : 'Not available'}
                      </Typography>
                    </Box>
                    <Divider />
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        User ID
                      </Typography>
                      <Typography variant="body1" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                        {user.id || 'Not available'}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            )}

            {activeTab === 1 && (
              <Card elevation={0} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                    <Typography variant="h6" fontWeight={600}>
                      Web3 Identity
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Refresh />}
                      onClick={handleVerifyENS}
                      disabled={verifyingENS}
                    >
                      {verifyingENS ? 'Verifying...' : 'Verify ENS'}
                    </Button>
                  </Stack>

                  {!(user.ensName || user.cryptoAddress || user.contentHash) && (
                    <Alert severity="info" sx={{ mb: 3 }}>
                      Your Web3 identity will appear here after you verify your ENS domain. Click "Verify ENS" to resolve your domain.
                    </Alert>
                  )}

                  <Stack spacing={3}>
                    {user.ensName && (
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <Typography variant="body2" color="text.secondary" fontWeight={500}>
                            ENS Domain
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => copyToClipboard(user.ensName, 'ens')}
                          >
                            {copiedField === 'ens' ? <CheckCircle fontSize="small" color="success" /> : <ContentCopy fontSize="small" />}
                          </IconButton>
                          <Link
                            href={`https://app.ens.domains/name/${user.ensName}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <OpenInNew fontSize="small" />
                          </Link>
                        </Stack>
                        <Chip 
                          label={user.ensName} 
                          color="primary" 
                          sx={{ fontFamily: 'monospace', fontWeight: 600 }}
                        />
                      </Box>
                    )}

                    {user.cryptoAddress && (
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <Typography variant="body2" color="text.secondary" fontWeight={500}>
                            Ethereum Address
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => copyToClipboard(user.cryptoAddress, 'address')}
                          >
                            {copiedField === 'address' ? <CheckCircle fontSize="small" color="success" /> : <ContentCopy fontSize="small" />}
                          </IconButton>
                          <Link
                            href={`https://etherscan.io/address/${user.cryptoAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <OpenInNew fontSize="small" />
                          </Link>
                        </Stack>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all', bgcolor: 'background.paper', p: 1.5, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                          {user.cryptoAddress}
                        </Typography>
                      </Box>
                    )}

                    {user.contentHash && (
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                          <Typography variant="body2" color="text.secondary" fontWeight={500}>
                            IPFS Content Hash
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => copyToClipboard(user.contentHash, 'hash')}
                          >
                            {copiedField === 'hash' ? <CheckCircle fontSize="small" color="success" /> : <ContentCopy fontSize="small" />}
                          </IconButton>
                          {user.contentHash && !user.contentHash.startsWith('ipfs://') && (
                            <Link
                              href={`https://ipfs.io/ipfs/${user.contentHash.replace('0x', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <OpenInNew fontSize="small" />
                            </Link>
                          )}
                        </Stack>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.75rem', wordBreak: 'break-all', bgcolor: 'background.paper', p: 1.5, borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                          {user.contentHash}
                        </Typography>
                      </Box>
                    )}

                    <Divider />

                    <Box>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                        Token Information
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Current Price
                            </Typography>
                            {currentPrice !== null ? (
                              <Typography variant="h6" color="primary" fontWeight={700}>
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
                          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Crypto Balance
                            </Typography>
                            {balance !== null ? (
                              <Typography variant="h6" color="primary" fontWeight={700}>
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
                          <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                              Transactions
                            </Typography>
                            <Typography variant="h6" color="primary" fontWeight={700}>
                              {transactions.length}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">Total</Typography>
                          </Paper>
                        </Grid>
                      </Grid>
                    </Box>

                    {transactions.length > 0 && (
                      <Box>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
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
                  </Stack>
                </CardContent>
              </Card>
            )}

            {activeTab === 2 && (
              <Card elevation={0} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 4 }}>
                  <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                    <Typography variant="h6" fontWeight={600}>
                      Membership Information
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleVerifyMembership}
                      disabled={verifyingMembership}
                    >
                      {verifyingMembership ? 'Verifying...' : 'Refresh Status'}
                    </Button>
                  </Stack>

                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Membership Status
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" gap={1} sx={{ mt: 1 }}>
                        {user.isEmployee && (
                          <Chip label="Employee Access" color="warning" size="small" />
                        )}
                        <Chip
                          label={user.isPaidMember ? 'Active Paid Member' : 'Free Member'}
                          color={user.isPaidMember ? 'success' : 'default'}
                          size="small"
                        />
                        {user.boldSubscriptionId && (
                          <Chip label="Shopify Subscription" color="primary" variant="outlined" size="small" />
                        )}
                        {user.ethPaymentVerified && (
                          <Chip label="ETH Payment Verified" color="success" variant="outlined" size="small" />
                        )}
                      </Stack>
                      {user.lastChecked && (
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          Last checked: {new Date(user.lastChecked).toLocaleString()}
                        </Typography>
                      )}
                    </Box>

                    {!user.isPaidMember && (
                      <Alert severity="info">
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          Subscribe to access all dashboards and features. Monthly subscription: $17.77/month via Shopify, or send $20 ETH to isharehow.eth
                        </Typography>
                        <Stack direction="row" spacing={2} flexWrap="wrap">
                          <Button
                            variant="contained"
                            onClick={() => {
                              window.location.href = 'https://shop.isharehow.app/pages/manage-subscriptions';
                            }}
                          >
                            Subscribe via Shopify
                          </Button>
                          <Button
                            variant="outlined"
                            onClick={() => router.push('/link-wallet')}
                          >
                            Pay with ETH
                          </Button>
                        </Stack>
                      </Alert>
                    )}

                    {user.boldSubscriptionId && (
                      <Alert severity="success">
                        <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                          Shopify Subscription Active
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Subscription ID: {user.boldSubscriptionId}
                          {user.shopifyCustomerId && ` • Customer ID: ${user.shopifyCustomerId}`}
                        </Typography>
                      </Alert>
                    )}

                    {user.ethPaymentVerified && (
                      <Alert severity="success">
                        <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
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
                    )}

                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Membership Tier
                      </Typography>
                      <Typography variant="body1" fontWeight={user.membershipTier ? 500 : 400}>
                        {user.membershipTier ? user.membershipTier.charAt(0).toUpperCase() + user.membershipTier.slice(1) : 'Not set'}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            )}

            {activeTab === 3 && (
              <Card elevation={0} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                    Account Settings
                  </Typography>
                  <Stack spacing={3}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Account Actions
                      </Typography>
                      <Stack spacing={2}>
                        <Button
                          variant="outlined"
                          startIcon={<Settings />}
                          onClick={() => router.push('/settings')}
                          fullWidth
                          sx={{ justifyContent: 'flex-start' }}
                        >
                          Go to Settings
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<Logout />}
                          onClick={handleLogout}
                          fullWidth
                          sx={{ justifyContent: 'flex-start' }}
                        >
                          Sign Out
                        </Button>
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            )}
          </Container>
        </Box>
      </AppShell>
    </ProtectedRoute>
  );
}

export default ProfilePage;
