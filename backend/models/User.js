const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: [true, 'Password is required']
    },
    profilePicture: {
      type: String,
      default: ''
    },
    language: {
      type: String,
      default: ''
    },
    education: {
      type: String,
      default: ''
    },
    age: {
      type: String,
      default: ''
    },
    occupation: {
      type: String,
      default: ''
    },
    dailyFreeTime: {
      type: String,
      default: '' // '15 minutes', '30 minutes', '45 minutes', '1 hour'
    },
    interest: {
      type: String,
      default: ''
    },
    clusterId: {
      type: Number,
      default: null
    },
    lastClusteredAt: {
      type: Date,
      default: null
    },
    videosWatched: {
      type: Number,
      default: 0
    },
    communityDiscussions: {
      type: Number,
      default: 0
    },
    learningTimeMinutes: {
      type: Number,
      default: 0
    },
    xp: {
      type: Number,
      default: 0
    },
    level: {
      type: Number,
      default: 1
    },
    streak: {
      type: Number,
      default: 0
    },
    lastActiveDate: {
      type: String,
      default: ''
    },
    longestStreak: {
      type: Number,
      default: 0
    },
    totalActiveDays: {
      type: Number,
      default: 0
    },
    activeDates: {
      type: [String],
      default: []
    },
    badges: [
      {
        name: String,
        icon: String,
        description: String,
        earnedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    achievements: {
      type: Array,
      default: []
    },
    role: {
      type: String,
      default: 'user'
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

module.exports = mongoose.model('User', userSchema);
