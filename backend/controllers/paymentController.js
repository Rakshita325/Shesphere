const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const {
  notifyNewOrder,
  notifyOrderConfirmed
} = require('../utils/notificationHelper');

// Initialize Razorpay with Test Mode keys from .env
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * @desc    Create a Razorpay order + SheSphere order (Pending, paymentStatus: pending)
 * @route   POST /api/marketplace/payment/create-order
 * @access  Private (Buyer)
 *
 * Frontend sends: { productId, quantity, shippingAddress, invoiceAddress }
 * Response:       { success, orderId, razorpayOrderId, amount, currency, keyId, user }
 */
const createRazorpayOrder = async (req, res) => {
  try {
    const buyerId = req.user.id || req.user._id;
    const { productId, quantity, shippingAddress, invoiceAddress } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const orderQty = Number(quantity) || 1;
    if (orderQty < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Seller cannot buy own product
    if (product.seller.toString() === buyerId.toString()) {
      return res.status(403).json({ success: false, message: 'You cannot purchase your own product.' });
    }

    if (!product.isActive) {
      return res.status(400).json({ success: false, message: 'This product is no longer available.' });
    }

    if (!product.isAvailable) {
      return res.status(400).json({ success: false, message: 'Sorry, this product is currently out of stock.' });
    }

    if (product.quantity < orderQty) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.quantity} item(s) available. Please reduce your quantity.`
      });
    }

    const priceAtPurchase = product.price;
    const totalAmount = priceAtPurchase * orderQty;
    const amountInPaise = Math.round(totalAmount * 100); // Razorpay expects paise

    // 1. Create Razorpay order (Test Mode)
    const razorpayOrder = await razorpayInstance.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `shesphere_${Date.now()}`,
      notes: {
        productId: product._id.toString(),
        buyerId: buyerId.toString()
      }
    });

    // 2. Create SheSphere order in DB (status: Pending, paymentStatus: pending)
    const shipAddr = shippingAddress || {};
    const invAddr = invoiceAddress || shipAddr;

    const order = new Order({
      buyer: buyerId,
      product: product._id,
      seller: product.seller,
      quantity: orderQty,
      priceAtPurchase,
      totalAmount,
      shippingAddress: shipAddr,
      invoiceAddress: invAddr,
      status: 'Pending',
      paymentStatus: 'pending',
      razorpayOrderId: razorpayOrder.id
    });

    await order.save();

    // Decrement stock immediately (will restore if payment fails or is cancelled)
    product.quantity = Math.max(0, product.quantity - orderQty);
    await product.save();

    // Fetch buyer info for Razorpay prefill
    const buyer = await User.findById(buyerId).select('fullName email phoneNumber');

    return res.status(201).json({
      success: true,
      orderId: order._id,
      razorpayOrderId: razorpayOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
      user: buyer ? { email: buyer.email, name: buyer.fullName, phone: buyer.phoneNumber } : {}
    });
  } catch (error) {
    console.error('❌ Error creating Razorpay order:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating payment order'
    });
  }
};

/**
 * @desc    Verify Razorpay payment signature and mark order as paid
 * @route   POST /api/marketplace/payment/verify
 * @access  Private (Buyer)
 *
 * Frontend sends: { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId }
 * Response:       { success, message }
 */
const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
      return res.status(400).json({ success: false, message: 'Missing payment verification parameters' });
    }

    // Verify HMAC signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      // Signature mismatch — potential tamper
      const order = await Order.findById(orderId);
      if (order) {
        order.paymentStatus = 'failed';
        await order.save();

        // Restore stock since payment failed
        const product = await Product.findById(order.product);
        if (product) {
          product.quantity += order.quantity;
          if (product.quantity > 0 && product.isActive) product.isAvailable = true;
          await product.save();
        }
      }
      return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
    }

    // Signature valid — mark order as paid
    const order = await Order.findById(orderId).populate('product', 'productName');
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    order.paymentStatus = 'paid';
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    // ── Notifications (fire-and-forget, runs in background) ─────────────────
    // Use Promise.allSettled so both notifications run concurrently.
    // Intentionally NOT awaited — response is returned immediately.
    // Any failure is caught inside createNotification and logged.
    const productName = order.product?.productName || 'your product';
    const buyerId = order.buyer;   // ObjectId — correct userId for buyer
    const sellerId = order.seller; // ObjectId — correct userId for seller

    Promise.allSettled([
      notifyNewOrder(sellerId, productName, order.quantity, order._id),
      notifyOrderConfirmed(buyerId, productName, order._id)
    ]).then((results) => {
      results.forEach((r) => {
        if (r.status === 'rejected') {
          console.error('❌ [paymentController] Notification promise rejected:', r.reason);
        }
      });
    });

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully'
    });
  } catch (error) {
    console.error('❌ Error verifying payment:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error verifying payment'
    });
  }
};

module.exports = {
  createRazorpayOrder,
  verifyPayment
};
