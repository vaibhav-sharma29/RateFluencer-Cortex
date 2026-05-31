import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ScoreGauge from './ScoreGauge'

const platformIcons = {
  instagram: '📸',
  youtube: '▶️',
  tiktok: '🎵',
  twitter: '🐦',
  linkedin: '💼',
}

const categoryColors = {
  Tech: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  Fashion: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  Fitness: 'bg-green-500/20 text-green-300 border-green-500/30',
  Food: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  Travel: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  Finance: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
  Gaming: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Beauty: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
}

const InfluencerCard = ({ influencer, rank }) => {
  const navigate = useNavigate()
  const {
    _id,
    name = 'Unknown Creator',
    handle = '@unknown',
    avatar,
    platform = 'instagram',
    category = 'Tech',
    followers = 0,
    influencerScore = 0,
    authenticityScore = 0,
    growthScore = 0,
    brandMatchScore = 0,
    engagementRate = 0,
    verified = false,
  } = influencer || {}

  const formatFollowers = (n) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
    return n.toString()
  }

  const handleViewProfile = () => {
    localStorage.setItem('selectedInfluencer', JSON.stringify(influencer))
    navigate(`/influencer/${_id || '1'}`)
  }

  const catColor = categoryColors[category] || 'bg-purple-500/20 text-purple-300 border-purple-500/30'

  return (
    <div onClick={handleViewProfile} className="block group cursor-pointer">
      <div className="glass-card-hover p-5 relative overflow-hidden cursor-pointer">
        {/* Rank badge */}
        {rank && (
          <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
            <span className="text-purple-300 text-xs font-bold">#{rank}</span>
          </div>
        )}

        {/* Shimmer on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 shimmer rounded-2xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/30 to-violet-600/30 border border-purple-500/20 flex items-center justify-center text-xl overflow-hidden">
              {avatar ? (
                <img src={avatar} alt={name} className="w-full h-full object-cover" />
              ) : (
                <span>{name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            {verified && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-500 border-2 border-dark-800 flex items-center justify-center">
                <span className="text-white text-[8px]">✓</span>
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-white font-semibold text-sm truncate">{name}</h3>
            </div>
            <p className="text-white/40 text-xs mt-0.5">{handle}</p>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              <span className={`score-badge border ${catColor} text-[10px]`}>
                {category}
              </span>
              <span className="text-white/30 text-[10px]">
                {platformIcons[platform]} {formatFollowers(followers)} followers
              </span>
            </div>
          </div>
        </div>

        {/* Score Gauges */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          <ScoreGauge score={influencerScore} label="Overall" size="sm" color="purple" />
          <ScoreGauge score={authenticityScore} label="Authentic" size="sm" color="green" />
          <ScoreGauge score={growthScore} label="Growth" size="sm" color="blue" />
          <ScoreGauge score={brandMatchScore} label="Brand Fit" size="sm" color="orange" />
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-1">
            <span className="text-white/40 text-xs">Engagement</span>
            <span className="text-purple-300 text-xs font-semibold">{engagementRate}%</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/40 text-xs group-hover:text-purple-400 transition-colors">
            <span>View Profile</span>
            <span>→</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InfluencerCard
