const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { createRazorpayOrder, verifyRazorpayPayment } = require('../controllers/paymentController');

// All payment routes require authentication
router.use(protect);

// POST /api/marketplace/payment/create-order
// Creates a Razorpay TEST order + SheSphere order. Returns keyId (public) + razorpayOrderId.
// NEVER returns RAZORPAY_KEY_SECRET.
router.post('/create-order', createRazorpayOrder);

// POST /api/marketplace/payment/verify
// Verifies Razorpay HMAC-SHA256 signature. Only marks order paid after verification.
router.post('/verify', verifyRazorpayPayment);

module.exports = router;
