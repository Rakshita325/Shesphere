import api from './api';

/**
 * recommendationService.js
 *
 * Frontend API client for the Hybrid Recommendation, K-Means Clustering,
 * and Similar Learners endpoints.
 */
const recommendationService = {
  /**
   * Fetch hybrid ML-based personalized video recommendations.
   * Uses: Content-Based + Time-Aware + Collaborative Filtering + K-Means signal.
   * @param {number} limit - Max number of videos to return
   */
  getHybridRecommendations: async (limit = 20) => {
    const res = await api.get('/recommendations/videos', { params: { limit } });
    return res.data;
  },

  /**
   * Trigger K-Means training across all active users.
   * Assigns clusterId to each user in MongoDB.
   * Should be called periodically (e.g., after login if not clustered recently).
   */
  triggerKMeansTraining: async () => {
    const res = await api.post('/recommendations/kmeans/train');
    return res.data;
  },

  /**
   * Get similar learners from the same K-Means cluster as the current user.
   * Used for the "People with Similar Learning Interests" feature.
   */
  getClusterNeighbors: async () => {
    const res = await api.get('/recommendations/kmeans/neighbors');
    return res.data;
  }
};

export default recommendationService;
