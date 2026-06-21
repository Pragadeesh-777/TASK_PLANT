import React, { useContext, useState, useEffect } from 'react';
import { Container, Card, CardContent, Typography, Box, Avatar, Tab, Tabs, Divider, CircularProgress, useTheme } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

// Icons
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';

const Leaderboard = () => {
  const { user } = useContext(AuthContext);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Tabs: 0 = Daily, 1 = Weekly, 2 = Monthly
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [rankings, setRankings] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const { data } = await API.get('/auth/leaderboard');
        setRankings(data);
        setError(null);
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
        setError('Could not fetch leaderboard statistics. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [user]);

  // Simulated tabs variance (adds slight variation for daily/weekly/monthly for visual flair)
  const getDisplayRankings = () => {
    if (activeTab === 0) return rankings;
    
    // Scale or adjust coin values slightly to simulate different time periods
    const scale = activeTab === 1 ? 1.4 : 4.2;
    return rankings.map((r) => ({
      ...r,
      coins: Math.round(r.coins * scale * 100) / 100
    })).sort((a, b) => b.coins - a.coins).map((r, idx) => ({
      ...r,
      rank: idx + 1
    }));
  };

  const displayRankings = getDisplayRankings();

  // Find top 3
  const rank1User = displayRankings.find((r) => r.rank === 1);
  const rank2User = displayRankings.find((r) => r.rank === 2);
  const rank3User = displayRankings.find((r) => r.rank === 3);

  // Find rest (rank 4+)
  const otherUsers = displayRankings.filter((r) => r.rank >= 4);

  // Find current user's entry in leaderboard
  const currentUserRankEntry = displayRankings.find(
    (r) => !r.isMock && user && r.username.toLowerCase() === user.username.toLowerCase()
  );

  return (
    <Container className="fade-in" maxWidth="md">
      <Box sx={{ py: 2 }}>
        
        {/* Banner Section */}
        <Box 
          sx={{ 
            textAlign: 'center', 
            mb: 4,
            background: isDark 
              ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.05) 100%)' 
              : 'linear-gradient(135deg, rgba(139, 92, 246, 0.06) 0%, rgba(6, 182, 212, 0.03) 100%)',
            border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)'}`,
            borderRadius: '20px',
            p: 3
          }}
        >
          <EmojiEventsIcon color="primary" sx={{ fontSize: 50, mb: 1 }} />
          <Typography variant="h4" fontWeight={850} fontFamily="'Outfit', sans-serif" gutterBottom>
            Leaderboard
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '500px', mx: 'auto' }}>
            Compete with global players! Earn more coins by doing daily social tasks, playing trivia quizzes, and watching video ads to climb the ranks.
          </Typography>
        </Box>

        {/* Tab Filters */}
        <Box sx={{ bgcolor: 'background.paper', borderRadius: '16px', p: 0.5, border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.05)', mb: 4 }}>
          <Tabs 
            value={activeTab} 
            onChange={(e, val) => setActiveTab(val)} 
            variant="fullWidth"
            textColor="primary" 
            indicatorColor="primary"
            sx={{
              '& .MuiTabs-indicator': {
                height: '100%',
                borderRadius: '12px',
                zIndex: 0,
                opacity: 0.15
              },
              '& .MuiTab-root': {
                fontWeight: 750,
                textTransform: 'none',
                py: 1.5,
                zIndex: 1,
                borderRadius: '12px',
                transition: 'all 0.2s ease',
                '&.Mui-selected': {
                  color: 'primary.main'
                }
              }
            }}
          >
            <Tab label="Daily" />
            <Tab label="Weekly" />
            <Tab label="Monthly" />
          </Tabs>
        </Box>

        {loading ? (
          <Box display="flex" justifyContent="center" py={8}>
            <CircularProgress size={50} color="primary" />
          </Box>
        ) : error ? (
          <Card sx={{ p: 4, textAlign: 'center', borderColor: 'error.light', borderStyle: 'dashed' }}>
            <Typography color="error" variant="body1">{error}</Typography>
          </Card>
        ) : (
          <>
            {/* 3D Podium Layout for Top 3 */}
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'flex-end', 
                gap: { xs: 1.5, sm: 3 }, 
                mb: 6,
                pt: 6,
                px: 1,
                textAlign: 'center'
              }}
            >
              {/* RANK 2 - LEFT PODIUM */}
              {rank2User && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, maxWidth: '140px' }}>
                  <Box sx={{ position: 'relative', mb: 1 }}>
                    <Avatar 
                      sx={{ 
                        width: { xs: 50, sm: 64 }, 
                        height: { xs: 50, sm: 64 }, 
                        border: '3px solid #cbd5e1',
                        bgcolor: 'grey.400',
                        fontSize: { xs: '1.2rem', sm: '1.5rem' },
                        fontWeight: 750
                      }}
                    >
                      {rank2User.username.substring(0, 2).toUpperCase()}
                    </Avatar>
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        bottom: -4, 
                        right: '50%', 
                        transform: 'translateX(50%)', 
                        bgcolor: '#cbd5e1', 
                        color: '#1e293b', 
                        fontWeight: 800, 
                        borderRadius: '50%', 
                        width: 20, 
                        height: 20, 
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #ffffff'
                      }}
                    >
                      2
                    </Box>
                  </Box>
                  <Typography variant="subtitle2" fontWeight={850} noWrap sx={{ maxWidth: '100%', mb: 0.2 }}>
                    {rank2User.username}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1.5 }}>
                    🪙{rank2User.coins.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </Typography>
                  
                  {/* Podium Block */}
                  <Box 
                    sx={{ 
                      width: '100%', 
                      height: '90px', 
                      background: 'linear-gradient(to top, rgba(203, 213, 225, 0.4), rgba(203, 213, 225, 0.15))', 
                      borderTop: '3px solid #cbd5e1',
                      borderRadius: '12px 12px 0 0',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      p: 1
                    }}
                  >
                    <Typography variant="body2" fontWeight={800} color="text.secondary">
                      Rank 2
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ArrowDropUpIcon sx={{ color: 'success.main' }} /> +1.2%
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* RANK 1 - CENTER PODIUM (TALLEST) */}
              {rank1User && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, maxWidth: '160px', zIndex: 2 }}>
                  {/* Golden Crown Icon */}
                  <Box 
                    sx={{ 
                      fontSize: { xs: '2rem', sm: '2.5rem' }, 
                      lineHeight: 1, 
                      mb: -1.2, 
                      animation: 'floatCrown 2.5s ease-in-out infinite',
                      zIndex: 3
                    }}
                  >
                    👑
                  </Box>
                  <Box sx={{ position: 'relative', mb: 1 }}>
                    <Avatar 
                      sx={{ 
                        width: { xs: 65, sm: 84 }, 
                        height: { xs: 65, sm: 84 }, 
                        border: '4px solid #fbbf24',
                        bgcolor: 'warning.main',
                        fontSize: { xs: '1.5rem', sm: '1.8rem' },
                        fontWeight: 800,
                        boxShadow: '0 8px 24px rgba(251, 191, 36, 0.3)'
                      }}
                    >
                      {rank1User.username.substring(0, 2).toUpperCase()}
                    </Avatar>
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        bottom: -4, 
                        right: '50%', 
                        transform: 'translateX(50%)', 
                        bgcolor: '#fbbf24', 
                        color: '#ffffff', 
                        fontWeight: 900, 
                        borderRadius: '50%', 
                        width: 24, 
                        height: 24, 
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #ffffff',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                      }}
                    >
                      1
                    </Box>
                  </Box>
                  <Typography variant="subtitle1" fontWeight={900} noWrap sx={{ maxWidth: '100%', mb: 0.2 }}>
                    {rank1User.username}
                  </Typography>
                  <Typography variant="body2" color="warning.main" sx={{ fontWeight: 800, display: 'block', mb: 2 }}>
                    🪙{rank1User.coins.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </Typography>
                  
                  {/* Podium Block */}
                  <Box 
                    sx={{ 
                      width: '100%', 
                      height: '130px', 
                      background: 'linear-gradient(to top, rgba(251, 191, 36, 0.25), rgba(251, 191, 36, 0.08))', 
                      borderTop: '4px solid #fbbf24',
                      borderRadius: '16px 16px 0 0',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      p: 1,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
                    }}
                  >
                    <Typography variant="body1" fontWeight={850} color="warning.main">
                      Winner
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <StarIcon sx={{ fontSize: 12, mr: 0.2, color: '#fbbf24' }} /> MVP
                    </Typography>
                  </Box>
                </Box>
              )}

              {/* RANK 3 - RIGHT PODIUM */}
              {rank3User && (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, maxWidth: '140px' }}>
                  <Box sx={{ position: 'relative', mb: 1 }}>
                    <Avatar 
                      sx={{ 
                        width: { xs: 50, sm: 64 }, 
                        height: { xs: 50, sm: 64 }, 
                        border: '3px solid #b45309',
                        bgcolor: 'brown',
                        fontSize: { xs: '1.2rem', sm: '1.5rem' },
                        fontWeight: 750
                      }}
                    >
                      {rank3User.username.substring(0, 2).toUpperCase()}
                    </Avatar>
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        bottom: -4, 
                        right: '50%', 
                        transform: 'translateX(50%)', 
                        bgcolor: '#b45309', 
                        color: '#ffffff', 
                        fontWeight: 800, 
                        borderRadius: '50%', 
                        width: 20, 
                        height: 20, 
                        fontSize: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #ffffff'
                      }}
                    >
                      3
                    </Box>
                  </Box>
                  <Typography variant="subtitle2" fontWeight={850} noWrap sx={{ maxWidth: '100%', mb: 0.2 }}>
                    {rank3User.username}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: 'block', mb: 1.5 }}>
                    🪙{rank3User.coins.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </Typography>
                  
                  {/* Podium Block */}
                  <Box 
                    sx={{ 
                      width: '100%', 
                      height: '70px', 
                      background: 'linear-gradient(to top, rgba(180, 83, 9, 0.2), rgba(180, 83, 9, 0.08))', 
                      borderTop: '3px solid #b45309',
                      borderRadius: '12px 12px 0 0',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      p: 1
                    }}
                  >
                    <Typography variant="body2" fontWeight={800} color="text.secondary">
                      Rank 3
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ArrowDropUpIcon sx={{ color: 'success.main' }} /> +0.8%
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>

            {/* Current Logged-in User Floating Ranking Stats (If not in top 3) */}
            {currentUserRankEntry && currentUserRankEntry.rank > 3 && (
              <Card 
                sx={{ 
                  mb: 4, 
                  background: isDark 
                    ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(6, 182, 212, 0.1) 100%)' 
                    : 'linear-gradient(135deg, rgba(139, 92, 246, 0.09) 0%, rgba(6, 182, 212, 0.04) 100%)',
                  border: '1px solid #8b5cf6',
                  borderRadius: '16px',
                  boxShadow: '0 8px 24px rgba(139, 92, 246, 0.06)'
                }}
              >
                <CardContent sx={{ p: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box display="flex" alignItems="center" gap={2}>
                    <Typography variant="h5" fontWeight={900} color="primary.main" sx={{ minWidth: '40px', textAlign: 'center' }}>
                      #{currentUserRankEntry.rank}
                    </Typography>
                    <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 800 }}>
                      {user?.username.substring(0, 2).toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={800}>
                        {user?.username} <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', backgroundColor: 'rgba(139, 92, 246, 0.2)', color: '#8b5cf6', fontWeight: 700, marginLeft: '6px' }}>YOU</span>
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Complete more daily tasks to overtake rank #3!
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="h6" fontWeight={850} color="primary.main">
                    🪙{user?.coins.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </Typography>
                </CardContent>
              </Card>
            )}

            {/* rankings List Table below podium (Ranks 4-10) */}
            <Typography variant="h6" fontWeight={750} fontFamily="'Outfit', sans-serif" mb={2} px={1}>
              Standings (Top 10)
            </Typography>
            
            <Card 
              sx={{ 
                borderRadius: '20px', 
                mb: 6,
                border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.05)'
              }}
            >
              <Box>
                {/* List Headers */}
                <Box sx={{ display: 'flex', px: 3, py: 1.8, bgcolor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)', borderBottom: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" fontWeight={750} color="text.secondary" sx={{ width: '60px' }}>RANK</Typography>
                  <Typography variant="caption" fontWeight={750} color="text.secondary" sx={{ flex: 1 }}>USER</Typography>
                  <Typography variant="caption" fontWeight={750} color="text.secondary" align="right" sx={{ width: '120px' }}>COINS</Typography>
                </Box>

                {/* List Items */}
                {displayRankings.slice(3, 10).map((rankUser, index) => {
                  const isSelf = user && rankUser.username.toLowerCase() === user.username.toLowerCase();
                  
                  return (
                    <Box 
                      key={rankUser._id} 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        px: 3, 
                        py: 2, 
                        borderBottom: index !== 6 ? '1px solid' : 'none',
                        borderColor: 'divider',
                        backgroundColor: isSelf 
                          ? (isDark ? 'rgba(139, 92, 246, 0.08)' : 'rgba(139, 92, 246, 0.02)')
                          : 'transparent',
                        transition: 'background-color 0.2s ease',
                        '&:hover': {
                          backgroundColor: isSelf 
                            ? (isDark ? 'rgba(139, 92, 246, 0.12)' : 'rgba(139, 92, 246, 0.04)')
                            : (isDark ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.01)')
                        }
                      }}
                    >
                      {/* Rank Number */}
                      <Typography 
                        variant="body1" 
                        fontWeight={isSelf ? 900 : 700} 
                        color={isSelf ? "primary.main" : "text.secondary"}
                        sx={{ width: '60px' }}
                      >
                        #{rankUser.rank}
                      </Typography>

                      {/* User Avatar & Name */}
                      <Box display="flex" alignItems="center" gap={1.8} sx={{ flex: 1 }}>
                        <Avatar 
                          sx={{ 
                            width: 38, 
                            height: 38, 
                            fontSize: '0.85rem', 
                            fontWeight: 700,
                            bgcolor: isSelf ? 'primary.main' : 'grey.600'
                          }}
                        >
                          {rankUser.username.substring(0, 2).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body1" fontWeight={isSelf ? 850 : 700}>
                            {rankUser.username}
                            {isSelf && (
                              <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '8px', backgroundColor: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', fontWeight: 800, marginLeft: '6px' }}>
                                YOU
                              </span>
                            )}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Active Tasks Completed
                          </Typography>
                        </Box>
                      </Box>

                      {/* Coins Count */}
                      <Typography 
                        variant="body1" 
                        fontWeight={isSelf ? 850 : 700} 
                        align="right" 
                        color={isSelf ? "primary.main" : "text.primary"}
                        sx={{ width: '120px' }}
                      >
                        🪙{rankUser.coins.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Card>
          </>
        )}
      </Box>
    </Container>
  );
};

export default Leaderboard;
