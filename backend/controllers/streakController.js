const User = require('../models/User');
const asyncHandler = require('express-async-handler');
const { BADGE_MILESTONES, getFormattedDate, getYesterdayDate } = require('../utils/updateStreak');

// @desc    Get user's streak statistics and milestone progress
// @route   GET /api/streak
// @access  Private (requires JWT)
const getStreak = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const today = getFormattedDate();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  // If last active date was neither today nor yesterday, streak is zeroed out for display
  let currentStreak = user.streak || 0;
  if (user.lastActiveDate && user.lastActiveDate !== today && user.lastActiveDate !== yesterdayStr) {
    currentStreak = 0;
  }

  const longestStreak = user.longestStreak || 0;
  const totalActiveDays = user.totalActiveDays || 0;

  // Find next milestone badge
  const nextMilestone = BADGE_MILESTONES.find((m) => m.days > currentStreak) || BADGE_MILESTONES[BADGE_MILESTONES.length - 1];
  const daysRemaining = Math.max(0, nextMilestone.days - currentStreak);

  res.json({
    success: true,
    currentStreak,
    longestStreak,
    totalActiveDays,
    lastActiveDate: user.lastActiveDate || '',
    nextMilestone,
    daysRemaining,
    badges: user.badges || [],
    activeDates: user.activeDates || [],
  });
});

// @desc    Get all badges (unlocked & total milestone badges)
// @route   GET /api/badges
// @access  Private (requires JWT)
const getBadges = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  const unlockedBadges = user.badges || [];
  const unlockedNames = new Set(unlockedBadges.map((b) => b.name));

  const allBadges = BADGE_MILESTONES.map((m) => {
    const earned = unlockedBadges.find((b) => b.name === m.name);
    return {
      name: m.name,
      icon: m.icon,
      description: m.description,
      requiredDays: m.days,
      isUnlocked: unlockedNames.has(m.name),
      earnedAt: earned ? earned.earnedAt : null,
    };
  });

  res.json({
    success: true,
    unlockedBadges,
    allBadges,
  });
});

module.exports = {
  getStreak,
  getBadges,
};
