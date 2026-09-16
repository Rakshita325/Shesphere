const mongoose = require('mongoose');

const videoLikeSchema = new mongoose.Schema(
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
    }
  },
  {
    timestamps: true
  }
);

videoLikeSchema.index({ user: 1, video: 1 }, { unique: true });

module.exports = mongoose.model('VideoLike', videoLikeSchema);
