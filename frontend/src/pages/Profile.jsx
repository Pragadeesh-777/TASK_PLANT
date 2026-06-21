import React, { useContext, useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, Typography, Button, Box, Avatar, Divider, Dialog, TextField, Alert, CircularProgress, useTheme } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import PostCard from '../components/PostCard';
import EditIcon from '@mui/icons-material/Edit';
import EmailIcon from '@mui/icons-material/Email';
import CalendarIcon from '@mui/icons-material/CalendarToday';
import WalletIcon from '@mui/icons-material/AccountBalanceWallet';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // State for user's posts
  const [posts, setPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [errorPosts, setErrorPosts] = useState(null);

  // Profile edit dialog states
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editUsername, setEditUsername] = useState(user?.username || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [editPassword, setEditPassword] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState(null);
  const [editSuccess, setEditSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUserPosts();
      setEditUsername(user.username);
      setEditEmail(user.email);
    }
  }, [user]);

  const fetchUserPosts = async () => {
    try {
      setLoadingPosts(true);
      setErrorPosts(null);
      const { data } = await API.get(`/posts?username=${encodeURIComponent(user.username)}`);
      setPosts(data.posts || []);
    } catch (err) {
      console.error('Failed to load user posts:', err);
      setErrorPosts('Failed to load your posts.');
    } finally {
      setLoadingPosts(false);
    }
  };

  const handleOpenEditDialog = () => {
    setEditUsername(user.username);
    setEditEmail(user.email);
    setEditPassword('');
    setEditError(null);
    setEditSuccess(false);
    setEditDialogOpen(true);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!editUsername.trim() || !editEmail.trim()) {
      setEditError('Username and Email are required.');
      return;
    }

    setEditSubmitting(true);
    setEditError(null);
    setEditSuccess(false);

    try {
      const payload = {
        username: editUsername.trim(),
        email: editEmail.trim(),
      };
      if (editPassword) {
        payload.password = editPassword;
      }

      const { data } = await API.put('/auth/profile', payload);

      // Save new JWT token
      localStorage.setItem('token', data.token);
      
      // Update global context user
      setUser((prev) => ({
        ...prev,
        username: data.username,
        email: data.email,
        coins: data.coins,
      }));

      setEditSuccess(true);
      setTimeout(() => {
        setEditDialogOpen(false);
      }, 1000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setEditError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setEditSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Container className="fade-in" maxWidth="lg">
      <Grid container spacing={4}>
        {/* Profile Card Sidebar */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <Avatar
                sx={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)',
                  width: 90,
                  height: 90,
                  mx: 'auto',
                  mb: 2.5,
                  fontSize: '2rem',
                  fontWeight: 800,
                  fontFamily: '"Outfit", sans-serif',
                  boxShadow: '0 4px 20px rgba(139, 92, 246, 0.35)',
                }}
              >
                {user.username.substring(0, 2).toUpperCase()}
              </Avatar>

              <Typography variant="h5" fontWeight={750} fontFamily="'Outfit', sans-serif" mb={0.5}>
                {user.username}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Platform Member
              </Typography>

              <Button
                variant="outlined"
                color="primary"
                startIcon={<EditIcon />}
                onClick={handleOpenEditDialog}
                fullWidth
                sx={{ borderRadius: '20px', py: 1, textTransform: 'none' }}
              >
                Edit Profile
              </Button>

              <Divider sx={{ my: 3, opacity: 0.5 }} />

              <Box display="flex" alignItems="center" gap={2} mb={2.5} sx={{ textAlign: 'left' }}>
                <EmailIcon color="primary" sx={{ opacity: 0.8 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">EMAIL ADDRESS</Typography>
                  <Typography variant="body2" fontWeight={600}>{user.email}</Typography>
                </Box>
              </Box>

              <Box display="flex" alignItems="center" gap={2} sx={{ textAlign: 'left' }}>
                <CalendarIcon color="primary" sx={{ opacity: 0.8 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">ROLE LEVEL</Typography>
                  <Typography variant="body2" fontWeight={600}>Contributor</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Earnings Card */}
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <WalletIcon color="secondary" sx={{ fontSize: 28 }} />
                <Typography variant="h6" fontWeight={750} fontFamily="'Outfit', sans-serif">
                  Wallet Earnings
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Your accumulated coins from completing daily micro-tasks.
              </Typography>
              <Box 
                p={2} 
                bgcolor={isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'} 
                borderRadius="14px"
                border="1px solid"
                borderColor="divider"
                display="flex"
                alignItems="center"
                gap={1.5}
              >
                <Typography variant="h4" fontWeight={850} color="secondary.main" fontFamily="'Outfit', sans-serif">
                  🪙 {user.coins || 0}
                </Typography>
                <Typography variant="caption" color="text.secondary">COINS</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* User's Posts Feed */}
        <Grid item xs={12} md={8}>
          <Typography variant="h5" fontWeight={750} fontFamily="'Outfit', sans-serif" mb={3}>
            My Posts
          </Typography>

          {loadingPosts ? (
            <Box display="flex" justifyContent="center" py={5}>
              <CircularProgress size={40} color="primary" />
            </Box>
          ) : errorPosts ? (
            <Card sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="error">{errorPosts}</Typography>
            </Card>
          ) : posts.length === 0 ? (
            <Card sx={{ p: 5, textAlign: 'center', background: 'rgba(0,0,0,0.01)', border: '1px dashed', borderColor: 'divider' }}>
              <Box sx={{ fontSize: '2.5rem', mb: 2 }}>📝</Box>
              <Typography variant="h6" fontWeight={650} fontFamily="'Outfit', sans-serif">
                No Posts Yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                You have not shared any updates with the community. Publish your first post from the Social Feed!
              </Typography>
            </Card>
          ) : (
            <Box>
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </Box>
          )}
        </Grid>
      </Grid>

      {/* Edit Profile Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => !editSubmitting && setEditDialogOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <Box p={2.5}>
          <Typography variant="h6" fontWeight={750} fontFamily="'Outfit', sans-serif" mb={2}>
            Edit Profile Info
          </Typography>

          {editError && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }}>
              {editError}
            </Alert>
          )}

          {editSuccess && (
            <Alert severity="success" sx={{ mb: 2, borderRadius: '10px' }}>
              Profile updated successfully!
            </Alert>
          )}

          <form onSubmit={handleProfileUpdate}>
            <Box display="flex" flexDirection="column" gap={2.5}>
              <TextField
                label="Username"
                fullWidth
                required
                value={editUsername}
                onChange={(e) => setEditUsername(e.target.value)}
                disabled={editSubmitting}
              />

              <TextField
                label="Email Address"
                type="email"
                fullWidth
                required
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                disabled={editSubmitting}
              />

              <TextField
                label="New Password (optional)"
                placeholder="Leave blank to keep current"
                type="password"
                fullWidth
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                disabled={editSubmitting}
              />

              <Box display="flex" justifyContent="flex-end" gap={1.5} mt={1}>
                <Button
                  variant="text"
                  onClick={() => setEditDialogOpen(false)}
                  disabled={editSubmitting}
                  sx={{ textTransform: 'none' }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={editSubmitting || (editUsername === user.username && editEmail === user.email && !editPassword)}
                  endIcon={editSubmitting ? <CircularProgress size={20} color="inherit" /> : null}
                  sx={{ borderRadius: '20px', px: 3, textTransform: 'none' }}
                >
                  {editSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Box>
          </form>
        </Box>
      </Dialog>
    </Container>
  );
};

export default Profile;
