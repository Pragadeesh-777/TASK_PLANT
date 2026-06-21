import React, { useContext, useState, useEffect } from 'react';
import { Container, Card, CardContent, Typography, Button, Box, Divider, CircularProgress, Dialog, Radio, RadioGroup, FormControlLabel, FormControl, useTheme } from '@mui/material';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

// Icons
import HelpIcon from '@mui/icons-material/Help';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CelebrationIcon from '@mui/icons-material/Celebration';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// Helper to decode HTML entities from OpenTrivia API
const decodeHTML = (html) => {
  const txt = document.createElement('textarea');
  txt.innerHTML = html;
  return txt.value;
};

const Quiz = () => {
  const { user, setUser } = useContext(AuthContext);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // State
  const [quizzes, setQuizzes] = useState([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [isCompleted, setIsCompleted] = useState(false); // For current question
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState({ show: false, success: false, message: '' });
  const [celebrateOpen, setCelebrateOpen] = useState(false);

  // Fetch quizzes from Open Trivia DB
  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      // Fetch 10 random multiple choice questions
      const response = await fetch('https://opentdb.com/api.php?amount=10&type=multiple');
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        // Map and randomize answers
        const formattedQuizzes = data.results.map((q, index) => {
          const decodedCorrect = decodeHTML(q.correct_answer);
          const decodedIncorrect = q.incorrect_answers.map(decodeHTML);
          
          // Combine and shuffle options
          const allOptions = [...decodedIncorrect, decodedCorrect];
          for (let i = allOptions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [allOptions[i], allOptions[j]] = [allOptions[j], allOptions[i]];
          }
          
          return {
            id: `opentdb_${Date.now()}_${index}`,
            category: decodeHTML(q.category),
            difficulty: q.difficulty,
            question: decodeHTML(q.question),
            options: allOptions,
            correctAnswer: decodedCorrect,
            // Reward scaled by difficulty
            reward: q.difficulty === 'hard' ? 100 : q.difficulty === 'medium' ? 75 : 50
          };
        });
        
        setQuizzes(formattedQuizzes);
        setCurrentQuizIndex(0);
      }
    } catch (error) {
      console.error('Failed to fetch quizzes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const currentQuiz = quizzes[currentQuizIndex];

  const handleAnswerChange = (e) => {
    if (isCompleted) return;
    setSelectedAnswer(e.target.value);
    setFeedback({ show: false, success: false, message: '' });
  };

  const handleNextQuiz = () => {
    setCelebrateOpen(false);
    if (currentQuizIndex < quizzes.length - 1) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      // Fetch more if out of questions
      fetchQuizzes();
    }
    setSelectedAnswer('');
    setIsCompleted(false);
    setFeedback({ show: false, success: false, message: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || isCompleted || submitting || !currentQuiz) return;

    if (!selectedAnswer) {
      setFeedback({
        show: true,
        success: false,
        message: 'Please select an option before submitting.'
      });
      return;
    }

    setSubmitting(true);

    // Simulate verification delay
    setTimeout(async () => {
      try {
        if (selectedAnswer === currentQuiz.correctAnswer) {
          // Correct answer - credit coins via backend
          const { data } = await API.post('/auth/coins', { amount: currentQuiz.reward });
          
          // Update global context user state
          setUser((prev) => ({ ...prev, coins: data.coins }));
          
          setIsCompleted(true);
          setSubmitting(false);
          setFeedback({
            show: true,
            success: true,
            message: `Correct! You earned +${currentQuiz.reward} coins!`
          });
          setCelebrateOpen(true);
        } else {
          // Incorrect answer
          setSubmitting(false);
          setFeedback({
            show: true,
            success: false,
            message: `Oops! The correct answer was "${currentQuiz.correctAnswer}".`
          });
          setIsCompleted(true); // Mark completed anyway so they can move to next
        }
      } catch (err) {
        console.error('Quiz submission failed:', err);
        setSubmitting(false);
        setFeedback({
          show: true,
          success: false,
          message: 'An error occurred. Please try again.'
        });
      }
    }, 1000);
  };

  return (
    <Container className="fade-in" maxWidth="sm">
      <Box sx={{ py: 2 }}>
        {/* Banner Section */}
        <Card 
          sx={{ 
            mb: 4, 
            background: isDark 
              ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(236, 72, 153, 0.1) 100%)' 
              : 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(236, 72, 153, 0.05) 100%)',
            border: `1px solid ${isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)'}`,
            boxShadow: isDark ? '0 8px 32px rgba(139, 92, 246, 0.1)' : '0 8px 24px rgba(139, 92, 246, 0.04)',
            borderRadius: '20px',
            textAlign: 'center',
            p: 3
          }}
        >
          <Box display="flex" justifyContent="center" mb={1.5}>
            <HelpIcon color="primary" sx={{ fontSize: 44 }} />
          </Box>
          <Typography variant="h5" fontWeight={850} fontFamily="'Outfit', sans-serif" gutterBottom>
            Infinite Trivia 
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: '400px', mx: 'auto' }}>
            Answer an endless stream of dynamic trivia questions to earn wallet credits! Harder questions give more coins.
          </Typography>
        </Card>

        {/* Question Panel */}
        {loading ? (
          <Box display="flex" flexDirection="column" alignItems="center" py={5}>
            <CircularProgress color="primary" sx={{ mb: 2 }} />
            <Typography variant="body2" color="text.secondary">Loading new questions from the global trivia bank...</Typography>
          </Box>
        ) : !currentQuiz ? (
          <Card 
            sx={{ 
              p: 5, 
              borderRadius: '20px',
              border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.05)',
              textAlign: 'center',
              backgroundColor: 'transparent'
            }}
          >
            <Typography variant="h5" fontWeight={800} mb={2}>Could not load questions</Typography>
            <Button variant="contained" onClick={fetchQuizzes}>Try Again</Button>
          </Card>
        ) : (
          <Card 
            sx={{ 
              p: 3, 
              borderRadius: '20px',
              border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.05)'
            }}
          >
            <CardContent sx={{ p: 0 }}>
              {/* Header / Meta */}
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    bgcolor: isDark ? 'rgba(139, 92, 246, 0.15)' : 'rgba(139, 92, 246, 0.08)', 
                    color: 'primary.main',
                    fontWeight: 800, 
                    px: 1.5, 
                    py: 0.5, 
                    borderRadius: '12px' 
                  }}
                >
                  {currentQuiz.category} • {currentQuiz.difficulty.toUpperCase()}
                </Typography>
                <Typography variant="body2" fontWeight={800} color="success.main">
                  +🪙{currentQuiz.reward} Coins
                </Typography>
              </Box>

              {/* Question Text */}
              <Typography variant="h6" fontWeight={750} fontFamily="'Outfit', sans-serif" mb={3} sx={{ lineHeight: 1.4 }}>
                {currentQuiz.question}
              </Typography>

              <Divider sx={{ mb: 3 }} />

              {/* Form & Choices */}
              <form onSubmit={handleSubmit}>
                <FormControl component="fieldset" fullWidth disabled={isCompleted || submitting}>
                  <RadioGroup 
                    value={selectedAnswer} 
                    onChange={handleAnswerChange}
                    sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}
                  >
                    {currentQuiz.options.map((opt) => {
                      const isSelected = selectedAnswer === opt;
                      const isCorrect = opt === currentQuiz.correctAnswer;
                      
                      let cardBg = 'transparent';
                      let cardBorder = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';

                      if (isCompleted) {
                        if (isCorrect) {
                          cardBg = isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.04)';
                          cardBorder = 'rgba(16, 185, 129, 0.4)';
                        } else if (isSelected && !isCorrect) {
                          cardBg = isDark ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.04)';
                          cardBorder = 'rgba(239, 68, 68, 0.4)';
                        }
                      } else if (isSelected) {
                        cardBg = isDark ? 'rgba(139, 92, 246, 0.08)' : 'rgba(139, 92, 246, 0.03)';
                        cardBorder = theme.palette.primary.main;
                      }

                      return (
                        <Box 
                          key={opt}
                          sx={{
                            border: `1px solid ${cardBorder}`,
                            borderRadius: '12px',
                            px: 2,
                            py: 1,
                            backgroundColor: cardBg,
                            transition: 'all 0.2s ease',
                            cursor: (isCompleted || submitting) ? 'default' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            '&:hover': {
                              backgroundColor: (isCompleted || submitting) ? cardBg : (isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)')
                            }
                          }}
                          onClick={() => {
                            if (!isCompleted && !submitting) {
                              setSelectedAnswer(opt);
                              setFeedback({ show: false, success: false, message: '' });
                            }
                          }}
                        >
                          <FormControlLabel
                            value={opt}
                            control={
                              <Radio 
                                size="medium"
                                sx={{
                                  color: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)',
                                  '&.Mui-checked': {
                                    color: (isCompleted && isCorrect) ? 'success.main' : (isCompleted ? 'error.main' : 'primary.main')
                                  }
                                }}
                              />
                            }
                            label={
                              <Typography variant="body1" fontWeight={600} sx={{ 
                                color: (isCompleted && isCorrect) ? 'success.main' : (isCompleted && isSelected ? 'error.main' : 'text.primary')
                              }}>
                                {opt}
                              </Typography>
                            }
                            sx={{ width: '100%', m: 0 }}
                          />
                        </Box>
                      );
                    })}
                  </RadioGroup>
                </FormControl>

                {/* Feedback Alert */}
                {feedback.show && (
                  <Box 
                    mt={3} 
                    p={2} 
                    borderRadius="12px"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      border: '1px solid',
                      borderColor: feedback.success ? 'success.light' : 'error.light',
                      backgroundColor: feedback.success 
                        ? (isDark ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.04)')
                        : (isDark ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.04)'),
                      color: feedback.success ? 'success.main' : 'error.main'
                    }}
                  >
                    {feedback.success ? (
                      <CheckCircleOutlineIcon sx={{ color: 'success.main' }} />
                    ) : (
                      <CloseIcon sx={{ color: 'error.main' }} />
                    )}
                    <Typography variant="body2" fontWeight={700}>
                      {feedback.message}
                    </Typography>
                  </Box>
                )}

                {/* Submit Buttons */}
                <Box mt={4}>
                  {isCompleted ? (
                    <Button
                      variant="contained"
                      color="secondary"
                      fullWidth
                      endIcon={<ArrowForwardIcon />}
                      onClick={handleNextQuiz}
                      sx={{
                        borderRadius: '24px',
                        py: 1.4,
                        fontWeight: 800,
                        textTransform: 'none',
                        boxShadow: '0 4px 14px rgba(6, 182, 212, 0.3)'
                      }}
                    >
                      {currentQuizIndex < quizzes.length - 1 ? 'Next Question' : 'Fetch More Questions'}
                    </Button>
                  ) : (
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={submitting || !selectedAnswer}
                      fullWidth
                      sx={{
                        borderRadius: '24px',
                        py: 1.4,
                        fontWeight: 800,
                        textTransform: 'none',
                        boxShadow: '0 4px 14px rgba(139, 92, 246, 0.3)'
                      }}
                    >
                      {submitting ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        'Submit Answer'
                      )}
                    </Button>
                  )}
                </Box>
              </form>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Celebration Dialog */}
      <Dialog
        open={celebrateOpen}
        onClose={handleNextQuiz}
        PaperProps={{ 
          sx: { 
            borderRadius: '20px', 
            p: 3.5, 
            textAlign: 'center', 
            maxWidth: '350px' 
          } 
        }}
      >
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <CelebrationIcon color="primary" sx={{ fontSize: 64 }} />
          <Typography variant="h5" fontWeight={850} fontFamily="'Outfit', sans-serif">
            Outstanding!
          </Typography>
          <Typography variant="body2" color="text.secondary" px={0.5}>
            You selected the correct answer and unlocked <b>{currentQuiz?.reward} coins</b>! 
          </Typography>
          <Button 
            variant="contained" 
            onClick={handleNextQuiz}
            sx={{ borderRadius: '20px', px: 5, textTransform: 'none', mt: 1, fontWeight: 700 }}
          >
            Next Question
          </Button>
        </Box>
      </Dialog>
    </Container>
  );
};

export default Quiz;

