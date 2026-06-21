import { createTheme } from '@mui/material/styles';

export const getTheme = (mode) => {
  const isDark = mode === 'dark';
  
  return createTheme({
    palette: {
      mode: mode,
      primary: {
        main: '#8b5cf6', // Premium Violet/Purple
        light: '#a78bfa',
        dark: '#6d28d9',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#06b6d4', // Cyan
        light: '#22d3ee',
        dark: '#0891b2',
        contrastText: isDark ? '#0f172a' : '#ffffff',
      },
      background: {
        default: isDark ? '#08080f' : '#f8fafc',
        paper: isDark ? '#10101d' : '#ffffff',
      },
      text: {
        primary: isDark ? '#f8fafc' : '#0f172a',
        secondary: isDark ? '#94a3b8' : '#475569',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)',
    },
    typography: {
      fontFamily: '"Inter", -apple-system, sans-serif',
      h1: { fontFamily: '"Outfit", sans-serif', fontWeight: 800 },
      h2: { fontFamily: '"Outfit", sans-serif', fontWeight: 700 },
      h3: { fontFamily: '"Outfit", sans-serif', fontWeight: 700 },
      h4: { fontFamily: '"Outfit", sans-serif', fontWeight: 700 },
      h5: { fontFamily: '"Outfit", sans-serif', fontWeight: 600 },
      h6: { fontFamily: '"Outfit", sans-serif', fontWeight: 600 },
      subtitle1: { fontWeight: 500 },
      body1: { fontSize: '0.975rem', lineHeight: 1.6 },
      button: {
        fontFamily: '"Outfit", sans-serif',
        fontWeight: 600,
        textTransform: 'none',
        letterSpacing: '0.5px',
      },
    },
    shape: {
      borderRadius: 14,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 30,
            padding: '8px 22px',
            fontWeight: 600,
            boxShadow: 'none',
            '&:hover': {
              transform: 'translateY(-1px)',
              boxShadow: isDark 
                ? '0 4px 15px rgba(139, 92, 246, 0.25)' 
                : '0 4px 12px rgba(139, 92, 246, 0.15)',
            },
          },
          containedPrimary: {
            background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #a78bfa 0%, #7c3aed 100%)',
            },
          },
          containedSecondary: {
            background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
            '&:hover': {
              background: 'linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%)',
              boxShadow: isDark 
                ? '0 4px 15px rgba(6, 182, 212, 0.25)' 
                : '0 4px 12px rgba(6, 182, 212, 0.15)',
            },
          },
          outlined: {
            borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.25)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 20,
            backgroundColor: isDark ? 'rgba(16, 16, 29, 0.65)' : '#ffffff',
            backgroundImage: 'none',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.05)',
            boxShadow: isDark ? '0 12px 40px 0 rgba(0, 0, 0, 0.25)' : '0 8px 30px 0 rgba(148, 163, 184, 0.06)',
            backdropFilter: isDark ? 'blur(14px)' : 'none',
            WebkitBackdropFilter: isDark ? 'blur(14px)' : 'none',
            transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.3s ease',
            '&:hover': {
              borderColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: isDark ? 'rgba(8, 8, 15, 0.75)' : 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.06)' : '1px solid rgba(0, 0, 0, 0.05)',
            boxShadow: 'none',
            color: isDark ? '#f8fafc' : '#0f172a',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 14,
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)',
              transition: 'border-color 0.25s ease, box-shadow 0.25s ease, background-color 0.25s ease',
              '& fieldset': {
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
              },
              '&:hover': {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
              },
              '&:hover fieldset': {
                borderColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.18)',
              },
              '&.Mui-focused': {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.03)' : '#ffffff',
                boxShadow: isDark 
                  ? '0 0 0 3px rgba(139, 92, 246, 0.18)' 
                  : '0 0 0 3px rgba(139, 92, 246, 0.12)',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#8b5cf6',
                borderWidth: '1.5px',
              },
            },
            '& .MuiInputLabel-root': {
              color: isDark ? '#94a3b8' : '#64748b',
              transition: 'color 0.25s ease, transform 0.25s ease',
              '&.Mui-focused': {
                color: '#8b5cf6',
              },
            },
          },
        },
      },
    },
  });
};

const defaultTheme = getTheme('light');
export default defaultTheme;
