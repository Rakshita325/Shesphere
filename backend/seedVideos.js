require('dotenv').config();
const mongoose = require('mongoose');
const yts = require('yt-search');
const Video = require('./models/Video');

// Connect to your MongoDB instance
mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shesphere')
  .then(() => console.log('MongoDB Connected successfully!'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Mapping your 8 UI categories to realistic search queries & subcategories/tags
const categoryQueries = {
  'Cooking': {
    query: 'easy eggless baking recipes tutorial hindi',
    subcategory: 'Snacks',
    tags: ['snacks', 'quick snacks', 'Indian snacks', 'baking', 'evening snacks']
  },
  'Arts & Crafts': {
    query: 'diy handmade home decor crafts beginner',
    subcategory: 'Home Decor',
    tags: ['crafts', 'diy', 'home decor', 'paper craft', 'beginner craft']
  },
  'Gardening': {
    query: 'terrace garden tips for beginners indoor plants',
    subcategory: 'Indoor Plants',
    tags: ['gardening', 'terrace garden', 'indoor plants', 'organic garden', 'composting']
  },
  'Sewing & Fashion': {
    query: 'blouse cutting and stitching tutorial beginners',
    subcategory: 'Stitching',
    tags: ['sewing', 'stitching', 'blouse cutting', 'fashion design', 'tailoring']
  },
  'Digital Skills': {
    query: 'smartphone safety and digital payments tutorial',
    subcategory: 'Smartphone Basics',
    tags: ['digital skills', 'smartphone', 'upi safety', 'online safety', 'tech tips']
  },
  'Health & Fitness': {
    query: 'simple home morning yoga for women',
    subcategory: 'Yoga',
    tags: ['yoga', 'home workout', 'fitness', 'wellness', 'morning routine']
  },
  'Music & Instruments': {
    query: 'learn basic harmonium lesson 1',
    subcategory: 'Harmonium',
    tags: ['music', 'harmonium', 'singing', 'music lessons', 'instruments']
  },
  'Skincare': {
    query: 'natural glowing skincare home remedies',
    subcategory: 'Home Remedies',
    tags: ['skincare', 'natural skincare', 'glowing skin', 'face mask', 'beauty']
  }
};

async function seedDatabase() {
  try {
    console.log('🚀 Starting Data Ingestion into MongoDB...\n');

    for (const [category, meta] of Object.entries(categoryQueries)) {
      console.log(`🔍 Searching videos for category: "${category}"...`);

      const searchResult = await yts(meta.query);
      const videosFound = searchResult.videos.slice(0, 25);

      let insertedCount = 0;

      for (const video of videosFound) {
        await Video.updateOne(
          { youtubeId: video.videoId },
          {
            $set: {
              youtubeId: video.videoId,
              title: video.title,
              category: category,
              subcategory: meta.subcategory,
              tags: meta.tags,
              thumbnail: video.thumbnail,
              duration: video.seconds || 600,
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

    console.log('\n🎉 Database Seeding Complete! All 8 categories are now enriched in MongoDB.');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error Seeding Database:', error);
    process.exit(1);
  }
}

seedDatabase();