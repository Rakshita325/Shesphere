const Notification = require('../models/Notification');

/**
 * Reusable function to create a notification in MongoDB.
 *
 * @param {Object} params
 * @param {string|ObjectId} params.userId   - Recipient user ID
 * @param {string}          params.type     - 'MARKETPLACE' | 'STREAK' | 'COMMUNITY'
 * @param {string}          params.title    - Short notification title
 * @param {string}          params.message  - Full notification message
 * @param {string|ObjectId} [params.relatedId] - Related document ID (order, post, etc.)
 * @param {Object}          [params.metadata]  - Extra key-value data (e.g. reminderDate, milestoneName)
 *
 * @returns {Promise<Document>} The saved Notification document
 */
const createNotification = async ({
  userId,
  type,
  title,
  message,
  relatedId = null,
  metadata = {}
}) => {
  try {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      relatedId,
      metadata
    });
    await notification.save();
    return notification;
  } catch (err) {
    // Non-fatal — log but don't crash the calling controller
    console.error('❌ [NotificationService] Failed to create notification:', err.message);
    return null;
  }
};

module.exports = { createNotification };
