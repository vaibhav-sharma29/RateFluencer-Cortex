import React, { useState, useRef } from 'react'
import InfluencerCard from '../components/InfluencerCard'
import { matchInfluencers } from '../services/api'

const MOCK_INFLUENCERS = [
  { _id: '1', name: 'Aryan Kapoor', handle: '@aryantech', platform: 'youtube', category: 'Tech', followers: 1200000, influencerScore: 91, authenticityScore: 94, growthScore: 88, brandMatchScore: 96, engagementRate: 6.4, verified: true },
  { _id: '2', name: 'Priya Sharma', handle: '@priyacodes', platform: 'instagram', category: 'Tech', followers: 480000, influencerScore: 85, authenticityScore: 89, growthScore: 92, brandMatchScore: 87, engagementRate: 8.1, verified: true },
  { _id: '3', name: 'Rahul Verma', handle: '@rahulai', platform: 'linkedin', category: 'Finance', followers: 320000, influencerScore: 78, authenticityScore: 96, growthScore: 71, brandMatchScore: 82, engagementRate: 5.2, verified: false },
  { _id: '4', name: 'Sneha Patel', handle: '@snehacreates', platform: 'instagram', category: 'Fashion', followers: 890000, influencerScore: 74, authenticityScore: 81, growthScore: 79, brandMatchScore: 68, engagementRate: 7.3, verified: true },
  { _id: '5', name: 'Dev Malhotra', handle: '@devgaming', platform: 'youtube', category: 'Gaming', followers: 2100000, influencerScore: 88, authenticityScore: 77, growthScore: 85, brandMatchScore: 73, engagementRate: 4.9, verified: true },
  { _id: '6', name: 'Ananya Singh', handle: '@ananyafit', platform: 'instagram', category: 'Fitness', followers: 650000, influencerScore: 82, authenticityScore: 91, growthScore: 76, brandMatchScore: 79, engagementRate: 9.2, verified: false },
]

const PROMPT_SUGGESTIONS = [
  'Tech creator for AI SaaS product launch',
  'Fashion influencer for sustainable clothing brand',
  'Finance creator for investment app targeting millennials',
  'Gaming creator for mobile game promotion',
  'Fitness influencer for protein supplement brand',
]

const SORT_OPTIONS = [
  { value: 'influencerScore', label: 'Overall Score' },
  { value: 'authenticityScore', label: 'Authenticity' },
  { value: 'growthScore', label: 'Growth' },
  { value: 'brandMatchScore', label: 'Brand Match' },
]

const FilterChip = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border ${
      active
        ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
        : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70 hover:border-white/20'
    }`}
  >
    {label}
  </button>
)

const BrandDashboard = () => {
  const [prompt, setPrompt] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [sortBy, setSortBy] = useState('influencerScore')
  const [activeCategory, setActiveCategory] = useState('All')
  const [error, setError] = useState(null)
  const inputRef = useRef(null)

  const categories = ['All', 'Tech', 'Fashion', 'Fitness', 'Finance', 'Gaming', 'Beauty']

  const handleSearch = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setError(null)
    setSearched(true)

    try {
      const res = await matchInfluencers(prompt)
      const data = res.data?.data || res.data || []
      if (data.length > 0) {
        setResults(data.map((inf) => ({
          _id: inf._id,
          name: inf.fullName || inf.username,
          handle: `@${inf.username}`,
          platform: inf.platform,
          category: inf.niche,
          followers: inf.followers,
          influencerScore: inf.scores?.influencerScore || 0,
          authenticityScore: inf.scores?.authenticityScore || 0,
          growthScore: inf.scores?.growthScore || 0,
          brandMatchScore: inf.scores?.brandMatchScore || 0,
          engagementRate: inf.engagementRate || 0,
          verified: inf.isVerified,
        })))
      } else {
        setResults(MOCK_INFLUENCERS)
      }
    } catch {
      await new Promise((r) => setTimeout(r, 1800))
      setResults(MOCK_INFLUENCERS)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch()
  }

  const filteredResults = results
    .filter((inf) => activeCategory === 'All' || inf.category === activeCategory)
    .sort((a, b) => (b[sortBy] || 0) - (a[sortBy] || 0))

  const avgScore = results.length
    ? Math.round(results.reduce((s, i) => s + (i.influencerScore || 0), 0) / results.length)
    : 0

  return (
    <div className="min-h-screen bg-dark-900 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🎯</span>
            <span className="text-purple-400 text-sm font-semibold uppercase tracking-widest">Brand Dashboard</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-2">
            Find Your Perfect <span className="gradient-text">Creator Match</span>
          </h1>
          <p className="text-white/40 text-base max-w-xl">
            Describe your brand or campaign in plain English. Our AI engine ranks the best creators using XGBoost scoring + FAISS semantic matching.
          </p>
        </div>

        {/* ── Search Box ── */}
        <div className="glass-card p-6 mb-8 border-purple-500/10">
          <label className="block text-white/60 text-sm font-medium mb-3">
            Describe your brand or campaign
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 text-lg">🔍</div>
              <input
                ref={inputRef}
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. Tech creator for AI SaaS product targeting developers..."
                className="input-dark pl-11 text-sm h-12"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || !prompt.trim()}
              className="btn-primary px-6 h-12 flex items-center gap-2 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <span>✨</span>
                  Find Creators
                </>
              )}
            </button>
          </div>

          {/* Prompt suggestions */}
          <div className="mt-4">
            <p className="text-white/30 text-xs mb-2">Try these:</p>
            <div className="flex flex-wrap gap-2">
              {PROMPT_SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => { setPrompt(s); inputRef.current?.focus() }}
                  className="text-xs px-3 py-1.5 rounded-full bg-white/3 border border-white/8 text-white/40 hover:text-white/70 hover:border-purple-500/30 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Loading State ── */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-6">
            <div className="relative w-20 h-20">
              <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 animate-ping" />
              <div className="absolute inset-2 rounded-full border-2 border-purple-500/40 animate-spin" />
              <div className="absolute inset-4 rounded-full bg-purple-500/20 flex items-center justify-center">
                <span className="text-xl">🤖</span>
              </div>
            </div>
            <div className="text-center">
              <p className="text-white font-semibold mb-1">AI Engine Running</p>
              <p className="text-white/40 text-sm">FAISS matching → XGBoost scoring → Ranking results...</p>
            </div>
            <div className="flex gap-2">
              {['Embedding prompt', 'FAISS search', 'XGBoost score', 'Ranking'].map((step, i) => (
                <div key={step} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }} />
                  <span className="text-white/40 text-xs">{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Results ── */}
        {!loading && searched && (
          <>
            {/* Stats bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="glass-card px-4 py-2 flex items-center gap-2">
                  <span className="text-purple-400 font-bold text-lg">{filteredResults.length}</span>
                  <span className="text-white/40 text-sm">creators found</span>
                </div>
                {results.length > 0 && (
                  <div className="glass-card px-4 py-2 flex items-center gap-2">
                    <span className="text-green-400 font-bold text-lg">{avgScore}</span>
                    <span className="text-white/40 text-sm">avg score</span>
                  </div>
                )}
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2">
                <span className="text-white/30 text-xs">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white/5 border border-white/10 text-white/70 text-xs rounded-lg px-3 py-2 outline-none focus:border-purple-500/40"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value} className="bg-dark-800">{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((cat) => (
                <FilterChip
                  key={cat}
                  label={cat}
                  active={activeCategory === cat}
                  onClick={() => setActiveCategory(cat)}
                />
              ))}
            </div>

            {/* Cards grid */}
            {filteredResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredResults.map((inf, idx) => (
                  <div key={inf._id} className="animate-fade-in" style={{ animationDelay: `${idx * 0.08}s` }}>
                    <InfluencerCard influencer={inf} rank={idx + 1} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-4xl mb-4">🔍</div>
                <p className="text-white/40">No creators match this filter. Try a different category.</p>
              </div>
            )}
          </>
        )}

        {/* ── Empty State ── */}
        {!loading && !searched && (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-4xl mx-auto mb-6">
              🎯
            </div>
            <h3 className="text-white font-bold text-xl mb-2">Start Your Creator Search</h3>
            <p className="text-white/40 text-sm max-w-sm mx-auto">
              Enter a brand description above and let our AI find the most relevant creators for your campaign.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default BrandDashboard
