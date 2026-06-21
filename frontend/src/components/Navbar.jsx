import React, { useContext, useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, IconButton, Avatar, Box, Container, Tooltip, Badge, Menu, MenuItem, InputBase } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import { ThemeModeContext } from '../App';
import LogoutIcon from '@mui/icons-material/Logout';
import HubIcon from '@mui/icons-material/Hub';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import PersonIcon from '@mui/icons-material/Person';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { mode, toggleThemeMode } = useContext(ThemeModeContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Menu anchors
  const [notifAnchor, setNotifAnchor] = useState(null);

  // Sync search input with URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchQuery(params.get('search') || '');
  }, [location.search]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/feed?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/feed');
    }
  };

  const handleSearchClear = (e) => {
    if (e.target.value === '') {
      navigate('/feed');
    }
  };

  // Mock notifications list
  const mockNotifications = [
    { id: 1, text: '🏆 Daily Quiz proof approved (+100 coins)', time: '5m ago' },
    { id: 2, text: '❤️ pragadeesh liked your post', time: '1h ago' },
    { id: 3, text: '💬 admin commented on your post', time: '2h ago' }
  ];

  return (
    <AppBar position="sticky" sx={{ zIndex: 1100 }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ justifyContent: 'space-between', height: 74, gap: { xs: 1.5, md: 3 } }}>
          
          {/* Logo / Branding */}
          <Box 
            component={Link} 
            to="/" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              textDecoration: 'none', 
              color: 'inherit',
              flexShrink: 0,
              '& svg': {
                transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
              },
              '&:hover svg': {
                transform: 'rotate(180deg) scale(1.1)',
              }
            }}
          >
            <HubIcon sx={{ mr: 1, color: 'primary.main', fontSize: 32 }} />
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: '"Outfit", sans-serif', 
                fontWeight: 800, 
                letterSpacing: '0.5px',
                fontSize: { xs: '1.15rem', sm: '1.25rem' }
              }}
            >
              Task<span style={{ color: '#06b6d4' }}>Social</span>
            </Typography>
          </Box>

          {/* Desktop Navigation Links */}
          {user && (
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3.5, ml: 4, mr: 'auto' }}>
              <Link to="/" style={{ textDecoration: 'none', color: location.pathname === '/' ? '#8b5cf6' : '#94a3b8', fontWeight: 700, fontSize: '0.9rem', fontFamily: '"Outfit", sans-serif', transition: 'color 0.2s' }}>
                Home
              </Link>
              <Link to="/feed" style={{ textDecoration: 'none', color: location.pathname === '/feed' ? '#8b5cf6' : '#94a3b8', fontWeight: 700, fontSize: '0.9rem', fontFamily: '"Outfit", sans-serif', transition: 'color 0.2s' }}>
                Social
              </Link>
              <Link to="/quiz" style={{ textDecoration: 'none', color: location.pathname === '/quiz' ? '#8b5cf6' : '#94a3b8', fontWeight: 700, fontSize: '0.9rem', fontFamily: '"Outfit", sans-serif', transition: 'color 0.2s' }}>
                Quiz
              </Link>
              <Link to="/leaderboard" style={{ textDecoration: 'none', color: location.pathname === '/leaderboard' ? '#8b5cf6' : '#94a3b8', fontWeight: 700, fontSize: '0.9rem', fontFamily: '"Outfit", sans-serif', transition: 'color 0.2s' }}>
                Leaderboard
              </Link>
            </Box>
          )}

          {/* Search Box (Desktop and Tablet) */}
          {user && (
            <Box 
              component="form" 
              onSubmit={handleSearchSubmit}
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                px: 2,
                py: 0.5,
                borderRadius: '30px',
                border: '1px solid',
                borderColor: 'divider',
                flexGrow: 1,
                maxWidth: '420px',
                transition: 'all 0.25s ease',
                '&:focus-within': {
                  borderColor: 'primary.main',
                  backgroundColor: mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#ffffff',
                  boxShadow: '0 4px 12px rgba(139, 92, 246, 0.08)'
                }
              }}
            >
              <InputBase
                placeholder="Search community posts..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  handleSearchClear(e);
                }}
                sx={{ 
                  flex: 1, 
                  fontSize: '0.875rem',
                  color: 'text.primary',
                  '& input::placeholder': {
                    color: 'text.secondary',
                    opacity: 1
                  }
                }}
              />
              <IconButton type="submit" size="small" sx={{ p: 0.5 }}>
                <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              </IconButton>
            </Box>
          )}
          
          {/* Actions & Profiles */}
          <Box display="flex" alignItems="center" gap={{ xs: 0.5, sm: 1.5 }}>
            {user ? (
              <>
                {/* Theme Mode Toggle Button */}
                <Tooltip title={`Switch to ${mode === 'light' ? 'Dark' : 'Light'} Mode`}>
                  <IconButton onClick={toggleThemeMode} color="inherit" size="medium" sx={{ p: 1 }}>
                    {mode === 'light' ? <DarkModeIcon fontSize="small" /> : <LightModeIcon fontSize="small" />}
                  </IconButton>
                </Tooltip>

                {/* Notifications Bell */}
                <Tooltip title="Notifications">
                  <IconButton 
                    onClick={(e) => setNotifAnchor(e.currentTarget)} 
                    color="inherit" 
                    size="medium"
                    sx={{ p: 1 }}
                  >
                    <Badge badgeContent={mockNotifications.length} color="error">
                      <NotificationsIcon fontSize="small" />
                    </Badge>
                  </IconButton>
                </Tooltip>

                {/* Notifications Menu */}
                <Menu
                  anchorEl={notifAnchor}
                  open={Boolean(notifAnchor)}
                  onClose={() => setNotifAnchor(null)}
                  PaperProps={{
                    sx: {
                      mt: 1.5,
                      width: 290,
                      borderRadius: '16px',
                      border: '1px solid',
                      borderColor: 'divider',
                      boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                    }
                  }}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                >
                  <Box px={2.2} py={1.5} borderBottom="1px solid" borderColor="divider">
                    <Typography variant="subtitle2" fontWeight={750}>Notifications</Typography>
                  </Box>
                  {mockNotifications.map((notif) => (
                    <MenuItem 
                      key={notif.id} 
                      onClick={() => setNotifAnchor(null)}
                      sx={{ py: 1.6, px: 2.2, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', borderBottom: '1px solid rgba(0,0,0,0.03)' }}
                    >
                      <Typography variant="body2" sx={{ whiteSpace: 'normal', lineHeight: 1.4, fontSize: '0.82rem' }}>
                        {notif.text}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.72rem' }}>
                        {notif.time}
                      </Typography>
                    </MenuItem>
                  ))}
                </Menu>

                {/* User Info Capsule (Desktop only) */}
                <Box 
                  onClick={() => navigate('/profile')}
                  sx={{ 
                    display: { xs: 'none', md: 'flex' }, 
                    alignItems: 'center', 
                    gap: 1.5,
                    backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
                    padding: '5px 16px 5px 6px',
                    borderRadius: '24px',
                    border: '1px solid',
                    borderColor: 'divider',
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.04)',
                      borderColor: 'primary.main',
                    }
                  }}
                >
                  <Avatar 
                    sx={{ 
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)', 
                      width: 32, 
                      height: 32, 
                      fontSize: '0.8rem', 
                      fontWeight: 700, 
                      fontFamily: '"Outfit", sans-serif',
                      boxShadow: '0 2px 10px rgba(139, 92, 246, 0.2)'
                    }}
                  >
                    {user.username.substring(0, 2).toUpperCase()}
                  </Avatar>
                  <Typography 
                    variant="subtitle2" 
                    sx={{ 
                      fontWeight: 650,
                      color: 'text.primary'
                    }}
                  >
                    {user.username}
                  </Typography>
                </Box>

                {/* User Avatar (Mobile only) */}
                <IconButton 
                  onClick={() => navigate('/profile')}
                  sx={{ display: { xs: 'inline-flex', md: 'none' }, p: 0.5 }}
                >
                  <Avatar 
                    sx={{ 
                      background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', 
                      width: 34, 
                      height: 34, 
                      fontSize: '0.85rem', 
                      fontWeight: 700 
                    }}
                  >
                    {user.username.substring(0, 2).toUpperCase()}
                  </Avatar>
                </IconButton>

                {/* Logout Button (Desktop only) */}
                <IconButton 
                  onClick={handleLogout} 
                  color="error" 
                  title="Logout" 
                  sx={{ 
                    display: { xs: 'none', sm: 'inline-flex' },
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2.2,
                    padding: '8px',
                    '&:hover': {
                      backgroundColor: 'rgba(239, 68, 68, 0.08)',
                      borderColor: 'error.main'
                    }
                  }}
                >
                  <LogoutIcon fontSize="small" />
                </IconButton>
              </>
            ) : (
              <>
                <Button component={Link} to="/login" variant="text" size="medium">
                  Login
                </Button>
                <Button component={Link} to="/signup" variant="contained" color="primary" size="medium">
                  Register
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
