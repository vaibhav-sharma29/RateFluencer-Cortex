import React, { useEffect, useState } from 'react'

const ScoreGauge = ({ score = 0, label = 'Score', size = 'md', color = 'purple' }) => {
  const [animatedScore, setAnimatedScore] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0
      const step = score / 60
      const interval = setInterval(() => {
        start += step
        if (start >= score) {
          setAnimatedScore(score)
          clearInterval(interval)
        } else {
          setAnimatedScore(Math.floor(start))
        }
      }, 16)
      return () => clearInterval(interval)
    }, 200)
    return () => clearTimeout(timer)
  }, [score])

  const sizes = {
    sm: { svg: 80, r: 30, stroke: 5, fontSize: 'text-lg', labelSize: 'text-[9px]' },
    md: { svg: 110, r: 42, stroke: 6, fontSize: 'text-2xl', labelSize: 'text-[10px]' },
    lg: { svg: 140, r: 54, stroke: 7, fontSize: 'text-3xl', labelSize: 'text-xs' },
  }

  const colors = {
    purple: { stroke: '#8b5cf6', glow: 'rgba(139,92,246,0.4)', text: 'text-purple-400', bg: '#8b5cf6' },
    green:  { stroke: '#10b981', glow: 'rgba(16,185,129,0.4)',  text: 'text-emerald-400', bg: '#10b981' },
    blue:   { stroke: '#3b82f6', glow: 'rgba(59,130,246,0.4)',  text: 'text-blue-400', bg: '#3b82f6' },
    orange: { stroke: '#f59e0b', glow: 'rgba(245,158,11,0.4)',  text: 'text-amber-400', bg: '#f59e0b' },
    red:    { stroke: '#ef4444', glow: 'rgba(239,68,68,0.4)',   text: 'text-red-400', bg: '#ef4444' },
  }

  const cfg = sizes[size] || sizes.md
  const clr = colors[color] || colors.purple
  const circumference = 2 * Math.PI * cfg.r
  const offset = circumference - (animatedScore / 100) * circumference
  const cx = cfg.svg / 2
  const cy = cfg.svg / 2

  const getScoreColor = (s) => {
    if (s >= 80) return colors.green
    if (s >= 60) return colors.purple
    if (s >= 40) return colors.orange
    return colors.red
  }

  const scoreClr = getScoreColor(score)

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative" style={{ width: cfg.svg, height: cfg.svg }}>
        <svg width={cfg.svg} height={cfg.svg} className="rotate-[-90deg]">
          {/* Background track */}
          <circle
            cx={cx}
            cy={cy}
            r={cfg.r}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth={cfg.stroke}
          />
          {/* Score arc */}
          <circle
            cx={cx}
            cy={cy}
            r={cfg.r}
            fill="none"
            stroke={scoreClr.stroke}
            strokeWidth={cfg.stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 1.5s ease-out',
              filter: `drop-shadow(0 0 6px ${scoreClr.glow})`,
            }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-bold ${cfg.fontSize} ${scoreClr.text}`}>
            {animatedScore}
          </span>
          <span className={`text-white/40 font-medium ${cfg.labelSize} uppercase tracking-wider`}>
            /100
          </span>
        </div>
      </div>
      <span className="text-white/60 text-xs font-medium text-center leading-tight">{label}</span>
    </div>
  )
}

export default ScoreGauge
