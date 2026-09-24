import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, Users, Sparkles, MessageSquare, AlertCircle } from 'lucide-react';
import communityService from '../services/communityService';
import CommunityCard from '../components/community/CommunityCard';
import CommunityHeader from '../components/community/CommunityHeader';
import PostComposer from '../components/community/PostComposer';
import CommunityPostCard from '../components/community/CommunityPostCard';
import SimilarLearnersWidget from '../components/community/SimilarLearnersWidget';

import { useSearch } from '../context/SearchContext';

const Community = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const { searchQuery } = useSearch();

  // List View State
  const [communities, setCommunities] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Dedicated Community State
  const [activeCommunity, setActiveCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loadingCommunity, setLoadingCommunity] = useState(false);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const filteredCommunities = searchQuery.trim()
    ? communities.filter((c) => {
        const q = searchQuery.toLowerCase().trim();
        const nameMatch = c.name?.toLowerCase().includes(q);
        const descMatch = c.description?.toLowerCase().includes(q);
        const interestMatch = c.interest?.toLowerCase().includes(q);
        const catMatch = c.category?.toLowerCase().includes(q);
        return nameMatch || descMatch || interestMatch || catMatch;
      })
    : communities;

  useEffect(() => {
    if (communityId) {
      fetchDedicatedCommunity(communityId);
    } else {
      fetchCommunitiesList();
    }
  }, [communityId]);

  // Fetch all 8 communities
  const fetchCommunitiesList = async () => {
    try {
      setLoadingList(true);
      setErrorMsg('');
      const res = await communityService.getCommunities();
      if (res.success) {
        setCommunities(res.data);
      }
    } catch (error) {
      console.error('❌ Error loading communities list:', error);
      setErrorMsg('Failed to load communities. Please check your connection and try again.');
    } finally {
      setLoadingList(false);
    }
  };

  // Fetch single community & its posts
  const fetchDedicatedCommunity = async (id) => {
    try {
      setLoadingCommunity(true);
      setLoadingPosts(true);
      setErrorMsg('');

      const commRes = await communityService.getCommunityDetails(id);
      if (commRes.success) {
        setActiveCommunity(commRes.data);

        // Fetch posts for this community
        const postsRes = await communityService.getCommunityPosts(commRes.data._id);
        if (postsRes.success) {
          setPosts(postsRes.data);
        }
      } else {
        setErrorMsg('Community not found');
      }
    } catch (error) {
      console.error('❌ Error loading community details:', error);
      setErrorMsg('Failed to load community details.');
    } finally {
      setLoadingCommunity(false);
      setLoadingPosts(false);
    }
  };

  // Join or Leave toggle handler
  const handleJoinToggle = async (communityToToggle) => {
    const targetId = communityToToggle._id || communityToToggle.id;
    if (!targetId || actionLoadingId) return;

    setActionLoadingId(targetId);
    try {
      if (communityToToggle.isJoined) {
        const res = await communityService.leaveCommunity(targetId);
        if (res.success) {
          updateCommunityStateInListAndActive(targetId, false, res.data.memberCount);
        }
      } else {
        const res = await communityService.joinCommunity(targetId);
        if (res.success) {
          updateCommunityStateInListAndActive(targetId, true, res.data.memberCount);
        }
      }
    } catch (error) {
      console.error('❌ Failed to toggle membership:', error);
    } finally {
      setActionLoadingId(null);
    }
  };

  const updateCommunityStateInListAndActive = (id, isJoined, memberCount) => {
    setCommunities((prev) =>
      prev.map((c) => (c._id === id ? { ...c, isJoined, memberCount } : c))
    );
    if (activeCommunity && activeCommunity._id === id) {
      setActiveCommunity((prev) => ({ ...prev, isJoined, memberCount }));
    }
  };

  // Handle post deleted by owner
  const handlePostDeleted = (deletedPostId) => {
    setPosts((prev) => prev.filter((p) => p._id !== deletedPostId));
  };

  // Handle post updated by owner
  const handlePostUpdated = (updatedPost) => {
    setPosts((prev) =>
      prev.map((p) => (p._id === updatedPost._id ? { ...p, ...updatedPost } : p))
    );
  };

  // Submit new post handler
  const handleCreatePost = async (formData) => {
    if (!activeCommunity) return;
    const res = await communityService.createPost(activeCommunity._id, formData);
    if (res.success) {
      setPosts((prev) => [res.data, ...prev]);
    }
  };

  // -------------------------------------------------------------
  // DEDICATED COMMUNITY VIEW (/community/:communityId)
  // -------------------------------------------------------------
  if (communityId) {
    if (loadingCommunity) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-pink-500">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Loading community...</p>
        </div>
      );
    }

    if (errorMsg || !activeCommunity) {
      return (
        <div className="max-w-4xl mx-auto py-12 px-4 text-center">
          <div className="inline-flex p-4 rounded-full bg-red-50 dark:bg-red-950/40 text-red-500 mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{errorMsg || 'Community Not Found'}</h2>
          <button
            onClick={() => navigate('/dashboard/community')}
            className="px-5 py-2.5 rounded-xl bg-pink-500 text-white font-medium text-sm hover:bg-pink-600 transition-colors"
          >
            Back to Communities
          </button>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto py-6 px-4">
        {/* 1. Community Header */}
        <CommunityHeader
          community={activeCommunity}
          onJoinToggle={() => handleJoinToggle(activeCommunity)}
          isActionLoading={actionLoadingId === activeCommunity._id}
        />

        {/* K-Means Powered Similar Learners Widget */}
        <SimilarLearnersWidget communityId={activeCommunity._id} />

        {/* 2. Create Post Section at the Top */}
        <PostComposer
          communityName={activeCommunity.name}
          onSubmitPost={handleCreatePost}
        />

        {/* 3. Community Feed */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-pink-500" />
              Community Posts & Discussions
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {posts.length} {posts.length === 1 ? 'post' : 'posts'}
            </span>
          </div>

          {loadingPosts ? (
            <div className="flex justify-center py-12 text-pink-500">
              <Loader2 className="w-7 h-7 animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-850 rounded-3xl border border-gray-100 dark:border-gray-800 p-8">
              <div className="w-12 h-12 rounded-2xl bg-pink-50 dark:bg-pink-950/50 text-pink-500 mx-auto flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-900 dark:text-white text-lg mb-1">No posts yet</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                Be the first member to share a post, question, photo, or idea in {activeCommunity.name}!
              </p>
            </div>
          ) : (
            posts.map((post) => (
              <CommunityPostCard
                key={post._id}
                post={post}
                currentCommunityId={activeCommunity._id}
                onPostDeleted={handlePostDeleted}
                onPostUpdated={handlePostUpdated}
              />
            ))
          )}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // COMMUNITY LIST PAGE VIEW (/community)
  // -------------------------------------------------------------
  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      {/* Top Banner Header */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 text-xs font-bold uppercase tracking-wider">
          <Users className="w-4 h-4 text-pink-500" />
          Interest Communities
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Find Your Tribe in <span className="bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">SheSphere</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-350 text-sm sm:text-base leading-relaxed">
          Join interest communities, exchange ideas, share photos and videos, and connect with inspiring women.
        </p>
      </div>

      {/* Loading state */}
      {loadingList ? (
        <div className="flex flex-col items-center justify-center py-20 text-pink-500 gap-3">
          <Loader2 className="w-10 h-10 animate-spin" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Fetching communities...</p>
        </div>
      ) : errorMsg ? (
        <div className="text-center py-12 text-red-500 font-medium">
          {errorMsg}
        </div>
      ) : filteredCommunities.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700 p-8">
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
            No community groups found matching '{searchQuery}'.
          </p>
        </div>
      ) : (
        /* Interest Communities Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredCommunities.map((comm) => (
            <CommunityCard
              key={comm._id}
              community={comm}
              onJoinToggle={handleJoinToggle}
              isActionLoading={actionLoadingId === comm._id}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Community;
