const Review = require('../models/Review');
const Product = require('../models/Product');

/**
 * @desc    Add review to a product and update product rating average
 * @route   POST /api/marketplace/products/:id/reviews
 * @access  Private (Logged-in User)
 */
const addReview = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const productId = req.params.id;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Rating and comment are required'
      });
    }

    const numRating = Number(rating);
    if (numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user already reviewed this product
    let review = await Review.findOne({ user: userId, product: productId });

    if (review) {
      // Update existing review
      review.rating = numRating;
      review.comment = comment.trim();
      await review.save();
    } else {
      // Create new review
      review = new Review({
        user: userId,
        product: productId,
        rating: numRating,
        comment: comment.trim()
      });
      await review.save();
    }

    // Calculate new average rating for the product
    const allReviews = await Review.find({ product: productId });
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = Math.round((totalRating / allReviews.length) * 10) / 10;

    product.rating = avgRating;
    product.reviewsCount = allReviews.length;
    await product.save();

    const populatedReview = await Review.findById(review._id).populate(
      'user',
      'fullName profilePicture'
    );

    return res.status(201).json({
      success: true,
      message: 'Review added successfully',
      review: populatedReview,
      productRating: avgRating,
      reviewsCount: allReviews.length
    });
  } catch (error) {
    console.error('❌ Error adding review:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error adding review'
    });
  }
};

/**
 * @desc    Get all reviews for a product
 * @route   GET /api/marketplace/products/:id/reviews
 * @access  Public
 */
const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.id })
      .populate('user', 'fullName profilePicture')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: reviews.length,
      reviews
    });
  } catch (error) {
    console.error('❌ Error fetching reviews:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching reviews'
    });
  }
};

module.exports = {
  addReview,
  getProductReviews
};
