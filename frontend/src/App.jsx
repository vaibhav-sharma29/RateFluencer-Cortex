import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import BrandDashboard from './pages/BrandDashboard'
import CreatorDashboard from './pages/CreatorDashboard'
import InfluencerProfile from './pages/InfluencerProfile'
import LoginPage from './pages/LoginPage'
import AgentPage from './pages/AgentPage'
import Navbar from './components/Navbar'

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/login" replace />
  return children
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-dark-900">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <>
                <Navbar />
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/creator" element={<CreatorDashboard />} />
                  <Route path="/agent" element={<AgentPage />} />
                  <Route
                    path="/brand"
                    element={
                      <ProtectedRoute>
                        <BrandDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/influencer/:id"
                    element={
                      <ProtectedRoute>
                        <InfluencerProfile />
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
