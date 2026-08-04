/**
 * aiController.js
 *
 * Handles POST /api/ai/chat
 *
 * Architecture:
 *  1. Authenticate user (done by protect middleware before this runs)
 *  2. Validate + sanitize the incoming message
 *  3. Load full user profile from MongoDB
 *  4. HYBRID INTELLIGENCE: Check if the question can be answered from DB
 *     → If yes, return DB answer immediately (saves Gemini API quota)
 *     → If no, build contextual prompt + call Gemini
 *  5. Return the reply with a `source` field ('database' | 'gemini')
 *
 * Error handling covers:
 *  - Invalid API key
 *  - Rate limits
 *  - Network / timeout failures
 *  - User not found
 *  - Empty / missing message
 */

const User = require('../models/User');
const { buildPrompt } = require('../utils/buildPrompt');
const { callGemini } = require('../services/geminiService');

// ─── Hybrid Intelligence — keyword patterns answered from DB ─────────────────
// Each entry: { patterns: [regex], resolver: (user) => string }
const DB_RESOLVERS = [
  {
    patterns: [/\bmy\s+xp\b/i, /\bhow\s+much\s+xp\b/i, /\bxp\s+points\b/i, /\bmy\s+points\b/i],
    resolver: (user) =>
      `You currently have **${user.xp || 0} XP points** and are at **Level ${user.level || 1}**! 🌟 Keep learning to earn more XP and unlock new badges.`,
  },
  {
    patterns: [/\bmy\s+streak\b/i, /\bcurrent\s+streak\b/i, /\bhow\s+many\s+days\b/i, /\bstreak\b/i],
    resolver: (user) =>
      `Your current learning streak is **${user.streak || 0} day${user.streak !== 1 ? 's' : ''}**! 🔥 ${user.streak > 0
        ? "Amazing consistency — keep it up!"
        : "Start learning today to begin your streak!"
      }`,
  },
  {
    patterns: [/\bmy\s+level\b/i, /\bwhat\s+level\b/i, /\bmy\s+current\s+level\b/i],
    resolver: (user) =>
      `You are currently at **Level ${user.level || 1}** with **${user.xp || 0} XP**. ${user.level >= 5 ? "You're doing fantastic!" : "Keep completing videos and quizzes to level up! 🚀"
      }`,
  },
  {
    patterns: [/\bmy\s+profile\b/i, /\bmy\s+info\b/i, /\babout\s+me\b/i, /\bmy\s+details\b/i],
    resolver: (user) =>
      `Here's your SheSphere profile:\n\n` +
      `👤 **Name:** ${user.fullName || 'N/A'}\n` +
      `📧 **Email:** ${user.email || 'N/A'}\n` +
      `🎓 **Education:** ${user.education || 'Not set'}\n` +
      `💼 **Occupation:** ${user.occupation || 'Not set'}\n` +
      `🌟 **Interests:** ${user.interest || 'Not selected'}\n` +
      `⏰ **Daily Free Time:** ${user.dailyFreeTime ? user.dailyFreeTime + ' minutes' : 'Not set'}\n` +
      `⚡ **XP:** ${user.xp || 0} | **Level:** ${user.level || 1} | **Streak:** ${user.streak || 0} days`,
  },
  {
    patterns: [/\bmy\s+badges\b/i, /\bbadges\s+i\s+have\b/i, /\bearned\s+badges\b/i],
    resolver: (user) => {
      const badges = user.badges || [];
      if (badges.length === 0) {
        return `You haven't earned any badges yet. 🏅 Keep your streak going and completing lessons to earn your first badge!`;
      }
      const list = badges.map((b) => `${b.icon || '🏅'} **${b.name}** — ${b.description || ''}`).join('\n');
      return `You've earned **${badges.length} badge${badges.length !== 1 ? 's' : ''}** so far!\n\n${list}\n\nGreat work! 🎉`;
    },
  },
  {
    patterns: [/\bmy\s+name\b/i, /\bwhat\s+is\s+my\s+name\b/i],
    resolver: (user) => `Your name on SheSphere is **${user.fullName || 'User'}**. 😊`,
  },
  {
    patterns: [/\bmy\s+interest\b/i, /\bmy\s+interests\b/i, /\bwhat\s+i\s+selected\b/i],
    resolver: (user) =>
      user.interest
        ? `Your selected interest is **${user.interest}**. All your video and article recommendations are personalised around this! 🎯`
        : `You haven't selected an interest yet. Head to your profile to pick one and get personalised recommendations!`,
  },
];

/**
 * Detect if the message can be answered from the DB.
 * Returns the answer string, or null if Gemini should handle it.
 */
const tryLocalAnswer = (message, user) => {
  const lower = message.toLowerCase().trim();
  for (const { patterns, resolver } of DB_RESOLVERS) {
    if (patterns.some((regex) => regex.test(lower))) {
      return resolver(user);
    }
  }
  return null;
};

/**
 * @desc    SheSphere AI Chat
 * @route   POST /api/ai/chat
 * @access  Private (JWT required)
 */
const chat = async (req, res) => {
  try {
    // ── 1. Extract and sanitize message ──────────────────────────────────────
    const rawMessage = req.body.message;
    if (!rawMessage || typeof rawMessage !== 'string' || !rawMessage.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Message is required and must be a non-empty string.',
      });
    }

    // Sanitize: trim whitespace, limit to 1000 characters
    const userMessage = rawMessage.trim().slice(0, 1000);

    // ── 2. Load user profile from MongoDB ────────────────────────────────────
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // ── 3. Hybrid Intelligence: try answering from DB first ──────────────────
    const localAnswer = tryLocalAnswer(userMessage, user);
    if (localAnswer) {
      return res.status(200).json({
        success: true,
        reply: localAnswer,
        source: 'database', // indicates no Gemini call was made
      });
    }

    // ── 4. Build contextual prompt + call Gemini ─────────────────────────────
    const prompt = buildPrompt(user, userMessage);
    const geminiReply = await callGemini(prompt);

    return res.status(200).json({
      success: true,
      reply: geminiReply,
      source: 'gemini',
    });

  } catch (error) {
    console.error('❌ AI Chat Error:', error.message);

    // ── Friendly error responses ─────────────────────────────────────────────
    if (error.message === 'INVALID_API_KEY') {
      return res.status(503).json({
        success: false,
        message: '🔑 AI service configuration error. Please contact support.',
      });
    }

    if (error.message === 'RATE_LIMIT_EXCEEDED') {
      return res.status(429).json({
        success: false,
        message: '⏳ AI is currently busy. Please try again in a few moments.',
      });
    }

    if (error.message === 'REQUEST_TIMEOUT') {
      return res.status(504).json({
        success: false,
        message: '⌛ Request timed out. Please check your connection and try again.',
      });
    }

    if (error.message && error.message.startsWith('Gemini API key is not configured')) {
      return res.status(503).json({
        success: false,
        message: '🤖 AI assistant is not configured yet. Please add GEMINI_API_KEY to backend/.env',
      });
    }

    return res.status(500).json({
      success: false,
      message: '❌ Something went wrong with the AI assistant. Please try again later.',
    });
  }
};

module.exports = { chat };
