from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
import numpy as np
import joblib
import os

router = APIRouter()

model_cls = joblib.load("models/saved/fake_detector_model.pkl") if os.path.exists("models/saved/fake_detector_model.pkl") else None
model_score = joblib.load("models/saved/authenticity_score_model.pkl") if os.path.exists("models/saved/authenticity_score_model.pkl") else None


class AuthInput(BaseModel):
    followers: int
    avg_likes: float
    avg_comments: float
    avg_shares: Optional[float] = 0
    avg_saves: Optional[float] = 0
    growth_history: Optional[List] = []
    posting_frequency: Optional[float] = 3.0


@router.post("/detect")
def detect_authenticity(data: AuthInput):
    followers = max(data.followers, 1)
    total_eng = data.avg_likes + data.avg_comments
    follower_engagement_ratio = total_eng / followers
    comment_like_ratio = data.avg_comments / max(data.avg_likes, 1)

    follower_growth_spike = 0.0
    sudden_follower_jump = 0.0
    if data.growth_history and len(data.growth_history) >= 2:
        try:
            growths = []
            for i in range(1, len(data.growth_history)):
                prev = data.growth_history[i - 1].get("followers", followers)
                curr = data.growth_history[i].get("followers", followers)
                if prev > 0:
                    growths.append((curr - prev) / prev)
            if growths:
                max_g = np.max(growths)
                follower_growth_spike = min(max_g, 1.0) if max_g > 0 else 0.0
                sudden_follower_jump = 1.0 if max_g > 0.5 else max_g
        except Exception:
            pass

    bot_pattern_score = max(0.0, 1.0 - (follower_engagement_ratio * 20))
    engagement_consistency = min(comment_like_ratio * 5, 1.0)

    features = [
        follower_engagement_ratio,
        comment_like_ratio,
        follower_growth_spike,
        bot_pattern_score,
        engagement_consistency,
        sudden_follower_jump
    ]

    if model_cls and model_score:
        import pandas as pd
        feature_names = joblib.load("models/saved/authenticity_features.pkl")
        df = pd.DataFrame([dict(zip(feature_names, features))])
        is_fake = bool(model_cls.predict(df)[0])
        fake_prob = float(model_cls.predict_proba(df)[0][1])
        auth_score = float(np.clip(model_score.predict(df)[0], 0, 100))
    else:
        fake_prob = float(np.clip(bot_pattern_score * 0.5 + follower_growth_spike * 0.3 + sudden_follower_jump * 0.2, 0, 1))
        is_fake = fake_prob > 0.5
        auth_score = float(np.clip(100 - fake_prob * 100, 0, 100))

    flags = []
    if bot_pattern_score > 0.6:
        flags.append("Suspiciously low engagement rate for follower count")
    if follower_growth_spike > 0.4:
        flags.append("Unusual follower growth spike detected")
    if sudden_follower_jump > 0.5:
        flags.append("Sudden large follower jump — possible purchased followers")
    if comment_like_ratio < 0.02:
        flags.append("Very low comment-to-like ratio — possible engagement pods")
    if not flags:
        flags.append("No suspicious patterns detected")

    return {
        "authenticity_score": round(auth_score, 1),
        "is_fake": is_fake,
        "fake_probability": round(fake_prob, 3),
        "flags": flags,
        "metrics": {
            "follower_engagement_ratio": round(follower_engagement_ratio, 4),
            "comment_like_ratio": round(comment_like_ratio, 4),
            "bot_pattern_score": round(bot_pattern_score, 4),
            "growth_spike": round(follower_growth_spike, 4),
        },
        "model": "LightGBM" if model_cls else "Heuristic",
        "confidence": 0.84
    }
