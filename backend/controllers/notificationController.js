const Notification = require('../models/Notification');

/**
 * @desc    Get notifications for the current user (most recent first, limit 50)
 *          Also returns the accurate unread count from the full dataset (not just the page).
 * @route   GET /api/notifications
 * @access  Private
 */
const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    // Run both queries in parallel for performance
    const [notifications, unreadCount] = await Promise.all([
      Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      Notification.countDocuments({ userId, isRead: false })
    ]);

    return res.status(200).json({ success: true, notifications, unreadCount });
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching notifications' });
  }
};

/**
 * @desc    Get just the unread notification count (lightweight poll endpoint)
 * @route   GET /api/notifications/count
 * @access  Private
 */
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const unreadCount = await Notification.countDocuments({ userId, isRead: false });
    return res.status(200).json({ success: true, unreadCount });
  } catch (error) {
    console.error('❌ Error fetching unread count:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Mark a single notification as read
 * @route   PUT /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId },
      { isRead: true },
      { returnDocument: 'after' }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    return res.status(200).json({ success: true, notification, unreadCount });
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Mark all notifications as read for the current user
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    await Notification.updateMany({ userId, isRead: false }, { isRead: true });

    return res.status(200).json({ success: true, message: 'All notifications marked as read', unreadCount: 0 });
  } catch (error) {
    console.error('❌ Error marking all notifications as read:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Delete a single notification
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
const deleteNotification = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const notification = await Notification.findOneAndDelete({ _id: req.params.id, userId });

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    const unreadCount = await Notification.countDocuments({ userId, isRead: false });

    return res.status(200).json({ success: true, message: 'Notification deleted', unreadCount });
  } catch (error) {
    console.error('❌ Error deleting notification:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getNotifications, getUnreadCount, markAsRead, markAllAsRead, deleteNotification };
