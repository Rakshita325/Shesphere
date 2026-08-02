const express = require('express');
const router = express.Router();
const { signup, login, updateProfile,getProfile} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/auth/signup
// @desc    Register user
// @access  Public
router.post('/signup', signup);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', login);

// @route   PUT /api/auth/profile
// @desc    Update user profile & interest
// @access  Private
router.put('/profile', protect, updateProfile);
router.get("/profile", protect, getProfile);

module.exports = router;
