const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');
const Review = require('../models/Review');
const { uploadToCloudinary } = require('../middleware/uploadMiddleware');

// ─── Helper: map raw Mongoose product to API shape ───────────────────────────
const mapProduct = (p) => ({
  _id: p._id,
  productName: p.productName,
  category: p.category,
  price: p.price,
  description: p.description,
  images: p.images,
  quantity: p.quantity,
  location: p.location,
  rating: p.rating,
  reviewsCount: p.reviewsCount,
  isFeatured: p.isFeatured,
  isRecommended: p.isRecommended,
  isAvailable: p.isAvailable,
  isActive: p.isActive,
  seller: p.seller,
  createdAt: p.createdAt,
  updatedAt: p.updatedAt
});

/**
 * @desc    Create a new product
 * @route   POST /api/marketplace/products
 * @access  Private (Seller)
 */
const createProduct = async (req, res) => {
  try {
    const sellerId = req.user.id || req.user._id;
    const {
      productName,
      name,
      category,
      price,
      description,
      quantity,
      location,
      images: bodyImages,
      isFeatured
    } = req.body;

    const title = productName || name;
    if (!title || !price || !description) {
      return res.status(400).json({
        success: false,
        message: 'Product name, price, and description are required'
      });
    }

    if (Number(price) <= 0) {
      return res.status(400).json({ success: false, message: 'Price must be greater than 0' });
    }

    let imageUrls = [];

    // Handle files uploaded via multipart/form-data with Multer
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer, 'shesphere_marketplace');
        imageUrls.push(url);
      }
    }

    // Also handle array of image URL strings if sent in JSON body
    if (bodyImages) {
      const parsedImages = typeof bodyImages === 'string' ? JSON.parse(bodyImages) : bodyImages;
      if (Array.isArray(parsedImages)) {
        imageUrls = [...imageUrls, ...parsedImages.filter(Boolean)];
      }
    }

    const product = new Product({
      seller: sellerId,
      productName: title.trim(),
      category: category || 'Handicrafts',
      price: Number(price),
      description: description.trim(),
      images: imageUrls,
      quantity: quantity !== undefined ? Number(quantity) : 1,
      location: location ? location.trim() : '',
      isFeatured: isFeatured === 'true' || isFeatured === true,
      isAvailable: true,
      isActive: true
    });

    await product.save();

    const populatedProduct = await Product.findById(product._id).populate(
      'seller',
      'fullName profilePicture email phoneNumber'
    );

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product: mapProduct(populatedProduct)
    });
  } catch (error) {
    console.error('❌ Error creating product:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating product'
    });
  }
};

/**
 * @desc    Get all active marketplace products (excludes seller's own if logged in)
 * @route   GET /api/marketplace/products
 * @access  Public
 */
const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const skip = (page - 1) * limit;

    // Exclude own products if user is logged in
    const filter = { isActive: true };
    if (req.user && (req.user.id || req.user._id)) {
      const userId = req.user.id || req.user._id;
      filter.seller = { $ne: userId };
    }

    const totalProducts = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate('seller', 'fullName profilePicture email phoneNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      products: products.map(mapProduct),
      totalProducts,
      currentPage: page,
      totalPages: Math.ceil(totalProducts / limit)
    });
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching products' });
  }
};

/**
 * @desc    Search and filter products (excludes own, excludes inactive)
 * @route   GET /api/marketplace/products/search
 * @access  Public
 */
const searchProducts = async (req, res) => {
  try {
    const { q, query, category, minPrice, maxPrice, sort } = req.query;
    const searchTerm = (q || query || '').trim();

    let filter = { isActive: true };

    // Exclude own products when user is logged in
    if (req.user && (req.user.id || req.user._id)) {
      const userId = req.user.id || req.user._id;
      filter.seller = { $ne: userId };
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    if (searchTerm) {
      const searchRegex = new RegExp(searchTerm, 'i');
      const matchingUsers = await User.find({ fullName: searchRegex }).select('_id');
      const matchingUserIds = matchingUsers.map((u) => u._id);

      // Merge with existing seller filter
      const sellerFilter = filter.seller ? { ...filter.seller, $in: matchingUserIds } : undefined;

      const orConditions = [
        { productName: searchRegex },
        { description: searchRegex },
        { category: searchRegex }
      ];
      if (sellerFilter) {
        // We can't merge $ne and $in on same field, so use the name-based filter only
        orConditions.push({ seller: { $in: matchingUserIds } });
      } else {
        orConditions.push({ seller: { $in: matchingUserIds } });
      }

      filter.$or = orConditions;
    }

    let sortOptions = { createdAt: -1 };
    if (sort === 'Price Low to High' || sort === 'price-asc') sortOptions = { price: 1 };
    else if (sort === 'Price High to Low' || sort === 'price-desc') sortOptions = { price: -1 };
    else if (sort === 'Rating' || sort === 'rating-desc') sortOptions = { rating: -1 };

    const products = await Product.find(filter)
      .populate('seller', 'fullName profilePicture email phoneNumber')
      .sort(sortOptions);

    return res.status(200).json({
      success: true,
      count: products.length,
      products: products.map(mapProduct)
    });
  } catch (error) {
    console.error('❌ Error searching products:', error);
    return res.status(500).json({ success: false, message: 'Server error searching products' });
  }
};

/**
 * @desc    Get products belonging to the current logged-in seller
 * @route   GET /api/marketplace/products/my-products
 * @access  Private (Seller)
 */
const getMyProducts = async (req, res) => {
  try {
    const sellerId = req.user.id || req.user._id;

    const products = await Product.find({ seller: sellerId })
      .populate('seller', 'fullName profilePicture email')
      .sort({ createdAt: -1 });

    // For each product, attach order summary counts
    const productIds = products.map((p) => p._id);
    const orders = await Order.find({ product: { $in: productIds } }).select(
      'product status quantity totalAmount'
    );

    const ordersByProduct = {};
    for (const o of orders) {
      const pid = o.product.toString();
      if (!ordersByProduct[pid]) {
        ordersByProduct[pid] = {
          pending: 0,
          shipped: 0,
          delivered: 0,
          cancelled: 0,
          totalOrders: 0,
          unitsSold: 0,
          revenue: 0
        };
      }
      ordersByProduct[pid].totalOrders++;
      if (o.status === 'Pending') ordersByProduct[pid].pending++;
      else if (o.status === 'Shipped') ordersByProduct[pid].shipped++;
      else if (o.status === 'Delivered') {
        ordersByProduct[pid].delivered++;
        ordersByProduct[pid].unitsSold += o.quantity;
        ordersByProduct[pid].revenue += o.totalAmount;
      }
      else if (o.status === 'Cancelled') ordersByProduct[pid].cancelled++;
    }

    const result = products.map((p) => ({
      ...mapProduct(p),
      orderStats: ordersByProduct[p._id.toString()] || {
        pending: 0, shipped: 0, delivered: 0, cancelled: 0,
        totalOrders: 0, unitsSold: 0, revenue: 0
      }
    }));

    return res.status(200).json({ success: true, products: result });
  } catch (error) {
    console.error('❌ Error fetching my products:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching your products' });
  }
};

/**
 * @desc    Get single product details with seller info, reviews & related products
 * @route   GET /api/marketplace/products/:id
 * @access  Public
 */
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'seller',
      'fullName profilePicture email phoneNumber location interest'
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const reviews = await Review.find({ product: product._id })
      .populate('user', 'fullName profilePicture')
      .sort({ createdAt: -1 });

    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true
    })
      .populate('seller', 'fullName profilePicture')
      .limit(4);

    return res.status(200).json({
      success: true,
      product: mapProduct(product),
      seller: product.seller,
      reviews,
      relatedProducts: relatedProducts.map(mapProduct)
    });
  } catch (error) {
    console.error('❌ Error fetching product details:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching product details' });
  }
};

/**
 * @desc    Update product (Seller only) – supports image file re-upload
 * @route   PUT /api/marketplace/products/:id
 * @access  Private (Seller owner)
 */
const updateProduct = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.seller.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this product' });
    }

    const { productName, name, price, description, quantity, category, location, images } = req.body;

    if (productName || name) product.productName = (productName || name).trim();
    if (price !== undefined && price !== '') product.price = Number(price);
    if (description) product.description = description.trim();
    if (quantity !== undefined && quantity !== '') product.quantity = Number(quantity);
    if (category) product.category = category;
    if (location !== undefined) product.location = location.trim();

    // Handle new file uploads
    if (req.files && req.files.length > 0) {
      const newImageUrls = [];
      for (const file of req.files) {
        const url = await uploadToCloudinary(file.buffer, 'shesphere_marketplace');
        newImageUrls.push(url);
      }
      product.images = newImageUrls;
    } else if (images && Array.isArray(images)) {
      product.images = images.filter(Boolean);
    }

    await product.save();

    const updated = await Product.findById(product._id).populate(
      'seller',
      'fullName profilePicture email'
    );

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      product: mapProduct(updated)
    });
  } catch (error) {
    console.error('❌ Error updating product:', error);
    return res.status(500).json({ success: false, message: 'Server error updating product' });
  }
};

/**
 * @desc    Delete product (Seller only) — soft-delete if orders exist
 * @route   DELETE /api/marketplace/products/:id
 * @access  Private (Seller owner)
 */
const deleteProduct = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.seller.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this product' });
    }

    // Check for existing orders
    const orderCount = await Order.countDocuments({ product: product._id });

    if (orderCount > 0) {
      // Soft delete — preserve historical order data
      product.isActive = false;
      product.isAvailable = false;
      await product.save();
      return res.status(200).json({
        success: true,
        message: 'Product deactivated (hidden from marketplace). Historical orders preserved.',
        softDeleted: true
      });
    }

    // Hard delete if no orders
    await Product.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: 'Product deleted successfully', softDeleted: false });
  } catch (error) {
    console.error('❌ Error deleting product:', error);
    return res.status(500).json({ success: false, message: 'Server error deleting product' });
  }
};

/**
 * @desc    Toggle product availability (Mark In Stock / Out of Stock)
 * @route   PATCH /api/marketplace/products/:id/availability
 * @access  Private (Seller owner)
 */
const toggleAvailability = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    if (product.seller.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this product' });
    }

    const { isAvailable } = req.body;
    product.isAvailable = typeof isAvailable === 'boolean' ? isAvailable : !product.isAvailable;
    await product.save();

    return res.status(200).json({
      success: true,
      message: `Product marked as ${product.isAvailable ? 'In Stock' : 'Out of Stock'}`,
      isAvailable: product.isAvailable
    });
  } catch (error) {
    console.error('❌ Error toggling availability:', error);
    return res.status(500).json({ success: false, message: 'Server error updating availability' });
  }
};

/**
 * @desc    Get featured products
 * @route   GET /api/marketplace/products/featured
 * @access  Public
 */
const getFeaturedProducts = async (req, res) => {
  try {
    let filter = { isFeatured: true, isActive: true };
    let featuredProducts = await Product.find(filter)
      .populate('seller', 'fullName profilePicture email')
      .limit(6);

    if (featuredProducts.length === 0) {
      featuredProducts = await Product.find({ isActive: true })
        .sort({ rating: -1 })
        .populate('seller', 'fullName profilePicture email')
        .limit(4);
    }

    return res.status(200).json({ success: true, products: featuredProducts.map(mapProduct) });
  } catch (error) {
    console.error('❌ Error fetching featured products:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching featured products' });
  }
};

/**
 * @desc    Get recommended products based on user interests
 * @route   GET /api/marketplace/products/recommended
 * @access  Public / Private
 */
const getRecommendedProducts = async (req, res) => {
  try {
    let userInterest = '';
    if (req.user && (req.user.id || req.user._id)) {
      const user = await User.findById(req.user.id || req.user._id);
      if (user && user.interest) userInterest = user.interest;
    }

    let query = { isActive: true };
    if (userInterest) {
      query.$or = [
        { category: new RegExp(userInterest, 'i') },
        { productName: new RegExp(userInterest, 'i') },
        { isRecommended: true }
      ];
    } else {
      query.isRecommended = true;
    }

    let recommendedProducts = await Product.find(query)
      .populate('seller', 'fullName profilePicture email')
      .limit(6);

    if (recommendedProducts.length === 0) {
      recommendedProducts = await Product.find({ isActive: true })
        .sort({ rating: -1 })
        .populate('seller', 'fullName profilePicture email')
        .limit(4);
    }

    return res.status(200).json({
      success: true,
      products: recommendedProducts.map(mapProduct),
      note: 'Recommended based on your learning interests.'
    });
  } catch (error) {
    console.error('❌ Error fetching recommended products:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching recommended products' });
  }
};

module.exports = {
  createProduct,
  getProducts,
  searchProducts,
  getMyProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  toggleAvailability,
  getFeaturedProducts,
  getRecommendedProducts
};
