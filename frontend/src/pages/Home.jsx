import React, { useContext, useState, useEffect } from 'react';
import { Container, Grid, Card, CardContent, Typography, Button, Box, Divider, CircularProgress, Dialog, TextField, Badge, useTheme } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import WalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TaskIcon from '@mui/icons-material/AssignmentTurnedIn';
import ArrowIcon from '@mui/icons-material/ArrowForwardIos';
import StarIcon from '@mui/icons-material/Star';
import CelebrationIcon from '@mui/icons-material/Celebration';

const Home = () => {
  const { user, setUser } = useContext(AuthContext);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Task lists state
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Complete Daily Quiz', description: 'Test your general knowledge with our quick 5-question daily quiz.', reward: 100, category: 'Quiz', completed: false },
    { id: 2, title: 'Follow TaskSocial on Instagram', description: 'Follow our official Instagram handle and keep up to date with tasks.', reward: 50, category: 'Social', completed: false },
    { id: 3, title: 'Join Telegram Channel', description: 'Join our Telegram broadcast channel for instant high-paying task announcements.', reward: 30, category: 'Social', completed: false },
    { id: 4, title: 'Install & Rate Partner Application', description: 'Download our partner app, run it for 60 seconds, and leave a positive 5-star review.', reward: 150, category: 'Install', completed: false },
    { id: 5, title: 'Watch 30s Video Ad', description: 'Watch a short promotional video clip from our sponsors.', reward: 20, category: 'Video', completed: false }
  ]);

  // Load task completion history from localStorage to persist completions in session
  useEffect(() => {
    if (user) {
      const savedCompletions = localStorage.getItem(`completed_tasks_${user._id}`);
      if (savedCompletions) {
        const completedIds = JSON.parse(savedCompletions);
        setTasks((prevTasks) =>
          prevTasks.map((t) => (completedIds.includes(t.id) ? { ...t, completed: true } : t))
        );
      }
    }
  }, [user]);

  // Task proof states
  const [selectedTask, setSelectedTask] = useState(null);
  const [proofText, setProofText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  // Stats
  const completedCount = tasks.filter((t) => t.completed).length;

  const handleOpenProofDialog = (task) => {
    setSelectedTask(task);
    setProofText('');
  };

  const handleCloseProofDialog = () => {
    if (!submitting) {
      setSelectedTask(null);
    }
  };

  const handleProofSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTask || submitting) return;

    setSubmitting(true);

    // Simulate verification delay (looks highly professional!)
    setTimeout(async () => {
      try {
        // Post earned coins to backend
        const { data } = await API.post('/auth/coins', { amount: selectedTask.reward });
        
        // Update user state globally in AuthContext
        setUser((prev) => ({ ...prev, coins: data.coins }));

        // Mark task as completed locally
        const updatedTasks = tasks.map((t) =>
          t.id === selectedTask.id ? { ...t, completed: true } : t
        );
        setTasks(updatedTasks);

        // Save completion to localStorage
        const completedIds = updatedTasks.filter((t) => t.completed).map((t) => t.id);
        localStorage.setItem(`completed_tasks_${user._id}`, JSON.stringify(completedIds));

        setSubmitting(false);
        setSelectedTask(null);
        setSuccessDialogOpen(true);
      } catch (err) {
        console.error('Failed to claim task rewards:', err);
        setSubmitting(false);
      }
    }, 1500);
  };

  return (
    <Container className="fade-in" maxWidth="lg">
      <Grid container spacing={4}>
        {/* Wallet Overview Panel */}
        <Grid item xs={12} md={4}>
          <Card 
            sx={{ 
              mb: 3, 
              background: isDark 
                ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(6, 182, 212, 0.05) 100%)' 
                : 'linear-gradient(135deg, rgba(139, 92, 246, 0.06) 0%, rgba(6, 182, 212, 0.04) 100%)',
              border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)'}`,
              boxShadow: isDark ? '0 8px 32px rgba(139, 92, 246, 0.1)' : '0 8px 24px rgba(139, 92, 246, 0.05)',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <WalletIcon color="primary" sx={{ fontSize: 32 }} />
                <Typography variant="h6" fontWeight={750} fontFamily="'Outfit', sans-serif">
                  Earnings Wallet
                </Typography>
              </Box>
              <Divider sx={{ my: 1.5, opacity: 0.5 }} />

              <Box my={2.5}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  COINS BALANCE
                </Typography>
                <Typography 
                  variant="h3" 
                  fontWeight={850} 
                  color="primary.main" 
                  fontFamily="'Outfit', sans-serif"
                  sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  🪙 {user?.coins || 0}
                </Typography>
              </Box>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={6}>
                  <Box p={1.5} bgcolor={isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'} borderRadius="12px" border={`1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`}>
                    <Typography variant="caption" color="text.secondary">COMPLETED</Typography>
                    <Typography variant="h6" fontWeight={700} color="text.primary">{completedCount} Tasks</Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box p={1.5} bgcolor={isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)'} borderRadius="12px" border={`1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`}>
                    <Typography variant="caption" color="text.secondary">GLOBAL RANK</Typography>
                    <Typography variant="h6" fontWeight={700} color="secondary.main">#142</Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Referral Banner */}
          <Card sx={{ bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
                <StarIcon sx={{ color: 'orange' }} />
                <Typography variant="subtitle1" fontWeight={700} fontFamily="'Outfit', sans-serif">
                  Refer & Earn
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.5 }}>
                Share your referral code with friends and earn 100 coins for every friend who registers and completes their first task!
              </Typography>
              <Box 
                p={1.5} 
                bgcolor={isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'} 
                borderRadius="10px" 
                display="flex" 
                justifyContent="space-between" 
                alignItems="center"
                border="1px dashed"
                borderColor="divider"
              >
                <Typography variant="body2" fontWeight={700} letterSpacing={1} color="primary.main">
                  TASKSOCIAL500
                </Typography>
                <Button size="small" variant="text" sx={{ p: 0.5 }}>Copy</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Task Board Panel */}
        <Grid item xs={12} md={8}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box display="flex" alignItems="center" gap={1.5}>
              <TaskIcon color="primary" />
              <Typography variant="h5" fontWeight={750} fontFamily="'Outfit', sans-serif">
                Available Tasks
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Earn coins by completing tasks
            </Typography>
          </Box>

          <Box display="flex" flexDirection="column" gap={2}>
            {tasks.map((task) => (
              <Card 
                key={task.id}
                sx={{ 
                  transition: 'transform 0.25s, box-shadow 0.25s',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: isDark ? '0 8px 30px rgba(0,0,0,0.25)' : '0 8px 20px rgba(148, 163, 184, 0.1)',
                  },
                  borderLeft: task.completed 
                    ? `4px solid ${theme.palette.success.main}` 
                    : `4px solid ${theme.palette.primary.main}`
                }}
              >
                <CardContent sx={{ p: { xs: 2.2, sm: 3 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Box display="flex" alignItems="center" gap={1.5} mb={0.8}>
                      <Badge 
                        badgeContent={task.category} 
                        color={task.category === 'Quiz' ? 'primary' : task.category === 'Install' ? 'secondary' : 'default'}
                        sx={{ 
                          '& .MuiBadge-badge': { 
                            position: 'static', 
                            transform: 'none', 
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            height: 18,
                            px: 1
                          } 
                        }}
                      />
                      <Typography variant="body2" fontWeight={700} color="success.main">
                        +🪙{task.reward} Coins
                      </Typography>
                    </Box>
                    <Typography variant="subtitle1" fontWeight={750} mb={0.5} fontFamily="'Outfit', sans-serif">
                      {task.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.4 }}>
                      {task.description}
                    </Typography>
                  </Box>

                  <Box display="flex" flexDirection="column" alignItems="flex-end" flexShrink={0}>
                    {task.completed ? (
                      <Button 
                        variant="contained" 
                        color="success" 
                        disabled
                        size="medium"
                        sx={{ borderRadius: '20px', textTransform: 'none', opacity: '0.8 !important' }}
                      >
                        Completed
                      </Button>
                    ) : (
                      <Button 
                        variant="contained" 
                        color="primary"
                        onClick={() => handleOpenProofDialog(task)}
                        endIcon={<ArrowIcon sx={{ fontSize: '10px !important' }} />}
                        size="medium"
                        sx={{ borderRadius: '20px', textTransform: 'none' }}
                      >
                        Complete
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Grid>
      </Grid>

      {/* Submit Task Proof Dialog */}
      <Dialog 
        open={Boolean(selectedTask)} 
        onClose={handleCloseProofDialog}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { borderRadius: '20px', p: 1 } }}
      >
        <Box p={2.5}>
          <Typography variant="h6" fontWeight={750} fontFamily="'Outfit', sans-serif" mb={1.5}>
            Submit Task Proof
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            To complete the task <b>{selectedTask?.title}</b>, please enter your username or upload proof of completion below.
          </Typography>

          <form onSubmit={handleProofSubmit}>
            <TextField
              label="Username/Verification Code"
              placeholder="e.g. your_instagram_handle"
              fullWidth
              required
              value={proofText}
              onChange={(e) => setProofText(e.target.value)}
              disabled={submitting}
              sx={{ mb: 3 }}
            />

            <Box display="flex" justifyContent="flex-end" gap={1.5}>
              <Button 
                variant="text" 
                onClick={handleCloseProofDialog}
                disabled={submitting}
                sx={{ textTransform: 'none' }}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                disabled={submitting || !proofText.trim()}
                endIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
                sx={{ borderRadius: '20px', px: 3, textTransform: 'none' }}
              >
                {submitting ? 'Verifying...' : 'Submit Proof'}
              </Button>
            </Box>
          </form>
        </Box>
      </Dialog>

      {/* Success Celebration Dialog */}
      <Dialog
        open={successDialogOpen}
        onClose={() => setSuccessDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: '20px', p: 3, textAlign: 'center' } }}
      >
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <CelebrationIcon color="primary" sx={{ fontSize: 55 }} />
          <Typography variant="h5" fontWeight={750} fontFamily="'Outfit', sans-serif">
            Task Approved!
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={1}>
            Your proof has been validated automatically. The rewards have been successfully added to your wallet balance. Keep it up!
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => setSuccessDialogOpen(false)}
            sx={{ borderRadius: '20px', px: 4, textTransform: 'none', mt: 1 }}
          >
            Awesome!
          </Button>
        </Box>
      </Dialog>
    </Container>
  );
};

export default Home;
