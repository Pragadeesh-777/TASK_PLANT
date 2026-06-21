import React, { useState, useRef, useContext } from 'react';
import { Card, CardContent, TextField, Button, Box, Typography, IconButton, Alert } from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';
import SendIcon from '@mui/icons-material/Send';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const CreatePost = ({ onPostCreated }) => {
  const { user } = useContext(AuthContext);
  const [text, setText] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const fileInputRef = useRef(null);

  // Read file and convert to Base64 data string
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image file is too large. Limit is 5MB.');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Remove selected image preview
  const handleRemoveImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit new post to API
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text.trim() && !imagePreview) {
      setError('Post content cannot be empty. Please add text or an image.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await API.post('/posts', {
        text: text.trim(),
        image: imagePreview,
      });

      // Clear input fields
      setText('');
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Refresh feed
      if (onPostCreated) {
        onPostCreated(response.data);
      }
    } catch (err) {
      console.error('Error creating post:', err);
      setError(err.response?.data?.message || 'Failed to publish post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Card 
      sx={{ 
        mb: 3, 
        background: 'rgba(16, 16, 29, 0.45)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography 
          variant="subtitle1" 
          sx={{ 
            fontFamily: '"Outfit", sans-serif', 
            fontWeight: 700, 
            mb: 2,
            color: 'text.primary',
            fontSize: '1.05rem'
          }}
        >
          Create a Post
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            placeholder={`What's on your mind, ${user.username}?`}
            multiline
            rows={3}
            fullWidth
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={loading}
            variant="outlined"
            sx={{ 
              mb: 2,
              '& .MuiOutlinedInput-root': {
                backgroundColor: 'rgba(0, 0, 0, 0.12)',
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

          {/* Error Alert Display */}
          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: '10px' }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Selected Image Preview Container */}
          {imagePreview && (
            <Box 
              sx={{ 
                position: 'relative', 
                borderRadius: '16px', 
                overflow: 'hidden', 
                mb: 2.5,
                maxHeight: '280px',
                border: '1px solid rgba(255,255,255,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'rgba(0,0,0,0.25)',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.3)',
                '& img': {
                  transition: 'transform 0.4s ease',
                },
                '&:hover img': {
                  transform: 'scale(1.015)'
                }
              }}
            >
              <img 
                src={imagePreview} 
                alt="Upload preview" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '280px',
                  objectFit: 'contain'
                }} 
              />
              <IconButton 
                onClick={handleRemoveImage}
                sx={{ 
                  position: 'absolute', 
                  top: 10, 
                  right: 10, 
                  backgroundColor: 'rgba(0, 0, 0, 0.7)', 
                  color: 'white',
                  backdropFilter: 'blur(4px)',
                  '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.85)' }
                }}
                size="small"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          )}

          {/* Actions Bar */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            {/* Image Upload Input */}
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              id="post-image-file"
              ref={fileInputRef}
              onChange={handleImageChange}
              disabled={loading}
            />
            <label htmlFor="post-image-file">
              <Button
                variant="outlined"
                component="span"
                color="secondary"
                startIcon={<PhotoCameraIcon />}
                disabled={loading}
                sx={{ 
                  borderRadius: 2.2, 
                  borderColor: 'rgba(6, 182, 212, 0.25)',
                  px: 2.5,
                  py: 1,
                  '&:hover': {
                    borderColor: 'secondary.main',
                    backgroundColor: 'rgba(6, 182, 212, 0.05)'
                  }
                }}
              >
                Upload Photo
              </Button>
            </label>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || (!text.trim() && !imagePreview)}
              endIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
              sx={{ 
                borderRadius: 2.2,
                px: 3.5,
                py: 1
              }}
            >
              {loading ? 'Posting...' : 'Post'}
            </Button>
          </Box>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreatePost;
