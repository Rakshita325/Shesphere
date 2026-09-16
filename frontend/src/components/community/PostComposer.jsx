import React, { useState, useRef } from 'react';
import { Image, Video, X, Send, Loader2 } from 'lucide-react';
import { useUser } from '../../context/UserContext';
import CardBase from '../dashboard/CardBase';

const PostComposer = ({ communityName, onSubmitPost }) => {
  const { userData } = useUser();
  const [content, setContent] = useState('');
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null); // 'image' | 'video'
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);

  const handleFileSelect = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setMediaFile(file);
    setMediaType(type);
    setMediaPreview(URL.createObjectURL(file));
  };

  const removeMedia = () => {
    setMediaFile(null);
    setMediaType(null);
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
    }
    setMediaPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && !mediaFile) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      if (content.trim()) {
        formData.append('content', content.trim());
      }
      if (mediaFile) {
        formData.append('media', mediaFile);
      }

      await onSubmitPost(formData);

      // Reset state
      setContent('');
      removeMedia();
    } catch (error) {
      console.error('❌ Failed to post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CardBase className="mb-8 p-5 sm:p-6 border border-gray-100 dark:border-gray-800 shadow-sm rounded-3xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* User Info Header */}
        <div className="flex items-center gap-3">
          <img
            src={userData?.profilePicture || '/assets/avatar1.png'}
            alt={userData?.fullName || 'User'}
            className="w-11 h-11 rounded-full object-cover ring-2 ring-pink-200 dark:ring-pink-900"
          />
          <div>
            <p className="font-semibold text-sm text-gray-900 dark:text-white">
              {userData?.fullName || 'You'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Posting to <span className="font-medium text-pink-500">{communityName || 'Community'}</span>
            </p>
          </div>
        </div>

        {/* Text Input */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`What's on your mind in ${communityName || 'this community'}?`}
          rows={3}
          className="w-full bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-white rounded-2xl p-4 text-sm border border-gray-200/80 dark:border-gray-700/80 focus:outline-none focus:ring-2 focus:ring-pink-300 dark:focus:ring-pink-900/40 resize-none transition-colors"
        />

        {/* Media Preview Box */}
        {mediaPreview && (
          <div className="relative rounded-2xl overflow-hidden max-h-80 bg-black/5 dark:bg-black/30 border border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={removeMedia}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 hover:bg-black text-white transition-colors z-10"
              title="Remove media"
            >
              <X className="w-4 h-4" />
            </button>

            {mediaType === 'image' ? (
              <img
                src={mediaPreview}
                alt="Selected preview"
                className="w-full h-full max-h-80 object-cover rounded-2xl"
              />
            ) : (
              <video
                src={mediaPreview}
                controls
                className="w-full max-h-80 rounded-2xl object-cover"
              />
            )}
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800/80">
          <div className="flex items-center gap-3">
            {/* Image Upload Input */}
            <label className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-950/30 hover:text-pink-600 dark:hover:text-pink-400 cursor-pointer transition-colors">
              <Image className="w-4 h-4 text-pink-500" />
              <span>Photo</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileSelect(e, 'image')}
                className="hidden"
              />
            </label>

            {/* Video Upload Input */}
            <label className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer transition-colors">
              <Video className="w-4 h-4 text-purple-500" />
              <span>Video</span>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => handleFileSelect(e, 'video')}
                className="hidden"
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || (!content.trim() && !mediaFile)}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 text-white font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Post
              </>
            )}
          </button>
        </div>
      </form>
    </CardBase>
  );
};

export default PostComposer;
