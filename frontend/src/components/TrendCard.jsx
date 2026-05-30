import React from 'react'

const categoryEmoji = {
  AI: '🤖', Tech: '💻', Finance: '💰', Health: '🏃', Gaming: '🎮',
  Fashion: '👗', Food: '🍕', Travel: '✈️', Science: '🔬', Sports: '⚽',
}

const TrendCard = ({ trend, onGenerateScript, isGenerating }) => {
  const {
    id,
    title = 'Trending Topic',
    description = '',
    category = 'Tech',
    trendScore = 0,
    growthVelocity = 0,
    searchInterest = 0,
    engagementPotential = 0,
    source = 'Reddit',
    timeAgo = '2h ago',
  } = trend || {}

  const getScoreColor = (s) => {
    if (s >= 80) return { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30', bar: 'bg-green-500' }
    if (s >= 60) return { bg: 'bg-purple-500/20', text: 'text-purple-400', border: 'border-purple-500/30', bar: 'bg-purple-500' }
    if (s >= 40) return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30', bar: 'bg-yellow-500' }
    return { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30', bar: 'bg-red-500' }
  }

  const scoreStyle = getScoreColor(trendScore)
  const emoji = categoryEmoji[category] || '🔥'

  return (
    <div className="glass-card-hover p-5 group">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xl flex-shrink-0">
            {emoji}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-sm leading-snug line-clamp-2">{title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-white/30 text-[10px]">{source}</span>
              <span className="text-white/20 text-[10px]">•</span>
              <span className="text-white/30 text-[10px]">{timeAgo}</span>
            </div>
          </div>
        </div>

        {/* Trend Score Badge */}
        <div className={`flex-shrink-0 px-2.5 py-1.5 rounded-xl ${scoreStyle.bg} border ${scoreStyle.border} text-center`}>
          <div className={`text-lg font-bold ${scoreStyle.text} leading-none`}>{trendScore}</div>
          <div className="text-white/30 text-[9px] uppercase tracking-wider mt-0.5">Score</div>
        </div>
      </div>

      {/* Description */}
      {description && (
        <p className="text-white/40 text-xs leading-relaxed mb-3 line-clamp-2">{description}</p>
      )}

      {/* Mini stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {[
          { label: 'Growth', value: growthVelocity, suffix: '%' },
          { label: 'Search', value: searchInterest, suffix: '' },
          { label: 'Engage', value: engagementPotential, suffix: '' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white/3 rounded-lg p-2 text-center">
            <div className="text-white/70 text-xs font-semibold">{stat.value}{stat.suffix}</div>
            <div className="text-white/30 text-[9px] mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Score bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-white/30 text-[10px]">Trend Strength</span>
          <span className={`text-[10px] font-medium ${scoreStyle.text}`}>{trendScore}/100</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full ${scoreStyle.bar} rounded-full transition-all duration-1000`}
            style={{ width: `${trendScore}%` }}
          />
        </div>
      </div>

      {/* Category tag + CTA */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 border border-white/10 text-white/40">
          {emoji} {category}
        </span>
        <button
          onClick={() => onGenerateScript && onGenerateScript(trend)}
          disabled={isGenerating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 hover:border-purple-500/50 text-purple-300 text-xs font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <div className="w-3 h-3 border border-purple-400/50 border-t-purple-400 rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <span>✨</span>
              Generate Script
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default TrendCard
