const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Community name is required'],
      trim: true
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      lowercase: true
    },
    interestKey: {
      type: String,
      required: [true, 'Interest key is required'],
      trim: true
    },
    description: {
      type: String,
      default: '',
      trim: true
    },
    icon: {
      type: String,
      default: 'Users'
    },
    bannerColor: {
      type: String,
      default: 'from-pink-500 to-purple-500'
    },
    memberCount: {
      type: Number,
      default: 0
    },
    // Architecture hook for future K-Means generated subcommunities
    parentCommunityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      default: null
    },
    isSubcommunity: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Community', communitySchema);
