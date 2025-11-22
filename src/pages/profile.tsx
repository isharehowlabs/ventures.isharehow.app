import { Box, Typography, Paper, Avatar, Stack, Divider, Chip, Button, Alert } from '@mui/material';
import { Person, Email, AccountCircle, Logout, Settings } from '@mui/icons-material';
import AppShell from '../components/AppShell';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from 'next/router';

function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (!user) {
    return (
      <AppShell active="about">
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="info">Please log in to view your profile.</Alert>
        </Box>
      </AppShell>
    );
  }

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
              {user.email && (
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
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
                    <Typography variant="body1">{user.id}</Typography>
                  </Box>
                  {user.patreonId && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Patreon ID
                      </Typography>
                      <Typography variant="body1">{user.patreonId}</Typography>
                    </Box>
                  )}
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Role
                    </Typography>
                    <Typography variant="body1">
                      {user.patreonId === '56776112'
                        ? 'Super Admin'
                        : 'Regular User'}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>

            <Divider />

            <Box>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                <Email color="action" />
                <Typography variant="subtitle2" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                  Membership
                </Typography>
              </Stack>
              <Box sx={{ pl: 5 }}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                      Membership Status
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        label={user.isPaidMember ? 'Active Paid Member' : 'Free Member'}
                        color={user.isPaidMember ? 'success' : 'default'}
                        size="small"
                      />
                    </Stack>
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
                  {user.lifetimeSupportAmount && (
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                        Lifetime Support
                      </Typography>
                      <Typography variant="body1">${user.lifetimeSupportAmount.toFixed(2)}</Typography>
                    </Box>
                  )}
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

