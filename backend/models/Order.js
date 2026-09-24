const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    addressLine: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    pincode: { type: String, default: '' }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    buyer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Buyer reference is required']
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product reference is required']
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller reference is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      default: 1,
      min: [1, 'Quantity must be at least 1']
    },
    // Price captured at the moment of purchase — never changes even if seller edits price later
    priceAtPurchase: {
      type: Number,
      required: [true, 'Price at purchase is required'],
      min: [0, 'Price cannot be negative']
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: [0, 'Total amount cannot be negative']
    },
    shippingAddress: {
      type: addressSchema,
      default: () => ({})
    },
    invoiceAddress: {
      type: addressSchema,
      default: () => ({})
    },
    // Status lifecycle: Pending → Shipped → Delivered
    // Buyer can cancel while Pending: Pending → Cancelled
    status: {
      type: String,
      enum: ['Pending', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending'
    },
    // Payment lifecycle: pending → paid | failed
    // Separate from fulfilment status above
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending'
    },
    // Razorpay TEST MODE order reference (e.g. order_xxxxxxxxxxxxxxxxxx)
    razorpayOrderId: {
      type: String,
      default: null
    },
    // Razorpay payment ID stored after successful signature verification
    razorpayPaymentId: {
      type: String,
      default: null
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Order', orderSchema);
