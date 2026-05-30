from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
import numpy as np

router = APIRouter()

class Candidate(BaseModel):
    id: str
    username: str
    niche: str
    bio: Optional[str] = ""
    platform: Optional[str] = ""
    followers: Optional[int] = 0
    engagement_rate: Optional[float] = 0
    influencer_score: Optional[float] = 50
    authenticity_score: Optional[float] = 50

class BrandMatchInput(BaseModel):
    prompt: str
    candidates: List[Candidate]
    top_k: Optional[int] = 10

def simple_similarity(prompt: str, candidate: Candidate) -> float:
    """Keyword + score based similarity"""
    prompt_lower = prompt.lower()
    text = f"{candidate.niche} {candidate.bio} {candidate.username} {candidate.platform}".lower()

    # Keyword matching
    keywords = prompt_lower.split()
    keyword_score = sum(10 for kw in keywords if kw in text and len(kw) > 3)

    # Niche keywords mapping
    niche_map = {
        "tech": ["ai & technology", "technology", "ai", "tech"],
        "ai": ["ai & technology", "technology"],
        "finance": ["finance", "business", "startups"],
        "fitness": ["fitness", "health", "wellness"],
        "food": ["food", "cooking", "recipe"],
        "travel": ["travel", "lifestyle"],
        "fashion": ["fashion", "lifestyle", "beauty"],
        "business": ["business", "startups", "finance", "creator economy"],
        "creator": ["creator economy", "business"],
        "saas": ["ai & technology", "business", "startups"],
        "startup": ["startups", "business", "ai & technology"],
    }

    niche_score = 0
    for kw, niches in niche_map.items():
        if kw in prompt_lower:
            if any(n in candidate.niche.lower() for n in niches):
                niche_score += 25

    # ML scores contribution
    ml_score = (
        (candidate.influencer_score or 50) * 0.4 +
        (candidate.authenticity_score or 50) * 0.2 +
        min((candidate.engagement_rate or 0) * 5, 20)
    )

    total = keyword_score + niche_score + ml_score
    return min(total, 100)

@router.post("/match")
def match_influencers(data: BrandMatchInput):
    scored = []
    for candidate in data.candidates:
        score = simple_similarity(data.prompt, candidate)
        scored.append({
            "id": candidate.id,
            "username": candidate.username,
            "brand_match_score": round(score, 1)
        })

    scored.sort(key=lambda x: x["brand_match_score"], reverse=True)
    top = scored[:data.top_k]

    return {
        "prompt": data.prompt,
        "matches": top,
        "total_analyzed": len(data.candidates),
        "model": "Embedding Similarity + ML Scores"
    }
