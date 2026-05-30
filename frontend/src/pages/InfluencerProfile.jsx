import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Cell,
} from 'recharts'
import ScoreGauge from '../components/ScoreGauge'
import ViralityMeter from '../components/ViralityMeter'
import { getInfluencerProfile, getShapExplanation } from '../services/api'

const MOCK_PROFILE = {
  _id: '1', name: 'Aryan Kapoor', handle: '@aryantech', platform: 'youtube',
  category: 'Tech', followers: 1200000, following: 890, posts: 342,
  influencerScore: 91, authenticityScore: 94, growthScore: 88, brandMatchScore: 96,
  engagementRate: 6.4, avgLikes: 48000, avgComments: 2100, avgShares: 3400,
  verified: true, bio: 'Building in public | AI & SaaS | 1.2M creators learning tech daily',
  location: 'Bangalore, India', joinedYear: 2019,
}

const MOCK_GROWTH = [
  { month: 'Dec', followers: 820000, engagement: 5.1 },
  { month: 'Jan', followers: 890000, engagement: 5.8 },
  { month: 'Feb', followers: 950000, engagement: 6.0 },
  { month: 'Mar', followers: 1020000, engagement: 6.2 },
  { month: 'Apr', followers: 1100000, engagement: 6.1 },
  { month: 'May', followers: 1200000, engagement: 6.4 },
]

const MOCK_CONTENT = [
  { type: 'Tutorial', avgViews: 320000, count: 120 },
  { type: 'Review', avgViews: 280000, count: 85 },
  { type: 'Vlog', avgViews: 190000, count: 62 },
  { type: 'Shorts', avgViews: 450000, count: 75 },
]

const MOCK_RADAR = [
  { subject: 'Engagement', A: 88 },
  { subject: 'Authenticity', A: 94 },
  { subject: 'Growth', A: 88 },
  { subject: 'Content Quality', A: 85 },
  { subject: 'Audience Quality', A: 91 },
  { subject: 'Consistency', A: 79 },
]

const MOCK_SHAP = [
  { feature: 'Engagement Rate', value: 0.28, impact: 'positive' },
  { feature: 'Audience Quality', value: 0.22, impact: 'positive' },
  { feature: 'Content Consistency', value: 0.18, impact: 'positive' },
  { feature: 'Growth Velocity', value: 0.15, impact: 'positive' },
  { feature: 'Comment Quality', value: 0.12, impact: 'positive' },
  { feature: 'Bot Followers', value: -0.08, impact: 'negative' },
  { feature: 'Posting Gaps', value: -0.05, impact: 'negative' },
  { feature: 'Engagement Drops', value: -0.04, impact: 'negative' },
]

const MOCK_AUDIENCE = [
  { age: '13-17', pct: 8 }, { age: '18-24', pct: 34 },
  { age: '25-34', pct: 38 }, { age: '35-44', pct: 14 },
  { age: '45+', pct: 6 },
]

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-dark-700 border border-white/10 rounded-xl p-3 shadow-xl">
      <p className="text-white/60 text-xs mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-white font-semibold text-sm">
          {p.name}: <span style={{ color: p.color }}>{typeof p.value === 'number' && p.value > 1000 ? `${(p.value / 1000).toFixed(0)}K` : p.value}</span>
        </p>
      ))}
    </div>
  )
}

const StatCard = ({ icon, label, value, sub, color = 'purple' }) => {
  const colors = {
    purple: 'from-purple-500/10 to-transparent border-purple-500/20 text-purple-400',
    green: 'from-green-500/10 to-transparent border-green-500/20 text-green-400',
    blue: 'from-blue-500/10 to-transparent border-blue-500/20 text-blue-400',
    orange: 'from-orange-500/10 to-transparent border-orange-500/20 text-orange-400',
  }
  return (
    <div className={`glass-card p-4 bg-gradient-to-br ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <span className="text-white/40 text-xs">{label}</span>
      </div>
      <div className={`text-2xl font-black ${colors[color].split(' ').pop()}`}>{value}</div>
      {sub && <div className="text-white/30 text-xs mt-0.5">{sub}</div>}
    </div>
  )
}

const InfluencerProfile = () => {
  const { id } = useParams()
  const [profile, setProfile] = useState(null)
  const [shap, setShap] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [pRes, sRes] = await Promise.all([
          getInfluencerProfile(id),
          getShapExplanation(id),
        ])
        setProfile(pRes.data)
        setShap(sRes.data?.features || [])
      } catch {
        await new Promise((r) => setTimeout(r, 1000))
        setProfile(MOCK_PROFILE)
        setShap(MOCK_SHAP)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const formatNum = (n) => {
    if (!n) return '0'
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
    return n.toString()
  }

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'growth', label: '📈 Growth' },
    { id: 'content', label: '🎬 Content' },
    { id: 'shap', label: '🧠 AI Explanation' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 animate-ping" />
            <div className="absolute inset-2 rounded-full border-2 border-purple-500/40 animate-spin" />
            <div className="absolute inset-4 rounded-full bg-purple-500/20 flex items-center justify-center text-2xl">🤖</div>
          </div>
          <p className="text-white font-semibold">Loading Profile...</p>
          <p className="text-white/40 text-sm mt-1">Fetching AI scores + SHAP data</p>
        </div>
      </div>
    )
  }

  if (!profile) return null
  const p = profile

  return (
    <div className="min-h-screen bg-dark-900 pt-20 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <Link to="/brand" className="inline-flex items-center gap-2 text-white/40 hover:text-white text-sm mb-6 transition-colors">
          ← Back to Brand Dashboard
        </Link>

        {/* ── Profile Hero ── */}
        <div className="glass-card p-6 mb-6 border-purple-500/10 bg-gradient-to-r from-purple-500/5 to-transparent">
          <div className="flex flex-col sm:flex-row items-start gap-5">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/40 to-violet-600/40 border border-purple-500/30 flex items-center justify-center text-3xl font-bold text-white shadow-lg shadow-purple-500/20">
                {p.name?.charAt(0)}
              </div>
              {p.verified && (
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-500 border-2 border-dark-800 flex items-center justify-center">
                  <span className="text-white text-[10px] font-bold">✓</span>
                </div>
              )}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-2xl font-black text-white">{p.name}</h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300">{p.category}</span>
              </div>
              <p className="text-white/40 text-sm mb-2">{p.handle} · {p.platform} · {p.location}</p>
              {p.bio && <p className="text-white/60 text-sm max-w-xl">{p.bio}</p>}
              <div className="flex flex-wrap gap-4 mt-3">
                {[
                  { label: 'Followers', value: formatNum(p.followers) },
                  { label: 'Following', value: formatNum(p.following) },
                  { label: 'Posts', value: p.posts },
                  { label: 'Since', value: p.joinedYear },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className="text-white font-bold text-sm">{s.value}</div>
                    <div className="text-white/30 text-xs">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Overall Score */}
            <div className="flex-shrink-0">
              <ScoreGauge score={p.influencerScore} label="Influencer Score" size="lg" color="purple" />
            </div>
          </div>
        </div>

        {/* ── Score Cards Row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon="🎯" label="Authenticity Score" value={p.authenticityScore} sub="Fake follower detection" color="green" />
          <StatCard icon="📈" label="Growth Score" value={p.growthScore} sub="30-day trajectory" color="blue" />
          <StatCard icon="🤝" label="Brand Match" value={p.brandMatchScore} sub="Campaign fit score" color="orange" />
          <StatCard icon="💬" label="Engagement Rate" value={`${p.engagementRate}%`} sub="Avg across posts" color="purple" />
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-1 mb-6 bg-white/3 rounded-xl p-1 border border-white/5 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-white/40 hover:text-white/70'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Tab: Overview ── */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Radar Chart */}
            <div className="glass-card p-5">
              <h3 className="text-white font-bold mb-1">Performance Radar</h3>
              <p className="text-white/40 text-xs mb-5">Multi-dimensional creator analysis</p>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={MOCK_RADAR}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                  <Radar name="Score" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} strokeWidth={2} dot={{ fill: '#8b5cf6', r: 3 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Audience Age */}
            <div className="glass-card p-5">
              <h3 className="text-white font-bold mb-1">Audience Demographics</h3>
              <p className="text-white/40 text-xs mb-5">Age distribution of followers</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={MOCK_AUDIENCE} barSize={32}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="age" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="pct" radius={[6, 6, 0, 0]}>
                    {MOCK_AUDIENCE.map((_, i) => (
                      <Cell key={i} fill={i === 2 ? '#8b5cf6' : 'rgba(139,92,246,0.4)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Avg Metrics */}
            <div className="glass-card p-5 lg:col-span-2">
              <h3 className="text-white font-bold mb-4">Average Post Performance</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Avg Likes', value: formatNum(p.avgLikes), icon: '❤️', color: 'text-red-400' },
                  { label: 'Avg Comments', value: formatNum(p.avgComments), icon: '💬', color: 'text-blue-400' },
                  { label: 'Avg Shares', value: formatNum(p.avgShares), icon: '🔁', color: 'text-green-400' },
                ].map((m) => (
                  <div key={m.label} className="bg-white/3 rounded-xl p-4 text-center border border-white/5">
                    <div className="text-2xl mb-2">{m.icon}</div>
                    <div className={`text-2xl font-black ${m.color}`}>{m.value}</div>
                    <div className="text-white/40 text-xs mt-1">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: Growth ── */}
        {activeTab === 'growth' && (
          <div className="space-y-6">
            <div className="glass-card p-5">
              <h3 className="text-white font-bold mb-1">Follower Growth (6 Months)</h3>
              <p className="text-white/40 text-xs mb-5">Monthly follower count trajectory</p>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={MOCK_GROWTH}>
                  <defs>
                    <linearGradient id="followerGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="followers" name="Followers" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#followerGrad)" dot={{ fill: '#8b5cf6', r: 4, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="glass-card p-5">
              <h3 className="text-white font-bold mb-1">Engagement Rate Trend</h3>
              <p className="text-white/40 text-xs mb-5">Monthly engagement rate %</p>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={MOCK_GROWTH}>
                  <defs>
                    <linearGradient id="engGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="engagement" name="Engagement %" stroke="#10b981" strokeWidth={2.5} fill="url(#engGrad)" dot={{ fill: '#10b981', r: 4, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ── Tab: Content ── */}
        {activeTab === 'content' && (
          <div className="space-y-6">
            <div className="glass-card p-5">
              <h3 className="text-white font-bold mb-1">Content Type Performance</h3>
              <p className="text-white/40 text-xs mb-5">Average views by content format</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={MOCK_CONTENT} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="type" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="avgViews" name="Avg Views" radius={[8, 8, 0, 0]}>
                    {MOCK_CONTENT.map((_, i) => (
                      <Cell key={i} fill={['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'][i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {MOCK_CONTENT.map((c, i) => (
                <div key={c.type} className="glass-card p-4 text-center">
                  <div className="text-lg font-black mb-1" style={{ color: ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'][i] }}>
                    {formatNum(c.avgViews)}
                  </div>
                  <div className="text-white/60 text-xs font-medium">{c.type}</div>
                  <div className="text-white/30 text-[10px] mt-0.5">{c.count} posts</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Tab: SHAP ── */}
        {activeTab === 'shap' && (
          <div className="space-y-6">
            <div className="glass-card p-5 border-purple-500/10">
              <div className="flex items-start gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xl flex-shrink-0">🧠</div>
                <div>
                  <h3 className="text-white font-bold">SHAP Feature Importance</h3>
                  <p className="text-white/40 text-xs mt-0.5">Why this creator scored {p.influencerScore}/100 — XGBoost model explanation</p>
                </div>
              </div>

              <div className="space-y-3">
                {shap.map((item, idx) => {
                  const isPos = item.impact === 'positive'
                  const absVal = Math.abs(item.value)
                  const maxVal = Math.max(...shap.map((s) => Math.abs(s.value)))
                  const barWidth = (absVal / maxVal) * 100

                  return (
                    <div key={item.feature} className="group" style={{ animationDelay: `${idx * 0.05}s` }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${isPos ? 'text-green-400' : 'text-red-400'}`}>
                            {isPos ? '▲' : '▼'}
                          </span>
                          <span className="text-white/70 text-sm">{item.feature}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold ${isPos ? 'text-green-400' : 'text-red-400'}`}>
                            {isPos ? '+' : ''}{item.value.toFixed(2)}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                            isPos
                              ? 'bg-green-500/10 border-green-500/20 text-green-400'
                              : 'bg-red-500/10 border-red-500/20 text-red-400'
                          }`}>
                            {isPos ? 'Positive' : 'Negative'}
                          </span>
                        </div>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ${isPos ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{
                            width: `${barWidth}%`,
                            boxShadow: isPos ? '0 0 8px rgba(16,185,129,0.5)' : '0 0 8px rgba(239,68,68,0.5)',
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 p-4 rounded-xl bg-purple-500/5 border border-purple-500/15">
                <p className="text-white/50 text-xs leading-relaxed">
                  <span className="text-purple-300 font-semibold">How to read this:</span> SHAP values show each feature's contribution to the final Influencer Score. Positive values (green) push the score higher, negative values (red) pull it down. The bar length shows relative importance.
                </p>
              </div>
            </div>

            {/* Score breakdown */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <ScoreGauge score={p.influencerScore} label="Overall Score" size="md" color="purple" />
              <ScoreGauge score={p.authenticityScore} label="Authenticity" size="md" color="green" />
              <ScoreGauge score={p.growthScore} label="Growth" size="md" color="blue" />
              <ScoreGauge score={p.brandMatchScore} label="Brand Match" size="md" color="orange" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default InfluencerProfile
