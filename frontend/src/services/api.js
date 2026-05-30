import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
    }
    return Promise.reject(error)
  }
)

// Auth
export const login = (credentials) => api.post('/auth/login', credentials)
export const register = (userData) => api.post('/auth/register', userData)
export const getMe = () => api.get('/auth/me')

// Influencers
export const getInfluencers = (params) => api.get('/influencers', { params })
export const getTopInfluencers = (limit = 10) => api.get('/influencers/top', { params: { limit } })
export const getInfluencerById = (id) => api.get(`/influencers/${id}`)
export const analyzeInfluencer = (id) => api.post(`/influencers/${id}/analyze`)

// Brand
export const matchInfluencers = (prompt, filters = {}) =>
  api.post('/brand/match', { prompt, ...filters })
export const getCampaignRecommendations = (data) => api.post('/brand/campaign', data)

// Trends
export const getTrends = (params) => api.get('/trends', { params })
export const generateFromTrend = (topic, niche) =>
  api.post('/trends/generate', { topic, niche })

// Content
export const generateContent = (topic, platform = 'instagram', niche = 'Technology') =>
  api.post('/content/generate', { topic, platform, niche })
export const predictVirality = (data) => api.post('/content/predict-virality', data)

// YouTube
export const getYouTubeChannel = (username) => api.get(`/youtube/channel/${username}`)
export const importYouTubeChannel = (username) => api.post(`/youtube/import/${username}`)

export default api
