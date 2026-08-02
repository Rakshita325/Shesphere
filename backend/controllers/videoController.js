const Video = require('../models/Video');
const User = require('../models/User');

// Mapping interest IDs and labels to Video collection categories
const INTEREST_TO_CATEGORY_MAP = {
  'cooking': 'Cooking',
  'arts_crafts': 'Arts & Crafts',
  'gardening': 'Gardening',
  'sewing_fashion': 'Sewing & Fashion',
  'digital_skills': 'Digital Skills',
  'health_fitness': 'Health & Fitness',
  'music_instruments': 'Music & Instruments',
  'skincare': 'Skincare',
  'Cooking': 'Cooking',
  'Arts & Crafts': 'Arts & Crafts',
  'Gardening': 'Gardening',
  'Sewing & Fashion': 'Sewing & Fashion',
  'Digital Skills': 'Digital Skills',
  'Health & Fitness': 'Health & Fitness',
  'Music & Instruments': 'Music & Instruments',
  'Skincare': 'Skincare'
};

/**
 * @desc    Get personalized video recommendations based on logged-in user's selected interest
 * @route   GET /api/videos/recommendations (or GET /api/videos)
 * @access  Private (JWT Required)
 */
const getRecommendedVideos = async (req, res) => {
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

    // Build query based on user's interest from MongoDB
    const query = targetCategory ? { category: targetCategory } : {};

    let videos = await Video.find(query).limit(20);

    // Fallback: If no videos match exact interest category, return top available videos
    if (videos.length === 0 && targetCategory) {
      console.log(`ℹ️ No videos found for category "${targetCategory}". Falling back to default list.`);
      videos = await Video.find({}).limit(20);
    }

    return res.status(200).json({
      success: true,
      count: videos.length,
      userInterest: userInterest || 'None selected',
      matchedCategory: targetCategory || 'All',
      data: videos
    });
  } catch (error) {
    console.error('❌ Error fetching recommended videos:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching personalized recommendations'
    });
  }
};

module.exports = {
  getRecommendedVideos
};
