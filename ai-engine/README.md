# RateFluencer AI Engine

FastAPI + ML backend for influencer scoring, fake detection, content generation and virality prediction.

## Setup

```bash
cd ai-engine
pip install -r requirements.txt
python models/train_models.py   # Train all ML models
uvicorn main:app --reload --port 8000
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/scoring/influencer-score | XGBoost Influencer Score (0-100) |
| POST | /api/authenticity/detect | LightGBM Fake Follower Detection |
| POST | /api/growth/predict | Random Forest Growth Prediction |
| POST | /api/virality/predict | XGBoost Virality Score (0-100) |
| GET | /api/trends | ML-ranked trending topics |
| POST | /api/trends/generate | Generate content from trend |
| POST | /api/content/generate | Groq AI content generation |
| POST | /api/brand/match | Brand-creator matching |

## ML Models

- **Influencer Score**: XGBoost trained on engagement, growth, audience quality
- **Fake Detector**: LightGBM classifier for bot/fake follower detection  
- **Growth Predictor**: Random Forest for future follower growth
- **Virality Predictor**: XGBoost for content virality prediction

## Docs

Visit `http://localhost:8000/docs` for interactive API documentation.
