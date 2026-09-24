const Order = require('../models/Order');
const Message = require('../models/Message');
const Notification = require('../models/Notification');

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Verify the requesting user is the buyer OR seller of the given order.
 * Returns { order, isBuyer, isSeller } or throws with a descriptive error.
 */
const verifyOrderParticipant = async (orderId, userId) => {
  const order = await Order.findById(orderId)
    .populate('buyer', '_id fullName profilePicture')
    .populate('seller', '_id fullName profilePicture')
    .populate('product', 'productName images');

  if (!order) {
    const err = new Error('Order not found');
    err.statusCode = 404;
    throw err;
  }

  const isBuyer = order.buyer._id.toString() === userId.toString();
  const isSeller = order.seller._id.toString() === userId.toString();

  if (!isBuyer && !isSeller) {
    const err = new Error('You are not a participant in this order');
    err.statusCode = 403;
    throw err;
  }

  return { order, isBuyer, isSeller };
};

/**
 * Messaging is only allowed once the order has been Shipped.
 */
const requireShippedOrDelivered = (order) => {
  if (!['Shipped', 'Delivered'].includes(order.status)) {
    const err = new Error(
      `Messaging is available only after the order has been shipped. Current status: ${order.status}`
    );
    err.statusCode = 403;
    throw err;
  }
};

// ─── Controller Functions ──────────────────────────────────────────────────────

/**
 * @desc    Get all messages for a specific order (buyer ↔ artisan only)
 * @route   GET /api/messages/order/:orderId
 * @access  Private (buyer or seller of that order)
 */
const getOrderMessages = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { orderId } = req.params;

    const { order } = await verifyOrderParticipant(orderId, userId);
    requireShippedOrDelivered(order);

    const messages = await Message.find({ orderId })
      .populate('senderId', '_id fullName profilePicture')
      .populate('receiverId', '_id fullName profilePicture')
      .sort({ createdAt: 1 });

    // Auto-mark received messages as read
    await Message.updateMany(
      { orderId, receiverId: userId, isRead: false },
      { $set: { isRead: true } }
    );

    return res.status(200).json({
      success: true,
      order: {
        _id: order._id,
        status: order.status,
        product: order.product,
        buyer: order.buyer,
        seller: order.seller
      },
      messages
    });
  } catch (error) {
    console.error('❌ Error fetching order messages:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Server error fetching messages'
    });
  }
};

/**
 * @desc    Send a message for a specific order
 * @route   POST /api/messages/order/:orderId
 * @access  Private (buyer or seller of that order)
 */
const sendOrderMessage = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { orderId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message cannot be empty' });
    }

    if (message.trim().length > 2000) {
      return res.status(400).json({ success: false, message: 'Message exceeds 2000 characters' });
    }

    const { order, isBuyer } = await verifyOrderParticipant(orderId, userId);
    requireShippedOrDelivered(order);

    // Determine receiver: if sender is buyer → receiver is seller, and vice versa
    const receiverId = isBuyer
      ? order.seller._id.toString()
      : order.buyer._id.toString();

    const newMessage = await Message.create({
      orderId,
      senderId: userId,
      receiverId,
      message: message.trim()
    });

    const populatedMessage = await Message.findById(newMessage._id)
      .populate('senderId', '_id fullName profilePicture')
      .populate('receiverId', '_id fullName profilePicture');

    // Create a notification for the receiver
    const senderName = isBuyer
      ? order.buyer.fullName
      : order.seller.fullName;

    const productName = order.product?.productName || 'your product';

    await Notification.create({
      userId: receiverId,
      type: 'MESSAGE',
      title: `New message from ${senderName}`,
      message: `Regarding order for "${productName}": ${message.trim().substring(0, 100)}${message.trim().length > 100 ? '…' : ''}`,
      relatedOrderId: orderId,
      relatedMessageId: newMessage._id
    });

    return res.status(201).json({
      success: true,
      message: populatedMessage
    });
  } catch (error) {
    console.error('❌ Error sending message:', error);
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || 'Server error sending message'
    });
  }
};

/**
 * @desc    Get unread message count across all orders for the current user
 * @route   GET /api/messages/unread-count
 * @access  Private
 */
const getUnreadMessageCount = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const count = await Message.countDocuments({ receiverId: userId, isRead: false });
    return res.status(200).json({ success: true, unreadCount: count });
  } catch (error) {
    console.error('❌ Error fetching unread count:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getOrderMessages,
  sendOrderMessage,
  getUnreadMessageCount
};
