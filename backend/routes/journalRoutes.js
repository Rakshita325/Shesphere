// journalRoutes.js - defines routes for journal CRUD operations
const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  upsertJournal,
  getJournalSummaries,
  getJournalById,
  updateJournal,
} = require('../controllers/journalController');

const router = express.Router();

// All routes are protected
router.use(protect);

// Create or update journal for a date (POST)
router.post('/', upsertJournal);

// Get list of journal dates and moods (summary)
router.get('/', getJournalSummaries);

// Get single journal entry by ID
router.get('/:id', getJournalById);

// Update journal entry by ID (PUT)
router.put('/:id', updateJournal);

module.exports = router;
