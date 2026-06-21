import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';

const CommentBox = ({ comments, formatTime }) => {
  // If there are no comments, show an empty state
  if (!comments || comments.length === 0) {
    return (
      <Typography 
        variant="body2" 
        sx={{ 
          py: 3, 
          textAlign: 'center', 
          fontStyle: 'italic',
          color: 'text.secondary' 
        }}
      >
        No comments yet. Be the first to share your thoughts!
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1.5, mb: 2.5 }}>
      {comments.map((comment) => (
        <Box 
          key={comment._id || comment.createdAt} 
          sx={{ 
            display: 'flex', 
            gap: 1.5, 
            alignItems: 'flex-start',
            animation: 'fadeIn 0.3s ease'
          }}
        >
          {/* Avatar with Username Initials */}
          <Avatar 
            sx={{ 
              bgcolor: 'secondary.dark', 
              width: 30, 
              height: 30, 
              fontSize: '0.75rem', 
              fontWeight: 700 
            }}
          >
            {comment.username ? comment.username.substring(0, 2).toUpperCase() : 'U'}
          </Avatar>
          
          {/* Comment Bubble Content */}
          <Box 
            sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.02)', 
              p: 1.5, 
              borderRadius: '14px', 
              border: '1px solid rgba(255, 255, 255, 0.04)', 
              flex: 1 
            }}
          >
            <Box 
              display="flex" 
              justifyContent="space-between" 
              alignItems="center" 
              mb={0.5}
            >
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 700, 
                  fontSize: '0.85rem',
                  color: 'text.primary'
                }}
              >
                {comment.username}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatTime(comment.createdAt)}
              </Typography>
            </Box>
            <Typography 
              variant="body2" 
              color="text.primary" 
              sx={{ 
                fontSize: '0.875rem', 
                whiteSpace: 'pre-wrap',
                lineHeight: 1.4
              }}
            >
              {comment.text}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default CommentBox;
