const Order = require('../models/Order');
const Product = require('../models/Product');

// Valid seller-controlled status transitions
const SELLER_TRANSITIONS = {
  Pending: ['Shipped', 'Cancelled'],
  Shipped: ['Delivered'],
  Delivered: [],
  Cancelled: []
};

// Buyer may only cancel Pending orders
const BUYER_CANCEL_ALLOWED = ['Pending'];

/**
 * @desc    Create a new order (Purchase a product)
 * @route   POST /api/marketplace/orders
 * @access  Private (Buyer)
 */
const createOrder = async (req, res) => {
  try {
    const buyerId = req.user.id || req.user._id;
    const {
      productId,
      product: prodIdInput,
      quantity,
      shippingAddress,
      invoiceAddress
    } = req.body;

    const targetProductId = productId || prodIdInput;

    if (!targetProductId) {
      return res.status(400).json({ success: false, message: 'Product ID is required to place an order' });
    }

    const orderQty = Number(quantity) || 1;
    if (orderQty < 1) {
      return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
    }

    const product = await Product.findById(targetProductId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // ── Business rule: seller cannot buy own product ──────────────────────────
    if (product.seller.toString() === buyerId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You cannot purchase your own product.'
      });
    }

    // ── Product must be active ────────────────────────────────────────────────
    if (!product.isActive) {
      return res.status(400).json({ success: false, message: 'This product is no longer available.' });
    }

    // ── Product must be available ─────────────────────────────────────────────
    if (!product.isAvailable) {
      return res.status(400).json({ success: false, message: 'Sorry, this product is currently out of stock.' });
    }

    // ── Sufficient stock check ────────────────────────────────────────────────
    if (product.quantity < orderQty) {
      return res.status(400).json({
        success: false,
        message: `Only ${product.quantity} item(s) available. Please reduce your quantity.`
      });
    }

    const priceAtPurchase = product.price;
    const totalAmount = priceAtPurchase * orderQty;

    // Build address snapshot (buyer provides at checkout; fallback to empty)
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
      status: 'Pending'
    });

    await order.save();

    // Decrement stock atomically
    product.quantity = Math.max(0, product.quantity - orderQty);
    await product.save(); // triggers pre-save hook to set isAvailable=false if qty hits 0

    const populatedOrder = await Order.findById(order._id)
      .populate('product', 'productName images price category')
      .populate('seller', 'fullName profilePicture email')
      .populate('buyer', 'fullName profilePicture email');

    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      order: populatedOrder
    });
  } catch (error) {
    console.error('❌ Error creating order:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error creating order' });
  }
};

/**
 * @desc    Get purchases made by the current user (My Purchases)
 * @route   GET /api/marketplace/orders/purchases
 * @access  Private (Buyer)
 */
const getUserPurchases = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const purchases = await Order.find({ buyer: userId })
      .populate('product', 'productName images price category description isActive isAvailable')
      .populate('seller', 'fullName profilePicture email location')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: purchases.length, orders: purchases });
  } catch (error) {
    console.error('❌ Error fetching user purchases:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching purchases' });
  }
};

/**
 * @desc    Get incoming sales orders for the seller
 * @route   GET /api/marketplace/orders/sales
 * @access  Private (Seller)
 */
const getSellerSales = async (req, res) => {
  try {
    const sellerId = req.user.id || req.user._id;

    const sales = await Order.find({ seller: sellerId })
      .populate('product', 'productName images price category')
      .populate('buyer', 'fullName profilePicture email phoneNumber')
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, count: sales.length, orders: sales });
  } catch (error) {
    console.error('❌ Error fetching seller sales:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching sales orders' });
  }
};

/**
 * @desc    Seller updates order status (Pending→Shipped, Shipped→Delivered)
 * @route   PATCH /api/marketplace/orders/:id/status
 * @access  Private (Seller only)
 */
const updateOrderStatus = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const isSeller = order.seller.toString() === userId.toString();
    if (!isSeller) {
      return res.status(403).json({ success: false, message: 'Only the seller can update this order status' });
    }

    const allowedTransitions = SELLER_TRANSITIONS[order.status] || [];
    if (!allowedTransitions.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from "${order.status}" to "${status}". Allowed: ${allowedTransitions.join(', ') || 'none'}`
      });
    }

    // Restore stock if seller cancels
    if (status === 'Cancelled') {
      const product = await Product.findById(order.product);
      if (product) {
        product.quantity += order.quantity;
        if (product.quantity > 0) product.isAvailable = true;
        await product.save();
      }
    }

    order.status = status;
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('product', 'productName images price category')
      .populate('seller', 'fullName profilePicture email')
      .populate('buyer', 'fullName profilePicture email');

    return res.status(200).json({
      success: true,
      message: `Order status updated to ${status}`,
      order: updatedOrder
    });
  } catch (error) {
    console.error('❌ Error updating order status:', error);
    return res.status(500).json({ success: false, message: 'Server error updating order status' });
  }
};

/**
 * @desc    Buyer cancels a Pending order (restores stock)
 * @route   PATCH /api/marketplace/orders/:id/cancel
 * @access  Private (Buyer only)
 */
const cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const isBuyer = order.buyer.toString() === userId.toString();
    if (!isBuyer) {
      return res.status(403).json({ success: false, message: 'Only the buyer can cancel this order' });
    }

    if (!BUYER_CANCEL_ALLOWED.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `This order can no longer be cancelled. Current status: ${order.status}`
      });
    }

    // Restore stock
    const product = await Product.findById(order.product);
    if (product) {
      product.quantity += order.quantity;
      if (product.quantity > 0 && product.isActive) product.isAvailable = true;
      await product.save();
    }

    order.status = 'Cancelled';
    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('product', 'productName images price category')
      .populate('seller', 'fullName profilePicture email')
      .populate('buyer', 'fullName profilePicture email');

    return res.status(200).json({
      success: true,
      message: 'Order cancelled successfully. Stock has been restored.',
      order: updatedOrder
    });
  } catch (error) {
    console.error('❌ Error cancelling order:', error);
    return res.status(500).json({ success: false, message: 'Server error cancelling order' });
  }
};

module.exports = {
  createOrder,
  getUserPurchases,
  getSellerSales,
  updateOrderStatus,
  cancelOrder
};
