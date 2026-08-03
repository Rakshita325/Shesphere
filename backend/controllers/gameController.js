const GameProgress = require('../models/GameProgress');
const asyncHandler = require('express-async-handler');
const { awardActivity, getFormattedDate } = require('../utils/updateStreak');

// Static game definitions
const GAME_DEFINITIONS = [
  {
    id: 'memory_match',
    name: 'Memory Match',
    icon: '🧠',
    description: 'Flip cards and find matching pairs before time runs out!',
    difficulty: 'Easy–Hard',
  },
  {
    id: 'wordle',
    name: 'Wordle',
    icon: '🔤',
    description: 'Guess the hidden 5-letter word in 6 tries or fewer.',
    difficulty: 'Medium',
  },
  {
    id: 'sudoku',
    name: 'Sudoku',
    icon: '🔢',
    description: 'Fill the 9×9 grid so every row, column and box has 1–9.',
    difficulty: 'Easy–Hard',
  },
  {
    id: '2048',
    name: '2048',
    icon: '🎯',
    description: 'Slide and merge tiles to reach the 2048 tile!',
    difficulty: 'Medium',
  },
  {
    id: 'flip_learn',
    name: 'Flip & Learn',
    icon: '📚',
    description: 'Flashcards based on your interests — flip to learn!',
    difficulty: 'Easy',
  },
];

// @desc    Get list of available games
// @route   GET /api/games
// @access  Private
const getGames = asyncHandler(async (req, res) => {
  res.json({ success: true, games: GAME_DEFINITIONS });
});

// @desc    Get game progress for logged-in user
// @route   GET /api/games/progress
// @access  Private
const getProgress = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const today = getFormattedDate();

  const progressDocs = await GameProgress.find({ userId });

  // Build a map with auto-reset logic for completedToday
  const progressMap = {};
  for (const doc of progressDocs) {
    progressMap[doc.gameId] = {
      gameId: doc.gameId,
      completedToday: doc.lastPlayedDate === today ? doc.completedToday : false,
      lastPlayedDate: doc.lastPlayedDate,
      highScore: doc.highScore,
      totalGamesPlayed: doc.totalGamesPlayed,
      lastScore: doc.lastScore,
    };
  }

  res.json({ success: true, progress: progressMap });
});

// @desc    Save game completion / progress
// @route   POST /api/games/progress
// @access  Private
const saveProgress = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { gameId, score } = req.body;

  if (!gameId) {
    return res.status(400).json({ success: false, message: 'gameId is required' });
  }

  const validIds = GAME_DEFINITIONS.map((g) => g.id);
  if (!validIds.includes(gameId)) {
    return res.status(400).json({ success: false, message: 'Invalid gameId' });
  }

  const today = getFormattedDate();
  const numericScore = Number(score) || 0;

  // Find or create progress doc
  let progress = await GameProgress.findOne({ userId, gameId });

  if (!progress) {
    progress = new GameProgress({ userId, gameId });
  }

  // Check if already played today
  if (progress.lastPlayedDate === today && progress.completedToday) {
    return res.json({
      success: true,
      alreadyPlayed: true,
      message: "You've already played today's game. Come back tomorrow!",
      progress: {
        gameId: progress.gameId,
        completedToday: true,
        lastPlayedDate: progress.lastPlayedDate,
        highScore: progress.highScore,
        totalGamesPlayed: progress.totalGamesPlayed,
        lastScore: progress.lastScore,
      },
    });
  }

  // Update progress
  progress.completedToday = true;
  progress.lastPlayedDate = today;
  progress.lastScore = numericScore;
  progress.totalGamesPlayed = (progress.totalGamesPlayed || 0) + 1;

  if (numericScore > (progress.highScore || 0)) {
    progress.highScore = numericScore;
  }

  await progress.save();

  // Award streak activity (only increments once per day across all activities)
  try {
    await awardActivity(userId);
  } catch (err) {
    console.error('Streak update error:', err.message);
  }

  res.json({
    success: true,
    alreadyPlayed: false,
    progress: {
      gameId: progress.gameId,
      completedToday: progress.completedToday,
      lastPlayedDate: progress.lastPlayedDate,
      highScore: progress.highScore,
      totalGamesPlayed: progress.totalGamesPlayed,
      lastScore: progress.lastScore,
    },
  });
});

// @desc    Get high scores for all games for the logged-in user
// @route   GET /api/games/highscores
// @access  Private
const getHighScores = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const progressDocs = await GameProgress.find({ userId }).select('gameId highScore totalGamesPlayed');

  const highScores = {};
  for (const doc of progressDocs) {
    highScores[doc.gameId] = {
      highScore: doc.highScore,
      totalGamesPlayed: doc.totalGamesPlayed,
    };
  }

  res.json({ success: true, highScores });
});

module.exports = {
  getGames,
  getProgress,
  saveProgress,
  getHighScores,
};
