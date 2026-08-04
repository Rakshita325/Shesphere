/**
 * buildPrompt.js
 *
 * Constructs the full contextual prompt sent to Gemini.
 *
 * Strategy:
 *  - Always inject the user's profile as system context
 *  - Never send the raw user message alone
 *  - Keep the persona consistent: SheSphere AI — a learning mentor for homemakers
 *
 * This file contains all prompt engineering logic.
 * To change the AI persona or add new context fields, edit ONLY this file.
 */

/**
 * Build a rich, contextual prompt for Gemini from user profile + question.
 *
 * @param {Object} user       - Mongoose User document (from MongoDB)
 * @param {string} userMessage - Sanitized user question
 * @returns {string} - The complete prompt string
 */
const buildPrompt = (user, userMessage) => {
  // ── Format badge list ─────────────────────────────────────────────────────
  const badgeNames =
    user.badges && user.badges.length > 0
      ? user.badges.map((b) => `${b.icon || '🏅'} ${b.name}`).join(', ')
      : 'No badges earned yet';

  // ── Format completed videos from XP-based approximation ──────────────────
  // (Video completion tracking stored in XP; exact count can be extended later)
  const xpLevel = user.xp || 0;
  const level   = user.level || 1;
  const streak  = user.streak || 0;

  // ── Format selected interest(s) ───────────────────────────────────────────
  const interests = user.interest
    ? user.interest
    : 'Not selected yet';

  // ── Format daily free time ────────────────────────────────────────────────
  const freeTime = user.dailyFreeTime
    ? `${user.dailyFreeTime} minutes`
    : 'Not specified';

  // ── Assemble prompt ───────────────────────────────────────────────────────
  const prompt = `
You are SheSphere AI — an intelligent, empathetic learning mentor designed specifically to help homemakers learn valuable skills, improve themselves, and earn a sustainable income from home.

Your personality:
- Warm, encouraging, and motivating
- Practical and action-oriented
- Speak simply and clearly — your users may not be tech-savvy
- Always personalise your response using the user's profile data below
- Keep responses concise but helpful (avoid very long walls of text)
- Use bullet points or numbered lists where appropriate
- End with a motivating thought or next step when relevant

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CURRENT USER PROFILE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Name           : ${user.fullName || 'SheSphere User'}
Education      : ${user.education || 'Not specified'}
Occupation     : ${user.occupation || 'Not specified'}
Age            : ${user.age || 'Not specified'}
Language       : ${user.language || 'English'}

Learning Profile:
  Level        : ${level}
  XP Points    : ${xpLevel}
  Current Streak: ${streak} day${streak !== 1 ? 's' : ''}
  Daily Free Time: ${freeTime}
  Selected Interests: ${interests}
  Badges Earned: ${badgeNames}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
USER QUESTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${userMessage}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Respond naturally and provide personalised guidance based on this user's profile.
Do not repeat the profile back to the user. Just answer helpfully.
`.trim();

  return prompt;
};

module.exports = { buildPrompt };
