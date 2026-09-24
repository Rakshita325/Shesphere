const User = require('../models/User');
const { createNotification } = require('../services/notificationService');

/**
 * All milestone badge definitions
 */
const BADGE_MILESTONES = [
  { days: 3, name: '3 Day Starter', icon: '🥉', description: 'Completed activities 3 days in a row!' },
  { days: 7, name: '7 Day Learner', icon: '🏅', description: 'Completed activities 7 days in a row!' },
  { days: 14, name: '14 Day Explorer', icon: '⭐', description: 'Completed activities 14 days in a row!' },
  { days: 30, name: '30 Day Champion', icon: '🥇', description: 'Completed activities 30 days in a row!' },
  { days: 50, name: '50 Day Master', icon: '💎', description: 'Completed activities 50 days in a row!' },
  { days: 100, name: '100 Day Legend', icon: '👑', description: 'Completed activities 100 days in a row!' },
  { days: 365, name: '365 Day Inspiration', icon: '🌟', description: 'Completed activities 365 days in a row!' },
];

/**
 * Get current date formatted as YYYY-MM-DD in local time
 */
const getFormattedDate = (dateObj = new Date()) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get yesterday's date formatted as YYYY-MM-DD in local time
 */
const getYesterdayDate = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getFormattedDate(yesterday);
};

/**
 * Core utility to update user streak upon activity completion.
 * Caps streak increment to once per calendar day.
 */
const updateUserStreak = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  console.log("Before:", {
    streak: user.streak,
    lastActiveDate: user.lastActiveDate
  });

  const today = getFormattedDate();
  const yesterday = getYesterdayDate();

  // If user already logged activity today, do not increment streak again
  if (user.lastActiveDate === today) {
    return {
      updated: false,
      streak: user.streak || 0,
      longestStreak: user.longestStreak || 0,
      totalActiveDays: user.totalActiveDays || 0,
      newBadges: [],
      user,
    };
  }

  // Calculate new streak count
  let newStreak = 1;
  if (user.lastActiveDate === yesterday) {
    newStreak = (user.streak || 0) + 1;
  }

  user.streak = newStreak;
  user.lastActiveDate = today;

  // Track active dates array for monthly/weekly calendar
  if (!Array.isArray(user.activeDates)) {
    user.activeDates = [];
  }
  if (!user.activeDates.includes(today)) {
    user.activeDates.push(today);
    user.totalActiveDays = (user.totalActiveDays || 0) + 1;
  }

  // Update longest streak
  if (newStreak > (user.longestStreak || 0)) {
    user.longestStreak = newStreak;
  }

  // Check for newly unlocked milestone badges
  const newBadges = [];
  if (!Array.isArray(user.badges)) {
    user.badges = [];
  }

  const existingBadgeNames = new Set(user.badges.map((b) => b.name));

  for (const milestone of BADGE_MILESTONES) {
    if (newStreak >= milestone.days && !existingBadgeNames.has(milestone.name)) {
      const badgeData = {
        name: milestone.name,
        icon: milestone.icon,
        description: milestone.description,
        earnedAt: new Date(),
      };
      user.badges.push(badgeData);
      newBadges.push(badgeData);

      // Trigger notification for newly earned badge
      await createNotification({
        userId: user._id,
        type: 'STREAK',
        title: `Streak Badge Unlocked ${milestone.icon}`,
        message: `Congratulations! You unlocked the '${milestone.name}' badge for a ${milestone.days}-day streak!`,
        metadata: { badgeName: milestone.name }
      });
    }
  }

  await user.save();
  console.log("After:", {
    streak: user.streak,
    lastActiveDate: user.lastActiveDate
  });

  return {
    updated: true,
    streak: user.streak,
    longestStreak: user.longestStreak,
    totalActiveDays: user.totalActiveDays,
    newBadges,
    user,
  };
};

/**
 * Helper function for future modules (Quiz, Learning, Games)
 */
const awardActivity = async (userId) => {
  console.log('Award Activity Called');
  return await updateUserStreak(userId);
};

module.exports = {
  updateUserStreak,
  awardActivity,
  BADGE_MILESTONES,
  getFormattedDate,
  getYesterdayDate,
};
