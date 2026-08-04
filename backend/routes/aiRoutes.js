/**
 * aiRoutes.js
 *
 * Routes for the SheSphere AI assistant.
 *
 * All routes are protected — the user must be authenticated with a valid JWT.
 * The protect middleware attaches req.user before the controller runs.
 */

const express = require('express');
const router  = express.Router();

const { protect } = require('../middleware/authMiddleware');
const { chat }    = require('../controllers/aiController');

/**
 * @route   POST /api/ai/chat
 * @desc    Send a message to SheSphere AI and receive a contextual reply
 * @access  Private (JWT required)
 * @body    { message: string }
 */
router.post('/chat', protect, chat);

module.exports = router;
