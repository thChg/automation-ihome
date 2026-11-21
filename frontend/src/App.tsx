import { useAuth } from './context'
import { LoginScreen } from './features/auth'
import { Dashboard } from './features/dashboard'
import './App.css'

function App() {
  const { user, sessionLoading } = useAuth()

  if (sessionLoading) {
    return <main className="app-shell"><div className="status-dot loading" /></main>
  }

  if (!user) return <LoginScreen />
  return <Dashboard />
}

export default App
