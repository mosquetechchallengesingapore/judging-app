import { useState, useEffect } from 'react'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import Lobby from './pages/Lobby'
import HackathonSetup from './pages/HackathonSetup'
import JudgeScoring from './pages/JudgeScoring'
import Results from './pages/Results'
import EditScores from './pages/EditScores'
import SignInForm from './components/SignInForm'
import { getAuthUser, clearAuthUser } from './lib/auth'
import './App.css'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL)

function AppContent() {
  const [currentUser, setCurrentUser] = useState(null)
  const [currentPage, setCurrentPage] = useState('lobby')
  const [selectedHackathon, setSelectedHackathon] = useState(null)

  useEffect(() => {
    const user = getAuthUser()
    if (user) setCurrentUser(user)
  }, [])

  const handleAuthSuccess = (user) => {
    setCurrentUser(user)
  }

  const handleSignOut = () => {
    clearAuthUser()
    setCurrentUser(null)
    setCurrentPage('lobby')
  }

  const handleNavigate = (page, hackathonId = null) => {
    setCurrentPage(page)
    if (hackathonId) setSelectedHackathon(hackathonId)
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'lobby':
        return <Lobby onNavigate={handleNavigate} onSignOut={handleSignOut} currentUser={currentUser} />
      case 'setup':
        return (
          <HackathonSetup
            hackathonId={selectedHackathon}
            onBack={() => handleNavigate('lobby')}
          />
        )
      case 'scoring':
        return (
          <JudgeScoring
            hackathonId={selectedHackathon}
            onBack={() => handleNavigate('lobby')}
          />
        )
      case 'results':
        return (
          <Results
            hackathonId={selectedHackathon}
            onBack={() => handleNavigate('lobby')}
          />
        )
      case 'editScores':
        return (
          <EditScores
            hackathonId={selectedHackathon}
            onBack={() => handleNavigate('lobby')}
          />
        )
      default:
        return <Lobby onNavigate={handleNavigate} onSignOut={handleSignOut} currentUser={currentUser} />
    }
  }

  if (!currentUser) {
    return <SignInForm onAuthSuccess={handleAuthSuccess} />
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f6f6f8' }}>
      {renderPage()}
    </div>
  )
}

function App() {
  return (
    <ConvexProvider client={convex}>
      <AppContent />
    </ConvexProvider>
  )
}

export default App
