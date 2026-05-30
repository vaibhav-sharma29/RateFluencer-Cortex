import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'

const STATS = [
  { value: '10M+', label: 'Influencers Analyzed' },
  { value: '98.2%', label: 'Fake Detection Accuracy' },
  { value: '500+', label: 'Brands Matched' },
  { value: '4.9x', label: 'Avg ROI Increase' },
]

const FEATURES = [
  {
    icon: '🎯',
    title: 'AI Brand Matching',
    desc: 'Describe your brand in plain English. Our RAG + FAISS engine finds the perfect creators from millions of profiles instantly.',
    color: 'from-purple-500/20 to-violet-600/10',
    border: 'border-purple-500/20',
    badge: 'Brand Track',
  },
  {
    icon: '🔍',
    title: 'Fake Follower Detection',
    desc: 'LightGBM model detects bot activity, engagement pods, and artificial spikes with 98.2% accuracy. No more wasted budgets.',
    color: 'from-red-500/20 to-rose-600/10',
    border: 'border-red-500/20',
    badge: 'Authenticity',
  },
  {
    icon: '📈',
    title: 'Growth Prediction',
    desc: 'XGBoost-powered growth engine forecasts creator trajectory over 30/60/90 days using engagement patterns and audience signals.',
    color: 'from-blue-500/20 to-cyan-600/10',
    border: 'border-blue-500/20',
    badge: 'Prediction',
  },
  {
    icon: '🔥',
    title: 'Trend Discovery',
    desc: 'Real-time Reddit + social signals ranked by ML Trend Scorer. Know what\'s viral before it goes viral.',
    color: 'from-orange-500/20 to-amber-600/10',
    border: 'border-orange-500/20',
    badge: 'Creator Track',
  },
  {
    icon: '✍️',
    title: 'Reel Script Generator',
    desc: 'LangGraph autonomous agent + GPT-4 generates complete content packages: Hook, Story, CTA, LinkedIn post, Instagram captions.',
    color: 'from-green-500/20 to-emerald-600/10',
    border: 'border-green-500/20',
    badge: 'AI Content',
  },
  {
    icon: '⚡',
    title: 'Virality Predictor',
    desc: 'Before you post, know your expected Views, Likes, Shares, and Saves. Our model scores content virality 0–100.',
    color: 'from-yellow-500/20 to-amber-600/10',
    border: 'border-yellow-500/20',
    badge: 'Virality',
  },
]

const SCORES_DEMO = [
  { label: 'Influencer Score', value: 87, color: '#8b5cf6' },
  { label: 'Authenticity', value: 92, color: '#10b981' },
  { label: 'Growth Score', value: 74, color: '#3b82f6' },
  { label: 'Brand Match', value: 95, color: '#f59e0b' },
]

const FloatingOrb = ({ style }) => (
  <div
    className="absolute rounded-full blur-3xl pointer-events-none"
    style={style}
  />
)

const AnimatedScore = ({ value, color, label }) => {
  const [current, setCurrent] = useState(0)
  const ref = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0
          const step = value / 60
          const interval = setInterval(() => {
            start += step
            if (start >= value) { setCurrent(value); clearInterval(interval) }
            else setCurrent(Math.floor(start))
          }, 16)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [value])

  const circumference = 2 * Math.PI * 36
  const offset = circumference - (current / 100) * circumference

  return (
    <div ref={ref} className="flex flex-col items-center gap-2">
      <div className="relative w-24 h-24">
        <svg width="96" height="96" className="-rotate-90">
          <circle cx="48" cy="48" r="36" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
          <circle
            cx="48" cy="48" r="36" fill="none"
            stroke={color} strokeWidth="6" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1.5s ease-out', filter: `drop-shadow(0 0 8px ${color}80)` }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold text-white">{current}</span>
        </div>
      </div>
      <span className="text-white/50 text-xs text-center">{label}</span>
    </div>
  )
}

const LandingPage = () => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouse = (e) => setMousePos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handleMouse)
    return () => window.removeEventListener('mousemove', handleMouse)
  }, [])

  return (
    <div className="min-h-screen bg-dark-900 overflow-x-hidden">
      {/* Dynamic cursor glow */}
      <div
        className="fixed pointer-events-none z-0 w-96 h-96 rounded-full blur-3xl opacity-10 transition-all duration-500"
        style={{
          background: 'radial-gradient(circle, #8b5cf6, transparent)',
          left: mousePos.x - 192,
          top: mousePos.y - 192,
        }}
      />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
        {/* Background orbs */}
        <FloatingOrb style={{ width: 600, height: 600, background: 'rgba(139,92,246,0.12)', top: '-10%', left: '50%', transform: 'translateX(-50%)' }} />
        <FloatingOrb style={{ width: 300, height: 300, background: 'rgba(167,139,250,0.08)', top: '20%', right: '-5%' }} />
        <FloatingOrb style={{ width: 250, height: 250, background: 'rgba(109,40,217,0.1)', bottom: '10%', left: '-5%' }} />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(139,92,246,1) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,1) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 mb-8 animate-fade-in">
            <div className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span className="text-purple-300 text-sm font-medium">AI Hackathon 2026 — Grand Challenge</span>
            <span className="text-purple-500">✦</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6 animate-slide-up">
            <span className="text-white">The AI Brain Behind</span>
            <br />
            <span className="gradient-text text-glow">Influencer Intelligence</span>
          </h1>

          <p className="text-white/50 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in">
            Detect fake followers, predict growth, match brands to creators, discover viral trends — all powered by XGBoost, LightGBM, and GPT-4 in one unified platform.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up">
            <Link
              to="/brand"
              className="group relative btn-primary text-base px-8 py-4 flex items-center gap-2 overflow-hidden"
            >
              <span className="relative z-10">🎯 Analyze Influencer</span>
              <span className="relative z-10 group-hover:translate-x-1 transition-transform">→</span>
              <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            <Link
              to="/creator"
              className="btn-secondary text-base px-8 py-4 flex items-center gap-2"
            >
              <span>🔥 Explore Trends</span>
            </Link>
          </div>

          {/* Demo Score Cards */}
          <div className="glass-card max-w-2xl mx-auto p-6 border-glow animate-fade-in">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/40 text-xs uppercase tracking-widest">Live AI Scoring Demo</span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {SCORES_DEMO.map((s) => (
                <AnimatedScore key={s.label} {...s} />
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-white/20 text-xs">Scroll to explore</span>
          <div className="w-5 h-8 rounded-full border border-white/10 flex items-start justify-center pt-1.5">
            <div className="w-1 h-2 rounded-full bg-purple-400 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────── */}
      <section className="py-16 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-black gradient-text mb-1">{stat.value}</div>
                <div className="text-white/40 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────── */}
      <section className="py-24 relative">
        <FloatingOrb style={{ width: 400, height: 400, background: 'rgba(139,92,246,0.06)', top: '20%', right: '-10%' }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-purple-400 text-sm font-semibold uppercase tracking-widest">Platform Features</span>
            <h2 className="text-4xl font-black text-white mt-3 mb-4">
              Everything You Need to Win
            </h2>
            <p className="text-white/40 max-w-xl mx-auto">
              Six AI-powered modules working together as one intelligent ecosystem for influencer marketing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className={`glass-card-hover p-6 bg-gradient-to-br ${f.color} border ${f.border} group`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl">
                    {f.icon}
                  </div>
                  <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/40 uppercase tracking-wider">
                    {f.badge}
                  </span>
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-purple-400 text-sm font-semibold uppercase tracking-widest">Data Flow</span>
            <h2 className="text-4xl font-black text-white mt-3">How It Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Brand Flow */}
            <div className="glass-card p-6 border-purple-500/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-lg">🎯</div>
                <div>
                  <h3 className="text-white font-bold">Brand Flow</h3>
                  <p className="text-white/40 text-xs">Find the perfect creator</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { step: '01', text: 'Type your brand description in plain English', icon: '✍️' },
                  { step: '02', text: 'OpenAI Embeddings + FAISS finds top matches', icon: '🔍' },
                  { step: '03', text: 'XGBoost scores each creator 0–100', icon: '🤖' },
                  { step: '04', text: 'SHAP explains every score decision', icon: '📊' },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                    <span className="text-purple-500/60 text-xs font-mono font-bold">{item.step}</span>
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-white/60 text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Creator Flow */}
            <div className="glass-card p-6 border-orange-500/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-lg">🔥</div>
                <div>
                  <h3 className="text-white font-bold">Creator Flow</h3>
                  <p className="text-white/40 text-xs">Go viral with AI content</p>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { step: '01', text: 'Reddit API discovers trending topics live', icon: '📡' },
                  { step: '02', text: 'ML Trend Ranker scores each topic 0–100', icon: '📈' },
                  { step: '03', text: 'LangGraph + GPT-4 generates full reel script', icon: '✨' },
                  { step: '04', text: 'Virality Predictor forecasts expected reach', icon: '⚡' },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                    <span className="text-orange-500/60 text-xs font-mono font-bold">{item.step}</span>
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-white/60 text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ───────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass-card p-12 border-purple-500/20 relative overflow-hidden">
            <FloatingOrb style={{ width: 400, height: 400, background: 'rgba(139,92,246,0.15)', top: '-50%', left: '50%', transform: 'translateX(-50%)' }} />
            <div className="relative z-10">
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
                Ready to Find Your
                <br />
                <span className="gradient-text">Perfect Creator?</span>
              </h2>
              <p className="text-white/40 text-lg mb-8 max-w-xl mx-auto">
                Join the AI-powered influencer intelligence revolution. No more guesswork, just data.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to="/brand" className="btn-primary text-base px-10 py-4">
                  🎯 Launch Brand Dashboard
                </Link>
                <Link to="/creator" className="btn-secondary text-base px-10 py-4">
                  🔥 Explore Creator Tools
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
              <span className="text-white font-bold text-xs">R</span>
            </div>
            <span className="text-white/40 text-sm">RateFluencer Cortex AI — Hackathon 2026</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-white/30 text-xs">All systems operational</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
