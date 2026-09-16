const mongoose = require('mongoose');

const articleLikeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    article: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Article',
      required: [true, 'Article reference is required']
    }
  },
  {
    timestamps: true
  }
);

articleLikeSchema.index({ user: 1, article: 1 }, { unique: true });

module.exports = mongoose.model('ArticleLike', articleLikeSchema);
