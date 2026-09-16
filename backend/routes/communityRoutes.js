const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const {
  getAllCommunities,
  getCommunityById,
  joinCommunity,
  leaveCommunity,
  getCommunityPosts,
  createPost,
  updatePost,
  deletePost,
  toggleLikePost,
  getPostComments,
  addComment,
  getKMeansFeatureMatrix
} = require('../controllers/communityController');

// Community List and Analytics
router.get('/', optionalAuth, getAllCommunities);
router.get('/analytics/kmeans-features', protect, getKMeansFeatureMatrix);

// Community Details, Join & Leave
router.get('/:communityId', optionalAuth, getCommunityById);
router.post('/:communityId/join', protect, joinCommunity);
router.post('/:communityId/leave', protect, leaveCommunity);

// Posts within a Community
router.get('/:communityId/posts', optionalAuth, getCommunityPosts);
router.post('/:communityId/posts', protect, upload.single('media'), createPost);

// Edit & Delete Post (Owner only)
router.put('/posts/:postId', protect, upload.single('media'), updatePost);
router.delete('/posts/:postId', protect, deletePost);

// Post Likes and Comments
router.post('/posts/:postId/like', protect, toggleLikePost);
router.get('/posts/:postId/comments', optionalAuth, getPostComments);
router.post('/posts/:postId/comments', protect, addComment);

module.exports = router;
