const mongoose = require('mongoose');
const Community = require('../models/Community');
const CommunityMembership = require('../models/CommunityMembership');
const CommunityPost = require('../models/CommunityPost');
const Comment = require('../models/Comment');
const Like = require('../models/Like');
const User = require('../models/User');
const UserActivity = require('../models/UserActivity');
const { uploadToCloudinary } = require('../middleware/uploadMiddleware');

// Fixed 8 core communities matching user interest options
const DEFAULT_COMMUNITIES = [
  {
    name: 'Cooking',
    slug: 'cooking',
    interestKey: 'cooking',
    description: 'Share delicious recipes, culinary techniques, and food presentation tips with fellow food enthusiasts.',
    icon: 'ChefHat',
    bannerColor: 'from-amber-500 to-orange-500'
  },
  {
    name: 'Art & Craft',
    slug: 'art-craft',
    interestKey: 'arts_crafts',
    description: 'Express your creativity through DIY crafts, painting, pottery, and handmade artistic projects.',
    icon: 'Palette',
    bannerColor: 'from-pink-500 to-rose-500'
  },
  {
    name: 'Gardening',
    slug: 'gardening',
    interestKey: 'gardening',
    description: 'Connect with plant lovers, learn indoor/outdoor gardening, composting, and plant care tips.',
    icon: 'Leaf',
    bannerColor: 'from-emerald-500 to-teal-500'
  },
  {
    name: 'Sewing & Fashion',
    slug: 'sewing-fashion',
    interestKey: 'sewing_fashion',
    description: 'Explore garment construction, pattern making, embroidery, and personal styling.',
    icon: 'Scissors',
    bannerColor: 'from-purple-500 to-indigo-500'
  },
  {
    name: 'Digital Design',
    slug: 'digital-design',
    interestKey: 'digital_skills',
    description: 'Master graphic design, web creation, UI/UX tools, and digital illustration skills.',
    icon: 'Laptop',
    bannerColor: 'from-blue-500 to-cyan-500'
  },
  {
    name: 'Health & Fitness',
    slug: 'health-fitness',
    interestKey: 'health_fitness',
    description: 'Engage in home workouts, yoga sessions, mental wellness practices, and healthy living.',
    icon: 'Dumbbell',
    bannerColor: 'from-red-500 to-pink-500'
  },
  {
    name: 'Music & Instruments',
    slug: 'music-instruments',
    interestKey: 'music_instruments',
    description: 'Discover instrumental techniques, singing practices, song composition, and musical expression.',
    icon: 'Music',
    bannerColor: 'from-violet-500 to-purple-600'
  },
  {
    name: 'Skin Care',
    slug: 'skin-care',
    interestKey: 'skincare',
    description: 'Discuss natural beauty routines, skincare regimes, self-care practices, and glow tips.',
    icon: 'Sparkles',
    bannerColor: 'from-teal-400 to-emerald-600'
  }
];

/**
 * Seed 8 default interest communities if they do not exist
 */
const seedCommunities = async () => {
  try {
    for (const commData of DEFAULT_COMMUNITIES) {
      await Community.findOneAndUpdate(
        { slug: commData.slug },
        { $setOnInsert: commData },
        { upsert: true, new: true }
      );
    }
    console.log('✅ Seeded/Verified 8 default interest-based communities');
  } catch (error) {
    console.error('❌ Error seeding communities:', error.message);
  }
};

/**
 * Helper to match user interest string to interestKey
 */
const normalizeInterestKey = (interest) => {
  if (!interest) return '';
  const lower = interest.toLowerCase().trim();
  if (lower.includes('cook')) return 'cooking';
  if (lower.includes('art') || lower.includes('craft')) return 'arts_crafts';
  if (lower.includes('garden')) return 'gardening';
  if (lower.includes('sew') || lower.includes('fashion')) return 'sewing_fashion';
  if (lower.includes('digital') || lower.includes('design') || lower.includes('skill')) return 'digital_skills';
  if (lower.includes('health') || lower.includes('fit')) return 'health_fitness';
  if (lower.includes('music') || lower.includes('instrument')) return 'music_instruments';
  if (lower.includes('skin')) return 'skincare';
  return lower;
};

/**
 * @desc    Get all communities with join status for logged in user
 * @route   GET /api/communities
 * @access  Public / Private (Optional token check)
 */
const getAllCommunities = async (req, res) => {
  try {
    let communities = await Community.find({ isActive: true }).sort({ name: 1 });

    if (!communities || communities.length === 0) {
      await seedCommunities();
      communities = await Community.find({ isActive: true }).sort({ name: 1 });
    }

    let joinedCommunityIds = new Set();
    let userInterest = '';

    if (req.user && req.user.id) {
      const user = await User.findById(req.user.id);
      if (user && user.interest) {
        userInterest = normalizeInterestKey(user.interest);
      }

      const memberships = await CommunityMembership.find({ user: req.user.id });
      joinedCommunityIds = new Set(memberships.map((m) => m.community.toString()));
    }

    const data = communities.map((comm) => {
      const commObj = comm.toObject();
      const commInterestKey = normalizeInterestKey(commObj.interestKey);
      return {
        ...commObj,
        isJoined: joinedCommunityIds.has(commObj._id.toString()),
        isRecommended: userInterest !== '' && commInterestKey === userInterest
      };
    });

    return res.status(200).json({
      success: true,
      count: data.length,
      userInterest,
      data
    });
  } catch (error) {
    console.error('❌ Error fetching communities:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching communities'
    });
  }
};

/**
 * @desc    Get single community details by ID or slug
 * @route   GET /api/communities/:communityId
 * @access  Public / Private
 */
const getCommunityById = async (req, res) => {
  try {
    const { communityId } = req.params;
    let query = mongoose.Types.ObjectId.isValid(communityId)
      ? { _id: communityId }
      : { slug: communityId };

    const community = await Community.findOne(query);

    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    let isJoined = false;
    let userInterest = '';

    if (req.user && req.user.id) {
      const user = await User.findById(req.user.id);
      if (user && user.interest) {
        userInterest = normalizeInterestKey(user.interest);
      }

      const membership = await CommunityMembership.findOne({
        user: req.user.id,
        community: community._id
      });
      isJoined = !!membership;
    }

    const commObj = community.toObject();
    const isRecommended = userInterest !== '' && normalizeInterestKey(commObj.interestKey) === userInterest;

    return res.status(200).json({
      success: true,
      data: {
        ...commObj,
        isJoined,
        isRecommended
      }
    });
  } catch (error) {
    console.error('❌ Error fetching community details:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching community details'
    });
  }
};

/**
 * @desc    Join a community
 * @route   POST /api/communities/:communityId/join
 * @access  Private
 */
const joinCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const userId = req.user.id;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    // Check existing membership
    let membership = await CommunityMembership.findOne({ user: userId, community: communityId });

    if (!membership) {
      membership = await CommunityMembership.create({
        user: userId,
        community: communityId
      });

      // Increment member count
      community.memberCount = await CommunityMembership.countDocuments({ community: communityId });
      await community.save();

      // Log UserActivity for K-Means data harvesting
      await UserActivity.create({
        user: userId,
        activityType: 'JOIN_COMMUNITY',
        community: communityId
      });

      // Update user stats
      await User.findByIdAndUpdate(userId, { $inc: { communityDiscussions: 1 } });
    }

    return res.status(200).json({
      success: true,
      message: 'Successfully joined community',
      data: {
        communityId: community._id,
        memberCount: community.memberCount,
        isJoined: true
      }
    });
  } catch (error) {
    console.error('❌ Error joining community:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while joining community'
    });
  }
};

/**
 * @desc    Leave a community
 * @route   POST /api/communities/:communityId/leave
 * @access  Private
 */
const leaveCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const userId = req.user.id;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    await CommunityMembership.findOneAndDelete({ user: userId, community: communityId });

    // Recalculate member count
    community.memberCount = await CommunityMembership.countDocuments({ community: communityId });
    await community.save();

    // Log activity
    await UserActivity.create({
      user: userId,
      activityType: 'LEAVE_COMMUNITY',
      community: communityId
    });

    return res.status(200).json({
      success: true,
      message: 'Successfully left community',
      data: {
        communityId: community._id,
        memberCount: community.memberCount,
        isJoined: false
      }
    });
  } catch (error) {
    console.error('❌ Error leaving community:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while leaving community'
    });
  }
};

/**
 * @desc    Get posts for a community (Newest first)
 * @route   GET /api/communities/:communityId/posts
 * @access  Public / Private
 */
const getCommunityPosts = async (req, res) => {
  try {
    const { communityId } = req.params;

    const posts = await CommunityPost.find({ community: communityId })
      .populate('user', 'fullName profilePicture email')
      .sort({ createdAt: -1 });

    let likedPostIds = new Set();
    if (req.user && req.user.id) {
      const userLikes = await Like.find({
        user: req.user.id,
        post: { $in: posts.map((p) => p._id) }
      });
      likedPostIds = new Set(userLikes.map((l) => l.post.toString()));
    }

    const formattedPosts = posts.map((post) => {
      const p = post.toObject();
      return {
        ...p,
        isLiked: likedPostIds.has(p._id.toString())
      };
    });

    return res.status(200).json({
      success: true,
      count: formattedPosts.length,
      data: formattedPosts
    });
  } catch (error) {
    console.error('❌ Error fetching community posts:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching community posts'
    });
  }
};

/**
 * @desc    Create a new post in a community
 * @route   POST /api/communities/:communityId/posts
 * @access  Private
 */
const createPost = async (req, res) => {
  try {
    const { communityId } = req.params;
    const userId = req.user.id;
    const { content } = req.body;

    const community = await Community.findById(communityId);
    if (!community) {
      return res.status(404).json({
        success: false,
        message: 'Community not found'
      });
    }

    let imageUrl = req.body.image || '';
    let videoUrl = req.body.video || '';

    // Handle file upload if present
    if (req.file) {
      const uploadedUrl = await uploadToCloudinary(
        req.file.buffer,
        'shesphere_community',
        req.file.mimetype
      );
      if (req.file.mimetype.startsWith('video/')) {
        videoUrl = uploadedUrl;
      } else {
        imageUrl = uploadedUrl;
      }
    }

    if (!content && !imageUrl && !videoUrl) {
      return res.status(400).json({
        success: false,
        message: 'Post must contain text content, image, or video'
      });
    }

    const post = await CommunityPost.create({
      user: userId,
      community: communityId,
      content: content || '',
      image: imageUrl,
      video: videoUrl
    });

    await post.populate('user', 'fullName profilePicture email');

    // Update user stats and log activity
    await User.findByIdAndUpdate(userId, { $inc: { communityDiscussions: 1, xp: 10 } });
    await UserActivity.create({
      user: userId,
      activityType: 'CREATE_POST',
      community: communityId,
      post: post._id
    });

    return res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: {
        ...post.toObject(),
        isLiked: false
      }
    });
  } catch (error) {
    console.error('❌ Error creating community post:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating post'
    });
  }
};

/**
 * @desc    Toggle like / unlike on a post
 * @route   POST /api/communities/posts/:postId/like
 * @access  Private
 */
const toggleLikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const existingLike = await Like.findOne({ user: userId, post: postId });
    let isLiked = false;

    if (existingLike) {
      // Unlike
      await Like.findOneAndDelete({ user: userId, post: postId });
      post.likesCount = Math.max(0, post.likesCount - 1);
      await post.save();

      await UserActivity.create({
        user: userId,
        activityType: 'UNLIKE_POST',
        post: postId,
        community: post.community
      });
    } else {
      // Like
      await Like.create({ user: userId, post: postId });
      post.likesCount += 1;
      await post.save();
      isLiked = true;

      await UserActivity.create({
        user: userId,
        activityType: 'LIKE_POST',
        post: postId,
        community: post.community
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        postId: post._id,
        likesCount: post.likesCount,
        isLiked
      }
    });
  } catch (error) {
    console.error('❌ Error toggling post like:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while liking post'
    });
  }
};

/**
 * @desc    Get comments for a post
 * @route   GET /api/communities/posts/:postId/comments
 * @access  Public / Private
 */
const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ post: postId })
      .populate('user', 'fullName profilePicture email')
      .sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (error) {
    console.error('❌ Error fetching comments:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching comments'
    });
  }
};

/**
 * @desc    Add a comment to a post
 * @route   POST /api/communities/posts/:postId/comments
 * @access  Private
 */
const addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment content cannot be empty'
      });
    }

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = await Comment.create({
      user: userId,
      post: postId,
      content: content.trim()
    });

    post.commentsCount += 1;
    await post.save();

    await comment.populate('user', 'fullName profilePicture email');

    await UserActivity.create({
      user: userId,
      activityType: 'ADD_COMMENT',
      post: postId,
      community: post.community
    });

    return res.status(201).json({
      success: true,
      message: 'Comment added',
      data: comment
    });
  } catch (error) {
    console.error('❌ Error adding comment:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while adding comment'
    });
  }
};

/**
 * @desc    Get user activity feature matrix for K-Means preparation
 * @route   GET /api/communities/analytics/kmeans-features
 * @access  Private
 */
const getKMeansFeatureMatrix = async (req, res) => {
  try {
    const users = await User.find({ isActive: true }).select('fullName email interest xp level communityDiscussions');
    const matrix = await Promise.all(
      users.map(async (u) => {
        const memberships = await CommunityMembership.find({ user: u._id }).populate('community', 'slug');
        const postsCreated = await CommunityPost.countDocuments({ user: u._id });
        const likesGiven = await Like.countDocuments({ user: u._id });
        const commentsGiven = await Comment.countDocuments({ user: u._id });

        return {
          userId: u._id,
          fullName: u.fullName,
          primaryInterest: u.interest,
          joinedCommunities: memberships.map((m) => m.community?.slug).filter(Boolean),
          totalMemberships: memberships.length,
          postsCreated,
          likesGiven,
          commentsGiven,
          communityDiscussions: u.communityDiscussions || 0
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: matrix.length,
      data: matrix
    });
  } catch (error) {
    console.error('❌ Error generating feature matrix:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while generating analytical feature matrix'
    });
  }
};

/**
 * @desc    Update a post (Owner only)
 * @route   PUT /api/communities/posts/:postId
 * @access  Private
 */
const updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    const { content } = req.body;

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Verify ownership
    if (post.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only edit your own posts'
      });
    }

    if (content !== undefined) {
      post.content = content.trim();
    }

    // Handle optional file upload if present
    if (req.file) {
      const uploadedUrl = await uploadToCloudinary(
        req.file.buffer,
        'shesphere_community',
        req.file.mimetype
      );
      if (req.file.mimetype.startsWith('video/')) {
        post.video = uploadedUrl;
        post.image = '';
      } else {
        post.image = uploadedUrl;
        post.video = '';
      }
    }

    await post.save();
    await post.populate('user', 'fullName profilePicture email');

    return res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: post
    });
  } catch (error) {
    console.error('❌ Error updating post:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating post'
    });
  }
};

/**
 * @desc    Delete a post (Owner only)
 * @route   DELETE /api/communities/posts/:postId
 * @access  Private
 */
const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Verify ownership
    if (post.user.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only delete your own posts'
      });
    }

    // Delete post and cleanup likes/comments
    await CommunityPost.findByIdAndDelete(postId);
    await Comment.deleteMany({ post: postId });
    await Like.deleteMany({ post: postId });

    // Decrement user discussions count
    const user = await User.findById(userId);
    if (user && user.communityDiscussions > 0) {
      user.communityDiscussions -= 1;
      await user.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
      data: { postId }
    });
  } catch (error) {
    console.error('❌ Error deleting post:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting post'
    });
  }
};

module.exports = {
  seedCommunities,
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
};
