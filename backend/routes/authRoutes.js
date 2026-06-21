const express = require('express');
const router = express.Router();
const { signup, login, getMe, updateProfile, addCoins, getLeaderboard, claimDailyBonus, getSocialTasks, claimSocialTask } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Private routes (requires valid JWT token)
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/coins', protect, addCoins);
router.get('/leaderboard', protect, getLeaderboard);
router.post('/claim-daily', protect, claimDailyBonus);
router.get('/tasks', protect, getSocialTasks);
router.post('/tasks/claim', protect, claimSocialTask);

module.exports = router;
