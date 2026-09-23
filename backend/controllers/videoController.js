const Video = require('../models/Video');
const User = require('../models/User');
const WatchHistory = require('../models/WatchHistory');
const VideoLike = require('../models/VideoLike');
const VideoComment = require('../models/VideoComment');
const { calculateTimeCompatibilityScore, parseFreeTimeToSeconds } = require('../services/ml/timeAwareService');
const { getHybridRecommendations } = require('../services/ml/hybridRecommendationService');

// Mapping interest IDs and labels to Video collection categories
const INTEREST_TO_CATEGORY_MAP = {
  'cooking': 'Cooking',
  'Cooking': 'Cooking',
  'arts_crafts': 'Arts & Crafts',
  'art_craft': 'Arts & Crafts',
  'Arts & Crafts': 'Arts & Crafts',
  'Art & Craft': 'Arts & Crafts',
  'gardening': 'Gardening',
  'Gardening': 'Gardening',
  'sewing_fashion': 'Sewing & Fashion',
  'Sewing & Fashion': 'Sewing & Fashion',
  'digital_skills': 'Digital Skills',
  'digital_design': 'Digital Skills',
  'Digital Skills': 'Digital Skills',
  'Digital Design': 'Digital Skills',
  'health_fitness': 'Health & Fitness',
  'Health & Fitness': 'Health & Fitness',
  'music_instruments': 'Music & Instruments',
  'Music & Instruments': 'Music & Instruments',
  'skincare': 'Skincare',
  'skin_care': 'Skincare',
  'Skincare': 'Skincare',
  'Skin Care': 'Skincare'
};

/**
 * @desc    Get personalized video recommendations based strictly on user's selected interest
 * @route   GET /api/videos/recommendations (or GET /api/videos)
 * @access  Private (JWT Required)
 */
const getRecommendedVideos = async (req, res) => {
  try {
    const userId = req.user.id;
    const recommendationPayload = await getHybridRecommendations(userId, 20);

    return res.status(200).json(recommendationPayload);
  } catch (error) {
    console.error('❌ Error fetching recommended videos:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching personalized recommendations'
    });
  }
};

/**
 * @desc    Get single video by ID
 * @route   GET /api/videos/:videoId
 * @access  Private
 */
const getVideoById = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user.id;

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    const watchHistory = await WatchHistory.findOne({ userId, videoId });
    const existingLike = await VideoLike.findOne({ user: userId, video: videoId });
    const likesCount = await VideoLike.countDocuments({ video: videoId });
    const commentsCount = await VideoComment.countDocuments({ video: videoId });

    return res.status(200).json({
      success: true,
      data: {
        ...video.toObject(),
        watchedSeconds: watchHistory ? watchHistory.watchedSeconds : 0,
        progressPercentage: watchHistory ? watchHistory.progressPercentage : 0,
        completed: watchHistory ? watchHistory.completed : false,
        isLiked: !!existingLike,
        likesCount,
        commentsCount
      }
    });
  } catch (error) {
    console.error('❌ Error fetching video:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching video'
    });
  }
};

/**
 * @desc    Update watch progress for a video
 * @route   POST /api/videos/:videoId/progress
 * @access  Private
 */
const updateWatchProgress = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user.id;
    const { watchedSeconds, duration } = req.body;

    if (watchedSeconds === undefined || duration === undefined) {
      return res.status(400).json({
        success: false,
        message: 'watchedSeconds and duration are required'
      });
    }

    const progressPercentage = duration > 0
      ? Math.min(100, Math.round((watchedSeconds / duration) * 100))
      : 0;

    const completed = progressPercentage >= 95;

    const watchHistory = await WatchHistory.findOneAndUpdate(
      { userId, videoId },
      {
        $set: {
          watchedSeconds: Math.round(watchedSeconds),
          progressPercentage,
          completed,
          watchedAt: new Date()
        }
      },
      { upsert: true, new: true }
    );

    if (duration > 0) {
      await Video.findByIdAndUpdate(videoId, {
        $max: { duration: Math.round(duration) }
      });
    }

    if (completed) {
      await User.findByIdAndUpdate(userId, {
        $inc: { videosWatched: 1, xp: 15, learningTimeMinutes: Math.round(duration / 60) }
      });
    }

    return res.status(200).json({
      success: true,
      data: watchHistory
    });
  } catch (error) {
    console.error('❌ Error updating watch progress:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating watch progress'
    });
  }
};

/**
 * Content-based similarity score calculation
 */
const calculateSimilarityScore = (watchedMeta, candidate) => {
  let score = 0;

  if (watchedMeta.categories.has(candidate.category)) {
    score += 40;
  }

  if (candidate.subcategory && watchedMeta.subcategories.has(candidate.subcategory)) {
    score += 30;
  }

  if (candidate.tags && candidate.tags.length > 0) {
    for (const tag of candidate.tags) {
      if (watchedMeta.tags.has(tag.toLowerCase())) {
        score += 10;
      }
    }
  }

  return score;
};

/**
 * @desc    Get Continue Learning list (strictly filtered by user's selected interest)
 * @route   GET /api/videos/continue-learning
 * @access  Private
 */
const getContinueLearning = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userInterest = user.interest;
    let targetCategory = null;

    if (userInterest) {
      targetCategory = INTEREST_TO_CATEGORY_MAP[userInterest] || userInterest;
    }

    // 1. Get all watch history for this user
    const allHistory = await WatchHistory.find({ userId }).populate('videoId');

    // 2. Separate partially watched vs completed strictly within targetCategory
    const partiallyWatched = [];
    const completedVideoIds = new Set();
    const watchedVideoIds = new Set();

    for (const entry of allHistory) {
      if (!entry.videoId) continue;
      watchedVideoIds.add(entry.videoId._id.toString());

      if (entry.completed) {
        completedVideoIds.add(entry.videoId._id.toString());
      } else if (entry.progressPercentage > 0 && entry.progressPercentage < 95) {
        // Strict interest filter on partially watched videos
        if (!targetCategory || entry.videoId.category === targetCategory) {
          partiallyWatched.push({
            ...entry.videoId.toObject(),
            watchedSeconds: entry.watchedSeconds,
            progressPercentage: entry.progressPercentage,
            completed: false,
            type: 'continue'
          });
        }
      }
    }

    // Sort partially watched by most recently watched
    partiallyWatched.sort((a, b) => {
      const aEntry = allHistory.find(h => h.videoId && h.videoId._id.toString() === a._id.toString());
      const bEntry = allHistory.find(h => h.videoId && h.videoId._id.toString() === b._id.toString());
      return new Date(bEntry?.watchedAt || 0) - new Date(aEntry?.watchedAt || 0);
    });

    // 3. Candidate query strictly within targetCategory
    const excludeIds = Array.from(watchedVideoIds).concat(Array.from(completedVideoIds));
    const candidateQuery = {
      _id: { $nin: excludeIds }
    };
    if (targetCategory) {
      candidateQuery.category = targetCategory;
    }

    let candidates = await Video.find(candidateQuery);

    // 4. Metadata profile
    const watchedMeta = {
      categories: new Set(targetCategory ? [targetCategory] : []),
      subcategories: new Set(),
      tags: new Set()
    };

    for (const entry of allHistory) {
      if (!entry.videoId) continue;
      const video = entry.videoId;
      if (video.subcategory) watchedMeta.subcategories.add(video.subcategory);
      if (video.tags) video.tags.forEach(t => watchedMeta.tags.add(t.toLowerCase()));
    }

    // 5. Score candidates
    const scoredCandidates = candidates.map(video => ({
      ...video.toObject(),
      progressPercentage: 0,
      completed: false,
      type: 'recommended',
      _score: calculateSimilarityScore(watchedMeta, video)
    }));

    scoredCandidates.sort((a, b) => b._score - a._score);

    // 6. Combine: Partially watched in interest + Content-based recommendations in interest
    const resultIds = new Set(partiallyWatched.map(v => v._id.toString()));
    const dedupedRecommendations = scoredCandidates.filter(
      v => !resultIds.has(v._id.toString())
    );

    const combined = [...partiallyWatched, ...dedupedRecommendations];
    const cleanResult = combined.map(({ _score, ...rest }) => rest);

    return res.status(200).json({
      success: true,
      userInterest: userInterest || 'None',
      matchedCategory: targetCategory || 'All',
      data: cleanResult
    });
  } catch (error) {
    console.error('❌ Error fetching continue learning:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching continue learning'
    });
  }
};

/**
 * @desc    Toggle like/unlike on a video
 * @route   POST /api/videos/:videoId/like
 * @access  Private
 */
const toggleVideoLike = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user.id;

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    const existingLike = await VideoLike.findOne({ user: userId, video: videoId });
    let isLiked = false;

    if (existingLike) {
      await VideoLike.findOneAndDelete({ user: userId, video: videoId });
      video.likes = Math.max(0, video.likes - 1);
      await video.save();
    } else {
      await VideoLike.create({ user: userId, video: videoId });
      video.likes += 1;
      await video.save();
      isLiked = true;
    }

    const likesCount = await VideoLike.countDocuments({ video: videoId });

    return res.status(200).json({
      success: true,
      data: {
        videoId: video._id,
        likesCount,
        isLiked
      }
    });
  } catch (error) {
    console.error('❌ Error toggling video like:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while liking video'
    });
  }
};

/**
 * @desc    Get comments for a video
 * @route   GET /api/videos/:videoId/comments
 * @access  Public / Private
 */
const getVideoComments = async (req, res) => {
  try {
    const { videoId } = req.params;

    const comments = await VideoComment.find({ video: videoId })
      .populate('user', 'fullName profilePicture email')
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (error) {
    console.error('❌ Error fetching video comments:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching video comments'
    });
  }
};

/**
 * @desc    Add a comment to a video
 * @route   POST /api/videos/:videoId/comments
 * @access  Private
 */
const addVideoComment = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user.id;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment content cannot be empty'
      });
    }

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }

    const comment = await VideoComment.create({
      user: userId,
      video: videoId,
      content: content.trim()
    });

    await comment.populate('user', 'fullName profilePicture email');

    return res.status(201).json({
      success: true,
      message: 'Comment added',
      data: comment
    });
  } catch (error) {
    console.error('❌ Error adding video comment:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while adding video comment'
    });
  }
};

module.exports = {
  getRecommendedVideos,
  getVideoById,
  updateWatchProgress,
  getContinueLearning,
  toggleVideoLike,
  getVideoComments,
  addVideoComment
};
