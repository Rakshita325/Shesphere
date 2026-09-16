const mongoose = require('mongoose');

const articleCommentSchema = new mongoose.Schema(
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
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true
    }
  },
  {
    timestamps: true
  }
);

articleCommentSchema.index({ article: 1, createdAt: 1 });

module.exports = mongoose.model('ArticleComment', articleCommentSchema);
