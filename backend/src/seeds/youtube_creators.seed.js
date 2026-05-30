const mongoose = require('mongoose');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const Influencer = require('../models/Influencer.model');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_BASE = 'https://www.googleapis.com/youtube/v3';

// Popular Indian + Global tech/business YouTube creators
const CREATORS = [
  { handle: 'techburner', niche: 'AI & Technology' },
  { handle: 'beerbiceps', niche: 'Business' },
  { handle: 'warikoo', niche: 'Business' },
  { handle: 'ishan', niche: 'AI & Technology' },
  { handle: 'trakintech', niche: 'AI & Technology' },
  { handle: 'mkbhd', niche: 'AI & Technology' },
  { handle: 'veritasium', niche: 'AI & Technology' },
  { handle: 'fireship', niche: 'AI & Technology' },
  { handle: 'grahamstephan', niche: 'Finance' },
  { handle: 'ankurwarikoo', niche: 'Business' },
];

async function fetchChannelData(handle) {
  try {
    const res = await axios.get(`${YOUTUBE_BASE}/channels`, {
      params: {
        part: 'snippet,statistics',
        forHandle: handle,
        key: YOUTUBE_API_KEY,
      },
    });
    const item = res.data.items?.[0];
    if (!item) return null;

    const stats = item.statistics;
    const subscribers = parseInt(stats.subscriberCount || 0);
    const totalViews = parseInt(stats.viewCount || 0);
    const videoCount = parseInt(stats.videoCount || 1);
    const avgViews = Math.floor(totalViews / videoCount);

    return {
      username: handle,
      fullName: item.snippet.title,
      platform: 'youtube',
      niche: 'AI & Technology',
      bio: item.snippet.description?.slice(0, 200) || '',
      avatar: item.snippet.thumbnails?.default?.url || '',
      location: 'India',
      followers: subscribers,
      following: 0,
      totalPosts: videoCount,
      avgLikes: Math.floor(avgViews * 0.04),
      avgComments: Math.floor(avgViews * 0.005),
      avgShares: Math.floor(avgViews * 0.01),
      avgSaves: Math.floor(avgViews * 0.008),
      avgViews,
      postingFrequency: Math.min(videoCount / 52, 7),
      audienceDemographics: {
        ageGroup: '18-34',
        topCountry: 'India',
        genderSplit: { male: 65, female: 35 },
      },
      growthHistory: [],
      scores: {
        influencerScore: null,
        authenticityScore: null,
        growthScore: null,
        brandMatchScore: null,
      },
      isVerified: true,
      isActive: true,
    };
  } catch (err) {
    console.log(`Failed to fetch ${handle}: ${err.message}`);
    return null;
  }
}

async function seedYouTubeCreators() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 30000, family: 4 });
    console.log('Connected to MongoDB');

    if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'your_youtube_api_key_here') {
      console.log('No YouTube API key — skipping real data fetch');
      process.exit(0);
    }

    let imported = 0;
    for (const creator of CREATORS) {
      const profile = await fetchChannelData(creator.handle);
      if (profile) {
        profile.niche = creator.niche;
        await Influencer.findOneAndUpdate(
          { username: creator.handle, platform: 'youtube' },
          profile,
          { upsert: true, new: true }
        );
        console.log(`Imported: ${profile.fullName} (${profile.followers.toLocaleString()} subscribers)`);
        imported++;
      }
      await new Promise(r => setTimeout(r, 500));
    }

    console.log(`\nDone! Imported ${imported} YouTube creators`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

seedYouTubeCreators();
