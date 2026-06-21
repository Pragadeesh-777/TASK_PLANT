const mongoose = require('mongoose');

// Sub-schema for comments
const commentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: [true, 'Comment text is required'],
      trim: true,
    },
  },
  {
    timestamps: true, // Stores createdAt and updatedAt for individual comments
  }
);

// Schema for posts
const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      trim: true,
    },
    image: {
      type: String, // Stored as a Base64-encoded image string
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [commentSchema],
  },
  {
    timestamps: true, // Stores createdAt (for post time) and updatedAt
  }
);

// Validation rule: A post cannot have both empty text AND empty image.
postSchema.pre('validate', function (next) {
  if (!this.text && !this.image) {
    this.invalidate('text', 'A post must contain either text or an image.');
    this.invalidate('image', 'A post must contain either text or an image.');
  }
  next();
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
