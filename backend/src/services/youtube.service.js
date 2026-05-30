const axios = require('axios');

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_BASE = 'https://www.googleapis.com/youtube/v3';

const getChannelByUsername = async (username) => {
  const res = await axios.get(`${YOUTUBE_BASE}/channels`, {
    params: {
      part: 'snippet,statistics,contentDetails',
      forHandle: username,
      key: YOUTUBE_API_KEY,
    },
  });
  return res.data.items?.[0] || null;
};

const getChannelVideos = async (channelId, maxResults = 10) => {
  const res = await axios.get(`${YOUTUBE_BASE}/search`, {
    params: {
      part: 'snippet',
      channelId,
      order: 'date',
      type: 'video',
      maxResults,
      key: YOUTUBE_API_KEY,
    },
  });
  return res.data.items || [];
};

const getVideoStats = async (videoIds) => {
  const ids = Array.isArray(videoIds) ? videoIds.join(',') : videoIds;
  const res = await axios.get(`${YOUTUBE_BASE}/videos`, {
    params: {
      part: 'statistics,contentDetails',
      id: ids,
      key: YOUTUBE_API_KEY,
    },
  });
  return res.data.items || [];
};

const buildInfluencerProfile = async (username) => {
  const channel = await getChannelByUsername(username);
  if (!channel) return null;

  const stats = channel.statistics;
  const subscribers = parseInt(stats.subscriberCount || 0);
  const totalViews = parseInt(stats.viewCount || 0);
  const videoCount = parseInt(stats.videoCount || 0);

  const videos = await getChannelVideos(channel.id, 10);
  const videoIds = videos.map((v) => v.id?.videoId).filter(Boolean);

  let avgLikes = 0;
  let avgComments = 0;
  let avgViews = 0;

  if (videoIds.length > 0) {
    const videoStats = await getVideoStats(videoIds);
    const totals = videoStats.reduce(
      (acc, v) => {
        acc.likes += parseInt(v.statistics?.likeCount || 0);
        acc.comments += parseInt(v.statistics?.commentCount || 0);
        acc.views += parseInt(v.statistics?.viewCount || 0);
        return acc;
      },
      { likes: 0, comments: 0, views: 0 }
    );
    const count = videoStats.length;
    avgLikes = Math.round(totals.likes / count);
    avgComments = Math.round(totals.comments / count);
    avgViews = Math.round(totals.views / count);
  }

  return {
    username: channel.snippet.customUrl || username,
    fullName: channel.snippet.title,
    platform: 'youtube',
    niche: 'AI & Technology',
    bio: channel.snippet.description?.slice(0, 200) || '',
    avatar: channel.snippet.thumbnails?.default?.url || '',
    followers: subscribers,
    following: 0,
    totalPosts: videoCount,
    avgLikes,
    avgComments,
    avgShares: 0,
    avgSaves: 0,
    avgViews,
    postingFrequency: videoCount > 0 ? Math.min(videoCount / 52, 7) : 1,
    isVerified: true,
    isActive: true,
    scores: {
      influencerScore: null,
      authenticityScore: null,
      growthScore: null,
      brandMatchScore: null,
    },
  };
};

module.exports = { getChannelByUsername, getChannelVideos, getVideoStats, buildInfluencerProfile };
