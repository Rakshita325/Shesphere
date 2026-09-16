import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Heart, 
  MessageSquare, 
  Share2, 
  Check, 
  Send, 
  Loader2, 
  Calendar, 
  User, 
  Tag, 
  BookOpen 
} from 'lucide-react';
import articleService from '../services/articleService';
import { useUser } from '../context/UserContext';

const ArticleDetail = () => {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const { userData } = useUser();

  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Likes & comments
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Toast
  const [copiedToast, setCopiedToast] = useState(false);

  useEffect(() => {
    fetchArticleDetails();
    fetchComments();
  }, [articleId]);

  const fetchArticleDetails = async () => {
    try {
      setLoading(true);
      const res = await articleService.getArticleById(articleId);
      if (res && res.success) {
        setArticle(res.data);
        setIsLiked(res.data.isLiked);
        setLikesCount(res.data.likesCount);
      } else {
        setError('Article not found');
      }
    } catch (err) {
      console.error('Error fetching article details:', err);
      setError('Failed to load article details');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await articleService.getComments(articleId);
      if (res && res.success) {
        setComments(res.data);
      }
    } catch (err) {
      console.error('Error fetching article comments:', err);
    }
  };

  const handleLikeToggle = async () => {
    if (isLiking) return;
    setIsLiking(true);

    const nextIsLiked = !isLiked;
    const nextCount = nextIsLiked ? likesCount + 1 : Math.max(0, likesCount - 1);
    setIsLiked(nextIsLiked);
    setLikesCount(nextCount);

    try {
      const res = await articleService.toggleLike(articleId);
      if (res && res.success) {
        setIsLiked(res.data.isLiked);
        setLikesCount(res.data.likesCount);
      }
    } catch (err) {
      console.error('Failed to toggle article like:', err);
      setIsLiked(isLiked);
      setLikesCount(likesCount);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    const articleUrl = `${window.location.origin}/dashboard/articles/${articleId}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(articleUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = articleUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 2500);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submittingComment) return;

    setSubmittingComment(true);
    try {
      const res = await articleService.addComment(articleId, newComment.trim());
      if (res && res.success) {
        setComments((prev) => [...prev, res.data]);
        setNewComment('');
      }
    } catch (err) {
      console.error('Failed to add comment:', err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-4 flex flex-col items-center justify-center min-h-[60vh] text-pink-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-sm font-medium text-gray-500">Loading SheSphere Article...</p>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">Article Not Found</h2>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 rounded-xl bg-pink-500 text-white text-xs font-semibold"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      {/* Toast */}
      {copiedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white dark:bg-pink-600 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <Check className="w-4 h-4 text-emerald-400 dark:text-white" />
          SheSphere article URL copied to clipboard!
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Article Container */}
      <div className="bg-white dark:bg-gray-850 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-md">
        {/* Cover Image */}
        {article.coverImage && (
          <div className="w-full h-72 sm:h-96 overflow-hidden bg-gray-100 dark:bg-gray-800">
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 md:p-10 space-y-6">
          {/* Header Info */}
          <div className="space-y-3 border-b border-gray-100 dark:border-gray-800 pb-6">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-950/70 text-pink-700 dark:text-pink-300">
              <Tag className="w-3.5 h-3.5 text-pink-500" />
              {article.category || 'General'}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
              {article.title}
            </h1>

            {/* Author & Published Date */}
            <div className="flex items-center gap-4 flex-wrap text-xs text-gray-500 dark:text-gray-400 pt-1">
              <div className="flex items-center gap-2">
                <img
                  src={article.author?.profilePicture || '/assets/avatar1.png'}
                  alt={article.author?.fullName || 'Author'}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-pink-100"
                />
                <span className="font-semibold text-gray-800 dark:text-white">
                  {article.author?.fullName || article.source || 'SheSphere Contributor'}
                </span>
              </div>

              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-pink-500" />
                {formatDate(article.createdAt || article.publishedAt)}
              </span>
            </div>
          </div>

          {/* Article Body Content with Comfortable Reading Typography */}
          <div className="prose dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed text-sm sm:text-base space-y-4 whitespace-pre-wrap">
            {article.content}
          </div>

          {/* Additional Images if available */}
          {article.images && article.images.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {article.images.map((img, idx) => (
                <div key={idx} className="rounded-2xl overflow-hidden max-h-64 bg-gray-100">
                  <img src={img} alt={`Article detail ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* Interaction Bar (Like, Comment, Share) */}
          <div className="flex items-center justify-between border-t border-b border-gray-100 dark:border-gray-800 py-4 text-sm font-medium text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-6">
              {/* Like Button */}
              <button
                onClick={handleLikeToggle}
                className={`flex items-center gap-2 transition-colors cursor-pointer ${
                  isLiked ? 'text-pink-600 font-semibold' : 'hover:text-pink-500'
                }`}
              >
                <Heart
                  className={`w-5 h-5 transition-transform ${
                    isLiked ? 'fill-pink-500 text-pink-500 scale-110' : ''
                  }`}
                />
                <span>{likesCount} Likes</span>
              </button>

              {/* Comment Count */}
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-gray-400" />
                <span>{comments.length} Comments</span>
              </div>

              {/* Share Button */}
              <button
                onClick={handleShare}
                className="flex items-center gap-2 hover:text-pink-500 transition-colors cursor-pointer"
              >
                <Share2 className="w-5 h-5 text-gray-400" />
                <span>Share</span>
              </button>
            </div>
          </div>

          {/* SheSphere Comments Section */}
          <div className="space-y-4 pt-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-pink-500" />
              Article Comments & Feedback
            </h3>

            {/* Add Comment Form */}
            <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-1">
              <img
                src={userData?.profilePicture || '/assets/avatar1.png'}
                alt="Your Avatar"
                className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-pink-100 dark:ring-pink-900"
              />
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl px-4 py-2.5 text-xs sm:text-sm border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-300 dark:focus:ring-pink-900/40"
              />
              <button
                type="submit"
                disabled={!newComment.trim() || submittingComment}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 text-white shadow-xs transition-all shrink-0 cursor-pointer"
              >
                {submittingComment ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>

            {/* Comments List */}
            <div className="space-y-3 pt-2">
              {comments.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-4 italic">
                  No comments on this article yet. Be the first to express your thoughts!
                </p>
              ) : (
                comments.map((c) => (
                  <div key={c._id} className="flex items-start gap-3 text-xs">
                    <img
                      src={c.user?.profilePicture || '/assets/avatar1.png'}
                      alt={c.user?.fullName || 'User'}
                      className="w-8 h-8 rounded-full object-cover mt-0.5 shrink-0"
                    />
                    <div className="flex-1 bg-gray-50 dark:bg-gray-800/70 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="font-bold text-gray-900 dark:text-white">
                          {c.user?.fullName || 'SheSphere Reader'}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {new Date(c.createdAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {c.content}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleDetail;
