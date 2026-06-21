import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Container, Card, CardContent, Typography, TextField, Button, Box, Link, Alert, CircularProgress, InputAdornment, IconButton } from '@mui/material';
import HubIcon from '@mui/icons-material/Hub';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { AuthContext } from '../context/AuthContext';

const Signup = () => {
  const { signup, user, loading } = useContext(AuthContext);
  const navigate = useNavigate();

  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Interaction states
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Core client-side validations
    if (!username || !email || !password) {
      setError('All fields are required.');
      return;
    }
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const result = await signup(username.trim(), email.trim(), password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
      setSubmitting(false);
    }
  };

  return (
    <Container 
      className="fade-in"
      maxWidth="xs" 
      sx={{ 
        mt: 8, 
        mb: 4, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        position: 'relative'
      }}
    >
      {/* Ambient background glow behind the card */}
      <Box
        sx={{
          position: 'absolute',
          top: '55%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '380px',
          height: '380px',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.08) 50%, transparent 70%)',
          zIndex: -1,
          filter: 'blur(40px)',
          animation: 'pulseGlow 6s ease-in-out infinite',
          pointerEvents: 'none',
        }}
      />
      
      {/* Platform Branding Logo */}
      <Box 
        display="flex" 
        alignItems="center" 
        mb={4}
        sx={{
          cursor: 'default',
          '& svg': {
            transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          },
          '&:hover svg': {
            transform: 'rotate(180deg) scale(1.1)',
          }
        }}
      >
        <HubIcon sx={{ mr: 1.5, color: 'primary.main', fontSize: 40 }} />
        <Typography 
          variant="h4" 
          sx={{ 
            fontFamily: '"Outfit", sans-serif', 
            fontWeight: 800, 
            letterSpacing: '0.5px' 
          }}
        >
          Social<span style={{ color: '#06b6d4' }}>Connect</span>
        </Typography>
      </Box>

      {/* Register Form Card */}
      <Card sx={{ width: '100%', position: 'relative' }}>
        <CardContent sx={{ p: 4.5 }}>
          <Typography 
            variant="h5" 
            align="center" 
            sx={{ 
              fontFamily: '"Outfit", sans-serif', 
              fontWeight: 700, 
              mb: 3.5, 
              color: 'text.primary' 
            }}
          >
            Create an Account
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: '10px' }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box display="flex" flexDirection="column" gap={2.5}>
              <TextField
                label="Username"
                variant="outlined"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={submitting}
                autoFocus
              />

              <TextField
                label="Email Address"
                type="email"
                variant="outlined"
                fullWidth
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={submitting}
              />

              <TextField
                label="Password"
                type={showPassword ? 'text' : 'password'}
                variant="outlined"
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={submitting}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={toggleShowPassword} edge="end" disabled={submitting}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={submitting}
                sx={{ mt: 1.5, py: 1.6, borderRadius: '28px' }}
              >
                {submitting ? <CircularProgress size={24} color="inherit" /> : 'Register'}
              </Button>
            </Box>
          </form>

          <Box mt={4} textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Link component={RouterLink} to="/login" fontWeight={600} color="secondary.main">
                Log In
              </Link>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Signup;
