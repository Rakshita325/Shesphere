const mongoose = require('mongoose');

const videoCommentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      required: [true, 'Video reference is required']
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

videoCommentSchema.index({ video: 1, createdAt: 1 });

module.exports = mongoose.model('VideoComment', videoCommentSchema);
