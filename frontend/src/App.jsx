import React, { useContext, useState, useEffect, createContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider, CssBaseline, Box, CircularProgress, Paper, BottomNavigation, BottomNavigationAction } from '@mui/material';
import { getTheme } from './theme';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Feed from './pages/Feed';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Quiz from './pages/Quiz';
import Leaderboard from './pages/Leaderboard';

// Icons for Bottom Navigation
import HomeIcon from '@mui/icons-material/Home';
import ForumIcon from '@mui/icons-material/Forum';
import PersonIcon from '@mui/icons-material/Person';
import HelpCenterIcon from '@mui/icons-material/HelpCenter';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

// Context for controlling Light/Dark theme mode globally
export const ThemeModeContext = createContext({
  mode: 'light',
  toggleThemeMode: () => {},
});

// Component to protect private routes
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        sx={{ backgroundColor: 'background.default' }}
      >
        <CircularProgress size={50} color="primary" />
      </Box>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppContent = () => {
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // Sync bottom navigation selection value with active route pathname
  const getNavValue = () => {
    switch (location.pathname) {
      case '/':
        return 0;
      case '/feed':
        return 1;
      case '/quiz':
        return 2;
      case '/leaderboard':
        return 3;
      case '/profile':
        return 4;
      default:
        return 0;
    }
  };

  const navValue = getNavValue();

  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        minHeight: '100vh',
        backgroundColor: 'background.default',
        color: 'text.primary',
        pb: token ? { xs: 9, md: 4 } : 4,
      }}
    >
      <Navbar />
      
      <Box sx={{ flex: 1, py: { xs: 2, sm: 4 } }}>
        <Routes>
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/feed" 
            element={
              <ProtectedRoute>
                <Feed />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/quiz" 
            element={
              <ProtectedRoute>
                <Quiz />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/leaderboard" 
            element={
              <ProtectedRoute>
                <Leaderboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Box>

      {/* Mobile Bottom Navigation Bar (5-tab menu) */}
      {token && (
        <Paper 
          elevation={6} 
          sx={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            display: { xs: 'block', md: 'none' }, 
            zIndex: 1000, 
            borderTop: '1px solid',
            borderColor: 'divider',
            backgroundImage: 'none',
            backgroundColor: 'background.paper',
          }}
        >
          <BottomNavigation
            showLabels
            value={navValue}
            onChange={(event, newValue) => {
              if (newValue === 0) navigate('/');
              else if (newValue === 1) navigate('/feed');
              else if (newValue === 2) navigate('/quiz');
              else if (newValue === 3) navigate('/leaderboard');
              else if (newValue === 4) navigate('/profile');
            }}
            sx={{ 
              backgroundColor: 'transparent',
              height: 64,
              '& .MuiBottomNavigationAction-root': {
                color: 'text.secondary',
                py: 1,
                minWidth: 'auto',
                '&.Mui-selected': {
                  color: 'primary.main',
                  fontWeight: 700,
                }
              }
            }}
          >
            <BottomNavigationAction label="Home" icon={<HomeIcon />} />
            <BottomNavigationAction label="Social" icon={<ForumIcon />} />
            <BottomNavigationAction label="Quiz" icon={<HelpCenterIcon />} />
            <BottomNavigationAction label="Leader" icon={<EmojiEventsIcon />} />
            <BottomNavigationAction label="Profile" icon={<PersonIcon />} />
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
};

const App = () => {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('themeMode') || 'light';
  });

  useEffect(() => {
    document.body.setAttribute('data-theme', mode);
  }, [mode]);

  const toggleThemeMode = () => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('themeMode', next);
      return next;
    });
  };

  const theme = getTheme(mode);

  return (
    <ThemeModeContext.Provider value={{ mode, toggleThemeMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <AppContent />
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export default App;
