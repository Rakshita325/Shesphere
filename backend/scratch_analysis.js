const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { fitKMeans, buildUserFeatureVector } = require('./services/ml/kmeansService');
const { calculateTimeCompatibilityScore } = require('./services/ml/timeAwareService');
const { buildInteractionMatrix, calculateUserCosineSimilarity } = require('./services/ml/collaborativeService');
const { getHybridRecommendations, calculateContentBasedScore } = require('./services/ml/hybridRecommendationService');

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/shesphere';

async function runAnalysis() {
  await mongoose.connect(MONGO_URI);
  const db = mongoose.connection.db;

  const users = await db.collection('users').find({}).toArray();
  const videos = await db.collection('videos').find({}).toArray();
  const watchHistories = await db.collection('watchhistories').find({}).toArray();
  const videoLikes = await db.collection('videolikes').find({}).toArray();
  const userActivities = await db.collection('useractivities').find({}).toArray();

  console.log('=== DATASET STATISTICS ===');
  console.log('Users count:', users.length);
  console.log('Videos count:', videos.length);
  console.log('WatchHistories count:', watchHistories.length);
  console.log('VideoLikes count:', videoLikes.length);
  console.log('UserActivities count:', userActivities.length);

  console.log('\n=== USERS DETAILS ===');
  users.forEach(u => {
    console.log(`User ID: ${u._id} | Name: ${u.fullName} | Email: ${u.email} | Cluster: ${u.clusterId} | Interest: ${u.interest} | FreeTime: ${u.dailyFreeTime} | Active: ${u.isActive}`);
  });

  console.log('\n=== WATCH HISTORIES ===');
  watchHistories.forEach(w => {
    console.log(`User: ${w.userId} | Video: ${w.videoId} | Progress: ${w.progressPercentage}% | Completed: ${w.completed}`);
  });

  console.log('\n=== VIDEO LIKES ===');
  videoLikes.forEach(l => {
    console.log(`User: ${l.user} | Video: ${l.video}`);
  });

  const activeUsers = users.filter(u => u.isActive !== false);
  console.log('\n=== K-MEANS EVALUATION ===');
  const vectors = activeUsers.map(u => buildUserFeatureVector(u));
  
  for (let k = 2; k <= Math.min(4, activeUsers.length - 1); k++) {
    const res = fitKMeans(vectors, k);
    
    // Silhouette score calculation
    let silhouetteSum = 0;
    for (let i = 0; i < vectors.length; i++) {
      const clusterI = res.assignments[i];
      let intraDistSum = 0, intraCount = 0;
      for (let j = 0; j < vectors.length; j++) {
        if (i === j) continue;
        if (res.assignments[j] === clusterI) {
          let dist = 0;
          for (let d = 0; d < vectors[i].length; d++) dist += Math.pow(vectors[i][d] - vectors[j][d], 2);
          intraDistSum += Math.sqrt(dist);
          intraCount++;
        }
      }
      const a_i = intraCount > 0 ? intraDistSum / intraCount : 0;

      let minInterDist = Infinity;
      for (let c = 0; c < k; c++) {
        if (c === clusterI) continue;
        let interDistSum = 0, interCount = 0;
        for (let j = 0; j < vectors.length; j++) {
          if (res.assignments[j] === c) {
            let dist = 0;
            for (let d = 0; d < vectors[i].length; d++) dist += Math.pow(vectors[i][d] - vectors[j][d], 2);
            interDistSum += Math.sqrt(dist);
            interCount++;
          }
        }
        const b_c = interCount > 0 ? interDistSum / interCount : Infinity;
        if (b_c < minInterDist) minInterDist = b_c;
      }
      const b_i = minInterDist;
      const s_i = Math.max(a_i, b_i) > 0 ? (b_i - a_i) / Math.max(a_i, b_i) : 0;
      silhouetteSum += s_i;
    }
    const avgSilhouette = silhouetteSum / vectors.length;
    
    const counts = {};
    res.assignments.forEach(a => counts[a] = (counts[a] || 0) + 1);
    console.log(`K=${k} | WCSS: ${res.wcss.toFixed(4)} | Silhouette: ${avgSilhouette.toFixed(4)} | Distribution: ${JSON.stringify(counts)}`);
  }

  console.log('\n=== TIME COMPATIBILITY EVALUATION ===');
  let totalRecs = 0;
  let fitsRecs = 0;
  for (let u of activeUsers) {
    try {
      const rec = await getHybridRecommendations(u._id.toString(), 20);
      const recs = rec.data;
      totalRecs += recs.length;
      const fits = recs.filter(r => r.fitsInTime).length;
      fitsRecs += fits;
      console.log(`User ${u.fullName} (${u.dailyFreeTime}): Recs=${recs.length}, Fits=${fits} (${((fits / recs.length) * 100).toFixed(1)}%)`);
    } catch (e) {
      console.error(`Error for user ${u.fullName}: ${e.message}`);
    }
  }
  console.log(`Overall Time Compatibility Rate: ${fitsRecs} / ${totalRecs} = ${((fitsRecs / totalRecs) * 100).toFixed(2)}%`);

  console.log('\n=== COMPLETED-CONTENT FILTERING VERIFICATION ===');
  for (let u of activeUsers) {
    const userCompletedHist = watchHistories.filter(w => w.userId.toString() === u._id.toString() && (w.completed || w.progressPercentage >= 95));
    const completedVideoIds = new Set(userCompletedHist.map(w => w.videoId.toString()));
    const rec = await getHybridRecommendations(u._id.toString(), 20);
    const recVideoIds = rec.data.map(r => r._id.toString());
    const leaked = recVideoIds.filter(id => completedVideoIds.has(id));
    console.log(`User ${u.fullName}: Completed videos in history=${completedVideoIds.size}, Recommended videos count=${recVideoIds.length}, Leaked completed videos count=${leaked.length}`);
  }

  process.exit(0);
}

runAnalysis().catch(err => {
  console.error(err);
  process.exit(1);
});
