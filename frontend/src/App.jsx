import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import BrandDashboard from './pages/BrandDashboard'
import CreatorDashboard from './pages/CreatorDashboard'
import InfluencerProfile from './pages/InfluencerProfile'
import Navbar from './components/Navbar'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-dark-900">
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/brand" element={<BrandDashboard />} />
          <Route path="/creator" element={<CreatorDashboard />} />
          <Route path="/influencer/:id" element={<InfluencerProfile />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
