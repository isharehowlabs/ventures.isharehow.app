import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Stack,
  Switch,
  FormControlLabel,
  Divider,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider,
  Alert,
  IconButton,
  TextField,
  Tabs,
  Tab,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  Refresh,
  RestartAlt,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Notifications as NotificationsIcon,
  People as PeopleIcon,
  Assignment as AssignmentIcon,
  VpnKey as VpnKeyIcon,
  Close as CloseIcon,
  Article as ArticleIcon,
} from '@mui/icons-material';
import AppShell from '../components/AppShell';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import { useSettings } from '../hooks/useSettings';
import { getBackendUrl } from '../utils/backendUrl';
import AdminClientAssignmentDialog from '../components/dashboard/creative/AdminClientAssignmentDialog';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

const JourneyBuilderAdmin = dynamic(() => import('../components/rise/JourneyBuilderAdmin'), { ssr: false });


function SettingsPage() {
  const router = useRouter();
  const { settings, updateDashboardSettings, updateApiKeys, resetSettings } = useSettings();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const backendUrl = getBackendUrl();
        console.log('[Settings] Fetching profile from:', `${backendUrl}/api/profile`);
        const response = await fetch(`${backendUrl}/api/profile`, { credentials: 'include' });
        console.log('[Settings] Profile response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('[Settings] Profile data received:', data);
          setUser(data);
        } else {
          // Try to get error message
          let errorMessage = `HTTP ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch (e) {
            const text = await response.text();
            console.error('[Settings] Failed to fetch profile (non-JSON):', response.status, text.substring(0, 200));
          }
          console.error('[Settings] Failed to fetch user profile:', errorMessage);
        }
      } catch (err) {
        console.error('[Settings] Error fetching user profile:', err);
      }
    };
    fetchProfile();
  }, []);
  const [showResetAlert, setShowResetAlert] = useState(false);
  const [blogRefreshLoading, setBlogRefreshLoading] = useState(false);
  const [blogRefreshSuccess, setBlogRefreshSuccess] = useState<string | null>(null);
  const [blogRefreshError, setBlogRefreshError] = useState<string | null>(null);
  const [taskLinkLoading, setTaskLinkLoading] = useState(false);
  const [taskLinkSuccess, setTaskLinkSuccess] = useState<string | null>(null);
  const [taskLinkError, setTaskLinkError] = useState<string | null>(null);

  const handleReset = () => {
    resetSettings();
    setShowResetAlert(true);
    setTimeout(() => setShowResetAlert(false), 3000);
  };

  const handleLinkTasksToUser = async () => {
    setTaskLinkLoading(true);
    setTaskLinkError(null);
    setTaskLinkSuccess(null);

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/admin/tasks/link-to-user`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'isharehow',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to link tasks' }));
        throw new Error(errorData.error || errorData.message || 'Failed to link tasks');
      }

      const data = await response.json();
      setTaskLinkSuccess(data.message || `Successfully linked ${data.linkedCount || 0} tasks to isharehow user!`);
      setTimeout(() => setTaskLinkSuccess(null), 5000);
    } catch (error: any) {
      console.error('Error linking tasks:', error);
      setTaskLinkError(error.message || 'Failed to link tasks');
      setTimeout(() => setTaskLinkError(null), 5000);
    } finally {
      setTaskLinkLoading(false);
    }
  };

  const handleRefreshBlogPosts = async () => {
    setBlogRefreshLoading(true);
    setBlogRefreshError(null);
    setBlogRefreshSuccess(null);

    try {
      const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://blog.isharehow.app';
      const WORDPRESS_API_BASE = `${WORDPRESS_URL}/wp-json/wp/v2`;

      // Fetch posts from WordPress
      const response = await fetch(
        `${WORDPRESS_API_BASE}/posts?_embed&per_page=100&status=publish&orderby=date&order=desc`
      );

      if (!response.ok) {
        throw new Error(`WordPress API error: ${response.status} ${response.statusText}`);
      }

      const wpPosts = await response.json();

      // Transform and store in localStorage
      const transformedPosts = wpPosts.map((wpPost: any) => {
        // Extract featured image
        let featuredImage: string | null = null;
        if (wpPost.featured_media && wpPost.featured_media > 0) {
          const embeddedMedia = wpPost._embedded?.['wp:featuredmedia']?.[0];
          if (embeddedMedia) {
            featuredImage = embeddedMedia.source_url || embeddedMedia.media_details?.sizes?.full?.source_url || null;
          }
        }

        // Extract tags
        const tags: string[] = [];
        if (wpPost._embedded?.['wp:term']?.[0]) {
          wpPost._embedded['wp:term'][0].forEach((term: any) => {
            if (term.taxonomy === 'category' && term.name) {
              tags.push(term.name);
            }
          });
        }
        if (wpPost._embedded?.['wp:term']?.[1]) {
          wpPost._embedded['wp:term'][1].forEach((term: any) => {
            if (term.taxonomy === 'post_tag' && term.name) {
              tags.push(term.name);
            }
          });
        }

        // Extract author
        const authors: string[] = [];
        if (wpPost._embedded?.author?.[0]) {
          const author = wpPost._embedded.author[0];
          authors.push(author.slug || `author-${author.id}`);
        }

        // Extract excerpt
        let description = '';
        if (wpPost.excerpt?.rendered) {
          description = wpPost.excerpt.rendered.replace(/<[^>]*>/g, '').trim();
          if (description.length > 200) {
            description = description.substring(0, 200).trim() + '...';
          }
        }

        const post: any = {
          slug: wpPost.slug,
          title: wpPost.title?.rendered || wpPost.title || '',
          description: description,
          date: wpPost.date || wpPost.modified,
          tags: tags,
          authors: authors.length > 0 ? authors : ['isharehow'],
          content: wpPost.content?.rendered || wpPost.content,
        };

        if (featuredImage) {
          post.image = featuredImage;
        }

        return post;
      });

      // Calculate tag counts
      const tagInfo: Record<string, number> = {};
      transformedPosts.forEach((post: any) => {
        post.tags.forEach((tag: string) => {
          tagInfo[tag] = (tagInfo[tag] || 0) + 1;
        });
      });

      // Store in localStorage
      localStorage.setItem('blogPosts', JSON.stringify(transformedPosts));
      localStorage.setItem('blogTagInfo', JSON.stringify(tagInfo));
      localStorage.setItem('blogPostsLastRefresh', new Date().toISOString());

      // Dispatch custom event to notify blog page (same tab)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('blogPostsRefreshed'));
      }

      setBlogRefreshSuccess(`Successfully refreshed ${transformedPosts.length} blog posts!`);
      setTimeout(() => setBlogRefreshSuccess(null), 5000);
    } catch (error: any) {
      console.error('Error refreshing blog posts:', error);
      setBlogRefreshError(error.message || 'Failed to refresh blog posts');
      setTimeout(() => setBlogRefreshError(null), 5000);
    } finally {
      setBlogRefreshLoading(false);
    }
  };


  const handleSendNotification = async () => {
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      setNotificationError('Title and message are required');
      return;
    }

    setNotificationSending(true);
    setNotificationError(null);
    setNotificationSuccess(null);

    try {
      const backendUrl = getBackendUrl();
      
      if (notificationTarget === 'all') {
        // For now, send to all users by making a request to a special endpoint
        // We'll need to create this endpoint in the backend
        const response = await fetch(`${backendUrl}/api/notifications/broadcast`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: notificationType,
            title: notificationTitle,
            message: notificationMessage,
            metadata: {
              admin: true,
              sentBy: user?.username || 'admin',
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to send notification' }));
          throw new Error(errorData.error || 'Failed to send notification');
        }

        setNotificationSuccess('Notification sent to all users successfully!');
      } else {
        // Send to current user
        const response = await fetch(`${backendUrl}/api/notifications`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: notificationType,
            title: notificationTitle,
            message: notificationMessage,
            metadata: {
              admin: true,
              sentBy: user?.username || 'admin',
            },
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Failed to send notification' }));
          throw new Error(errorData.error || 'Failed to send notification');
        }

        setNotificationSuccess('Notification sent successfully!');
      }

      // Clear form
      setNotificationTitle('');
      setNotificationMessage('');
    } catch (error: any) {
      setNotificationError(error.message || 'Failed to send notification');
    } finally {
      setNotificationSending(false);
    }
  };

  // Admin check: Super Admin if Patreon ID 56776112, user.isAdmin, username/id is 'isharehow' or 'admin', or email is 'jeliyah@isharehowlabs.com'
  const isAdmin = user?.isAdmin || 
                  user?.patreonId === 56776112 || 
                  user?.username === 'isharehow' || 
                  user?.id === 'isharehow' ||
                  user?.id === 'admin' ||
                  user?.username === 'admin' ||
                  user?.email === 'jeliyah@isharehowlabs.com' ||
                  (user?.username && user.username.toLowerCase() === 'isharehow') ||
                  (user?.id && String(user.id).toLowerCase() === 'isharehow') ||
                  (user?.id && String(user.id).toLowerCase() === 'admin');
  
  // Tab state
  const [activeTab, setActiveTab] = useState(0);
  
  // Admin notification form state
  const [notificationType, setNotificationType] = useState<string>('admin');
  const [notificationTitle, setNotificationTitle] = useState<string>('');
  const [notificationMessage, setNotificationMessage] = useState<string>('');
  const [notificationTarget, setNotificationTarget] = useState<string>('self'); // 'self' or 'all'
  const [notificationSending, setNotificationSending] = useState<boolean>(false);
  const [notificationSuccess, setNotificationSuccess] = useState<string | null>(null);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  
  // Employee management state
  const [employees, setEmployees] = useState<any[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [employeeError, setEmployeeError] = useState<string | null>(null);
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  
  // Fetch employees list
  useEffect(() => {
    if (isAdmin && activeTab === 2) {
      fetchEmployees();
    }
  }, [isAdmin, activeTab]);
  
  const fetchEmployees = async () => {
    setLoadingEmployees(true);
    setEmployeeError(null);
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/admin/users`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setEmployees(data.users || []);
      } else {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        setEmployeeError(errorData.error || `Failed to load users (${response.status})`);
      }
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      setEmployeeError(error.message || 'Failed to load users');
    } finally {
      setLoadingEmployees(false);
    }
  };
  
  const toggleEmployeeStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/admin/users/${userId}/employee`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isEmployee: !currentStatus }),
      });
      if (response.ok) {
        // Refresh employees list
        fetchEmployees();
      } else {
        const errorData = await response.json();
        setEmployeeError(errorData.error || 'Failed to update employee status');
      }
    } catch (error: any) {
      setEmployeeError(error.message || 'Failed to update employee status');
    }
  };
  
  const toggleAdminStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/admin/users/${userId}/admin`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isAdmin: !currentStatus }),
      });
      if (response.ok) {
        // Refresh employees list
        fetchEmployees();
        // Also refresh user data to update admin status
        const profileResponse = await fetch(`${backendUrl}/api/profile`, { credentials: 'include' });
        if (profileResponse.ok) {
          const updatedUser = await profileResponse.json();
          setUser(updatedUser);
        }
      } else {
        const errorData = await response.json();
        setEmployeeError(errorData.error || 'Failed to update admin status');
      }
    } catch (error: any) {
      setEmployeeError(error.message || 'Failed to update admin status');
    }
  };

  const handleOpenPasswordDialog = (user: any) => {
    setSelectedUserForPassword(user);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError(null);
    setPasswordDialogOpen(true);
  };

  const handleClosePasswordDialog = () => {
    setPasswordDialogOpen(false);
    setSelectedUserForPassword(null);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError(null);
  };

  const handleChangePassword = async () => {
    if (!selectedUserForPassword) return;

    // Validate passwords
    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setChangingPassword(true);
    setPasswordError(null);

    try {
      const backendUrl = getBackendUrl();
      const userId = selectedUserForPassword.id || selectedUserForPassword.username || selectedUserForPassword.user_id;
      
      // Encode userId to handle special characters
      const encodedUserId = encodeURIComponent(userId);
      
      const response = await fetch(`${backendUrl}/api/admin/users/${encodedUserId}/password`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: newPassword }),
      });

      if (response.ok) {
        alert(`Password changed successfully for ${selectedUserForPassword.name || selectedUserForPassword.username || selectedUserForPassword.email}`);
        handleClosePasswordDialog();
      } else {
        const errorData = await response.json();
        setPasswordError(errorData.error || 'Failed to change password');
      }
    } catch (error: any) {
      setPasswordError(error.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <AppShell active="settings">
      <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 4 }}>
          <SettingsIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              background: 'linear-gradient(45deg, #9146FF, #ff6b6b, #4ecdc4)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Settings
          </Typography>
        </Stack>

        {showResetAlert && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setShowResetAlert(false)}>
            Settings have been reset to default values.
          </Alert>
        )}

        {/* Tabs */}
        <Paper elevation={2} sx={{ mb: 3 }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="General" icon={<SettingsIcon />} iconPosition="start" />
            {isAdmin && <Tab label="Admin" icon={<AdminPanelSettingsIcon />} iconPosition="start" />}
          </Tabs>
        </Paper>

        {/* General Settings Tab */}
        {activeTab === 0 && (
          <Box>

        {/* Dashboard Settings */}
        <Paper elevation={2} sx={{ p: 4, mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
            <DashboardIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Dashboard Settings
            </Typography>
          </Stack>
          <Divider sx={{ mb: 3 }} />
          <Stack spacing={3}>
            <FormControl fullWidth>
              <InputLabel>Default Tab</InputLabel>
              <Select
                value={settings.dashboard.defaultTab}
                label="Default Tab"
                onChange={(e) => updateDashboardSettings({ defaultTab: Number(e.target.value) })}
              >
                <MenuItem value={0}>Streaming</MenuItem>
                <MenuItem value={1}>Designs & Code</MenuItem>
                <MenuItem value={2}>Documents</MenuItem>
                <MenuItem value={3}>Learning Hub</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Layout Style</InputLabel>
              <Select
                value={settings.dashboard.layout}
                label="Layout Style"
                onChange={(e) => updateDashboardSettings({ layout: e.target.value as 'grid' | 'list' })}
              >
                <MenuItem value="grid">Grid</MenuItem>
                <MenuItem value="list">List</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Paper>

        {/* Blog Refresh */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <ArticleIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Blog Management
            </Typography>
          </Stack>
          <Divider sx={{ mb: 2 }} />
          
          {blogRefreshSuccess && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setBlogRefreshSuccess(null)}>
              {blogRefreshSuccess}
            </Alert>
          )}
          
          {blogRefreshError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setBlogRefreshError(null)}>
              {blogRefreshError}
            </Alert>
          )}

          <Stack spacing={2}>
            <Box>
              <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                Refresh Blog Posts
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Manually fetch the latest blog posts from WordPress without rebuilding the site. The refreshed posts will be available immediately on the blog page.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={blogRefreshLoading ? <CircularProgress size={20} /> : <Refresh />}
                onClick={handleRefreshBlogPosts}
                disabled={blogRefreshLoading}
              >
                {blogRefreshLoading ? 'Refreshing...' : 'Refresh Blog Posts'}
              </Button>
            </Box>
            {typeof window !== 'undefined' && localStorage.getItem('blogPostsLastRefresh') && (
              <Typography variant="caption" color="text.secondary">
                Last refreshed: {new Date(localStorage.getItem('blogPostsLastRefresh') || '').toLocaleString()}
              </Typography>
            )}
          </Stack>
        </Paper>

        {/* Reset Button */}
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                Reset Settings
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Restore all settings to their default values
              </Typography>
            </Box>
            <Button
              variant="outlined"
              color="error"
              startIcon={<RestartAlt />}
              onClick={handleReset}
            >
              Reset to Defaults
            </Button>
          </Stack>
        </Paper>
          </Box>
        )}

        {/* Admin Tab */}
        {activeTab === 1 && isAdmin && (
          <Box>
            {/* Journey Builder Admin */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                Journey Builder
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <JourneyBuilderAdmin />
            </Paper>

            {/* Notification System */}
            <Paper elevation={3} sx={{ p: 4, mb: 3, border: '2px solid gold' }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <NotificationsIcon sx={{ color: 'gold', fontSize: 32 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'gold' }}>
                  Send Notification
                </Typography>
              </Stack>
              <Divider sx={{ mb: 3, borderColor: 'gold' }} />
              
              {notificationSuccess && (
                <Alert severity="success" sx={{ mb: 3 }} onClose={() => setNotificationSuccess(null)}>
                  {notificationSuccess}
                </Alert>
              )}
              
              {notificationError && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setNotificationError(null)}>
                  {notificationError}
                </Alert>
              )}

              <Stack spacing={3}>
                <FormControl fullWidth>
                  <InputLabel>Notification Type</InputLabel>
                  <Select
                    value={notificationType}
                    label="Notification Type"
                    onChange={(e) => setNotificationType(e.target.value)}
                  >
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="system">System</MenuItem>
                    <MenuItem value="live-update">Live Update</MenuItem>
                    <MenuItem value="board">Board</MenuItem>
                    <MenuItem value="timer">Timer</MenuItem>
                    <MenuItem value="twitch">Twitch</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth>
                  <InputLabel>Target</InputLabel>
                  <Select
                    value={notificationTarget}
                    label="Target"
                    onChange={(e) => setNotificationTarget(e.target.value)}
                  >
                    <MenuItem value="self">Send to Myself (Test)</MenuItem>
                    <MenuItem value="all">Send to All Users</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  label="Title"
                  value={notificationTitle}
                  onChange={(e) => setNotificationTitle(e.target.value)}
                  placeholder="Enter notification title"
                  required
                />

                <TextField
                  fullWidth
                  label="Message"
                  value={notificationMessage}
                  onChange={(e) => setNotificationMessage(e.target.value)}
                  placeholder="Enter notification message"
                  multiline
                  rows={4}
                  required
                />

                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<NotificationsIcon />}
                  onClick={handleSendNotification}
                  disabled={notificationSending || !notificationTitle.trim() || !notificationMessage.trim()}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  {notificationSending ? 'Sending...' : 'Send Notification'}
                </Button>
              </Stack>
            </Paper>

            {/* Task Management */}
            <Paper elevation={3} sx={{ p: 4, mb: 3, border: '2px solid gold' }}>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <AssignmentIcon sx={{ color: 'gold', fontSize: 32 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'gold' }}>
                  Task Management
                </Typography>
              </Stack>
              <Divider sx={{ mb: 3, borderColor: 'gold' }} />
              
              {taskLinkSuccess && (
                <Alert severity="success" sx={{ mb: 3 }} onClose={() => setTaskLinkSuccess(null)}>
                  {taskLinkSuccess}
                </Alert>
              )}
              
              {taskLinkError && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setTaskLinkError(null)}>
                  {taskLinkError}
                </Alert>
              )}

              <Stack spacing={3}>
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                    Link Old Tasks to isharehow User
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Link all old tasks in the database that don't have a creator assigned to the isharehow user account. This will make them visible again in your task lists.
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={taskLinkLoading ? <CircularProgress size={20} /> : <AssignmentIcon />}
                    onClick={handleLinkTasksToUser}
                    disabled={taskLinkLoading}
                  >
                    {taskLinkLoading ? 'Linking Tasks...' : 'Link Old Tasks to isharehow'}
                  </Button>
                </Box>
              </Stack>
            </Paper>

          </Box>
        )}
      </Box>
      
      {/* Admin Client Assignment Dialog */}
      <AdminClientAssignmentDialog
        open={assignDialogOpen}
        onClose={() => setAssignDialogOpen(false)}
        currentUser={user}
        isAdminView={isAdmin}
      />
      
      {/* Change Password Dialog */}
      <Dialog open={passwordDialogOpen} onClose={handleClosePasswordDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1} alignItems="center">
              <VpnKeyIcon />
              <Typography variant="h6">Change Password</Typography>
            </Stack>
            <IconButton onClick={handleClosePasswordDialog} size="small">
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>
        <DialogContent>
          {selectedUserForPassword && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Changing password for:
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {selectedUserForPassword.name || selectedUserForPassword.username || selectedUserForPassword.email}
              </Typography>
              {selectedUserForPassword.email && (
                <Typography variant="body2" color="text.secondary">
                  {selectedUserForPassword.email}
                </Typography>
              )}
            </Box>
          )}

          {passwordError && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setPasswordError(null)}>
              {passwordError}
            </Alert>
          )}
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              type="password"
              label="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password (min 6 characters)"
              disabled={changingPassword}
              helperText="Password must be at least 6 characters long"
            />
            <TextField
              fullWidth
              type="password"
              label="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              disabled={changingPassword}
              error={confirmPassword !== '' && newPassword !== confirmPassword}
              helperText={confirmPassword !== '' && newPassword !== confirmPassword ? 'Passwords do not match' : ''}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePasswordDialog} disabled={changingPassword}>
            Cancel
          </Button>
          <Button
            onClick={handleChangePassword}
            variant="contained"
            disabled={changingPassword || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 6}
            startIcon={changingPassword ? <CircularProgress size={20} /> : <VpnKeyIcon />}
          >
            {changingPassword ? 'Changing...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </AppShell>
  );
}


function App() {
  return (
    <ProtectedRoute>
      <SettingsPage />
    </ProtectedRoute>
  );
}

export default App;

