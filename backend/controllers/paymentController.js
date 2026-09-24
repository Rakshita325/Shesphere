const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { createNotification } = require('../services/notificationService');

// Initialise Razorpay with TEST MODE credentials (secret stays server-side only)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

/**
 * @desc    Create a Razorpay TEST MODE order and a matching SheSphere order
 * @route   POST /api/marketplace/payment/create-order
 * @access  Private (Buyer)
 *
 * Receives: { productId, quantity, shippingAddress, invoiceAddress }
 * Returns:  { keyId, razorpayOrderId, amount, currency, orderId, productName }
 *           — NEVER returns RAZORPAY_KEY_SECRET
 */
const createRazorpayOrder = async (req, res) => {
  try {
    const buyerId = req.user.id || req.user._id;
    const { productId, quantity, shippingAddress, invoiceAddress } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Product ID is required' });
    }

    const orderQty = Math.max(1, Number(quantity) || 1);

    // ── 1. Fetch product from DB — amount is calculated here, NEVER trusted from frontend ──
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.seller.toString() === buyerId.toString()) {
      return res.status(403).json({ success: false, message: 'You cannot purchase your own product.' });
    }
    if (!product.isActive) {
      return res.status(400).json({ success: false, message: 'This product is no longer available.' });
    }
    if (!product.isAvailable || product.quantity < orderQty) {
      return res.status(400).json({
        success: false,
        message: product.quantity < orderQty
          ? `Only ${product.quantity} item(s) available.`
          : 'Product is currently out of stock.'
      });
    }

    // ── 2. Calculate trusted amount (paise for Razorpay — INR × 100) ────────────
    const priceAtPurchase = product.price;
    const totalAmount = priceAtPurchase * orderQty;
    const amountInPaise = Math.round(totalAmount * 100); // e.g. ₹500 → 50000 paise

    const shipAddr = shippingAddress || {};
    const invAddr = invoiceAddress || shipAddr;

    // ── 3. Create SheSphere Order in DB (paymentStatus: pending) ─────────────────
    const sheSphereOrder = new Order({
      buyer: buyerId,
      product: product._id,
      seller: product.seller,
      quantity: orderQty,
      priceAtPurchase,
      totalAmount,
      shippingAddress: shipAddr,
      invoiceAddress: invAddr,
      status: 'Pending',
      paymentStatus: 'pending'
    });
    await sheSphereOrder.save();

    // ── 4. Decrement stock atomically ─────────────────────────────────────────────
    product.quantity = Math.max(0, product.quantity - orderQty);
    if (product.quantity === 0) product.isAvailable = false;
    await product.save();

    // ── 5. Create Razorpay TEST ORDER ─────────────────────────────────────────────
    const receipt = `ss_ord_${sheSphereOrder._id.toString().slice(-12)}`;
    const rpOrder = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      notes: {
        sheSphereOrderId: sheSphereOrder._id.toString(),
        productName: product.productName
      }
    });

    // ── 6. Link Razorpay order ID to SheSphere order ──────────────────────────────
    sheSphereOrder.razorpayOrderId = rpOrder.id;
    await sheSphereOrder.save();

    console.log(`[RAZORPAY TEST] SheSphere Order ID: ${sheSphereOrder._id} | Razorpay Order ID: ${rpOrder.id} | Amount: ₹${totalAmount} (${amountInPaise} paise)`);

    // ── 7. Return ONLY public information — NEVER return key_secret ───────────────
    return res.status(201).json({
      success: true,
      keyId: process.env.RAZORPAY_KEY_ID,   // Public key only — safe to send
      razorpayOrderId: rpOrder.id,
      amount: amountInPaise,
      currency: 'INR',
      orderId: sheSphereOrder._id,
      productName: product.productName
    });
  } catch (error) {
    console.error('❌ [RAZORPAY TEST] Error creating Razorpay order:', error.message);
    return res.status(500).json({ success: false, message: error.message || 'Failed to create payment order' });
  }
};

/**
 * @desc    Verify Razorpay payment signature (CRITICAL security step)
 * @route   POST /api/marketplace/payment/verify
 * @access  Private (Buyer)
 *
 * Receives: { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId }
 * Verifies: HMAC-SHA256(key_secret, razorpay_order_id + '|' + razorpay_payment_id)
 */
const verifyRazorpayPayment = async (req, res) => {
  try {
    const buyerId = req.user.id || req.user._id;
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderId } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !orderId) {
      return res.status(400).json({ success: false, message: 'Missing payment verification parameters' });
    }

    console.log(`[RAZORPAY TEST] Payment verification started for SheSphere Order: ${orderId}`);
    console.log(`[RAZORPAY TEST] Razorpay Order ID: ${razorpay_order_id} | Payment ID: ${razorpay_payment_id}`);

    // ── 1. Fetch SheSphere order ──────────────────────────────────────────────────
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // ── 2. Verify order belongs to the logged-in buyer ────────────────────────────
    if (order.buyer.toString() !== buyerId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to verify this payment' });
    }

    // ── 3. Verify the Razorpay order ID matches the one stored on this order ──────
    if (order.razorpayOrderId !== razorpay_order_id) {
      console.warn(`[RAZORPAY TEST] ⚠️  Order ID mismatch — stored: ${order.razorpayOrderId} | received: ${razorpay_order_id}`);
      return res.status(400).json({ success: false, message: 'Razorpay order ID mismatch' });
    }

    // ── 4. CRITICAL: Verify HMAC-SHA256 signature using server-side secret ────────
    //    Razorpay specification: sha256(key_secret, razorpay_order_id + '|' + razorpay_payment_id)
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    const isValid = expectedSignature === razorpay_signature;
    console.log(`[RAZORPAY TEST] Signature verification: ${isValid ? '✅ VALID' : '❌ INVALID'}`);

    if (!isValid) {
      // Mark payment as failed (don't mark paid)
      order.paymentStatus = 'failed';
      await order.save();
      console.warn(`[RAZORPAY TEST] ❌ Signature verification FAILED for order ${orderId}`);
      return res.status(400).json({
        success: false,
        message: 'Payment verification failed. Signature mismatch. Please contact support.'
      });
    }

    // ── 5. Signature is valid — mark order as paid ────────────────────────────────
    order.paymentStatus = 'paid';
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate('product', 'productName images price category')
      .populate('seller', 'fullName profilePicture email')
      .populate('buyer', 'fullName profilePicture email');

    console.log(`[RAZORPAY TEST] ✅ Payment SUCCESS — Order ${orderId} is now PAID`);
    console.log(`[RAZORPAY TEST] Payment Status: paid | Order Status: ${order.status}`);

    // ── 6. Create notifications (payment success) ─────────────────────────────────
    const productName = populatedOrder.product?.productName || 'item';

    // Notify buyer
    await createNotification({
      userId: order.buyer,
      type: 'MARKETPLACE',
      title: 'Payment Successful 💳',
      message: `Your payment for ${productName} was successful! Your order is now confirmed.`,
      relatedId: order._id
    });

    // Notify seller
    await createNotification({
      userId: order.seller,
      type: 'MARKETPLACE',
      title: 'New Paid Order Received 🛒',
      message: `A buyer has successfully paid for ${productName}. Please prepare the order for shipment.`,
      relatedId: order._id
    });

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully',
      paymentStatus: 'paid',
      order: populatedOrder
    });
  } catch (error) {
    console.error('❌ [RAZORPAY TEST] Error verifying payment:', error.message);
    return res.status(500).json({ success: false, message: error.message || 'Payment verification failed' });
  }
};

module.exports = { createRazorpayOrder, verifyRazorpayPayment };
