const mongoose = require('mongoose');

const communityPostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: [true, 'Community reference is required']
    },
    content: {
      type: String,
      default: '',
      trim: true
    },
    image: {
      type: String,
      default: ''
    },
    video: {
      type: String,
      default: ''
    },
    likesCount: {
      type: Number,
      default: 0
    },
    commentsCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Indexing for faster feed queries
communityPostSchema.index({ community: 1, createdAt: -1 });

module.exports = mongoose.model('CommunityPost', communityPostSchema);
