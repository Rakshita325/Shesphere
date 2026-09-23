/**
 * kmeansService.js
 *
 * Real ML K-Means User Clustering Engine.
 * 
 * Features:
 * - Feature vector extraction from real User fields
 * - K-Means++ initialization to prevent poor initial seed placement
 * - Lloyd's iteration algorithm for convergence
 * - Elbow method (WCSS evaluation) to select optimal K dynamically
 * - Graceful fallback when user dataset size is small (< 3 users)
 */

const User = require('../../models/User');

const CORE_INTERESTS = [
  'cooking',
  'arts_crafts',
  'gardening',
  'sewing_fashion',
  'digital_skills',
  'health_fitness',
  'music_instruments',
  'skincare'
];

/**
 * Normalizes user interest string to core key
 */
const normalizeInterestKey = (interestStr) => {
  if (!interestStr) return '';
  const lower = interestStr.toLowerCase().trim();
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
 * Normalizes user language string to standard key ('english', 'hindi', 'kannada')
 */
const normalizeLanguage = (langStr) => {
  if (!langStr) return 'english';
  const lower = langStr.toString().toLowerCase().trim();
  if (lower.includes('en')) return 'english';
  if (lower.includes('hi')) return 'hindi';
  if (lower.includes('kn') || lower.includes('kan')) return 'kannada';
  return lower;
};

/**
 * Encodes education level to ordinal numeric value [0.0 - 1.0]
 */
const encodeEducation = (edu) => {
  if (!edu) return 0.2;
  const str = edu.toLowerCase();
  if (str.includes('phd') || str.includes('doctor')) return 1.0;
  if (str.includes('master')) return 0.8;
  if (str.includes('bachelor') || str.includes('degree')) return 0.6;
  if (str.includes('high') || str.includes('school')) return 0.4;
  return 0.2;
};

/**
 * Encodes dailyFreeTime to normalized numeric value [0.25 - 1.0]
 */
const encodeFreeTime = (timeStr) => {
  if (!timeStr) return 0.5;
  const str = timeStr.toString().toLowerCase().trim();
  if (str.includes('15') || str.includes('under_1')) return 0.25;
  if (str.includes('30') || str.includes('1_to_2')) return 0.5;
  if (str.includes('45') || str.includes('2_to_4')) return 0.75;
  if (str.includes('1 hour') || str.includes('1h') || str.includes('over_4')) return 1.0;
  return 0.5;
};

/**
 * Constructs numerical feature vector from real user document fields
 * @param {Object} user 
 * @returns {number[]} Feature vector
 */
const buildUserFeatureVector = (user) => {
  // 1. One-hot interest encoding (8 dims)
  const userInterest = normalizeInterestKey(user.interest);
  const interestVector = CORE_INTERESTS.map(k => (k === userInterest ? 1.0 : 0.0));

  // 2. Demographic features
  const ageNorm = Math.min(1.0, Math.max(0.0, (Number(user.age) || 25) / 100));
  const eduScore = encodeEducation(user.education);
  const freeTimeScore = encodeFreeTime(user.dailyFreeTime);

  // 3. Language one-hot (3 dims: english, hindi, kannada)
  const lang = normalizeLanguage(user.language);
  const langVector = [
    lang.includes('english') ? 1.0 : 0.0,
    lang.includes('hindi') ? 1.0 : 0.0,
    lang.includes('kannada') ? 1.0 : 0.0
  ];

  // 4. Real learning activity metrics (normalized)
  const vWatched = Math.min(1.0, (user.videosWatched || 0) / 50);
  const learnMins = Math.min(1.0, (user.learningTimeMinutes || 0) / 600);
  const xpNorm = Math.min(1.0, (user.xp || 0) / 1000);
  const discussions = Math.min(1.0, (user.communityDiscussions || 0) / 20);

  return [
    ...interestVector, // 8
    ageNorm,           // 1
    eduScore,          // 1
    freeTimeScore,     // 1
    ...langVector,     // 3
    vWatched,          // 1
    learnMins,         // 1
    xpNorm,            // 1
    discussions        // 1
  ]; // Total 18 dimensions
};

/**
 * Euclidean distance between 2 vectors
 */
const euclideanDistance = (v1, v2) => {
  let sum = 0;
  for (let i = 0; i < v1.length; i++) {
    const diff = v1[i] - v2[i];
    sum += diff * diff;
  }
  return Math.sqrt(sum);
};

/**
 * K-Means++ Centroid Initialization
 */
const initializeCentroidsKMeansPlusPlus = (vectors, k) => {
  const centroids = [];
  const n = vectors.length;

  // 1. Pick first centroid uniformly at random
  const firstIdx = Math.floor(Math.random() * n);
  centroids.push([...vectors[firstIdx]]);

  // 2. Pick remaining k-1 centroids
  for (let c = 1; c < k; c++) {
    const distances = vectors.map(vec => {
      let minDist = Infinity;
      for (const centroid of centroids) {
        const d = euclideanDistance(vec, centroid);
        if (d < minDist) minDist = d;
      }
      return minDist * minDist; // D(x)^2
    });

    const sumDistances = distances.reduce((a, b) => a + b, 0);
    if (sumDistances === 0) {
      // Fallback if all points identical
      centroids.push([...vectors[c % n]]);
      continue;
    }

    let target = Math.random() * sumDistances;
    let chosenIdx = 0;
    for (let i = 0; i < n; i++) {
      target -= distances[i];
      if (target <= 0) {
        chosenIdx = i;
        break;
      }
    }
    centroids.push([...vectors[chosenIdx]]);
  }

  return centroids;
};

/**
 * Standard K-Means Lloyd algorithm
 */
const fitKMeans = (vectors, k, maxIterations = 50) => {
  if (vectors.length < k) {
    throw new Error(`Dataset size (${vectors.length}) is smaller than K (${k})`);
  }

  let centroids = initializeCentroidsKMeansPlusPlus(vectors, k);
  let assignments = new Array(vectors.length).fill(0);
  let converged = false;
  let iter = 0;

  while (!converged && iter < maxIterations) {
    iter++;
    let changed = false;

    // Assignment step
    for (let i = 0; i < vectors.length; i++) {
      let minD = Infinity;
      let closestCluster = 0;
      for (let c = 0; c < k; c++) {
        const d = euclideanDistance(vectors[i], centroids[c]);
        if (d < minD) {
          minD = d;
          closestCluster = c;
        }
      }
      if (assignments[i] !== closestCluster) {
        assignments[i] = closestCluster;
        changed = true;
      }
    }

    if (!changed) {
      converged = true;
      break;
    }

    // Update step
    const dim = vectors[0].length;
    const newCentroids = Array.from({ length: k }, () => new Array(dim).fill(0));
    const counts = new Array(k).fill(0);

    for (let i = 0; i < vectors.length; i++) {
      const c = assignments[i];
      counts[c]++;
      for (let d = 0; d < dim; d++) {
        newCentroids[c][d] += vectors[i][d];
      }
    }

    for (let c = 0; c < k; c++) {
      if (counts[c] > 0) {
        for (let d = 0; d < dim; d++) {
          newCentroids[c][d] /= counts[c];
        }
      } else {
        // Re-initialize empty cluster centroid
        newCentroids[c] = [...vectors[Math.floor(Math.random() * vectors.length)]];
      }
    }

    centroids = newCentroids;
  }

  // Calculate WCSS (Within-Cluster Sum of Squares)
  let wcss = 0;
  for (let i = 0; i < vectors.length; i++) {
    const c = assignments[i];
    const d = euclideanDistance(vectors[i], centroids[c]);
    wcss += d * d;
  }

  return { centroids, assignments, wcss };
};

/**
 * Determines optimal K using Elbow Method (evaluating WCSS drop)
 */
const selectOptimalK = (vectors, maxK = 5) => {
  const n = vectors.length;
  if (n <= 2) return 2;

  const upperLimit = Math.min(maxK, n - 1);
  if (upperLimit < 2) return 2;

  let bestK = 2;
  let maxDropRatio = -1;

  let prevWcss = null;

  for (let k = 2; k <= upperLimit; k++) {
    const { wcss } = fitKMeans(vectors, k);
    if (prevWcss !== null && prevWcss > 0) {
      const dropRatio = (prevWcss - wcss) / prevWcss;
      if (dropRatio > maxDropRatio) {
        maxDropRatio = dropRatio;
        bestK = k;
      }
    }
    prevWcss = wcss;
  }

  return bestK;
};

/**
 * Trains K-Means on active users in MongoDB and updates clusterId
 */
const trainAndClusterUsers = async () => {
  try {
    const users = await User.find({ isActive: true });
    if (!users || users.length < 3) {
      console.log('ℹ️ K-Means: Insufficient user dataset (<3 users). Skipping clustering update.');
      return { success: false, message: 'Insufficient users for clustering' };
    }

    const vectors = users.map(u => buildUserFeatureVector(u));
    const k = selectOptimalK(vectors, 4);

    const { centroids, assignments } = fitKMeans(vectors, k);

    // Save cluster assignments to MongoDB User model
    const now = new Date();
    const bulkOps = users.map((u, i) => ({
      updateOne: {
        filter: { _id: u._id },
        update: { $set: { clusterId: assignments[i], lastClusteredAt: now } }
      }
    }));

    await User.bulkWrite(bulkOps);

    console.log(`✅ K-Means Trained successfully: Clustered ${users.length} users into ${k} clusters.`);

    // ─── DEBUG VERIFICATION LOGGING (read-only — no algorithm changes) ───────
    // Group users by their newly assigned clusterId for easy visual verification.
    const clusterGroups = {};
    for (let i = 0; i < users.length; i++) {
      const clusterId = assignments[i];
      if (!clusterGroups[clusterId]) clusterGroups[clusterId] = [];
      clusterGroups[clusterId].push({ user: users[i], clusterId });
    }

    console.log('\n========== K-MEANS CLUSTER RESULTS ==========');
    console.log(`Total active users: ${users.length}`);
    console.log(`Selected K / Total clusters: ${k}`);
    console.log('');

    for (let c = 0; c < k; c++) {
      const group = clusterGroups[c] || [];
      console.log(`Cluster ${c} (${group.length} user${group.length !== 1 ? 's' : ''}):`);
      for (const { user, clusterId } of group) {
        console.log(
          `  - ${user.fullName || 'Unknown'}` +
          ` | Interest: ${user.interest || 'None'}` +
          ` | Free Time: ${user.dailyFreeTime || 'Not set'}` +
          ` | Age: ${user.age || 'N/A'}` +
          ` | Education: ${user.education || 'N/A'}` +
          ` | Language: ${user.language || 'N/A'}` +
          ` | Cluster: ${clusterId}`
        );
      }
      console.log('');
    }

    console.log('=============================================');
    console.log('Cluster distribution:');
    for (let c = 0; c < k; c++) {
      const count = (clusterGroups[c] || []).length;
      console.log(`  Cluster ${c} -> ${count} user${count !== 1 ? 's' : ''}`);
    }
    console.log(`  Total -> ${users.length} users`);
    console.log('=============================================\n');
    // ─────────────────────────────────────────────────────────────────────────

    return {
      success: true,
      k,
      userCount: users.length,
      centroids
    };
  } catch (error) {
    console.error('❌ Error training K-Means:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Find users belonging to the same cluster as target user
 */
const getClusterNeighbors = async (userId) => {
  try {
    const user = await User.findById(userId);
    if (!user || user.clusterId === null || user.clusterId === undefined) {
      return [];
    }

    const neighbors = await User.find({
      _id: { $ne: userId },
      clusterId: user.clusterId,
      isActive: true
    }).select('fullName email interest age education occupation dailyFreeTime profilePicture xp level');

    return neighbors;
  } catch (error) {
    console.error('❌ Error fetching cluster neighbors:', error);
    return [];
  }
};

module.exports = {
  normalizeLanguage,
  buildUserFeatureVector,
  euclideanDistance,
  fitKMeans,
  selectOptimalK,
  trainAndClusterUsers,
  getClusterNeighbors
};
