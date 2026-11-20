const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} = require('../controllers/notificationController');

// All notification routes require authentication

// IMPORTANT: specific literal routes (/count, /read-all) MUST be declared before
// parameterised routes (/:id) to avoid Express matching the literal path as an ID.
router.get('/count', protect, getUnreadCount);       // lightweight unread count poll
router.get('/', protect, getNotifications);           // full list (latest 50)
router.put('/read-all', protect, markAllAsRead);      // mark all as read
router.put('/:id/read', protect, markAsRead);         // mark single as read
router.delete('/:id', protect, deleteNotification);   // delete single

module.exports = router;
