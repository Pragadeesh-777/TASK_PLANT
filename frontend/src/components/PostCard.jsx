import React, { useState, useContext } from 'react';
import { Card, CardHeader, CardContent, CardActions, Avatar, Typography, IconButton, Box, Collapse, TextField, Button, Divider, Alert, Tooltip } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SendIcon from '@mui/icons-material/Send';
import { AuthContext } from '../context/AuthContext';
import CommentBox from './CommentBox';
import API from '../services/api';

const PostCard = ({ post }) => {
  const { user } = useContext(AuthContext);
  
  // Local state for instant (optimistic) UI updates
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState(post.comments || []);
  const [commentsExpanded, setCommentsExpanded] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [error, setError] = useState(null);

  const isLiked = user 
    ? likes.some((like) => (like && typeof like === 'object' ? like._id === user._id : like === user._id)) 
    : false;

  const likedUsernames = likes
    .map((like) => (like && typeof like === 'object' ? like.username : ''))
    .filter(Boolean)
    .join(', ');

  // Relative Time Formatter
  const formatTime = (dateString) => {
    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now - past;
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  };

  // Optimistic Like Handler
  const handleLike = async () => {
    if (!user) {
      setError('You must be logged in to like posts.');
      return;
    }

    const wasLiked = likes.includes(user._id);
    let updatedLikes = [...likes];

    if (wasLiked) {
      updatedLikes = updatedLikes.filter((id) => id !== user._id);
    } else {
      updatedLikes.push(user._id);
    }

    // Set local state instantly
    setLikes(updatedLikes);

    try {
      const { data } = await API.post(`/posts/${post._id}/like`);
      // Sync with final server state
      setLikes(data.likes);
    } catch (err) {
      console.error('Failed to like post:', err);
      // Revert to original server values on network fail
      setLikes(post.likes);
      setError('Could not update like. Please try again.');
    }
  };

  // Comments Toggle Drawer
  const handleToggleComments = () => {
    setCommentsExpanded(!commentsExpanded);
  };

  // Comment Submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in to comment.');
      return;
    }

    if (!commentText.trim()) return;

    setSubmittingComment(true);
    setError(null);

    try {
      const { data } = await API.post(`/posts/${post._id}/comment`, {
        text: commentText.trim(),
      });
      // Update local comments lists
      setComments(data.comments);
      setCommentText('');
    } catch (err) {
      console.error('Failed to comment on post:', err);
      setError(err.response?.data?.message || 'Could not add comment.');
    } finally {
      setSubmittingComment(false);
    }
  };

  return (
    <Card 
      className="fade-in"
      sx={{ 
        mb: 3, 
        '&:hover': {
          boxShadow: '0 16px 36px rgba(0, 0, 0, 0.3)',
          transform: 'translateY(-2px)'
        }
      }}
    >
      {/* Header with Avatar and Timestamp */}
      <CardHeader
        avatar={
          <Avatar 
            sx={{ 
              background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)', 
              fontFamily: '"Outfit", sans-serif',
              fontWeight: 700,
              boxShadow: '0 2px 8px rgba(139, 92, 246, 0.2)'
            }}
          >
            {post.username.substring(0, 2).toUpperCase()}
          </Avatar>
        }
        title={
          <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2, fontFamily: '"Outfit", sans-serif' }}>
            {post.username}
          </Typography>
        }
        subheader={
          <Typography variant="caption" color="text.secondary">
            {formatTime(post.createdAt)}
          </Typography>
        }
        sx={{ pb: 1.5, pt: 2.2, px: 2.5 }}
      />

      {/* Main Text Content */}
      {post.text && (
        <CardContent sx={{ pt: 0.5, pb: 2, px: 2.5 }}>
          <Typography variant="body1" color="text.primary" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {post.text}
          </Typography>
        </CardContent>
      )}

      {/* Embedded Base64 Image */}
      {post.image && (
        <Box 
          sx={{ 
            maxHeight: '480px', 
            overflow: 'hidden', 
            borderTop: '1px solid rgba(255, 255, 255, 0.04)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.15)',
            position: 'relative',
            '& img': {
              transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
            },
            '&:hover img': {
              transform: 'scale(1.025)'
            }
          }}
        >
          <img 
            src={post.image} 
            alt="Post content attachment" 
            style={{ 
              width: '100%', 
              maxHeight: '480px', 
              objectFit: 'contain'
            }} 
          />
        </Box>
      )}

      {/* Error display */}
      {error && (
        <Box px={2.5} pt={1.5}>
          <Alert severity="error" size="small" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Box>
      )}

      {/* Action Bars (Likes & Comments counts) */}
      <CardActions sx={{ px: 2.5, py: 1.2, justifyContent: 'space-between' }}>
        <Box display="flex" gap={3}>
          {/* Like Button with Tooltip */}
          <Tooltip title={likedUsernames ? `Liked by: ${likedUsernames}` : 'No likes yet'} arrow>
            <Box display="flex" alignItems="center">
              <IconButton 
                onClick={handleLike} 
                color={isLiked ? 'error' : 'default'} 
                size="medium"
                sx={{
                  transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  '&:hover': {
                    transform: 'scale(1.15)',
                    backgroundColor: 'rgba(239, 68, 68, 0.08)'
                  }
                }}
              >
                {isLiked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
              </IconButton>
              <Typography variant="body2" sx={{ fontWeight: 600, ml: 0.5, color: isLiked ? 'error.light' : 'text.secondary', cursor: 'default' }}>
                {likes.length}
              </Typography>
            </Box>
          </Tooltip>

          {/* Comment Dropdown Trigger */}
          <Box display="flex" alignItems="center">
            <IconButton 
              onClick={handleToggleComments} 
              color={commentsExpanded ? 'secondary' : 'default'} 
              size="medium"
              sx={{
                transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                '&:hover': {
                  transform: 'scale(1.15)',
                  backgroundColor: 'rgba(6, 182, 212, 0.08)'
                }
              }}
            >
              <ChatBubbleOutlineIcon />
            </IconButton>
            <Typography variant="body2" sx={{ fontWeight: 600, ml: 0.5, color: 'text.secondary' }}>
              {comments.length}
            </Typography>
          </Box>
        </Box>
      </CardActions>

      {/* Collapsible Comment Drawer */}
      <Collapse in={commentsExpanded} timeout="auto" unmountOnExit>
        <Divider sx={{ opacity: 0.5 }} />
        <Box sx={{ p: 3, backgroundColor: 'rgba(0, 0, 0, 0.12)' }}>
          
          {/* List of comments */}
          <CommentBox comments={comments} formatTime={formatTime} />

          {/* Comment input form */}
          {user && (
            <form onSubmit={handleCommentSubmit}>
              <Box display="flex" gap={1.5} alignItems="center" mt={2}>
                <Avatar 
                  sx={{ 
                    background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', 
                    width: 32, 
                    height: 32, 
                    fontSize: '0.8rem',
                    fontWeight: 700 
                  }}
                >
                  {user.username.substring(0, 2).toUpperCase()}
                </Avatar>
                <TextField
                  placeholder="Write a comment..."
                  size="small"
                  fullWidth
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  disabled={submittingComment}
                  sx={{ 
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '24px',
                      backgroundColor: 'rgba(0, 0, 0, 0.15)',
                      '& fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.05)',
                      },
                      '&:hover fieldset': {
                        borderColor: 'rgba(255, 255, 255, 0.15)',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                      }
                    }
                  }}
                />
                <IconButton 
                  type="submit" 
                  color="primary" 
                  disabled={submittingComment || !commentText.trim()}
                  sx={{ 
                    backgroundColor: 'rgba(139, 92, 246, 0.1)', 
                    '&:hover': { backgroundColor: 'rgba(139, 92, 246, 0.2)' }
                  }}
                >
                  <SendIcon fontSize="small" />
                </IconButton>
              </Box>
            </form>
          )}
        </Box>
      </Collapse>
    </Card>
  );
};

export default PostCard;
