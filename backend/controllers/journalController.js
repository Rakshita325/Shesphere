const Journal = require('../models/Journal');
const asyncHandler = require('express-async-handler');
const { awardActivity } = require('../utils/updateStreak');
const User = require('../models/User');

// @desc    Create or update a journal entry for a user on a specific date
// @route   POST /api/journal
// @access  Private (requires JWT)
const upsertJournal = asyncHandler(async (req, res) => {
  const userId = req.user.id; // set by auth middleware
  const { date, mood, content } = req.body;
  if (!date || !mood) {
    return res.status(400).json({ success: false, message: 'Date and mood are required' });
  }

  // Check if a journal entry already exists for this date
  const existing = await Journal.findOne({ userId, date });
  if (existing) {
    // Update existing entry without affecting streak
    if (mood) existing.mood = mood;
    if (content) existing.content = content;
    await existing.save();
    return res.json({ success: true, data: existing });
  }

  // Create a new journal entry
  const journal = await Journal.create({ userId, date, mood, content });

  // Handle streak and active dates
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  console.log("Journal Date:", date);
  console.log("Today's Date:", todayStr);
  if (date === todayStr) {
    // Award streak activity and active date for today
    await awardActivity(userId);
  } else {
    // For non‑today dates, just record the date as completed without affecting streak
    const user = await User.findById(userId);
    if (user && !user.activeDates.includes(date)) {
      user.activeDates.push(date);
      user.totalActiveDays = (user.totalActiveDays || 0) + 1;
      await user.save();
    }
  }

  res.json({ success: true, data: journal });
});

// @desc    Update an existing journal entry
// @route   PUT /api/journal/:id
// @access  Private
const updateJournal = asyncHandler(async (req, res) => {
  const { mood, content } = req.body;
  const journal = await Journal.findOne({ _id: req.params.id, userId: req.user.id });
  if (!journal) {
    return res.status(404).json({ success: false, message: 'Journal not found' });
  }
  if (mood) journal.mood = mood;
  if (content) journal.content = content;
  await journal.save();
  // No streak update on edit of existing entry
  res.json({ success: true, data: journal });
});

// @desc    Get all journal summaries for logged in user
// @route   GET /api/journal
// @access  Private
const getJournalSummaries = asyncHandler(async (req, res) => {
  const journals = await Journal.find({ userId: req.user.id })
    .select('_id date mood content')
    .sort({ date: -1 });

  res.json({
    success: true,
    data: journals,
  });
});

// @desc    Get a single journal entry
// @route   GET /api/journal/:id
// @access  Private
const getJournalById = asyncHandler(async (req, res) => {
  const journal = await Journal.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!journal) {
    return res.status(404).json({
      success: false,
      message: 'Journal not found',
    });
  }

  res.json({
    success: true,
    data: journal,
  });
});

module.exports = {
  upsertJournal,
  updateJournal,
  getJournalSummaries,
  getJournalById,
};