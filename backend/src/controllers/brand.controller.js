const axios = require('axios');

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_BASE = 'https://www.googleapis.com/youtube/v3';

// Extract keywords from brand prompt for YouTube search
function extractSearchQuery(prompt) {
  const lower = prompt.toLowerCase();
  const nicheMap = {
    'ai': 'AI technology creator',
    'tech': 'tech creator india',
    'finance': 'finance creator india',
    'fitness': 'fitness creator india',
    'business': 'business entrepreneur creator',
    'startup': 'startup founder creator',
    'fashion': 'fashion creator india',
    'food': 'food creator india',
    'travel': 'travel creator india',
    'gaming': 'gaming creator india',
    'education': 'education creator india',
    'saas': 'software tech creator',
    'crypto': 'crypto finance creator',
    'health': 'health wellness creator',
  };

  for (const [key, query] of Object.entries(nicheMap)) {
    if (lower.includes(key)) return query;
  }
  return `${prompt} creator india`;
}

// Fetch real YouTube creators based on search query
async function searchYouTubeCreators(query, maxResults = 15) {
  if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'your_youtube_api_key_here') {
    return [];
  }

  try {
    // Search for channels
    const searchRes = await axios.get(`${YOUTUBE_BASE}/search`, {
      params: {
        part: 'snippet',
        q: query,
        type: 'channel',
        maxResults,
        order: 'relevance',
        key: YOUTUBE_API_KEY,
      },
    });

    const channelIds = searchRes.data.items
      .map(item => item.id.channelId)
      .filter(Boolean)
      .join(',');

    if (!channelIds) return [];

    // Get channel statistics
    const statsRes = await axios.get(`${YOUTUBE_BASE}/channels`, {
      params: {
        part: 'snippet,statistics',
        id: channelIds,
        key: YOUTUBE_API_KEY,
      },
    });

    return statsRes.data.items
      .filter(ch => parseInt(ch.statistics?.subscriberCount || 0) > 1000)
      .map(ch => {
        const subs = parseInt(ch.statistics.subscriberCount || 0);
        const totalViews = parseInt(ch.statistics.viewCount || 0);
        const videoCount = parseInt(ch.statistics.videoCount || 1);
        const avgViews = Math.floor(totalViews / Math.max(videoCount, 1));

        return {
          _id: ch.id,
          username: ch.snippet.customUrl?.replace('@', '') || ch.id,
          fullName: ch.snippet.title,
          platform: 'youtube',
          niche: 'AI & Technology',
          bio: ch.snippet.description?.slice(0, 150) || '',
          avatar: ch.snippet.thumbnails?.default?.url || '',
          location: ch.snippet.country || 'India',
          followers: subs,
          following: 0,
          totalPosts: videoCount,
          avgLikes: Math.floor(avgViews * 0.04),
          avgComments: Math.floor(avgViews * 0.005),
          avgShares: Math.floor(avgViews * 0.01),
          avgSaves: Math.floor(avgViews * 0.008),
          avgViews,
          postingFrequency: Math.min(videoCount / 52, 7),
          isVerified: subs > 100000,
          isActive: true,
          engagementRate: ((avgViews * 0.055) / Math.max(subs, 1) * 100).toFixed(2),
        };
      });
  } catch (err) {
    console.error('YouTube search error:', err.message);
    return [];
  }
}

// Get ML scores for a creator from AI Engine
async function getMLScores(creator) {
  try {
    const payload = {
      followers: creator.followers,
      avg_likes: creator.avgLikes,
      avg_comments: creator.avgComments,
      avg_shares: creator.avgShares,
      avg_saves: creator.avgSaves,
      avg_views: creator.avgViews,
      posting_frequency: creator.postingFrequency,
      niche: creator.niche,
      growth_history: [],
    };

    const [scoreRes, authRes, growthRes] = await Promise.all([
      axios.post(`${AI_ENGINE_URL}/api/scoring/influencer-score`, payload, { timeout: 5000 }),
      axios.post(`${AI_ENGINE_URL}/api/authenticity/detect`, payload, { timeout: 5000 }),
      axios.post(`${AI_ENGINE_URL}/api/growth/predict`, payload, { timeout: 5000 }),
    ]);

    return {
      influencerScore: Math.round(scoreRes.data.influencer_score || 0),
      authenticityScore: Math.round(authRes.data.authenticity_score || 0),
      growthScore: Math.round(growthRes.data.growth_score || 0),
      explanation: scoreRes.data.explanation || [],
    };
  } catch {
    // Fallback scoring based on engagement
    const er = parseFloat(creator.engagementRate) || 3;
    return {
      influencerScore: Math.min(Math.round(er * 8 + Math.log10(creator.followers + 1) * 5), 100),
      authenticityScore: Math.min(Math.round(er * 7 + 40), 100),
      growthScore: Math.min(Math.round(er * 6 + 35), 100),
      explanation: ['Score based on engagement rate and subscriber count'],
    };
  }
}

// @desc    Match influencers to brand prompt using YouTube API
// @route   POST /api/brand/match
const matchInfluencers = async (req, res) => {
  try {
    const { prompt, topK = 10 } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Brand prompt is required' });
    }

    const searchQuery = extractSearchQuery(prompt);
    console.log(`Searching YouTube for: "${searchQuery}"`);

    // Search real YouTube creators
    let creators = await searchYouTubeCreators(searchQuery, 15);

    // If YouTube API not available, fall back to database
    if (creators.length === 0) {
      console.log('YouTube API unavailable, using database');
      const Influencer = require('../models/Influencer.model');
      const keywords = prompt.toLowerCase().split(' ').filter(w => w.length > 3);
      const query = { isActive: true };

      if (keywords.length > 0) {
        query.$or = [
          { niche: { $regex: keywords.join('|'), $options: 'i' } },
          { bio: { $regex: keywords.join('|'), $options: 'i' } },
        ];
      }

      const dbCreators = await Influencer.find(query).limit(20);
      creators = dbCreators.map(c => ({
        _id: c._id.toString(),
        username: c.username,
        fullName: c.fullName,
        platform: c.platform,
        niche: c.niche,
        bio: c.bio,
        avatar: c.avatar,
        location: c.location,
        followers: c.followers,
        avgLikes: c.avgLikes,
        avgComments: c.avgComments,
        avgShares: c.avgShares,
        avgSaves: c.avgSaves,
        avgViews: c.avgViews,
        postingFrequency: c.postingFrequency,
        isVerified: c.isVerified,
        engagementRate: c.engagementRate,
        scores: c.scores,
      }));
    }

    // Get ML scores for each creator
    const scoredCreators = await Promise.all(
      creators.slice(0, topK).map(async (creator) => {
        const scores = creator.scores?.influencerScore
          ? creator.scores
          : await getMLScores(creator);

        // Brand match score based on prompt relevance
        const promptLower = prompt.toLowerCase();
        const creatorText = `${creator.niche} ${creator.bio} ${creator.fullName}`.toLowerCase();
        const matchWords = promptLower.split(' ').filter(w => w.length > 3);
        const matchCount = matchWords.filter(w => creatorText.includes(w)).length;
        const brandMatchScore = Math.min(
          Math.round((matchCount / Math.max(matchWords.length, 1)) * 40 + (scores.influencerScore || 50) * 0.6),
          100
        );

        return {
          ...creator,
          scores: {
            influencerScore: scores.influencerScore,
            authenticityScore: scores.authenticityScore,
            growthScore: scores.growthScore,
            brandMatchScore,
          },
          explanation: scores.explanation,
        };
      })
    );

    // Sort by brand match score
    scoredCreators.sort((a, b) => b.scores.brandMatchScore - a.scores.brandMatchScore);

    res.json({
      success: true,
      prompt,
      search_query: searchQuery,
      total: scoredCreators.length,
      data_source: creators[0]?._id?.length === 24 ? 'database' : 'youtube_api',
      data: scoredCreators,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCampaignRecommendations = async (req, res) => {
  try {
    const { brandName, productType, targetAudience, budget } = req.body;
    return res.json({
      success: true,
      data: {
        recommended_niches: ['AI & Technology', 'Business', 'Finance'],
        estimated_reach: '500K - 2M',
        suggested_budget_split: { micro: '40%', macro: '40%', mega: '20%' },
        campaign_strategy: `For ${brandName || 'your brand'}, focus on tech-savvy creators with high engagement rates above 3%.`,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { matchInfluencers, getCampaignRecommendations };
