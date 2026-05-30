import React, { useState } from 'react'

const Section = ({ icon, title, content, color = 'purple' }) => {
  const [copied, setCopied] = useState(false)

  const colorMap = {
    purple: 'border-purple-500/20 bg-purple-500/5',
    blue: 'border-blue-500/20 bg-blue-500/5',
    green: 'border-green-500/20 bg-green-500/5',
    orange: 'border-orange-500/20 bg-orange-500/5',
    pink: 'border-pink-500/20 bg-pink-500/5',
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className={`rounded-xl border p-4 ${colorMap[color]}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">{icon}</span>
          <span className="text-white/70 text-xs font-semibold uppercase tracking-wider">{title}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white/40 hover:text-white/70 text-xs transition-all"
        >
          {copied ? '✓ Copied' : '⎘ Copy'}
        </button>
      </div>
      <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
    </div>
  )
}

const ScriptOutput = ({ script, trendTitle, onClose }) => {
  const [activeTab, setActiveTab] = useState('reel')
  const [copiedAll, setCopiedAll] = useState(false)

  if (!script) return null

  const {
    hook = '',
    story = '',
    keyInsights = [],
    cta = '',
    reelScript = '',
    linkedinPost = '',
    instagramCaption = '',
    hashtags = [],
    viralityScore = 0,
    expectedViews = 0,
    expectedLikes = 0,
    expectedShares = 0,
    expectedSaves = 0,
  } = script

  const tabs = [
    { id: 'reel', label: '🎬 Reel Script' },
    { id: 'linkedin', label: '💼 LinkedIn' },
    { id: 'instagram', label: '📸 Instagram' },
  ]

  const handleCopyAll = () => {
    const allContent = `REEL SCRIPT\n${reelScript}\n\nLINKEDIN POST\n${linkedinPost}\n\nINSTAGRAM CAPTION\n${instagramCaption}\n\nHASHTAGS\n${hashtags.join(' ')}`
    navigator.clipboard.writeText(allContent)
    setCopiedAll(true)
    setTimeout(() => setCopiedAll(false), 2000)
  }

  const getViralityColor = (s) => {
    if (s >= 80) return { text: 'text-green-400', bg: 'bg-green-500', glow: 'rgba(16,185,129,0.4)' }
    if (s >= 60) return { text: 'text-purple-400', bg: 'bg-purple-500', glow: 'rgba(139,92,246,0.4)' }
    if (s >= 40) return { text: 'text-yellow-400', bg: 'bg-yellow-500', glow: 'rgba(245,158,11,0.4)' }
    return { text: 'text-red-400', bg: 'bg-red-500', glow: 'rgba(239,68,68,0.4)' }
  }

  const vc = getViralityColor(viralityScore)

  const formatNum = (n) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
    if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`
    return n.toString()
  }

  return (
    <div className="glass-card border-purple-500/20 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-xl">
            ✨
          </div>
          <div>
            <h3 className="text-white font-bold text-sm">AI Content Package</h3>
            <p className="text-white/40 text-xs truncate max-w-xs">{trendTitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 text-xs font-medium transition-all"
          >
            {copiedAll ? '✓ Copied All' : '⎘ Copy All'}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Virality Score Banner */}
      <div className="p-5 border-b border-white/5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white/60 text-sm font-medium">Virality Prediction</span>
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10`}>
            <div className={`w-2 h-2 rounded-full ${vc.bg} animate-pulse`} />
            <span className={`text-sm font-bold ${vc.text}`}>{viralityScore}/100</span>
          </div>
        </div>

        {/* Score bar */}
        <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-4">
          <div
            className={`h-full ${vc.bg} rounded-full transition-all duration-1000`}
            style={{ width: `${viralityScore}%`, boxShadow: `0 0 10px ${vc.glow}` }}
          />
        </div>

        {/* Predicted metrics */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Views', value: formatNum(expectedViews), icon: '👁️' },
            { label: 'Likes', value: formatNum(expectedLikes), icon: '❤️' },
            { label: 'Shares', value: formatNum(expectedShares), icon: '🔁' },
            { label: 'Saves', value: formatNum(expectedSaves), icon: '🔖' },
          ].map((m) => (
            <div key={m.label} className="bg-white/3 rounded-xl p-3 text-center border border-white/5">
              <div className="text-base mb-1">{m.icon}</div>
              <div className="text-white font-bold text-sm">{m.value}</div>
              <div className="text-white/30 text-[10px] mt-0.5">{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-3 text-xs font-medium transition-all ${
              activeTab === tab.id
                ? 'text-purple-300 border-b-2 border-purple-500 bg-purple-500/5'
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-5 space-y-4">
        {activeTab === 'reel' && (
          <>
            {hook && <Section icon="🎣" title="Hook (0–3 sec)" content={hook} color="purple" />}
            {story && <Section icon="📖" title="Story / Body" content={story} color="blue" />}
            {keyInsights.length > 0 && (
              <Section
                icon="💡"
                title="Key Insights"
                content={keyInsights.map((ins, i) => `${i + 1}. ${ins}`).join('\n')}
                color="green"
              />
            )}
            {cta && <Section icon="📣" title="Call to Action" content={cta} color="orange" />}
            {reelScript && <Section icon="🎬" title="Full Reel Script" content={reelScript} color="purple" />}
          </>
        )}

        {activeTab === 'linkedin' && (
          <Section icon="💼" title="LinkedIn Post" content={linkedinPost} color="blue" />
        )}

        {activeTab === 'instagram' && (
          <>
            <Section icon="📸" title="Instagram Caption" content={instagramCaption} color="pink" />
            {hashtags.length > 0 && (
              <div className="rounded-xl border border-white/10 bg-white/3 p-4">
                <p className="text-white/40 text-xs font-semibold uppercase tracking-wider mb-3">Hashtags</p>
                <div className="flex flex-wrap gap-2">
                  {hashtags.map((tag) => (
                    <span key={tag} className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs">
                      {tag.startsWith('#') ? tag : `#${tag}`}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default ScriptOutput
