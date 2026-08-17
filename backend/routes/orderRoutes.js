const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createOrder,
  getUserPurchases,
  getSellerSales,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/orderController');

// All order routes require authentication
router.post('/', protect, createOrder);
router.get('/purchases', protect, getUserPurchases);
router.get('/sales', protect, getSellerSales);
router.patch('/:id/status', protect, updateOrderStatus);   // Seller: update status
router.patch('/:id/cancel', protect, cancelOrder);          // Buyer: cancel pending order

module.exports = router;
