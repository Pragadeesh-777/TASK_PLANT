const Post = require('../models/Post');

// @desc    Create a new post
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res, next) => {
  try {
    const { text, image } = req.body;

    // Validation: text and image cannot both be empty (this is also caught by Mongoose validation, but good to check early)
    if (!text && !image) {
      res.status(400);
      throw new Error('Please provide either text or an image for your post.');
    }

    const post = new Post({
      userId: req.user._id,
      username: req.user.username,
      text,
      image, // Base64 string
    });

    const createdPost = await post.save();
    res.status(201).json(createdPost);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all posts (paginated)
// @route   GET /api/posts
// @access  Public
const getPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const filterQuery = {};
    if (req.query.username) {
      filterQuery.username = req.query.username;
    }

    const totalPosts = await Post.countDocuments(filterQuery);
    
    // Retrieve posts sorted by newest first and populate likes with usernames
    const posts = await Post.find(filterQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('likes', 'username');

    const totalPages = Math.ceil(totalPosts / limit);

    res.json({
      posts,
      totalPosts,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle post like (like/unlike)
// @route   POST /api/posts/:id/like
// @access  Private
const likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404);
      throw new Error('Post not found.');
    }

    // Check if current user ID is already in the likes list
    const alreadyLikedIndex = post.likes.indexOf(req.user._id);

    if (alreadyLikedIndex > -1) {
      // User already liked it, toggle off (unlike)
      post.likes.splice(alreadyLikedIndex, 1);
    } else {
      // User hasn't liked it, toggle on (like)
      post.likes.push(req.user._id);
    }

    const updatedPost = await post.save();
    await updatedPost.populate('likes', 'username');
    res.json(updatedPost);
  } catch (error) {
    next(error);
  }
};

// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comment
// @access  Private
const commentPost = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text || text.trim() === '') {
      res.status(400);
      throw new Error('Comment text cannot be empty.');
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404);
      throw new Error('Post not found.');
    }

    const newComment = {
      userId: req.user._id,
      username: req.user.username,
      text: text.trim(),
    };

    post.comments.push(newComment);
    const updatedPost = await post.save();
    
    res.status(201).json(updatedPost);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPost,
  getPosts,
  likePost,
  commentPost,
};
