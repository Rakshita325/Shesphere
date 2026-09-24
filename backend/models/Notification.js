const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required']
    },
    type: {
      type: String,
      enum: ['MARKETPLACE', 'STREAK', 'COMMUNITY', 'MESSAGE', 'GENERAL'],
      default: 'GENERAL'
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    // Optional references for deep-linking
    relatedOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null
    },
    relatedMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Message',
      default: null
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Index for fast per-user lookup sorted by newest first
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
