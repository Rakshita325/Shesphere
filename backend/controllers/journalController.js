const Journal = require('../models/Journal');
const asyncHandler = require('express-async-handler');

// @desc    Create or update a journal entry for a user on a specific date
// @route   POST /api/journal
// @access  Private (requires JWT)
const upsertJournal = asyncHandler(async (req, res) => {
  const userId = req.user.id; // set by auth middleware
  const { date, mood, content } = req.body;
  if (!date || !mood) {
    return res.status(400).json({ success: false, message: 'Date and mood are required' });
  }

  // Upsert based on userId + date
  const journal = await Journal.findOneAndUpdate(
    { userId, date },
    { mood, content },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  res.json({ success: true, data: journal });
});

// @desc    Get list of journal dates and moods for the logged‑in user
// @route   GET /api/journal
// @access  Private
const getJournalSummaries = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const journals = await Journal.find({ userId })
    .select('_id date mood')
    .sort({ date: -1 });
  res.json({ success: true, data: journals });
});

// @desc    Get a single journal entry by its ID
// @route   GET /api/journal/:id
// @access  Private
const getJournalById = asyncHandler(async (req, res) => {
  const journal = await Journal.findOne({ _id: req.params.id, userId: req.user.id });
  if (!journal) {
    return res.status(404).json({ success: false, message: 'Journal not found' });
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
  res.json({ success: true, data: journal });
});

module.exports = {
  upsertJournal,
  getJournalSummaries,
  getJournalById,
  updateJournal,
};
