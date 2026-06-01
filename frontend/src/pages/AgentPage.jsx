import React, { useState, useRef } from 'react'

const STEP_ICONS = {
  discovering: '📡',
  trends_found: '🔥',
  selecting: '🧠',
  trend_selected: '✅',
  generating: '✨',
  content_ready: '📦',
  predicting: '⚡',
  complete: '🎉',
  error: '❌',
}

const AgentPage = () => {
  const [brandName, setBrandName] = useState('')
  const [productType, setProductType] = useState('')
  const [targetAudience, setTargetAudience] = useState('')
  const [campaignGoal, setCampaignGoal] = useState('')
  const [running, setRunning] = useState(false)
  const [steps, setSteps] = useState([])
  const [result, setResult] = useState(null)
  const [activeTab, setActiveTab] = useState('video')
  const [copied, setCopied] = useState('')
  const stepsEndRef = useRef(null)

  const scrollToBottom = () => {
    stepsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 2000)
  }

  const runAgent = async () => {
    if (!brandName.trim()) return
    setRunning(true)
    setSteps([])
    setResult(null)

    try {
      const response = await fetch('http://localhost:5000/api/agent/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandName, productType, targetAudience, campaignGoal }),
      })

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(l => l.startsWith('data: '))

        for (const line of lines) {
          try {
            const data = JSON.parse(line.replace('data: ', ''))
            setSteps(prev => [...prev, data])
            scrollToBottom()

            if (data.step === 'complete' && data.result) {
              setResult(data.result)
            }
          } catch { }
        }
      }
    } catch (err) {
      setSteps(prev => [...prev, { step: 'error', message: 'Connection failed. Make sure backend is running.' }])
    } finally {
      setRunning(false)
    }
  }

  const viralityColor = (s) => {
    if (s >= 80) return 'text-green-400'
    if (s >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="min-h-screen bg-dark-900 pt-20 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🤖</span>
            <span className="text-purple-400 text-sm font-semibold uppercase tracking-widest">Autonomous AI Agent</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-2">
            AI Campaign <span className="gradient-text">Generator</span>
          </h1>
          <p className="text-white/40 text-base max-w-2xl">
            Enter your brand details. The AI agent will automatically discover trending topics, select the best one for your brand, and generate a complete campaign package — video script, LinkedIn post, Instagram story, and virality prediction.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left — Input */}
          <div className="space-y-5">
            <div className="glass-card p-6 border-purple-500/10">
              <h3 className="text-white font-bold mb-5 flex items-center gap-2">
                <span>🎯</span> Brand Details
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-white/60 text-xs font-medium mb-1.5">Brand Name *</label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={e => setBrandName(e.target.value)}
                    placeholder="e.g. Flipkart, Zomato, Meesho"
                    className="input-dark text-sm h-11"
                  />
                </div>

                <div>
                  <label className="block text-white/60 text-xs font-medium mb-1.5">Product / Service</label>
                  <input
                    type="text"
                    value={productType}
                    onChange={e => setProductType(e.target.value)}
                    placeholder="e.g. Big Billion Days sale, food delivery app"
                    className="input-dark text-sm h-11"
                  />
                </div>

                <div>
                  <label className="block text-white/60 text-xs font-medium mb-1.5">Target Audience</label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={e => setTargetAudience(e.target.value)}
                    placeholder="e.g. young professionals in India aged 18-35"
                    className="input-dark text-sm h-11"
                  />
                </div>

                <div>
                  <label className="block text-white/60 text-xs font-medium mb-1.5">Campaign Goal</label>
                  <input
                    type="text"
                    value={campaignGoal}
                    onChange={e => setCampaignGoal(e.target.value)}
                    placeholder="e.g. increase app downloads, boost sale awareness"
                    className="input-dark text-sm h-11"
                  />
                </div>

                <button
                  onClick={runAgent}
                  disabled={running || !brandName.trim()}
                  className="btn-primary w-full h-12 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {running ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Agent Running...
                    </>
                  ) : (
                    <>🤖 Launch AI Agent</>
                  )}
                </button>

                {/* Quick examples */}
                <div>
                  <p className="text-white/30 text-xs mb-2">Quick examples:</p>
                  <div className="flex flex-wrap gap-2">
                    {['Flipkart', 'Zomato', 'CRED', 'Meesho', 'PhonePe'].map(brand => (
                      <button
                        key={brand}
                        onClick={() => setBrandName(brand)}
                        className="text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white/80 hover:border-purple-500/30 transition-all"
                      >
                        {brand}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Agent Steps */}
            {steps.length > 0 && (
              <div className="glass-card p-5 border-purple-500/10">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <span>⚙️</span> Agent Progress
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-sm flex-shrink-0">
                        {STEP_ICONS[step.step] || '⚡'}
                      </div>
                      <div className="flex-1">
                        <p className="text-white/80 text-sm">{step.message}</p>
                        {step.trends && (
                          <div className="mt-2 space-y-1">
                            {step.trends.map((t, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs text-white/40">
                                <span className="text-orange-400 font-bold">{t.score}</span>
                                <span className="truncate">{t.topic}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {step.selected_trend && (
                          <div className="mt-2 p-2 rounded-lg bg-green-500/10 border border-green-500/20">
                            <p className="text-green-300 text-xs font-medium">{step.selected_trend}</p>
                            <p className="text-white/40 text-xs mt-1">{step.reason}</p>
                          </div>
                        )}
                        {step.progress && (
                          <div className="mt-2 h-1.5 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-purple-500 rounded-full transition-all duration-500"
                              style={{ width: `${step.progress}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={stepsEndRef} />
                </div>
              </div>
            )}
          </div>

          {/* Right — Results */}
          <div>
            {!result && !running && (
              <div className="glass-card p-8 text-center border-dashed border-white/10 h-full flex flex-col items-center justify-center">
                <div className="w-20 h-20 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-4xl mb-6">
                  🤖
                </div>
                <h3 className="text-white font-bold text-xl mb-2">AI Campaign Agent</h3>
                <p className="text-white/40 text-sm max-w-xs leading-relaxed">
                  Enter your brand details and launch the agent. It will automatically discover trends, select the best one, and generate a complete campaign package.
                </p>
              </div>
            )}

            {running && !result && (
              <div className="glass-card p-8 text-center border-purple-500/20 h-full flex flex-col items-center justify-center">
                <div className="relative w-24 h-24 mx-auto mb-6">
                  <div className="absolute inset-0 rounded-full border-2 border-purple-500/20 animate-ping" />
                  <div className="absolute inset-2 rounded-full border-2 border-purple-500/40 animate-spin" />
                  <div className="absolute inset-4 rounded-full bg-purple-500/20 flex items-center justify-center text-3xl">🤖</div>
                </div>
                <p className="text-white font-bold text-lg mb-2">Agent Working...</p>
                <p className="text-white/40 text-sm">Discovering trends → Selecting best → Generating content</p>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                {/* Campaign Summary */}
                <div className="glass-card p-5 border-green-500/20 bg-gradient-to-r from-green-500/5 to-transparent">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-white font-bold">{result.campaign_title}</h3>
                    <span className={`text-2xl font-black ${viralityColor(result.virality_score)}`}>
                      {result.virality_score}/100
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs">
                    <span className="px-2.5 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300">
                      🔥 {result.trending_topic?.slice(0, 40)}...
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-300">
                      📊 {result.expected_reach}
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-300">
                      ⏰ {result.best_posting_time}
                    </span>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex bg-white/5 rounded-xl p-1 border border-white/5">
                  {[
                    { id: 'video', label: '🎬 Video' },
                    { id: 'linkedin', label: '💼 LinkedIn' },
                    { id: 'instagram', label: '📸 Instagram' },
                    { id: 'story', label: '📱 Story' },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                        activeTab === tab.id
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : 'text-white/40 hover:text-white/70'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Video Script */}
                {activeTab === 'video' && result.video_concept && (
                  <div className="space-y-3">
                    <div className="glass-card p-4 border-purple-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/60 text-xs font-semibold uppercase">🎣 Hook (0-3s)</span>
                        <button onClick={() => handleCopy(result.video_concept.hook, 'hook')} className="text-xs text-white/40 hover:text-white/70">
                          {copied === 'hook' ? '✓ Copied' : '⎘ Copy'}
                        </button>
                      </div>
                      <p className="text-white/80 text-sm">{result.video_concept.hook}</p>
                    </div>

                    <div className="glass-card p-4 border-blue-500/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white/60 text-xs font-semibold uppercase">📝 Full Script</span>
                        <button onClick={() => handleCopy(result.video_concept.script, 'script')} className="text-xs text-white/40 hover:text-white/70">
                          {copied === 'script' ? '✓ Copied' : '⎘ Copy'}
                        </button>
                      </div>
                      <p className="text-white/70 text-sm whitespace-pre-wrap leading-relaxed">{result.video_concept.script}</p>
                    </div>

                    <div className="glass-card p-4 border-orange-500/20">
                      <span className="text-white/60 text-xs font-semibold uppercase block mb-2">🎨 Visual Ideas</span>
                      <ul className="space-y-1">
                        {(result.video_concept.visual_suggestions || []).map((v, i) => (
                          <li key={i} className="text-white/60 text-sm flex items-start gap-2">
                            <span className="text-orange-400 mt-0.5">•</span> {v}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="glass-card p-4 border-green-500/20">
                      <span className="text-white/60 text-xs font-semibold uppercase block mb-2">📣 CTA</span>
                      <p className="text-green-300 text-sm font-medium">{result.video_concept.cta}</p>
                    </div>
                  </div>
                )}

                {/* LinkedIn */}
                {activeTab === 'linkedin' && (
                  <div className="glass-card p-5 border-blue-500/20">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white/60 text-xs font-semibold uppercase">💼 LinkedIn Post</span>
                      <button onClick={() => handleCopy(result.linkedin_post, 'linkedin')} className="text-xs text-white/40 hover:text-white/70">
                        {copied === 'linkedin' ? '✓ Copied' : '⎘ Copy'}
                      </button>
                    </div>
                    <p className="text-white/80 text-sm whitespace-pre-wrap leading-relaxed">{result.linkedin_post}</p>
                  </div>
                )}

                {/* Instagram */}
                {activeTab === 'instagram' && (
                  <div className="space-y-3">
                    <div className="glass-card p-5 border-pink-500/20">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-white/60 text-xs font-semibold uppercase">📸 Reel Caption</span>
                        <button onClick={() => handleCopy(result.instagram_caption, 'caption')} className="text-xs text-white/40 hover:text-white/70">
                          {copied === 'caption' ? '✓ Copied' : '⎘ Copy'}
                        </button>
                      </div>
                      <p className="text-white/80 text-sm whitespace-pre-wrap">{result.instagram_caption}</p>
                    </div>
                    <div className="glass-card p-4 border-white/10">
                      <span className="text-white/40 text-xs font-semibold uppercase block mb-3">Hashtags</span>
                      <div className="flex flex-wrap gap-2">
                        {(result.hashtags || []).map(tag => (
                          <span key={tag} className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs">
                            {tag.startsWith('#') ? tag : `#${tag}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Instagram Story */}
                {activeTab === 'story' && result.instagram_story && (
                  <div className="space-y-3">
                    {[
                      { key: 'slide_1', label: 'Story Slide 1', color: 'border-pink-500/20' },
                      { key: 'slide_2', label: 'Story Slide 2', color: 'border-purple-500/20' },
                      { key: 'slide_3', label: 'Story Slide 3 (CTA)', color: 'border-orange-500/20' },
                    ].map(slide => (
                      <div key={slide.key} className={`glass-card p-4 ${slide.color}`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white/60 text-xs font-semibold uppercase">📱 {slide.label}</span>
                          <button onClick={() => handleCopy(result.instagram_story[slide.key], slide.key)} className="text-xs text-white/40 hover:text-white/70">
                            {copied === slide.key ? '✓ Copied' : '⎘ Copy'}
                          </button>
                        </div>
                        <p className="text-white/80 text-sm">{result.instagram_story[slide.key]}</p>
                      </div>
                    ))}
                    <div className="glass-card p-4 border-white/10">
                      <span className="text-white/40 text-xs font-semibold uppercase block mb-2">💡 Sticker Ideas</span>
                      {(result.instagram_story.sticker_suggestions || []).map((s, i) => (
                        <p key={i} className="text-white/60 text-sm flex items-start gap-2 mb-1">
                          <span className="text-yellow-400">•</span> {s}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AgentPage
