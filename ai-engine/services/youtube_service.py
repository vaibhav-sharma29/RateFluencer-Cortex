import os
import httpx
from dotenv import load_dotenv

load_dotenv()

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")
YOUTUBE_BASE_URL = "https://www.googleapis.com/youtube/v3"


async def search_trending_videos(query: str, max_results: int = 10):
    params = {
        "part": "snippet,statistics",
        "q": query,
        "type": "video",
        "order": "viewCount",
        "publishedAfter": "2026-01-01T00:00:00Z",
        "maxResults": max_results,
        "key": YOUTUBE_API_KEY,
    }
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(f"{YOUTUBE_BASE_URL}/search", params=params)
        resp.raise_for_status()
        return resp.json().get("items", [])


async def get_channel_stats(channel_id: str):
    params = {
        "part": "snippet,statistics,contentDetails",
        "id": channel_id,
        "key": YOUTUBE_API_KEY,
    }
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(f"{YOUTUBE_BASE_URL}/channels", params=params)
        resp.raise_for_status()
        items = resp.json().get("items", [])
        return items[0] if items else None


async def get_video_stats(video_id: str):
    params = {
        "part": "snippet,statistics,contentDetails",
        "id": video_id,
        "key": YOUTUBE_API_KEY,
    }
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(f"{YOUTUBE_BASE_URL}/videos", params=params)
        resp.raise_for_status()
        items = resp.json().get("items", [])
        return items[0] if items else None


async def get_trending_topics_from_youtube(niches: list, max_per_niche: int = 3):
    results = []
    async with httpx.AsyncClient(timeout=15.0) as client:
        for niche in niches:
            params = {
                "part": "snippet",
                "q": niche,
                "type": "video",
                "order": "viewCount",
                "maxResults": max_per_niche,
                "key": YOUTUBE_API_KEY,
            }
            try:
                resp = await client.get(f"{YOUTUBE_BASE_URL}/search", params=params)
                resp.raise_for_status()
                items = resp.json().get("items", [])
                for item in items:
                    results.append({
                        "topic": item["snippet"]["title"],
                        "niche": niche,
                        "source": "YouTube",
                        "channel": item["snippet"]["channelTitle"],
                        "published_at": item["snippet"]["publishedAt"],
                        "video_id": item["id"].get("videoId", ""),
                    })
            except Exception:
                continue
    return results
