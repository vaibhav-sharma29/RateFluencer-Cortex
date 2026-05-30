const axios = require('axios');
const Influencer = require('../models/Influencer.model');

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

// @desc    Brand searches for matching influencers using AI
// @route   POST /api/brand/match
// @access  Private
const matchInfluencers = async (req, res) => {
  try {
    const { prompt, niche, platform, minFollowers, topK = 10 } = req.body;

    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Brand prompt is required' });
    }

    // Build filter for pre-filtering from DB
    const dbFilter = { isActive: true };
    if (niche) dbFilter.niche = { $regex: niche, $options: 'i' };
    if (platform) dbFilter.platform = platform;
    if (minFollowers) dbFilter.followers = { $gte: Number(minFollowers) };

    // Fetch candidate influencers from DB
    const candidates = await Influencer.find(dbFilter).limit(100);

    if (candidates.length === 0) {
      return res.json({ success: true, data: [], message: 'No influencers found for given filters' });
    }

    // Send to AI Engine for RAG-based matching
    try {
      const aiResponse = await axios.post(`${AI_ENGINE_URL}/api/brand/match`, {
        prompt,
        candidates: candidates.map((c) => ({
          id: c._id.toString(),
          username: c.username,
          niche: c.niche,
          bio: c.bio,
          platform: c.platform,
          followers: c.followers,
          engagement_rate: c.engagementRate,
          influencer_score: c.scores?.influencerScore,
          authenticity_score: c.scores?.authenticityScore,
        })),
        top_k: Number(topK),
      });

      const matchedIds = aiResponse.data.matches.map((m) => m.id);
      const matchScores = {};
      aiResponse.data.matches.forEach((m) => {
        matchScores[m.id] = m.brand_match_score;
      });

      // Fetch full influencer data for matched IDs
      const matchedInfluencers = await Influencer.find({ _id: { $in: matchedIds } });

      // Attach brand match score and sort by it
      const result = matchedInfluencers
        .map((inf) => ({
          ...inf.toJSON(),
          scores: {
            ...inf.scores,
            brandMatchScore: matchScores[inf._id.toString()] || 0,
          },
        }))
        .sort((a, b) => b.scores.brandMatchScore - a.scores.brandMatchScore);

      return res.json({
        success: true,
        prompt,
        total: result.length,
        data: result,
      });
    } catch (aiError) {
      // AI Engine down — fallback to keyword-based matching
      console.warn('AI Engine unavailable, using fallback matching');

      const keywords = prompt.toLowerCase().split(' ');
      const scored = candidates
        .map((inf) => {
          let score = 0;
          const text = `${inf.niche} ${inf.bio} ${inf.username}`.toLowerCase();
          keywords.forEach((kw) => { if (text.includes(kw)) score += 10; });
          score += (inf.scores?.influencerScore || 50) * 0.5;
          score += (inf.scores?.authenticityScore || 50) * 0.3;
          return { ...inf.toJSON(), scores: { ...inf.scores, brandMatchScore: Math.min(Math.round(score), 100) } };
        })
        .sort((a, b) => b.scores.brandMatchScore - a.scores.brandMatchScore)
        .slice(0, topK);

      return res.json({
        success: true,
        prompt,
        total: scored.length,
        data: scored,
        note: 'Fallback matching used (AI Engine offline)',
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get brand campaign recommendations
// @route   POST /api/brand/campaign
// @access  Private
const getCampaignRecommendations = async (req, res) => {
  try {
    const { brandName, productType, targetAudience, budget } = req.body;

    try {
      const aiResponse = await axios.post(`${AI_ENGINE_URL}/api/brand/campaign`, {
        brand_name: brandName,
        product_type: productType,
        target_audience: targetAudience,
        budget,
      });
      return res.json({ success: true, data: aiResponse.data });
    } catch {
      // Fallback mock response
      return res.json({
        success: true,
        data: {
          recommended_niches: ['AI & Technology', 'Business', 'Finance'],
          estimated_reach: '500K - 2M',
          suggested_budget_split: { micro: '40%', macro: '40%', mega: '20%' },
          campaign_strategy: `For ${brandName}, focus on tech-savvy creators in the AI space with high engagement rates above 3%.`,
        },
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { matchInfluencers, getCampaignRecommendations };
