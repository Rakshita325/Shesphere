/**
 * recommendationController.js
 * 
 * Controllers for Hybrid Recommendations, K-Means Training, and Similar Learner discovery.
 */

const { getHybridRecommendations } = require('../services/ml/hybridRecommendationService');
const { trainAndClusterUsers, getClusterNeighbors } = require('../services/ml/kmeansService');

/**
 * @desc    Get hybrid personalized video recommendations
 * @route   GET /api/recommendations/videos
 * @access  Private
 */
const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = Number(req.query.limit) || 20;

    const payload = await getHybridRecommendations(userId, limit);
    return res.status(200).json(payload);
  } catch (error) {
    console.error('❌ Error getting hybrid recommendations:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching hybrid recommendations'
    });
  }
};

/**
 * @desc    Trigger K-Means training and cluster assignment across active users
 * @route   POST /api/recommendations/kmeans/train
 * @access  Private
 */
const triggerKMeansTraining = async (req, res) => {
  try {
    const result = await trainAndClusterUsers();
    return res.status(200).json(result);
  } catch (error) {
    console.error('❌ Error triggering K-Means training:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error training K-Means clustering model'
    });
  }
};

/**
 * @desc    Get similar learners based on K-Means cluster assignment
 * @route   GET /api/recommendations/kmeans/neighbors
 * @access  Private
 */
const getSimilarLearners = async (req, res) => {
  try {
    const userId = req.user.id;
    const neighbors = await getClusterNeighbors(userId);

    return res.status(200).json({
      success: true,
      count: neighbors.length,
      data: neighbors
    });
  } catch (error) {
    console.error('❌ Error fetching cluster neighbors:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching similar learners'
    });
  }
};

module.exports = {
  getRecommendations,
  triggerKMeansTraining,
  getSimilarLearners
};
