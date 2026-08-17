const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middleware/authMiddleware');
const {
  addReview,
  getProductReviews
} = require('../controllers/reviewController');

router
  .route('/')
  .get(getProductReviews)
  .post(protect, addReview);

module.exports = router;
