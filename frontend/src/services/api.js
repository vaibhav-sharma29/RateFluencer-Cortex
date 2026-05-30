import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — attach token if available
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

// Response interceptor — handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
    }
    return Promise.reject(error)
  }
)

// ─── Brand APIs ───────────────────────────────────────────────
export const searchInfluencers = (prompt) =>
  api.post('/brand/search', { prompt })

export const getInfluencerScore = (influencerId) =>
  api.get(`/brand/score/${influencerId}`)

// ─── Influencer APIs ──────────────────────────────────────────
export const getInfluencerProfile = (id) =>
  api.get(`/influencer/${id}`)

export const getInfluencerStats = (id) =>
  api.get(`/influencer/${id}/stats`)

export const getShapExplanation = (id) =>
  api.get(`/influencer/${id}/shap`)

// ─── Trend APIs ───────────────────────────────────────────────
export const getTrendingTopics = () =>
  api.get('/trends')

export const getTrendScore = (trendId) =>
  api.get(`/trends/${trendId}/score`)

// ─── Content / Script APIs ────────────────────────────────────
export const generateScript = (trendId, trendTitle) =>
  api.post('/content/generate-script', { trendId, trendTitle })

export const getViralityScore = (contentData) =>
  api.post('/content/virality', contentData)

export const generateCaption = (scriptId) =>
  api.post('/content/caption', { scriptId })

// ─── Auth APIs ────────────────────────────────────────────────
export const login = (credentials) =>
  api.post('/auth/login', credentials)

export const register = (userData) =>
  api.post('/auth/register', userData)

export default api
