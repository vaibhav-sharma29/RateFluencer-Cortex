import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { login, register } from '../services/api'

const LoginPage = () => {
  const navigate = useNavigate()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'brand',
    company: '',
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let res
      if (isLogin) {
        res = await login({ email: form.email, password: form.password })
      } else {
        res = await register({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          company: form.company,
        })
      }

      const { token, user } = res.data
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))

      if (user.role === 'creator') {
        navigate('/creator')
      } else {
        navigate('/brand')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center px-4">
      {/* Background orbs */}
      <div className="fixed pointer-events-none">
        <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-10" style={{ background: 'rgba(139,92,246,0.8)', top: '10%', left: '30%' }} />
        <div className="absolute w-64 h-64 rounded-full blur-3xl opacity-8" style={{ background: 'rgba(109,40,217,0.6)', bottom: '20%', right: '20%' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <span className="text-white font-black text-lg">R</span>
            </div>
            <span className="text-white font-bold text-xl">RateFluencer</span>
          </Link>
          <h1 className="text-3xl font-black text-white mb-2">
            {isLogin ? 'Welcome back' : 'Create account'}
          </h1>
          <p className="text-white/40 text-sm">
            {isLogin ? 'Sign in to access your dashboard' : 'Join the AI influencer platform'}
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-8 border-purple-500/10">
          {/* Toggle */}
          <div className="flex bg-white/5 rounded-xl p-1 mb-6 border border-white/5">
            <button
              onClick={() => { setIsLogin(true); setError('') }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                isLogin ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-white/40 hover:text-white/70'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setError('') }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                !isLogin ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'text-white/40 hover:text-white/70'
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name — register only */}
            {!isLogin && (
              <div>
                <label className="block text-white/60 text-xs font-medium mb-1.5">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Arjun Sharma"
                  required={!isLogin}
                  className="input-dark text-sm h-11"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
                className="input-dark text-sm h-11"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-white/60 text-xs font-medium mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="input-dark text-sm h-11 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors text-sm"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Role + Company — register only */}
            {!isLogin && (
              <>
                <div>
                  <label className="block text-white/60 text-xs font-medium mb-1.5">I am a</label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    className="input-dark text-sm h-11"
                  >
                    <option value="brand" className="bg-gray-900">Brand / Marketer</option>
                    <option value="creator" className="bg-gray-900">Content Creator</option>
                  </select>
                </div>
                {form.role === 'brand' && (
                  <div>
                    <label className="block text-white/60 text-xs font-medium mb-1.5">Company Name (optional)</label>
                    <input
                      type="text"
                      name="company"
                      value={form.company}
                      onChange={handleChange}
                      placeholder="Your company"
                      className="input-dark text-sm h-11"
                    />
                  </div>
                )}
              </>
            )}

            {/* Error */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-11 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </>
              ) : (
                isLogin ? '→ Sign In' : '→ Create Account'
              )}
            </button>
          </form>

          {/* Demo credentials */}
          {isLogin && (
            <div className="mt-4 p-3 rounded-xl bg-white/3 border border-white/8">
              <p className="text-white/30 text-xs text-center mb-2">Demo credentials</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setForm({ ...form, email: 'brand@demo.com', password: 'demo123' })}
                  className="flex-1 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs hover:bg-purple-500/20 transition-all"
                >
                  Brand Demo
                </button>
                <button
                  onClick={() => setForm({ ...form, email: 'creator@demo.com', password: 'demo123' })}
                  className="flex-1 py-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-300 text-xs hover:bg-orange-500/20 transition-all"
                >
                  Creator Demo
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-white/30 text-xs mt-6">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setIsLogin(!isLogin); setError('') }}
            className="text-purple-400 hover:text-purple-300 transition-colors"
          >
            {isLogin ? 'Register here' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
