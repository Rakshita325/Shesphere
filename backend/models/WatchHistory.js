const mongoose = require('mongoose');

const watchHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      required: true
    },
    watchedSeconds: {
      type: Number,
      default: 0
    },
    progressPercentage: {
      type: Number,
      default: 0
    },
    completed: {
      type: Boolean,
      default: false
    },
    watchedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

// Ensure one record per user per video
watchHistorySchema.index({ userId: 1, videoId: 1 }, { unique: true });

module.exports = mongoose.model('WatchHistory', watchHistorySchema);
