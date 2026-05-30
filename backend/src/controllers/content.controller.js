const axios = require('axios');

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

// @desc    Generate reel script + captions from a topic
// @route   POST /api/content/generate
// @access  Private
const generateContent = async (req, res) => {
  try {
    const { topic, platform = 'instagram', tone = 'engaging', niche = 'Technology' } = req.body;

    if (!topic) {
      return res.status(400).json({ success: false, message: 'Topic is required' });
    }

    const aiResponse = await axios.post(`${AI_ENGINE_URL}/api/content/generate`, {
      topic,
      platform,
      tone,
      niche,
    });

    res.json({ success: true, data: aiResponse.data });
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      // Mock response for demo
      return res.json({
        success: true,
        note: 'Demo mode — AI Engine offline',
        data: {
          topic,
          reel_script: {
            hook: `🚀 Did you know ${topic} is changing everything in 2026?`,
            story: `Here's what most people don't understand about ${topic}. While everyone is focused on the surface level, the real transformation is happening underneath...`,
            key_insights: [
              `${topic} is growing at 3x the rate of traditional methods`,
              'Early adopters are seeing 10x better results',
              'The window to get ahead is closing fast',
            ],
            cta: `Follow for daily insights on ${topic} and drop a 🔥 if this was helpful!`,
            duration: '45 seconds',
          },
          linkedin_post: `I've been studying ${topic} for the past 6 months, and here's what I've learned:\n\n✅ It's not just a trend — it's a fundamental shift\n✅ The companies ignoring it will struggle in 3 years\n✅ The opportunity right now is massive\n\nWhat's your take on ${topic}? Comment below 👇\n\n#${topic.replace(/\s/g, '')} #Innovation #Technology #AI`,
          instagram_caption: `${topic} is the future 🚀\n\nAre you ready? Save this post for later! 📌\n\n#${topic.replace(/\s/g, '')} #Tech #AI #Innovation #Creator`,
          hashtags: [`#${topic.replace(/\s/g, '')}`, '#AI', '#Technology', '#Innovation', '#Creator', '#Viral'],
          virality_score: Math.floor(Math.random() * 20) + 75,
        },
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Predict virality of content
// @route   POST /api/content/predict-virality
// @access  Private
const predictVirality = async (req, res) => {
  try {
    const { script, caption, hashtags, platform, niche } = req.body;

    const aiResponse = await axios.post(`${AI_ENGINE_URL}/api/virality/predict`, {
      script,
      caption,
      hashtags,
      platform,
      niche,
    });

    res.json({ success: true, data: aiResponse.data });
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      return res.json({
        success: true,
        note: 'Demo mode',
        data: {
          virality_score: Math.floor(Math.random() * 25) + 70,
          expected_views: `${Math.floor(Math.random() * 500 + 100)}K`,
          expected_likes: `${Math.floor(Math.random() * 50 + 10)}K`,
          expected_shares: `${Math.floor(Math.random() * 10 + 2)}K`,
          expected_saves: `${Math.floor(Math.random() * 15 + 5)}K`,
          confidence: 0.82,
          suggestions: [
            'Add a stronger hook in the first 3 seconds',
            'Use trending audio for better reach',
            'Post between 6-9 PM for maximum engagement',
          ],
        },
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { generateContent, predictVirality };
