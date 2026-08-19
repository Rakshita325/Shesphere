const express = require('express');
const router = express.Router();
const { getProfileStats } = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

// @route   GET /api/profile/stats
// @desc    Get user's profile statistics & achievements
// @access  Private (JWT Protected)
router.get('/stats', protect, getProfileStats);

module.exports = router;
