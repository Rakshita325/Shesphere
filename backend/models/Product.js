const mongoose = require('mongoose');

const productCategories = [
  'Handicrafts',
  'Embroidery',
  'Paintings',
  'Candles',
  'Soaps',
  'Jewellery',
  'Clothing',
  'Baked Goods',
  'Pickles',
  'Decor',
  'Others'
];

const productSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Seller reference is required']
    },
    productName: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true
    },
    category: {
      type: String,
      enum: productCategories,
      required: [true, 'Category is required'],
      default: 'Others'
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative']
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true
    },
    images: {
      type: [String],
      default: []
    },
    quantity: {
      type: Number,
      required: [true, 'Available quantity is required'],
      default: 1,
      min: [0, 'Quantity cannot be negative']
    },
    location: {
      type: String,
      default: '',
      trim: true
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviewsCount: {
      type: Number,
      default: 0
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    isRecommended: {
      type: Boolean,
      default: false
    },
    // Whether the seller manually marked this available/unavailable
    isAvailable: {
      type: Boolean,
      default: true
    },
    // Soft-delete: false means product is hidden from marketplace but orders still exist
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Auto-mark isAvailable=false when quantity reaches 0
productSchema.pre('save', function () {
  if (this.quantity <= 0) {
    this.isAvailable = false;
  }
});

// Indexing for search optimization
productSchema.index({ productName: 'text', description: 'text', category: 1 });

module.exports = mongoose.model('Product', productSchema);
