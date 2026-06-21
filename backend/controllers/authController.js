const User = require('../models/User');
const Post = require('../models/Post');
const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for the authenticated user ID.
 * @param {string} id - User ID
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    // Check for empty fields
    if (!username || !email || !password) {
      res.status(400);
      throw new Error('Please provide username, email, and password.');
    }

    // Check user email uniqueness
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      res.status(400);
      throw new Error('A user with this email already exists.');
    }

    // Check username uniqueness
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      res.status(400);
      throw new Error('Username is already taken.');
    }

    // Create user - triggers pre-save password hashing in model
    const user = await User.create({
      username,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        email: user.email,
        coins: user.coins,
        token: generateToken(user._id),
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data provided.');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate user & retrieve token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please fill in both email and password.');
    }

    // Retrieve user and explicitly select password hash since it is set to select: false
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.comparePassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        coins: user.coins,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password.');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    res.json({
      _id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      coins: req.user.coins || 0,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile details
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found.');
    }

    const { username, email, password } = req.body;

    if (username) {
      // Check if username is taken by another user
      if (username !== user.username) {
        const usernameExists = await User.findOne({ username });
        if (usernameExists) {
          res.status(400);
          throw new Error('Username is already taken.');
        }
      }
      user.username = username;
    }

    if (email) {
      // Check if email is taken by another user
      if (email !== user.email) {
        const emailExists = await User.findOne({ email });
        if (emailExists) {
          res.status(400);
          throw new Error('Email is already registered.');
        }
      }
      user.email = email;
    }

    if (password) {
      user.password = password; // triggers pre-save password hash hook
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      coins: updatedUser.coins,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Simulate adding coins for task completion
// @route   POST /api/auth/coins
// @access  Private
const addCoins = async (req, res, next) => {
  try {
    const { amount } = req.body;
    
    if (!amount || isNaN(amount) || amount <= 0) {
      res.status(400);
      throw new Error('Please provide a valid coins amount to add.');
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found.');
    }

    user.coins = (user.coins || 0) + parseInt(amount, 10);
    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      coins: updatedUser.coins,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get leaderboard rankings
// @route   GET /api/auth/leaderboard
// @access  Private
const getLeaderboard = async (req, res, next) => {
  try {
    const realUsers = await User.find({}, 'username email coins').sort({ coins: -1 });

    const ranked = realUsers.map((user, index) => ({
      _id: user._id,
      username: user.username,
      coins: user.coins || 0,
      isMock: false,
      rank: index + 1
    }));

    res.json(ranked);
  } catch (error) {
    next(error);
  }
};

// @desc    Claim daily login bonus
// @route   POST /api/auth/claim-daily
// @access  Private
const claimDailyBonus = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.status(404);
      throw new Error('User not found.');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastLogin = user.lastLoginDate ? new Date(user.lastLoginDate) : null;
    
    if (lastLogin) {
      lastLogin.setHours(0, 0, 0, 0);
    }

    let streak = user.loginStreak || 0;
    
    // If last login is today, they already claimed
    if (lastLogin && lastLogin.getTime() === today.getTime()) {
      return res.status(400).json({ message: 'Already claimed daily bonus today.', coins: user.coins, streak });
    }

    // Check if streak is broken (difference is more than 1 day)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (lastLogin && lastLogin.getTime() === yesterday.getTime()) {
      // Streak continues
      streak += 1;
    } else {
      // Streak broken or first time
      streak = 1;
    }

    // Calculate reward (e.g., 10 coins per streak day, max 100)
    const reward = Math.min(streak * 10, 100);

    user.coins = (user.coins || 0) + reward;
    user.loginStreak = streak;
    user.lastLoginDate = new Date(); // record exact time

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      coins: updatedUser.coins,
      streak: updatedUser.loginStreak,
      reward,
      message: `Daily bonus claimed! +${reward} coins.`
    });

  } catch (error) {
    next(error);
  }
};

// @desc    Get user's social tasks progress
// @route   GET /api/auth/tasks
// @access  Private
const getSocialTasks = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    // Calculate progress
    const postsLiked = await Post.countDocuments({ likes: userId });
    const postsCommented = await Post.countDocuments({ 'comments.userId': userId });
    const postsCreated = await Post.countDocuments({ userId: userId });

    const claimedTasks = user.claimedTasks || [];

    const tasks = [
      {
        id: 'like_1',
        title: 'Like 1 Post',
        description: 'Show some love to the community by liking a post.',
        reward: 10,
        progress: Math.min(postsLiked, 1),
        target: 1,
        isClaimed: claimedTasks.includes('like_1')
      },
      {
        id: 'like_5',
        title: 'Like 5 Posts',
        description: 'Be an active community member by liking 5 posts.',
        reward: 50,
        progress: Math.min(postsLiked, 5),
        target: 5,
        isClaimed: claimedTasks.includes('like_5')
      },
      {
        id: 'comment_1',
        title: 'Leave a Comment',
        description: 'Start a conversation by leaving a comment on any post.',
        reward: 20,
        progress: Math.min(postsCommented, 1),
        target: 1,
        isClaimed: claimedTasks.includes('comment_1')
      },
      {
        id: 'post_1',
        title: 'Publish Your First Post',
        description: 'Share your thoughts or an image with the community.',
        reward: 100,
        progress: Math.min(postsCreated, 1),
        target: 1,
        isClaimed: claimedTasks.includes('post_1')
      }
    ];

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

// @desc    Claim social task reward
// @route   POST /api/auth/tasks/claim
// @access  Private
const claimSocialTask = async (req, res, next) => {
  try {
    const { taskId } = req.body;
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (user.claimedTasks.includes(taskId)) {
      return res.status(400).json({ message: 'Task reward already claimed.' });
    }

    let isEligible = false;
    let rewardAmount = 0;

    // Validate eligibility based on task ID
    if (taskId === 'like_1') {
      const postsLiked = await Post.countDocuments({ likes: userId });
      isEligible = postsLiked >= 1;
      rewardAmount = 10;
    } else if (taskId === 'like_5') {
      const postsLiked = await Post.countDocuments({ likes: userId });
      isEligible = postsLiked >= 5;
      rewardAmount = 50;
    } else if (taskId === 'comment_1') {
      const postsCommented = await Post.countDocuments({ 'comments.userId': userId });
      isEligible = postsCommented >= 1;
      rewardAmount = 20;
    } else if (taskId === 'post_1') {
      const postsCreated = await Post.countDocuments({ userId: userId });
      isEligible = postsCreated >= 1;
      rewardAmount = 100;
    } else {
      return res.status(404).json({ message: 'Unknown task ID.' });
    }

    if (!isEligible) {
      return res.status(400).json({ message: 'Task requirements not met yet.' });
    }

    user.coins = (user.coins || 0) + rewardAmount;
    user.claimedTasks.push(taskId);
    await user.save();

    res.json({
      message: `Successfully claimed ${rewardAmount} coins!`,
      coins: user.coins,
      taskId
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { signup, login, getMe, updateProfile, addCoins, getLeaderboard, claimDailyBonus, getSocialTasks, claimSocialTask };
