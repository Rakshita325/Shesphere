import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, MessageSquare } from 'lucide-react';
import CardBase from './CardBase';
import communityService from '../../services/communityService';
import { communityPosts as dummyPosts } from '../../utils/dummyData';

const CommunityFeed = () => {
  const [recentPosts, setRecentPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentPosts();
  }, []);

  const fetchRecentPosts = async () => {
    try {
      setLoading(true);
      const res = await communityService.getCommunities();
      if (res.success && res.data.length > 0) {
        // Fetch posts from first joined or recommended community
        const targetCommunity = res.data.find((c) => c.isJoined) || res.data.find((c) => c.isRecommended) || res.data[0];
        if (targetCommunity) {
          const postsRes = await communityService.getCommunityPosts(targetCommunity._id);
          if (postsRes.success && postsRes.data.length > 0) {
            setRecentPosts(postsRes.data.slice(0, 3));
          }
        }
      }
    } catch (error) {
      console.warn('Using dummy community posts on dashboard:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const displayPosts = recentPosts.length > 0 ? recentPosts : dummyPosts;

  return (
    <CardBase className="col-span-1 md:col-span-2 lg:col-span-3 p-6 border border-gray-100 dark:border-gray-800 rounded-3xl shadow-xs">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-pink-600 dark:text-pink-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Community Feed</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Latest updates from SheSphere interest communities</p>
          </div>
        </div>

        <Link
          to="/dashboard/community"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 hover:underline transition-all"
        >
          <span>Explore Communities</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <ul className="space-y-4">
        {displayPosts.map((post) => (
          <li key={post._id || post.id} className="flex items-start gap-3.5 p-3 rounded-2xl bg-gray-50/70 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800">
            <img
              src={post.user?.profilePicture || post.avatar || '/assets/avatar1.png'}
              alt={post.user?.fullName || post.user || 'User'}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-pink-100 dark:ring-pink-900 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                  {post.user?.fullName || post.user}
                </p>
                <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
                  {post.date || 'Recent'}
                </span>
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                {post.content || post.caption}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </CardBase>
  );
};

export default CommunityFeed;
