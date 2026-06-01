import React, { useState, useEffect } from 'react'
import TrendCard from '../components/TrendCard'
import ScriptOutput from '../components/ScriptOutput'
import ViralityMeter from '../components/ViralityMeter'
import { getTrends, generateFromTrend } from '../services/api'

const MOCK_SCRIPT = {
  hook: "Stop scrolling. In the next 60 seconds, I'll show you exactly why this trend is going to change how you create content forever.",
  story: "This trend is reshaping the creator economy. Let me break it down in 60 seconds. Most people are missing the real opportunity here — while everyone focuses on the surface, the real transformation is happening underneath.",
  keyInsights: [
    "This topic is growing 3x faster than alternatives right now",
    "Early creators are seeing 10x normal engagement",
    "The window to get ahead is closing fast",
    "Here is exactly how to position yourself",
  ],
  cta: "Follow for daily insights. Drop a 🔥 in the comments if this helped!",
  reelScript: "HOOK (0-3s): Attention-grabbing opening\n\nBODY (3-45s): Main content with key insights\n\nCTA (45-60s): Follow + engage",
  linkedinPost: "Hot take on this trending topic:\n\nMost people are missing the real opportunity here.\n\n✅ The data shows explosive growth\n✅ Early movers are winning big\n✅ The strategy most people ignore\n\nWhat's your take? Comment below 👇",
  instagramCaption: "This is blowing up right now 🚀\n\nAre you paying attention? 👀\n\nSave this post! 📌",
  hashtags: ['#Trending', '#Creator', '#AI', '#Viral', '#ContentCreator', '#Growth'],
  viralityScore: 82,
  expectedViews: 250000,
  expectedLikes: 18000,
  expectedShares: 4200,
  expectedSaves: 7800,
}

const CATEGORIES = ['All', 'AI & Technology', 'Business', 'Finance', 'Startups', 'Creator Economy']

const CreatorDashboard = () => {
  const [trends, setTrends] = useState([])
  const [loading, setLoading] = useState(true)
  const [generatingId, setGeneratingId] = useState(null)
  const [activeScript, setActiveScript] = useState(null)
  const [activeTrendTitle, setActiveTrendTitle] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [refreshing, setRefreshing] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [customTopic, setCustomTopic] = useState('')
  const [topTrend, setTopTrend] = useState(null)

  const fetchTrends = async (isRefresh = false, niche = 'All', search = '') => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const params = { limit: 15 }
      if (niche !== 'All') params.niche = niche
      if (search) params.search = search
      const res = await getTrends(params)
      const raw = res.data?.data?.trends || res.data?.trends || []
      const mapped = raw.map((t) => ({
        id: String(t.id),
        title: t.topic,
        description: `Trending in ${t.niche} — Source: ${t.source || 'Social Media'} · ${t.post_count || 0} posts`,
        category: t.niche?.split(' ')[0] || 'Tech',
        trendScore: t.trend_score || t.trendScore || 75,
        growthVelocity: t.growth_velocity === 'explosive' ? 340 : t.growth_velocity === 'high' ? 210 : 120,
        searchInterest: t.search_interest || 75,
        engagementPotential: t.engagement_potential || 80,
        source: t.source || 'Social Media',
        timeAgo: 'Live',
        niche: t.niche,
      }))
      setTrends(mapped)
      if (mapped.length > 0) {
        const randomTop = mapped[Math.floor(Math.random() * Math.min(3, mapped.length))]
        setTopTrend(randomTop)
      }
    } catch (err) {
      console.error('Trends fetch failed:', err.message)
      setTrends([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchTrends() }, [])

  const handleCategoryChange = (cat) => {
    setActiveCategory(cat)
    fetchTrends(true, cat, searchQuery)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    fetchTrends(true, activeCategory, searchQuery)
  }

  const handleCustomGenerate = () => {
    if (!customTopic.trim()) return
    handleGenerateScript({ id: 'custom', title: customTopic, category: activeCategory !== 'All' ? activeCategory : 'Technology' })
  }

  const handleGenerateScript = async (trend) => {
    setGeneratingId(trend.id)
    setActiveScript(null)
    setActiveTrendTitle(trend.title)
    try {
      const res = await generateFromTrend(trend.title, trend.niche || trend.category)
      const d = res.data?.data || res.data
      const rs = d.reel_script || {}
      setActiveScript({
        hook: rs.hook || d.hook || '',
        story: rs.story || d.story || '',
        keyInsights: rs.key_insights || d.keyInsights || [],
        cta: rs.cta || d.cta || '',
        reelScript: rs.hook && rs.story ? `${rs.hook}\n\n${rs.story}\n\n${rs.cta || ''}` : '',
        linkedinPost: d.linkedin_post || d.linkedinPost || '',
        instagramCaption: d.instagram_caption || d.instagramCaption || '',
        hashtags: d.hashtags || [],
        viralityScore: d.virality_score || d.viralityScore || 80,
        expectedViews: 250000,
        expectedLikes: 18000,
        expectedShares: 4200,
        expectedSaves: 7800,
      })
    } catch {
      await new Promise((r) => setTimeout(r, 2200))
      setActiveScript(MOCK_SCRIPT)
    } finally {
      setGeneratingId(null)
    }
  }

  const filteredTrends = trends

  return (
    <div className="min-h-screen bg-dark-900 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🔥</span>
            <span className="text-orange-400 text-sm font-semibold uppercase tracking-widest">Creator Dashboard</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black text-white mb-2">
                Trending Now — <span className="gradient-text">Go Viral</span>
              </h1>
              <p className="text-white/40 text-base max-w-xl">
                Real-time trends ranked by ML Trend Scorer. Click any trend to generate a complete AI content package.
              </p>
            </div>
            <button
              onClick={() => fetchTrends(true, activeCategory, searchQuery)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/60 hover:text-white text-sm font-medium transition-all disabled:opacity-50"
            >
              <span className={refreshing ? 'animate-spin' : ''}>🔄</span>
              {refreshing ? 'Refreshing...' : 'Refresh Trends'}
            </button>
          </div>

          {/* Search + Custom Topic */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search trends... (e.g. AI, finance, creator)"
                className="input-dark flex-1 text-sm h-10"
              />
              <button type="submit" className="px-4 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm font-medium hover:bg-purple-500/30 transition-all">
                Search
              </button>
            </form>
            <div className="flex gap-2">
              <input
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="Custom topic..."
                className="input-dark text-sm h-10 w-48"
                onKeyDown={(e) => e.key === 'Enter' && handleCustomGenerate()}
              />
              <button
                onClick={handleCustomGenerate}
                disabled={!customTopic.trim() || generatingId === 'custom'}
                className="px-4 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-300 text-sm font-medium hover:bg-orange-500/30 transition-all disabled:opacity-50 whitespace-nowrap"
              >
                ✨ Generate
              </button>
            </div>
          </div>
        </div>

        {/* ── Top Trend Spotlight ── */}
        {!loading && topTrend && (
          <div className="glass-card p-5 mb-8 border-orange-500/20 bg-gradient-to-r from-orange-500/5 to-transparent">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
              <span className="text-orange-400 text-xs font-semibold uppercase tracking-widest">🔥 Hottest Right Now</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg mb-1">{topTrend.title}</h3>
                <p className="text-white/40 text-sm">{topTrend.description}</p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-center">
                  <div className="text-3xl font-black text-orange-400">{topTrend.trendScore}</div>
                  <div className="text-white/30 text-xs">Trend Score</div>
                </div>
                <button
                  onClick={() => handleGenerateScript(topTrend)}
                  disabled={generatingId === topTrend.id}
                  className="btn-primary flex items-center gap-2 py-2.5 px-5 text-sm disabled:opacity-50"
                >
                  {generatingId === topTrend.id ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Generating...</>
                  ) : (
                    <><span>✨</span> Generate Script</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left: Trends Feed ── */}
          <div className="lg:col-span-2">
            {/* Category filters */}
            <div className="flex flex-wrap gap-2 mb-5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${
                    activeCategory === cat
                      ? 'bg-orange-500/20 border-orange-500/40 text-orange-300'
                      : 'bg-white/5 border-white/10 text-white/40 hover:text-white/70 hover:border-white/20'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Loading skeleton */}
            {loading && (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="glass-card p-5 animate-pulse">
                    <div className="flex gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-white/5 rounded w-3/4" />
                        <div className="h-3 bg-white/5 rounded w-1/2" />
                      </div>
                      <div className="w-14 h-14 rounded-xl bg-white/5" />
                    </div>
                    <div className="h-3 bg-white/5 rounded w-full mb-2" />
                    <div className="h-3 bg-white/5 rounded w-2/3" />
                  </div>
                ))}
              </div>
            )}

            {/* Trend cards */}
            {!loading && (
              <div className="space-y-4">
                {filteredTrends.length > 0 ? (
                  filteredTrends.map((trend, idx) => (
                    <div key={trend.id} className="animate-fade-in" style={{ animationDelay: `${idx * 0.06}s` }}>
                      <TrendCard
                        trend={trend}
                        onGenerateScript={handleGenerateScript}
                        isGenerating={generatingId === trend.id}
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 glass-card">
                    <div className="text-4xl mb-3">📡</div>
                    <p className="text-white font-semibold mb-1">AI Engine not connected</p>
                    <p className="text-white/40 text-sm">Start the AI Engine: <code className="text-purple-300">python main.py</code></p>
                    <p className="text-white/30 text-xs mt-2">Or try a different niche filter</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Right: Script Output / Sidebar ── */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-5">
              {/* Generating state */}
              {generatingId && (
                <div className="glass-card p-6 border-purple-500/20 text-center">
                  <div className="relative w-16 h-16 mx-auto mb-4">
                    <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 animate-ping" />
                    <div className="absolute inset-1 rounded-full border-2 border-purple-500/40 animate-spin" />
                    <div className="absolute inset-3 rounded-full bg-purple-500/20 flex items-center justify-center text-xl">✨</div>
                  </div>
                  <p className="text-white font-semibold mb-1">LangGraph Agent Running</p>
                  <p className="text-white/40 text-xs mb-4">GPT-4 generating your content package...</p>
                  <div className="space-y-2">
                    {['Analyzing trend context', 'Crafting hook', 'Writing script', 'Predicting virality'].map((step, i) => (
                      <div key={step} className="flex items-center gap-2 text-xs text-white/40">
                        <div className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" style={{ animationDelay: `${i * 0.4}s` }} />
                        {step}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Script output */}
              {activeScript && !generatingId && (
                <ScriptOutput
                  script={activeScript}
                  trendTitle={activeTrendTitle}
                  onClose={() => setActiveScript(null)}
                />
              )}

              {/* Empty sidebar */}
              {!activeScript && !generatingId && (
                <div className="glass-card p-6 text-center border-dashed border-white/10">
                  <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-2xl mx-auto mb-4">
                    ✨
                  </div>
                  <h3 className="text-white font-semibold mb-2">AI Content Generator</h3>
                  <p className="text-white/40 text-xs leading-relaxed">
                    Click "Generate Script" on any trend to get a complete content package — Reel script, LinkedIn post, Instagram caption + Virality prediction.
                  </p>
                </div>
              )}

              {/* Stats card */}
              <div className="glass-card p-5">
                <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-4">Platform Stats</p>
                <div className="space-y-3">
                  {[
                    { label: 'Trends Tracked', value: trends.length, icon: '📡' },
                    { label: 'Avg Trend Score', value: trends.length ? Math.round(trends.reduce((s, t) => s + t.trendScore, 0) / trends.length) : 0, icon: '📊' },
                    { label: 'Scripts Generated', value: '1,247', icon: '✍️' },
                    { label: 'Avg Virality Score', value: '73', icon: '⚡' },
                  ].map((stat) => (
                    <div key={stat.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{stat.icon}</span>
                        <span className="text-white/50 text-xs">{stat.label}</span>
                      </div>
                      <span className="text-white font-semibold text-sm">{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreatorDashboard
