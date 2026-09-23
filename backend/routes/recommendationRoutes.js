/**
 * recommendationRoutes.js
 * 
 * Express routes for Hybrid Recommendations, K-Means Clustering, and Similar Learner discovery.
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getRecommendations,
  triggerKMeansTraining,
  getSimilarLearners
} = require('../controllers/recommendationController');

// Hybrid Recommendations
router.get('/videos', protect, getRecommendations);

// K-Means Clustering Operations
router.post('/kmeans/train', protect, triggerKMeansTraining);
router.get('/kmeans/neighbors', protect, getSimilarLearners);

module.exports = router;
