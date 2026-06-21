const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  likePost,
  commentPost,
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

// Public route to fetch paginated social feed
router.get('/', getPosts);

// Protected routes (requires user session)
router.post('/', protect, createPost);
router.post('/:id/like', protect, likePost);
router.post('/:id/comment', protect, commentPost);

module.exports = router;
