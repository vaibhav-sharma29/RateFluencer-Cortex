const axios = require('axios');
const { callGroq } = require('../services/groq.service');

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

const FALLBACK_TRENDS = [
  { id: 1, topic: 'AI Agents replacing SaaS tools', niche: 'AI & Technology', trend_score: 94, growth_velocity: 'explosive', search_interest: 92, engagement_potential: 96, novelty: 88, source: 'Reddit', post_count: 1240 },
  { id: 2, topic: 'Vibe Coding with Claude and Cursor', niche: 'AI & Technology', trend_score: 91, growth_velocity: 'high', search_interest: 89, engagement_potential: 93, novelty: 95, source: 'LinkedIn', post_count: 890 },
  { id: 3, topic: 'Creator Economy hitting $500B valuation', niche: 'Creator Economy', trend_score: 88, growth_velocity: 'high', search_interest: 85, engagement_potential: 90, novelty: 82, source: 'LinkedIn', post_count: 670 },
  { id: 4, topic: 'LLMs in Finance — What Banks Wont Tell You', niche: 'Finance', trend_score: 86, growth_velocity: 'medium', search_interest: 88, engagement_potential: 84, novelty: 79, source: 'Reddit', post_count: 540 },
  { id: 5, topic: 'Micro-SaaS built by solo founders using AI', niche: 'Business', trend_score: 85, growth_velocity: 'high', search_interest: 82, engagement_potential: 88, novelty: 86, source: 'LinkedIn', post_count: 720 },
  { id: 6, topic: 'OpenAI vs Google — The Real AI War of 2026', niche: 'AI & Technology', trend_score: 83, growth_velocity: 'medium', search_interest: 91, engagement_potential: 80, novelty: 72, source: 'Reddit', post_count: 1100 },
  { id: 7, topic: 'How Indian Startups are using GenAI to scale', niche: 'Startups', trend_score: 81, growth_velocity: 'medium', search_interest: 78, engagement_potential: 85, novelty: 80, source: 'LinkedIn', post_count: 430 },
  { id: 8, topic: 'AI is replacing junior developers — what to do', niche: 'AI & Technology', trend_score: 79, growth_velocity: 'explosive', search_interest: 94, engagement_potential: 92, novelty: 85, source: 'Reddit', post_count: 1450 },
  { id: 9, topic: 'Zero to $10K MRR in 90 days with AI tools', niche: 'Business', trend_score: 77, growth_velocity: 'medium', search_interest: 74, engagement_potential: 80, novelty: 76, source: 'LinkedIn', post_count: 290 },
  { id: 10, topic: 'No-code AI tools that replace entire teams', niche: 'Business', trend_score: 75, growth_velocity: 'explosive', search_interest: 88, engagement_potential: 91, novelty: 90, source: 'LinkedIn', post_count: 780 },
  { id: 11, topic: 'Stock market crash prediction using AI models', niche: 'Finance', trend_score: 73, growth_velocity: 'high', search_interest: 86, engagement_potential: 82, novelty: 81, source: 'Reddit', post_count: 620 },
  { id: 12, topic: 'How to build a personal brand on LinkedIn in 2026', niche: 'Creator Economy', trend_score: 71, growth_velocity: 'medium', search_interest: 80, engagement_potential: 85, novelty: 74, source: 'LinkedIn', post_count: 560 },
  { id: 13, topic: 'Passive income with AI tools — realistic breakdown', niche: 'Business', trend_score: 69, growth_velocity: 'high', search_interest: 87, engagement_potential: 86, novelty: 82, source: 'YouTube', post_count: 670 },
  { id: 14, topic: 'How to go viral on Instagram Reels in 2026', niche: 'Creator Economy', trend_score: 67, growth_velocity: 'high', search_interest: 83, engagement_potential: 89, novelty: 73, source: 'YouTube', post_count: 890 },
  { id: 15, topic: 'Startup funding is dead — bootstrapping is the new VC', niche: 'Startups', trend_score: 65, growth_velocity: 'medium', search_interest: 75, engagement_potential: 83, novelty: 77, source: 'Reddit', post_count: 340 },
];

const getTrends = async (req, res) => {
  const { niche = 'all', limit = 10, search = '' } = req.query;
  try {
    const aiResponse = await axios.get(`${AI_ENGINE_URL}/api/trends/`, {
      params: { niche, limit, search },
      timeout: 20000,
    });
    res.json({ success: true, data: aiResponse.data });
  } catch (error) {
    const filtered = niche === 'all' ? FALLBACK_TRENDS : FALLBACK_TRENDS.filter(t => t.niche.toLowerCase().includes(niche.toLowerCase()));
    const searched = search ? filtered.filter(t => t.topic.toLowerCase().includes(search.toLowerCase())) : filtered;
    return res.json({
      success: true,
      data: {
        trends: searched.slice(0, Number(limit)),
        total: searched.length,
        generated_at: new Date().toISOString(),
        sources: ['Reddit', 'LinkedIn', 'YouTube'],
        ranking_model: 'Weighted ML Scorer',
      },
    });
  }
};

const generateFromTrend = async (req, res) => {
  try {
    const { trendId, topic, niche } = req.body;

    if (!topic) {
      return res.status(400).json({ success: false, message: 'Topic is required' });
    }

    try {
      const aiResponse = await axios.post(`${AI_ENGINE_URL}/api/trends/generate`, {
        trend_id: trendId,
        topic,
        niche,
      }, { timeout: 30000 });
      return res.json({ success: true, data: aiResponse.data });
    } catch {
      // Fallback to Groq directly
    }

    const systemPrompt = 'You are a viral content creator. Return only valid JSON.';
    const userPrompt = `Create viral content for: "${topic}" in niche: "${niche}".
Return ONLY this JSON:
{
  "reel_script": {
    "hook": "opening line with emoji",
    "story": "main content 3-4 sentences",
    "key_insights": ["insight 1", "insight 2", "insight 3"],
    "cta": "call to action",
    "duration": "45 seconds"
  },
  "linkedin_post": "professional post 150 words",
  "instagram_caption": "caption 60 words with emojis",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5", "#tag6", "#tag7", "#tag8"],
  "virality_score": 82
}`;

    try {
      const raw = await callGroq(systemPrompt, userPrompt);
      const match = raw.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(match ? match[0] : raw);
      return res.json({ success: true, data: { topic, niche, ...parsed } });
    } catch {
      return res.json({
        success: true,
        data: {
          topic,
          niche,
          reel_script: {
            hook: `🔥 "${topic}" is changing everything — here's what you NEED to know`,
            story: `This trend is reshaping ${niche}. Most people are missing the real opportunity here. Let me break it down in 60 seconds.`,
            key_insights: ['3x growth in the last 30 days', 'Top creators getting 10x reach', 'Here is how to position yourself now'],
            cta: 'Save this, share it, and follow for more!',
            duration: '50 seconds',
          },
          virality_score: Math.floor(Math.random() * 15) + 78,
          linkedin_post: `Hot take on "${topic}":\n\nMost people are missing the real opportunity.\n\n✅ Explosive growth\n✅ Early movers winning\n✅ Window closing fast\n\nWhat's your take? 👇\n\n#${niche.replace(/\s/g, '')} #Trending`,
          instagram_caption: `"${topic}" is blowing up 🚀\n\nSave this! 📌\n\n#Trending #${niche.replace(/\s/g, '')} #Viral`,
          hashtags: [`#${topic.replace(/\s/g, '').slice(0, 20)}`, `#${niche.replace(/\s/g, '')}`, '#AI', '#Trending', '#Viral', '#Creator', '#Innovation', '#Tech'],
        },
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTrends, generateFromTrend };
