import React, { useState, useRef, useEffect } from 'react';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Check, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  AlertTriangle, 
  X,
  Loader2,
  Send
} from 'lucide-react';
import CardBase from '../dashboard/CardBase';
import CommentSection from './CommentSection';
import communityService from '../../services/communityService';
import { useUser } from '../../context/UserContext';

const CommunityPostCard = ({ 
  post, 
  currentCommunityId, 
  onPostDeleted, 
  onPostUpdated 
}) => {
  const { userData } = useUser();

  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [copiedToast, setCopiedToast] = useState(false);

  // Post Content State
  const [postContent, setPostContent] = useState(post.content || '');

  // Edit / Delete / Menu state
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content || '');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Confirmation Modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Strict ownership check
  const isOwner = Boolean(
    userData && (
      (post.user?._id && userData._id && post.user._id.toString() === userData._id.toString()) ||
      (post.user?.email && userData.email && post.user.email.toLowerCase() === userData.email.toLowerCase()) ||
      (post.user === userData._id) ||
      (typeof post.user === 'string' && post.user === 'You')
    )
  );

  const handleLikeToggle = async () => {
    if (isLiking) return;
    setIsLiking(true);

    const nextIsLiked = !isLiked;
    const nextLikesCount = nextIsLiked ? likesCount + 1 : Math.max(0, likesCount - 1);
    setIsLiked(nextIsLiked);
    setLikesCount(nextLikesCount);

    try {
      const res = await communityService.toggleLikePost(post._id);
      if (res.success) {
        setIsLiked(res.data.isLiked);
        setLikesCount(res.data.likesCount);
      }
    } catch (error) {
      console.error('❌ Failed to toggle like:', error);
      setIsLiked(isLiked);
      setLikesCount(likesCount);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/dashboard/community/${currentCommunityId}?post=${post._id}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(postUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = postUrl;
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

  // Handle Edit Post Save
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editContent.trim() || isSavingEdit) return;

    setIsSavingEdit(true);
    try {
      const res = await communityService.updatePost(post._id, { content: editContent.trim() });
      if (res.success) {
        setPostContent(res.data.content);
        setIsEditing(false);
        if (onPostUpdated) {
          onPostUpdated(res.data);
        }
      }
    } catch (error) {
      console.error('❌ Failed to update post:', error);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Handle Delete Post Confirmation
  const handleDeletePost = async () => {
    if (isDeleting) return;
    setIsDeleting(true);

    try {
      const res = await communityService.deletePost(post._id);
      if (res.success) {
        setShowDeleteModal(false);
        if (onPostDeleted) {
          onPostDeleted(post._id);
        }
      }
    } catch (error) {
      console.error('❌ Failed to delete post:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <CardBase className="p-5 sm:p-6 mb-6 border border-gray-100 dark:border-gray-800 shadow-sm rounded-3xl space-y-4 relative">
      {/* Toast notification for link copy */}
      {copiedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white dark:bg-pink-600 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <Check className="w-4 h-4 text-emerald-400 dark:text-white" />
          Link copied to clipboard!
        </div>
      )}

      {/* Post Author Info Header + Owner Options Menu */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={post.user?.profilePicture || '/assets/avatar1.png'}
            alt={post.user?.fullName || 'Community User'}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-pink-100 dark:ring-pink-900/50"
          />
          <div>
            <h4 className="font-semibold text-sm sm:text-base text-gray-900 dark:text-white leading-tight">
              {post.user?.fullName || 'SheSphere Member'}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(post.createdAt)}
            </p>
          </div>
        </div>

        {/* Owner Only: Three-Dot / Options Button */}
        {isOwner && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              title="Post options"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>

            {/* Dropdown Options Menu */}
            {showMenu && (
              <div className="absolute right-0 top-10 w-44 bg-white dark:bg-gray-850 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700/80 py-2 z-30 animate-in fade-in zoom-in-95 duration-150">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setEditContent(postContent);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-pink-50 dark:hover:bg-gray-800 hover:text-pink-600 dark:hover:text-pink-400 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Pencil className="w-4 h-4 text-pink-500" />
                  Edit post
                </button>

                <div className="my-1 border-t border-gray-100 dark:border-gray-800" />

                <button
                  onClick={() => {
                    setShowDeleteModal(true);
                    setShowMenu(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-xs sm:text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                  Delete post
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Mode Inline Editor */}
      {isEditing ? (
        <form onSubmit={handleSaveEdit} className="space-y-3 pt-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            rows={3}
            className="w-full bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white rounded-2xl p-3.5 text-sm border border-pink-300 dark:border-pink-900 focus:outline-none focus:ring-2 focus:ring-pink-400 resize-none"
          />
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSavingEdit || !editContent.trim()}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-xs hover:shadow-md transition-all flex items-center gap-1.5"
            >
              {isSavingEdit ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Caption Content */
        postContent && (
          <p className="text-sm sm:text-base text-gray-800 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
            {postContent}
          </p>
        )
      )}

      {/* Media Attachments */}
      {post.image && (
        <div className="rounded-2xl overflow-hidden max-h-96 bg-gray-100 dark:bg-gray-800 border border-gray-100 dark:border-gray-800">
          <img
            src={post.image}
            alt="Post content"
            className="w-full h-full max-h-96 object-cover"
          />
        </div>
      )}

      {post.video && (
        <div className="rounded-2xl overflow-hidden max-h-96 bg-black border border-gray-100 dark:border-gray-800">
          <video controls className="w-full max-h-96 object-contain">
            <source src={post.video} />
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {/* Modern Instagram-Inspired Interaction Bar (Share placed directly beside Comment) */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800/80 text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
        <div className="flex items-center gap-5 sm:gap-6">
          {/* Like Button */}
          <button
            onClick={handleLikeToggle}
            className={`flex items-center gap-2 transition-colors cursor-pointer ${
              isLiked
                ? 'text-pink-600 dark:text-pink-400 font-semibold'
                : 'hover:text-pink-500'
            }`}
          >
            <Heart
              className={`w-5 h-5 transition-transform ${
                isLiked ? 'fill-pink-500 text-pink-500 scale-110' : ''
              }`}
            />
            <span>{likesCount} <span className="hidden sm:inline">{likesCount === 1 ? 'Like' : 'Likes'}</span></span>
          </button>

          {/* Comment Button */}
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 hover:text-pink-500 transition-colors cursor-pointer"
          >
            <MessageSquare className="w-5 h-5" />
            <span>{commentsCount} <span className="hidden sm:inline">{commentsCount === 1 ? 'Comment' : 'Comments'}</span></span>
          </button>

          {/* Share Button (Directly beside Comment) */}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 hover:text-pink-500 transition-colors cursor-pointer"
            title="Share post link"
          >
            <Share2 className="w-5 h-5" />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Expandable Comments Drawer */}
      {showComments && (
        <CommentSection
          postId={post._id}
          initialCommentsCount={commentsCount}
          onCommentAdded={() => setCommentsCount((prev) => prev + 1)}
        />
      )}

      {/* Destructive Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-850 rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 dark:border-gray-700 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Delete this post?
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleDeletePost}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </CardBase>
  );
};

export default CommunityPostCard;
