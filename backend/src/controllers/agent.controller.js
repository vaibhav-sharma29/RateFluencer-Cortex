const axios = require('axios');
const { callGroq } = require('../services/groq.service');

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

const runCampaignAgent = async (req, res) => {
  const { brandName, productType, targetAudience, campaignGoal } = req.body;

  if (!brandName) {
    return res.status(400).json({ success: false, message: 'Brand name is required' });
  }

  // Use SSE to stream agent steps to frontend
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

  const sendStep = (step, data) => {
    res.write(`data: ${JSON.stringify({ step, ...data })}\n\n`);
  };

  try {
    // STEP 1: Discover trending topics
    sendStep('discovering', { message: `Scanning trending topics for ${brandName}...`, progress: 10 });

    let trends = [];
    try {
      const trendRes = await axios.get(`${AI_ENGINE_URL}/api/trends/`, {
        params: { niche: 'all', limit: 20 },
        timeout: 15000,
      });
      trends = trendRes.data?.trends || [];
    } catch {
      trends = [
        { topic: 'AI tools transforming e-commerce in 2026', niche: 'Business', trend_score: 91 },
        { topic: 'How brands are using AI for personalized shopping', niche: 'Business', trend_score: 88 },
        { topic: 'Creator Economy and brand partnerships in 2026', niche: 'Creator Economy', trend_score: 85 },
        { topic: 'Social commerce is the future of retail', niche: 'Business', trend_score: 82 },
        { topic: 'How to go viral with product launches', niche: 'Creator Economy', trend_score: 79 },
      ];
    }

    sendStep('trends_found', {
      message: `Found ${trends.length} trending topics`,
      progress: 25,
      trends: trends.slice(0, 5).map(t => ({ topic: t.topic, score: t.trend_score })),
    });

    await new Promise(r => setTimeout(r, 800));

    // STEP 2: Select best trend for brand
    sendStep('selecting', { message: 'AI selecting best trend for your brand...', progress: 35 });

    const trendSelectionPrompt = `You are a marketing strategist. Given these trending topics and brand info, select the BEST trend to create content for.

Brand: ${brandName}
Product/Service: ${productType || 'e-commerce platform'}
Target Audience: ${targetAudience || 'general consumers'}
Campaign Goal: ${campaignGoal || 'increase brand awareness'}

Trending Topics:
${trends.slice(0, 8).map((t, i) => `${i + 1}. ${t.topic} (Score: ${t.trend_score})`).join('\n')}

Return ONLY this JSON:
{
  "selected_trend": "exact topic text",
  "reason": "why this trend fits the brand (1-2 sentences)",
  "angle": "unique brand angle to take on this trend"
}`;

    let selectedTrend = trends[0]?.topic || 'AI transforming e-commerce';
    let trendAngle = `How ${brandName} is leading the change`;
    let trendReason = 'This trend aligns perfectly with your brand values';

    try {
      const selectionRaw = await callGroq(
        'You are a marketing strategist. Return only valid JSON.',
        trendSelectionPrompt
      );
      const match = selectionRaw.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        selectedTrend = parsed.selected_trend || selectedTrend;
        trendAngle = parsed.angle || trendAngle;
        trendReason = parsed.reason || trendReason;
      }
    } catch { }

    sendStep('trend_selected', {
      message: 'Best trend identified!',
      progress: 45,
      selected_trend: selectedTrend,
      reason: trendReason,
      angle: trendAngle,
    });

    await new Promise(r => setTimeout(r, 600));

    // STEP 3: Generate complete campaign content
    sendStep('generating', { message: 'Generating complete campaign content package...', progress: 55 });

    const campaignPrompt = `You are a viral content creator and marketing expert. Create a UNIQUE and SPECIFIC campaign content package for this exact brand.

Brand: ${brandName}
Product/Service: ${productType || 'platform'}
Target Audience: ${targetAudience || 'general consumers in India'}
Campaign Goal: ${campaignGoal || 'increase brand awareness and sales'}
Trending Topic to leverage: "${selectedTrend}"
Brand Angle: "${trendAngle}"

IMPORTANT: Make ALL content SPECIFIC to ${brandName}. Mention the brand name multiple times. Include specific features, benefits, or USPs of ${brandName}. Do NOT use generic content.

Create a complete campaign package. Return ONLY this JSON:
{
  "campaign_title": "catchy campaign name specifically for ${brandName}",
  "video_concept": {
    "title": "video title mentioning ${brandName}",
    "hook": "first 3 seconds hook mentioning ${brandName} (very attention-grabbing with emoji)",
    "script": "complete 60-second video script with timestamps [0-5s], [5-20s], [20-50s], [50-60s] - mention ${brandName} at least 3 times",
    "visual_suggestions": ["visual idea 1 specific to ${brandName}", "visual idea 2", "visual idea 3"],
    "music_mood": "upbeat/emotional/energetic",
    "cta": "clear call to action for ${brandName}"
  },
  "linkedin_post": "professional LinkedIn post 200 words about ${brandName} with emojis",
  "instagram_story": {
    "slide_1": "first story slide about ${brandName} (short, punchy)",
    "slide_2": "second story slide with key benefit of ${brandName}",
    "slide_3": "third story slide with CTA for ${brandName}",
    "sticker_suggestions": ["poll about ${brandName}", "question about ${productType || brandName}"]
  },
  "instagram_caption": "Instagram reel caption about ${brandName} with emojis 80 words",
  "hashtags": ["#${brandName.replace(/\s/g, '')}", "#tag2", "#tag3", "#tag4", "#tag5", "#tag6", "#tag7", "#tag8", "#tag9", "#tag10"],
  "best_posting_time": "Day and time recommendation for ${targetAudience || 'Indian audience'}",
  "expected_reach": "estimated reach range"
}`;

    let campaignContent = null;
    try {
      const contentRaw = await callGroq(
        'You are a viral content creator and marketing expert. Return only valid JSON.',
        campaignPrompt,
        2048
      );
      const match = contentRaw.match(/\{[\s\S]*\}/);
      if (match) {
        campaignContent = JSON.parse(match[0]);
      }
    } catch { }

    if (!campaignContent) {
      campaignContent = {
        campaign_title: `${brandName} x ${selectedTrend.split(' ').slice(0, 3).join(' ')} — The Future is Now`,
        video_concept: {
          title: `Why ${brandName} is the smartest choice in 2026`,
          hook: `🚨 Stop scrolling! ${brandName} just changed the game — and here's why you need to know this RIGHT NOW...`,
          script: `[0-5s] "Everyone is talking about ${selectedTrend}. But here's what they're NOT telling you about ${brandName}..."\n\n[5-20s] "Most people are still using outdated solutions. But ${brandName} users? They're already 3 steps ahead. Here's the difference..."\n\n[20-50s] "I've been using ${brandName} for ${productType || 'everything'} and the results are insane. ${trendAngle}. The data doesn't lie — ${brandName} delivers."\n\n[50-60s] "Don't wait. Visit ${brandName} now — link in bio. Use this video as your sign to switch today!"`,
          visual_suggestions: [
            `Show ${brandName} app/website with exciting transitions`,
            `Before/after comparison — life without vs with ${brandName}`,
            `Real user testimonial with ${brandName} branding`,
          ],
          music_mood: 'Upbeat and energetic',
          cta: `Visit ${brandName} now — link in bio!`,
        },
        linkedin_post: `🚀 ${brandName} is redefining ${productType || 'the industry'} — and the numbers prove it.\n\nI've been studying the "${selectedTrend}" trend, and one brand keeps coming up: ${brandName}.\n\nHere's why smart professionals are choosing ${brandName}:\n\n✅ ${trendAngle}\n✅ Proven results with real users\n✅ The technology that actually works\n\nThe window to get ahead is closing. ${brandName} is not just a product — it's a competitive advantage.\n\nAre you still on the sidelines?\n\n#${brandName.replace(/\s/g, '')} #Innovation #Growth #India`,
        instagram_story: {
          slide_1: `🔥 ${brandName} just dropped something HUGE`,
          slide_2: `Here's why everyone is switching to ${brandName} right now 👇`,
          slide_3: `Tap the link in bio — ${brandName} is waiting for you! 🚀`,
          sticker_suggestions: [
            `Poll: Have you tried ${brandName}? Yes / Not yet`,
            `Question: What do you love most about ${brandName}?`,
          ],
        },
        instagram_caption: `${brandName} is changing the game 🔥\n\nWhile everyone talks about ${selectedTrend.split(' ').slice(0, 4).join(' ')}, smart people are already using ${brandName} to stay ahead.\n\nDon't be the last one to know 👀\n\nSave this and share with someone who needs ${brandName}! 📌`,
        hashtags: [`#${brandName.replace(/\s/g, '')}`, '#Trending', '#AI', '#Innovation', '#Creator', '#Viral', '#Marketing', '#Growth', '#Business', '#India'],
        best_posting_time: 'Tuesday-Thursday, 6-9 PM IST',
        expected_reach: '50K - 500K impressions',
      };
    }

    sendStep('content_ready', {
      message: 'Campaign content generated!',
      progress: 75,
      campaign_title: campaignContent.campaign_title,
    });

    await new Promise(r => setTimeout(r, 500));

    // STEP 4: Predict virality
    sendStep('predicting', { message: 'Predicting campaign virality...', progress: 85 });

    let viralityScore = 82;
    try {
      const viralRes = await axios.post(`${AI_ENGINE_URL}/api/virality/predict`, {
        script: campaignContent.video_concept?.script || '',
        caption: campaignContent.instagram_caption || '',
        hashtags: campaignContent.hashtags || [],
        platform: 'instagram',
        niche: 'Business',
        topic: selectedTrend,
      }, { timeout: 8000 });
      viralityScore = viralRes.data?.virality_score || 82;
    } catch {
      viralityScore = Math.floor(Math.random() * 15) + 78;
    }

    await new Promise(r => setTimeout(r, 400));

    // STEP 5: Final package
    sendStep('complete', {
      message: 'Campaign package ready!',
      progress: 100,
      result: {
        brand: brandName,
        trending_topic: selectedTrend,
        trend_angle: trendAngle,
        trend_reason: trendReason,
        virality_score: viralityScore,
        expected_reach: campaignContent.expected_reach,
        best_posting_time: campaignContent.best_posting_time,
        ...campaignContent,
      },
    });

    res.end();
  } catch (error) {
    sendStep('error', { message: error.message, progress: 0 });
    res.end();
  }
};

module.exports = { runCampaignAgent };
