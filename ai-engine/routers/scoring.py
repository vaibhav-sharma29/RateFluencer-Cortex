from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
import numpy as np
import joblib
import os

router = APIRouter()

MODEL_PATH = "models/saved/influencer_score_model.pkl"
SCALER_PATH = "models/saved/influencer_score_scaler.pkl"

model = joblib.load(MODEL_PATH) if os.path.exists(MODEL_PATH) else None
scaler = joblib.load(SCALER_PATH) if os.path.exists(SCALER_PATH) else None


class InfluencerInput(BaseModel):
    followers: int
    following: Optional[int] = 1000
    avg_likes: float
    avg_comments: float
    avg_shares: Optional[float] = 0
    avg_saves: Optional[float] = 0
    avg_views: Optional[float] = 0
    posting_frequency: Optional[float] = 3.0
    total_posts: Optional[int] = 100
    niche: Optional[str] = "Technology"
    growth_history: Optional[List] = []


def compute_features(data: InfluencerInput):
    followers = max(data.followers, 1)
    total_eng = data.avg_likes + data.avg_comments + (data.avg_shares or 0) + (data.avg_saves or 0)
    engagement_rate = (total_eng / followers) * 100
    share_rate = ((data.avg_shares or 0) / followers) * 100
    save_rate = ((data.avg_saves or 0) / followers) * 100
    posting_freq = data.posting_frequency or 3.0

    growth_rate = 5.0
    if data.growth_history and len(data.growth_history) >= 2:
        try:
            first = data.growth_history[0].get("followers", followers)
            last = data.growth_history[-1].get("followers", followers)
            growth_rate = ((last - first) / max(first, 1)) * 100
        except Exception:
            pass

    comment_quality = min(data.avg_comments / max(data.avg_likes, 1), 1.0)
    audience_quality = min(engagement_rate / 10.0, 1.0)
    consistency = min(posting_freq / 7.0, 1.0)

    return {
        "engagement_rate": round(engagement_rate, 4),
        "share_rate": round(share_rate, 4),
        "save_rate": round(save_rate, 4),
        "posting_freq": round(posting_freq, 4),
        "growth_rate": round(growth_rate, 4),
        "comment_quality": round(comment_quality, 4),
        "audience_quality": round(audience_quality, 4),
        "consistency": round(consistency, 4),
        "log_followers": round(np.log1p(followers), 4),
    }


@router.post("/influencer-score")
def get_influencer_score(data: InfluencerInput):
    features = compute_features(data)

    if model and scaler:
        import pandas as pd
        feature_names = joblib.load("models/saved/influencer_score_features.pkl")
        df = pd.DataFrame([features])[feature_names]
        score = float(np.clip(model.predict(df)[0], 0, 100))
        feature_importance = dict(zip(feature_names, model.feature_importances_.tolist()))
    else:
        er = features["engagement_rate"]
        aq = features["audience_quality"]
        gr = features["growth_rate"]
        score = float(np.clip(er * 4 + aq * 30 + gr * 1.5 + features["consistency"] * 15, 0, 100))
        feature_importance = {k: round(v * 0.1, 3) for k, v in features.items()}

    top_factors = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)[:3]
    explanation = [f"{k.replace('_', ' ').title()} contributed {round(v * 100, 1)}%" for k, v in top_factors]

    return {
        "influencer_score": round(score, 1),
        "features": features,
        "feature_importance": feature_importance,
        "explanation": explanation,
        "model": "XGBoost" if model else "Formula",
        "confidence": 0.87
    }
