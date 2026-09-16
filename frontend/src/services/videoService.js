import api from './api';

export const videoService = {
  // Fetch recommended videos (matching user interest)
  getRecommendedVideos: async () => {
    const res = await api.get('/videos/recommendations');
    return res.data;
  },

  // Fetch continue learning videos (partially watched + content-based recommendations)
  getContinueLearning: async () => {
    const res = await api.get('/videos/continue-learning');
    return res.data;
  },

  // Fetch single video details by videoId
  getVideoById: async (videoId) => {
    const res = await api.get(`/videos/${videoId}`);
    return res.data;
  },

  // Update watch progress
  updateProgress: async (videoId, watchedSeconds, duration) => {
    const res = await api.post(`/videos/${videoId}/progress`, {
      watchedSeconds,
      duration
    });
    return res.data;
  },

  // Toggle video like
  toggleLike: async (videoId) => {
    const res = await api.post(`/videos/${videoId}/like`);
    return res.data;
  },

  // Get video comments
  getComments: async (videoId) => {
    const res = await api.get(`/videos/${videoId}/comments`);
    return res.data;
  },

  // Add video comment
  addComment: async (videoId, content) => {
    const res = await api.post(`/videos/${videoId}/comments`, { content });
    return res.data;
  }
};

export default videoService;
