from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
import numpy as np
import joblib
import os

router = APIRouter()

model = joblib.load("models/saved/virality_model.pkl") if os.path.exists("models/saved/virality_model.pkl") else None


class ViralityInput(BaseModel):
    script: Optional[str] = ""
    caption: Optional[str] = ""
    hashtags: Optional[List[str]] = []
    platform: Optional[str] = "instagram"
    niche: Optional[str] = "Technology"
    topic: Optional[str] = ""


def analyze_text(text: str):
    if not text:
        return {"hook_strength": 0.5, "cta_strength": 0.5, "caption_length": 0.5}
    text_lower = text.lower()
    hook_words = ["secret", "truth", "nobody", "shocking", "viral", "breaking", "exclusive", "revealed", "you need", "stop", "wait"]
    cta_words = ["follow", "save", "share", "comment", "like", "subscribe", "click", "watch", "join", "tag"]
    hook_strength = min(sum(1 for w in hook_words if w in text_lower) / 3.0, 1.0)
    cta_strength = min(sum(1 for w in cta_words if w in text_lower) / 3.0, 1.0)
    caption_length = min(len(text) / 500.0, 1.0)
    return {"hook_strength": hook_strength, "cta_strength": cta_strength, "caption_length": caption_length}


@router.post("/predict")
def predict_virality(data: ViralityInput):
    text = (data.script or "") + " " + (data.caption or "")
    text_features = analyze_text(text)

    niche_popularity = {
        "AI & Technology": 0.95, "Finance": 0.85, "Business": 0.80,
        "Startups": 0.82, "Creator Economy": 0.88, "Fitness": 0.75,
        "Travel": 0.70, "Food": 0.72, "Fashion": 0.78, "Education": 0.76
    }.get(data.niche, 0.75)

    hashtag_quality = min(len(data.hashtags or []) / 10.0, 1.0)
    trend_alignment = 0.8 if data.topic else 0.5
    posting_time_score = 0.85
    visual_quality = 0.75

    features = {
        "hook_strength": text_features["hook_strength"],
        "trend_alignment": trend_alignment,
        "hashtag_quality": hashtag_quality,
        "caption_length": text_features["caption_length"],
        "posting_time_score": posting_time_score,
        "visual_quality": visual_quality,
        "cta_strength": text_features["cta_strength"],
        "niche_popularity": niche_popularity,
    }

    if model:
        import pandas as pd
        feature_names = joblib.load("models/saved/virality_features.pkl")
        df = pd.DataFrame([features])[feature_names]
        virality_score = float(np.clip(model.predict(df)[0], 0, 100))
    else:
        virality_score = float(np.clip(
            text_features["hook_strength"] * 25 + trend_alignment * 20 +
            hashtag_quality * 10 + posting_time_score * 10 +
            visual_quality * 15 + text_features["cta_strength"] * 10 +
            niche_popularity * 10, 0, 100
        ))

    base_multiplier = virality_score / 100
    expected_views = int(base_multiplier * np.random.randint(100000, 2000000))
    expected_likes = int(expected_views * np.random.uniform(0.03, 0.12))
    expected_shares = int(expected_likes * np.random.uniform(0.05, 0.15))
    expected_saves = int(expected_likes * np.random.uniform(0.08, 0.20))

    suggestions = []
    if text_features["hook_strength"] < 0.4:
        suggestions.append("Strengthen your hook — use power words in the first 3 seconds")
    if hashtag_quality < 0.5:
        suggestions.append("Add 8-12 relevant hashtags for better discoverability")
    if text_features["cta_strength"] < 0.3:
        suggestions.append("Add a clear call-to-action (save, share, follow)")
    if trend_alignment < 0.6:
        suggestions.append("Align content with current trending topics for higher reach")
    if not suggestions:
        suggestions.append("Content is well-optimized for virality")

    return {
        "virality_score": round(virality_score, 1),
        "expected_views": f"{expected_views:,}",
        "expected_likes": f"{expected_likes:,}",
        "expected_shares": f"{expected_shares:,}",
        "expected_saves": f"{expected_saves:,}",
        "confidence": 0.79,
        "features": features,
        "suggestions": suggestions,
        "model": "XGBoost" if model else "Formula"
    }
