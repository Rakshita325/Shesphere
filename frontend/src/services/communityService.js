import api from './api';

export const communityService = {
  // Fetch all 8 interest communities + user join status & recommendation
  getCommunities: async () => {
    const res = await api.get('/communities');
    return res.data;
  },

  // Fetch single community details
  getCommunityDetails: async (communityId) => {
    const res = await api.get(`/communities/${communityId}`);
    return res.data;
  },

  // Join a community
  joinCommunity: async (communityId) => {
    const res = await api.post(`/communities/${communityId}/join`);
    return res.data;
  },

  // Leave a community
  leaveCommunity: async (communityId) => {
    const res = await api.post(`/communities/${communityId}/leave`);
    return res.data;
  },

  // Get posts for a specific community
  getCommunityPosts: async (communityId) => {
    const res = await api.get(`/communities/${communityId}/posts`);
    return res.data;
  },

  // Create post (supports media file or json payload)
  createPost: async (communityId, postData) => {
    let config = {};
    if (postData instanceof FormData) {
      config = {
        headers: { 'Content-Type': 'multipart/form-data' }
      };
    }
    const res = await api.post(`/communities/${communityId}/posts`, postData, config);
    return res.data;
  },

  // Update post (Owner only)
  updatePost: async (postId, postData) => {
    let config = {};
    if (postData instanceof FormData) {
      config = {
        headers: { 'Content-Type': 'multipart/form-data' }
      };
    }
    const res = await api.put(`/communities/posts/${postId}`, postData, config);
    return res.data;
  },

  // Delete post (Owner only)
  deletePost: async (postId) => {
    const res = await api.delete(`/communities/posts/${postId}`);
    return res.data;
  },

  // Toggle like/unlike on a post
  toggleLikePost: async (postId) => {
    const res = await api.post(`/communities/posts/${postId}/like`);
    return res.data;
  },

  // Get comments for a post
  getPostComments: async (postId) => {
    const res = await api.get(`/communities/posts/${postId}/comments`);
    return res.data;
  },

  // Add comment to a post
  addComment: async (postId, content) => {
    const res = await api.post(`/communities/posts/${postId}/comments`, { content });
    return res.data;
  },

  // Get similar learners inside a community based on K-Means cluster / feature similarity
  getSimilarLearners: async (communityId) => {
    const res = await api.get(`/communities/${communityId}/similar-learners`);
    return res.data;
  }
};

export default communityService;
