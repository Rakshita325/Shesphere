require('dotenv').config();
const mongoose = require('mongoose');
const yts = require('yt-search');
const Video = require('./models/Video');

// Connect to MongoDB instance
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shesphere';

// Helper: Convert language code to language name
function getLanguageName(languageCode) {
  switch (languageCode.toLowerCase()) {
    case 'en':
      return 'English';
    case 'hi':
      return 'Hindi';
    case 'kn':
      return 'Kannada';
    default:
      return 'English';
  }
}

// Helper: Get duration category label
function getDurationCategory(seconds) {
  if (!seconds || seconds <= 0) return null;
  if (seconds <= 900) return '15 min';
  if (seconds <= 1800) return '30 min';
  if (seconds <= 2700) return '45 min';
  if (seconds <= 3600) return '1 hour';
  return null; // > 60 min rejected
}

// Category & Subcategory configuration with language-specific search queries
const categoryConfig = {
  'Cooking': {
    subcategories: [
      {
        name: 'Breakfast',
        queries: {
          en: 'easy breakfast recipes tutorial',
          hi: 'easy breakfast recipes hindi',
          kn: 'easy breakfast recipes kannada'
        }
      },
      {
        name: 'Snacks',
        queries: {
          en: 'quick evening snacks recipes',
          hi: 'quick evening snacks recipes hindi',
          kn: 'quick evening snacks recipes kannada'
        }
      },
      {
        name: 'Baking',
        queries: {
          en: 'easy eggless baking cake tutorial',
          hi: 'easy eggless baking cake tutorial hindi',
          kn: 'easy eggless baking cake tutorial kannada'
        }
      },
      {
        name: 'Indian Recipes',
        queries: {
          en: 'simple authentic indian dish recipe',
          hi: 'simple authentic indian dish recipe hindi',
          kn: 'simple authentic indian dish recipe kannada'
        }
      }
    ]
  },
  'Arts & Crafts': {
    subcategories: [
      {
        name: 'Paper Crafts',
        queries: {
          en: 'easy paper craft tutorial for beginners',
          hi: 'easy paper craft tutorial hindi',
          kn: 'easy paper craft tutorial kannada'
        }
      },
      {
        name: 'Home Decor',
        queries: {
          en: 'diy handmade home decor crafts',
          hi: 'diy handmade home decor crafts hindi',
          kn: 'diy handmade home decor crafts kannada'
        }
      },
      {
        name: 'Painting',
        queries: {
          en: 'acrylic canvas painting tutorial for beginners',
          hi: 'acrylic canvas painting tutorial hindi',
          kn: 'acrylic canvas painting tutorial kannada'
        }
      },
      {
        name: 'DIY Crafts',
        queries: {
          en: 'creative waste material craft ideas',
          hi: 'creative waste material craft ideas hindi',
          kn: 'creative waste material craft ideas kannada'
        }
      }
    ]
  },
  'Gardening': {
    subcategories: [
      {
        name: 'Indoor Plants',
        queries: {
          en: 'indoor plants gardening care beginners',
          hi: 'indoor plants gardening hindi',
          kn: 'indoor plants gardening kannada'
        }
      },
      {
        name: 'Terrace Gardening',
        queries: {
          en: 'terrace vegetable garden setup tips',
          hi: 'terrace vegetable garden setup hindi',
          kn: 'terrace vegetable garden setup kannada'
        }
      },
      {
        name: 'Organic Gardening',
        queries: {
          en: 'organic fertilizer homemade gardening tips',
          hi: 'organic fertilizer homemade gardening hindi',
          kn: 'organic fertilizer homemade gardening kannada'
        }
      },
      {
        name: 'Composting',
        queries: {
          en: 'kitchen waste composting at home tutorial',
          hi: 'kitchen waste composting at home hindi',
          kn: 'kitchen waste composting at home kannada'
        }
      }
    ]
  },
  'Sewing & Fashion': {
    subcategories: [
      {
        name: 'Stitching',
        queries: {
          en: 'basic stitching tutorial for beginners',
          hi: 'basic stitching tutorial hindi',
          kn: 'basic stitching tutorial kannada'
        }
      },
      {
        name: 'Blouse Design',
        queries: {
          en: 'blouse cutting and stitching tutorial',
          hi: 'blouse cutting and stitching hindi',
          kn: 'blouse cutting and stitching kannada'
        }
      },
      {
        name: 'Embroidery',
        queries: {
          en: 'hand embroidery stitches tutorial beginners',
          hi: 'hand embroidery stitches hindi',
          kn: 'hand embroidery stitches kannada'
        }
      },
      {
        name: 'Fashion Design',
        queries: {
          en: 'dress design dress cutting tutorial',
          hi: 'dress design dress cutting hindi',
          kn: 'dress design dress cutting kannada'
        }
      }
    ]
  },
  'Digital Skills': {
    subcategories: [
      {
        name: 'Smartphone Basics',
        queries: {
          en: 'smartphone basics guide for beginners',
          hi: 'smartphone basics guide hindi',
          kn: 'smartphone basics guide kannada'
        }
      },
      {
        name: 'Digital Payments',
        queries: {
          en: 'how to use upi digital payment safely',
          hi: 'how to use upi digital payment hindi',
          kn: 'how to use upi digital payment kannada'
        }
      },
      {
        name: 'Online Safety',
        queries: {
          en: 'cyber safety and online fraud protection tips',
          hi: 'cyber safety and online fraud protection hindi',
          kn: 'cyber safety and online fraud protection kannada'
        }
      },
      {
        name: 'Computer Basics',
        queries: {
          en: 'basic computer skills tutorial beginners',
          hi: 'basic computer skills tutorial hindi',
          kn: 'basic computer skills tutorial kannada'
        }
      }
    ]
  },
  'Health & Fitness': {
    subcategories: [
      {
        name: 'Yoga',
        queries: {
          en: 'daily morning yoga for women beginners',
          hi: 'daily morning yoga hindi',
          kn: 'daily morning yoga kannada'
        }
      },
      {
        name: 'Home Workout',
        queries: {
          en: 'full body home workout no equipment',
          hi: 'full body home workout hindi',
          kn: 'full body home workout kannada'
        }
      },
      {
        name: 'Fitness',
        queries: {
          en: 'easy fitness routine weight loss women',
          hi: 'easy fitness routine weight loss hindi',
          kn: 'easy fitness routine weight loss kannada'
        }
      },
      {
        name: 'Wellness',
        queries: {
          en: 'women health and wellness lifestyle tips',
          hi: 'women health and wellness tips hindi',
          kn: 'women health and wellness tips kannada'
        }
      }
    ]
  },
  'Music & Instruments': {
    subcategories: [
      {
        name: 'Singing',
        queries: {
          en: 'vocal warm up vocal music lessons beginners',
          hi: 'vocal music lesson riyaz hindi',
          kn: 'vocal music lesson kannada'
        }
      },
      {
        name: 'Harmonium',
        queries: {
          en: 'learn basic harmonium lesson 1',
          hi: 'learn basic harmonium lesson hindi',
          kn: 'learn basic harmonium lesson kannada'
        }
      },
      {
        name: 'Guitar',
        queries: {
          en: 'basic guitar chords tutorial beginners',
          hi: 'basic guitar chords tutorial hindi',
          kn: 'basic guitar chords tutorial kannada'
        }
      },
      {
        name: 'Keyboard',
        queries: {
          en: 'easy piano keyboard lessons for beginners',
          hi: 'easy piano keyboard lessons hindi',
          kn: 'easy piano keyboard lessons kannada'
        }
      }
    ]
  },
  'Skincare': {
    subcategories: [
      {
        name: 'Daily Skincare',
        queries: {
          en: 'simple daily skincare routine for glowing skin',
          hi: 'simple daily skincare routine hindi',
          kn: 'simple daily skincare routine kannada'
        }
      },
      {
        name: 'Natural Skincare',
        queries: {
          en: 'natural home remedies glowing skin remedies',
          hi: 'natural home remedies glowing skin hindi',
          kn: 'natural home remedies glowing skin kannada'
        }
      },
      {
        name: 'Face Care',
        queries: {
          en: 'homemade face pack face care tips',
          hi: 'homemade face pack face care hindi',
          kn: 'homemade face pack face care kannada'
        }
      },
      {
        name: 'Hair Care',
        queries: {
          en: 'healthy hair care routine home remedies',
          hi: 'healthy hair care routine hindi',
          kn: 'healthy hair care routine kannada'
        }
      }
    ]
  }
};

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('🚀 Starting SheSphere Video Data Ingestion...\n');
    console.log('✅ MongoDB Connected successfully!\n');

    console.log('🧹 Removing videos longer than 1 hour...');
    const deleteResult = await Video.deleteMany({ duration: { $gt: 3600 } });
    console.log(`🗑️ Removed ${deleteResult.deletedCount || 0} invalid videos.\n`);

    const summaryCounts = {};

    for (const [categoryName, categoryData] of Object.entries(categoryConfig)) {
      console.log('==========================================');
      console.log(`📂 CATEGORY: ${categoryName}`);
      console.log('==========================================\n');

      for (const subcategory of categoryData.subcategories) {
        for (const [langCode, queryText] of Object.entries(subcategory.queries)) {
          const langName = getLanguageName(langCode);
          console.log(`🔍 ${subcategory.name} → ${langName}`);

          try {
            const searchResult = await yts(queryText);
            const videosFound = (searchResult && searchResult.videos) ? searchResult.videos : [];
            let addedForThisQuery = 0;

            for (const video of videosFound) {
              if (!video.videoId || !video.title || !video.thumbnail) continue;

              const durationSeconds = video.seconds || 0;
              // Duration requirement: <= 3600 seconds (60 mins) and > 0
              if (durationSeconds <= 0 || durationSeconds > 3600) {
                continue;
              }

              // Duration bucket check helper
              const durationBucket = getDurationCategory(durationSeconds);
              if (!durationBucket) continue;

              const tags = [
                categoryName.toLowerCase(),
                subcategory.name.toLowerCase(),
                langName.toLowerCase()
              ];

              const result = await Video.updateOne(
                { youtubeId: video.videoId },
                {
                  $set: {
                    youtubeId: video.videoId,
                    title: video.title,
                    category: categoryName,
                    subcategory: subcategory.name,
                    tags: tags,
                    thumbnail: video.thumbnail,
                    duration: durationSeconds,
                    views: video.views || 0,
                    language: langName
                  }
                },
                { upsert: true }
              );

              if (result.upsertedCount > 0 || result.modifiedCount > 0) {
                addedForThisQuery++;
              }
            }

            console.log(`✅ Added ${addedForThisQuery} videos\n`);
          } catch (err) {
            console.warn(`⚠️ Search failed for ${categoryName} → ${subcategory.name} → ${langName}`);
            console.warn(`Error detail: ${err.message}\n`);
          }
        }
      }

      const currentCategoryCount = await Video.countDocuments({ category: categoryName, duration: { $lte: 3600 } });
      summaryCounts[categoryName] = currentCategoryCount;
      console.log(`📊 ${categoryName} total: ${currentCategoryCount}/25\n`);
    }

    // Safety final cleanup
    await Video.deleteMany({ duration: { $gt: 3600 } });

    console.log('==========================================');
    console.log('📊 FINAL DATABASE SUMMARY');
    console.log('==========================================');
    for (const [catName, count] of Object.entries(summaryCounts)) {
      const finalCatCount = await Video.countDocuments({ category: catName, duration: { $lte: 3600 } });
      console.log(`${catName}: ${finalCatCount} videos`);
    }
    console.log('\n🎉 Video seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error Seeding Database:', error);
    process.exit(1);
  }
}

seedDatabase();