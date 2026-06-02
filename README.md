# RateFluencer Cortex

**An Advanced AI-Powered Ecosystem for Influencer Intelligence and Viral Content Creation**

Built for the Ratefluencer AI Hackathon 2026 — Grand Challenge (Track 1 + Track 2)

---

## What It Does

RateFluencer Cortex solves two core problems in influencer marketing:

**For Brands** — Stop wasting money on vanity metrics. Our ML engine searches real YouTube creators, analyzes engagement data, detects fake followers, and scores influencers on authenticity, growth potential, and predicted campaign success.

**For Creators** — Stop spending hours searching for trends. Our AI agent discovers trending topics from YouTube and Reddit, generates complete reel scripts, LinkedIn posts, Instagram captions, and predicts virality before you post.

**For Campaign Teams** — Our Autonomous AI Agent takes a brand name and generates a complete campaign package in under 30 seconds — video script with timestamps, LinkedIn post, Instagram story slides, hashtags, and expected reach.

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React 18, Vite, TailwindCSS, Recharts |
| Backend | Node.js, Express, MongoDB, Mongoose, JWT |
| AI Engine | FastAPI, Python 3.13, XGBoost, LightGBM, scikit-learn |
| AI/LLM | Groq API (Llama3-8b-8192) |
| Data Sources | YouTube Data API v3, Reddit Public API |

---

## ML Models

| Model | Algorithm | Purpose | Output |
|-------|-----------|---------|--------|
| Influencer Score | XGBoost Regressor | Predict campaign success | 0–100 |
| Fake Detector | LightGBM Classifier | Detect bot/fake followers | Authenticity Score 0–100 |
| Growth Predictor | Random Forest Regressor | Forecast future growth | Growth Score 0–100 |
| Virality Predictor | XGBoost Regressor | Predict content virality | Virality Score 0–100 |
| Trend Ranker | Weighted ML Scorer | Rank trending topics | Trend Score 0–100 |

---

## Architecture

```
Frontend (React + Vite)      →  Port 3000
Backend (Node.js + Express)  →  Port 5000
AI Engine (FastAPI + Python) →  Port 8000
Database (MongoDB)           →  Port 27017
```

---

## Setup Instructions

### Prerequisites
- Node.js v18+
- Python 3.10+
- MongoDB (local) or MongoDB Atlas
- Groq API Key (free at console.groq.com)
- YouTube Data API v3 Key (free at console.cloud.google.com)

### 1. Clone the Repository

```bash
git clone https://github.com/vaibhav-sharma29/RateFluencer-Cortex.git
cd RateFluencer-Cortex
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/ratefluencer
JWT_SECRET=ratefluencer_super_secret_key_2026
AI_ENGINE_URL=http://localhost:8000
GROQ_API_KEY=your_groq_api_key
YOUTUBE_API_KEY=your_youtube_api_key
```

```bash
npm run seed:users      # Create demo users
npm run seed:youtube    # Import real YouTube creators
npm run dev             # Start backend on port 5000
```

### 3. AI Engine Setup

```bash
cd ai-engine
pip install fastapi uvicorn pydantic python-dotenv groq scikit-learn xgboost lightgbm numpy pandas joblib httpx
```

Fill in `ai-engine/.env`:
```
GROQ_API_KEY=your_groq_api_key
YOUTUBE_API_KEY=your_youtube_api_key
PORT=8000
```

```bash
python models/train_models.py   # Train all ML models
python main.py                  # Start AI Engine on port 8000
```

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev    # Start frontend on port 3000
```

### 5. Start MongoDB

```bash
# Windows (Run as Administrator)
net start MongoDB
```

---

## Demo Credentials

```
Brand Demo:   brand@demo.com  /  demo123
Creator Demo: creator@demo.com / demo123
```

---

## API Endpoints

### Backend (Port 5000)

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/influencers/top | Top influencers by ML score |
| POST | /api/brand/match | Match influencers to brand prompt |
| GET | /api/trends | Get ML-ranked trending topics |
| POST | /api/trends/generate | Generate content from trend |
| POST | /api/agent/campaign | Run autonomous campaign agent |

### AI Engine (Port 8000)

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/scoring/influencer-score | XGBoost influencer score |
| POST | /api/authenticity/detect | LightGBM fake follower detection |
| POST | /api/growth/predict | Random Forest growth prediction |
| POST | /api/virality/predict | XGBoost virality prediction |
| GET | /api/trends/ | ML-ranked trends with Reddit + YouTube |

Interactive API docs: `http://localhost:8000/docs`

---

## Features

### Track 1 — AI Influencer Intelligence Engine
- Real YouTube creator search using YouTube Data API v3
- XGBoost Influencer Score (0-100) with SHAP explanation
- LightGBM Fake Follower Detection with specific flags
- Random Forest Growth Prediction — 3/6/12 month forecasts
- Brand-Creator matching with natural language prompts
- Full influencer profile with radar chart, demographics, content analysis

### Track 2 — AI Viral Reel Creator Agent
- Real-time trend discovery from Reddit + YouTube
- ML Weighted Trend Scorer (0-100)
- Groq Llama 3 reel script generation (Hook + Story + CTA)
- LinkedIn post + Instagram caption + hashtag generation
- XGBoost Virality Score with expected views/likes/shares/saves
- Search and filter by niche
- Custom topic input for direct script generation

### Grand Challenge — Autonomous AI Agent
- Brand name + product + audience → complete campaign package
- Real-time step-by-step streaming via Server-Sent Events
- Brand-specific video script with timestamps
- LinkedIn post + Instagram story slides
- Best posting time recommendation
- Expected reach estimate

---

## Team

Built for Ratefluencer AI Hackathon 2026 — Grand Challenge

GitHub: [vaibhav-sharma29/RateFluencer-Cortex](https://github.com/vaibhav-sharma29/RateFluencer-Cortex)
