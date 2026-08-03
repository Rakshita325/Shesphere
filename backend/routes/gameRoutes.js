const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getGames,
  getProgress,
  saveProgress,
  getHighScores,
} = require('../controllers/gameController');

const router = express.Router();

// All routes are protected with JWT auth middleware
router.use(protect);

router.get('/', getGames);
router.get('/progress', getProgress);
router.post('/progress', saveProgress);
router.get('/highscores', getHighScores);

module.exports = router;
