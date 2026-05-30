const mongoose = require('mongoose');

const InfluencerSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    platform: {
      type: String,
      enum: ['instagram', 'youtube', 'linkedin', 'tiktok', 'twitter'],
      required: true,
    },
    niche: {
      type: String,
      required: true,
      // e.g. "AI & Technology", "Finance", "Fitness", "Business"
    },
    bio: {
      type: String,
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    location: {
      type: String,
      default: '',
    },

    // Core metrics
    followers: { type: Number, default: 0 },
    following: { type: Number, default: 0 },
    totalPosts: { type: Number, default: 0 },
    avgLikes: { type: Number, default: 0 },
    avgComments: { type: Number, default: 0 },
    avgShares: { type: Number, default: 0 },
    avgSaves: { type: Number, default: 0 },
    avgViews: { type: Number, default: 0 },
    postingFrequency: { type: Number, default: 0 }, // posts per week

    // Audience demographics
    audienceDemographics: {
      ageGroup: { type: String, default: '18-34' },
      topCountry: { type: String, default: 'India' },
      genderSplit: {
        male: { type: Number, default: 50 },
        female: { type: Number, default: 50 },
      },
    },

    // Growth data (last 6 months)
    growthHistory: [
      {
        month: String,
        followers: Number,
        engagementRate: Number,
      },
    ],

    // AI Scores (populated by AI Engine)
    scores: {
      influencerScore: { type: Number, default: null },
      authenticityScore: { type: Number, default: null },
      growthScore: { type: Number, default: null },
      brandMatchScore: { type: Number, default: null },
    },

    // Embedding vector for brand matching (stored as array)
    embedding: {
      type: [Number],
      default: [],
      select: false, // don't return in normal queries
    },

    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Virtual: engagement rate
InfluencerSchema.virtual('engagementRate').get(function () {
  if (!this.followers || this.followers === 0) return 0;
  const totalEngagement = this.avgLikes + this.avgComments + this.avgShares + this.avgSaves;
  return ((totalEngagement / this.followers) * 100).toFixed(2);
});

InfluencerSchema.set('toJSON', { virtuals: true });
InfluencerSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Influencer', InfluencerSchema);
