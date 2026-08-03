const mongoose = require('mongoose');

const gameProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    gameId: {
      type: String,
      required: true,
      enum: ['memory_match', 'wordle', 'sudoku', '2048', 'flip_learn'],
    },
    completedToday: {
      type: Boolean,
      default: false,
    },
    lastPlayedDate: {
      type: String, // YYYY-MM-DD
      default: '',
    },
    highScore: {
      type: Number,
      default: 0,
    },
    totalGamesPlayed: {
      type: Number,
      default: 0,
    },
    lastScore: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// One progress record per user per game
gameProgressSchema.index({ userId: 1, gameId: 1 }, { unique: true });

module.exports = mongoose.model('GameProgress', gameProgressSchema);
