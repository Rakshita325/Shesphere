const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const {
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
} = require('../controllers/marketplaceController');

const { addReview, getProductReviews } = require('../controllers/reviewController');

// ── Special named routes BEFORE /:id ─────────────────────────────────────────
router.get('/products/search', optionalAuth, searchProducts); // optionalAuth: pass user context when available, allow guests
router.get('/products/featured', getFeaturedProducts);
router.get('/products/recommended', protect, getRecommendedProducts);
router.get('/products/my-products', protect, getMyProducts);

// ── Product CRUD ──────────────────────────────────────────────────────────────
router
  .route('/products')
  .get(optionalAuth, getProducts)      // optionalAuth: pass user context when available, allow guests
  .post(protect, upload.array('images', 5), createProduct);

router
  .route('/products/:id')
  .get(getProductById)
  .put(protect, upload.array('images', 5), updateProduct)
  .delete(protect, deleteProduct);

// ── Availability toggle ───────────────────────────────────────────────────────
router.patch('/products/:id/availability', protect, toggleAvailability);

// ── Review endpoints ──────────────────────────────────────────────────────────
router
  .route('/products/:id/reviews')
  .get(getProductReviews)
  .post(protect, addReview);

module.exports = router;
