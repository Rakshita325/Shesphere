/**
 * collaborativeService.js
 *
 * Real Collaborative Filtering Engine.
 * 
 * Computes explicit/implicit user interaction scores R(u, v) from real MongoDB collections:
 * - WatchHistory (progressPercentage, completed)
 * - VideoLike (likes)
 * 
 * Computes Cosine similarity between users (with cluster prioritization) and predicts rating
 * for unseen candidate videos. Returns 0 score if user has no interaction history (Cold Start).
 */

const WatchHistory = require('../../models/WatchHistory');
const VideoLike = require('../../models/VideoLike');
const User = require('../../models/User');

/**
 * Calculates implicit interaction score R(u, v) in range [0.0 - 1.0]
 * 
 * R(u, v) = 0.5 * (progressPercentage / 100) + 0.3 * (completed ? 1 : 0) + 0.2 * (isLiked ? 1 : 0)
 */
const calculateInteractionScore = (progressPercentage = 0, completed = false, isLiked = false) => {
  const watchRatio = Math.min(1.0, Math.max(0.0, Number(progressPercentage) / 100));
  const completeBonus = completed ? 1.0 : 0.0;
  const likeBonus = isLiked ? 1.0 : 0.0;

  const score = (0.5 * watchRatio) + (0.3 * completeBonus) + (0.2 * likeBonus);
  return Math.min(1.0, Math.round(score * 100) / 100);
};

/**
 * Builds user-item interaction matrix from MongoDB records
 * @returns {Promise<{ matrix: Map<string, Map<string, number>>, userIds: string[], videoIds: string[] }>}
 */
const buildInteractionMatrix = async () => {
  const historyEntries = await WatchHistory.find({}).lean();
  const likeEntries = await VideoLike.find({}).lean();

  const userVideoLikes = new Set();
  for (const like of likeEntries) {
    userVideoLikes.add(`${like.user.toString()}_${like.video.toString()}`);
  }

  // matrix: Map<userIdStr, Map<videoIdStr, score>>
  const matrix = new Map();
  const allUserIds = new Set();
  const allVideoIds = new Set();

  for (const entry of historyEntries) {
    if (!entry.userId || !entry.videoId) continue;

    const uId = entry.userId.toString();
    const vId = entry.videoId.toString();

    allUserIds.add(uId);
    allVideoIds.add(vId);

    const isLiked = userVideoLikes.has(`${uId}_${vId}`);
    const score = calculateInteractionScore(entry.progressPercentage, entry.completed, isLiked);

    if (!matrix.has(uId)) {
      matrix.set(uId, new Map());
    }
    matrix.get(uId).set(vId, score);
  }

  // Add likes for videos that might not be in WatchHistory
  for (const like of likeEntries) {
    const uId = like.user.toString();
    const vId = like.video.toString();

    allUserIds.add(uId);
    allVideoIds.add(vId);

    if (!matrix.has(uId)) {
      matrix.set(uId, new Map());
    }
    if (!matrix.get(uId).has(vId)) {
      matrix.get(uId).set(vId, calculateInteractionScore(0, false, true));
    }
  }

  return {
    matrix,
    userIds: Array.from(allUserIds),
    videoIdList: Array.from(allVideoIds)
  };
};

/**
 * Calculates Cosine Similarity between 2 users based on item rating vectors
 */
const calculateUserCosineSimilarity = (ratingsA, ratingsB) => {
  if (!ratingsA || !ratingsB || ratingsA.size === 0 || ratingsB.size === 0) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (const [vId, rA] of ratingsA.entries()) {
    normA += rA * rA;
    if (ratingsB.has(vId)) {
      dotProduct += rA * ratingsB.get(vId);
    }
  }

  for (const rB of ratingsB.values()) {
    normB += rB * rB;
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
};

/**
 * Computes Collaborative Filtering predicted score for a candidate video given target user ID.
 *
 * Same-cluster users identified by K-Means receive a base cluster similarity weight (0.50+),
 * allowing same-cluster interactions to surface recommendations even for users with limited or 0 watch history.
 *
 * @param {string} targetUserId
 * @param {string} candidateVideoId
 * @param {Map<string, Map<string, number>>} [prebuiltMatrix]
 * @returns {Promise<number>} Predicted CF score [0.0 - 1.0]
 */
const predictCollaborativeScore = async (targetUserId, candidateVideoId, prebuiltMatrix = null) => {
  try {
    const { matrix } = prebuiltMatrix ? { matrix: prebuiltMatrix } : await buildInteractionMatrix();

    const targetRatings = matrix.get(targetUserId.toString()) || new Map();
    const targetUser = await User.findById(targetUserId).select('_id clusterId').lean();
    const targetClusterId = (targetUser && targetUser.clusterId !== null && targetUser.clusterId !== undefined) ? targetUser.clusterId : null;

    // ─── Batch-fetch cluster IDs for all neighbor users to avoid N+1 queries ───
    const clusterMap = new Map(); // userId -> clusterId
    const neighborIds = [];
    for (const [otherUserId] of matrix.entries()) {
      if (otherUserId !== targetUserId.toString()) {
        neighborIds.push(otherUserId);
      }
    }
    if (neighborIds.length > 0) {
      const neighbors = await User.find({ _id: { $in: neighborIds } }).select('_id clusterId').lean();
      for (const n of neighbors) {
        if (n.clusterId !== null && n.clusterId !== undefined) {
          clusterMap.set(n._id.toString(), n.clusterId);
        }
      }
    }

    let totalWeight = 0;
    let weightedScoreSum = 0;

    for (const [otherUserId, otherRatings] of matrix.entries()) {
      if (otherUserId === targetUserId.toString()) continue;
      if (!otherRatings.has(candidateVideoId.toString())) continue;

      const cosineSim = calculateUserCosineSimilarity(targetRatings, otherRatings);
      const otherClusterId = clusterMap.get(otherUserId);
      const isSameCluster = (targetClusterId !== null && otherClusterId !== undefined && targetClusterId === otherClusterId);

      // Same-cluster users are identified as similar users!
      let sim = 0;
      if (isSameCluster) {
        sim = cosineSim > 0 ? Math.min(1.0, 0.50 + (0.50 * cosineSim)) : 0.50;
      } else {
        sim = cosineSim;
      }

      if (sim > 0.05) {
        const otherRating = otherRatings.get(candidateVideoId.toString());
        weightedScoreSum += sim * otherRating;
        totalWeight += sim;
      }
    }

    if (totalWeight === 0) return 0.0;

    const predicted = weightedScoreSum / totalWeight;
    return Math.min(1.0, Math.round(predicted * 100) / 100);

  } catch (error) {
    console.error('❌ Error in predictCollaborativeScore:', error);
    return 0.0;
  }
};

module.exports = {
  calculateInteractionScore,
  buildInteractionMatrix,
  calculateUserCosineSimilarity,
  predictCollaborativeScore
};
