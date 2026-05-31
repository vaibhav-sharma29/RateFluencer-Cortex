const mongoose = require('mongoose');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const Influencer = require('../models/Influencer.model');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_BASE = 'https://www.googleapis.com/youtube/v3';

// Real creators with approximate real data
const REAL_CREATORS_DATA = [
  // Indian Tech
  { username: 'techburner', fullName: 'Tech Burner', niche: 'AI & Technology', followers: 12500000, avgViews: 1200000, location: 'India' },
  { username: 'trakintech', fullName: 'Trakin Tech', niche: 'AI & Technology', followers: 15500000, avgViews: 800000, location: 'India' },
  { username: 'technicalguruji', fullName: 'Technical Guruji', niche: 'AI & Technology', followers: 23000000, avgViews: 1500000, location: 'India' },
  { username: 'geekyranjit', fullName: 'Geeky Ranjit', niche: 'AI & Technology', followers: 3200000, avgViews: 300000, location: 'India' },
  { username: 'ishankigyaan', fullName: 'Ishan Kigyaan', niche: 'AI & Technology', followers: 7800000, avgViews: 600000, location: 'India' },
  { username: 'techbar', fullName: 'Tech Bar', niche: 'AI & Technology', followers: 1200000, avgViews: 150000, location: 'India' },
  { username: 'techwithtim', fullName: 'Tech With Tim', niche: 'AI & Technology', followers: 1400000, avgViews: 120000, location: 'USA' },
  { username: 'fireship', fullName: 'Fireship', niche: 'AI & Technology', followers: 4210000, avgViews: 500000, location: 'USA' },
  { username: 'mkbhd', fullName: 'Marques Brownlee', niche: 'AI & Technology', followers: 21000000, avgViews: 3000000, location: 'USA' },
  { username: 'veritasium', fullName: 'Veritasium', niche: 'AI & Technology', followers: 20800000, avgViews: 5000000, location: 'USA' },
  { username: 'linus', fullName: 'Linus Tech Tips', niche: 'AI & Technology', followers: 15600000, avgViews: 1800000, location: 'Canada' },
  { username: 'mrwhosetheboss', fullName: 'Mrwhosetheboss', niche: 'AI & Technology', followers: 9800000, avgViews: 2000000, location: 'UK' },
  { username: 'davie504', fullName: 'Dave2D', niche: 'AI & Technology', followers: 3500000, avgViews: 400000, location: 'Canada' },

  // Indian Business/Finance
  { username: 'warikoo', fullName: 'Ankur Warikoo', niche: 'Business', followers: 7030000, avgViews: 800000, location: 'India' },
  { username: 'beerbiceps', fullName: 'BeerBiceps', niche: 'Business', followers: 8240000, avgViews: 900000, location: 'India' },
  { username: 'labourlaw', fullName: 'Labour Law Advisor', niche: 'Finance', followers: 5200000, avgViews: 600000, location: 'India' },
  { username: 'pranjal', fullName: 'Pranjal Kamra', niche: 'Finance', followers: 3800000, avgViews: 400000, location: 'India' },
  { username: 'ca_rachana', fullName: 'CA Rachana Ranade', niche: 'Finance', followers: 4500000, avgViews: 500000, location: 'India' },
  { username: 'grahamstephan', fullName: 'Graham Stephan', niche: 'Finance', followers: 5170000, avgViews: 600000, location: 'USA' },
  { username: 'andrei_jikh', fullName: 'Andrei Jikh', niche: 'Finance', followers: 2800000, avgViews: 350000, location: 'USA' },
  { username: 'neerajkumararora', fullName: 'Neeraj Kumar Arora', niche: 'Business', followers: 1200000, avgViews: 150000, location: 'India' },
  { username: 'sharan_hegde', fullName: 'Sharan Hegde', niche: 'Finance', followers: 2100000, avgViews: 250000, location: 'India' },

  // Startups/Entrepreneurship
  { username: 'ycombinator', fullName: 'Y Combinator', niche: 'Startups', followers: 1100000, avgViews: 200000, location: 'USA' },
  { username: 'garyvee', fullName: 'Gary Vaynerchuk', niche: 'Business', followers: 3200000, avgViews: 400000, location: 'USA' },
  { username: 'alexhormozi', fullName: 'Alex Hormozi', niche: 'Business', followers: 2800000, avgViews: 500000, location: 'USA' },
  { username: 'patrickbetdavid', fullName: 'Patrick Bet-David', niche: 'Business', followers: 4500000, avgViews: 600000, location: 'USA' },
  { username: 'nikhilkamath', fullName: 'Nikhil Kamath', niche: 'Startups', followers: 890000, avgViews: 120000, location: 'India' },

  // Creator Economy
  { username: 'mkbhd', fullName: 'MKBHD', niche: 'Creator Economy', followers: 21000000, avgViews: 3000000, location: 'USA' },
  { username: 'mattdavella', fullName: 'Matt D Avella', niche: 'Creator Economy', followers: 4200000, avgViews: 800000, location: 'USA' },
  { username: 'aliabdaal', fullName: 'Ali Abdaal', niche: 'Creator Economy', followers: 5100000, avgViews: 700000, location: 'UK' },
  { username: 'thomasfrank', fullName: 'Thomas Frank', niche: 'Creator Economy', followers: 3200000, avgViews: 400000, location: 'USA' },
  { username: 'nathanbarry', fullName: 'Nathan Barry', niche: 'Creator Economy', followers: 180000, avgViews: 25000, location: 'USA' },

  // AI Specific
  { username: 'twomin', fullName: 'Two Minute Papers', niche: 'AI & Technology', followers: 1600000, avgViews: 300000, location: 'Hungary' },
  { username: 'yanniclecun', fullName: 'Lex Fridman', niche: 'AI & Technology', followers: 4200000, avgViews: 1000000, location: 'USA' },
  { username: 'sentdex', fullName: 'sentdex', niche: 'AI & Technology', followers: 1300000, avgViews: 150000, location: 'USA' },
  { username: 'andrejkarpathy', fullName: 'Andrej Karpathy', niche: 'AI & Technology', followers: 890000, avgViews: 200000, location: 'USA' },
  { username: 'aiexplained', fullName: 'AI Explained', niche: 'AI & Technology', followers: 620000, avgViews: 180000, location: 'UK' },
];

async function fetchRealStats(handle) {
  if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'your_youtube_api_key_here') return null;
  try {
    const res = await axios.get(`${YOUTUBE_BASE}/channels`, {
      params: { part: 'snippet,statistics', forHandle: handle, key: YOUTUBE_API_KEY },
      timeout: 8000,
    });
    const item = res.data.items?.[0];
    if (!item) return null;
    return {
      fullName: item.snippet.title,
      bio: item.snippet.description?.slice(0, 200) || '',
      avatar: item.snippet.thumbnails?.default?.url || '',
      followers: parseInt(item.statistics.subscriberCount || 0),
      totalPosts: parseInt(item.statistics.videoCount || 0),
      avgViews: Math.floor(parseInt(item.statistics.viewCount || 0) / Math.max(parseInt(item.statistics.videoCount || 1), 1)),
    };
  } catch { return null; }
}

function buildProfile(creator, realStats) {
  const followers = realStats?.followers || creator.followers;
  const avgViews = realStats?.avgViews || creator.avgViews;
  const avgLikes = Math.floor(avgViews * 0.04);
  const avgComments = Math.floor(avgViews * 0.005);

  return {
    username: creator.username,
    fullName: realStats?.fullName || creator.fullName,
    platform: 'youtube',
    niche: creator.niche,
    bio: realStats?.bio || `${creator.niche} creator | ${creator.location}`,
    avatar: realStats?.avatar || '',
    location: creator.location,
    followers,
    following: 0,
    totalPosts: realStats?.totalPosts || Math.floor(avgViews / 50000) + 50,
    avgLikes,
    avgComments,
    avgShares: Math.floor(avgLikes * 0.1),
    avgSaves: Math.floor(avgLikes * 0.08),
    avgViews,
    postingFrequency: 2.5,
    audienceDemographics: {
      ageGroup: '18-34',
      topCountry: creator.location,
      genderSplit: { male: 65, female: 35 },
    },
    growthHistory: [],
    scores: { influencerScore: null, authenticityScore: null, growthScore: null, brandMatchScore: null },
    isVerified: followers > 500000,
    isActive: true,
  };
}

async function seedYouTubeCreators() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 30000, family: 4 });
    console.log('Connected to MongoDB');

    // Clear existing
    await Influencer.deleteMany({});
    console.log('Cleared existing profiles');

    let imported = 0;
    const seen = new Set();

    for (const creator of REAL_CREATORS_DATA) {
      if (seen.has(creator.username)) continue;
      seen.add(creator.username);

      let realStats = null;
      if (YOUTUBE_API_KEY && YOUTUBE_API_KEY !== 'your_youtube_api_key_here') {
        realStats = await fetchRealStats(creator.username);
        await new Promise(r => setTimeout(r, 300));
      }

      const profile = buildProfile(creator, realStats);
      await Influencer.findOneAndUpdate(
        { username: creator.username, platform: 'youtube' },
        profile,
        { upsert: true, new: true }
      );
      console.log(`Imported: ${profile.fullName} (${profile.followers.toLocaleString()} followers)`);
      imported++;
    }

    console.log(`\nDone! Imported ${imported} real creators`);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

seedYouTubeCreators();
