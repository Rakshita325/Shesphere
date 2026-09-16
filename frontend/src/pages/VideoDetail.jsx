import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Heart, 
  MessageSquare, 
  Share2, 
  Check, 
  Send, 
  Loader2, 
  Tag, 
  Eye, 
  Clock 
} from 'lucide-react';
import videoService from '../services/videoService';
import { useUser } from '../context/UserContext';

const VideoDetail = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { userData } = useUser();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Interaction states
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  // Comments state
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Toast
  const [copiedToast, setCopiedToast] = useState(false);

  // YouTube tracking refs & state
  const playerRef = useRef(null);
  const progressTimerRef = useRef(null);

  useEffect(() => {
    fetchVideoDetails();
    fetchComments();

    return () => {
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, [videoId]);

  const fetchVideoDetails = async () => {
    try {
      setLoading(true);
      const res = await videoService.getVideoById(videoId);
      if (res && res.success) {
        setVideo(res.data);
        setIsLiked(res.data.isLiked);
        setLikesCount(res.data.likesCount);
      } else {
        setError('Video not found');
      }
    } catch (err) {
      console.error('Error fetching video details:', err);
      setError('Failed to load video details');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await videoService.getComments(videoId);
      if (res && res.success) {
        setComments(res.data);
      }
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  // Initialize YouTube IFrame API when video is loaded
  useEffect(() => {
    if (!video || !video.youtubeId) return;

    const startSavedSeconds = video.watchedSeconds || 0;

    // Load YT API script if not present
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        initPlayer(startSavedSeconds);
      };
    } else {
      initPlayer(startSavedSeconds);
    }

    function initPlayer(startPos) {
      if (playerRef.current) return;

      playerRef.current = new window.YT.Player('youtube-player-container', {
        height: '100%',
        width: '100%',
        videoId: video.youtubeId,
        playerVars: {
          autoplay: 1,
          start: Math.floor(startPos),
          modestbranding: 1,
          rel: 0
        },
        events: {
          onStateChange: onPlayerStateChange
        }
      });
    }

    function onPlayerStateChange(event) {
      // YT.PlayerState.PLAYING = 1, PAUSED = 2, ENDED = 0
      if (event.data === 1) {
        // Start periodic debounced tracking every 10 seconds while playing
        if (!progressTimerRef.current) {
          progressTimerRef.current = setInterval(saveCurrentProgress, 10000);
        }
      } else {
        // Save progress on pause or ended and clear timer
        saveCurrentProgress();
        if (progressTimerRef.current) {
          clearInterval(progressTimerRef.current);
          progressTimerRef.current = null;
        }
      }
    }
  }, [video]);

  const saveCurrentProgress = async () => {
    if (!playerRef.current || typeof playerRef.current.getCurrentTime !== 'function') return;

    try {
      const currentTime = playerRef.current.getCurrentTime() || 0;
      const duration = playerRef.current.getDuration() || video?.duration || 600;

      if (currentTime > 0 && duration > 0) {
        await videoService.updateProgress(videoId, currentTime, duration);
      }
    } catch (err) {
      console.warn('Could not save watch progress:', err);
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
      const res = await videoService.toggleLike(videoId);
      if (res && res.success) {
        setIsLiked(res.data.isLiked);
        setLikesCount(res.data.likesCount);
      }
    } catch (err) {
      console.error('Failed to toggle video like:', err);
      setIsLiked(isLiked);
      setLikesCount(likesCount);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    const videoUrl = `${window.location.origin}/dashboard/videos/${videoId}`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(videoUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = videoUrl;
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
      const res = await videoService.addComment(videoId, newComment.trim());
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Just now';
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-4 flex flex-col items-center justify-center min-h-[60vh] text-pink-500 gap-3">
        <Loader2 className="w-8 h-8 animate-spin" />
        <p className="text-sm font-medium text-gray-500">Loading SheSphere Video...</p>
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">Video Not Found</h2>
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
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Toast */}
      {copiedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white dark:bg-pink-600 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <Check className="w-4 h-4 text-emerald-400 dark:text-white" />
          SheSphere video URL copied to clipboard!
        </div>
      )}

      {/* Back Button */}
      <button
        onClick={() => {
          saveCurrentProgress();
          navigate(-1);
        }}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      {/* Large Embedded YouTube Video Player */}
      <div className="relative w-full aspect-video rounded-3xl overflow-hidden shadow-xl bg-black border border-gray-200 dark:border-gray-800">
        <div id="youtube-player-container" className="w-full h-full" />
      </div>

      {/* Video Details Box */}
      <div className="bg-white dark:bg-gray-850 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-950/70 text-pink-700 dark:text-pink-300">
              <Tag className="w-3.5 h-3.5 text-pink-500" />
              {video.category}
            </span>
            {video.subcategory && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                {video.subcategory}
              </span>
            )}
          </div>

          <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            {video.title}
          </h1>
        </div>

        {/* Action Bar (Like, Comment, Share) */}
        <div className="flex items-center justify-between border-t border-b border-gray-100 dark:border-gray-800 py-3.5 text-sm font-medium text-gray-600 dark:text-gray-300 flex-wrap gap-4">
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

          {video.views > 0 && (
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {video.views.toLocaleString()} views
            </span>
          )}
        </div>

        {/* Video Tags */}
        {video.tags && video.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-xs font-semibold text-gray-400">Tags:</span>
            {video.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-[11px] font-medium px-2.5 py-0.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* SheSphere Comments Section */}
      <div className="bg-white dark:bg-gray-850 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-pink-500" />
          Community Discussion & Comments
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
            placeholder="Share your thoughts or ask a question about this video..."
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
              No comments yet on this video. Start the conversation!
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
                      {c.user?.fullName || 'SheSphere Member'}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {formatDate(c.createdAt)}
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
  );
};

export default VideoDetail;
