const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    activityType: {
      type: String,
      required: true,
      enum: [
        'JOIN_COMMUNITY',
        'LEAVE_COMMUNITY',
        'CREATE_POST',
        'LIKE_POST',
        'UNLIKE_POST',
        'ADD_COMMENT',
        'VIEW_COMMUNITY',
        'VIDEO_INTERACTION'
      ]
    },
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      default: null
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CommunityPost',
      default: null
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('UserActivity', userActivitySchema);
