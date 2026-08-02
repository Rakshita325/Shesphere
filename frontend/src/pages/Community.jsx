import React, { useState } from 'react';
import CardBase from '../components/dashboard/CardBase';
import { Heart, MessageSquare, Share2, Image, Video } from 'lucide-react';
import { communityPosts as dummyPosts } from '../utils/dummyData';

// Reusable post card
const CommunityPostCard = ({ post }) => {
  return (
    <CardBase className="space-y-3">
      <div className="flex items-center gap-3">
        <img src={post.avatar} alt={post.user} className="w-10 h-10 rounded-full" />
        <div>
          <p className="font-medium text-gray-800">{post.user}</p>
          <p className="text-sm text-gray-500">{post.date}</p>
        </div>
      </div>
      {post.image && (
        <img src={post.image} alt="post media" className="w-full rounded-md" />
      )}
      {post.video && (
        <video controls className="w-full rounded-md">
          <source src={post.video} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      )}
      {post.caption && <p className="text-gray-800 whitespace-pre-wrap">{post.caption}</p>}
      <div className="flex items-center gap-6 text-gray-600">
        <button className="flex items-center gap-1 hover:text-pink-500 transition-colors">
          <Heart className="w-5 h-5" /> Like
        </button>
        <button className="flex items-center gap-1 hover:text-pink-500 transition-colors">
          <MessageSquare className="w-5 h-5" /> Comment
        </button>
        <button className="flex items-center gap-1 hover:text-pink-500 transition-colors">
          <Share2 className="w-5 h-5" /> Share
        </button>
      </div>
    </CardBase>
  );
};

const Community = () => {
  const [posts, setPosts] = useState(dummyPosts);
  const [caption, setCaption] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!caption.trim() && !imageFile && !videoFile) return;
    setIsSubmitting(true);

    // Simulate upload and generate preview URLs
    const newPost = {
      id: Date.now(),
      user: 'You',
      avatar: '/assets/avatar1.png',
      date: new Date().toISOString().split('T')[0],
      caption: caption.trim(),
    };
    if (imageFile) {
      newPost.image = URL.createObjectURL(imageFile);
    }
    if (videoFile) {
      newPost.video = URL.createObjectURL(videoFile);
    }
    setPosts([newPost, ...posts]);
    setCaption('');
    setImageFile(null);
    setVideoFile(null);
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">

      {/* Upload Form */}
      <CardBase className="mb-8">
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption..."
            className="w-full border border-gray-200 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-pink-300"
            rows={3}
          />
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-1 text-gray-600 cursor-pointer">
              <Image className="w-5 h-5" />
              <span>Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files[0])}
                className="hidden"
              />
            </label>
            <label className="flex items-center gap-1 text-gray-600 cursor-pointer">
              <Video className="w-5 h-5" />
              <span>Video</span>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 bg-pink-400 text-white rounded-md hover:bg-pink-500 transition-colors"
          >
            {isSubmitting ? 'Sharing...' : 'Share'}
          </button>
        </form>
      </CardBase>

      {/* Posts Feed */}
      <div className="grid gap-6">
        {posts.map((post) => (
          <CommunityPostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default Community;
