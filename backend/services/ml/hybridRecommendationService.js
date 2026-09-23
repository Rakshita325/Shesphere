/**
 * hybridRecommendationService.js
 * 
 * Unified Hybrid Recommendation Engine for SheSphere.
 * 
 * Combines:
 * 1. Content-Based Filtering (Category, Subcategory, Tag matching score)
 * 2. Time-Aware Recommendation (Duration fit against dailyFreeTime)
 * 3. Collaborative Filtering (Same-Cluster membership + Cosine rating similarity)
 * 
 * Merges Content-Based and Collaborative candidates into a single deduplicated pool
 * while excluding videos already completed or watched by the current user.
 */

const Video = require('../../models/Video');
const User = require('../../models/User');
const WatchHistory = require('../../models/WatchHistory');
const VideoLike = require('../../models/VideoLike');
const { calculateTimeCompatibilityScore } = require('./timeAwareService');
const { predictCollaborativeScore, buildInteractionMatrix, calculateUserCosineSimilarity } = require('./collaborativeService');
const { normalizeLanguage } = require('./kmeansService');

const INTEREST_TO_CATEGORY_MAP = {
  'cooking': 'Cooking',
  'Cooking': 'Cooking',
  'arts_crafts': 'Arts & Crafts',
  'art_craft': 'Arts & Crafts',
  'Arts & Crafts': 'Arts & Crafts',
  'Art & Craft': 'Arts & Crafts',
  'gardening': 'Gardening',
  'Gardening': 'Gardening',
  'sewing_fashion': 'Sewing & Fashion',
  'Sewing & Fashion': 'Sewing & Fashion',
  'digital_skills': 'Digital Skills',
  'digital_design': 'Digital Skills',
  'Digital Skills': 'Digital Skills',
  'Digital Design': 'Digital Skills',
  'health_fitness': 'Health & Fitness',
  'Health & Fitness': 'Health & Fitness',
  'music_instruments': 'Music & Instruments',
  'Music & Instruments': 'Music & Instruments',
  'skincare': 'Skincare',
  'skin_care': 'Skincare',
  'Skincare': 'Skincare',
  'Skin Care': 'Skincare'
};

/**
 * Calculates Content-Based similarity score [0.0 - 1.0]
 */
const calculateContentBasedScore = (video, targetCategory, watchedMeta) => {
  let score = 0;

  // Category match (+0.5)
  if (targetCategory && video.category === targetCategory) {
    score += 0.5;
  }

  // Subcategory match (+0.3)
  if (video.subcategory && watchedMeta && watchedMeta.subcategories.has(video.subcategory)) {
    score += 0.3;
  }

  // Tag overlap (+0.2)
  if (video.tags && video.tags.length > 0 && watchedMeta && watchedMeta.tags) {
    for (const tag of video.tags) {
      if (watchedMeta.tags.has(tag.toLowerCase())) {
        score += 0.1;
      }
    }
  }

  return Math.min(1.0, score);
};

/**
 * Gets hybrid video recommendations for a given user ID
 * 
 * @param {string} userId - User ObjectId string
 * @param {number} limit - Number of recommendations to return
 * @returns {Promise<Object>} Recommendation payload
 */
const getHybridRecommendations = async (userId, limit = 20) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const userInterest = user.interest;
    const userFreeTime = user.dailyFreeTime;
    const targetCategory = userInterest ? (INTEREST_TO_CATEGORY_MAP[userInterest] || userInterest) : null;
    const userLang = normalizeLanguage(user.language);

    // 1. Fetch current user watch history & likes
    const userHistory = await WatchHistory.find({ userId }).populate('videoId').lean();
    const userLikes = await VideoLike.find({ user: userId }).lean();

    // Collect completed or watched video IDs for exclusion
    const excludedVideoIds = new Set();
    const watchedMeta = {
      subcategories: new Set(),
      tags: new Set()
    };

    for (const entry of userHistory) {
      if (!entry.videoId) continue;
      const vIdStr = entry.videoId._id ? entry.videoId._id.toString() : entry.videoId.toString();

      // Exclude completed or heavily watched videos from current user's recommendations
      if (entry.completed || entry.progressPercentage >= 95) {
        excludedVideoIds.add(vIdStr);
      }

      if (entry.videoId.subcategory) watchedMeta.subcategories.add(entry.videoId.subcategory);
      if (entry.videoId.tags) entry.videoId.tags.forEach(t => watchedMeta.tags.add(t.toLowerCase()));
    }

    // 2. Prebuild interaction matrix for Collaborative Filtering
    const interactionMatrixData = await buildInteractionMatrix();

    // 3. Find Same-Cluster and Similar Users for Collaborative Candidates
    const targetRatings = interactionMatrixData.matrix.get(userId.toString()) || new Map();
    const allUserIdsInMatrix = Array.from(interactionMatrixData.matrix.keys()).filter(id => id !== userId.toString());

    let sameClusterUsers = [];
    if (user.clusterId !== null && user.clusterId !== undefined) {
      sameClusterUsers = await User.find({
        _id: { $ne: userId },
        clusterId: user.clusterId,
        isActive: true
      }).select('_id fullName clusterId language').lean();
    }

    const matrixUserDocs = await User.find({ _id: { $in: allUserIdsInMatrix } }).select('_id fullName clusterId language').lean();
    const allUserDocMap = new Map();
    matrixUserDocs.forEach(u => allUserDocMap.set(u._id.toString(), u));
    sameClusterUsers.forEach(u => allUserDocMap.set(u._id.toString(), u));

    const collaborativeUsers = [];
    for (const [uId, uDoc] of allUserDocMap.entries()) {
      const otherRatings = interactionMatrixData.matrix.get(uId);
      const cosineSim = calculateUserCosineSimilarity(targetRatings, otherRatings);
      const isSameCluster = (user.clusterId !== null && user.clusterId !== undefined && uDoc.clusterId !== null && uDoc.clusterId !== undefined && user.clusterId === uDoc.clusterId);

      if (isSameCluster || cosineSim > 0.05) {
        collaborativeUsers.push({
          userId: uDoc._id.toString(),
          name: uDoc.fullName || 'Unknown',
          clusterId: uDoc.clusterId !== null && uDoc.clusterId !== undefined ? uDoc.clusterId : 'None'
        });
      }
    }

    // 4. Collect Collaborative Candidate Video IDs
    const collabUserIds = collaborativeUsers.map(u => u.userId);
    let collabWatchHistory = [];
    let collabLikes = [];
    if (collabUserIds.length > 0) {
      collabWatchHistory = await WatchHistory.find({ userId: { $in: collabUserIds } }).lean();
      collabLikes = await VideoLike.find({ user: { $in: collabUserIds } }).lean();
    }

    const collabVideoIdSet = new Set();
    const videoInteractionsMap = new Map(); // videoId -> array of { userName, type }

    for (const wh of collabWatchHistory) {
      if (!wh.videoId) continue;
      const vId = wh.videoId.toString();
      const userObj = collaborativeUsers.find(u => u.userId === wh.userId.toString());
      if (!userObj) continue;

      collabVideoIdSet.add(vId);

      if (!videoInteractionsMap.has(vId)) {
        videoInteractionsMap.set(vId, []);
      }
      const list = videoInteractionsMap.get(vId);
      if (wh.completed || wh.progressPercentage >= 95) {
        list.push({ userName: userObj.name, type: 'Completed' });
      } else if (wh.progressPercentage > 0) {
        list.push({ userName: userObj.name, type: 'Watched' });
      }
    }

    for (const lk of collabLikes) {
      if (!lk.video) continue;
      const vId = lk.video.toString();
      const userObj = collaborativeUsers.find(u => u.userId === lk.user.toString());
      if (!userObj) continue;

      collabVideoIdSet.add(vId);

      if (!videoInteractionsMap.has(vId)) {
        videoInteractionsMap.set(vId, []);
      }
      videoInteractionsMap.get(vId).push({ userName: userObj.name, type: 'Liked' });
    }

    // 5. MERGE CANDIDATE POOL (Content Candidates + Collaborative Candidates)
    const contentQuery = targetCategory ? { category: targetCategory } : {};
    const contentCandidates = await Video.find(contentQuery).lean();
    const collabCandidates = collabVideoIdSet.size > 0
      ? await Video.find({ _id: { $in: Array.from(collabVideoIdSet) } }).lean()
      : [];

    const candidateMap = new Map();
    for (const v of contentCandidates) {
      const vId = v._id.toString();
      if (!excludedVideoIds.has(vId)) {
        candidateMap.set(vId, v);
      }
    }
    for (const v of collabCandidates) {
      const vId = v._id.toString();
      if (!excludedVideoIds.has(vId)) {
        candidateMap.set(vId, v);
      }
    }

    const mergedCandidates = Array.from(candidateMap.values());

    // 6. Compute Hybrid Scores for Merged Candidates
    let scoredCandidates = await Promise.all(
      mergedCandidates.map(async (video) => {
        const videoIdStr = video._id.toString();

        // A. Content-Based Score
        const cbScore = calculateContentBasedScore(video, targetCategory, watchedMeta);

        // B. Time-Aware Score
        const videoDuration = Number(video.duration) || 600;
        const timeScore = calculateTimeCompatibilityScore(videoDuration, userFreeTime);

        // C. Collaborative Filtering Score
        const cfScore = await predictCollaborativeScore(userId, videoIdStr, interactionMatrixData.matrix);

        // Hybrid Combination Weights
        let finalScore = 0;
        if (cfScore > 0) {
          finalScore = (0.30 * cbScore) + (0.45 * cfScore) + (0.25 * timeScore);
        } else {
          finalScore = (0.50 * cbScore) + (0.50 * timeScore);
        }

        const scoreRounded = Math.round(finalScore * 100) / 100;
        const fitsInTime = videoDuration > 0 && timeScore >= 0.7;
        const isCollaborative = cfScore > 0;

        return {
          ...video,
          duration: videoDuration,
          matchScore: Math.round(scoreRounded * 100), // Match percentage [0-100%]
          cbScore,
          cfScore,
          timeScore,
          finalScore: scoreRounded,
          fitsInTime,
          timeBadge: fitsInTime ? `Fits your ${userFreeTime || '30m'} window` : null,
          isCollaborative,
          recommendationSource: isCollaborative ? 'collaborative' : 'content'
        };
      })
    );

    // Sort candidates by final Hybrid Match Score descending
    scoredCandidates.sort((a, b) => b.matchScore - a.matchScore);

    // ─── DEBUG MODE FIRST VIDEO RULE ───
    // If one or more videos have CollaborativeScore > 0, select the highest CollaborativeScore video and place it at index 0.
    const collabCandidatesList = scoredCandidates.filter(v => v.cfScore > 0);
    if (collabCandidatesList.length > 0) {
      collabCandidatesList.sort((a, b) => b.cfScore - a.cfScore);
      const topCollabVideo = collabCandidatesList[0];
      const remainingCandidates = scoredCandidates.filter(v => v._id.toString() !== topCollabVideo._id.toString());
      scoredCandidates = [topCollabVideo, ...remainingCandidates];
    }

    const result = scoredCandidates.slice(0, limit);

    // ─── [COLLAB TEST] BACKEND DEBUG LOGGING ───
    console.log('\n========================================================');
    console.log('[COLLAB TEST]');
    console.log('========================================================');
    console.log(`Current user: ${user.fullName || 'Unknown'}`);
    console.log(`Current user cluster: ${user.clusterId !== null && user.clusterId !== undefined ? user.clusterId : 'None'}\n`);

    const firstVideo = result[0];
    if (firstVideo && firstVideo.cfScore > 0) {
      const vId = firstVideo._id.toString();
      const interactions = videoInteractionsMap.get(vId) || [];
      const primaryInter = interactions[0] || {};
      console.log('Collaborative video:');
      console.log(`Video ID: ${vId}`);
      console.log(`Video title: ${firstVideo.title}\n`);

      console.log('Similar user:');
      console.log(`Similar user: ${primaryInter.userName || 'Cluster Neighbor'}`);
      console.log(`Similar user cluster: ${user.clusterId}\n`);

      console.log('Interaction:');
      console.log(`watched: ${interactions.some(i => i.type === 'Watched' || i.type === 'Completed')}`);
      console.log(`completed: ${interactions.some(i => i.type === 'Completed')}`);
      console.log(`liked: ${interactions.some(i => i.type === 'Liked')}\n`);

      console.log(`CollaborativeScore: ${firstVideo.cfScore.toFixed(2)}`);
      console.log(`ContentScore: ${firstVideo.cbScore.toFixed(2)}`);
      console.log(`TimeScore: ${firstVideo.timeScore.toFixed(2)}`);
      console.log(`FinalHybridScore: ${(firstVideo.matchScore / 100).toFixed(2)}\n`);
    } else {
      console.log('No collaborative recommendation video found at index 0.\n');
    }

    console.log('[CF DEBUG]');
    console.log(`Current User: ${user.fullName || 'Unknown'}`);
    console.log(`Current User ID: ${user._id}`);
    console.log(`Current Cluster: ${user.clusterId !== null && user.clusterId !== undefined ? user.clusterId : 'None'}\n`);

    console.log('Similar Users:');
    if (collaborativeUsers.length === 0) {
      console.log('- None');
    } else {
      collaborativeUsers.forEach(cu => {
        console.log(`- ${cu.name} / ID: ${cu.userId} / Cluster: ${cu.clusterId}`);
      });
    }
    console.log('');

    console.log('[HYBRID DEBUG]');
    result.forEach(v => {
      console.log(`Video: ${v.title}`);
      console.log(`  ContentScore: ${v.cbScore.toFixed(2)}`);
      console.log(`  CollaborativeScore: ${v.cfScore.toFixed(2)}`);
      console.log(`  TimeScore: ${v.timeScore.toFixed(2)}`);
      console.log(`  FinalHybridScore: ${(v.matchScore / 100).toFixed(2)}\n`);
    });

    console.log('========================================================\n');

    return {
      success: true,
      count: result.length,
      userInterest: userInterest || 'None selected',
      matchedCategory: targetCategory || 'All',
      userFreeTime: userFreeTime || 'Not set',
      isColdStart: false,
      data: result
    };

  } catch (error) {
    console.error('❌ Error in getHybridRecommendations:', error);
    throw error;
  }
};

module.exports = {
  getHybridRecommendations,
  calculateContentBasedScore
};
