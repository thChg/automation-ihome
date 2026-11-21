import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { ProtectedRoute } from './components/ProtectedRoute'
import { useAuth } from './context'
import { LoginScreen, RegisterScreen } from './features/auth'
import { Dashboard } from './features/dashboard'
import './App.css'

function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { user, sessionLoading } = useAuth()

  if (sessionLoading) {
    return <main className="app-shell"><div className="status-dot loading" /></main>
  }

  return user ? <Navigate to="/" replace /> : children
}

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={<PublicOnlyRoute><LoginScreen /></PublicOnlyRoute>}
      />
      <Route
        path="/register"
        element={<PublicOnlyRoute><RegisterScreen /></PublicOnlyRoute>}
      />
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
