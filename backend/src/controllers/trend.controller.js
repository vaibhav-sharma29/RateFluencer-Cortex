const axios = require('axios');

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

// @desc    Get trending topics with ML scores
// @route   GET /api/trends
// @access  Public
const getTrends = async (req, res) => {
  try {
    const { niche = 'all', limit = 10 } = req.query;

    const aiResponse = await axios.get(`${AI_ENGINE_URL}/api/trends`, {
      params: { niche, limit },
    });

    res.json({ success: true, data: aiResponse.data });
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      // Mock trending data for demo
      const mockTrends = [
        { id: 1, topic: 'AI Agents replacing SaaS tools', niche: 'AI & Technology', trend_score: 94, growth_velocity: 'explosive', search_interest: 92, engagement_potential: 96, novelty: 88, source: 'Reddit', post_count: 1240 },
        { id: 2, topic: 'Vibe Coding with Claude', niche: 'AI & Technology', trend_score: 91, growth_velocity: 'high', search_interest: 89, engagement_potential: 93, novelty: 95, source: 'LinkedIn', post_count: 890 },
        { id: 3, topic: 'Creator Economy hitting $500B', niche: 'Creator Economy', trend_score: 88, growth_velocity: 'high', search_interest: 85, engagement_potential: 90, novelty: 82, source: 'LinkedIn', post_count: 670 },
        { id: 4, topic: 'LLMs in Finance — What Banks Wont Tell You', niche: 'Finance', trend_score: 86, growth_velocity: 'medium', search_interest: 88, engagement_potential: 84, novelty: 79, source: 'Reddit', post_count: 540 },
        { id: 5, topic: 'Micro-SaaS built by solo founders using AI', niche: 'Business', trend_score: 85, growth_velocity: 'high', search_interest: 82, engagement_potential: 88, novelty: 86, source: 'LinkedIn', post_count: 720 },
        { id: 6, topic: 'OpenAI vs Google — The Real War', niche: 'AI & Technology', trend_score: 83, growth_velocity: 'medium', search_interest: 91, engagement_potential: 80, novelty: 72, source: 'Reddit', post_count: 1100 },
        { id: 7, topic: 'How Indian Startups are using GenAI', niche: 'Startups', trend_score: 81, growth_velocity: 'medium', search_interest: 78, engagement_potential: 85, novelty: 80, source: 'LinkedIn', post_count: 430 },
        { id: 8, topic: 'Prompt Engineering is dead — Long live AI Agents', niche: 'AI & Technology', trend_score: 79, growth_velocity: 'medium', search_interest: 76, engagement_potential: 82, novelty: 84, source: 'Reddit', post_count: 380 },
        { id: 9, topic: 'Zero to $10K MRR in 90 days with AI tools', niche: 'Business', trend_score: 77, growth_velocity: 'medium', search_interest: 74, engagement_potential: 80, novelty: 76, source: 'LinkedIn', post_count: 290 },
        { id: 10, topic: 'The truth about influencer marketing ROI', niche: 'Creator Economy', trend_score: 75, growth_velocity: 'low', search_interest: 72, engagement_potential: 78, novelty: 70, source: 'LinkedIn', post_count: 210 },
      ];

      const filtered = niche === 'all' ? mockTrends : mockTrends.filter((t) => t.niche.toLowerCase().includes(niche.toLowerCase()));

      return res.json({
        success: true,
        note: 'Demo mode — using mock trending data',
        data: { trends: filtered.slice(0, Number(limit)), generated_at: new Date().toISOString() },
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get trend details + auto-generate content for a trend
// @route   POST /api/trends/generate
// @access  Private
const generateFromTrend = async (req, res) => {
  try {
    const { trendId, topic, niche } = req.body;

    if (!topic) {
      return res.status(400).json({ success: false, message: 'Topic is required' });
    }

    const aiResponse = await axios.post(`${AI_ENGINE_URL}/api/trends/generate`, {
      trend_id: trendId,
      topic,
      niche,
    });

    res.json({ success: true, data: aiResponse.data });
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      return res.json({
        success: true,
        note: 'Demo mode',
        data: {
          topic,
          reel_script: {
            hook: `Everyone is talking about "${topic}" — here's what you NEED to know 🔥`,
            story: `This trend is reshaping how we think about ${niche}. Let me break it down in 60 seconds...`,
            key_insights: [
              'The data shows 3x growth in the last 30 days',
              'Top creators in this space are getting 10x normal reach',
              'Here is exactly how to position yourself right now',
            ],
            cta: 'Save this, share it with someone who needs to see it, and follow for more!',
            duration: '50 seconds',
          },
          virality_score: Math.floor(Math.random() * 15) + 80,
          linkedin_post: `Hot take on "${topic}":\n\nMost people are missing the real opportunity here.\n\nHere's my breakdown 👇\n\n#${niche.replace(/\s/g, '')} #Trending #Innovation`,
          instagram_caption: `"${topic}" is blowing up right now 🚀\n\nAre you paying attention? 👀\n\nSave this post! 📌\n\n#Trending #${niche.replace(/\s/g, '')} #Viral`,
        },
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTrends, generateFromTrend };
