const User = require('../models/User');
const Journal = require('../models/Journal');
const GameProgress = require('../models/GameProgress');
const asyncHandler = require('express-async-handler');
const { getFormattedDate, getYesterdayDate } = require('../utils/updateStreak');

/**
 * @desc    Get complete profile statistics & dynamic achievements for logged in user
 * @route   GET /api/profile/stats
 * @access  Private (JWT Protect Required)
 */
const getProfileStats = asyncHandler(async (req, res) => {
  const userId = req.user.id || req.user._id;

  const user = await User.findById(userId).select('-password');
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // 1. Journal Entries count from Journal collection
  const journalEntries = await Journal.countDocuments({ userId });

  // 2. Games Completed count from GameProgress collection
  const gameProgressDocs = await GameProgress.find({ userId });
  let gamesCompleted = 0;
  for (const doc of gameProgressDocs) {
    gamesCompleted += (doc.totalGamesPlayed || (doc.completedToday ? 1 : 0));
  }

  // 3. Videos Watched & Community Discussions from User schema
  const videosWatched = user.videosWatched || 0;
  const communityDiscussions = user.communityDiscussions || 0;

  // 4. Calculate current streak based on last active date
  const today = getFormattedDate();
  const yesterday = getYesterdayDate();
  let currentStreak = user.streak || 0;
  if (user.lastActiveDate && user.lastActiveDate !== today && user.lastActiveDate !== yesterday) {
    currentStreak = 0;
  }

  // 5. Total Learning Time calculation (in hours)
  const activityMinutes =
    (videosWatched * 15) +
    (gamesCompleted * 10) +
    (journalEntries * 10) +
    (communityDiscussions * 5) +
    (user.learningTimeMinutes || 0);

  const learningTime = Math.round((activityMinutes / 60) * 10) / 10;

  // 6. Dynamic Achievement Evaluation
  const totalActivities = videosWatched + journalEntries + gamesCompleted + communityDiscussions;

  const achievements = [
    {
      id: 'beginner',
      name: 'Beginner',
      description: 'Complete 1 activity',
      unlocked: totalActivities >= 1,
      progressText: totalActivities >= 1 ? 'Unlocked' : `${totalActivities} / 1 activity`,
      current: Math.min(totalActivities, 1),
      target: 1,
    },
    {
      id: 'learner',
      name: 'Learner',
      description: 'Complete 5 learning activities',
      unlocked: totalActivities >= 5,
      progressText: totalActivities >= 5 ? 'Unlocked' : `${totalActivities} / 5 activities`,
      current: Math.min(totalActivities, 5),
      target: 5,
    },
    {
      id: 'expert',
      name: 'Expert',
      description: 'Complete 10+ learning activities',
      unlocked: totalActivities >= 10,
      progressText: totalActivities >= 10 ? 'Unlocked' : `${totalActivities} / 10 activities`,
      current: Math.min(totalActivities, 10),
      target: 10,
    },
    {
      id: 'consistent',
      name: 'Consistent',
      description: 'Maintain a 7-day streak',
      unlocked: currentStreak >= 7,
      progressText: currentStreak >= 7 ? 'Unlocked' : `${currentStreak} / 7 days`,
      current: Math.min(currentStreak, 7),
      target: 7,
    },
  ];

  return res.status(200).json({
    success: true,
    videosWatched,
    journalEntries,
    gamesCompleted,
    communityDiscussions,
    currentStreak,
    learningTime,
    learningTimeUnit: 'hrs',
    achievements,
  });
});

module.exports = {
  getProfileStats,
};
