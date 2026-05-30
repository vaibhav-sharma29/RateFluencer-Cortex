from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
import numpy as np
import joblib
import os

router = APIRouter()

model = joblib.load("models/saved/growth_model.pkl") if os.path.exists("models/saved/growth_model.pkl") else None


class GrowthInput(BaseModel):
    followers: int
    avg_likes: float
    avg_comments: float
    posting_frequency: Optional[float] = 3.0
    growth_history: Optional[List] = []
    niche: Optional[str] = "Technology"


@router.post("/predict")
def predict_growth(data: GrowthInput):
    followers = max(data.followers, 1)
    total_eng = data.avg_likes + data.avg_comments
    avg_engagement = (total_eng / followers) * 100

    niche_rates = {
        "AI & Technology": 4.5, "Finance": 3.2, "Business": 3.0,
        "Startups": 3.8, "Creator Economy": 4.0, "Fitness": 2.8,
        "Travel": 2.5, "Food": 2.3, "Fashion": 2.6, "Education": 3.5
    }
    niche_growth_rate = niche_rates.get(data.niche, 3.0)

    audience_retention = 0.75
    collab_frequency = 0.3
    content_quality = min(avg_engagement / 10.0, 1.0)

    features = {
        "log_followers": np.log1p(followers),
        "avg_engagement": avg_engagement,
        "posting_freq": data.posting_frequency or 3.0,
        "content_quality": content_quality,
        "niche_growth_rate": niche_growth_rate,
        "audience_retention": audience_retention,
        "collab_frequency": collab_frequency,
    }

    if model:
        import pandas as pd
        feature_names = joblib.load("models/saved/growth_features.pkl")
        df = pd.DataFrame([features])[feature_names]
        growth_score = float(np.clip(model.predict(df)[0], 0, 100))
    else:
        growth_score = float(np.clip(
            avg_engagement * 3 + content_quality * 25 +
            niche_growth_rate * 8 + audience_retention * 20, 0, 100
        ))

    monthly_growth_pct = (growth_score / 100) * 0.15
    predicted_3m = int(followers * (1 + monthly_growth_pct * 3))
    predicted_6m = int(followers * (1 + monthly_growth_pct * 6))
    predicted_12m = int(followers * (1 + monthly_growth_pct * 12))

    tier = "Explosive" if growth_score >= 80 else "High" if growth_score >= 60 else "Moderate" if growth_score >= 40 else "Low"

    return {
        "growth_score": round(growth_score, 1),
        "growth_tier": tier,
        "predictions": {
            "3_months": predicted_3m,
            "6_months": predicted_6m,
            "12_months": predicted_12m,
        },
        "monthly_growth_rate": round(monthly_growth_pct * 100, 2),
        "key_drivers": [
            f"Niche ({data.niche}) has {niche_growth_rate}x growth multiplier",
            f"Engagement rate of {round(avg_engagement, 2)}% drives organic reach",
            f"Posting {data.posting_frequency}x/week maintains algorithm favor"
        ],
        "model": "RandomForest" if model else "Formula",
        "confidence": 0.81
    }
