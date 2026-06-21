import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { Grid, Box, Typography, Button, Container, Card, CardContent, List, ListItem, ListItemText, ListItemIcon, Skeleton, Snackbar, Alert } from '@mui/material';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import Sidebar from '../components/Sidebar';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

// Loading Skeleton component for Posts
const PostSkeleton = () => (
  <Card sx={{ mb: 3 }}>
    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
      <Skeleton variant="circular" width={40} height={40} animation="wave" />
      <Box sx={{ flex: 1 }}>
        <Skeleton variant="text" width="30%" height={15} animation="wave" />
        <Skeleton variant="text" width="15%" height={10} animation="wave" sx={{ mt: 1 }} />
      </Box>
    </Box>
    <CardContent sx={{ pt: 0 }}>
      <Skeleton variant="text" width="95%" height={12} animation="wave" />
      <Skeleton variant="text" width="80%" height={12} animation="wave" sx={{ mt: 1 }} />
    </CardContent>
    <Skeleton variant="rectangular" height={220} animation="wave" />
    <Box sx={{ p: 2, display: 'flex', gap: 3 }}>
      <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} animation="wave" />
      <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} animation="wave" />
    </Box>
  </Card>
);

const Feed = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  
  // Loading states
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // Toast notification states
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState('success'); // 'success' | 'error' | 'info' | 'warning'

  // Fetch initial posts on mount
  useEffect(() => {
    fetchPosts(1, true);
  }, []);

  const fetchPosts = async (pageNum, isInitial = false) => {
    try {
      if (isInitial) setInitialLoading(true);
      else setLoadingMore(true);

      setError(null);
      const { data } = await API.get(`/posts?page=${pageNum}&limit=5`);

      if (isInitial) {
        setPosts(data.posts);
      } else {
        setPosts((prev) => [...prev, ...data.posts]);
      }

      setHasMore(data.currentPage < data.totalPages);
      setPage(data.currentPage);
    } catch (err) {
      console.error('Failed to load posts feed:', err);
      setError('Could not download social feed. Please refresh the page.');
      triggerToast('Could not download social feed.', 'error');
    } finally {
      setInitialLoading(false);
      setLoadingMore(false);
    }
  };

  // Helper to open toast notification
  const triggerToast = (message, severity = 'success') => {
    setToastMessage(message);
    setToastSeverity(severity);
    setToastOpen(true);
  };

  // Callback to append new post instantly at top of feed
  const handlePostCreated = (newPost) => {
    setPosts((prev) => [newPost, ...prev]);
    triggerToast('Post published successfully!', 'success');
  };

  const handleLoadMore = () => {
    fetchPosts(page + 1, false);
  };

  const handleCloseToast = (event, reason) => {
    if (reason === 'clickaway') return;
    setToastOpen(false);
  };

  // Mock list of hot hashtags
  const trendingTags = [
    { name: 'javascript', posts: '12.4k' },
    { name: 'reactjs', posts: '8.1k' },
    { name: 'materialui', posts: '3.5k' },
    { name: 'fullstack', posts: '5.9k' },
    { name: 'webdesign', posts: '9.2k' },
  ];

  // Filter posts locally based on Navbar search query
  const queryParams = new URLSearchParams(location.search);
  const searchVal = queryParams.get('search') || '';
  
  const filteredPosts = posts.filter((post) => {
    if (!searchVal) return true;
    const query = searchVal.toLowerCase();
    return (
      post.text?.toLowerCase().includes(query) ||
      post.username?.toLowerCase().includes(query)
    );
  });

  return (
    <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
      <Grid container spacing={4}>
        {/* Left Column: User stats profile (3/12 width) - Desktop only */}
        <Grid item xs={12} md={3} sx={{ display: { xs: 'none', md: 'block' } }}>
          <Sidebar />
        </Grid>

        {/* Center Column: Post creator + feed (6/12 width) */}
        <Grid item xs={12} md={6}>
          {/* Create Post Module */}
          {user && <CreatePost onPostCreated={handlePostCreated} />}

          {/* Initial Loading Skeletons */}
          {initialLoading ? (
            <Box>
              <PostSkeleton />
              <PostSkeleton />
            </Box>
          ) : error ? (
            <Card sx={{ p: 3, textAlign: 'center', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
              <Typography variant="body1" color="error">
                {error}
              </Typography>
              <Button variant="outlined" color="primary" onClick={() => fetchPosts(1, true)} sx={{ mt: 2 }}>
                Reload Feed
              </Button>
            </Card>
          ) : posts.length === 0 ? (
            /* Empty State */
            <Card sx={{ p: 5, textAlign: 'center', background: 'rgba(255, 255, 255, 0.01)' }}>
              <Box sx={{ fontSize: '3rem', mb: 2 }}>📭</Box>
              <Typography variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 600 }}>
                Your Feed is Quiet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: '280px', mx: 'auto' }}>
                There are no posts here yet. Share your first updates with the world!
              </Typography>
            </Card>
          ) : (
            /* Active Post Cards list */
            <Box>
              {filteredPosts.length === 0 && searchVal ? (
                <Card sx={{ p: 4, textAlign: 'center', border: '1px dashed', borderColor: 'divider', background: 'transparent' }}>
                  <Typography variant="body1" color="text.secondary">
                    No posts matched your search: "<b>{searchVal}</b>"
                  </Typography>
                </Card>
              ) : (
                filteredPosts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))
              )}

              {/* Load More Pagination controls */}
              {hasMore && (
                <Box display="flex" justifyContent="center" mt={4} mb={6}>
                  <Button
                    variant="outlined"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    sx={{
                      px: 4,
                      py: 1,
                      borderRadius: 6,
                      color: 'secondary.light',
                      borderColor: 'rgba(6, 182, 212, 0.25)',
                      '&:hover': {
                        borderColor: 'secondary.main',
                        backgroundColor: 'rgba(6, 182, 212, 0.05)',
                      },
                    }}
                  >
                    {loadingMore ? 'Loading More...' : 'Load More Posts'}
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Grid>

        {/* Right Column: Trending widgets (3/12 width) - Desktop only */}
        <Grid item xs={12} md={3} sx={{ display: { xs: 'none', md: 'block' } }}>
          <Card sx={{ position: 'sticky', top: 94 }}>
            <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
              <Typography variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocalFireDepartmentIcon sx={{ color: 'orange' }} /> Trending Topics
              </Typography>
              <List disablePadding>
                {trendingTags.map((tag, idx) => (
                  <ListItem key={tag.name} disableGutters sx={{ py: 1.2, borderBottom: idx < trendingTags.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none' }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <Typography variant="body1" fontWeight={700} color="primary.light">#</Typography>
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography variant="body2" fontWeight={600} color="text.primary" sx={{ cursor: 'pointer', '&:hover': { color: 'primary.light' } }}>
                          {tag.name}
                        </Typography>
                      }
                      secondary={<Typography variant="caption" color="text.secondary">{tag.posts} posts</Typography>}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Global Toast Alert Notifications Popup */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseToast} 
          severity={toastSeverity} 
          variant="filled"
          sx={{ 
            width: '100%', 
            borderRadius: '10px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            fontFamily: '"Outfit", sans-serif',
            fontWeight: 500
          }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Feed;
