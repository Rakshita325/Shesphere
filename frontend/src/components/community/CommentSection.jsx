import React, { useState, useEffect } from 'react';
import { Send, Loader2, MessageSquare } from 'lucide-react';
import communityService from '../../services/communityService';
import { useUser } from '../../context/UserContext';

const CommentSection = ({ postId, initialCommentsCount, onCommentAdded }) => {
  const { userData } = useUser();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await communityService.getPostComments(postId);
      if (res.success) {
        setComments(res.data);
      }
    } catch (error) {
      console.error('❌ Failed to fetch comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || submitting) return;

    setSubmitting(true);
    try {
      const res = await communityService.addComment(postId, newComment.trim());
      if (res.success) {
        setComments((prev) => [...prev, res.data]);
        setNewComment('');
        if (onCommentAdded) {
          onCommentAdded();
        }
      }
    } catch (error) {
      console.error('❌ Failed to add comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
      {/* Comments Header */}
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
        <MessageSquare className="w-4 h-4 text-pink-400" />
        <span>Comments ({comments.length})</span>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center py-4 text-gray-400">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-3 italic">
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        /* Comment List */
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {comments.map((comment) => (
            <div key={comment._id} className="flex items-start gap-3 text-xs">
              <img
                src={comment.user?.profilePicture || '/assets/avatar1.png'}
                alt={comment.user?.fullName || 'Commenter'}
                className="w-8 h-8 rounded-full object-cover mt-0.5 shrink-0"
              />
              <div className="flex-1 bg-gray-50 dark:bg-gray-800/70 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {comment.user?.fullName || 'Anonymous'}
                  </span>
                  <span className="text-[10px] text-gray-400 dark:text-gray-500">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Comment Input Form */}
      <form onSubmit={handleAddComment} className="flex items-center gap-2 pt-2">
        <img
          src={userData?.profilePicture || '/assets/avatar1.png'}
          alt="Your Avatar"
          className="w-8 h-8 rounded-full object-cover shrink-0"
        />
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="flex-1 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-3.5 py-2 text-xs border border-gray-200/80 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-300 dark:focus:ring-pink-900/40"
        />
        <button
          type="submit"
          disabled={!newComment.trim() || submitting}
          className="p-2 rounded-xl bg-pink-500 hover:bg-pink-600 disabled:opacity-50 text-white transition-colors shrink-0 cursor-pointer"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
};

export default CommentSection;
