const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order reference is required']
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender reference is required']
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Receiver reference is required']
    },
    message: {
      type: String,
      required: [true, 'Message content is required'],
      trim: true,
      maxlength: [2000, 'Message cannot exceed 2000 characters']
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

// Index for efficient order-based queries
messageSchema.index({ orderId: 1, createdAt: 1 });
// Index to quickly find unread messages for a user
messageSchema.index({ receiverId: 1, isRead: 1 });

module.exports = mongoose.model('Message', messageSchema);
