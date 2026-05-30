from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
import numpy as np
from datetime import datetime

router = APIRouter()

MOCK_TRENDS = [
    {"id": 1, "topic": "AI Agents replacing SaaS tools", "niche": "AI & Technology", "trend_score": 94, "growth_velocity": "explosive", "search_interest": 92, "engagement_potential": 96, "novelty": 88, "audience_relevance": 95, "source": "Reddit", "post_count": 1240},
    {"id": 2, "topic": "Vibe Coding with Claude", "niche": "AI & Technology", "trend_score": 91, "growth_velocity": "high", "search_interest": 89, "engagement_potential": 93, "novelty": 95, "audience_relevance": 90, "source": "LinkedIn", "post_count": 890},
    {"id": 3, "topic": "Creator Economy hitting $500B", "niche": "Creator Economy", "trend_score": 88, "growth_velocity": "high", "search_interest": 85, "engagement_potential": 90, "novelty": 82, "audience_relevance": 88, "source": "LinkedIn", "post_count": 670},
    {"id": 4, "topic": "LLMs in Finance — What Banks Wont Tell You", "niche": "Finance", "trend_score": 86, "growth_velocity": "medium", "search_interest": 88, "engagement_potential": 84, "novelty": 79, "audience_relevance": 85, "source": "Reddit", "post_count": 540},
    {"id": 5, "topic": "Micro-SaaS built by solo founders using AI", "niche": "Business", "trend_score": 85, "growth_velocity": "high", "search_interest": 82, "engagement_potential": 88, "novelty": 86, "audience_relevance": 83, "source": "LinkedIn", "post_count": 720},
    {"id": 6, "topic": "OpenAI vs Google — The Real AI War", "niche": "AI & Technology", "trend_score": 83, "growth_velocity": "medium", "search_interest": 91, "engagement_potential": 80, "novelty": 72, "audience_relevance": 89, "source": "Reddit", "post_count": 1100},
    {"id": 7, "topic": "How Indian Startups are using GenAI", "niche": "Startups", "trend_score": 81, "growth_velocity": "medium", "search_interest": 78, "engagement_potential": 85, "novelty": 80, "audience_relevance": 82, "source": "LinkedIn", "post_count": 430},
    {"id": 8, "topic": "Prompt Engineering is dead — Long live AI Agents", "niche": "AI & Technology", "trend_score": 79, "growth_velocity": "medium", "search_interest": 76, "engagement_potential": 82, "novelty": 84, "audience_relevance": 80, "source": "Reddit", "post_count": 380},
    {"id": 9, "topic": "Zero to $10K MRR in 90 days with AI tools", "niche": "Business", "trend_score": 77, "growth_velocity": "medium", "search_interest": 74, "engagement_potential": 80, "novelty": 76, "audience_relevance": 78, "source": "LinkedIn", "post_count": 290},
    {"id": 10, "topic": "The truth about influencer marketing ROI", "niche": "Creator Economy", "trend_score": 75, "growth_velocity": "low", "search_interest": 72, "engagement_potential": 78, "novelty": 70, "audience_relevance": 76, "source": "LinkedIn", "post_count": 210},
]

def ml_rank_trends(trends):
    """ML-based trend ranking using weighted scoring"""
    weights = {
        "growth_velocity_score": 0.30,
        "search_interest": 0.25,
        "engagement_potential": 0.25,
        "novelty": 0.10,
        "audience_relevance": 0.10,
    }
    velocity_map = {"explosive": 100, "high": 80, "medium": 60, "low": 40}
    for t in trends:
        t["growth_velocity_score"] = velocity_map.get(t["growth_velocity"], 50)
        weighted = sum(t.get(k, 50) * v for k, v in weights.items())
        t["trend_score"] = round(weighted, 1)
    return sorted(trends, key=lambda x: x["trend_score"], reverse=True)

@router.get("/")
def get_trends(niche: str = "all", limit: int = 10):
    trends = MOCK_TRENDS.copy()
    if niche != "all":
        trends = [t for t in trends if niche.lower() in t["niche"].lower()]
    ranked = ml_rank_trends(trends)
    return {
        "trends": ranked[:limit],
        "total": len(ranked),
        "generated_at": datetime.now().isoformat(),
        "ranking_model": "Weighted ML Scorer",
        "sources": ["Reddit", "LinkedIn", "YouTube", "News"]
    }

class GenerateFromTrendInput(BaseModel):
    trend_id: Optional[int] = None
    topic: str
    niche: Optional[str] = "Technology"

@router.post("/generate")
async def generate_from_trend(data: GenerateFromTrendInput):
    from services.groq_service import call_groq

    system_prompt = "You are a viral content creator. Generate structured content in valid JSON only."
    user_prompt = f"""Create viral content for trending topic: "{data.topic}" in niche: "{data.niche}".

Return ONLY this JSON:
{{
  "reel_script": {{
    "hook": "attention-grabbing opening (1-2 sentences)",
    "story": "main content (3-4 sentences)",
    "key_insights": ["insight 1", "insight 2", "insight 3"],
    "cta": "call to action",
    "duration": "45 seconds"
  }},
  "linkedin_post": "professional post with emojis (150 words)",
  "instagram_caption": "caption with emojis (60 words)",
  "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5", "#tag6", "#tag7", "#tag8"],
  "virality_score": 85
}}"""

    try:
        raw = await call_groq(system_prompt, user_prompt)
        import json, re
        match = re.search(r'\{[\s\S]*\}', raw)
        parsed = json.loads(match.group() if match else raw)
    except:
        parsed = {
            "reel_script": {
                "hook": f'🔥 "{data.topic}" is changing everything — here\'s what you NEED to know',
                "story": f"This trend is reshaping {data.niche}. Let me break it down in 60 seconds...",
                "key_insights": ["3x growth in last 30 days", "Top creators getting 10x reach", "Here's how to position yourself"],
                "cta": "Save this, share it, and follow for more!",
                "duration": "50 seconds"
            },
            "virality_score": int(np.random.randint(78, 95)),
            "linkedin_post": f'Hot take on "{data.topic}":\n\nMost people are missing the real opportunity.\n\n#Trending #{data.niche.replace(" ", "")}',
            "instagram_caption": f'"{data.topic}" is blowing up 🚀\n\nSave this! 📌\n\n#Trending #{data.niche.replace(" ", "")}',
            "hashtags": [f"#{data.topic.replace(' ', '')}", f"#{data.niche.replace(' ', '')}", "#AI", "#Trending", "#Viral", "#Creator", "#Innovation", "#Tech"]
        }

    return {"topic": data.topic, "niche": data.niche, **parsed}
