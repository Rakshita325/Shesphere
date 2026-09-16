const express = require('express');
const router = express.Router();
const {
  getRecommendedVideos,
  getVideoById,
  updateWatchProgress,
  getContinueLearning,
  toggleVideoLike,
  getVideoComments,
  addVideoComment
} = require('../controllers/videoController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

// Existing routes for recommendations
router.get('/recommendations', protect, getRecommendedVideos);

// Continue learning route
router.get('/continue-learning', protect, getContinueLearning);

// Single Video routes
router.get('/:videoId', protect, getVideoById);
router.post('/:videoId/progress', protect, updateWatchProgress);
router.post('/:videoId/like', protect, toggleVideoLike);
router.get('/:videoId/comments', optionalAuth, getVideoComments);
router.post('/:videoId/comments', protect, addVideoComment);

// Base route compatibility
router.get('/', protect, getRecommendedVideos);

module.exports = router;
