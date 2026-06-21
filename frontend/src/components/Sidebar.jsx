import React, { useContext, useState } from 'react';
import { Card, CardContent, Typography, Avatar, Box, Divider, useTheme, Button, Alert, Snackbar, Tooltip } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import WalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import API from '../services/api';

const Sidebar = () => {
  const { user, setUser } = useContext(AuthContext);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [claiming, setClaiming] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  if (!user) return null;

  const handleClaimDaily = async () => {
    setClaiming(true);
    try {
      const { data } = await API.post('/auth/claim-daily');
      setUser(prev => ({
        ...prev,
        coins: data.coins,
        loginStreak: data.streak
      }));
      setToast({ open: true, message: data.message, severity: 'success' });
    } catch (err) {
      setToast({ 
        open: true, 
        message: err.response?.data?.message || 'Could not claim bonus today.', 
        severity: 'info' 
      });
    } finally {
      setClaiming(false);
    }
  };

  const handleCloseToast = () => setToast(prev => ({ ...prev, open: false }));

  return (
    <Card 
      sx={{ 
        position: 'sticky', 
        top: 94,
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: isDark ? '0 16px 40px 0 rgba(0, 0, 0, 0.3)' : '0 8px 24px rgba(148,163,184,0.08)',
        }
      }}
    >
      <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
        {/* User Card Header */}
        <Box 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          textAlign="center" 
          mb={2}
        >
          <Avatar 
            sx={{ 
              background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)', 
              width: 72, 
              height: 72, 
              mb: 1.8, 
              fontSize: '1.6rem', 
              fontWeight: 800,
              fontFamily: '"Outfit", sans-serif',
              boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)'
            }}
          >
            {user.username.substring(0, 2).toUpperCase()}
          </Avatar>
          <Typography 
            variant="h6" 
            sx={{ 
              fontWeight: 700, 
              fontFamily: '"Outfit", sans-serif',
              color: 'text.primary',
              lineHeight: 1.2
            }}
          >
            {user.username}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              mt: 0.5,
              wordBreak: 'break-all'
            }}
          >
            {user.email}
          </Typography>
        </Box>

        {/* Live Wallet Box */}
        <Box 
          p={2} 
          my={2} 
          sx={{ 
            borderRadius: '14px',
            border: '1px solid',
            borderColor: 'divider',
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)'
          }}
        >
          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
            <WalletIcon color="primary" sx={{ fontSize: 18, opacity: 0.8 }} />
            <Typography variant="caption" color="text.secondary" fontWeight={600}>WALLETS BALANCE</Typography>
          </Box>
          <Typography variant="h5" fontWeight={850} color="primary.main" fontFamily="'Outfit', sans-serif">
            🪙 {user.coins || 0} Coins
          </Typography>
        </Box>

        {/* Daily Bonus Button */}
        <Tooltip title={user.loginStreak > 0 ? `Current Streak: ${user.loginStreak} days 🔥` : 'Claim your daily coins!'} arrow placement="top">
          <Button
            variant="contained"
            fullWidth
            onClick={handleClaimDaily}
            disabled={claiming}
            startIcon={<EmojiEventsIcon />}
            sx={{
              mb: 2.5,
              py: 1,
              borderRadius: '12px',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#fff',
              boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)',
              '&:hover': {
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
              }
            }}
          >
            {claiming ? 'Claiming...' : 'Claim Daily Bonus'}
          </Button>
        </Tooltip>

        <Divider sx={{ mb: 2.2, opacity: 0.4 }} />

        {/* Stats Section */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.8} sx={{ py: 0.2 }}>
          <Box display="flex" alignItems="center" gap={1.2}>
            <PersonOutlineIcon sx={{ color: 'primary.light', fontSize: 20 }} />
            <Typography variant="body2" color="text.secondary">Role Status</Typography>
          </Box>
          <Typography 
            variant="body2" 
            fontWeight={700} 
            color="secondary.light"
            sx={{ 
              backgroundColor: 'rgba(6, 182, 212, 0.1)', 
              px: 1.2, 
              py: 0.3, 
              borderRadius: '12px',
              fontSize: '0.75rem',
              letterSpacing: '0.3px'
            }}
          >
            Contributor
          </Typography>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.8} sx={{ py: 0.2 }}>
          <Box display="flex" alignItems="center" gap={1.2}>
            <FavoriteBorderIcon sx={{ color: '#ef4444', fontSize: 18 }} />
            <Typography variant="body2" color="text.secondary">Likes Received</Typography>
          </Box>
          <Typography 
            variant="body2" 
            fontWeight={700} 
            color="text.primary"
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              minWidth: 26,
              textAlign: 'center',
              py: 0.2,
              borderRadius: '6px',
              fontSize: '0.8rem'
            }}
          >
            18
          </Typography>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ py: 0.2 }}>
          <Box display="flex" alignItems="center" gap={1.2}>
            <ChatBubbleOutlineIcon sx={{ color: '#06b6d4', fontSize: 18 }} />
            <Typography variant="body2" color="text.secondary">Comments Posted</Typography>
          </Box>
          <Typography 
            variant="body2" 
            fontWeight={700} 
            color="text.primary"
            sx={{
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
              minWidth: 26,
              textAlign: 'center',
              py: 0.2,
              borderRadius: '6px',
              fontSize: '0.8rem'
            }}
          >
            9
          </Typography>
        </Box>
      </CardContent>

      <Snackbar open={toast.open} autoHideDuration={3000} onClose={handleCloseToast} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={handleCloseToast} severity={toast.severity} sx={{ width: '100%', borderRadius: '12px' }} variant="filled">
          {toast.message}
        </Alert>
      </Snackbar>
    </Card>
  );
};

export default Sidebar;
