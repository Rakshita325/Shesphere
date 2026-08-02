const express = require('express');
const router = express.Router();
const { getRecommendedVideos } = require('../controllers/videoController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/videos/recommendations
// @desc    Fetch personalized videos matching user's selected interest in MongoDB
// @access  Private
router.get('/recommendations', protect, getRecommendedVideos);

// Also expose GET /api/videos with JWT protection for backward compatibility
router.get('/', protect, getRecommendedVideos);

module.exports = router;
