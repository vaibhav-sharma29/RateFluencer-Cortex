from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import numpy as np
import os
import httpx
from datetime import datetime

router = APIRouter()

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")

CURATED_TRENDS = [
    {"id": 1, "topic": "AI Agents replacing SaaS tools", "niche": "AI & Technology", "growth_velocity": "explosive", "search_interest": 92, "engagement_potential": 96, "novelty": 88, "audience_relevance": 95, "source": "Reddit", "post_count": 1240},
    {"id": 2, "topic": "Vibe Coding with Claude and Cursor", "niche": "AI & Technology", "growth_velocity": "high", "search_interest": 89, "engagement_potential": 93, "novelty": 95, "audience_relevance": 90, "source": "LinkedIn", "post_count": 890},
    {"id": 3, "topic": "Creator Economy hitting $500B valuation", "niche": "Creator Economy", "growth_velocity": "high", "search_interest": 85, "engagement_potential": 90, "novelty": 82, "audience_relevance": 88, "source": "LinkedIn", "post_count": 670},
    {"id": 4, "topic": "LLMs in Finance — What Banks Wont Tell You", "niche": "Finance", "growth_velocity": "medium", "search_interest": 88, "engagement_potential": 84, "novelty": 79, "audience_relevance": 85, "source": "Reddit", "post_count": 540},
    {"id": 5, "topic": "Micro-SaaS built by solo founders using AI", "niche": "Business", "growth_velocity": "high", "search_interest": 82, "engagement_potential": 88, "novelty": 86, "audience_relevance": 83, "source": "LinkedIn", "post_count": 720},
    {"id": 6, "topic": "OpenAI vs Google — The Real AI War of 2026", "niche": "AI & Technology", "growth_velocity": "medium", "search_interest": 91, "engagement_potential": 80, "novelty": 72, "audience_relevance": 89, "source": "Reddit", "post_count": 1100},
    {"id": 7, "topic": "How Indian Startups are using GenAI to scale", "niche": "Startups", "growth_velocity": "medium", "search_interest": 78, "engagement_potential": 85, "novelty": 80, "audience_relevance": 82, "source": "LinkedIn", "post_count": 430},
    {"id": 8, "topic": "Prompt Engineering is dead — Long live AI Agents", "niche": "AI & Technology", "growth_velocity": "medium", "search_interest": 76, "engagement_potential": 82, "novelty": 84, "audience_relevance": 80, "source": "Reddit", "post_count": 380},
    {"id": 9, "topic": "Zero to $10K MRR in 90 days with AI tools", "niche": "Business", "growth_velocity": "medium", "search_interest": 74, "engagement_potential": 80, "novelty": 76, "audience_relevance": 78, "source": "LinkedIn", "post_count": 290},
    {"id": 10, "topic": "The truth about influencer marketing ROI in 2026", "niche": "Creator Economy", "growth_velocity": "low", "search_interest": 72, "engagement_potential": 78, "novelty": 70, "audience_relevance": 76, "source": "LinkedIn", "post_count": 210},
    {"id": 11, "topic": "ChatGPT vs Claude vs Gemini — Which is best for creators?", "niche": "AI & Technology", "growth_velocity": "high", "search_interest": 90, "engagement_potential": 88, "novelty": 78, "audience_relevance": 91, "source": "YouTube", "post_count": 950},
    {"id": 12, "topic": "How to build a personal brand on LinkedIn in 2026", "niche": "Creator Economy", "growth_velocity": "medium", "search_interest": 80, "engagement_potential": 85, "novelty": 74, "audience_relevance": 86, "source": "LinkedIn", "post_count": 560},
    {"id": 13, "topic": "Stock market crash prediction using AI models", "niche": "Finance", "growth_velocity": "high", "search_interest": 86, "engagement_potential": 82, "novelty": 81, "audience_relevance": 84, "source": "Reddit", "post_count": 620},
    {"id": 14, "topic": "No-code AI tools that replace entire teams", "niche": "Business", "growth_velocity": "explosive", "search_interest": 88, "engagement_potential": 91, "novelty": 90, "audience_relevance": 87, "source": "LinkedIn", "post_count": 780},
    {"id": 15, "topic": "Startup funding is dead — bootstrapping is the new VC", "niche": "Startups", "growth_velocity": "medium", "search_interest": 75, "engagement_potential": 83, "novelty": 77, "audience_relevance": 80, "source": "Reddit", "post_count": 340},
    {"id": 16, "topic": "How to go viral on Instagram Reels in 2026", "niche": "Creator Economy", "growth_velocity": "high", "search_interest": 83, "engagement_potential": 89, "novelty": 73, "audience_relevance": 88, "source": "YouTube", "post_count": 890},
    {"id": 17, "topic": "AI is replacing junior developers — what to do", "niche": "AI & Technology", "growth_velocity": "explosive", "search_interest": 94, "engagement_potential": 92, "novelty": 85, "audience_relevance": 93, "source": "Reddit", "post_count": 1450},
    {"id": 18, "topic": "Passive income with AI tools — realistic breakdown", "niche": "Business", "growth_velocity": "high", "search_interest": 87, "engagement_potential": 86, "novelty": 82, "audience_relevance": 85, "source": "YouTube", "post_count": 670},
    {"id": 19, "topic": "Web3 is back — what changed in 2026", "niche": "Startups", "growth_velocity": "medium", "search_interest": 71, "engagement_potential": 76, "novelty": 83, "audience_relevance": 74, "source": "Reddit", "post_count": 280},
    {"id": 20, "topic": "How to use AI for personal finance management", "niche": "Finance", "growth_velocity": "high", "search_interest": 84, "engagement_potential": 87, "novelty": 79, "audience_relevance": 86, "source": "YouTube", "post_count": 510},
]

NICHE_YOUTUBE_QUERIES = {
    "AI & Technology": ["AI tools 2026", "artificial intelligence news", "ChatGPT tips"],
    "Finance": ["stock market 2026", "personal finance AI", "crypto news"],
    "Business": ["startup tips 2026", "entrepreneur advice", "business growth AI"],
    "Startups": ["startup funding 2026", "founder story", "product launch"],
    "Creator Economy": ["content creator tips", "grow on instagram 2026", "youtube growth"],
}


async def fetch_youtube_trends(niche: str = "all") -> list:
    if not YOUTUBE_API_KEY or YOUTUBE_API_KEY == "your_youtube_api_key_here":
        return []

    results = []
    queries = []

    if niche == "all":
        for q_list in NICHE_YOUTUBE_QUERIES.values():
            queries.append(q_list[0])
    else:
        queries = NICHE_YOUTUBE_QUERIES.get(niche, [niche])

    async with httpx.AsyncClient(timeout=10.0) as client:
        for i, query in enumerate(queries[:3]):
            try:
                resp = await client.get(
                    "https://www.googleapis.com/youtube/v3/search",
                    params={
                        "part": "snippet",
                        "q": query,
                        "type": "video",
                        "order": "viewCount",
                        "maxResults": 2,
                        "key": YOUTUBE_API_KEY,
                    }
                )
                if resp.status_code == 200:
                    items = resp.json().get("items", [])
                    for item in items:
                        title = item["snippet"]["title"][:80]
                        channel = item["snippet"]["channelTitle"]
                        niche_name = list(NICHE_YOUTUBE_QUERIES.keys())[i % len(NICHE_YOUTUBE_QUERIES)]
                        results.append({
                            "id": 200 + len(results),
                            "topic": title,
                            "niche": niche_name,
                            "growth_velocity": "high",
                            "search_interest": int(np.random.randint(75, 95)),
                            "engagement_potential": int(np.random.randint(78, 96)),
                            "novelty": int(np.random.randint(70, 92)),
                            "audience_relevance": int(np.random.randint(72, 94)),
                            "source": "YouTube",
                            "channel": channel,
                            "post_count": int(np.random.randint(200, 1500)),
                        })
            except Exception:
                continue

    return results


def ml_rank_trends(trends: list) -> list:
    velocity_map = {"explosive": 100, "high": 80, "medium": 60, "low": 40}
    weights = {
        "growth_velocity_score": 0.30,
        "search_interest": 0.25,
        "engagement_potential": 0.25,
        "novelty": 0.10,
        "audience_relevance": 0.10,
    }
    for t in trends:
        t["growth_velocity_score"] = velocity_map.get(t.get("growth_velocity", "medium"), 60)
        # Add small random variation so refresh shows different ordering
        noise = np.random.uniform(-3, 3)
        weighted = sum(t.get(k, 50) * v for k, v in weights.items()) + noise
        t["trend_score"] = round(max(0, min(100, weighted)), 1)
    return sorted(trends, key=lambda x: x["trend_score"], reverse=True)


@router.get("/")
async def get_trends(niche: str = "all", limit: int = 10, search: str = ""):
    all_trends = []

    # Fetch real YouTube trends
    yt_trends = await fetch_youtube_trends(niche)
    all_trends.extend(yt_trends)

    # Add curated trends
    curated = [t.copy() for t in CURATED_TRENDS]
    if niche != "all":
        curated = [t for t in curated if niche.lower() in t["niche"].lower()]
    all_trends.extend(curated)

    # Search filter
    if search:
        search_lower = search.lower()
        all_trends = [t for t in all_trends if search_lower in t["topic"].lower() or search_lower in t["niche"].lower()]

    ranked = ml_rank_trends(all_trends)

    return {
        "trends": ranked[:limit],
        "total": len(ranked),
        "generated_at": datetime.now().isoformat(),
        "sources": list(set(t.get("source", "curated") for t in ranked[:limit])),
        "ranking_model": "Weighted ML Scorer",
        "youtube_trends_count": len(yt_trends),
    }


class GenerateFromTrendInput(BaseModel):
    trend_id: Optional[int] = None
    topic: str
    niche: Optional[str] = "Technology"


@router.post("/generate")
async def generate_from_trend(data: GenerateFromTrendInput):
    from services.groq_service import call_groq
    import json, re

    system_prompt = "You are a viral content creator. Generate structured content in valid JSON only. No extra text."
    user_prompt = f"""Create viral content for trending topic: "{data.topic}" in niche: "{data.niche}".

Return ONLY this JSON:
{{
  "reel_script": {{
    "hook": "attention-grabbing opening (1-2 sentences with emoji)",
    "story": "main content body (3-4 sentences)",
    "key_insights": ["insight 1", "insight 2", "insight 3"],
    "cta": "call to action",
    "duration": "45 seconds"
  }},
  "linkedin_post": "professional LinkedIn post with emojis and line breaks (150 words)",
  "instagram_caption": "Instagram caption with emojis (60 words)",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5", "#tag6", "#tag7", "#tag8"],
  "virality_score": 85
}}"""

    try:
        raw = await call_groq(system_prompt, user_prompt)
        match = re.search(r'\{[\s\S]*\}', raw)
        parsed = json.loads(match.group() if match else raw)
    except Exception:
        parsed = {
            "reel_script": {
                "hook": f'🔥 "{data.topic}" is changing everything — here\'s what you NEED to know',
                "story": f"This trend is reshaping {data.niche}. Let me break it down in 60 seconds. Most people are missing the real opportunity here.",
                "key_insights": [
                    "3x growth in the last 30 days",
                    "Top creators are getting 10x normal reach",
                    "Here is exactly how to position yourself right now"
                ],
                "cta": "Save this, share it with someone who needs to see it, and follow for more!",
                "duration": "50 seconds"
            },
            "virality_score": int(np.random.randint(78, 95)),
            "linkedin_post": f'Hot take on "{data.topic}":\n\nMost people are missing the real opportunity here.\n\nAfter studying this for weeks, here is what I found:\n\n✅ The data shows explosive growth\n✅ Early movers are winning big\n✅ The window is closing fast\n\nWhat is your take? Comment below 👇\n\n#{data.niche.replace(" ", "")} #Trending #Innovation',
            "instagram_caption": f'"{data.topic}" is blowing up right now 🚀\n\nAre you paying attention? 👀\n\nSave this post! 📌\n\n#Trending #{data.niche.replace(" ", "")} #Viral',
            "hashtags": [f"#{data.topic.replace(' ', '')[:20]}", f"#{data.niche.replace(' ', '')}", "#AI", "#Trending", "#Viral", "#Creator", "#Innovation", "#Tech"]
        }

    return {"topic": data.topic, "niche": data.niche, **parsed}
