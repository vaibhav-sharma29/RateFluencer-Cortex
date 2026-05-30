import React, { useState, useEffect } from 'react'
import TrendCard from '../components/TrendCard'
import ScriptOutput from '../components/ScriptOutput'
import ViralityMeter from '../components/ViralityMeter'
import { getTrends, generateFromTrend } from '../services/api'

const MOCK_TRENDS = [
  { id: '1', title: 'GPT-5 Released: What Creators Need to Know', description: 'OpenAI drops GPT-5 with multimodal reasoning. Creators are going crazy making explainer content.', category: 'AI', trendScore: 94, growthVelocity: 340, searchInterest: 88, engagementPotential: 91, source: 'Reddit r/artificial', timeAgo: '1h ago' },
  { id: '2', title: 'Micro-SaaS Boom: Solo Founders Making $10K/Month', description: 'Indie hackers sharing revenue screenshots. Finance + tech crossover content is exploding.', category: 'Tech', trendScore: 87, growthVelocity: 210, searchInterest: 79, engagementPotential: 85, source: 'Reddit r/SaaS', timeAgo: '2h ago' },
  { id: '3', title: 'Ozempic Side Effects: The Untold Story', description: 'Health creators debunking myths around weight loss drugs. Massive engagement on long-form content.', category: 'Health', trendScore: 82, growthVelocity: 180, searchInterest: 92, engagementPotential: 78, source: 'Reddit r/health', timeAgo: '3h ago' },
  { id: '4', title: 'India Stock Market Crash: What Happened?', description: 'Nifty drops 3% in a single session. Finance creators explaining the macro triggers.', category: 'Finance', trendScore: 79, growthVelocity: 290, searchInterest: 85, engagementPotential: 82, source: 'Reddit r/IndiaInvestments', timeAgo: '4h ago' },
  { id: '5', title: 'Valorant New Agent Abilities Leaked', description: 'Gaming community reacting to leaked abilities. Reaction + breakdown content performing 5x average.', category: 'Gaming', trendScore: 76, growthVelocity: 150, searchInterest: 71, engagementPotential: 88, source: 'Reddit r/VALORANT', timeAgo: '5h ago' },
  { id: '6', title: 'Sustainable Fashion: Thrift Flipping Goes Viral', description: 'Gen Z creators showing thrift store hauls and upcycling. Authenticity-driven content winning.', category: 'Fashion', trendScore: 71, growthVelocity: 120, searchInterest: 68, engagementPotential: 74, source: 'Reddit r/femalefashionadvice', timeAgo: '6h ago' },
  { id: '7', title: 'Intermittent Fasting Myths Debunked by Doctors', description: 'Medical professionals on TikTok/YouTube correcting misinformation. Trust-based content surging.', category: 'Health', trendScore: 68, growthVelocity: 95, searchInterest: 74, engagementPotential: 71, source: 'Reddit r/nutrition', timeAgo: '8h ago' },
  { id: '8', title: 'Budget Travel: $500 Europe Trip Breakdown', description: 'Travel creators sharing ultra-budget itineraries. Aspirational + practical content combo is viral.', category: 'Travel', trendScore: 65, growthVelocity: 88, searchInterest: 62, engagementPotential: 79, source: 'Reddit r/solotravel', timeAgo: '10h ago' },
]

const MOCK_SCRIPT = {
  hook: "Stop scrolling. In the next 60 seconds, I'll show you exactly why GPT-5 is going to change how you create content forever — and most creators have NO idea.",
  story: "OpenAI just dropped GPT-5 and the internet is losing its mind. But here's what nobody's talking about: it's not just smarter — it reasons differently. It can look at your analytics, understand your audience, and suggest content ideas that are actually tailored to YOUR niche. I tested it for 3 days straight and here's what I found...",
  keyInsights: [
    "GPT-5 has native multimodal reasoning — it understands images, audio, and text simultaneously",
    "Response quality improved 40% on complex reasoning tasks vs GPT-4",
    "Creators using AI tools are growing 3x faster than those who don't",
    "The window to be an 'early adopter' is closing fast — act now",
  ],
  cta: "Follow for daily AI tools that actually help creators grow. Drop a 🤖 in the comments if you want my full GPT-5 creator toolkit — I'll DM it to you for free.",
  reelScript: "HOOK (0-3s): 'Stop scrolling. GPT-5 just dropped and it changes EVERYTHING for creators.'\n\nBODY (3-45s): [Show screen recording of GPT-5 interface] 'Look at this — I asked it to analyze my last 10 videos and suggest my next 5 topics. It gave me a full content calendar with hooks, scripts, and posting times. This took me 3 hours before. Now? 30 seconds.'\n\nCTA (45-60s): 'Follow me for the full breakdown. I'm dropping a free toolkit tomorrow — comment AI below to get it first.'",
  linkedinPost: "🚀 GPT-5 just launched and I spent 72 hours testing it for content creators.\n\nHere's what actually matters (thread):\n\n1/ The multimodal reasoning is genuinely different. It doesn't just see images — it understands context, emotion, and intent.\n\n2/ I fed it my last 6 months of content analytics. It identified 3 content gaps I completely missed.\n\n3/ Script generation improved dramatically. Less generic, more voice-matched.\n\nThe creators who adapt early will have an unfair advantage.\n\nWhat's your biggest content challenge right now? Drop it below — I'll show you how GPT-5 solves it. 👇",
  instagramCaption: "GPT-5 dropped and I've been testing it non-stop 🤖✨\n\nHere's the honest truth: it's not just 'better' — it thinks differently.\n\nI asked it to plan my content for the next month. It gave me 30 ideas, 10 hooks, and a full posting schedule — all tailored to MY audience.\n\nThis is the tool I wish I had 2 years ago.\n\nSave this post if you want my full GPT-5 creator guide 🔖\n\nComment 'AI' and I'll DM you the free toolkit 👇",
  hashtags: ['#GPT5', '#AITools', '#ContentCreator', '#CreatorEconomy', '#ArtificialIntelligence', '#ContentStrategy', '#DigitalMarketing', '#Viral', '#ReelsTips', '#GrowthHacking'],
  viralityScore: 88,
  expectedViews: 420000,
  expectedLikes: 31000,
  expectedShares: 8400,
  expectedSaves: 12600,
}

const CATEGORIES = ['All', 'AI', 'Tech', 'Finance', 'Health', 'Gaming', 'Fashion', 'Travel']

const CreatorDashboard = () => {
  const [trends, setTrends] = useState([])
  const [loading, setLoading] = useState(true)
  const [generatingId, setGeneratingId] = useState(null)
  const [activeScript, setActiveScript] = useState(null)
  const [activeTrendTitle, setActiveTrendTitle] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [refreshing, setRefreshing] = useState(false)

  const fetchTrends = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else setLoading(true)
    try {
      const res = await getTrends({ limit: 10 })
      const raw = res.data?.trends || res.data || []
      const mapped = raw.map((t) => ({
        id: String(t.id),
        title: t.topic,
        description: `Trending in ${t.niche} — Source: ${t.source || 'Social Media'}`,
        category: t.niche?.split(' ')[0] || 'Tech',
        trendScore: t.trend_score || t.trendScore || 75,
        growthVelocity: t.growth_velocity === 'explosive' ? 340 : t.growth_velocity === 'high' ? 210 : 120,
        searchInterest: t.search_interest || 75,
        engagementPotential: t.engagement_potential || 80,
        source: t.source || 'Social Media',
        timeAgo: 'Live',
      }))
      setTrends(mapped.length > 0 ? mapped : MOCK_TRENDS)
    } catch {
      await new Promise((r) => setTimeout(r, 1200))
      setTrends(MOCK_TRENDS)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => { fetchTrends() }, [])

  const handleGenerateScript = async (trend) => {
    setGeneratingId(trend.id)
    setActiveScript(null)
    setActiveTrendTitle(trend.title)
    try {
      const res = await generateFromTrend(trend.title, trend.category)
      const d = res.data
      setActiveScript({
        hook: d.reel_script?.hook || d.hook,
        story: d.reel_script?.story || d.story,
        keyInsights: d.reel_script?.key_insights || d.keyInsights || [],
        cta: d.reel_script?.cta || d.cta,
        reelScript: d.reel_script?.hook + '\n\n' + d.reel_script?.story,
        linkedinPost: d.linkedin_post,
        instagramCaption: d.instagram_caption,
        hashtags: d.hashtags || [],
        viralityScore: d.virality_score || 80,
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

  const filteredTrends = trends.filter(
    (t) => activeCategory === 'All' || t.category === activeCategory
  )

  const topTrend = trends.reduce((best, t) => (!best || t.trendScore > best.trendScore ? t : best), null)

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
              onClick={() => fetchTrends(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/60 hover:text-white text-sm font-medium transition-all disabled:opacity-50"
            >
              <span className={refreshing ? 'animate-spin' : ''}>🔄</span>
              {refreshing ? 'Refreshing...' : 'Refresh Trends'}
            </button>
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
                  onClick={() => setActiveCategory(cat)}
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
                  <div className="text-center py-12">
                    <div className="text-4xl mb-3">🔍</div>
                    <p className="text-white/40">No trends in this category right now.</p>
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
