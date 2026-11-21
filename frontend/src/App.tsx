import { Navigate, Route, Routes } from 'react-router-dom'
import type { ReactNode } from 'react'
import { ProtectedRoute } from './components/ProtectedRoute'
import { useAuth } from './context'
import { LoginScreen, RegisterScreen } from './features/auth'
import { Dashboard } from './features/dashboard'
import { UsersPage } from './features/users'
import { ProfilePage } from './features/profile'
import { AppLayout } from './components/AppLayout'
import './App.css'

function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const { user, sessionLoading } = useAuth()

  if (sessionLoading) {
    return <main className="app-shell"><div className="status-dot loading" /></main>
  }

  return user ? <Navigate to="/" replace /> : children
}

function AdminRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  return user?.role === 'admin' ? children : <Navigate to="/" replace />
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
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/users"
            element={<AdminRoute><UsersPage /></AdminRoute>}
          />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
