require('dotenv').config();
const mongoose = require('mongoose');
const yts = require('yt-search');
const Video = require('./models/Video'); // Adjust path to your model

// Connect to your MongoDB instance
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shesphere')
  .then(() => console.log('MongoDB Connected successfully!'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Mapping your 8 UI categories to realistic search queries
const categoryQueries = {
  'Cooking': 'easy eggless baking recipes tutorial hindi',
  'Arts & Crafts': 'diy handmade home decor crafts beginner',
  'Gardening': 'terrace garden tips for beginners indoor plants',
  'Sewing & Fashion': 'blouse cutting and stitching tutorial beginners',
  'Digital Skills': 'smartphone safety and digital payments tutorial',
  'Health & Fitness': 'simple home morning yoga for women',
  'Music & Instruments': 'learn basic harmonium lesson 1',
  'Skincare': 'natural glowing skincare home remedies'
};

async function seedDatabase() {
  try {
    console.log('🚀 Starting Data Ingestion into MongoDB...\n');

    for (const [category, query] of Object.entries(categoryQueries)) {
      console.log(`🔍 Searching videos for category: "${category}"...`);

      // Perform quota-free search using yt-search
      const searchResult = await yts(query);
      const videosFound = searchResult.videos.slice(0, 25); // Grab top 25 videos per category

      let insertedCount = 0;

      for (const video of videosFound) {
        // Upsert ensures we update existing records or insert new ones without throwing duplicate key errors
        await Video.updateOne(
          { youtubeId: video.videoId },
          {
            $set: {
              youtubeId: video.videoId,
              title: video.title,
              category: category,
              thumbnail: video.thumbnail,
              views: video.views,
              language: 'hi'
            }
          },
          { upsert: true }
        );
        insertedCount++;
      }

      console.log(`✅ Saved ${insertedCount} videos under "${category}"`);
    }

    console.log('\n🎉 Database Seeding Complete! All 8 categories are now stored in MongoDB.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error Seeding Database:', error);
    process.exit(1);
  }
}

// Run the script
seedDatabase();