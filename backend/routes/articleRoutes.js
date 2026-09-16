const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const {
  getArticles,
  getArticleById,
  createArticle,
  toggleArticleLike,
  getArticleComments,
  addArticleComment
} = require('../controllers/articleController');

// Article routes
router.get('/', optionalAuth, getArticles);
router.post(
  '/',
  protect,
  upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'additionalImages', maxCount: 4 }
  ]),
  createArticle
);

router.get('/:articleId', optionalAuth, getArticleById);
router.post('/:articleId/like', protect, toggleArticleLike);
router.get('/:articleId/comments', optionalAuth, getArticleComments);
router.post('/:articleId/comments', protect, addArticleComment);

module.exports = router;
