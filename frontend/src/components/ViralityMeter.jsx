import React, { useEffect, useState } from 'react'

const LABELS = [
  { min: 0,  max: 30,  label: 'Low',       color: '#ef4444', bg: 'bg-red-500',    text: 'text-red-400',    glow: 'rgba(239,68,68,0.5)' },
  { min: 30, max: 55,  label: 'Moderate',  color: '#f59e0b', bg: 'bg-amber-500',  text: 'text-amber-400',  glow: 'rgba(245,158,11,0.5)' },
  { min: 55, max: 75,  label: 'Good',      color: '#8b5cf6', bg: 'bg-purple-500', text: 'text-purple-400', glow: 'rgba(139,92,246,0.5)' },
  { min: 75, max: 90,  label: 'High',      color: '#3b82f6', bg: 'bg-blue-500',   text: 'text-blue-400',   glow: 'rgba(59,130,246,0.5)' },
  { min: 90, max: 101, label: 'Viral 🔥',  color: '#10b981', bg: 'bg-emerald-500',text: 'text-emerald-400',glow: 'rgba(16,185,129,0.5)' },
]

const getLevel = (score) => LABELS.find((l) => score >= l.min && score < l.max) || LABELS[0]

const ViralityMeter = ({ score = 0, size = 'md', showLabel = true, showMetrics = false, metrics = {} }) => {
  const [animated, setAnimated] = useState(0)

  useEffect(() => {
    let start = 0
    const step = score / 60
    const interval = setInterval(() => {
      start += step
      if (start >= score) { setAnimated(score); clearInterval(interval) }
      else setAnimated(Math.floor(start))
    }, 16)
    return () => clearInterval(interval)
  }, [score])

  const level = getLevel(score)

  const sizes = {
    sm: { outer: 80, inner: 60, stroke: 6, fontSize: 'text-lg', labelSize: 'text-[9px]' },
    md: { outer: 120, inner: 90, stroke: 8, fontSize: 'text-2xl', labelSize: 'text-xs' },
    lg: { outer: 160, inner: 120, stroke: 10, fontSize: 'text-4xl', labelSize: 'text-sm' },
  }

  const cfg = sizes[size] || sizes.md
  const r = (cfg.outer - cfg.stroke * 2) / 2
  const cx = cfg.outer / 2
  const cy = cfg.outer / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (animated / 100) * circumference

  const formatNum = (n) => {
    if (!n) return '—'
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
    return n.toString()
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Ring */}
      <div className="relative" style={{ width: cfg.outer, height: cfg.outer }}>
        {/* Outer glow ring */}
        <div
          className="absolute inset-0 rounded-full opacity-20 blur-md"
          style={{ background: `radial-gradient(circle, ${level.color}, transparent 70%)` }}
        />
        <svg width={cfg.outer} height={cfg.outer} className="-rotate-90 relative z-10">
          {/* Track */}
          <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={cfg.stroke} />
          {/* Progress */}
          <circle
            cx={cx} cy={cy} r={r} fill="none"
            stroke={level.color} strokeWidth={cfg.stroke} strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
              filter: `drop-shadow(0 0 8px ${level.glow})`,
            }}
          />
        </svg>
        {/* Center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
          <span className={`font-black ${cfg.fontSize} ${level.text}`}>{animated}</span>
          <span className="text-white/30 text-[9px] uppercase tracking-widest">/100</span>
        </div>
      </div>

      {/* Label */}
      {showLabel && (
        <div className="flex flex-col items-center gap-1">
          <span className={`font-bold text-sm ${level.text}`}>{level.label}</span>
          <span className="text-white/30 text-xs">Virality Score</span>
        </div>
      )}

      {/* Metrics */}
      {showMetrics && (
        <div className="grid grid-cols-2 gap-2 w-full mt-1">
          {[
            { label: 'Views', value: formatNum(metrics.expectedViews), icon: '👁️' },
            { label: 'Likes', value: formatNum(metrics.expectedLikes), icon: '❤️' },
            { label: 'Shares', value: formatNum(metrics.expectedShares), icon: '🔁' },
            { label: 'Saves', value: formatNum(metrics.expectedSaves), icon: '🔖' },
          ].map((m) => (
            <div key={m.label} className="bg-white/3 rounded-lg p-2 text-center border border-white/5">
              <div className="text-sm">{m.icon}</div>
              <div className="text-white font-semibold text-xs mt-0.5">{m.value}</div>
              <div className="text-white/30 text-[9px]">{m.label}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default ViralityMeter
