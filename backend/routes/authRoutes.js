const express = require('express');
const router = express.Router();
const { signup, login, uploadAvatar, updateProfile, getProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

// @route   POST /api/auth/signup
// @desc    Register user
// @access  Public
router.post('/signup', signup);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', login);

// @route   POST /api/auth/upload-avatar
// @desc    Upload profile photo / avatar
// @access  Private
router.post('/upload-avatar', protect, upload.single('profilePicture'), uploadAvatar);

// @route   PUT /api/auth/profile
// @desc    Update user profile & interest
// @access  Private
router.put('/profile', protect, updateProfile);
router.get("/profile", protect, getProfile);

// @route   PUT /api/auth/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', protect, changePassword);

module.exports = router;
