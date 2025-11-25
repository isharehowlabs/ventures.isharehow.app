import { Box, Typography, Paper, Avatar, Stack, Divider, Chip, Button, Alert, TextField, IconButton } from '@mui/material';
import { Person, Email, AccountCircle, Logout, Settings, Edit, Check, Close } from '@mui/icons-material';
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
  const [editingEmail, setEditingEmail] = useState(false);
  const [emailValue, setEmailValue] = useState('');
  const [savingEmail, setSavingEmail] = useState(false);
  const [verifyingMembership, setVerifyingMembership] = useState(false);

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
        } else {
          // Try to get error message from response
          let errorMessage = `HTTP ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
            console.error('[Profile] Failed to fetch profile:', response.status, errorData);
          } catch (e) {
            const text = await response.text();
            console.error('[Profile] Failed to fetch profile (non-JSON response):', response.status, text.substring(0, 200));
          }
          // Don't set loading to false on error - let user see the error
          // But still set it so UI doesn't hang
          setLoading(false);
        }
      } catch (error: any) {
        console.error('[Profile] Error fetching profile:', error);
        setLoading(false);
      } finally {
        // Only set loading to false if we haven't already
        // (to avoid race conditions)
      }
    };

    if (authUser) {
      fetchProfile();
    } else {
      setLoading(false);
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

  const handleVerifyMembership = async () => {
    setVerifyingMembership(true);
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/auth/verify-patreon`, {
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
        alert('Membership status updated successfully!');
      } else {
        const error = await response.json();
        if (error.needsConnection) {
          alert('Please connect your Patreon account first to verify membership status.');
        } else {
          alert(`Failed to verify membership: ${error.error || error.message || 'Unknown error'}`);
        }
      }
    } catch (error: any) {
      console.error('Error verifying membership:', error);
      alert(`Error: ${error.message || 'Failed to verify membership status'}`);
    } finally {
      setVerifyingMembership(false);
    }
  };

  if (!authUser) {
    return (
      <AppShell active="about">
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="info">Please log in to view your profile.</Alert>
        </Box>
      </AppShell>
    );
  }

  if (loading) {
    return (
      <AppShell active="about">
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography>Loading profile...</Typography>
        </Box>
      </AppShell>
    );
  }

  // Merge profileData and authUser to ensure all fields are available
  // If profileData fetch failed, use authUser as fallback
  const user: any = {
    ...authUser,
    ...(profileData || {}),
    // Ensure these critical fields are always available, prefer profileData
    id: profileData?.id || authUser?.id,
    patreonId: profileData?.patreonId || authUser?.patreonId,
    createdAt: profileData?.createdAt || authUser?.createdAt,
    email: profileData?.email || authUser?.email,
    name: profileData?.name || authUser?.name,
    avatar: profileData?.avatar || profileData?.avatarUrl || authUser?.avatar,
    isPaidMember: profileData?.isPaidMember ?? authUser?.isPaidMember,
    patreonConnected: profileData?.patreonConnected ?? authUser?.patreonConnected,
    isTeamMember: profileData?.isTeamMember ?? authUser?.isTeamMember,
  };

  return (
    <AppShell active="about">
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
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
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      User ID
                    </Typography>
                    <Typography variant="body1">{user.id || 'Not available'}</Typography>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Patreon ID
                    </Typography>
                    <Typography variant="body1">{user.patreonId || 'Not connected'}</Typography>
                  </Box>
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
                    <Stack direction="row" spacing={1} alignItems="center">
                      {user.isTeamMember && (
                        <Chip
                          label="Team Member"
                          color="secondary"
                          variant="filled"
                          size="small"
                        />
                      )}
                      <Chip
                        label={
                          user.patreonId === '56776112' ? 'Super Admin' :
                          user.isTeamMember ? 'Staff' :
                          'Community Member'
                        }
                        color={
                          user.patreonId === '56776112' ? 'error' :
                          user.isTeamMember ? 'warning' :
                          'primary'
                        }
                        variant={
                          user.patreonId === '56776112' || user.isTeamMember ? 'filled' : 'outlined'
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
                      {user.patreonConnected && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={handleVerifyMembership}
                          disabled={verifyingMembership}
                          sx={{ textTransform: 'none' }}
                        >
                          {verifyingMembership ? 'Verifying...' : 'Refresh Status'}
                        </Button>
                      )}
                    </Stack>
                    <Stack direction="row" spacing={1} alignItems="center">
                      {user.isTeamMember && (
                        <Chip
                          label="Team Access"
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
                    </Stack>
                    {user.lastChecked && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                        Last checked: {new Date(user.lastChecked).toLocaleString()}
                      </Typography>
                    )}
                    {!user.patreonConnected && (
                      <Box sx={{ mt: 2 }}>
                        <Alert severity="info" sx={{ mb: 2 }}>
                          Connect your Patreon account to verify membership status automatically.
                        </Alert>
                        <Button
                          variant="contained"
                          onClick={() => {
                            const backendUrl = getBackendUrl();
                            window.location.href = `${backendUrl}/api/auth/patreon`;
                          }}
                          sx={{
                            bgcolor: '#FF424D',
                            '&:hover': {
                              bgcolor: '#E63946',
                            },
                            textTransform: 'none',
                            fontWeight: 600,
                          }}
                        >
                          Connect Patreon Account
                        </Button>
                      </Box>
                    )}
                  </Box>
                  {user.membershipTier && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Membership Tier
                      </Typography>
                      <Typography variant="body1">{user.membershipTier}</Typography>
                    </Box>
                  )}
                  {user.membershipAmount && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Monthly Support
                      </Typography>
                      <Typography variant="body1">${user.membershipAmount.toFixed(2)}/month</Typography>
                    </Box>
                  )}
                  {user.isPaidMember && user.membershipPaymentDate && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Payment Date
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {new Date(user.membershipPaymentDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                    </Box>
                  )}
                  {user.isPaidMember && user.membershipRenewalDate && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Next Renewal
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {new Date(user.membershipRenewalDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                    </Box>
                  )}
                  {user.lifetimeSupportAmount && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Lifetime Support
                      </Typography>
                      <Typography variant="body1">${user.lifetimeSupportAmount.toFixed(2)}</Typography>
                    </Box>
                  )}
                  {user.lastChargeDate && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Last Charge Date
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {new Date(user.lastChargeDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                    </Box>
                  )}
                  {user.pledgeStart && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Pledge Start
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {new Date(user.pledgeStart).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </Typography>
                    </Box>
                  )}
                  <Box sx={{ mt: 3, p: 2, bgcolor: 'primary.light', borderRadius: 2 }}>
                    <Typography variant="body2" color="primary.contrastText" sx={{ mb: 1, fontWeight: 500 }}>
                      Support Our Mission
                    </Typography>
                    <Button
                      variant="contained"
                      color="secondary"
                      href="https://www.patreon.com/cw/JamelEliYah/membership"
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        boxShadow: 2,
                        '&:hover': { boxShadow: 4 }
                      }}
                      startIcon={<Settings />}
                    >
                      Increase Monthly Support
                    </Button>
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

