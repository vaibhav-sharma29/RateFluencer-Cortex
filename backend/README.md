# RateFluencer Cortex — Backend API

Node.js + Express + MongoDB backend for the RateFluencer AI platform.

## Setup

```bash
cd backend
npm install
cp .env.example .env   # fill in your values
npm run seed           # seed 50 mock influencers
npm run dev            # start dev server on port 5000
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login user |
| GET | /api/auth/me | Get current user |
| GET | /api/influencers | Get all influencers (search/filter) |
| GET | /api/influencers/top | Get top influencers by score |
| GET | /api/influencers/:id | Get single influencer |
| POST | /api/influencers/:id/analyze | Run AI analysis on influencer |
| POST | /api/brand/match | Match influencers to brand prompt |
| POST | /api/brand/campaign | Get campaign recommendations |
| POST | /api/content/generate | Generate reel script + captions |
| POST | /api/content/predict-virality | Predict content virality |
| GET | /api/trends | Get trending topics |
| POST | /api/trends/generate | Generate content from trend |

## Environment Variables

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/ratefluencer
JWT_SECRET=your_secret
AI_ENGINE_URL=http://localhost:8000
OPENAI_API_KEY=your_openai_key
```
