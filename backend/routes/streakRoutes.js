const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getStreak, getBadges } = require('../controllers/streakController');

const router = express.Router();

// All routes are protected with JWT auth middleware
router.use(protect);

router.get('/', getStreak);
router.get('/badges', getBadges);

module.exports = router;
