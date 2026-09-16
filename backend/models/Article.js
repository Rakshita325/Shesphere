const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Article title is required'],
      trim: true
    },
    coverImage: {
      type: String,
      default: ''
    },
    content: {
      type: String,
      required: [true, 'Article content is required']
    },
    images: {
      type: [String],
      default: []
    },
    category: {
      type: String,
      default: 'General'
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    source: {
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
    },
    publishedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

articleSchema.index({ category: 1, createdAt: -1 });
articleSchema.index({ author: 1 });

module.exports = mongoose.model('Article', articleSchema);
