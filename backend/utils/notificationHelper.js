const Notification = require('../models/Notification');

/**
 * Create a notification and persist it to MongoDB.
 * Silently swallows errors so a notification failure never breaks the primary action.
 *
 * @param {Object} opts
 * @param {string|ObjectId} opts.userId        - Recipient user ID
 * @param {string}          opts.type          - 'MARKETPLACE' | 'STREAK' | 'COMMUNITY' | 'MESSAGE' | 'GENERAL'
 * @param {string}          opts.title         - Short notification title
 * @param {string}          opts.message       - Full notification message
 * @param {string|null}     [opts.relatedOrderId]   - Optional order ObjectId for deep-link
 * @param {string|null}     [opts.relatedMessageId] - Optional message ObjectId for deep-link
 * @param {boolean}         [opts.deduplicateByOrder] - If true, skip if same userId+title+relatedOrderId exists
 * @returns {Promise<void>}
 */
const createNotification = async ({
  userId,
  type = 'GENERAL',
  title,
  message,
  relatedOrderId = null,
  relatedMessageId = null,
  deduplicateByOrder = false
}) => {
  try {
    // Validate required fields before hitting MongoDB
    if (!userId) {
      console.warn('⚠️  [notificationHelper] Skipped — userId is missing. title:', title);
      return;
    }
    if (!title || !message) {
      console.warn('⚠️  [notificationHelper] Skipped — title or message is missing. userId:', userId);
      return;
    }

    // Optional deduplication: avoid firing the same notification twice for the same order
    // (e.g., if verifyPayment is called more than once due to a network retry)
    if (deduplicateByOrder && relatedOrderId) {
      const existing = await Notification.findOne({ userId, title, relatedOrderId });
      if (existing) {
        console.log(`ℹ️  [notificationHelper] Duplicate skipped: "${title}" for order ${relatedOrderId}`);
        return;
      }
    }

    const doc = await Notification.create({
      userId,
      type,
      title,
      message,
      relatedOrderId: relatedOrderId || null,
      relatedMessageId: relatedMessageId || null,
      isRead: false
    });

    console.log(`✅ [notificationHelper] Created "${title}" → userId: ${userId} | _id: ${doc._id}`);
  } catch (err) {
    // Log but do not rethrow — notifications are non-critical side-effects
    console.error('❌ [notificationHelper] Failed to create notification:', err.message, '| title:', title, '| userId:', userId);
  }
};

// ── Pre-built notification factories ─────────────────────────────────────────

/**
 * Marketplace: notify the SELLER when a new order is placed for their product.
 */
const notifyNewOrder = (sellerId, productName, qty, orderId) =>
  createNotification({
    userId: sellerId,
    type: 'MARKETPLACE',
    title: '🛒 New Order Received!',
    message: `Someone placed an order for ${qty}× "${productName}". Review your seller dashboard.`,
    relatedOrderId: orderId,
    deduplicateByOrder: true   // prevent double-fire if verifyPayment retries
  });

/**
 * Marketplace: notify the BUYER that their order was confirmed + paid.
 */
const notifyOrderConfirmed = (buyerId, productName, orderId) =>
  createNotification({
    userId: buyerId,
    type: 'MARKETPLACE',
    title: '✅ Order Confirmed',
    message: `Your order for "${productName}" has been confirmed and is awaiting shipment.`,
    relatedOrderId: orderId,
    deduplicateByOrder: true   // prevent double-fire if verifyPayment retries
  });

/**
 * Marketplace: notify the BUYER their order has been shipped.
 */
const notifyOrderShipped = (buyerId, productName, orderId) =>
  createNotification({
    userId: buyerId,
    type: 'MARKETPLACE',
    title: '🚚 Order Shipped!',
    message: `Great news! Your order for "${productName}" is on its way to you.`,
    relatedOrderId: orderId
  });

/**
 * Marketplace: notify the BUYER their order was delivered.
 */
const notifyOrderDelivered = (buyerId, productName, orderId) =>
  createNotification({
    userId: buyerId,
    type: 'MARKETPLACE',
    title: '📦 Order Delivered',
    message: `Your order for "${productName}" has been delivered. Enjoy your purchase!`,
    relatedOrderId: orderId
  });

/**
 * Marketplace: notify the BUYER their order was cancelled by the seller.
 */
const notifyOrderCancelledBySeller = (buyerId, productName, orderId) =>
  createNotification({
    userId: buyerId,
    type: 'MARKETPLACE',
    title: '❌ Order Cancelled by Seller',
    message: `Your order for "${productName}" was cancelled by the seller. Any payment will be refunded.`,
    relatedOrderId: orderId
  });

/**
 * Marketplace: notify the SELLER when the buyer cancels an order.
 */
const notifyOrderCancelledByBuyer = (sellerId, productName, orderId) =>
  createNotification({
    userId: sellerId,
    type: 'MARKETPLACE',
    title: '❌ Order Cancelled by Buyer',
    message: `The buyer cancelled their order for "${productName}". Stock has been restored.`,
    relatedOrderId: orderId
  });

// ── Streak notification factories ─────────────────────────────────────────────

/**
 * Streak: notify the user they hit a milestone.
 * @param {string|ObjectId} userId
 * @param {Object} badge  - { name, icon, days, description }
 */
const notifyStreakMilestone = (userId, badge) =>
  createNotification({
    userId,
    type: 'STREAK',
    title: `${badge.icon} ${badge.name} Unlocked!`,
    message: badge.description || `You've maintained a ${badge.days}-day learning streak. Keep it up!`
  });

/**
 * Streak: remind user their streak is at risk (call this from a scheduler if needed).
 * @param {string|ObjectId} userId
 * @param {number}          currentStreak
 */
const notifyStreakAtRisk = (userId, currentStreak) =>
  createNotification({
    userId,
    type: 'STREAK',
    title: '🔥 Your Streak is at Risk!',
    message: `Don't break your ${currentStreak}-day streak! Complete an activity today to keep it alive.`
  });

module.exports = {
  createNotification,
  notifyNewOrder,
  notifyOrderConfirmed,
  notifyOrderShipped,
  notifyOrderDelivered,
  notifyOrderCancelledBySeller,
  notifyOrderCancelledByBuyer,
  notifyStreakMilestone,
  notifyStreakAtRisk
};
