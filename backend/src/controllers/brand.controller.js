const axios = require('axios');

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_BASE = 'https://www.googleapis.com/youtube/v3';

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

function extractNiche(query) {
  const q = query.toLowerCase();
  if (q.includes('ai') || q.includes('tech') || q.includes('software') || q.includes('saas')) return 'AI & Technology';
  if (q.includes('finance') || q.includes('invest') || q.includes('stock') || q.includes('crypto')) return 'Finance';
  if (q.includes('business') || q.includes('entrepreneur') || q.includes('marketing')) return 'Business';
  if (q.includes('startup') || q.includes('founder')) return 'Startups';
  if (q.includes('creator') || q.includes('content') || q.includes('youtube')) return 'Creator Economy';
  if (q.includes('fitness') || q.includes('health') || q.includes('wellness')) return 'Fitness';
  if (q.includes('food') || q.includes('cooking')) return 'Food';
  if (q.includes('travel')) return 'Travel';
  if (q.includes('fashion') || q.includes('style')) return 'Fashion';
  return 'AI & Technology';
}

async function searchYouTubeCreators(query) {
  if (!YOUTUBE_API_KEY || YOUTUBE_API_KEY === 'your_youtube_api_key_here') {
    return [];
  }
  try {
    const channelIdSet = new Set();

    const videoRes = await axios.get(`${YOUTUBE_BASE}/search`, {
      params: { part: 'snippet', q: query, type: 'video', maxResults: 30, order: 'viewCount', key: YOUTUBE_API_KEY },
    });
    videoRes.data.items.forEach(item => {
      if (item.snippet?.channelId) channelIdSet.add(item.snippet.channelId);
    });

    const channelRes = await axios.get(`${YOUTUBE_BASE}/search`, {
      params: { part: 'snippet', q: query, type: 'channel', maxResults: 15, order: 'relevance', key: YOUTUBE_API_KEY },
    });
    channelRes.data.items.forEach(item => {
      if (item.id?.channelId) channelIdSet.add(item.id.channelId);
    });

    const channelIds = Array.from(channelIdSet).slice(0, 40).join(',');
    if (!channelIds) return [];

    const statsRes = await axios.get(`${YOUTUBE_BASE}/channels`, {
      params: { part: 'snippet,statistics', id: channelIds, key: YOUTUBE_API_KEY },
    });

    const niche = extractNiche(query);
    return statsRes.data.items
      .filter(ch => parseInt(ch.statistics?.subscriberCount || 0) > 50000)
      .map(ch => {
        const subs = parseInt(ch.statistics.subscriberCount || 0);
        const totalViews = parseInt(ch.statistics.viewCount || 0);
        const videoCount = Math.max(parseInt(ch.statistics.videoCount || 1), 1);
        const avgViews = Math.max(Math.floor(totalViews / videoCount), 1000);
        const avgLikes = Math.max(Math.floor(avgViews * 0.04), 50);
        const avgComments = Math.max(Math.floor(avgViews * 0.005), 10);
        return {
          _id: ch.id,
          username: ch.snippet.customUrl?.replace('@', '') || ch.id,
          fullName: ch.snippet.title,
          platform: 'youtube',
          niche,
          bio: ch.snippet.description?.slice(0, 150) || '',
          avatar: ch.snippet.thumbnails?.default?.url || '',
          location: ch.snippet.country || 'India',
          followers: subs,
          following: 0,
          totalPosts: videoCount,
          avgLikes,
          avgComments,
          avgShares: Math.floor(avgLikes * 0.1),
          avgSaves: Math.floor(avgLikes * 0.08),
          avgViews,
          postingFrequency: Math.min(videoCount / 52, 7),
          isVerified: subs > 100000,
          isActive: true,
          engagementRate: ((avgLikes + avgComments) / Math.max(subs, 1) * 100).toFixed(2),
        };
      })
      .filter(c => parseFloat(c.engagementRate) < 50);
  } catch (err) {
    console.error('YouTube search error:', err.message);
    return [];
  }
}

async function getMLScores(creator) {
  try {
    const avgViews = Math.max(creator.avgViews || 0, 1000);
    const avgLikes = Math.max(creator.avgLikes || 0, Math.floor(avgViews * 0.03));
    const avgComments = Math.max(creator.avgComments || 0, Math.floor(avgViews * 0.003));

    const payload = {
      followers: creator.followers,
      avg_likes: avgLikes,
      avg_comments: avgComments,
      avg_shares: creator.avgShares || Math.floor(avgLikes * 0.1),
      avg_saves: creator.avgSaves || Math.floor(avgLikes * 0.08),
      avg_views: avgViews,
      posting_frequency: creator.postingFrequency || 2,
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
    const er = parseFloat(creator.engagementRate) || 3;
    const followers = creator.followers || 1000;
    return {
      influencerScore: Math.min(Math.round(er * 8 + Math.log10(followers) * 5), 95),
      authenticityScore: Math.min(Math.round(er * 7 + 40), 95),
      growthScore: Math.min(Math.round(er * 6 + 35), 95),
      explanation: ['Score based on engagement rate and subscriber count'],
    };
  }
}

const matchInfluencers = async (req, res) => {
  try {
    const { prompt, topK = 10 } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Brand prompt is required' });
    }

    const searchQuery = extractSearchQuery(prompt);
    console.log(`Searching YouTube for: "${searchQuery}"`);

    let creators = await searchYouTubeCreators(searchQuery);

    if (creators.length === 0) {
      console.log('YouTube API unavailable, using database');
      const Influencer = require('../models/Influencer.model');
      const keywords = prompt.toLowerCase().split(' ').filter(w => w.length > 3);
      const query = { isActive: true, platform: 'youtube' };

      if (keywords.length > 0) {
        query.$or = [
          { niche: { $regex: keywords.join('|'), $options: 'i' } },
          { bio: { $regex: keywords.join('|'), $options: 'i' } },
          { fullName: { $regex: keywords.join('|'), $options: 'i' } },
        ];
      }

      const dbCreators = await Influencer.find(query).limit(20);
      const source = dbCreators.length > 0 ? dbCreators : await Influencer.find({ isActive: true, platform: 'youtube' }).limit(20);
      creators = source.map(c => ({ ...c.toJSON(), engagementRate: c.engagementRate }));
    }

    const scoredCreators = await Promise.all(
      creators.slice(0, topK).map(async (creator) => {
        const scores = creator.scores?.influencerScore
          ? creator.scores
          : await getMLScores(creator);

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

    scoredCreators.sort((a, b) => b.scores.brandMatchScore - a.scores.brandMatchScore);

    res.json({
      success: true,
      prompt,
      search_query: searchQuery,
      total: scoredCreators.length,
      data: scoredCreators,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCampaignRecommendations = async (req, res) => {
  try {
    const { brandName } = req.body;
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
