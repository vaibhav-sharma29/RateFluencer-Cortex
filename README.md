# RateFluencer Cortex

AI-powered influencer intelligence and viral content creation platform built for the Ratefluencer AI Hackathon 2026.

## What It Does

RateFluencer Cortex solves two core problems in influencer marketing:

**For Brands** — Stop wasting money on vanity metrics. Our ML engine analyzes real engagement data to score influencers on authenticity, growth potential, and predicted campaign success. Brands can search using natural language and get ranked creator matches instantly.

**For Creators** — Stop spending hours searching for trends. Our AI agent discovers trending topics from YouTube and Reddit, generates complete reel scripts, LinkedIn posts, Instagram captions, and predicts virality before you even post.

## Architecture

```
Frontend (React + Vite)     →    Port 3000
Backend (Node.js + Express) →    Port 5000
AI Engine (FastAPI + Python) →   Port 8000
Database (MongoDB)           →   Local / Atlas
```

## ML Models

| Model | Algorithm | Purpose | Output |
|-------|-----------|---------|--------|
| Influencer Score | XGBoost | Predict campaign success | Score 0–100 |
| Fake Detector | LightGBM | Detect bot/fake followers | Authenticity Score 0–100 |
| Growth Predictor | Random Forest | Forecast future growth | Growth Score 0–100 |
| Virality Predictor | XGBoost | Predict content virality | Virality Score 0–100 |
| Trend Ranker | Weighted ML Scorer | Rank trending topics | Trend Score 0–100 |

## Data Sources

- YouTube Data API v3 — real channel stats and trending videos
- Reddit Public API — trending posts from AI, Tech, Business, Finance subreddits
- 50 synthetic influencer profiles with realistic engagement distributions

## Tech Stack

**Backend:** Node.js, Express, MongoDB, Mongoose, JWT, Axios

**AI Engine:** FastAPI, Python 3.13, XGBoost, LightGBM, scikit-learn, Groq (Llama3), httpx

**Frontend:** React, Vite, TailwindCSS, Recharts

## Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in MONGO_URI, JWT_SECRET, GROQ_API_KEY, YOUTUBE_API_KEY
npm run seed
npm run dev
```

### AI Engine
```bash
cd ai-engine
pip install -r requirements.txt
python models/train_models.py
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## API Endpoints

### Backend (Port 5000)
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/influencers | List influencers with filters |
| GET | /api/influencers/top | Top influencers by score |
| POST | /api/influencers/:id/analyze | Run full AI analysis |
| POST | /api/brand/match | Match influencers to brand prompt |
| GET | /api/trends | Get ML-ranked trending topics |
| POST | /api/trends/generate | Generate content from trend |
| POST | /api/content/generate | Generate reel script + captions |
| POST | /api/content/predict-virality | Predict content virality |
| GET | /api/youtube/channel/:username | Fetch YouTube channel data |

### AI Engine (Port 8000)
| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/scoring/influencer-score | XGBoost influencer score |
| POST | /api/authenticity/detect | LightGBM fake follower detection |
| POST | /api/growth/predict | Random Forest growth prediction |
| POST | /api/virality/predict | XGBoost virality prediction |
| GET | /api/trends | ML-ranked trends with YouTube data |
| POST | /api/content/generate | Groq AI content generation |
| POST | /api/brand/match | Brand-creator matching |

Interactive API docs: `http://localhost:8000/docs`

## Team

Built for Ratefluencer AI Hackathon 2026 — Grand Challenge (Track 1 + Track 2)
