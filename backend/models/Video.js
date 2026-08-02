const mongoose = require('mongoose');

const validCategories = [
  'Cooking',
  'Arts & Crafts',
  'Gardening',
  'Sewing & Fashion',
  'Digital Skills',
  'Health & Fitness',
  'Music & Instruments',
  'Skincare'
];

const videoSchema = new mongoose.Schema({
  youtubeId: { 
    type: String, 
    required: true, 
    unique: true // Prevents duplicate videos in your database
  },
  title: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    required: true, 
    enum: validCategories // Ensures exact string match with your UI
  },
  thumbnail: { 
    type: String, 
    required: true 
  },
  language: { 
    type: String, 
    default: 'hi' // e.g., 'hi', 'kn', 'en'
  },
  views: { 
    type: Number, 
    default: 0 
  },
  likes: { 
    type: Number, 
    default: 0 
  }
}, { timestamps: true });

// Create indexes to make category queries instant
videoSchema.index({ category: 1, language: 1 });

module.exports = mongoose.model('Video', videoSchema);