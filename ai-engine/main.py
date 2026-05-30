from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import uvicorn

load_dotenv()

# Import routers
from routers import scoring, authenticity, growth, brand, content, virality, trends

app = FastAPI(
    title="RateFluencer AI Engine",
    description="AI/ML backend for influencer scoring, fake detection, content generation and virality prediction",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(scoring.router, prefix="/api/scoring", tags=["Scoring"])
app.include_router(authenticity.router, prefix="/api/authenticity", tags=["Authenticity"])
app.include_router(growth.router, prefix="/api/growth", tags=["Growth"])
app.include_router(brand.router, prefix="/api/brand", tags=["Brand"])
app.include_router(content.router, prefix="/api/content", tags=["Content"])
app.include_router(virality.router, prefix="/api/virality", tags=["Virality"])
app.include_router(trends.router, prefix="/api/trends", tags=["Trends"])

@app.get("/")
def root():
    return {"message": "RateFluencer AI Engine is running 🚀", "version": "1.0.0"}

@app.get("/health")
def health():
    return {"status": "ok", "message": "AI Engine healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
