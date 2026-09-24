const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getOrderMessages,
  sendOrderMessage,
  getUnreadMessageCount
} = require('../controllers/messageController');

// All messaging routes require authentication
router.get('/unread-count', protect, getUnreadMessageCount);
router.get('/order/:orderId', protect, getOrderMessages);
router.post('/order/:orderId', protect, sendOrderMessage);

module.exports = router;
