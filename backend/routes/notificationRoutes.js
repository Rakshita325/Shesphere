const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getNotifications,
  markAsRead,
  markAllRead,
  deleteNotification
} = require('../controllers/notificationController');

// All notification routes require authentication
router.use(protect);

// GET  /api/notifications          — fetch all notifications for current user
router.get('/', getNotifications);

// PUT  /api/notifications/read-all — mark ALL as read (must be BEFORE /:id/read)
router.put('/read-all', markAllRead);

// PUT  /api/notifications/:id/read — mark ONE as read
router.put('/:id/read', markAsRead);

// DELETE /api/notifications/:id   — delete one notification
router.delete('/:id', deleteNotification);

module.exports = router;
